(() => {
  "use strict";

  const storageKey = "calm10-2026-draft:ce1-03-teacher-v1:a:source-checkpoints:v1";
  const checkpoints = [...document.querySelectorAll("[data-source-checkpoint]")];
  if (!checkpoints.length) return;

  let saved = {};
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) saved = parsed;
  } catch {
    saved = {};
  }

  function render(checkpoint, checked) {
    const key = checkpoint.dataset.sourceCheckpoint;
    const input = checkpoint.querySelector(`[data-source-checkpoint-key="${CSS.escape(key)}"]`);
    const status = checkpoint.querySelector(`[data-source-checkpoint-status="${CSS.escape(key)}"]`);
    if (input) input.checked = checked;
    checkpoint.classList.toggle("is-complete", checked);
    if (status) status.textContent = checked ? "Checked on this device" : "Not checked yet";
  }

  checkpoints.forEach(checkpoint => {
    const key = checkpoint.dataset.sourceCheckpoint;
    const input = checkpoint.querySelector(`[data-source-checkpoint-key="${CSS.escape(key)}"]`);
    render(checkpoint, saved[key] === true);
    input?.addEventListener("change", () => {
      saved[key] = input.checked;
      render(checkpoint, input.checked);
      try {
        localStorage.setItem(storageKey, JSON.stringify(saved));
      } catch {
        const status = checkpoint.querySelector(`[data-source-checkpoint-status="${CSS.escape(key)}"]`);
        if (status) status.textContent = input.checked ? "Checked for this visit" : "Not checked yet";
      }
    });
  });
})();
