# Studio Workflow V2: focused course-change loop

- Status: implemented and locally verified on `codex/studio-workflow-v2`.
- Scope: make the existing side-by-side Studio more useful for the real teacher → ChatGPT adviser → Codex implementer loop, without changing learner-course content or adding API model calls.
- Explicitly out of scope: a Social 10 ownership adapter, a Science factory, persistent handoff history, full DevTools console capture, automatic edits, or automatic model submission.

## Decision

The visible workflow stays deliberately small and evidence-led:

1. Use **Inspect** to select the learner-facing surface.
2. Write the requested change and save the annotation.
3. Repeat when useful, then copy the automatically prepared Review Set into Codex.
4. Inspect the learner experience after Codex makes and verifies the change; the copied route is evidence, not an automatic claim that the work is complete.

## Implemented changes

### Hidden routing engine

- `GET /api/projects/<slug>/authoring-brief` turns the existing doctor result into a small, source-free brief.
- The route and resolver still derive driver, safe source paths, rebuild command, validation command, and blockers.
- Those developer details no longer occupy the teacher-facing annotation rail. The final copied Review Set includes only the bounded facts Codex needs.

### Simple annotation rail

- The current selection shows only a short learner-facing excerpt, one note field, **Save annotation**, and optional screenshot controls.
- Source paths, ownership labels, source excerpts, commands, and raw packet text are not rendered.
- Generated Social and English workspaces still never become edit targets; their existing rebuild ownership remains resolver-owned packet data.

### Automatic Review Set

- The set renders only each selected excerpt, its editable note, optional screenshot, and remove control.
- Saving or editing automatically revalidates every resolver request. Copy remains disabled while checking or when a route changed.
- The packet is frozen only after the current set passes revalidation; no raw packet preview or manual preparation step is shown.

### Diagnostic boundary

- The isolated preview may report only runtime errors, unhandled promise rejections, or asset-load failures.
- Those messages remain bounded and redacted at the bridge, but the annotation rail does not render a Preview Health panel or copy diagnostics into a handoff.

### Standalone preview exit

- **Open preview** opens the workspace in a separate tab so Studio remains available for inspection and handoff work.
- The isolated bridge injects a plain **Return to Studio** control only when the preview is the top-level page and never inside Studio's embedded iframe.
- When connected, the control asks the existing Studio session to focus and closes the auxiliary preview tab. This preserves the Studio-owned temporary Review Set across repeated preview open/return cycles without persistent browser storage.
- A directly opened preview has no Studio session to preserve, so its return control falls back to navigating to the trusted Studio origin.

### Standalone mini inspector

- The full-page preview includes **Inspect**, a collapsible shared **Review Set**, and **Return to Studio**.
- A teacher can select, write a note, save, edit, remove, clear, and copy without leaving the full preview.
- Every action travels over a one-time-token private `MessageChannel` into the same Studio-owned resolver and Review Set used by the embedded preview.
- The early-injected preview bridge transfers its channel only to the exact Studio origin, clears the popup opener before course scripts execute, and never exposes the preview DOM to Studio.
- A preview opened directly can highlight an element locally, but it cannot claim or write into a Studio session.

## Red-team / green-team boundaries

| Risk | Green rule | Red-team fail condition |
| --- | --- | --- |
| Wrong edit file | Doctor-derived route only | A visible workspace file becomes a target without driver proof |
| Generated output | Builder/factory remains the owner | Generated Social/English HTML appears as editable source |
| False completion | The copied route is implementation evidence only | UI or packet says the learner fix is complete |
| Token bloat | Packets are bounded and source-free | Source snippets, screenshots, or console logs enter copied text |
| Preview trust boundary | Private `MessageChannel` only; standalone channel uses a one-time token and cleared opener | Studio reads preview DOM, retains an untrusted opener, or uses wildcard messaging |
| Social 10 / Science drift | Proposal-only stays visible | A source adapter or factory is guessed without source/rebuild proof |

## Verification

- `npm run test:studio-inspection`
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts`
- `npm run build:studio`
- `npm run typecheck` (known pre-existing baseline errors only; no touched-file diagnostic)

## Follow-up gate

The next course-specific improvement is not another Studio feature. It is a source-backed driver decision for the next Science course, or a separately proven Social 10 ownership adapter with a zero-learner-content-diff rebuild proof.
