# Agent Prompt Templates

These templates assume the repo follows the current architecture and governance contract.

## 1. Studio UI Change

```text
Project: <slug>
Task: Update Studio UI behavior in <component or workflow>.
Boundary:
- Touch only app/studio unless server support is explicitly required.
Constraints:
- Preserve compare/focus preview behavior.
- Keep filesystem access out of the frontend.
- No drive-by visual redesign.
Verification:
- npm.cmd run typecheck
- npm.cmd run build:studio
Deliver:
- Summary
- Files changed
- Verification run
- Known risks / follow-up
```

## 2. Local Server Change

```text
Task: Update local server handling for <route or preview behavior>.
Boundary:
- Touch app/server and only the minimum related Studio wiring.
Constraints:
- Preserve local filesystem-driven serving.
- Keep safe path validation explicit.
- Do not move command logic into the browser.
Verification:
- npm.cmd run typecheck
- npm.cmd run build:studio
- route-specific verification steps
Deliver:
- Summary
- Architecture impact
- Verification run
- Exact next command
```

## 3. Intelligence Policy Change

```text
Task: Adjust intelligence collect/apply behavior.
Boundary:
- Touch scripts/lib/intelligence/config, collect, or apply only.
Constraints:
- Collection must remain explicit.
- Application must respect off, collect, and apply modes.
- Preserve precedence: CLI > LEARNER_MODE > project > repo.
Verification:
- targeted tests
- npm.cmd run typecheck
Deliver:
- Policy change summary
- Flags added or changed
- Behavior by mode
- Risks
```

## 4. Pipeline / Export Change

```text
Project: <slug>
Task: Change import/analyze/refs/export behavior.
Boundary:
- Touch scripts plus the smallest necessary docs.
Constraints:
- Preserve local-first workflow.
- Do not edit raw or exports manually unless the task explicitly requires it.
- Update smoke verification if the core path changes.
Verification:
- targeted tests
- smoke path
- npm.cmd run typecheck
Deliver:
- Pipeline impact
- Files changed
- Verification run
- Follow-up
```

## 5. Incoming Intake Change

```text
Task: Change incoming bundle or tagged reference intake behavior.
Boundary:
- Touch scripts, the local server route, and the smallest necessary Studio wiring.
Constraints:
- Keep `projects/incoming/` as the import drop zone.
- Keep `projects/resources/<slug>/` as the canonical resource source.
- Keep `projects/processed/<slug>/source/` to one latest snapshot per slug.
- Do not reintroduce Gemini-specific folder lanes.
Verification:
- npm.cmd run typecheck
- npm.cmd run build:studio
- node --import tsx --test scripts/tests/incoming-watch.test.ts scripts/tests/incoming-intake.test.ts scripts/tests/incoming-route.test.ts scripts/tests/studio-incoming-refresh.test.ts
Deliver:
- Intake behavior summary
- Conflict policy
- Manual refresh behavior
- Risks
```

## 6. Session Handoff

```text
Project: <slug or repo-wide>
Task: Produce a strict handoff.
Use docs/ops/HANDOFF.md exactly.
Include:
- Status
- Files changed
- What changed
- What still needs validation
- Known risks
- Exact next command
- Exact next file to open
- Do not do next / warnings
```
