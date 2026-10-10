import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/style.css";
import { User } from "./models/User";
import { Task } from "./models/Task";
import { State } from "./state";
import { generateTestUser } from "./utils";
import { authUser, logout } from "./services/auth";
import { TaskService } from "./services/taskService";
import { UserService } from "./services/userService";
import { renderBoard, renderFooter } from "./views/boardView";
import { renderUserMenu } from "./views/userMenuView";
import { renderTaskModal } from "./views/taskModal";

export const appState = new State();
generateTestUser(User);

const contentEl = document.querySelector("#content");
const headerEl = document.querySelector("#app-header");
const footerEl = document.querySelector("#app-footer");

/* ---------- LOGIN ---------- */
document.querySelector("#app-login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  if (!authUser(fd.get("login"), fd.get("password"))) {
    alert("Доступ запрещён: неверный логин или пароль");
    return;
  }
  e.target.reset();
  renderApp();
});

/* ---------- RENDER ---------- */
function renderApp() {
  const user = appState.currentUser;
  renderHeader(user);
  renderBoardContent(user);
}

function renderHeader(user) {
  headerEl.innerHTML = renderUserMenu(user);
  document.querySelector("#user-menu-trigger").addEventListener("click", toggleMenu);
  document.querySelectorAll("[data-menu]").forEach((el) => {
    el.addEventListener("click", () => {
      const action = el.dataset.menu;
      if (action === "logout") { logout(); renderLoginState(); }
      if (action === "users")  { renderUsersPanel(); }
      if (action === "profile") { alert(`Профиль: ${user.login} (${user.role})`); }
      closeMenu();
    });
  });
}

function toggleMenu() {
  const list = document.querySelector("#user-menu-list");
  const arrow = document.querySelector("#user-menu-arrow");
  const isOpen = !list.hasAttribute("hidden");
  list.toggleAttribute("hidden", isOpen);
  arrow.textContent = isOpen ? "˅" : "˄";
}
function closeMenu() {
  document.querySelector("#user-menu-list")?.setAttribute("hidden", "");
  const a = document.querySelector("#user-menu-arrow");
  if (a) a.textContent = "˅";
}

function renderBoardContent(user) {
  const tasks = TaskService.getForUser(user);
  contentEl.innerHTML = renderBoard(tasks, user);
  footerEl.innerHTML = renderFooter(tasks, user.login, new Date().getFullYear());
  bindBoard(user);
}

/* ---------- BOARD ---------- */
function bindBoard(user) {
  contentEl.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => handleAdd(btn, user));
  });

  contentEl.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Удалить задачу?")) {
        TaskService.remove(btn.dataset.delete);
        renderBoardContent(user);
      }
    });
  });

  contentEl.querySelectorAll("[data-open]").forEach((btn) => {
    btn.addEventListener("click", () => openTaskModal(btn.dataset.open, user));
  });

  // DnD
  let draggedId = null;
  contentEl.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("dragstart", (e) => {
      draggedId = card.dataset.id;
      e.dataTransfer.effectAllowed = "move";
    });
  });
  contentEl.querySelectorAll("[data-drop]").forEach((zone) => {
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (!draggedId) return;
      const id = draggedId; draggedId = null;
      TaskService.update(id, { status: zone.dataset.drop });
      renderBoardContent(user);
    });
  });
}

/* ---------- ADD CARD ---------- */
function handleAdd(btn, user) {
  const status = btn.dataset.add;

  if (status === "backlog") {
    const list = btn.closest(".column").querySelector(".column__list");
    const input = document.createElement("input");
    input.className = "card card--input";
    input.placeholder = "New task title...";
    list.appendChild(input);
    input.focus();

    btn.textContent = "Submit";
    btn.classList.add("column__add--submit");

    const commit = () => {
      const title = input.value.trim();
      if (title) {
        TaskService.add(new Task({
          title, status: "backlog",
          userId: user.id, userName: user.login,
        }));
      }
      renderBoardContent(user);
    };
    const newBtn = btn.cloneNode(true);
    newBtn.textContent = "Submit";
    newBtn.classList.add("column__add--submit");
    btn.replaceWith(newBtn);
    newBtn.addEventListener("click", commit, { once: true });
    input.addEventListener("blur", commit, { once: true });
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); });
    return;
  }

  // dropdown для ready / inprogress / finished
  const prev = Object.entries(Task.PREV).find(([, v]) => v === status)?.[0];
  const candidates = TaskService.getForUser(user).filter((t) => t.status === prev);
  if (!candidates.length) return;

  const list = btn.closest(".column").querySelector(".column__list");
  const wrap = document.createElement("div");
  wrap.className = "dropdown";
  wrap.innerHTML = candidates
    .map((t) => `<div class="dropdown__item" data-id="${t.id}">${t.title}</div>`)
    .join("");
  list.appendChild(wrap);

  wrap.querySelectorAll(".dropdown__item").forEach((item) => {
    item.addEventListener("click", () => {
      TaskService.update(item.dataset.id, { status });
      renderBoardContent(user);
    });
  });

  const outside = (e) => {
    if (!wrap.contains(e.target)) {
      wrap.remove();
      document.removeEventListener("click", outside);
    }
  };
  setTimeout(() => document.addEventListener("click", outside), 0);
}

/* ---------- MODAL ---------- */
function openTaskModal(taskId, user) {
  const task = TaskService.getAll().find((t) => t.id === taskId);
  if (!task) return;

  const root = document.createElement("div");
  root.innerHTML = renderTaskModal(task);
  document.body.appendChild(root.firstElementChild);

  document.querySelector("#task-modal-close").addEventListener("click", () => {
    const ta = document.querySelector("#task-modal-text");
    TaskService.update(taskId, { description: ta.value });
    document.querySelector("#task-modal").remove();
    renderBoardContent(user);
  });

  document.querySelector("#task-modal").addEventListener("click", (e) => {
    if (e.target.id === "task-modal") {
      const ta = document.querySelector("#task-modal-text");
      TaskService.update(taskId, { description: ta.value });
      document.querySelector("#task-modal").remove();
    }
  });
}

/* ---------- USERS PANEL (admin) ---------- */
function renderUsersPanel() {
  const users = UserService.getAll();
  contentEl.innerHTML = `
    <div class="users-panel">
      <h2>Users</h2>
      <form id="add-user-form" class="users-panel__form">
        <input name="login" placeholder="Login" required>
        <input name="password" placeholder="Password" required>
        <select name="role">
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <button type="submit">Add</button>
      </form>
      <ul class="users-panel__list">
        ${users.map((u) => `
          <li class="users-panel__item">
            <span>${u.login} — ${u.role}</span>
            ${u.login !== appState.currentUser.login
              ? `<button data-remove-user="${u.login}">×</button>` : ""}
          </li>`).join("")}
      </ul>
      <button id="back-to-board">← К доске</button>
    </div>`;

  document.querySelector("#add-user-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      UserService.add(fd.get("login"), fd.get("password"), fd.get("role"));
      renderUsersPanel();
    } catch (err) { alert(err.message); }
  });

  contentEl.querySelectorAll("[data-remove-user]").forEach((b) => {
    b.addEventListener("click", () => {
      const login = b.dataset.removeUser;
      const target = UserService.getAll().find((u) => u.login === login);
      if (target) TaskService.removeByUser(target.id);
      UserService.remove(login);
      renderUsersPanel();
    });
  });

  document.querySelector("#back-to-board").addEventListener("click", renderApp);
  footerEl.innerHTML = "";
}

/* ---------- INITIAL ---------- */
function renderLoginState() {
  headerEl.innerHTML = "";
  footerEl.innerHTML = "";
  contentEl.innerHTML = "<p>Please Sign In to see your tasks!</p>";
}