# Workflow: Conversion

Use this workflow for D2L/Brightspace-derived projects where fidelity is primary.

## Default Mode

- Use `DEFAULT` unless the request explicitly asks for artifact-level redesign.

## Primary Goals

- Preserve course meaning and assignment intent.
- Remove LMS noise and broken scaffolding.
- Improve readability and navigation.
- Add interaction only where it clarifies learning flow.

## Source-of-Truth Pattern

- Canonical entry usually lives in `projects/<slug>/workspace/index.html`.
- Canonical sources usually include workspace runtime files (`main.jsx` / `main.js`, plus stylesheet if active).
- Reference and archive artifacts must be marked as `referenceOnly` in metadata.

## Reliable Upgrade Patterns

- Keep module sequence and assessment fidelity intact.
- Improve visual hierarchy with stronger section structure and spacing.
- Normalize path handling and resource lookup defensively when imports vary.
- Keep export-safe file references and avoid coupling to local-only assumptions.

## Responsive and Interaction Defaults

- Use clear spacing rhythm and touch-safe controls.
- Preserve keyboard focus states for interactive controls.
- Avoid adding heavy interaction wrappers when static content already communicates well.

## Common Failure Modes to Avoid

- Rewriting course concept when task asked for cleanup.
- Patching generated bundles without recording regeneration strategy.
- Mixing reference-only files into active execution paths.

## Conversion Playbook (Required Sequence)

Use this exact sequence for new conversion work. Keep scope inside `projects/<slug>/workspace/**` and `projects/<slug>/meta/**` unless intake/regeneration is explicitly required.

1. Intake + artifact generation
2. Preflight content audit
3. Shell normalization and placement
4. Interaction and lock behavior pass
5. Deploy readiness pass
6. Verification + handoff

## Step 1: Intake + Artifact Generation

Run the standard conversion pipeline first so all planning artifacts exist:

```bash
npm.cmd run incoming:refresh
npm.cmd run d2l-map -- --project <slug>
npm.cmd run blueprint -- --project <slug>
npm.cmd run assessment-map -- --project <slug>
npm.cmd run lesson-packets -- --project <slug>
npm.cmd run build:course-shell -- --project <slug>
```

## Step 2: Preflight Content Audit

Before editing UI logic, run a quick structural audit and record findings in handoff or project notes:

- Encoding artifacts: mojibake/replacement characters (for example `�`, `â€™`, `â€“`).
- Missing media references: `<video>/<audio>/<source>` entries with files not present in bundle.
- Broken resource paths (including `content`/`сontent` variant drift and malformed relative paths).
- Duplicate assessment listings across content and assignment buckets.
- Module title/order mismatches vs source LMS structure.

If missing media is detected:

- Prefer a graceful in-shell fallback note.
- If a canonical external source is provided (for example YouTube), add a source-specific override.
- Do not silently label broken media as converted.

## Step 3: Shell Normalization and Placement

Apply these placement rules consistently:

- Keep module sequence and lesson ordering faithful to source.
- Move quiz-like items into `Quizzes` library view.
- Move assignment/lab hand-ins into `Assignments` library view when course uses assignment tab UX.
- Remove duplicate quiz/assignment items from main module content lists once placed in libraries.
- Keep conversion-status labels truthful:
  - `converted` only when in-browser interaction is actually implemented (parsed source quiz data or local workspace implementation).
  - `not converted` when source is missing, launcher-only, or external-only.

## Step 4: Interaction and Lock Behavior Pass

When lock behavior is requested, apply the same release-condition model:

- All modules remain visible/selectable.
- Inside each module, content unlock is sequential.
- `mark complete + next` advances to next content item.
- Quizzes/assignments unlock only after module content completion (unless course-specific policy says otherwise).
- Mobile drawer/hamburger must preserve active section view while navigating modules.

## Step 5: Deploy Readiness Pass

Before publish:

- Confirm `projects/<slug>/meta/google-hosted.deploy.json` has `enabled`, `firebaseProjectId`, and `hostingSiteId`.
- Confirm export bundle contains real deploy files, not templates only:
  - `projects/<slug>/exports/google-hosted/firebase-config.json`
  - `projects/<slug>/exports/google-hosted/.firebaserc`
- Confirm storage sync uses one canonical key and bridge tracks that exact key.
- Confirm Google sign-in/auth domain behavior on deployed URL.

## Step 6: Verification Floor

For conversion changes, minimum verification is:

```bash
npm.cmd run verify -- --project <slug>
npm.cmd run typecheck
npm.cmd run build:studio
```

When UI behavior changed, also run:

```bash
npm.cmd run test:e2e:smoke
npm.cmd run test:e2e:project -- --project <slug>
```

Manual acceptance checklist:

- Module order and titles match source.
- Content/Quizzes/Assignments placement is correct for course policy.
- No obvious mojibake in sampled lessons across multiple modules.
- Missing media has graceful fallback or explicit embed override.
- Mobile sidebar/hamburger behavior is stable.
- Progress/lock behavior works and persists as expected.
