import { Task } from "../models/Task";

const COLUMNS = [
  { key: "backlog",    title: "Backlog" },
  { key: "ready",      title: "Ready" },
  { key: "inprogress", title: "In Progress" },
  { key: "finished",   title: "Finished" },
];

export function renderBoard(tasks, user) {
  return `
    <div class="board">
      ${COLUMNS.map((c) => renderColumn(c, tasks, user)).join("")}
    </div>`;
}

function renderColumn(col, tasks, user) {
  const list = tasks.filter((t) => t.status === col.key);

  const prev = Object.entries(Task.PREV).find(([, v]) => v === col.key)?.[0];
  const canAdd = col.key === "backlog" ? true : tasks.some((t) => t.status === prev);
  const hasDropdown = col.key !== "backlog";

  return `
    <section class="column" data-status="${col.key}">
      <h3 class="column__title">${col.title}</h3>
      <ul class="column__list" data-drop="${col.key}">
        ${list.map((t) => renderCard(t, user)).join("")}
      </ul>
      ${
        hasDropdown && canAdd
          ? `<div class="column__dropdown-trigger">
               <span class="column__dropdown-chevron">˅</span>
             </div>`
          : ""
      }
      <button class="column__add" data-add="${col.key}" ${canAdd ? "" : "disabled"}>
        + Add card
      </button>
    </section>`;
}

function renderCard(task, user) {
  return `
    <li class="card" draggable="true" data-id="${task.id}">
      <button class="card__open" data-open="${task.id}" type="button">
        <span class="card__title">${escapeHtml(task.title)}</span>
      </button>
      ${user.isAdmin ? `
        <div class="card__meta">
          <span class="card__owner">${escapeHtml(task.userName)}</span>
          <button class="card__delete" data-delete="${task.id}" title="Удалить" type="button">×</button>
        </div>` : ""}
    </li>`;
}

export function renderFooter(tasks, author = "NAME", year = new Date().getFullYear()) {
  const active = tasks.filter((t) => t.status === "backlog").length;
  const done = tasks.filter((t) => t.status === "finished").length;
  return `
    <footer class="board-footer">
      <div class="board-footer__left">
        <span>Active tasks: ${active}</span>
        <span>Finished tasks: ${done}</span>
      </div>
      <div class="board-footer__right">Kanban board by ${author}, ${year}</div>
    </footer>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}