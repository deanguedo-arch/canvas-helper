# Chapter 17 portable teacher-review snapshot

## Summary

Created the requested standalone HTML and ZIP from the exact candidate served at port 57232. Revised lessons 1–5 are included; lessons 6–15 remain their previous versions. No course editing, canonical integration, acceptance or deployment occurred.

## Files changed

- `scripts/share-biology30-ch17-review.mjs`: hash-bound derived-snapshot generator.
- This folder: generated HTML, ZIP, READ ME, SHARE_REPORT and this handoff.
- Downloads: `Biology 30 - Chapter 17 - Teacher Review.html` and matching ZIP.

## Verification run

The generator verified unchanged source hash, exact lesson HTML for all 15 lessons, protected JSON/control attributes, all 148 bundled image assets, embedded PDF signature, two inline stylesheets, four inline native runtimes and ZIP CRC. Five executable scripts pass syntax parsing, and the download matches the retained snapshot. Scoped diff whitespace check passed.

## Known risks / follow-up

The browser tool refuses file URLs. Local-file rendering and saving were not tested; no browser-policy workaround was attempted. Teacher should open the HTML in a desktop browser. Videos require internet. Browser privacy settings may limit local-file saves. Full E2E, Studio, SCORM, packaging for LMS and Brightspace verification are deferred; this ZIP is only a sharing wrapper.

## Source of truth

`../evaluation/new/index.html`, SHA-256 `31447f72550c68ceb4a7cfd444f85651908a86782096dff4e4847cff4ab9e3e4`. The share is derived output, not an editable canonical course owner.

## Fragile areas

Keep native JSON, controls, vocabulary, progress and save namespaces unchanged. Do not claim the remainder of the chapter is newly authored. Teacher review does not establish independent assessment or release acceptance.

## Next prompt assumptions

Any teacher feedback applies to this isolated candidate, not automatically to the live course. No browser save data or student work is included.

## Exact next action

Share the HTML directly, or send the ZIP and ask the teacher to extract it and open the HTML. No server command is required for the intended portable format; actual local-file behavior remains unverified here.

## Exact next file to open

`/Users/deanguedo/Downloads/Biology 30 - Chapter 17 - Teacher Review.html`

## Routing

Lead retained the narrow snapshot/compatibility boundary and reused the existing deterministic portable pattern. No worker was needed. Provider-cache usage savings are unknown; no cache savings claimed.
