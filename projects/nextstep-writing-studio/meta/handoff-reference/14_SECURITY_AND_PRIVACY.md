# 14 — Student data, security and diagnostics

## Data minimization
No student names/emails are required in app state. Use the LMS learner ID transiently only to compute binding; do not put it in exported documents, filenames or logs. A configurable display nickname is not required for MVP. Default greeting “Welcome back”. All samples use fictional placeholders.

The package itself makes no student-data requests outside its supplied SCORM bridge. This is **not** a claim about the LMS vendor's storage region, subcontractors, privacy law compliance or district agreements. District staff must verify hosting, access and retention. No API secrets, telemetry, error-reporting services or AI calls are added by Codex.

## Shared devices
Default local cache is per-tab; persistent device recovery is owner-policy-gated and an explicit device choice. Before retrieving a device record, verify current learnerKey, deploymentScope and workspace ownership. Do not scan all IndexedDB/localStorage records to show “available students”. Metadata such as project titles is student data too.

Clear current-device copies is explicit and affects only current verified binding, not other students or LMS state. Local checkpoint data is not an independent authenticated account; same-origin compromise, shared browser profiles, disk access and extensions can expose it. Hashing keys is not encryption. Do not pretend an in-app password fixes institutional data policy.

## Import and rendering
No executable HTML in saved state. Strict format/schema/semantic validation; bounded bytes/depth/arrays; duplicate JSON-key detection; reject prototype-pollution keys; render user strings through text nodes/schema serializers. No innerHTML of notes/backup/project titles. CSP for produced application should restrict scripts/styles/assets to bundled resources and deny objects/base-uri; validate necessary SCORM parent access in the actual player. Do not add an untested frame-ancestors meta claim (that directive requires response headers). Avoid remote preview cards for source URLs.

Link URLs: only http/https, student explicitly clicks, rel=noopener noreferrer, no auto-fetch, no embedded external site. Teacher-configured support/assignment links are optional and do not imply authentication or submission APIs.

## Diagnostics and test artifacts
Store at most 50 current-session operation events in memory: timestamp, operation name, error code, revision, wire byte count, hashes, timing and coarse mode. Do not log raw suspend_data, text, titles, notes, source URLs, learner IDs or whole backup content. Export a metadata-only report with a clear preview. Do not automatically transmit it. Personal feedback remains a project note, not a public issue report.

Only synthetic fixtures in automated tests, screenshots and SCORM probes. Do not upload real essays to external SCORM test services or paste them into an AI coding request. The connected LMS user must authorize tenant actions separately; a handoff to Codex does not authorize replacing live course assets.

## Loss limits and truthful claims
No offline-first reload guarantee is made because no service worker/cached LMS launch is assumed. An already-open page can keep accepting edits within validated local/memory limits when connectivity fails; reopening offline may not load the package. Browser storage eviction, shutdown during writes, expired LMS sessions and simultaneous-device writes remain risks. Communicate these, design recovery paths and record observed tenant behaviour rather than claiming zero-risk storage.
