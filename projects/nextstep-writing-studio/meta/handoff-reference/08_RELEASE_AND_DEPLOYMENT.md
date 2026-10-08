# 08 — Deployment, upgrade and rollback runbook

## Environment facts versus unknowns
D2L documentation confirms SCORM 1.2/2004 support, old/new SCORM solutions, static/dynamic links and version-management workflows. It also warns package updates can replace an asset wherever it is used. The inspected documentation does **not** establish a blanket rule that every update either preserves or resets every learner's writing. Treat payload continuity as a test result for an exact tenant/player/object/operation. [S1, S2]

Unknown until owner verifies: Next Step's precise player and enabled Content Service; iframe/new-window settings; session expiry; supported 4th Edition resume semantics; learner identity; persistence limits; version-update handling; copied-course scope; privacy/cache policy; retention after unenrolment/course closure. Do not substitute a general website claim for tenant testing.

## Package contract
Build output ZIP has `imsmanifest.xml` at root and one resource with adlcp:scormType="sco" launching index.html. All application paths relative; no leading / paths, runtime CDNs, fonts from Google, network editor plugins or required external media. Use one SCO/one attempt-bound workspace, not a SCO per writing project. Single manifest item/resource IDs remain stable for approved same-object patching, but stable IDs are not a guarantee that the LMS preserves registrations.

Provide a build-time deployment config with unique tenantKey/deploymentScope and data-schema/codec settings. No actual student IDs or content. Configure a static pinned release by default and no grade item. Do not let the app report a completed course because one essay is ready. Disable player-added retake/review options when the tenant provides that choice and verify actual behaviour with the owner. Do not publish placeholder scope values. [S2]

The sample manifest is a **template**, not certification: the packager must enumerate actual build resources and obtain/validate official schema files if required by the selected conformance process. Include a validation report. Do not ship the handoff preview, source audit, student fixture data, tool scripts or test assets in production.

## First installation (synthetic test first)
1. Record teacher-owner, target course/cohort, tenant player, launch mode, visibility dates, version and scope in the deployment record.
2. Upload a synthetic-only persistence probe as a **new isolated SCORM object** in a sandbox course; no production replacement.
3. Test initialize/read/mode/identity, write near-cap synthetic payload, close/relaunch, separate-browser readback with local copies unavailable; validate exact text/hash.
4. Test offline interruption, expired session, positive/negative player acknowledgements, accidental retake and review mode. Decide cautious versus verified save label with evidence.
5. Test updated version on sandbox object and separate new-object migration. Pin and dynamic-link behaviours must be tested separately; never infer one from the other.
6. Repeat with the actual built Studio, including export/reimport and current learner-state schema. Verify all local tests and accessibility gates.
7. Deploy to one pilot group only after owner approval; keep backup/recovery directions visible. No broad automatic asset replacement during the pilot.

## Cohort release policy
Freeze one stable release per active cohort where practical. Develop fixes/new functionality in a separate staging object and source branch. An emergency patch may be justified, but it must have explicit before/after payload tests. Pinning reduces unintended change; it is not a backup or a promise of preservation. Course access/retention remains an institutional policy.

## Update decision table
- New CSS/text-only candidate, no student state yet: ordinary sandbox QA and new release.
- Same-object patch with student data: verify before/after current payload on both same and clean browser; require current backups; documented source/object IDs; explicit owner approval.
- New schema: add tested pure migration, source backup, older-app refusal behaviour and rollback plan; no in-place rollout first.
- New SCORM object: assume no automatic payload transfer; use portable backup/import.
- New course/cohort: new deploymentScope, new workspace; explicit portable import only.
- LMS/Content Service/player change: rerun persistence and lifecycle matrix, regardless of unchanged app code.
- Lost old attempt/origin with no backup: do not fabricate recovery. Ask authorized LMS support about their recovery options; app schema migration cannot fetch inaccessible data.

## Rollback
First identify data schema written by the candidate. If old code cannot read it, reverting code alone is prohibited. Prefer keep current working build available, export valid data and restore compatible code+data through an approved migration. Do not overwrite a newer student draft with a pre-upgrade backup just to call rollback successful. Where code is schema-compatible, test restoring older package in sandbox, preserve all project hashes and then decide.

A rollout record contains source commit/hash, package SHA-256, app/schema/codec versions, deployment scope, tenant/player, pinned setting, completed tests, known limits, approved by and rollback instructions. `verification/tenant-results-template.json` starts **NOT_RUN** for every tenant check.

## Student instructions (ship in Help)
Open this same Writing Studio activity for your writing. Use one device at a time. Check save status before closing. A device/tab copy is not an online backup. Make a Full Studio backup regularly and before switching to a new version. Document export is for handing in writing; Studio backup is for recovering projects. Submit exported work in the course's Brightspace assignment; Studio does not submit it automatically. If saving fails, keep the tab open and export the newest work before retrying/reopening.

## Release stop conditions
Any cross-learner exposure; silent reset/truncation; wrong-binding restore; unreadable normal backup; losing supported pasted text; false saved status in a known failure scenario; corrupted new schema migration; real student data in test artifacts; critical keyboard trap; nonfunctional export recovery. A beautiful screenshot cannot waive these stop conditions.
