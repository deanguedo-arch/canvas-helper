# Google Hosted Deploy Workflow

## Purpose

Provide a repeatable local deploy flow for Google-hosted exports without coupling deployment behavior to Studio.

## Per-Slug Config

Create:

`projects/<slug>/meta/google-hosted.deploy.json`

Example:

```json
{
  "enabled": true,
  "firebaseProjectId": "subject-course-one",
  "hostingSiteId": "module-site-id"
}
```

## Readiness Rules

A slug appears in the picker only when all of these exist:

- `projects/<slug>/meta/google-hosted.deploy.json`
- `projects/<slug>/exports/google-hosted/`
- `projects/<slug>/exports/google-hosted/firebase-config.json`
- `projects/<slug>/exports/google-hosted/.firebaserc`

## Commands

Interactive CLI:

```bash
npm.cmd run deploy:google-hosted
```

Windows launcher:

```bash
deploy-google-hosted.bat
```

## Behavior

The deploy tool:

1. Scans local slug projects for deploy configs.
2. Filters to only configured-and-ready slugs.
3. Shows a numbered picker.
4. Accepts one or many comma-separated selections.
5. Verifies the configured Hosting site exists in the configured Firebase project.
6. Writes site-specific Firebase targeting files into the slug's export folder.
7. Runs `firebase deploy --only hosting:<slug>` for each selected slug.

## Boundaries

- The deploy tool does not create Firebase projects.
- The deploy tool does not create Hosting sites.
- Firebase infrastructure must already exist.
- Studio remains export-only; deploy logic lives in `scripts/` and launcher files.
