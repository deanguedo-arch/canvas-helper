# Math Source Registry

Bounded, privacy-conscious source-registry tooling for the future Canvas
Helper Math course family (Math 10C pilot; Math 20-1 / 30-1 reserved).

The latest hash-bound real-source findings are summarized in
`VERIFIED_SOURCE_SUMMARY.md`. Detailed indexes remain in the ignored runtime
directory because they describe private source archives.

## Exact run command

```bash
python3 scripts/build-math-source-registry.py \
  --source-root <private-directory> \
  --inputs tasks/math-source-registry/SOURCE_INPUTS.json \
  --output-dir <ignored-runtime-directory>
```

- Python standard library only; no network use.
- `<private-directory>` holds the local files named in `SOURCE_INPUTS.json`
  (filename-only records; absolute paths are never recorded or emitted).
- `<ignored-runtime-directory>` receives metadata-only outputs and must stay
  out of version control until reviewed.

Optional inspection bounds (defaults shown):

```bash
  --max-member-bytes 8000000 --max-total-bytes 134217728
```

`--max-total-bytes` is applied separately to each authoritative archive.
Manifest, question-bank, quiz, and HTML entries are inspected before assets
so source relationships survive a later asset-budget cutoff.

Exit codes: `0` all validated and self-audit passed; `1` source validation
failure; `3` output privacy self-audit failure.

## Private-source / runtime boundary

- Source files are read-only inputs: opened for streaming hash checks and
  bounded in-memory ZIP member reads. Archives are never extracted to disk
  and no source file is modified.
- Only the six `authoritative_source_export` ZIPs are parsed as source
  truth, each hash group scanned once (duplicate copies validated, never
  re-scanned). Every other record (planning evidence, audit packages,
  audit instructions, generated candidates) is hash/size-validated and
  listed in the summary but never parsed as source truth.
- Outputs are metadata only: sizes, hashes, CRCs, counts, titles, safe IDs,
  booleans, reference paths, and hostnames. No lesson text, prompts,
  choices, answers, response values, feedback bodies, binaries,
  credentials, or query strings.
- Free-text values found where an identifier is expected are replaced by a
  SHA-256 token. Quiz-embedded questions are indexed alongside the central
  question bank, with their source kind retained.

## Outputs (deterministic, UTF-8, newline-terminated)

| File | Contents |
| --- | --- |
| `registry-summary.json` | Per-file validation, duplicate groups, course/variant matrix, counts, limitations, private-source boundary, self-audit result |
| `course-archives.json` | Archive counts, manifest presence, organization/top-level titles, resource counts, questiondb/quiz counts, HTML encoding counts, text-like/image/PDF/media counts, unsafe-path and case-collision findings, archive/member hashes |
| `content-index.ndjson` | Per HTML/HTM entry: source key, member path, encoding, byte size, SHA-256, word count, safely parsed title, MathML/input/iframe booleans, image refs, external hostnames, topic tags |
| `question-reference-index.ndjson` | Per central-bank or quiz-embedded question/item record: source key, XML member/source kind, safe ident/label/global ID or hash, question type, presentation SHA-256, hasFeedback, hasImage, asset paths, hasResponseKey boolean, topic tags, `assessmentRole: unclassified` |
| `assessment-relations.ndjson` | Quiz/section/itemref IDs with resolved/unresolved reference counts (contents never stored) |
| `asset-index.ndjson` | Per image/PDF/audio/video member: source key, member path, extension/media class, bytes, CRC, SHA-256, stdlib-derived PNG/GIF/JPEG dimensions, referencedBy paths, topic tags, `rightsStatus: unreviewed`, `learnerUseStatus: not-approved` |

Topic tags are evidence labels only (`factoring`,
`right-triangle-trigonometry`, `math20-fixture`, `math30-fixture`,
`unclassified`) inferred from member path, title, and temporary in-memory
visible text. They never imply curriculum approval.

## Limitations

- ZIP path-traversal/absolute, duplicate, or case-colliding member names
  fail archive safety and are excluded from parsing.
- Members beyond the per-member/per-archive inspection bounds keep CRC/size
  metadata only.
- Quiz/item parsing covers `questiondb`-style and quiz/assessment XML
  members; anything else stays inventory-level metadata.
- Formal/practice classification stays `unclassified` until human review.
- 20-1/30-1 entries are architecture fixtures until the Math 10C pilot
  passes; counts describe inventory, never quality or coverage.
- Every run ends with an output self-audit that fails on forbidden
  payload-indicating fields.
