# Workflow: English 30-1 Brightspace Unit Replication

Use this workflow when importing a new English 30-1 Brightspace unit and converting it into the same polished course-shell pattern proven by the `ela30-1-modern-drama` Streetcar project and refined by the `ela30-1-short-stories` project.

The goal is not to clone Streetcar or Short Stories content. The goal is to reuse the strongest parts of both: the Streetcar course-shell structure and the Short Stories refinements for text banks, question banks, analysis tools, media cleanup, responsive navigation, and SCORM-ready student experience.

## Reference Implementations

### Streetcar Base Shell

- Project slug: `ela30-1-modern-drama`
- Canonical source: `projects/ela30-1-modern-drama/workspace/index.html`
- Delivery target: SCORM package for Brightspace upload
- Current export command:

```bash
npm run export:scorm -- --project ela30-1-modern-drama
```

Use the Streetcar workspace as the base visual and interaction model for:

- course overview page
- lesson shell
- sidebar and responsive navigation
- lesson completion controls
- bottom previous / mark complete / next bar
- source-link placement
- Resources grouped dropdowns
- Film Room grouped media browser
- Library structure
- Writing Studio structure
- SCORM-safe asset references

### Short Stories Refinement Model

- Project slug: `ela30-1-short-stories`
- Canonical source: `projects/ela30-1-short-stories/workspace/index.html`
- Delivery target: SCORM package for Brightspace upload
- Current export command:

```bash
npm run export:scorm -- --project ela30-1-short-stories
```

Use the Short Stories workspace as the newer model for:

- story/text banks with embedded readers, download, open, and full-screen overlay controls
- separate question banks instead of burying story questions inside Writing Studio
- dropdown-driven question views that populate below the selector
- an Analysis Explorer that combines a literary-term lexicon with curated model examples and diploma-writing applications
- lesson consolidation when multiple Brightspace pages are really one learning cluster
- concept checklists that live inside the hub lesson instead of cluttering the sidebar
- responsive navigation that is compact and does not cover content
- targeted video cleanup: keep working review videos, remove broken embeds, and avoid reposting lesson videos at the bottom
- SCORM readiness checks that include autosave restore timing, tracked storage keys, and package-level verification before Brightspace upload
- browser-safe media conversion for Film Room videos, especially full movies or downloaded MP4s that probe as MP2 audio, odd H.264 indexes, or non-faststart containers

## Inputs Needed From The User

Before starting a new unit, collect:

- Brightspace export `.zip`
- desired project slug
- unit title and course code
- any supplemental media files, such as videos, audio, images, or PDFs
- any short stories, poems, plays, chapters, readings, or other core texts as separate files
- any matching question PDFs, worksheets, or response prompts for those texts
- any teacher-preferred writing tools or assignment formats
- whether the final output should be SCORM, standalone HTML, Google-hosted, or another target

If the user only has the Brightspace export, proceed with a best-effort first pass and leave empty or placeholder sections for missing media, Film Room, Library, Story/Text Bank, Questions, and Writing Studio items.

## Source-Of-Truth Rules

For each replicated unit:

- The canonical editable file should be `projects/<slug>/workspace/index.html`.
- Imported Brightspace files should remain reference material.
- Generated exports should not become the editable source.
- New media should be copied into `projects/<slug>/workspace/assets/` or a project-specific media folder under the workspace.
- Project metadata should identify the Brightspace export as imported source and the workspace file as canonical.

Do not manually patch SCORM export contents as the main workflow. Fix the workspace source, then regenerate the export.

## Phase 1: Import And Build A First Draft

Run the standard conversion intake commands where applicable:

```bash
npm run incoming:refresh
npm run d2l-map -- --project <slug>
npm run blueprint -- --project <slug>
npm run assessment-map -- --project <slug>
npm run lesson-packets -- --project <slug>
npm run build:course-shell -- --project <slug>
```

If the standard shell builder does not yet generate the Streetcar-style shell automatically, use its output as the content inventory and then reshape `projects/<slug>/workspace/index.html` into the Streetcar reference structure.

## Phase 2: Preflight Content Audit

Before polishing the UI, audit the imported unit.

Check for:

- actual lesson order from Brightspace
- duplicate lesson pages or repeated preview blurbs
- LMS noise, launch text, local file labels, and export-only scaffolding
- broken or missing media references
- PDFs that should become embedded lesson materials
- PDFs that should move to Library or Resources
- videos or audio that should appear inline and in Film Room
- videos that are broken in lesson pages but still discoverable in the export
- embedded videos that are duplicated at the end of lessons
- text readings that should become a dedicated bank rather than ordinary Library items
- question files that should become a dedicated question selector rather than ordinary Writing Studio cards
- source links that should move to the bottom resource area
- writing assignments that should become Writing Studio tools
- quizzes, questions, or assessment files that need special placement
- mojibake or encoding artifacts
- UTF-16 lesson HTML that needs proper decoding
- image-only PDFs that need OCR/manual extraction or should remain embedded as PDFs
- broken images caused by unresolved Brightspace asset paths
- media codec/container problems that only appear in the browser, especially MP2 audio inside MP4, missing keyframe/index warnings, unsupported codecs, or videos that serve correctly but fail Chrome playback

Record unresolved issues in project notes or handoff output. Do not hide missing media by pretending it converted successfully.

## Phase 3: Map Brightspace Content Into The Streetcar Pattern

Use this placement model:

| Incoming Brightspace item | Streetcar-style destination |
| --- | --- |
| Main unit landing content | Overview page |
| Lesson pages | Lesson sequence |
| Repeated lesson preview text | Remove from top of lesson panels |
| Lesson completion button | Bottom navigation bar |
| Local PDFs used for reading/questions | Inline lesson embed or Library |
| Core readings, stories, poems, or chapters | Story/Text Bank with reader controls |
| Story/text question sheets | Questions section with dropdown selector |
| Source links | Bottom Source Links or Resources |
| External resource pages | Resources grouped dropdown |
| Working review videos tied to one lesson | Inline after the relevant review prompt |
| Broken or redundant lesson videos | Remove from lesson body; keep only working media |
| Videos/audio useful across the unit | Film Room playlist |
| Writing assignment docs | Writing Studio or Library |
| Rubrics, exemplars, prompt banks | Writing Studio / Library |
| Scene/chapter summaries | Dedicated dropdown browser where useful |
| Literary terms or concept clusters | Hub lesson with checklist and expandable/inline concept content |

The shell should feel student-facing. Avoid phrases like "Brightspace-ready master frame" or "local PDF from export" unless students genuinely need that information.

## Phase 4: Lesson Cleanup Rules

For each lesson:

- Keep one strong lesson title.
- Remove duplicate title blocks inside the lesson body.
- Remove short preview paragraphs that simply repeat the first body section.
- Put source links near the bottom, not in a large side box unless the lesson benefits from side-by-side reading.
- Move `Mark Complete` to the bottom navigation bar.
- Keep `Previous`, `Mark Complete`, and `Next Lesson` together.
- Place media directly after the relevant section heading and explanatory text.
- Remove redundant media-card titles when the video itself already carries the title.
- Do not repost lesson videos again at the bottom of the lesson.
- Keep working review videos when they introduce a lesson.
- Remove broken embeds surgically by source or placement, not by deleting all media from the lesson.
- Keep enough whitespace for readability, especially in long literature analysis sections.

## Phase 4A: Text Banks And Question Banks

Create a dedicated bank when the unit contains multiple core readings, stories, poems, speeches, scenes, or chapters that students need to open repeatedly.

Preferred text-bank pattern:

- sidebar item named for the unit, such as `Short Story Bank`, `Poetry Bank`, `Drama Texts`, or `Reading Bank`
- normalized student-facing titles
- embedded PDF/document reader
- `Open`, `Download`, and `Full Screen` controls
- full-screen mode opens as an in-page overlay with an `X` close button so students do not leave the course
- no local filenames, raw export labels, or `/Users/...` paths visible to students

Create a separate questions section when each text has its own question sheet or guided response set.

Preferred question-bank pattern:

- sidebar item placed directly after the text bank
- dropdown selector for the text
- selected questions populate below the dropdown
- response fields save to local storage when the section is interactive
- labels should match the normalized text titles
- question PDFs may be embedded if extraction is not reliable, but the student-facing title should still be clean

## Phase 5: Resources, Library, Film Room, And Writing Studio

### Resources

Group resources by lesson or unit purpose.

Preferred pattern:

- compact dropdown selector
- one expanded resource group at a time
- resource cards inside the selected group
- clear lesson number labels

Avoid large resource-card grids that force students to scroll through everything at once.

### Library

Use the Library for durable student documents:

- readings
- handouts
- rubrics
- exemplars
- prompt banks
- reference PDFs

Keep Library items cleanly titled. Strip local path language and export metadata.

If the module already has a dedicated Story/Text Bank, remove or hide redundant Library items that simply duplicate those readings.

### Film Room

Use Film Room for media that students may need to revisit:

- full-film links or files
- concept explainers
- theme videos
- motif videos
- symbol videos
- audio overviews

Group Film Room media by unit logic, not by file name. For example:

- Unit Overview
- Text Context
- Characters
- Motifs
- Symbols
- Themes
- Writing Support

Before export, audit Film Room labels. Replace generic titles such as `Embedded video` or raw filenames with student-facing labels. Remove broken media from Film Room if the underlying embed fails, but do not remove working review videos just because another video in the same lesson is broken.

#### Film Room Media Conversion Gate

Treat every local video as suspect until it is checked in the browser. A file can have an `.mp4` extension and still fail in Chrome or Brightspace if the audio codec, container index, or stream metadata is wrong.

For each local Film Room video:

1. Probe the source:

```bash
ffprobe -v error -show_streams -show_format -print_format json "<path-to-video>"
```

2. Convert anything questionable to a playback-safe MP4:

```bash
ffmpeg -y -i "<source-video>" \
  -map 0:v:0 -map 0:a:0 \
  -c:v libx264 -preset veryfast -crf 24 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  "<course-or-downloads-path>/playback-safe.mp4"
```

3. Copy the playback-safe file into the workspace media path used by Film Room.
4. Update the builder or project metadata so the next rebuild uses the playback-safe source instead of restoring the broken asset.
5. Verify with `ffprobe` after replacement. The expected baseline is H.264 video, AAC audio, `yuv420p`, and the intended full duration.
6. Verify in the browser from the course preview. The `<video>` element should report a real duration, `readyState` at least `1` and ideally `4`, and `video.error === null`.

Do not silently swap a full movie with a short clip just because the short clip plays. Preserve the instructional intent: repair the full-length asset when the Film Room item is meant to be the full film.

### Writing Studio

The Writing Studio should change per unit. Do not blindly copy the Streetcar writing tools if they do not fit.

Possible Writing Studio tools:

- thesis builder
- evidence collector
- paragraph architect
- quote integration practice
- comparison planner
- theme-to-text organizer
- literary device analysis planner
- critical/analytical response workspace
- personal response planner

For literature-heavy units, consider adding an Analysis Explorer:

- searchable/selectable literary-term lexicon
- story/text selector
- three curated model examples for each useful term/text pair
- fields for course annotation, textual evidence, analytical breakdown, student takeaway, and diploma application
- static offline data only; do not depend on live AI or network calls inside the SCORM package

Keep fillable student worksheets separate from model-analysis tools. If the worksheets are tied to specific stories/texts, consider placing them in the Questions section instead of Writing Studio.

Use the unit’s actual final assignments, prompts, rubrics, and exemplars to decide what belongs here.

## Phase 6: Responsive And Navigation Standards

The replicated shell must work on:

- desktop
- tablet-width browser
- mobile-width browser
- Brightspace iframe-like constrained width

Responsive rules:

- navigation must not cover lesson content
- collapsed navigation must not leak text
- hamburger/collapse control must stay accessible at narrow widths
- top progress should not waste space on tablet/mobile if it interferes with navigation
- horizontal scrolling should be avoided unless the content is intentionally wide, such as a PDF viewer
- desktop should keep the normal sidebar behavior
- tablet/mobile can switch to top navigation, but it must be compact
- top navigation must not take up the full screen or push lesson content far below the fold
- when navigation collapses or expands, content should reflow rather than hide behind it

## Phase 7: SCORM Export Readiness

Before exporting:

- all lesson links should resolve inside the workspace
- local media paths should use workspace-relative assets
- no required media should reference `/Users/...`
- no source text should expose local file paths unless intentionally shown
- progress and completion buttons should still work
- story/text readers should still open, download, and full-screen correctly
- question selectors should populate the right question set
- Writing Studio local storage keys should still save and restore responses
- the course should remain usable without a web server if opened as local HTML
- all local Film Room video/audio files should be browser-safe and verified from the workspace preview
- fillable textareas/inputs should not re-render their parent activity on every keystroke; one-character-then-blur behavior usually means the save handler is rebuilding the focused DOM
- every autosaved activity should use stable storage keys that the SCORM exporter can track
- SCORM bridge injection must load before inline course scripts so Brightspace `cmi.suspend_data` restores into `localStorage` before the course reads saved responses

Export with:

```bash
npm run export:scorm -- --project <slug> --version 2004
```

Expected output:

```text
projects/<slug>/exports/<slug>-scorm-2004.zip
```

If the workspace changes after export, the SCORM package is stale and must be regenerated.

After export, run the SCORM verification loop:

```bash
npm run test:scorm
unzip -tq projects/<slug>/exports/<slug>-scorm-2004.zip
```

Then verify bridge order in both the unpacked export folder and the zip:

```bash
python3 - <<'PY'
from pathlib import Path
from zipfile import ZipFile

slug = "<slug>"
folder = Path(f"projects/{slug}/exports/scorm-2004/index.html").read_text(errors="replace")
print("folder bridge before inline:", folder.find('src="./scorm-bridge.js"') < folder.find("<script>"))

with ZipFile(f"projects/{slug}/exports/{slug}-scorm-2004.zip") as z:
    html = z.read("index.html").decode("utf-8", "replace")
    print("zip bridge before inline:", html.find('src="./scorm-bridge.js"') < html.find("<script>"))
PY
```

For courses with fillable work, also do a quick local preview check:

- type more than one character into a representative response field
- confirm focus stays in the field while typing
- reload the page and confirm the response restores
- if the course has multiple activity types, test one field in each major surface

Remember the delivery boundary: opening the zip directly can only prove browser-local storage. Cross-browser restore requires launching the package through Brightspace so the SCORM API is available.

## Phase 8: First-Pass Acceptance Checklist

A new replicated unit is ready for user review when:

- the overview page describes the actual unit for students
- lessons appear in the correct order
- duplicate LMS/import noise has been removed
- each lesson has clean bottom navigation
- Library contains useful durable documents
- Film Room contains all relevant media from the unit
- broken videos have been removed surgically without removing working review videos
- local Film Room videos have been converted to browser-safe H.264/AAC MP4 when needed and verified in the browser
- text banks and question banks are separated when the unit contains multiple readings
- question dropdowns populate content instead of requiring students to open separate cards
- Resources are grouped compactly
- Writing Studio reflects the unit’s real writing expectations
- Analysis Explorer or equivalent model bank exists when the unit benefits from literary-device examples
- responsive navigation is usable
- SCORM export completes successfully
- SCORM export passes bridge-order, zip-integrity, storage-key, and autosave/reload checks

## Recommended Next-Step Workflow

For the next English 30-1 unit:

1. Import the Brightspace export.
2. Generate the standard conversion artifacts.
3. Build or reshape the workspace into the Streetcar-style shell.
4. Audit the import for encoding, missing images, broken links, broken video embeds, duplicate media, and hidden question/readings files.
5. Decide whether the unit needs a dedicated Text Bank and Questions section.
6. Do one content-placement pass.
7. Do one student-facing polish pass.
8. Preview locally with the user.
9. Make requested adjustments.
10. Convert/verify Film Room media before final packaging.
11. Export SCORM only after the workspace is stable.
12. Verify autosave, bridge order, zip integrity, and packaged media before uploading to Brightspace.

This should be treated as a repeatable human-in-the-loop workflow at first. After two or three units, extract the repeated choices into a stronger generator so future units require less manual shaping. The Short Stories build showed that the generator should eventually detect text banks, question banks, literary-term hubs, and broken lesson media automatically.
