# 05 — Draft editor contract

## Engine and representation
Use a structured editor with an explicit schema; default engineering choice is **ProseMirror core** (model/state/view/transform/history/keymap/commands/schema-list), bundled locally and version-pinned by the implementer. Its official model repository describes custom schemas and now points to its maintainer-hosted repository. [S9] This handoff does not include downloaded dependencies or pretend a particular version was installed. A different engine requires a recorded adapter decision preserving the supplied JSON document format and test behaviour. Avoid a hand-rolled `contenteditable.innerHTML` store or deprecated-command-only editor.

Source of truth is the schema-constrained JSON tree. Serialized HTML is an export format, not persisted canonical content. No live DOM, selection objects, undo stacks or compiled guide text in suspend_data.

Allowed block nodes: doc; paragraph; heading (levels 2 and 3 only); blockquote; bullet_list; ordered_list (positive integer start); list_item. Inline: text and hard_break. Text marks: strong, em, underline, link (http/https only). No images/tables/iframes/video/audio/embeds/style attributes/event handlers/raw HTML. Plain URLs remain text unless student adds a link. Document title is separate project/draft metadata, not an invisible heading injected into the prose.

Every block except doc has a stable `attrs.id`. Text/hard_break have no IDs. Heading adds level; ordered_list adds order. No arbitrary attrs. IDs are unique across a project document. Nested lists maximum depth 4; total tree depth maximum 12. Normalization may add missing IDs only when building from **paste/plain text**, not when validating an imported backup that claims schema compliance. Invalid backups are rejected or handled in an explicit repair preview, never silently coerced.

## Editing behaviour
Enter splits paragraphs; Shift+Enter adds hard_break. Backspace/Delete at structural boundaries follow the editor's normal tested merge/unlist behaviour; empty last paragraph is always allowed. Standard select/copy/cut/paste, Home/End and platform navigation must work. Do not capture shortcuts used by assistive technology. Tab moves keyboard focus; list indentation uses explicit toolbar actions and Mod+[ / Mod+] where supported rather than trapping Tab.

Undo/redo belongs to the current editing session, grouped into coherent transactions. Evidence insertion and formatted paste each undo atomically. Switching Plan/Draft or Focus does not throw away unsaved changes or create a separate copy of the document. Best implementation keeps the editor state object mounted in the project controller even when its DOM view is temporarily hidden.

Keyboard: Mod+B/I/U for marks; Mod+Z, Mod+Shift+Z (and Windows Ctrl+Y) for history. Mod+S prevents browser Save page and triggers the save coordinator with visible status, not a direct API write. Escape leaves focus only when not composing and no dialog is active. Toolbar controls retain/restore selection safely; no lost caret when picking evidence.

## Input method and mobile
Respect compositionstart/update/end. Never autosave a half-normalized IME transaction or rerender the entire editor on each keystroke. Autosave receives the stable document after composition transactions, while runtime scheduling must not force composition to end. Test composed accents, emoji, smart apostrophes, em dashes, CJK input, speech dictation and mobile selection. Caret remains visible above the on-screen keyboard; no fixed footer obscures it.

## Paste policy
Treat pasted HTML as untrusted input. Parse in a detached document, drop script/style/iframe/object/embed/svg/math and hidden content; keep visible text. Convert paragraphs/headings/lists/blockquotes/strong/em/u and allowed links to the canonical tree. Strip class/id/style/width/height/data-* handlers and external resource nodes. Do not fetch remote images during parsing. Office list markers require explicit test fixtures and normalization, not blanket stripping of visible text.

For tables, offer a preview of row-separated plain text (tabs between cells); no hidden partial import. Images/attachments show an explanation and are not inserted. Pasting unsupported formatting produces a quiet “Formatting simplified” message, preserving supported visible text. Plain-text fallback is available. Oversized paste is rejected **as a whole** with an explanation and a copyable plain-text view; do not silently slice at a character limit. Preexisting draft content remains intact.

Link creation validates scheme and rejects javascript/data/file/blob as persisted href. Never execute pasted HTML or use an unsanitized string with innerHTML. Render previews through DOM text nodes/schema serializers. Text containing `<script>` entered as plain text stays literal text.

## Evidence insertion
Preview content and optional attribution exactly. Choose paragraph or blockquote; a quote checkbox is the student's verification, not app certification. Insert at preserved caret or explicitly choose end of document. Generate block IDs; associate evidenceUse with blockId + evidenceId + hash of inserted source content. Never substitute the commentary field into a generated argumentative paragraph. Editing source evidence later does not silently update prose.

Deleting/joining blocks preserves draft text through editor semantics. If a use/feedback anchor no longer maps to a surviving block, set its blockId=null and show “Original paragraph changed”. Keep the note itself. Splits retain the original block ID on the first surviving block; new blocks get new IDs. On joins retain the first block ID; invalidate or remap other anchors explicitly through transaction mapping.

## Word count / length
Count only draft visible text, not project title, prompt, notes, criteria, hidden metadata or evidence not inserted. Canonical MVP count: normalize non-breaking spaces for counting only; match Unicode letters/numbers with internal apostrophe/hyphen allowed; punctuation/emoji-only runs count zero. Definition and expected fixture examples are supplied in the tools test. Preserve the original text bytes in storage; counting does not normalize writing. Word goal is advisory, never an insertion cutoff or grade.

Field safety limits are in `schemas/product-config.json`: current draft visible characters 200,000/project; raw serialized persisted workspace 1 MiB; wire state 56,000. These limits are distinct. Editing transactions that violate the draft field limit must be refused visibly without deleting old text. A valid local workspace that exceeds wire capacity stays editable within field limits, unsynced, with backup/space management prominent.

## Exports
TXT: exact readable content with paragraphs separated by two LF characters, list items prefixed with bullets/numbers, blockquotes prefixed `> `, Unicode preserved; no app navigation.
HTML: standalone document with sanitized semantic markup, project title, optional source list chosen by student, CSS bundled inline; no script/external fonts or images. A Content-Security-Policy may be embedded to block loads. Escape title, metadata and attributes.
Print/PDF: native print flow with document-only styling, high contrast, sensible margins, no fixed app chrome; remove interactive controls. Preview before printing. Do not guarantee the browser exposes PDF saving on every managed device.
DOCX: not MVP. If added, implement a genuine Office Open XML export with a vetted locally bundled library, read the required DOCX authoring guidance in the build environment, and test in Word/Google Docs. Renaming HTML `.docx` is forbidden.

A document export is not a Studio backup. Neither exports nor self-marking a project ready submits to Brightspace.
