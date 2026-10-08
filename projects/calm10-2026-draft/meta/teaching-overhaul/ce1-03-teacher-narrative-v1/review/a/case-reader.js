(() => {
  "use strict";
  const dialog = document.querySelector(".case-reader-dialog");
  if (!dialog) return;
  const content = dialog.querySelector(".case-reader-content");
  const title = dialog.querySelector("#case-reader-title");
  const close = dialog.querySelector("[data-close-case-reader]");
  let opener = null;

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-open-case-reader]");
    if (!button) return;
    const lesson = document.getElementById(button.dataset.openCaseReader);
    const source = lesson?.querySelector(".source-document");
    if (!source) return;
    opener = button;
    const copy = source.cloneNode(true);
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach(node => node.removeAttribute("id"));
    copy.querySelectorAll("[data-canvas-helper-edit-key]").forEach(node => node.removeAttribute("data-canvas-helper-edit-key"));
    content.replaceChildren(copy);
    title.textContent = `${lesson.querySelector("h1")?.textContent || "Lesson"} · case file`;
    dialog.showModal();
    close.focus();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { content.replaceChildren(); opener?.focus(); });
})();
