# English Course Factory Handoff

- Repository: `/Users/deanguedo/Documents/GitHub/canvas-helper`
- Original Codex task: `Create English class process` (`019f5bcd-796f-7380-93a6-f32789c5469a`)
- Status: the reusable factory and the 13-unit ELA `-2` SCORM release are complete; Brightspace acceptance testing remains external.

## Resume point

- The complete ELA `-2` checkpoint is the local branch `codex/ela20-factory-checkpoint-20260714` at `ebe1d63614fbc240649cd7d8b98a2f473a322880`.
- That local branch is six commits ahead of `origin/codex/ela20-factory-checkpoint-20260714` (`253f15657053a85c0620f50aecc6a4840dece59d`).
- The durable editable-source recovery is now backed up in the private GitHub repository `deanguedo-arch/canvas-helper-english-recovery` at commit `9457b7c846f0112a7a915ded734b11935f600ad9`. Recovery no longer depends on this Mac retaining the six-commit local branch.
- The current Studio branch contains the older origin checkpoint, but not those final six English commits or the complete `ela10-2`, `ela20-2`, and `ela30-2` family definitions. Do not treat the current branch as the full English recovery point.
- Because the main checkout has active Studio changes, inspect or continue the English checkpoint in a separate worktree rather than switching this dirty checkout.

## Source of truth

- Intake and factory: `scripts/lib/english-unit/`
- ELA `-2` course seeds: `scripts/lib/english-unit/ela2-course-seeds.ts`
- Family definitions and verification reports: `config/english/families/`
- Shared course shell: `scripts/lib/next-step-course-shell.ts`
- Project-level recipes: `projects/<slug>/meta/english-unit.json`
- Generated learner output: `projects/<slug>/workspace/`
- Generated delivery output: `projects/<slug>/exports/`

The reusable process is: source ZIPs and supplemental resources -> inventory and mapping -> normalized course model -> profile-driven rendering -> shared shell -> verification -> SCORM export. Edit recipes, seeds, profiles, and renderers; do not hand-edit workspaces or exports as the durable source.

## Retained consolidated release

- Folder: `projects/ela10-2-writing-foundations/exports/all-ela-10-2-20-2-30-2-scorm-2004/`
- Contents: 13 flat SCORM 2004 ZIPs — five ELA 10-2, four ELA 20-2, and four ELA 30-2 packages.
- Size: approximately 1.8 GiB.
- Rechecked 2026-08-14: all 13 ZIPs passed archive integrity and contain `imsmanifest.xml` and `scorm-bridge.js`; `npm run test:scorm` passed 19/19.
- Private off-device backup: `https://github.com/deanguedo-arch/canvas-helper-english-recovery/releases/tag/ela-scorm-2004-consolidated-2026-08-14`.
- Twelve packages are direct private release assets. The 1.7 GiB Streetcar ZIP is preserved as 18 restart-safe parts with restore instructions and hashes; all 18 remote SHA-256 digests match the local parts and recombine to the original 1,862,078,380-byte ZIP.
- This local release folder remains generated and Git-ignored, but it is no longer the only recovery copy.

## Remaining acceptance work

1. Import the retained packages into a Brightspace test course.
2. Enter responses, save, close, reopen, and confirm restoration in more than one browser or device.
3. Test `ela30-2-modern-drama-streetcar-scorm-2004.zip` separately. It is about 1.7 GiB because it contains local film media and may encounter an LMS upload limit.
4. Keep the existing human-review gates for rights, accessibility, primary-text access, media, and incomplete question sets.

## Useful commands on the English checkpoint

```bash
npm run verify:english-course -- --course ela10-2
npm run verify:english-course -- --course ela20-2
npm run verify:english-course -- --course ela30-2
npm run test:scorm
npm run build:english-unit -- --project <exact-project-slug>
npm run export:scorm -- --project <exact-project-slug> --version 2004
```

## Exact first check in a future task

```bash
git log --oneline origin/codex/ela20-factory-checkpoint-20260714..codex/ela20-factory-checkpoint-20260714
```
