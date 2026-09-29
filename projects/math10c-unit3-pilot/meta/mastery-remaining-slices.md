# Chapter 3 remaining mastery slices — local build evidence

Lessons 3.4, 3.5, 3.7 and 3.8 use canonical fixed-index banks in `workspace/assets/mastery-{34,35,37,38}.js`. Each has 120 independent verification tasks and 120 changed-form tasks. A task's original problem, actual entered fields, checked result, support status, checker version and selection state are retained behind its receipts. The bank indexes are saved-state identifiers and must not be reordered without a migration. Executable regressions freeze their respective bank hashes; focused Studio-preview browser checks reached transfer for all four targets in each lesson and restored selected work after reload.

Examples of retained problem and working (human-readable excerpts; the exact saved field keys remain in the canonical banks):

| Lesson | Original problem retained | Working retained |
| --- | --- | --- |
| 3.4 | Model `(x+2)(x+3)`; read a second model's cells `x², 2x, 4x, 8` | Four first-model cells `x², 3x, 2x, 6`; second total `x²+6x+8`; sides `(x+4)(x+2)`; cross equality `3x+2x=5x` |
| 3.5 | Factor `2(x²−16x+64)`; separately classify proposed `5(x−6)(x−3)` for `5(x²−9x+18)` | Signed pair `−8,−8`, sum `−16`, product `64`, inner factors `(x−8)(x−8)`, whole GCF `2`, complete product `2(x−8)(x−8)`; separate proposal expands to `5x²−45x+90` |
| 3.7 | Multiply `(x+2)(x+3)` and `(x+2y)(x+3y)`; rectangle at `x=2 cm` | Ordered partial products `x²,3x,2x,6`, simplified `x²+5x+6`, two-variable result `x²+5xy+6y²`, area `20 cm²`, numeric side-length equality |
| 3.8 | Square `(x+2)²`; factor `x²+6x+9`, `x²−4`, and `2x²−8` | Expansion `x²+4x+4`, middle coefficient `4`, repeated factor `(x+3)²`, difference factors `(x−2)(x+2)`, whole GCF `2`, complete product `2(x−2)(x+2)` and expansion `2x²−8` |

A corrected 3.6 example retains the first submitted whole GCF `2` for `2x²+7x+3`, the final whole GCF `1` and complete factorization `(2x+1)(x+3)`, the checked error, and the fact that focused repair was opened. A correct second check after that repair earns 50% **practice credit** and no independent-mastery stage; a different fresh task is offered next. The report view shows both first and final field values rather than silently replacing the first attempt.

Every authored bank item and wrong-component contract is exercised in `scripts/tests/math10c-unit3-mastery34.test.ts`, `math10c-unit3-mastery35.test.ts`, and `math10c-unit3-mastery37-38.test.ts`. Under the current policy, a corrected or supported authored task earns practice credit but does not establish independent mastery. Checks two through four reduce practice credit to 75%, 50%, then 25%; a mathematical hint lowers it one more step, to a 25% floor. A different fresh unaided first-check task is required for independent evidence. Failed admission or saving leaves an open draft and makes no recorded-evidence claim. The complete 32-target modeled path and storage envelope are checked in `scripts/tests/math10c-unit3-full-path-capacity.test.ts` and `meta/mastery-capacity-report.json`.

These local checks do not replace real elapsed 48-hour retention, broader learner-flow and accessibility review, teacher acceptance, or Brightspace save/resume.
