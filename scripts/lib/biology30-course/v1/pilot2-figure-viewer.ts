/** One native modal per mounted course; browser focus trapping and Escape apply. */
export function mountTopicFigureViewer(root: HTMLElement) {
  const doc = root.ownerDocument, dialog = doc.createElement("dialog");
  dialog.className = "p2-figure-dialog"; dialog.setAttribute("aria-label", "Enlarged teaching figure");
  const title = doc.createElement("h2"), close = doc.createElement("button"), label = doc.createElement("label"), original = doc.createElement("input"), viewport = doc.createElement("div"), image = doc.createElement("img"), explanation = doc.createElement("p");
  title.textContent = "Enlarged figure"; close.type = "button"; close.textContent = "Close figure"; close.dataset.testid = "pilot2-figure-close";
  original.type = "checkbox"; label.append(original, doc.createTextNode(" Show original size")); viewport.className = "p2-figure-viewport"; viewport.tabIndex = 0; viewport.setAttribute("role", "region"); viewport.setAttribute("aria-label", "Enlarged figure; scroll when showing original size");
  viewport.append(image); dialog.append(title, close, label, viewport, explanation); root.append(dialog);
  let opener: HTMLButtonElement | null = null;
  const resize = () => viewport.classList.toggle("p2-figure-original", original.checked);
  const onClose = () => { opener?.focus(); opener = null; image.removeAttribute("src"); };
  const closeDialog = () => dialog.close();
  const onClick = (event: Event) => {
    const button = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-pilot2-enlarge]") : null;
    if (!button || !root.contains(button)) return;
    const figure = button.closest("figure"), source = figure?.querySelector("img,svg");
    if (!source || !figure || dialog.open) return;
    opener = button; title.textContent = figure.querySelector("figcaption")?.textContent ?? "Enlarged figure";
    if (source instanceof HTMLImageElement) {
      image.src = source.src; image.alt = source.alt; image.width = source.naturalWidth || Number(source.getAttribute("width")); image.height = source.naturalHeight || Number(source.getAttribute("height"));
    } else {
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(source))}`;
      image.alt = source.querySelector("desc")?.textContent ?? source.querySelector("title")?.textContent ?? "Teaching graph";
      image.width = Number(source.getAttribute("width")); image.height = Number(source.getAttribute("height"));
    }
    explanation.textContent = figure.querySelector("p")?.textContent ?? "";
    original.checked = false; resize(); dialog.showModal(); close.focus();
  };
  root.addEventListener("click", onClick); close.addEventListener("click", closeDialog); original.addEventListener("change", resize); dialog.addEventListener("close", onClose);
  return { dispose() { if (dialog.open) dialog.close(); root.removeEventListener("click", onClick); close.removeEventListener("click", closeDialog); original.removeEventListener("change", resize); dialog.removeEventListener("close", onClose); dialog.remove(); } };
}
export const TOPIC_FIGURE_VIEWER_CSS = `
.p2-figure-dialog { width: min(94vw, 1200px); max-width: 94vw; max-height: 92vh; box-sizing: border-box; padding: 1rem; }
.p2-figure-dialog::backdrop { background: rgb(0 0 0 / .65); }
.p2-figure-dialog h2 { font-size: 1.2rem; }
.p2-figure-dialog button, .p2-figure-dialog label { display: inline-flex; align-items: center; min-height: 44px; margin-right: 1rem; }
.p2-figure-viewport { max-height: 65vh; overflow: auto; margin-block: 1rem; }
.p2-figure-viewport img { display: block; width: 100%; height: auto; }
.p2-figure-original img { width: auto; max-width: none; }
`;
