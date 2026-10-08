(() => {
  "use strict";

  const money = value => new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 2
  }).format(value);

  function setOutput(panel, message, state = "") {
    const output = panel.querySelector("[data-pilot-feedback]");
    if (!output) return;
    output.textContent = message;
    output.hidden = false;
    output.dataset.state = state;
  }

  function evidenceBuilder(panel) {
    const match = panel.querySelector('[name="co1-01-match"]')?.value || "";
    const context = panel.querySelector('[name="co1-01-context"]')?.value.trim() || "";
    const action = panel.querySelector('[name="co1-01-action"]')?.value.trim() || "";
    const result = panel.querySelector('[name="co1-01-result"]')?.value.trim() || "";
    if (!match) {
      setOutput(panel, "Choose the experience that best supports accurate record keeping.", "needs-work");
      return;
    }
    if (match !== "attendance") {
      setOutput(panel, "That experience may show another useful skill, but it does not provide the clearest evidence of accurate record keeping. Re-read Rowan’s experience record.", "needs-work");
      return;
    }
    if (![context, action, result].every(Boolean)) {
      setOutput(panel, "Good evidence match. Add the context, Rowan’s observable action, and the result before comparing your sentence.", "progress");
      return;
    }
    setOutput(panel, `Your evidence chain is complete: ${context} — ${action} — ${result}. Check that the final sentence stays truthful and clearly connects this example to accurate records.`, "ready");
  }

  function firstShift(panel) {
    const expected = { access: "ask", spill: "guard", privacy: "secure" };
    const labels = { access: "record access", spill: "blocked route", privacy: "participant information" };
    const results = Object.entries(expected).map(([key, correct]) => {
      const choice = panel.querySelector(`[name="co1-02-${key}"]`)?.value || "";
      if (!choice) return `${labels[key]}: choose an action.`;
      if (choice === correct) return `${labels[key]}: the immediate action uses the shift brief and keeps the situation controlled.`;
      return `${labels[key]}: reconsider the immediate risk or missing authority before continuing.`;
    });
    const questions = [...panel.querySelectorAll('textarea[data-first-shift-question]')];
    const recordedQuestions = questions.filter(field => field.value.trim().length >= 12).length;
    results.push(`${recordedQuestions} of ${questions.length} follow-up messages are recorded. Open writing is not auto-graded: compare each message with the model and check that it names the situation, the immediate action, and what Rowan needs from Morgan.`);
    const ready = Object.entries(expected).every(([key, correct]) => panel.querySelector(`[name="co1-02-${key}"]`)?.value === correct) && recordedQuestions === questions.length;
    setOutput(panel, results.join(" "), ready ? "ready" : "needs-work");
  }

  function savingsGoal(panel) {
    const jacket = Number(panel.querySelector('[name="fl3-01-jacket"]')?.value);
    const bicycle = Number(panel.querySelector('[name="fl3-01-bicycle"]')?.value);
    const plan = panel.querySelector('[name="fl3-01-plan"]')?.value || "";
    const jacketCorrect = Math.abs(jacket - 20) < 0.01;
    const bicycleCorrect = Math.abs(bicycle - 20) < 0.01;
    if (!Number.isFinite(jacket) || !Number.isFinite(bicycle)) {
      setOutput(panel, "Calculate both weekly amounts: remaining amount ÷ weeks remaining.", "needs-work");
      return;
    }
    if (!jacketCorrect || !bicycleCorrect) {
      setOutput(panel, `Check the calculation. The jacket has ${money(120)} remaining over 6 weeks, and the bicycle has ${money(240)} remaining over 12 weeks.`, "needs-work");
      return;
    }
    if (!plan) {
      setOutput(panel, `Both goals require ${money(20)} per week, for ${money(40)} total. Sam has ${money(35)}, so choose a change that closes the ${money(5)} weekly gap.`, "progress");
      return;
    }
    const messages = {
      extend: "Extending the flexible bicycle goal to 16 weeks changes its weekly amount to $15. The jacket receives $20 and the bicycle receives $15, matching Sam’s $35 weekly limit.",
      buffer: "Taking $5 from the emergency buffer every week would turn the buffer into routine spending. Choose a change to the flexible goal instead.",
      ignore: "Ignoring the gap creates a plan that cannot be followed. The weekly allocations still need to total $35 or less."
    };
    setOutput(panel, messages[plan], plan === "extend" ? "ready" : "needs-work");
  }

  const handlers = { evidence: evidenceBuilder, "first-shift": firstShift, savings: savingsGoal };
  document.querySelectorAll("[data-pilot-activity]").forEach(panel => {
    const run = () => handlers[panel.dataset.pilotActivity]?.(panel);
    panel.querySelector("[data-check-pilot]")?.addEventListener("click", run);
    const hasSavedWork = [...panel.querySelectorAll("[data-save-key]")].some(field => field.value.trim());
    if (hasSavedWork) run();
    document.addEventListener("calm:restore", run);
  });
})();
