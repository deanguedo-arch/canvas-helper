(() => {
  "use strict";
  const dialog = document.querySelector(".resource-reader-dialog");
  if (!dialog) return;
  const title = dialog.querySelector("#resource-reader-title");
  const frame = dialog.querySelector(".resource-reader-frame");
  const pageImage = dialog.querySelector(".resource-reader-page-image");
  const pageImageLink = dialog.querySelector(".resource-reader-page-image-link");
  const alternative = dialog.querySelector(".resource-reader-alternative");
  const fallback = dialog.querySelector(".resource-reader-fallback");
  const close = dialog.querySelector("[data-close-resource-reader]");
  let opener = null;

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-open-resource-reader]");
    if (!button) return;
    opener = button;
    const page = Number(button.dataset.resourcePage || 1);
    const path = button.dataset.resourcePath;
    title.textContent = button.dataset.resourceTitle || "Original resource";
    frame.title = `${title.textContent}, physical page ${page}`;
    frame.src = `${path}#page=${page}&view=FitH`;
    const imagePath = path.replace(/\.pdf$/i, `-page-${page}.png`);
    pageImage.src = imagePath;
    pageImage.alt = `${title.textContent}, physical page ${page}. The controls shown in the captured source page are not active course controls.`;
    pageImageLink.href = imagePath;
    alternative.textContent = button.dataset.resourceAlternative || "Use the lesson's HTML teaching if the PDF is unavailable.";
    fallback.href = `${path}#page=${page}`;
    fallback.textContent = `Open the original PDF at physical page ${page}`;
    dialog.showModal();
    close.focus();
  });

  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    frame.src = "about:blank";
    opener?.focus();
  });
})();
