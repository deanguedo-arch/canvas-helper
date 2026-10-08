# Optional formative saving — separate, unapproved proposal

This proposal is NOT part of the approved-copy candidate’s integration boundary. No saving code, storage name, migration or grading rule is introduced. The27new formative fields remain optional, unsaved, ungraded and outside the 12 required chapter checks.

A future request could authorize persistence for these 27fields. Before choosing a store or schema, the integrator must inspect the actual native runtime and existing activity, Frayer, resume and photo owners; that runtime is absent here. Do not reuse native question or writing IDs. Preserve each formative field’s original namespaced ID as a content identity, but do not assume that an ID prefix is already a safe storage namespace.

A separately approved design would need to specify exactly which values are saved, the ownership and versioned key, safe size limits, save-status wording, conflict and failed-write handling, restart/resume rules, clearing/deletion, and behaviour when persistence is unavailable. It must state whether opening hints/models is recorded. Reading a model must not be reported as independent performance, and no automated open-response mark or required progress should be introduced by saving alone.

The test evidence for that future feature must demonstrate no reads/writes/migrations in unrelated or historical learner stores, no overwriting of old attempts, and correct failure semantics in the actual native environment. An in-memory fallback must never be silently presented as persistent saving. The repaired exemplar’s fallback is explicitly excluded.

Decision required: separate authorization for a saving design and implementation, after exact manuscript approval. Until then, use the no-save policy in PRACTICE_MAP and INTEGRATION_MAP.
