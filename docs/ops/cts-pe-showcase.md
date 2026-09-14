# CTS and PE shared review site

The six blocked review courses are published behind one Next Step selector:

`https://nxtpe10.web.app`

The root selector is generated from `scripts/templates/cts-pe-showcase/`. Course files are copied from the canonical workspaces into `courses/<project-slug>/` for the Firebase Hosting deployment only. The workspaces and the selector template remain the sources of truth.

## Courses

- `pe10-online-pilot` — Physical Education 10 — Online
- `marketing-10-20-online` — Marketing 10–20 — Online
- `marketing-30-online` — Marketing 30 — Online
- `legal-studies-30-online` — Legal Studies 30 — Online
- `tourism-10-20-online` — Tourism 10–20 — Online
- `tourism-30-online` — Tourism 30 — Online

Direct links use `https://nxtpe10.web.app/courses/<slug>/index.html#overview`. The shared shell preserves the selected course and current route in the URL and embeds the course same-origin, so each project’s existing localStorage state remains scoped to its own course key.

## Rebuild and deploy

Run the selector contract first:

```bash
npm run test:cts-pe-showcase
```

Then publish the canonical workspaces to Firebase project `calm-module-one`, Hosting site `nxtpe10`:

```bash
npm run deploy:cts-pe-showcase
```

The deploy command runs `npm run verify -- --project <slug> --mode workspace` for all six projects, stages a temporary Firebase config, deploys Hosting only, verifies every hosted file by SHA-256, and writes `docs/ops/cts-pe-showcase-deployment.json`.

No Firebase application SDK, Analytics code, backend, Brightspace link, SCORM export, Studio activation or learner-release flag is introduced. The site is a public teacher-review surface; do not enter real learner data.

## Review boundary

The five CTS projects retain unresolved official detailed-outcome reconciliation and remain blocked. PE10 and the CTS courses are not curriculum certification, LMS save/restore proof, teacher acceptance or production release. Any content change must be made in the project’s canonical `workspace/**`, then redeployed through the owning script.
