# START HERE: Biology30 CH13 lessons06–13 integration handoff

Prepared 8 October 2026. This bundle preserves four original reviewed candidate packages byte-for-byte. It contains no integrated course, executable installer or new authorization to consume Codex usage.

## 1. Ownership and approval gate, before any course write

Intended manual destination: the user's existing Codex thread 01a0a190-4f8c-74e1-9615-c2db6fa99328.

The previous local task 01a11b75-f675-75fe-aec0-8c0eba20600a stalled during Library download but was still reported inProgress, and the user's Stop attempt failed. Do not interpret the stall or failed Stop as proof that the task ended. Verify that no other active writer owns this course before writing. If ownership cannot be verified, wait and resolve it with the user. Never run parallel writers or restart that task as a side effect of this handoff.

Before starting or resuming work that consumes the user's Codex usage, explain the exact proposed scope, why direct Scout tools are insufficient, the recommended model and reasoning level, and the usage tradeoff; obtain explicit approval for those settings. The handoff itself does not grant that approval or select model settings.

## 2. Baseline and dependency checks

The last verified integrated base is v0.2.1 with lessons01–05 and five reviewed teaching images. Lessons06–13 are completed direct-content candidates, not verified local integrations. Reinspect the actual current course; do not assume this historical baseline is still its latest state.

Unpack each nested archive into its own directory. Verify its SHA-256 against MASTER_MANIFEST.json / CHECKSUMS.sha256 and verify its own MANIFEST.json and CHECKSUMS.sha256. The master records exact inventory and verified checks at packaging time.

Read each package's README.md, COMPATIBILITY.json, INTEGRATION_MAP.json, SOURCE_AND_CONTINUITY.md, PRACTICE_PREPARATION_MAP.json, OPTIONAL_SOURCE_LIMITS.md and review records. Preserve their source and prerequisite boundaries. The common full candidate provenance hash is 15df5967cc8fe94173c1d5a69ed485f28d52fcdbd292c9b1df62145b9264f9bc; it is not a license to restore an old whole-course snapshot. Before each pair, compare the actual current route hashes with that pair's frozen base hashes. BASE_COMPATIBILITY.json is an unchanged-data convenience aggregation; the original records remain authoritative.

If a route differs, stop that replacement and reconcile the difference against current ownership. If a candidate is already present, verify it and record it rather than applying it twice. Never overwrite newer work or roll back earlier integrations.

## 3. Apply only approved boundaries, in order

1. Lessons06–07: use their named individual teaching/worked blocks. Lesson07 has protected guided work between replacement blocks; never replace a broad contiguous span with the concatenated fragments.
2. Lessons08–09: use their named individual blocks, preserving the final PTH clarification.
3. Lessons10–11: use their named individual blocks.
4. Lessons12–13: use five lesson12 blocks and only three lesson13 teaching blocks. Lesson13's worked example, optional transfer activity, six-selection/two-writing final check, response fields and completion requirements remain unchanged.

Across all pairs, preserve protected assessments, questions, choices, models, criteria, IDs, timers, response/state hooks, navigation, vocabulary controls, original figures, captions and alt text exactly. Preserve the current runtime, scripts, styles and learner storage. Reuse identical reviewed image assets; do not regenerate them. Learner route HTML is inert inspection evidence, not a replacement for the course shell.

Separate repair briefs must remain separately scoped:
- The06–07 package contains REPAIR_REQUIRED_L05.md. This is a pending first-overview-figure explanation repair, not a completed lesson05 change. Under the owner's authorized boundary, accurately explain the direct hGH path and indirect liver/growth-factor path; if figures remain frozen, use adjacent explanation rather than changing the graphic. Keep the growth-plate companion and all assessment/state hooks unchanged. Recheck the actual result separately.
- The10–11 package contains READER_NAVIGATION_REPAIR.md. The original lesson11 reading shortcut says440–441 while the main topic is454–455. The brief proposes a separately authorized band/link-target correction. It is outside the ten content-block replacements. Do not silently modify navigation or infer a successful PDF-reader test from markup.

These exceptions do not authorize unrelated changes. Source PDF and teacher presentation remain unchanged.

## 4. Verify and report honestly

Candidate content reviews passed within their stated local scope. Packaging verifies archive integrity and hashes; it does not add teacher acceptance, canonical activation, runtime, student-trial, unfamiliar-transfer, mobile/print/accessibility or Brightspace evidence. Those checks remain unverified unless actually performed and recorded.

After authorized integration, produce an exact bounded diff, check protected-content and figure/control parity, inspect actual rendered teaching/data/images, exercise vocabulary and figure dialogs, required/guided/optional flows and applicable reader shortcuts on disposable learner state. Verify save/reload and recorded completion separately from answer accuracy. Preserve real learner data. Keep each separately authorized repair and its verification distinct.

Return the actual integrated artifact/version and hash, lesson-by-lesson changes, ownership resolution, base-drift decisions, executed checks with results, and any remaining blockers. Do not call the chapter fully accepted or LMS-ready based only on these content packages.
