# CALM Module 3 Design

## Goal
Build `calmmodule3` from the `projects/_incoming/calm 3` workbook sources without relying on a prebuilt Canvas/Gemini HTML export, while still using the repo's import/analyze/refs pipeline.

## Source Reality
- The incoming bundle contains only:
  - `CALM Module 3 - Career and Life Choices.docx`
  - `CALM Module 3 - Career and Life Choices.pdf`
- The current importer can only scaffold from `html` or `txt` site files.
- The repo already has the extraction dependencies needed for doc-first intake (`mammoth` and `pdf-parse`).

## Product Direction
`calmmodule3` should be a planner-first sibling to `calmmodule2`.

That means:
- Keep the same overall family of polished rounded educational UI.
- Shift the tone from consumer/budgeting energy to future-planning and decision-making.
- Use interaction where it helps organize thinking, not as decoration.
- Preserve the workbook prompts, but translate them into a guided digital flow instead of a page-for-page worksheet clone.

## Module Shape
1. `Start Here`
2. `Oh, The Places You'll Go`
3. `Attitude And Learning`
4. `Life After High School`
5. `SMART Goals Studio`
6. `Decision Making`
7. `Transferable Skills`
8. `Jobs, Occupations, And Careers`
9. `Job Search Readiness`
10. `Review & Export`

## System Path
Use a hybrid build path:
- upgrade `import` to accept a doc/pdf-only source bundle
- scaffold a starter project from extracted workbook text
- import `projects/_incoming/calm 3` as `calmmodule3`
- build the first workspace from that project shell
- run `refs` and `analyze` so the new module enters the learning pipeline normally

## Success Criteria
- `npm run import -- "projects/_incoming/calm 3" --slug calmmodule3` succeeds.
- `calmmodule3` is generated as a real project with references indexed from the source docs.
- The workspace is an original planner-style module, not a plain document dump.
- `analyze`, `refs`, and `verify` complete on the new project.
