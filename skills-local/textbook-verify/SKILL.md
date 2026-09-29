---
name: textbook-verify
description: Pin lesson content against textbook fixture extracts and reject unverified adoptions.
---

Use when a lesson batch cites textbook pages or when staged prose claims need verification.

## Steps

1. Locate the fixture text for the cited pages (e.g. `scripts/tests/fixtures/ab30-parity/textbook-*`).
2. Check each factual claim, quote, and page pin against the fixture bytes. Page ranges beyond verified text (e.g. pp226+) stay unverified — say so plainly.
3. Staged PDFs without a text layer can't be verified by this skill — flag them for OCR/manual review, never mark them verified.
4. Record verified titles/pages per lesson; keep the web-quote list separate from byte-verified pins.

## Rules

- Staged-source-beats-prose: candidate prose never overrides fixture bytes.
- "Verified" means bytes matched. Anything else is "staged" or "unresolved" — no middle grades.
