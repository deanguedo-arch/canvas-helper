# Chapter 3 fixture draft audit, 2026-09-22

Neither Muse draft is accepted as a learner-facing question bank or as mastery evidence. The canonical course does not load either file.

## Isolated runs

| Run | Result | Lead decision |
| --- | --- | --- |
| `20260922T205451Z-math10c-bank-fixture-draft-3787cd6e` | JSON parsed: 112 items, 28 IDs, four roles per ID; 9 provider calls | Rejected. Several IDs assess the wrong skill: 31a asks GCF, 31b LCM, 31c prime factorization, 31d missing-factor/multiple work; similar drift occurs in 33c/d, 34, 35 and 38. |
| `20260922T210406Z-math10c-bank-fixture-draft-e9ba3ff3` | JSON parsed: 112 items, four per 28 IDs; 13 provider calls | Retained only as an isolated draft. Target prompts are materially closer, but records omit the required explicit role and variation fields. Many target groups have four near-identical task forms and no distinct changed-form transfer. The answer prose is not a bounded checking rubric. |

The second draft cannot be promoted by assigning roles from its `-01` to `-04` display suffixes: for example, the first two square-root items are both bare exact roots, the first two root-estimation items are both square roots, and the first two dimensions items are both square-area contexts. A display number is not mathematical variation. The 3.3 verification draft also mislabels a claimed `15x` term as a constant; the 3.4 model drafts need an explicit region layout and row/column convention before checking. These issues require authored correction, not a mechanical import.

Both worktrees are at base commit `02a9fadc9148bf26c0c93006560375a9c5c6b4ee`, with one changed file inside the exact `tasks/math10c-mastery-bank-fixtures/fixtures.json` allowlist. The source checkout's Math files were not changed by Muse. The launcher reported confirmed worker shutdown and no quota wall. Only the lead's 3.6 scoring fixes were applied to canonical course files.

## Integration gate

For each target, author two distinct constructed independent checks, a genuinely changed-form task with a bounded pivotal relationship, and a later-session task. The target-specific checker must preserve a valid alternative as ungraded for teacher review rather than manufacture correctness. Keep a compact source identity and the actual submitted work behind any credited receipt; use the existing evaluator's 48-hour later-session rule. Do not credit the optional textbook SCORM activities, a revealed solution, a repeated mathematical instance, or a draft fixture merely because its answer string matches.

Before enabling any of the 28 targets, run an independent mathematical bank review, a focused scorer/state regression, and a complete realistic learner-history save-envelope fixture including other course work. The current 32-target matrix remains the canonical coverage status.
