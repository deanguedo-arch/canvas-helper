# CALM Module 2 Teacher Report Print Polish Design

## Goal
Refine the `calmmodule2` teacher report so it reads quickly on paper, prints with stronger contrast, and saves to PDF in a more grading-friendly format.

## Approved Direction
- Keep the current violet/clay personality, but make the print layer less decorative and more professional.
- Add a compact summary near the top so a teacher can scan the student status before reading the full report.
- Replace the stacked budget scenario cards with a cleaner comparison table for faster review.
- Make empty answers render consistently as intentional review states instead of faint blank-looking content.
- Improve print CSS so page breaks, contrast, and spacing behave better in browser print and Save as PDF.

## Scope
- Only the teacher-report HTML generated inside `projects/calmmodule2/workspace/main.jsx`.
- No new dependencies.
- No changes to the interactive module content flow.

## Success Criteria
- The teacher report opens in a new tab and still triggers print.
- The top of the report includes a compact submission summary.
- Budget scenarios render in a compact comparison table.
- Empty answers are visibly styled as `Not answered`.
- Print CSS uses darker text, flatter surfaces, and clearer page handling than the current on-screen-heavy version.
