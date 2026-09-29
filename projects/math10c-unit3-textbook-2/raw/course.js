document.querySelector("[data-practice-emphasis]")?.addEventListener("click", (event) => {
  const button = event.currentTarget;
  if (!(button instanceof HTMLButtonElement)) return;
  const card = button.closest("[data-practice-card]");
  const pressed = button.getAttribute("aria-pressed") !== "true";
  button.setAttribute("aria-pressed", String(pressed));
  card?.toggleAttribute("data-emphasized", pressed);
});
