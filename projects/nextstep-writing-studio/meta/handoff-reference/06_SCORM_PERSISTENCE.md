# 06 — SCORM persistence and recovery contract

**Read this before implementing any editor or autosave.** It specifies an application policy, not a guarantee that every Brightspace tenant implements identical transport behaviour.

## 1. Target and boundary
One SCO, SCORM 2004 **4th Edition**; runtime API object `API_1484_11`. General 2004 support is documented by D2L; the exact tenant/player must pass the deployment gate. SCORM 2004 3rd/4th Edition specify a 64,000-character smallest permitted maximum for suspend_data; older editions differ. Our product cap is 56,000 ASCII wire characters. Do not use 1.2 automatically if discovery fails. [S1, S3]

No backend, no REST calls to guessed Brightspace endpoints, no credentials, no arbitrary parent-frame scraping, no hidden postMessage wildcard bridge. The content may access the documented SCORM API supplied by its player. Cross-origin SecurityError is caught and treated as an unavailable route; never bypass it. Do not assume the LMS launch origin is the course page origin.

## 2. Initialization and ownership
A single ScormAdapter owns Initialize/GetValue/SetValue/Commit/Terminate. Discover self→parents (at most 20 windows, tracking visited windows), then an allowed opener chain with the same bound. Retry API discovery for at most 5 seconds with an accessible loading state. Do not call Initialize more than once per actual API session. `"false"` is truthy JavaScript; compare returned strings explicitly to `"true"`. Error code calls follow the preceding API operation immediately.

Read and verify runtime configuration first. Placeholder tenantKey/deploymentScope blocks production writes. Initialize("") then read cmi.learner_id, cmi.mode, cmi.entry, cmi.suspend_data, cmi.location, cmi.completion_status and optional cmi.launch_data. Read errors are not empty values. Error 403 is an unset optional value only where the adapter explicitly allows it; treat failed required reads as recovery. A nonempty learner ID and known mode are required before opening any persisted recovery store. No name/email is needed; greeting is “Welcome back”.

`learnerKey = SHA256(UTF8(tenantKey + "\0" + deploymentScope + "\0" + cmi.learner_id))`.
Local store key additionally includes literal app family `nextstep-writing-studio` and the deployment scope. These hashes are privacy minimization, **not encryption or authentication**. Never list other keys to suggest recovery candidates.

Persisted payload has `binding.deploymentScope` and `binding.learnerKey`. Verify exact match before revealing its workspace. A backup is portable only through an explicit import flow that strips/rebinds ownership; an LMS payload is not silently portable.

SCORM has no universally available standard course-ID field to supply our local deployment scope. The owner assigns a unique stable scope per tenant/course/cohort **before packaging/deployment**, stored in local bundled configuration. Keep scope stable for an approved same-object update; use a new scope for a genuinely separate workspace/course. Blindly copying the same package into another course without changing scope can collide in browser caches. A launch-data override is allowed only through an explicitly validated documented configuration, not URL guessing.

## 3. Hydration barrier
The UI cannot mutate state while loading. Classification:
- Valid bound payload: validate/migrate in a copy; load workspace; compare only same-binding local candidates.
- Valid empty required read on a normal fresh attempt and no same-binding recovery: first-run screen. Do not write empty state until an explicit action.
- Empty remote plus nonempty local: recovery choice; **no automatic upload and no silent local overwrite**.
- Failed read, malformed/checksum-invalid payload, wrong binding, newer schema: recovery/export-only. Preserve raw data where access is authorized. Do not replace with `{}`, sample content, defaults or a blank draft.
- mode review/browse: view/export only; no saves, imports or mutations. Normal mode may edit only after the hydration gate resolves.

When no API exists, explicit temporary mode is separate from an LMS workspace; it uses memory or tab storage with a generated temporary session namespace, never a guessed learner ID. Moving temporary work into an authenticated launch requires a user-selected portable backup/import.

## 4. Canonical wire format
Exact prefix and framing:
`WS1.<64-lowercase-hex-sha256>.<base64-gzip>`

Steps: build schema-valid PersistedWorkspace → canonical JSON (object keys recursively sorted; array order preserved; no whitespace; JSON strings escaped conventionally; Unicode not normalized) → UTF-8 bytes → SHA-256 of these **uncompressed bytes** → gzip those bytes → standard padded Base64. Join into the ASCII envelope. No base64url; no self-referential hash field inside the data. The schema version is inside JSON; WS1 is the codec version, not app semver. Total envelope length includes prefix, digest, dots and Base64.

Decoder: bound envelope length before allocation (hard absolute inbound limit 128,000 ASCII chars to allow controlled recovery of external files; writing limit remains 56,000); validate prefix/digest/Base64 shape; decode; inflate with an enforced output bound **1,048,576 bytes**; verify SHA-256; parse JSON with forbidden-key and schema checks; verify binding; then run semantic validation. An unknown codec is recovery/export-only, not a fallback parser attempt. Never inflate an arbitrary backup without an output bound. Use a vetted bundled gzip implementation; a length field claimed by the input is not trusted.

`tools/codec-reference.mjs` is a Node test oracle for this format, not a ready browser adapter. Different valid gzip streams are permitted; decode equality and canonical digest are the interoperability checks, not byte-identical gzip output.

## 5. Save scheduling
One immutable captured snapshot per save attempt. Suggested engineering schedule, enforced with fake timers:
- In-memory editor transaction accepted immediately; increment workspace revision/head.
- Local recovery write debounce 250 ms, maximum wait 1,000 ms during continuous stable input. Local success is recorded only on successful storage/transaction completion, not merely queuing the operation. [S5]
- LMS save after 1,500 ms idle; maximum wait 10,000 ms during continuous changes. Explicit Save, navigation between meaningful project views and Export trigger an eager save attempt while alive.
- One compression/commit operation in flight; coalesce later edits into a next snapshot. A result for N cannot mark N+1 clean. Store accepted headId/hash separately from current headId/hash.
- Keep a pre-encoded recent snapshot for lifecycle best-effort flushing; do not perform first-time megabyte compression only after pagehide.

Validated save order in normal mode: SetValue(cmi.exit, "suspend") → SetValue(cmi.suspend_data, envelope) → SetValue(cmi.location, compact internal route) → optional session_time update → Commit(""). Read errors after each operation. The primary payload SetValue must succeed; a location/session-time issue cannot be allowed to erase the draft. Record exactly which operation failed and stop making a generic “all saved” claim. cmi.location stays below 800 ASCII chars and contains only route/IDs, no title/text.

Fresh workspace: set cmi.completion_status="incomplete" only when appropriate on the first explicit save; preserve an already-established status and surface an unsupported completion/review lifecycle during preflight. Never report completed/passed automatically. Do not write score, progress_measure, interactions or comments as essay storage. Student ready/archived flags are application data only. Never add automatic Retake/Reset buttons.

## 6. Honest status policy
SetValue and Commit acknowledgements are the standard interface signals, but the content cannot generically prove server durable storage. GetValue can reflect player buffers. `navigator.onLine` is only a hint. [S3, S6]

Default, until tenant testing: **“LMS player accepted save”**. Production may use **“Saved to Brightspace”** only after the exact deployed player passes online save/close/relaunch on another browser AND offline/error tests show the status policy does not imply a false online confirmation. Record that evidence and set `tenantSaveLabelVerified=true` in the approved deployment config. The status detail still explains that it reflects player acceptance and regular backups are needed. If offline tests reveal positive acknowledgements while disconnected, retain the more cautious default label. A positive flag is a deployment decision backed by test receipts, not something students can toggle.

When a known network interruption occurs, mark online saving unconfirmed even if the player accepted data; retain local copy, allow Retry and explain the last accepted revision. Never call online=true proof of server reachability. Do not probe third-party sites to test connectivity. The app must not disable writing just because online=false.

## 7. Failure handling
On SetValue/Commit false or thrown errors: keep current memory, latest successful local snapshot, pre-attempt last-good payload and captured candidate. Mark pending/unconfirmed. Retry transport failures after 5/15/30 seconds, then stop automatic retries and show Retry save. Restart that bounded cycle only on explicit user retry or a meaningful reconnection signal with validated session still active. Do not retry schema/binding/size errors as transport errors.

**A failed Commit is not transactional rollback.** The player may retain a new buffer or partially persist it. Never assert the server is unchanged. The remedy is preserved copies, explicit state/status and fresh-launch verification; not a blind SetValue(empty) or repeated initialization. If session is terminated/authentication uncertain, stop writes and request reopen after export.

If LMS saving works but local saving is denied: keep the online workflow and prominently state device recovery unavailable. If local works but LMS does not: continue with local-only warning and offer export. If neither works: continue to display in-memory work, persistent “Not saved”, offer copy/export; do not close automatically.

## 8. Budgets and pressure
Soft warning at 44,000 wire characters; urgent at 50,000; **new LMS write blocked above 56,000**. Raw payload bound 1 MiB. Do not count plain text words as storage size. JSON structure, punctuation and compression entropy all matter. Imports/duplication preflight the full resulting workspace, not just incoming file size.

At >56k retain existing known-good LMS copy and current local/memory candidate. Allow editing/deleting content within field safety limits; latest edits remain unsynced until the candidate fits. Explain which revision is pending. Archive does not free bytes. Free space only through edits or verified export-and-remove; never silently prune student text/evidence/notes. Nonessential app activity retention may be bounded at 30 entries by declared policy, but that is not permission to discard writing.

## 9. Browser recovery stores
Default `localRecovery="session"`: same-tab session storage only. Persistent IndexedDB requires owner policy `allowPersistentLocalRecovery=true` and explicit learner device choice. Show the selected destination accurately: tab versus device. When policy disallows a persistent cache, do not create one behind the scenes.

Device store: database `nextstep-writing-studio`; stores `workspaces`, `checkpoints`, `locks` if fallback locks are needed. Composite key includes tenant/scope learnerKey and workspaceId. Each local record carries captured headId, canonical content hash, **baseRemoteHash** (last player-accepted ancestor), updatedAt, and status pending/accepted/recovery. Keep a protected current candidate, last-good remote raw, and pre-import/pre-migration recovery. Bounded historical local checkpoints: up to 10/project and at most 5 MiB aggregate for optional historical copies; never evict protected unsynced/current/pre-migration copies just to meet that history budget. Display history as “On this device only”. Cross-device version history is not implemented. Browser storage can be denied/cleared/evicted. [S4]

Local/remote comparison uses hashes and known ancestry, not timestamps alone. Even when local.baseRemoteHash equals the loaded remote hash, offer recovery preview for pending local edits instead of silently replacing server state. Divergent bases enter conflict recovery. “Keep both” creates new project copies in a candidate after reference remapping; if it cannot fit, export one/both and do not overwrite.

## 10. Multiple tabs/devices
Acquire a same-origin Web Lock for the binding before editing; hold it until explicit exit/actual page lifecycle end, not visibility hidden. [S7] If unsupported, use a transactionally acquired IndexedDB lease with unique session nonce, heartbeat 3 seconds, expiration 15 seconds and deterministic one-winner claim. Without either reliable lock mechanism, warn and permit only an explicitly acknowledged single-tab session; never claim duplicate-tab protection.

A second tab is read-only. Do not offer forced takeover of a healthy lock. Expired-lease takeover preserves prior pending checkpoint and announces the recovery possibility. Verify fallback with parallel browser contexts as appropriate; separate browser profiles and different devices are not coordinated by these locks.

SCORM has no standard atomic compare-and-set or cross-device lock. Reading headId before Commit may catch a visible mismatch but can still see a cached player value. **One device at a time is a supported-use rule**, not a globally enforceable guarantee. This is documented to students and tested as a known risk. No pseudo “conflict-free sync” marketing.

## 11. Lifecycle
Flush while the page is alive on visibilitychange(hidden), navigation, explicit save and regular autosave. Visibility hidden is not Terminate. Beforeunload is conditional only while relevant unsynced work exists and is a warning aid, not a guaranteed save hook. Browsers may never fire it, particularly mobile. [S8]

On actual pagehide/exit: best-effort local write and already prepared API update; SetValue exit=suspend; session_time in valid SCORM duration format; Terminate once. For a persisted bfcache pagehide, do not blindly terminate/reinitialize: pause, and on pageshow revalidate the live adapter/session before allowing writes. Keep all transitions explicit/tested. No asynchronous operation is assumed to finish after browser shutdown. There is no made-up sendBeacon endpoint.

## 12. Evidence required
Transport call logs (metadata only), exact input/output hashes, encoded lengths and synthetic reopen comparisons. Unit/mock success is not tenant certification. A browser cache match is not proof of LMS persistence; cross-browser relaunch with local data unavailable is the decisive functional test for that deployment. See P0 and the tenant matrix.
