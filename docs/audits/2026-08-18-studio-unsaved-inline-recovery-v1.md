# Canvas Studio unsaved inline-text recovery V1

- Prepared: August 18, 2026
- Repository: [`deanguedo-arch/canvas-helper`](https://github.com/deanguedo-arch/canvas-helper)
- Recovery branch: `codex/studio-unsaved-draft-recovery-v1`
- Integrated inline-editing base: [`50b29c04`](https://github.com/deanguedo-arch/canvas-helper/commit/50b29c04901612c9a1a127d3a0f26504884eaa5b)
- Recovery implementation: [`6e64a85e`](https://github.com/deanguedo-arch/canvas-helper/commit/6e64a85e12c1221496d57def066bf7ef73edceaf)
- Scope: recover unsaved plain-text work only; no structural editing or learner-page mutation
- Requested review: verify the published PR head after this packet is updated with its exact commit

## What this phase adds

If a teacher types into a Studio-owned in-place editor and then reloads, closes Studio, changes course, or loses the current preview before saving, Studio stores a bounded recovery record in browser local storage. It stores no course file, no course asset, no learner-page state, and no server draft.

On the next Studio load, the recovered work appears as a neutral recovery panel:

```text
Unsaved text recovered

[Reopen recovered text] [Copy text] [Discard]
```

The teacher must explicitly reopen the durable target against the current course before the text can become a normal panel draft, gain preview, be saved, or be applied. Recovery never automatically restores a caret in embedded Studio or Full Preview.

## Stored boundary

`app/studio/src/lib/course-edit-storage.ts` owns a separate strict, versioned key:

```text
canvas-helper/course-edit-inline-recovery-v1
```

One bounded record per project contains only:

```ts
type CourseEditInlineRecovery = {
  projectSlug: string;
  identity: CourseEditTargetIdentity;
  document: { kind: "plain-text"; text: string };
  savedDraftId: string | null;
  requiresRebase: boolean;
  createdAt: number;
  updatedAt: number;
};
```

It deliberately excludes canonical patches, rendered HTML, preview session IDs, geometry, selectors, filesystem paths, arbitrary HTML, CSS, JavaScript, pending assets, and learner browser state. It has the same bounded project retention model as saved drafts and warns if an older project recovery is evicted; it has no silent time expiry.

## Authority and drift rules

```text
Type locally
  → browser-local recovery record only
  → reload/close
  → recovery prompt
  → read-only durable Reopen
  → server Normalize
  → normal unsaved editor state
  → Save draft (browser-local draft)
  → Apply (first course-file/course-asset write)
```

- Reopen uses the existing bounded `POST /api/course-edits/reopen` path and never trusts a stored node ID by itself.
- A resolved target becomes a panel-only working draft until the current page is opened and inspected again; recovery does not seize a visual owner.
- A changed target remains detached. The teacher sees current versus proposed text and must explicitly **Rebase proposed text** before Save or Apply.
- Missing, ambiguous, runtime-owned, and unsupported targets remain Copy/Discard only.
- Selecting **Discard** clears only the browser recovery record and active Studio presentation; it never writes course content.
- Source drift is retained through recovery with its original durable identity, so a page reload cannot accidentally turn source drift into an implicit rebase.
- A monotonic recovery operation token rejects late reopen results if the teacher selects another element, changes projects, cancels, or starts another recovery attempt.

## Isolation claims verified locally

The recovery change does not loosen the existing inline-editing boundary:

- the learner iframe never becomes `contenteditable`;
- no learner subtree, listener, form value, completion state, or browser storage is mutated before Apply;
- recovery writes only the Studio-origin local-storage key above;
- the full-preview trusted host remains a consumer of the one Studio controller, not a persistent owner;
- course source writes still occur only in the existing Apply transaction.

## Local evidence before publication

These checks ran against this working recovery branch. Re-run them on the exact published PR head before calling the phase green:

| Check | Result |
| --- | --- |
| `node --import tsx --test scripts/tests/course-edit-storage.test.ts` | Passed: saved drafts still round-trip; unsaved recovery survives storage reload and is not promoted to a saved course draft. |
| `npm run build:studio` | Passed. |
| `npm run verify:typecheck-baseline` | Passed with the reviewed ten unrelated diagnostics and no changed-file diagnostic. Raw typecheck remains intentionally non-green. |
| Focused inspection E2E | Passed: external drift persists a rebase-required recovery; unsaved text survives full Studio reload, requires durable reopen before Save, remains byte-for-byte non-mutating before Apply, and explicit Discard removes only the local recovery. |

## Reviewer checklist

1. Verify `CourseEditInlineRecovery` rejects malformed, oversized, cross-project, or extra-field local storage input.
2. Confirm only plain text and durable opaque identity are persisted; no patch, preview, asset, selector, or path crosses that boundary.
3. Confirm reloading leaves the learner source, DOM, keyboard/input handlers, browser storage, and course files unchanged until Apply.
4. Confirm normal recovery reopens through the server, normalizes again, and never restores a live embedded or Full Preview caret automatically.
5. Confirm source drift remains detached after reload and requires an explicit rebase.
6. Confirm Discard, Escape, and Full Preview cancel explicitly clear recovery, while ordinary navigation and accidental preview loss preserve it.
7. Confirm a late reopen result cannot replace a newer selection or a different recovery attempt.

## Claims deliberately not made

This is not course-content autosave, cross-device recovery, structural course editing, an automatic source rebase, or permission to edit unsupported/runtime-owned course elements. Browser storage can be unavailable or cleared by the browser; Studio reports that condition rather than claiming recovery is durable. Brightspace/deployed-host behavior, full WCAG, delayed learner interactions, cross-browser SCORM, and teacher rollout acceptance remain separate evidence.
