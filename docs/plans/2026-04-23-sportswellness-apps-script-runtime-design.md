# Sportswellness Apps Script Runtime Design

**Goal:** Make the Drive-backed Apps Script export render the existing Sports Wellness shell, assignments, performance games, inline slides, and figure images reliably inside a real Apps Script web app.

## Problem

The current Apps Script export splits `sportswellness` into:

- a thin Apps Script shell
- Apps Script-served text assets
- Drive-backed binary assets

That split is correct at a package-size level, but the runtime still breaks in three places:

1. Assignment runtime HTML is fetched through the normal HTML asset route, which is suitable for navigation but not for DOM parsing as raw markup.
2. Performance game pages are loaded as standalone HTML assets inside iframes, but those pages depend on browser behavior that is more reliable when the iframe receives raw HTML rather than an Apps Script HTML-service wrapper.
3. PDFs and images still use Drive URL shapes that are workable for downloads but unreliable for inline rendering.

## Recommended Approach

Use a shared exporter/runtime fix rather than a sportswellness-only patch.

### Shared Apps Script exporter changes

- Add a raw text mode for text assets so HTML documents can be fetched as literal markup.
- Expose a raw-asset helper in the injected bootstrap alongside the existing asset URL map.
- Generate image URLs with an embed-friendly Drive image endpoint instead of the current download-style URL.
- Keep PDF assets on the existing download-style URL for download buttons; fix inline viewing at the viewer layer instead of changing the PDF asset contract globally.

### Sports Wellness runtime changes

- Fetch assignment runtime HTML through the raw-asset helper before parsing.
- When a performance tool points at an Apps Script HTML asset, load that asset into the iframe via `srcdoc` using the raw HTML helper instead of setting `src` directly.
- Update the PDF viewer so Drive-hosted PDFs use a Drive preview iframe for inline viewing while preserving the existing PDF download link.

## Why This Approach

- It keeps the shared Apps Script exporter as the source of truth.
- It avoids a larger rewrite of the imported games.
- It preserves the current course structure and runtime shape.
- It addresses each failure at the layer where it is actually happening:
  - raw HTML parsing for assignments
  - iframe content delivery for games
  - Drive preview behavior for slides
  - Drive image embedding for figure images

## Risks

- Apps Script HTML assets loaded through `srcdoc` must still execute the embedded scripts as expected in the browser.
- Drive preview rendering may behave slightly differently from the old PDF.js canvas path, but it is more compatible with Drive-backed delivery.
- The course shell must continue to work in non-Apps-Script environments, so all runtime changes need an Apps Script-only branch and a normal fallback branch.
