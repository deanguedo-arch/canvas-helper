# Brightspace ZIP to DOCX Conversion Standard

This is the current standard for converting Brightspace/D2L course export ZIPs into Word documents.

The goal is not to rebuild Brightspace pages by guessing layout in `python-docx`. The standard method is:

1. Read the Brightspace package structure from `imsmanifest.xml`.
2. Build one cleaned, combined HTML file per top-level unit.
3. Preserve the package CSS and inline Brightspace layout as much as possible.
4. Normalize media, links, images, and LMS noise.
5. Let Microsoft Word import the cleaned HTML and save the editable `.docx`.

This gives the closest editable Word result we have found so far.

## Output Contract

- Produce one `.docx` per top-level unit/module.
- Each unit document contains all child lessons/resources in Brightspace manifest order.
- Text must remain editable in Word.
- Images must come from the Brightspace ZIP when present.
- Videos must become:
  - a clickable thumbnail image, and
  - the raw public `https://...` link directly below it for Google Docs smart-chip workflow.
- Non-HTML resources must be copied into a local `supporting-files/` folder and linked from the DOCX.
- Every manifest item must be accounted for in the audit.
- Missing resources, skipped pages, and unresolved assets must be visible in the audit, not silently ignored.

## Current Accepted Implementation Examples

- Social Studies 10-1 Unit 1:
  - `projects/social-studies-10-1-docx-export/meta/build_word_native_unit1_docx.py`
- English Language Arts 10-2 Unit 1:
  - `projects/english-lang-arts-10-2-docx-export/meta/build_word_native_unit1_docx.py`

These are the reference scripts for the method. Older practice, browser-rendered, styled-practice, screenshot, and direct `python-docx` reconstruction attempts are not the standard.

## Required Runtime

- Windows.
- Microsoft Word installed.
- Word COM available through PowerShell:

```powershell
New-Object -ComObject Word.Application
```

The conversion script writes cleaned HTML first, then runs a generated PowerShell import script that opens the HTML in Word and saves it as `.docx`.

During the Word import step, the script must walk imported `InlineShapes` and `Shapes`, set `SavePictureWithDocument`, and break image links before saving. Otherwise Word can preserve local image references and later show "linked image cannot be displayed" boxes when the DOCX is opened away from the temporary HTML/image folder.

## Manifest and Unit Handling

- Read `imsmanifest.xml`.
- Find the real top-level course modules under the organization wrapper.
- Use the top-level unit/module title as the document boundary.
- Walk child items recursively in manifest order.
- For each item:
  - render `.html` / `.htm` files into the combined unit HTML,
  - copy `.pdf`, `.docx`, `.pptx`, media files, and other support resources into `supporting-files/`,
  - include a support-file link section when the item is not directly renderable as HTML.

No visible Brightspace lesson/resource should disappear just because it is nested or is not HTML.

## HTML Rendering Standard

The script should preserve the original Brightspace page structure where possible:

- Keep the source body content.
- Inline source CSS referenced by the package, for example `templates/cbestylesheet.css`.
- Keep meaningful Brightspace IDs/classes such as `header`, `content`, `feature`, `readingassignment`, `media`, and similar content callouts.
- Add only the minimum Word-safe CSS shim needed for page width, breaks, image sizing, video cards, and basic layout stability.
- Use page breaks between lessons/resources.
- Do not add synthetic course styling that changes the lesson’s visual character.

### Course-Approved DOCX Style Profiles

Synthetic styling is still not the default. A course may use an explicit DOCX style profile only when the requested conversion goal is to apply a known brand/accessibility treatment across the whole course.

For Learning Strategies 15, `scripts/brightspace_zip_to_docx_upload_package.py` uses the `next-step` DOCX style profile. That profile adapts the Next Step Brightspace redesign strategy for Word import:

- preserve the Brightspace manifest order, lesson text, links, media handoff blocks, and image assets;
- apply the Next Step palette to the generated Word-import HTML across every unit document;
- use accessible deep greens for headings, headers, links, and tables;
- reserve the brighter logo green for borders and accent treatments;
- use warm amber callouts for assignments/quizzes and soft green callouts for lesson features.

The generated audit and upload-package README record the selected `docxStyleProfile`.

## Noise Removal Standard

Remove LMS/admin/noise before Word import:

- `script`, `noscript`, and executable template scaffolding.
- Brightspace navigation/chrome/admin controls.
- `Template JavaScript`.
- `Image source` / `Image sources`.
- `Iframe preserved from Brightspace`.
- Generic duplicate media labels such as standalone `Embedded media` when replaced by the video card.
- `Back to Top` links.
- D2L-only event/data attributes that do not help the DOCX.

The rule is: keep instructional content, remove LMS machinery.

## Image Standard

Images referenced by HTML must be resolved against the ZIP, copied locally, and embedded through the cleaned HTML.

Path handling must be defensive:

- Resolve relative paths against the source HTML file.
- Handle package path drift and filename fallback.
- Handle the common Brightspace `content` / Cyrillic `сontent` path issue by matching suffixes when needed.

Sizing rule:

- Preserve source dimensions when they fit.
- If an image is slightly too wide for the Word page/card, reduce width and proportional height before Word import.
- The current Word-safe content width is `620px` in the Social 10-1 implementation.
- Video thumbnails are generated at the Word-safe size before import, not just capped with CSS.
- Word import must embed the imported images into the DOCX package, not leave them as links to local HTML assets.

This prevents images from hanging off the page in Word.

## Video and Embedded Media Standard

DOCX cannot preserve live iframes the way Brightspace/Chrome does. The standard replacement is a useful Google Docs handoff block.

For each iframe/embed/video/audio or video link:

1. Resolve a public handoff URL.
2. Create/download a thumbnail.
3. Add a clickable thumbnail image linked to the URL.
4. Add the raw `https://...` URL below the image.

Rules:

- YouTube embed URLs become `https://www.youtube.com/watch?v=<id>`.
- YouTube thumbnails use `https://img.youtube.com/vi/<id>/hqdefault.jpg`.
- TED embed URLs should be converted to a public TED URL when possible.
- If remote thumbnail fetch fails, generate a fallback thumbnail with a play button.
- The raw URL must remain visible because Google Docs can more easily convert raw URLs into smart chips.
- Do not leave iframe-preservation notes in the DOCX.

## Links and Google Docs Handoff

For normal links:

- Keep external links clickable.
- Keep meaningful linked text when it is not a video.
- Convert package-local non-HTML links into copied `supporting-files/` links.

For video links:

- Do not hide the URL only behind linked text.
- Include the raw `https://...` URL below the thumbnail.

## Audit Standard

Each run must write a JSON audit in the project `meta/` folder.

The audit should include:

- source ZIP path,
- unit title,
- output DOCX path,
- manifest items accounted for,
- HTML sections rendered,
- images copied,
- media references converted,
- support files copied,
- unresolved assets,
- coverage failures.

The generator should fail when there are real coverage failures instead of silently producing an incomplete document.

## Output Hygiene

Generated output should live under a clearly named accepted output folder, for example:

```txt
projects/<slug>/exports/word-native-unit1/
```

Standard subfolders:

```txt
html/
html/assets/
docx/
supporting-files/
```

The script may clear its generated `html/` and `supporting-files/` folders on rerun.

If Word has a DOCX open and the canonical output cannot be overwritten, the script may write a refreshed filename. Close the old DOCX and rerun if a clean canonical filename is required.

## What Not To Use As The Standard

Do not use these as the default conversion strategy:

- screenshot-only pages,
- PDF-style rasterized lessons,
- browser screenshot stitching,
- direct `python-docx` reconstruction of arbitrary HTML layout,
- hybrid image/text modes that make text less editable,
- placeholder iframe notes.

Those approaches can be useful for emergency comparison or proof-of-concept work, but they are not the scale workflow.

## Acceptance Checklist

Before scaling a course:

- Open the DOCX in Word.
- Compare sampled pages against Brightspace full-screen view.
- Confirm text is editable.
- Confirm images fit within the page/card.
- Confirm video thumbnails are clickable.
- Confirm raw video URLs are visible.
- Confirm there is no `Image source`, iframe note, or template/admin noise.
- Confirm the audit accounts for every manifest item in the unit.

Only after that should the same script pattern be generalized to all units for the course.
