# CALM Style C asset review

## Recommendation

Keep this collection as a useful authoring candidate. Its information hierarchy, restrained palette, worked-case specificity and explanations of important limits are generally strong. Several images communicate relationships more clearly than another paragraph would. Do not insert the complete collection automatically: select the appropriate panels, reconcile adjacent prose, and resolve the format and presentation differences first.

This is an independent audit of the supplied ZIP, not approval of course integration. No canonical course files or supplied artwork were changed.

## What was inspected

- Safely extracted the ZIP without executing its contents. Inspected all 61 raster pieces in labelled overview sheets; inspected the fixed/variable-rate asset at full size and six difficult examples at 360-pixel display width. The overview review is not a full-resolution transcription of every label.
- Read START_HERE, compression notes, complete manifest, placement map, selected source-fact/QA records and the prior visual specification. The package's own Pass statements were treated as claims, not independent proof.
- Verified hashes of all files enumerated in the 38 new-lesson records, plus the three retained-image entries. No missing files or hash mismatches were found in those entries.
- Confirmed 40 unique placement-map lessons, 38 new-lesson records, existence of all supplied placement anchors in the canonical course, and introductory copy, captions, alt text and long text equivalents in every new-lesson record.
- Compared selected source details directly with the canonical manuscript, including the school pathway, database/local-search scopes, device loaner, feedback example and fixed/variable schedules. Read the other rendered examples against the original audit briefs. Checked conspicuous monetary examples and distinctions; did not independently rederive every financial schedule or certify legal accuracy.
- Canonical index SHA256 remains `7c16a7b2ba8325d502edf7e15afa6565f72f92e44df30814329c8e5488e7d2c2`, matching the visual-audit source snapshot.

Input: `CALM_Style_C_ALL_IN_ONE.zip`; SHA256 `840cc4dd3a6491c2e3c0e76cf9e7e49498494050e9c275c3de4efe601617a011`.

## Delivery completeness

The supplied package accounts for all 40 lessons: 38 primary new visuals, 20 mobile or companion pieces, and three copies of retained artwork. It contains 59 JPEGs, two PNGs and two SVGs. The editable SVGs are the desktop and mobile cash-flow charts for FL1-03. Most of the remaining work is flattened raster art.

The JPEGs are convenience copies; the package identifies separately delivered PNG masters that are not included here. The manifest contains original-master hashes, but that does not establish equality with absent files. Lossless PNG masters would improve archival and production handling; they would still not provide editable text and geometry. Keep the canonical original PNGs for the three retained visuals instead of replacing them with JPEG copies.

## Strong teaching examples

| Example | What works |
|---|---|
| CE1-01 poster | The before/after hierarchy visibly changes while the information stays the same. The conclusion is bounded to the supplied school experience. |
| CE1-03 route costs | Four travel payments make the recurring cost explicit, and the remainder is qualified as after listed costs. |
| CE1-04 information scopes | Employment, forecast metadata and local advertisements remain separate. No misleading shared quantitative scale. |
| CO1-04 printer response | Actual history is clearly distinguished from the proposed next-time process. |
| CO2-03 missing guard | Reporting and protective action do not turn into inspection clearance. |
| FL1-01 pay stub | Current pay and year-to-date totals remain separate, including the explicit warning against subtracting cumulative deductions from one pay period. |
| FL1-03 cash flow | Step graphs show the original shortage and the benefit of confirmed timing changes. Tables and exact editable charts are supplied. |
| FL2-04 repayment | Both minimums are paid before directing the extra amount; alternatives use the same budget. |
| FL3-03 account and holding | Nested arrangements explain the account/holding distinction; case eligibility is not presented as a universal entitlement. |
| FL3-04 purchasing power | The same basket and changing balance make the purchasing-power problem visible. |
| FL4-03 account recovery | Different line treatments distinguish recovery authority from password reuse. |
| FL4-04 pricing | Store fees and GST are separated; the graphic avoids making the legal outcome a certainty. |

No confirmed arithmetic defect emerged from the displayed examples checked. This is narrower than certifying every figure, generated label, source record or calculation in the complete collection.

## Changes and decisions before integration

### 1 Choose whether Style C is an intentional illustration style

The green/teal/amber palette and clean background fit the course reasonably well. However, prominent editorial serif headings differ from the course's Hanken Grotesk headings and Work Sans body text. Some panels also use subtle gradient fills. This is a distinct illustration style, not an exact implementation of the supplied typography/flat-fill specification.

The serif treatment can work if deliberately approved for figures. Alternatively, retain the layouts and replace headings with the course font in editable artwork. Do not quietly change the whole course to match the generated assets.

### 2 Recover editable originals where accuracy and revision matter

Only the cash-flow lesson includes SVG sources. The prompt requested editable words, amounts and relationships for technical diagrams. Raster images cannot provide the same routine editing or text-selection behaviour. Source facts and text equivalents help, but do not make the artwork editable.

Prioritize editable reconstruction of quantitative charts, the school pathway and account diagrams. Retrieve PNG masters for final raster illustrations if available. Do not interpret the package's original-master references as delivered editable files.

### 3 Restore the visual relationships that became lists

Several deliverables are polished illustrated summaries rather than the requested visual methods. They remain useful, but leave some teaching potential unused:

| Lesson | Useful refinement |
|---|---|
| FL2-03 payment schedule | Add an accurately proportioned payment bar separating $10 interest and $78.85 principal. Keep the existing carry-forward link. Current amounts are clear, but the payment is not visually split. |
| FL1-05 phone bill | Add a month-by-month transition or simple bill graph with the $45 limit. Current panels show the arithmetic but do not spatially show the change at month four. |
| FL2-05 loaner | Add aligned loaner, saving, course and repayment timelines. Rewrite the terse “Course start → after deposit 4” label as “Loaner covers course start through deposit 4” to remove ambiguity. |
| FL2-06 rates | Add a payment comparison against the $223 line. The supplied categorical cards are accurate, but neither their size nor the arrow shows how narrow the monthly margins are. |
| FL2-07 mortgage | Consider a continuous 25-year timeline with the first five years highlighted. The numbered grid works as a counting aid but is less direct about term versus amortization. |
| CE1-07 weekly plan | A compact weekly grid would make simultaneous conflicts easier to see than separate day lists. The existing day lists still explain the revision well. |

These are targeted refinements, not grounds for regenerating the whole set.

### 4 Use mobile variants intentionally

At 360 pixels, the desktop school-pathway image and desktop account/holding image have small detailed labels. Their supplied mobile panels should be used at that breakpoint rather than shrinking the desktop artwork. FL2-03's main amounts remain readable, but smaller formulas, carry-forward labels and footnotes are less comfortable; enlarge or divide this asset for mobile.

The single-column feedback graphic is legible in its main flow but is very tall. The mobile cash-flow chart is also long. A mobile-first file is not automatically a short or easily scanned learning experience. Keep the essential text in the page and give dense details a larger view where useful. Native course rendering remains untested.

### 5 Avoid a second full lesson inside each picture

Most assets contain a title, multiple teaching paragraphs or formulas, boxes and caveats. They should not be inserted after identical paragraphs with no reconciliation. Choose the small number of panels that serve the explanation at that point. Keep accessible native text, but write it as an explanation/text equivalent rather than duplicating every title and line twice in the visible flow.

Introduce each figure in teacher language, explain what to notice and reconnect it to the next step. The available introductions, captions and long equivalents make this possible. Repeated giant posters in all 38 lessons would risk slowing the course and making it feel more repetitive.

### 6 Preserve worked-example and answer boundaries

The complete numerical answers and recommendations belong with their worked cases. Place them at the recorded anchors after checking surrounding wording. Do not move them into opening sections merely because they are attractive. Keep independent-task answers and unrevealed practice models separate. The placement anchors exist; this audit did not test actual insertion or student progression.

## Next practical step

Prepare a review of five figures in their real lesson context: FL1-01 pay stub, FL1-03 cash flow, FL2-03 payment split, FL3-03 account/holding, and CE1-05 pathway. Show desktop and mobile versions with the existing surrounding teaching. Decide the serif-figure style once, then refine only the assets whose learning purpose or readability needs it.

This review did not modify or deploy the course, certify LMS accessibility, inspect absent PNG masters, or independently verify the package author's complete QA history. Live-course presentation, reading order, text alternatives and answer-boundary behaviour remain integration checks.
