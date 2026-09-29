# R10 record — Theme 1 batch (Lessons 1–3) with full activities

## Implemented
- **L01 Oral Tradition → `ab30-v2-l01.1`**: content/purpose distinction,
  6 source cards (textbook definition, Wisakejak frame, Dan George 1974,
  instruct/guide, four components, court ruling), 4-step worked example,
  organizer, supported selection + repair, component→purpose independent
  task, Assignment 1.1 notes bridge + assignment link, reflection.
- **L02 Nations/Peoples → `ab30-v2-l02.1`**: declaration reading method,
  7 cards (A/B/C/D1/D2/E/F), nation-definitions panel, annotation worked
  example, claim-to-line matching, person/people repair, datedness
  section, D2 independent task, q1–q8 bridge, reflection.
- **L03 Rights → `ab30-v2-l03.1`**: rights map, 8 cards (A/B/C/D/E/S/F/G),
  two M02 panels, term-comparison worked example, inherent-rights choice,
  sovereignty repair, hoarding-application independent task, q9–q15 +
  12-term glossary bridge, reflection.
- **Bank +24**: 6 objective + 2 written per lesson (32 items total),
  distinct stimuli + reasoning families, all reviewed/formative/no-marks;
  in-lesson selections deep-synced to bank items.
- Pattern variation (not clones): L01 story-frame worked + court anchor,
  L02 annotation worked + datedness teaching, L03 dual panels +
  term-relation worked. No shared-component changes — the R09 freeze
  holds untouched (LESSON-FREEZE green).

## Verification
- Before-state rendered + recorded (`evidence/R10/before-state.json` with
  per-lesson hashes).
- All 21 extracts verify verbatim against the new R10 bands
  (`textbook-ch1-pp02-13.txt` incl. p76; `reading-indigenous-worldviews.txt`).
- New batch suite: 10/10. Full battery: 187/188 (only the pre-existing
  lead-owned shell file). Doctor PASS (legacy-snapshot-v1).
- CONTENT01 + VIS05 generalized from the L07 carve-out to v2 detection;
  L7-BANK scoped to its lesson; manifest versions bumped; asset manifest
  regened. q1–q15 + q11 choices byte-pinned (actual first choice: “WWI”).
- 3 lesson reviews at `meta/ab30-v2/lesson-reviews/` (T-06 items, quoted
  passages, media decisions, findings).

## Source findings (workcard corrections)
- L01 workcard proposedTeachingPages [2,3] are the Dene Declaration
  pages — verified wrong; lesson uses the Walking Together reading +
  textbook pp12–13/76 with corrected locators (workcard sourceNote
  anticipates exactly this).
- v1’s Elder-guidance-on-Treaties-6/7/8 claim verifies at textbook p36
  but belongs to treaty lessons — deferred with cause, recorded.
- L03 range [6,13] overlaps L04’s worldview claim; L03 teaches rights on
  pp8–11 only; the pp6–7 stages summary is unassigned-work in Theme 1.
- q5 rows: an early probe printed 3; HEAD, current file, and empty diff
  all say 4 — investigated non-discrepancy, rows:4 pinned by R10-ASSIGNED.

## Limitations / carry to R11
- `teaching/lessons/*.md` + `05_PRACTICE_AND_EVIDENCE_SPEC.md` absent
  from the package; lessons authored from workcards + verified sources,
  bank contract from the L7 specimen + engine.
- Screenshots + live UI/keyboard/zoom/screen-reader proof NOT_RUN
  in-sandbox (frozen pattern; L7 script covers the interaction shape).
- Bank items keep AUTHORED_SPECIMEN_REQUIRES_PRODUCTION_INTEGRATION_REVIEW;
  lead integration review pending; no publish performed.
