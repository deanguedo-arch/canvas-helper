# Kainaeng Brightspace Reface Design

## Goal

Rebuild the supplied Brightspace package so student-facing HTML content pages receive a consistent visual treatment while the LMS package structure remains controlled.

## Scope

- Input: `canvas code and references/kainaeng/Unconfirmed 160903.zip`
- Outputs under `projects/kainaeng-brightspace-reface/exports/`
- Transform only `.html` / `.htm` files under the Brightspace content root, including the package's Cyrillic-c `\u0441ontent/` root.
- Default mode preserves `imsmanifest.xml`, media, PDFs, images, content-service objects, XML, and non-content folders without rewriting their payloads.
- Lean mode exists for Brightspace's 2 GB upload cap: replace `contentservice_objects/` video resources in `imsmanifest.xml` with lightweight placeholder HTML topics, exclude the oversized MP4 entries from the ZIP, and export the original video files into a separate media folder.

## Approach

Use a deterministic streaming ZIP transformer instead of loading the 4 GB package into memory. For each entry, copy bytes directly unless it is a content HTML page. For content HTML, remove inline `style` attributes and legacy `<font>` tags, preserve links/media paths/classes/scripts, add a shared embedded course stylesheet, and add a page body marker class.

The default package keeps the manifest byte-for-byte unchanged. The lean package uses the same content refacing pass but rewrites only manifest resources whose files live under `contentservice_objects/`. Each rewritten resource keeps its original identifier, points to a generated placeholder HTML page, and preserves module item references. The original MP4 files remain available as a separate media handoff.

## Validation

The pipeline must prove:

- The default output ZIP has the same entry list as the input ZIP.
- Default-mode `imsmanifest.xml` is unchanged.
- Non-HTML entries are unchanged by hash unless they are explicitly externalized in lean mode.
- Transformed HTML keeps relative `href` and `src` references.
- Local relative links from transformed pages resolve to package entries, ignoring Brightspace root paths such as `/shared/...` and external URLs.
- Lean mode output is under 2 GB.
- Lean mode has no `contentservice_objects/` ZIP entries or manifest references.
- Lean mode has no dangling manifest item identifier references.
- Lean mode includes one placeholder HTML page for each externalized video topic.
- Externalized media files match the original ZIP entries by hash.
