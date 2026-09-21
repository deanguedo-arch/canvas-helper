# Managed course save receipts

Canvas Helper's SCORM bridge remains the sole owner of LMS initialization, `SetValue`, `Commit`, and termination. Courses using the `course-state-v1` adapter publish an immutable snapshot and completion tuple with `publishCourseState(snapshot, completedIds)`.

The bridge advertises `capabilities.courseSaveReceiptV1 === true`. Each distinct tuple receives an opaque session-local publication ID. A successful `canvas-helper:scorm-status` event includes `phase: "saved"` and `coursePublicationId` only after that exact tuple has been committed. No learner answers are placed in the event payload.

Course runtimes must compare the receipt ID, current snapshot, completion IDs, and local edit revision before clearing their dirty state. A generic success message is not proof that the latest draft was saved. A failed local validation or storage write must call `failCourseSave`, and a newer uncommitted publication prevents managed exit from claiming that all work is saved.

Standalone workspace previews remain browser-local. The receipt contract applies to an initialized managed SCORM session and does not turn a preview into an LMS session.
