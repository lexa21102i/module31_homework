export function renderUserMenu(user) {
  return `
    <div class="user-menu" id="user-menu">
      <button class="user-menu__trigger" id="user-menu-trigger" type="button" aria-haspopup="true">
        <span class="user-menu__avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <circle cx="12" cy="8" r="4" fill="#000"/>
            <path d="M4 22c0-4.4 3.6-8 8-8s8 3.6 8 8z" fill="#000"/>
          </svg>
        </span>
        <span class="user-menu__arrow" id="user-menu-arrow">˅</span>
      </button>
      <ul class="user-menu__list" id="user-menu-list" hidden>
        <li class="user-menu__item" data-menu="profile">Profile</li>
        ${user.isAdmin ? `<li class="user-menu__item" data-menu="users">Users</li>` : ""}
        <li class="user-menu__item" data-menu="logout">Log Out</li>
      </ul>
    </div>`;
}