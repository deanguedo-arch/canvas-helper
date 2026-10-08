(() => {
  "use strict";
  const items = [...document.querySelectorAll("[data-practice-id]")];
  function readAttempt(field) {
    try {
      const attempt = JSON.parse(field.value);
      if (attempt && Number.isInteger(attempt.latest) && attempt.latest >= 0 && attempt.latest <= 5) return attempt;
    } catch {}
    return null;
  }
  function show(item, choice) {
    const output = item.querySelector("[data-feedback]");
    const source = item.querySelector("[data-choice-feedback]");
    if (!output || !source) return;
    let feedback = [];
    try { feedback = JSON.parse(source.content?.textContent || source.textContent); } catch {}
    output.textContent = feedback[choice] || "Review the worked example and try again.";
    output.hidden = false;
    item.classList.toggle("practice-correct", choice === Number(item.dataset.correctIndex) || /^(Yes\.|Correct[:.])/i.test(output.textContent));
  }
  items.forEach(item => {
    const field = item.querySelector("input[data-save-key]");
    const choices = [...item.querySelectorAll("input[type=radio]")];
    if (!field) return;
    const restored = readAttempt(field);
    const restoredChoice = restored && choices.find(radio => Number(radio.value) === restored.latest);
    if (restoredChoice) {
      restoredChoice.checked = true;
      show(item, restored.latest);
    }
    choices.forEach(radio => radio.addEventListener("change", () => {
      if (!radio.checked) return;
      const choice = Number(radio.value);
      const prior = readAttempt(field);
      field.value = JSON.stringify({
        first: prior?.first ?? choice,
        latest: choice,
        count: Math.min(99, (prior?.count ?? 0) + 1),
        updatedAt: new Date().toISOString()
      });
      show(item, choice);
      field.dispatchEvent(new Event("input", { bubbles: true }));
    }));
  });
  document.addEventListener("calm:restore", () => items.forEach(item => {
    const field = item.querySelector("input[data-save-key]");
    const attempt = field && readAttempt(field);
    const choices = [...item.querySelectorAll("input[type=radio]")];
    choices.forEach(radio => { radio.checked = attempt?.latest === Number(radio.value); });
    const output = item.querySelector("[data-feedback]");
    if (attempt) show(item, attempt.latest);
    else if (output) output.hidden = true;
  }));
})();
