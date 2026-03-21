# Handoff

- Project: repo-wide
- Task: Tighten clarification-rule precedence so prompt completeness is authoritative and retrieval rules are subordinate
- Status: complete

## Files changed
- /Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/canvas-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/.cursor/rules/default-mode.mdc
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/workflows/prompt-contract.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ARCHIVED_HANDOFFS.md
- /Users/deanguedo/Documents/GitHub/canvas-helper/docs/ops/ACTIVE_HANDOFF.md

## What changed
- Added `Clarification Precedence` to `AGENTS.md` and made clarification policy explicitly authoritative.
- Tightened `Surgical Default Rules` so additional targeted reads inside approved boundaries do not trigger extra questions.
- Added mode-overlay deference lines in `CANVAS` and `DEFAULT` files so overlays tune ambiguity threshold but do not override clarification policy.
- Added prompt-contract precedence note: clarification rule takes priority over read-discipline heuristics inside declared boundaries.

## Why this changed
- To remove residual collision between clarification and surgical-retrieval rules that could still cause unnecessary hesitation.

## Source of truth
- Clarification authority and precedence: `AGENTS.md`
- Mode clarification overlays: `.cursor/rules/canvas-mode.mdc` and `.cursor/rules/default-mode.mdc`
- Prompt-layer clarification precedence: `docs/workflows/prompt-contract.md`

## Fragile areas / watchouts
- This is rule-layer tightening, not runtime enforcement code.
- Behavioral quality still depends on prompt completeness and consistent rule interpretation.

## Next prompt should assume
- If prompt contract fields are complete and non-conflicting, execute without clarification.
- Ask exactly one clarification question only when constraints conflict or the task would cross declared boundaries/source-of-truth constraints.

## What still needs validation
- Behavioral validation on 3 real tasks (`conversion`, `generated-course`, `injection/integration`) to confirm reduced unnecessary questioning.

## Known risks
- This is a rule-layer tightening, not runtime enforcement code.
- Best follow-up is behavioral validation on 3 real tasks (`conversion`, `generated-course`, `injection/integration`) to confirm question frequency drops as intended.

## Exact next command
`rg -n "Clarification Policy|Clarification Precedence|Surgical Default Rules|Clarification Behavior|Clarification Rule" AGENTS.md .cursor/rules/canvas-mode.mdc .cursor/rules/default-mode.mdc docs/workflows/prompt-contract.md`

## Exact next file to open
`/Users/deanguedo/Documents/GitHub/canvas-helper/AGENTS.md`

## Do not do next / warnings
- Do not add parallel clarification logic in unrelated docs that conflicts with these source-of-truth files.
