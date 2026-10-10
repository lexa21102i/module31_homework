export function renderTaskModal(task) {
  return `
    <div class="modal-backdrop" id="task-modal">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2 class="modal__title">${escapeHtml(task.title)}</h2>
          <button class="modal__close" id="task-modal-close" type="button" aria-label="Закрыть">✕</button>
        </header>
        <div class="modal__body">
          <textarea class="modal__textarea" id="task-modal-text" placeholder="Описание задачи...">${escapeHtml(task.description || "")}</textarea>
        </div>
      </div>
    </div>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}