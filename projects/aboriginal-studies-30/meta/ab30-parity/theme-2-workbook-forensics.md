# T14 Theme 2 workbook forensics (read-only; D2L export in Downloads, never committed)

Source file: `Content/ABS30 Workbook Theme 2 - Aboriginal Land Claims.docx` (1,830,516 bytes, 08-24-2020)
inside `D2LExport_59777_21-22 _ S2 _ Aboriginal Studies 30 _ Per 1(A) _ Se_202692254.zip`.
Extraction: docx word/document.xml paragraph text, 608 paras, 381 non-empty. Para index = extraction order.

## Copy identity (contamination warnings)

- The copy is PERSONALIZED: para 0 `Name: Daniel Petherick`, para 1 `Date Due: 25th October 2019`.
- STUDENT ANSWERS ARE INTERLEAVED with prompts (typos + factual errors prove authorship):
  para 140 (stewardship answer, "no take advantage"), 175, 190, 195, 198, 202, 206, 213, 218
  ("then the Calder case was introduced" — wrong), 256, 275-277, 280-283, 291-299, 303-309,
  313, 318, 336-340, 353-354, 360-364, 376, 384, 411 (Manitoba Act answer, garbled),
  442 ("live on a reverse"), 444, 454, 458, 463, 531.
- CONSEQUENCE: prompt wording is recoverable; NO answer text is usable; the name must never be committed.
  The committed fixture holds 91 prompt-only paras (see `scripts/tests/fixtures/ab30-parity/theme2-workbook-prompts.txt`).

## Workbook structure (section-local numbering — NOT booklet Q1-28)

- Oral-tradition/stewardship opener with UAlberta excerpts + video links; unnumbered stewardship question (para 137).
- "Value of the Land" (para 143): six categorical beliefs (Cultural/Spiritual/Economic/Educational/Social/Political, paras 159-167) + 10-mark describe task (para 157). LIKELY booklet-Q2 analogue ("six values").
- Textbook-gated question runs with RESTARTING numbers: Q2-Q10 (paras 173-254, pp.111-121), unnumbered + Q2-Q6 (paras 273-316, pp.122-134), Nisga'a tasks (paras 334-358, speech pp.108-110), Metis tasks (paras 374-384, pp.135-142), James Bay/AIP/Yukon tasks (paras 453-463, pp.143-145), agreement-impact task (para 529).
- NO critical-response tasks anywhere in the workbook (both booklet CRs lack analogues).
- NO global Q1-28 sequence; NO Q22-style dated-entries table (James Bay/AIP paras are the nearest dated-claim content).
- Completion checklist (paras 575-606): 2.0 Short Answer /72 (25%), 2.1 /10 (20%), 2.2 /16 (20%), 2.3 /36 (35%).

## Assignment version divergence (workbook vs current course records)

- Workbook 2.1 = "The 1870 Manitoba Act in terms of Metis land rights" /10 (paras 388-411) with 7/1/2 criteria.
  Current 2.1 = "Land Stewardship" (paragraph + criteria). DIFFERENT TASKS — not adopted.
- Workbook 2.2 = "Views Toward Metis Land Rights" /16 (paras 413-444) with 12/2/2 criteria. DIFFERENT TASK — not adopted.
- Workbook 2.3 = "Research project: Specific Land Claims" /36 (paras 536-560): research TWO Alberta claims from a
  listed set (Lubicon Lake Cree, Woodland Cree, Loon River, Nakoda/Stoney, Siksika/Blackfoot, Blood-Cardston,
  Peigan Nation) with REQUIRED elements (paras 548-552): main events/issues; settled if/how/when/why-not;
  timeline; benefits; digital platform, ≤12 slides.
- Current 2.1 prompt sentence == workbook para 137 VERBATIM (proven by XW03): the stewardship DISCUSSION question
  was promoted to the 2.1 assignment prompt. Booklet 2.1 wording/mode still unconfirmed.
- Current 2.2 mirrors workbook-2.3 elements 548-552 but DEMOTED to "may include" + paragraph/criteria mode.
  Suggestion-vs-requirement distinction preserved in the record; teacher must confirm against the booklet.
- Current 2.2's "listed in your module booklet" antecedent points at the missing booklet (XW03 pins the citation).

## Textbook references observed (workbook reading gates)

pp.111-117 (values), pp.118-121 (land-claim history), pp.122-134 (claim types/process), speech pp.108-110 (Nisga'a),
pp.135-142 (Metis/non-status), pp.143-145 (modern agreements). Current 2.1's Ch.1 pp.2-3 ref appears NOWHERE
in the workbook — justification still owed (teacher decision; T03 E-log).

## What T14 did NOT do

No booklet wording adopted (none available); no lesson-home mapping inferred; no learner-surface wiring;
no 2.1/2.2 record edits. All 32 required items sit in `theme-2-crosswalk.json` with disposition `blocked`.
