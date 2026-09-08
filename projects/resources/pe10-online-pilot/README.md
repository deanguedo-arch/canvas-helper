# PE10 online pilot source library

This directory preserves the six supplied source documents as immutable, content-addressed authoring references. The filename of each copy is its SHA-256 digest. `source-inventory.json` maps every digest back to the supplied name and records its learner-use disposition.

## Release boundary

- Nothing under this directory belongs in a learner HTML or SCORM export.
- Do not edit files under `_sources/`; add a new content-addressed copy when a source changes.
- The 43-page coil contains mixed scans and dated third-party material. It is reference-only until rights and currency are independently resolved.
- Current Alberta, EIPS, Health Canada, Public Health Agency of Canada, and Heart & Stroke guidance overrides conflicting legacy content.

## Integrity check

Run:

```bash
shasum -a 256 projects/resources/pe10-online-pilot/_sources/*
```

Compare the result with `source-inventory.json`.
