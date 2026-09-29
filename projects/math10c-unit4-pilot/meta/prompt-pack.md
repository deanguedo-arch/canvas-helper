# Math 10C Chapter 4 prompt pack

## Status and ownership

- Status: blocked instructional review candidate.
- Canonical learner source: `projects/math10c-unit4-pilot/workspace/`.
- Source contract: `projects/resources/math10c-production/v1/chapter4/production-contract.json`.
- Source hashes and roles: `projects/resources/math10c-production/v1/source-manifest.json`.
- Studio editing and every export target remain disabled.
- Reusable generation contract: `scripts/lib/math-course-generation/contract.json`.
- This chapter's generation invocation: `projects/math10c-unit4-pilot/meta/math-generation.json`.
- Required gate: `npm run validate:math-course-generation -- --project math10c-unit4-pilot`.

## Instructional contract

The chapter has eight lessons and 32 unique targets. It moves from roots and real-number classification through radical forms, exponent laws, combined application and changed-context transfer. Use the Chapter 3 course for presentation and evidence architecture only. Do not reuse factoring mathematics, task IDs, bank indices, saved-state namespaces or correctness contracts.

Each target eventually needs a reviewed route through:

1. fresh independent evidence;
2. different reasoning or transfer evidence; and
3. a later-session fresh check after at least 48 hours.

Practice credit is separate from mastery. Correct checks one through four may earn 100%, 75%, 50% or 25% practice credit. Mathematical help reduces that task credit one additional step with a 25% floor. Only a fresh, fully correct first mathematical check without prior mathematical help can establish independent success. Supported or corrected work must route to a different fresh demonstration.

## Mathematical boundaries

- Normalize harmless spacing and equivalent expression order without erasing domain restrictions.
- Treat negative exponents as reciprocals, not negative values.
- Keep original nonzero restrictions even when simplification removes a visible denominator.
- Distinguish even-root restrictions from valid odd roots of negative values over the reals.
- Require units and reasonableness where a root changes square or cubic measure to a linear measure.
- Do not accept final-answer equivalence as reasoning or transfer evidence by itself.

## Source boundaries

Use CBE System teaching sequence and shared textbook concepts as the main instructional evidence, with NXT Master as an independent organization check. The current class export is comparison-only. Formal exams, quiz sheets, practice exams, answer keys, live course identifiers, student submissions and EOL workflows are excluded from authored questions. Optional textbook activities stay outside automated mastery.

## Current review candidate

The workspace now implements the complete eight-lesson review model. Each lesson includes direct instruction, guided practice, a second worked example, misconception repair and a checked mastery workshop. Practice and Review includes 64 authored lesson questions, mixed practice, error detective and a 16-question review. The tool set includes a movable reference sheet, radical-form lab, exponent-law lab, vocabulary, library/resource routing, worked support and All My Work.

Every lesson has seven stable task identities: initial, fresh, fresh2, transfer, transfer2, retention and retention2. Wrong filled fields receive specific diagnosis; blanks do not consume a mathematical check. Four-check practice credit remains separate from the 0/25/50/75/100 mastery stages. One fresh unaided verification establishes 25; consistency across two explicit variation categories establishes 50; paired transfer and reasoning evidence establishes 75; and distinct later-session evidence establishes 100. Supported or corrected success routes to unused mathematics. Retention remains locked to a different browser session at least 48 hours after transfer. First and final working, check count and support provenance are retained.

The corrected candidate uses state version 4, policy `c4-mastery-policy-3` and target contract `c4-target-evidence-3`. Earlier target scores are retained as labelled historical results and require fresh demonstration unless their saved component, independence, variation and freshness provenance verifies under the current policy. The regenerated exact review package passed local save/resume and measured the complete real path at 50,112/52,000 application characters and 19,676/60,000 packed SCORM characters.

The project remains blocked. Teacher review, learner acceptance, a real elapsed two-day retention attempt, screen-reader/zoom/print review and live Brightspace launch/close/reopen are pending. Device time is not a trusted server clock, and local SCORM simulation is not live LMS certification.
