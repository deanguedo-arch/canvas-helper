# Math Source Review Pack

Deterministic, standard-library-only pre-generation tooling that builds a
**private human-review pack** for Math 10C factoring and
right-triangle-trigonometry evidence, plus rights/accessibility review of
related raster images.

This pack is **evidence for human classification only**. It grants no
permission to reuse questions or images, approves nothing for learner,
Studio, LMS, or teacher use, and never infers a decision. The machine
contract lives in [`REVIEW_CONTRACT.json`](REVIEW_CONTRACT.json).

## Exact run command

```bash
python3 scripts/build-math-source-review-pack.py \
  --source-root <private-dir> \
  --inputs tasks/math-source-registry/SOURCE_INPUTS.json \
  --registry-dir <ignored-registry-dir> \
  --output-dir <ignored-output-dir>
```

- Python standard library only; no network use.
- `<private-dir>` holds the local files named in `SOURCE_INPUTS.json`
  (filename-only records; absolute paths are never recorded or emitted).
  Every record is size- and SHA-256-validated before the authoritative
  Math 10C archive is read. Math 20/30 archives are validated but never
  scanned for this pilot.
- `<ignored-registry-dir>` holds the registry indexes
  (`question-reference-index.ndjson`, `asset-index.ndjson`,
  `content-index.ndjson`). Source ZIPs and registry files are read-only
  inputs and are never modified.
- `<ignored-output-dir>` receives the review pack. An output directory
  inside tracked repository paths is refused unless it is under
  `.runtime/`; temporary directories outside the repo are permitted.

Optional safe bounds (defaults shown):

```bash
  --max-questions 200 --max-images 200 --max-image-bytes 2000000 \
  --max-member-bytes 8000000
```

`--overwrite-decisions` intentionally resets the existing blank decision
templates. Without it, reruns preserve all matching human decisions and
notes, add new blank records, and retain stale records separately.

Exit codes: `0` pack built and self-audit passed; `1` source/registry
validation or matching failure; `2` output-directory policy refusal or
bad bounds; `3` output privacy self-audit failure.

## Behavior

- Selects only Math 10C registry records tagged `factoring` or
  `right-triangle-trigonometry`, in deterministic
  `(sourceKey, member, itemIdent, presentationSha256)` order, under the
  question cap.
- Matches each selected record back to its exact source archive and XML
  member using source key/member, the safest available item identity,
  and the exact `presentationSha256`. Central question-bank and
  quiz-embedded items are both handled. Ambiguous or hash-mismatched
  matches are rejected with a recorded reason, never guessed.
- Extracts only the QTI `<presentation>` subtree and converts it to
  sanitized plain text (prompt plus visible response choices), including
  reducing HTML/MathML encoded inside D2L text nodes to non-executable text.
  Non-visible D2L presentation-extension settings are also removed. Response
  processing, correct-response values, scoring, solutions, and feedback
  bodies are pruned before text collection and must never appear in any
  output or test golden file. No raw HTML or raw XML is emitted.
  Records without a `<presentation>` subtree are rejected rather than
  falling back to the surrounding item.
- Copies only referenced PNG/JPEG/GIF members whose registry record is
  `inspected` and whose bytes pass safe-name, magic-byte/MIME, size-cap,
  and SHA-256 checks. Copies are named `<sha256>.<ext>` (`.jpeg`
  normalized to `.jpg`) so identical bytes deduplicate. SVG, HTML,
  scripts, PDFs, audio, video, and arbitrary files are never copied.
- Emits `question-decisions.json` / `image-decisions.json` with the exact
  allowed question values `formative_candidate`,
  `formal_or_restricted`, `adaptable`, `unsuitable`; all decisions start
  blank (`null`/`""`) for human reviewers. Existing decision files are
  schema-validated and fail closed on unknown fields, duplicate IDs, or
  invalid question decision values. Stale decisions remain preserved across
  later reruns.
- Generates a static `index.html` with escaped plain text only: no
  JavaScript, no external resources, images constrained by CSS, and a
  `Content-Security-Policy` of `default-src 'none'; img-src 'self'
  data:; style-src 'unsafe-inline'; base-uri 'none'; form-action
  'none'`.
- Every run ends with a privacy/security self-audit (exit `3` on
  failure) covering forbidden answer/feedback keys, raw source markup,
  absolute paths, unsafe filenames, unapproved media, and executable or
  external markup (`index.html` is audited structurally by allowlist).

## Outputs (deterministic, UTF-8, sorted, newline-terminated)

| File | Contents |
| --- | --- |
| `question-review-queue.ndjson` | Sanitized prompt/choices plus provenance per matched question |
| `question-decisions.json` | Blank/preserved human decisions plus retained stale records |
| `image-review-queue.ndjson` | Copied raster images with provenance, dimensions, referrers, blank rights/accessibility/alt-text fields |
| `image-decisions.json` | Blank/preserved human image decisions plus retained stale records |
| `index.html` | Static local review page (no scripts, no externals) |
| `images/<sha256>.<ext>` | Validated deduplicated raster copies only |
| `review-pack-summary.json` | Input hashes, selected/emitted/skipped counts with reasons, caps, duplicate counts, preserved/new/stale decision counts, output file hashes, limitations, private-runtime warning |

## Verification

```bash
python3 scripts/test-build-math-source-review-pack.py
```

The synthetic suite (temporary ZIPs and registry fixtures only; no real
sources) covers topic selection and Math 20/30 exclusion, exact matching
and hash-mismatch rejection, answer/feedback-leakage exclusion, XSS
escaping, unsafe ZIP names, magic-byte/hash validation, SVG/PDF
exclusion, deduplication, determinism, caps and skip reasons, decision
preservation and overwrite, absolute-path exclusion, and tracked-output
refusal.

## Limitations

- Human classification, rights clearance, accessibility acceptance, and
  any reuse/learner approval all happen outside this tool.
- Records without an exact identity-plus-hash match are skipped; skipped
  counts and reasons are reported in `review-pack-summary.json`.
- Image dimensions are reported only when the standard-library parsers
  can derive them (PNG/GIF reliably; JPEG only when a start-of-frame
  segment is present).
- Outputs are private runtime evidence until reviewed; keep them out of
  version control.
