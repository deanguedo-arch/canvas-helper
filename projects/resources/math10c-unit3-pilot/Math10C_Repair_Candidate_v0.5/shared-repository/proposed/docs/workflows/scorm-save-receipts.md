# Managed course save receipts (additive API)

Candidate change against d0b4cf731dd180cebee908915772e90687d40215; not installed by this bundle.

The shared bridge remains the only owner of LMS initialization, SetValue, Commit and termination. `publishCourseState(snapshot, completedIds)` now returns an opaque session-local identity for an immutable cloned snapshot/completion tuple. Unchanged tuples reuse the current identity. Existing callers may ignore the return; `save()` and `saveAsync()` retain Boolean results.

`capabilities.courseSaveReceiptV1 === true` advertises this contract. A `canvas-helper:scorm-status` success event has `phase: "saved"` and `coursePublicationId` only after the captured tuple was committed successfully. Default status DOM is rendered before dispatch. A new publication during reentrant API callbacks does not replace the captured receipt. Completion progress uses the same captured tuple.

Course listeners must compare receipt identity, current exact snapshot, completion IDs and local edit revision before clearing dirty state. A generic status string is never an acknowledgement. Failed local validation/storage must call `failCourseSave` so heartbeat cannot falsely acknowledge an earlier snapshot. Managed initialization defers completion writes until an authorized course save. A newer pending publication prevents managed exit from claiming that all work was saved.

No learner answer is copied into event payloads. The Math course separately requires an exclusive Web Lock before editing/publication and preserves conflicting recovery branches. A caller without the new capability is local-only/unconfirmed, not automatically upgraded to saved.

Run `npx tsx --test scripts/tests/scorm-state-codec.test.ts scripts/tests/scorm-export.test.ts` after separately authorized integration. The accompanying repair source has an isolated emitted-bridge and actual-DOM test harness; it is not a substitute for full repository CI, Studio lifecycle, native tab-lock or tenant testing.
