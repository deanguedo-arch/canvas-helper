# Candidate reconciliation — Phase 0 intake + Phase 1 diff/classify

## Intake (Phase 0, complete)
- Source: `projects/incoming/AB30_ChatGPT_Edited_Candidate.zip` (172,691,798
  bytes, sha256 `d7bc29b5b3c4d79b5a530fbf23cba4d207bada8e5d6bd20ee62006c7f7911366`),
  copied from the user-supplied `AB30_ChatGPT_Edited_Candidate (1).zip`.
  Scratch: `/tmp/cand/AB30_ChatGPT_Edited_Candidate/` (229 files, 170M).
- Stated base (`DELIVERY_NOTE.txt`): `AB30_ChatGPT_Audit_2026-09-23.zip`.
  Consistent with evidence: no R25/R26 markers anywhere (no AHRDS, Zoe,
  Kusugak, mcPemmican; zero `ab30-v2-l4*`; only contentVersion is
  `v2-exemplar-t10` on L7). One observation, no allegation: the
  candidate's t4-l01 opening phrase parallels R26 L44 prose
  ("opens with a voice, not a definition" + 36-year-war framing).
- Live verification halves claimed in the delivery message (screenshots
  page, verification record, preview command) are NOT in the delivered
  zip — only `DELIVERY_NOTE.txt`, `AUDIT-REQUEST.md`, `OPEN_ME_FIRST.html`.
  Those claims are unverifiable from this package.

## Structure (all first-hand from the bytes)
- Same data envelope (`ABORIGINAL_STUDIES_30_DATA`, 4 units, 50 lessons,
  same lesson ids, retitled lessons), `schemaVersion: 2`.
- Shell is a FULL REWRITE, not a teaching pass: all four frozen files
  differ (main.js 160KB, lesson-components.js 17KB, practice-engine.js
  11KB, styles.css 53KB). Nothing portable as code.
- Lessons: 49/50 v1-schema (`body`/`example`/`check`, zero blocks).
  Only t1-l07 has blocks — using `supportedPractice`, the type the v2
  pattern removed. Their source suite has zero QUOTES/quoteNorm
  references: verbatim verification was abandoned.
- Assigned records: T1 booklet intact (89/89 shared labels byte-identical;
  only `t1-glossary` missing). T2/T3/T4 booklets ABSENT — 103 assigned
  prompts gone (T2:30, T3:46, T4:27); T2–T4 lessons home nothing.
  Assignments: same 12 ids. Quizzes: 0 both sides.
- Practice: vocab-only bank (matching + concept-cards offered;
  selected-response explicitly NOT offered). The 360-item
  source-reasoning bank is abandoned, not integrated. `mixed-review`
  mode id exists; draft/revision language exists in code.

## Take / reject / hold
- TAKE (adapted, verified first): visual tokens/patterns as
  re-implementation reference (freeze-safe only); v1 teaching prose as
  first-pass material for remaining v1 lessons and genuine gaps (every
  adopted sentence through QUOTES first).
- REJECT: all shell JS rewrites (frozen + lead-owned persistence);
  L7 `supportedPractice` (pattern regression); the T2–T4 record deletion
  and t1-glossary deletion (canonical byte-pins win absolutely);
  the vocab-only practice downgrade (canonical bank stands); screenshot/
  verification claims as evidence (absent from package).
- HOLD (needs browser proof): mixed-review fix, review-control fix,
  draft-vs-submitted workflow, mobile/responsive claims, visual
  superiority judgment.

## Next (Phase 2, on this copy, after R27/R28)
Visual tokens → assigned-work reconciliations (none needed: pins intact)
→ teaching gap-fills (verified) → practice wording (never store/export
code). Frozen/persistence takes become lead items, not edits.
