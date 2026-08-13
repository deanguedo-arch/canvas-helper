# Course catalog Studio onboarding — August 13, 2026

## Outcome

The GitHub-tracked repository catalog is now explicit instead of inferred. All 66 project directories present in a clean checkout have a recorded outcome, and every source-backed active course uses a declared Studio authoring contract.

| Outcome | Count | Meaning |
| --- | ---: | --- |
| Direct workspace | 28 | Studio writes only declared canonical workspace files. |
| English factory | 5 | Studio writes course overrides and runs the staged English factory. |
| Social factory | 4 | Studio writes course overrides and runs the checksum-backed Social 30 factory. |
| Preserved legacy snapshot | 26 | The current workspace is the protected baseline; Studio persists replayable course overrides and never invokes the quarantined legacy replacement builder. |
| Blocked | 1 | Source ownership is explicit, but lifecycle policy still disables Studio writes. |
| Reference-only | 1 | Test/reference material remains intentionally non-authorable. |
| Package archive | 1 | Only a release package or audit artifact exists; no editable source was invented. |

That is 65 explicit manifests, of which 63 active or ready-for-export projects pass `course:doctor` with Studio editing enabled. The remaining manifest projects are `calm-module-4` (blocked because its required `lesson-shell` deviation is unresolved) and `e2e-studio-secondary` (reference-only test data). The sixty-sixth tracked directory, `social30-1-audit-zips`, is the package archive.

## What was changed

- Added the transactional `course:onboard` workflow. It normalizes legacy absolute paths, assigns a supported Direct/factory/snapshot driver, validates every enabled candidate, and rolls the whole manifest batch back if any post-write doctor fails.
- Added `legacy-snapshot-v1` for courses whose current learner workspace is usable but whose former builder inputs are incomplete or nonportable. The old builder is documented and quarantined; Studio edits the preserved baseline through `meta/studio-edits.json` and retains drift-safe Undo.
- Made imported projects explicitly Direct at intake. Net-new Codex courses already use `course:create`, so both future creation paths now arrive with source ownership declared.
- Completed the missing Social 30 Option Two Issues 2–4 workspaces and manifests from the checksum-verified `social30-1-brightspace-winter-2020` resource.
- Removed the obsolete Studio picker filters that hid the four original Social 30 issue courses.
- Added an idempotence and live-discovery signal contract: rerunning onboarding after a clean apply produces only `retain` outcomes and does not rewrite manifests.

No existing raw import or export package was edited. Catalog verification made only temporary course edits, then used Undo and byte fingerprints to prove restoration.

## Rendered and reversible acceptance

`npm run verify:course-onboarding -- --all` passed 63/63 enabled projects:

- 50 projects completed apply → applicable rebuild → isolated learner render → reload → Undo, with exact pre/post write-boundary fingerprints.
- 12 runtime-rendered projects correctly exposed no source-owned text target. Studio shows zero editable text regions and routes their learner content to Annotate/Codex:
  - `ai-course-building-resources`
  - `calm-life-adventure`
  - `calm-module`
  - `calm-module-2-activites-reference`
  - `calm-module-4-stage`
  - `calmmodule2`
  - `experimental-psych-30-per-1-a-b-sec-s-202632352`
  - `forensics`
  - `forensics35`
  - `general-psychology-20-independent-studies-202633108`
  - `next-step-redesigned-unit-docs`
  - `next-step-redesigned-unit-docs-original-format-source`
- `aboriginal-studies-30` has mapped source elements, but all six sampled text changes were rejected because course JavaScript replaced a target or the existing rendered text failed contrast requirements. Every rejection restored the course exactly, so the verifier reports `no-learner-stable-text-target` and routine text changes remain in Annotate/Codex until that runtime/contrast debt is repaired.
- `sportswellness` now completes the reversible lifecycle after the verifier continues past rejected candidates to a learner-stable source-owned target. Its earlier safe-rejection result described the sampled target, not the course's overall editability.

The map is intentionally honest: being visible in Studio does not make every DOM node editable. Edit mode outlines source-owned supported regions, shows runtime-owned/unsupported regions as Annotation only, and the server still validates the actual requested learner result before committing.

## Tracked package-only archive

The clean GitHub checkout contains one directory catalogued as `package-archive`, not fabricated as an editable course:

- `social30-1-audit-zips`

Making it editable requires recovering or intentionally importing a canonical source; copying package output into a fake source would weaken rather than complete the migration.

## Local-only archives excluded from GitHub evidence

The first local inventory reported 84 directories and 19 package archives because the working checkout also contained 18 ignored or untracked package/export directories. They are not present in a clean Git checkout and are therefore not counted as repository-onboarded or used as evidence for PR #1:

- `ela10-1-film-study`
- `ela10-1-modern-play-fences`
- `ela10-1-novel-study`
- `ela10-1-shakespeare-merchant-of-venice`
- `ela10-2-film-study`
- `ela10-2-modern-play-dracula`
- `ela10-2-novel-study`
- `ela20-2-film-study`
- `ela20-2-modern-play-crucible`
- `ela20-2-novel-study`
- `ela30-1-feature-film-legacy`
- `ela30-1-novel-study-legacy`
- `ela30-2-film-study`
- `ela30-2-modern-drama-streetcar`
- `ela30-2-novel-study`
- `learning-strategies-15-docx-export`
- `learning-strategies-25-docx-export`
- `next-step-course-launch`

If those local artifacts are later imported as canonical projects, onboarding must classify and validate them in a separate tracked change.

## Commands

Audit without writes:

```bash
npm run course:onboard -- --all
```

Apply a catalog change transactionally:

```bash
npm run course:onboard -- --all --apply --report .runtime/course-onboarding-report.json
```

Repeat the catalog learner-result gate:

```bash
npm run verify:course-onboarding -- --all
```

Create future Codex courses correctly from the beginning:

```bash
npm run course:create -- --slug <slug> --title "<title>" --course-code "<code>" --summary "<summary>"
```

## Source of truth

- Classification and transaction: `scripts/lib/course-onboarding.ts`
- CLI: `scripts/onboard-courses.ts`
- Catalog acceptance: `scripts/verify-course-onboarding.ts`
- Authoring resolver: `scripts/lib/course-authoring/context.ts`
- Legacy snapshot apply/replay/Undo: `app/server/lib/course-editing.ts`
- Visual boundary: `app/server/lib/preview-inspection.ts` and `app/server/preview-bridge-runtime.ts`
- Per-course ownership: `projects/<slug>/meta/project.json`
