# Brightspace CSV Notes

Brightspace CSV is the primary deployment artifact for V1.

## Implemented Mapping

- `NewQuestion` uses Brightspace type codes `WR`, `SA`, `M`, `MC`, `TF`, `MS`, `O`
- `Title` carries the canonical `questionId` for traceability
- `Points` carries canonical point values directly
- `QuestionText` exports `stemRichText` when present, otherwise `prompt`
- `multiple_choice` uses `Option,100|0,text`
- `true_false` uses `TRUE,100|0` and `FALSE,100|0`
- `multi_select` uses `Scoring,All or nothing` plus `Option,1|0,text`
- `short_answer` uses one `Answer,100,text` row per accepted answer
- `matching` uses `Scoring,All or nothing`, `Choice,index,text`, and `Match,association,text`
- `ordering` uses `Scoring,All or nothing` and one `Item,text` row per ordered element

## Current Limits

- section structure is not represented in Brightspace CSV
- feedback, explanation, export notes, and internal source metadata are not exported
- scoring mode is fixed to `All or nothing` for `multi_select`, `matching`, and `ordering` until the canonical schema models scoring strategy explicitly
