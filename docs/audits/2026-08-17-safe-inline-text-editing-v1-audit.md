# Independent audit packet — Canvas Studio safe inline text editing V1

- Prepared: August 17, 2026
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Follow-up branch: `codex/studio-inline-text-editing-v1`
- Base: Direct Editing baseline integration [`84221330`](https://github.com/deanguedo-arch/canvas-helper/commit/842213301920798cc1f979c34218e939d4940f61)
- Baseline inline implementation: [`26216b5a`](https://github.com/deanguedo-arch/canvas-helper/commit/26216b5a29a0eb1cfc288061a2d5b25bdc2dffb9)
- Full Preview parity implementation: audit the current exact branch head; `26216b5a` alone predates the Full Preview host caret.
- Requested verdict: **GO**, **GO WITH CONDITIONS**, or **REQUEST CHANGES** for the inline-text follow-up only

## Scope and non-negotiable boundary

This is the intentionally separate follow-up to the merged Direct Editing safety baseline. It provides plain-text in-place editing inside embedded Studio, Full Preview, and Review & Apply through one shared draft controller.

It does **not** make the learner page itself editable. At every stage before Apply:

```text
teacher typing → Studio-owned state and presentation only
Save draft → Studio browser-local draft state only
Apply → the existing protected filesystem write, rebuild, learner render validation, checkpoint, and Undo lifecycle
```

The audit should reject any implementation path that makes the learner element `contenteditable`, changes its subtree/attributes/listeners, forwards teacher keyboard/paste events to it, persists a course asset before Apply, or introduces a second authoritative draft copy.

## What teachers can do in this release

| Surface | Behaviour | Write authority |
| --- | --- | --- |
| Embedded Studio preview | Click an eligible text target and type with a caret directly over its visual location. | None before Apply. The editor is a Studio-owned parent overlay. |
| Review & Apply | Edit the same unsaved or saved draft in the `Course text` field. | None before Apply. |
| Saved draft on another page | Continue editing in Review & Apply; it is marked **Preview unavailable until page opens**. `Jump to location` re-resolves it before display. | None before Apply. |
| Full Preview | Click an eligible text target and type with a caret at that visual location. Its Review & Apply panel edits the same working draft. | None before Apply. The editor is a trusted Studio-host overlay above the isolated learner iframe. |

The initial in-place target set is deliberately narrow:

- `h1`–`h6`, `p`, `li`, and `figcaption`;
- text-only source content, with safe `<br>` line breaks only for paragraphs;
- no links, emphasis, nested markup, controls, custom elements, or runtime-owned nodes.

Rich text, link/image/style editing, runtime controls, simulations, navigation, quizzes, ambiguous generated components, and unsupported legacy surfaces continue through existing panel controls or remain Annotation-only. This release must not be described as literal editing of every visible element in every course.

## Authoritative data flow

### One controller, two editing surfaces

[`app/studio/src/hooks/useCourseEditing.ts`](../../app/studio/src/hooks/useCourseEditing.ts) owns one `CourseEditInlineEditorState` with one durable target, raw and canonical documents, revisions, normalized patch/digest, saved draft ID, availability, drift state, and preview owner. The parent overlay and Review & Apply both dispatch to that controller; neither owns an independent editable copy.

The controller states are:

```text
clean → editing → normalizing → valid → saved
                       ↘ invalid
any authoritative source drift → detached
Apply lifecycle → applying → rejected | saved/clean
```

Typing is immediately reflected in both surfaces. Normalization is debounced for 200 ms, respects IME composition, and uses monotonic revisions/abort signals so stale replies cannot replace newer text. Save and Cmd/Ctrl+Enter cancel the debounce and flush the newest document through normalization before saving; a failed normalization leaves the teacher text visible but unsaved.

### Canonical server normalization

`POST /api/course-edits/normalize` is a bounded, read-only endpoint wired in [`app/server/routes/course-edits.ts`](../../app/server/routes/course-edits.ts) and [`app/server/studio-server.ts`](../../app/server/studio-server.ts). It takes a durable edit identity and:

1. re-resolves the current source target;
2. accepts only [`CourseEditEditorDocument`](../../app/shared/course-editing.ts) plain text;
3. applies the server sanitizer/no-op rules shared with Apply;
4. returns canonical text, patch, patch digest, render-only representation, and current identity;
5. writes no course file, asset, or Studio draft.

[`scripts/lib/course-editing/html.ts`](../../scripts/lib/course-editing/html.ts) defines the bounded plain-text conversion. The normalizer rejects unsafe controls, unsupported source structure, invalid line breaks, overlong text, stale target identity, and no-op patches rather than silently changing the teacher's intent.

### In-place presentation is not learner-DOM mutation

[`app/studio/src/components/CourseInlineTextEditor.tsx`](../../app/studio/src/components/CourseInlineTextEditor.tsx) renders an absolutely positioned Studio-parent layer over the embedded iframe. It uses the broadly supported standard `contenteditable` mode with mandatory plain-text paste/drop/format filtering, keeps heading/list/caption targets single-line, and maps paragraph line breaks to canonical `<br>` only after server normalization.

It receives a bounded geometry and safe presentation snapshot from the already-inspected opaque node. It never receives a learner selector, filesystem path, arbitrary CSS, JavaScript, or teacher event stream for the learner frame.

The visual owner is always exactly one of:

```ts
type CourseEditPreviewOwner = "parent-inline" | "standalone-inline" | "child-inert" | "none";
```

- Active embedded caret: `parent-inline` owns presentation.
- Active Full Preview caret: `standalone-inline` owns presentation in the trusted Studio host, above the isolated learner iframe.
- Panel edit or saved-draft display: `child-inert` owns the existing inert learner-frame overlay.
- Off-page or detached draft: `none`.

The previous owner is cleared before the next one is shown. Embedded, Full Preview, and child overlays are never intentionally stacked. Screenshots and Review Set capture are blocked while either unapplied interactive caret editor is active.

## Saved drafts and source drift

Clicking **Edit in Review & Apply** on a saved draft calls the existing durable read-only reopen path, discards its obsolete stored node ID, and starts the same controller. It does not edit a saved draft by trusting a historical DOM node.

When a current source check detects drift, Studio immediately aborts normalization, clears visual presentation, preserves the proposed teacher text in a detached buffer, and disables authoritative preview, Save, and Apply. It offers only the safe recovery actions:

```text
Source changed externally

Your proposed text has been preserved.
Reload and re-resolve this target before saving or applying.

[Reopen against current source] [Copy text] [Discard]
```

If the durable target still exists unchanged, reopening reattaches it. If its text changed, the draft remains detached until the teacher explicitly chooses **Rebase**. Missing, ambiguous, runtime-owned, and unsupported targets remain copy/discard only. There is deliberately no **Keep editing** action after external drift.

## Full Preview editing and bridge ordering

Full Preview supports the same deliberately narrow plain-text target set as embedded Studio. Selecting an eligible target starts a `standalone-inline` lease and places a sanitized standard `contenteditable` field in the trusted Studio-origin Full Preview host at the target's reported geometry. Full Preview's selection keyboard guard exempts only that host field, so typing, Escape, and Cmd/Ctrl+Enter reach it without reaching the learner. The isolated learner iframe remains untouched: it receives no teacher keyboard, input, paste, selector, filesystem path, arbitrary CSS, or script.

The Full Preview Review & Apply controls and the caret dispatch only bounded `input`, `save`, or `cancel` actions with a session ID, monotonic revision, and opaque target ID. Studio reuses its canonical normalizer and the same authoritative working draft; Full Preview never owns a second editable copy. Save remains browser-local, while Apply and Undo continue to call the existing protected Studio lifecycle.

The private bridge in [`app/shared/preview-bridge.ts`](../../app/shared/preview-bridge.ts), [`app/server/preview-bridge-runtime.ts`](../../app/server/preview-bridge-runtime.ts), and [`app/studio/src/hooks/usePreviewScrollSync.ts`](../../app/studio/src/hooks/usePreviewScrollSync.ts) carries only versioned, bounded commands. The standalone host caches validated state until its cross-origin learner iframe establishes its MessageChannel. A startup guard prevents pointer events from reaching the learner until the nested inspection shield confirms the current mode; a bounded retry handles the initial `about:blank` race.

There is exactly one visual owner. Opening Full Preview from an active embedded caret transfers that same durable target to the standalone host as soon as its bridge is ready, so the teacher keeps editing at the same visible text without a second click. Directly selecting eligible text in Full Preview can also acquire the standalone host caret. Switching back, saving, canceling, navigating, drifting, or applying clears that lease before another owner can appear. The existing display command is still seeded to a newly ready standalone surface only: it does **not** replay the same revision into the already-rendered embedded iframe, so a duplicate cannot clear a valid presentation.

## Evidence at the baseline and current local Full Preview parity state

The first two rows below are retained baseline evidence from `26216b5a`. The remaining rows are current local evidence for the Full Preview parity change and must be rerun by an independent auditor at the exact committed head:

| Check | Result |
| --- | --- |
| `npm run test:course-editing` | baseline: 51/51 passed; current local parity run passed |
| `npm run test:studio-release` | earlier transfer baseline passed at clean commit `c7551075386941886ad7c4dea302b3e10f388ba7`; rerun at the exact keyboard-fix commit before treating this row as current evidence. |
| `E2E_STUDIO_PORT=49391 npx playwright test -c e2e/playwright.release.config.ts --grep "inline edits stay above|opening Full Preview transfers"` | passed locally; uses real keyboard input in both direct caret surfaces, exercises active-caret transfer, and proves learner isolation |
| `npm run test:studio-inspection` | current local parity run passed |
| `npm run verify:typecheck-baseline` | current local parity run passed; no changed-file diagnostic |
| raw `npm run typecheck -- --pretty false` | expected exit `2` with exactly ten established unrelated diagnostics |
| `git diff --check` | current local parity run passed |

The new Playwright coverage proves, among other things:

- parent overlay typing synchronizes to Review & Apply;
- the original learner heading and source remain unchanged before Apply;
- learner `keydown`, `input`, and `paste` handlers are not invoked;
- browser storage remains unchanged before Apply;
- saved drafts can be reopened and edited from Review & Apply;
- the embedded child overlay, embedded caret overlay, and Full Preview host caret hand off without overlap;
- Full Preview typing leaves its learner heading, event handlers, browser storage, and course source unchanged before Save/Apply;
- Apply then Undo uses the inherited protected lifecycle;
- external source drift detaches the proposed text and requires explicit rebase.

## Publication and hosted-CI status

The follow-up branch is published, but this repository intentionally limits the existing **Studio Direct Editing release gate** push trigger to `codex/studio-direct-editing-v1`. A push of this separate follow-up branch therefore creates no hosted run by itself. The current zero-run result is expected from the checked-in workflow policy, not a green CI claim.

An authorized pull request will trigger the Studio Direct Editing release gate because that workflow accepts all pull-request contexts. Do not create that pull request or claim its results without repository-owner authorization. The New Course Studio Readiness workflow has narrower changed-path filters and is not the acceptance authority for this Studio-only follow-up unless a future change touches its governed inputs.

Before issuing a final hosted-CI verdict, confirm the branch head and run status explicitly:

```bash
git ls-remote --heads origin refs/heads/codex/studio-inline-text-editing-v1
gh run list --branch codex/studio-inline-text-editing-v1 --limit 10
```

## Auditor checklist

Audit this change as a follow-up from the exact published branch head, not from an arbitrary local checkout:

```bash
git fetch origin --prune
git checkout codex/studio-inline-text-editing-v1
git rev-parse HEAD
git diff --check 842213301920798cc1f979c34218e939d4940f61...HEAD
npm ci
npx playwright install chromium
npm run test:course-editing
npm run verify:typecheck-baseline
npm run typecheck -- --pretty false
npm run test:studio-release
E2E_STUDIO_PORT=49387 npx playwright test -c e2e/playwright.release.config.ts --grep "inline edits stay above" --repeat-each=6
```

Review these questions directly in code:

1. Does every pre-Apply path stop at browser-local drafts and presentation, including Save and image-related work?
2. Does Normalize re-resolve durable identity and use server canonicalization rather than trusting browser HTML?
3. Can a stale normalizer reply, duplicate bridge command, source drift, navigation, or Full Preview connection mutate or clear a newer authoritative draft?
4. Is the learner iframe independent of teacher keyboard/paste events and original subtree changes before Apply?
5. Can a saved draft reopen without a stored node ID and recover safely when its target changed?
6. Does Full Preview use only the trusted host caret and the same controller, never a learner-frame caret or a second draft state?
7. Do the documentation and user-facing claims stay within the narrow supported element set?

## Claims intentionally not made

- This is not a claim that every legacy course or every visible element is editable in real time.
- This is not direct `contenteditable` editing of the learner page; Full Preview's caret lives only in its trusted host layer.
- This is not a complete WCAG audit, Brightspace/deployed-host acceptance, delayed-interaction proof, cross-browser SCORM proof, or teacher-rollout evidence.
- The existing filesystem lock remains a cooperative Studio-writer protocol. Codex, Git, manual editing, and standalone builders must not touch the same course while Apply is running.

## Recommended verdict rubric

Return **REQUEST CHANGES** if any new path changes the learner DOM before Apply, raw teacher content bypasses server normalization, saved drafts trust a stale node ID, source drift allows save/apply without re-resolution, Full Preview exposes a learner-frame caret or a second authoritative draft copy, duplicate preview messages can clear a valid display, or tests merely assert component state without checking learner isolation.

Return **GO WITH CONDITIONS** only for the clearly external acceptance work: five distinct teachers across twenty predetermined sessions, Brightspace/deployed-host behavior, full WCAG, delayed learner interactions, and cross-browser SCORM.

Return **GO** for this repository change only if the independent review confirms the boundaries above and, when an authorized PR is opened, its exact-head hosted release evidence agrees with the reviewed commit.
