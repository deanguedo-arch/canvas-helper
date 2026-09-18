# Biology 30 optional textbook practice — local implementation

## Delivered scope

Chapters 11, 12 and 13 have separate optional Textbook Practice pages under Practice & Review. There are 93 / 90 / 102 numbered question records (285 total); each multipart question is one record. The Chemistry reference and the existing Biology labeling banks are unchanged.

The page follows the supplied Chemistry example: scrollable printed-page rows with question tiles, Not started / Draft / Saved status, selected-question heading, original source images, Previous / Next, enlargement and a full-page view. The Biology shell still owns its typography, navigation and palette. Written drafts autosave; Save question work records an ungraded saved revision. Subsequent edits return to Draft. There is no answer key, scoring, reveal or generated hint.

## Source of truth and regeneration

- Topic selection: `scripts/lib/biology30-chapters/textbook-topics.json` maps original question groups/numbers to canonical lesson IDs. Integration adds topic metadata and derives labels from lesson headings. Cross-topic questions retain one stable question/save identity. All chapter questions and Chapter review — mixed topics remain available; topics with no matching source questions are omitted. Previous/Next stay within the selection. Lesson links open the corresponding filter. Filtering flushes pending drafts before changing the question; failed saving leaves the old selection/writing intact.
- Focused topic check: `node scripts/tests/biology30-textbook-topics.mjs` passed for Chapters 11–13: complete 285-question mapping, tile/filter inventory, shared saved response, reload, lesson links and bounded navigation. This does not replace teacher topic-mapping acceptance or deferred rollout proof.
- Shared behavior: `scripts/lib/biology30-chapters/textbook-practice.js`.
- Shared styles: `scripts/lib/biology30-chapters/textbook-practice.css`.
- Chapter 11 state adapter: `scripts/lib/biology30-pilot3/runtime.ts`.
- Chapter 12/13 adapters: canonical workspace `main.js` files, wired by the integration script.
- Learner headings/instructions/controls: the three canonical workspace `index.html` files. The integration script preserves existing page prose after initial insertion.
- Inventory, stable identities and crop policy: `scripts/render-biology30-textbook-practice.py`. It reads the existing chapter PDFs, writes coordinate manifests to each project's `meta/textbook-practice-manifest.json`, and renders original-page/crop JPEGs under `workspace/assets/textbook-practice/`. Coordinates are PDF points relative to the rendered media box, not the sometimes-offset trim box.
- `scripts/integrate-biology30-textbook-practice.mjs` installs manifests, additive lesson links, runtime adapters and derived component copies. It does not recreate existing lessons or question banks.

After changing source/crop policy, run the renderer, integration, Chapter 11 esbuild bundle refresh, and `node scripts/refresh-biology30-chapter-portable.mjs`, in that order. The latter embeds original question/context images in the Chapter 12/13 standalone HTML copies. Do not edit exported ZIPs or portable copies directly.

## Inventory decisions and review

All boxed in-text questions, numbered section reviews and chapter reviews are included. Paper-based supplementary analysis is included where the question can be answered without new experimental observations. Physical procedures and observation-dependent questions are excluded. Chapter 13's cumulative Unit 5 review (printed pp. 468–471) is excluded. Investigation 13.B's unknown sample questions 1, 3–6 are explicitly excluded because its A–E sample observations are not supplied; its conceptual question 2 is included.

Original full-page context is retained alongside the selected-question crop, including referenced pages and both chapter-review pages. Supplementary analysis deliberately uses original-page images where repeated procedure/analysis numbering would make a narrow automatic crop misleading. Five explicit cross-column continuations are immediately visible rather than hidden in context. Review sheets live in each project's `meta/textbook-practice-review/`; source pages and crop/continuation images were visually inspected during implementation. This is source/crop review, not independent teacher approval of historical textbook assertions.

## Saving contract

Existing native namespaces, schemas and answer IDs are unchanged. `textbookWork` is an additive optional map in the native chapter state. Stable record identities contain chapter, printed page, group and question number.

Photo blobs use a separate chapter-specific IndexedDB database: `biology30-chapter-<chapter>:textbook-photos:v1`. Native records contain their references, not image bytes. Up to three JPG / PNG / WebP images are accepted; decoded images retain browser-applied source orientation and are resized to a maximum 2000-pixel dimension. Photo storage must finish before the native response reference is committed. Failed commits keep previous persisted records intact. Replacement/removal does not delete the older blob until the new native references are committed; rejected new blobs are cleaned up best-effort.

All My Work displays each question's writing and photos together, with source page/group/number and work status. The print action flushes writing and hydrates/decode-loads photos before opening print. Photos save in the current browser only. Existing LMS/cross-device response saving does **not** transfer photo blobs. Print/PDF is the portable record; clearing browser storage can remove locally held photos.

## Verification run

`node scripts/tests/biology30-textbook-practice.mjs` passed for all three chapters: exact inventory counts, question tiles, typed drafts/save/edit/reload, photo upload/replacement/confirmed removal/cancel, three-photo limit, invalid type and corrupt-image rejection, Previous/Next, dialog/full-page/Escape/focus return, All My Work, generated print PDFs, 390px overflow checks, older native save fixtures with nonzero required progress, and simulated photo/response storage failures. Both refreshed portable copies loaded their original question images while offline. Desktop layout and source/continuation crop images were visually inspected. Printed writing/photos were checked on representative output pages.

## Deferred rollout / risks

Full course/Studio editability, exhaustive responsive and browser/device coverage, physical-device EXIF variations, cross-tab races, SCORM export and live Brightspace certification are not claimed. No packaging, deployment, commit or push was performed for this change. Chapters 12/13 retain their existing blocked teacher-review status. Existing unrelated dirty files were preserved.

Do not rerun older chapter intake/presentation or labeling-filter builders over the edited canonical workspaces. Native saved-history question snapshots, vocabulary IDs, supplied labeling image IDs and required chapter checks remain separate owners.

Exact next action: review the three local Textbook Practice previews; request rollout validation only when the candidate is accepted.

Exact next file to open: `projects/biology30-unit-a-pilot-3/workspace/index.html`.
