# Studio Workflow V2: focused course-change loop

- Status: implemented and locally verified on `codex/studio-workflow-v2`.
- Scope: make the existing side-by-side Studio more useful for the real teacher → ChatGPT adviser → Codex implementer loop, without changing learner-course content or adding API model calls.
- Explicitly out of scope: a Social 10 ownership adapter, a Science factory, persistent handoff history, full DevTools console capture, automatic edits, or automatic model submission.

## Decision

The workflow stays deliberately small and evidence-led:

1. Open a course in Studio and read its **Course build brief** before editing.
2. Use **Inspect** to select the learner-facing surface and receive a server-derived source route.
3. Collect several notes in **Review Set** only when a batch handoff is useful.
4. After an edit, use **Re-check after change** to click the revised surface again. Studio checks only whether the safe source/rebuild route still matches.
5. Run **Workspace Verify** when that route is confirmed, then inspect the learner experience yourself. A passing command is never presented as a completed instructional fix.

## Implemented changes

### Course build brief

- `GET /api/projects/<slug>/authoring-brief` turns the existing doctor result into a small, source-free brief.
- The brief names driver, authoring mode, allowed editable and shared source paths, rebuild command, validation command, and route problems.
- Its copied form is capped at 3 KB and contains no file bodies. Proposal-only projects visibly report that no safe editable source is declared.

### Selection workbench

- Exact direct-workspace selections show a server-derived, bounded source excerpt around the selected tag.
- Generated Social and English workspaces never show their generated HTML as source context; their existing rebuild ownership remains visible instead.
- **Copy target** and **Show in preview** reduce the back-and-forth when moving from Studio into Codex.
- Source context remains local UI evidence. It is deliberately excluded from both single-inspection and Review Set handoffs.

### Review lane and proof loop

- Each saved Review Set item can be revealed in the preview without reading the iframe DOM.
- **Re-check after change** turns on Inspect and requires a fresh click. It confirms only the same safe route, allowing a direct-file line shift but rejecting unknown, stale, or changed ownership.
- **Run Workspace Verify** appears only after route confirmation. Its completion text explicitly says to inspect the learner result before calling the change done.

### Bounded preview health

- The isolated preview may report only runtime errors, unhandled promise rejections, or asset-load failures.
- Messages are bounded, deduplicated, redacted for path/link-shaped values, kept in memory only (six maximum), and excluded from every copied packet.
- This is intentionally not a DevTools-console clone.

### Standalone preview exit

- **Open preview** opens the workspace in a separate tab so Studio remains available for inspection and handoff work.
- The isolated bridge injects a plain **Return to Studio** control only when the preview is the top-level page. It replaces that preview URL with the trusted Studio origin and never appears inside Studio's embedded iframe.

## Red-team / green-team boundaries

| Risk | Green rule | Red-team fail condition |
| --- | --- | --- |
| Wrong edit file | Doctor-derived route only | A visible workspace file becomes a target without driver proof |
| Generated output | Builder/factory remains the owner | Generated Social/English HTML appears as editable source |
| False completion | Route check and Verify are separate evidence | UI says the learner fix is complete from one command |
| Token bloat | Brief and packets are bounded and source-free | Source snippets, screenshots, or console logs enter copied text |
| Preview trust boundary | Private `MessageChannel` only | Studio reads iframe DOM or uses wildcard messaging |
| Social 10 / Science drift | Proposal-only stays visible | A source adapter or factory is guessed without source/rebuild proof |

## Verification

- `npm run test:studio-inspection`
- `npx playwright test -c e2e/playwright.config.ts e2e/specs/inspection.spec.ts`
- `npm run build:studio`
- `npm run typecheck` (known pre-existing baseline errors only; no touched-file diagnostic)

## Follow-up gate

The next course-specific improvement is not another Studio feature. It is a source-backed driver decision for the next Science course, or a separately proven Social 10 ownership adapter with a zero-learner-content-diff rebuild proof.
