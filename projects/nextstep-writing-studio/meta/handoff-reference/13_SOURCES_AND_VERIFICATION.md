# 13 — External sources, factual boundary and verification

Checked 6 October 2026. URLs are supplied so an implementer can inspect primary documentation. Product architecture, limits, defaults, UI copy and risk decisions in this handoff are **our design requirements**, not recommendations attributed to the publishers. No general documentation substitutes for a district tenant test.

**S1 — D2L, About SCORM**  
https://community.d2l.com/brightspace/kb/articles/5400-about-scorm  
Supports general SCORM 1.2/2004 compliance and the distinction between legacy/new Content Service handling. Does not certify Next Step's exact player, storage, retention or 4th Edition behaviour.

**S2 — D2L, Import and manage SCORM**  
https://community.d2l.com/brightspace/kb/articles/4971-import-and-manage-scorm  
https://community.d2l.com/brightspace/kb/articles/5387-import-and-manage-scorm  
Documents static “Display this version” versus dynamic “Always display latest”, version replacement/revert and player/grade/review-retake settings. The current inspected pages did not contain the earlier claimed blanket rule that every new version resets progress. Do not infer universal preservation either.

**S3 — Rustici Software, SCORM Run-Time Reference**  
https://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/  
Implementation-provider reference for API calls, error codes, suspend/entry/mode and data elements. SCORM 2004 3rd/4th Edition suspend_data SPM is 64,000; 1.2 is 4,096. Keep edition distinctions explicit. The handoff's 56,000 wire cap is an independent conservative product decision. This reference is not a tenant performance test or proof of server durability.

**S4 — Mozilla, Storage quotas and eviction criteria**  
https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria  
Supports treating browser storage as origin-scoped, quota-limited and potentially evictable rather than a permanent backup. Exact policy/partition behaviour varies by browser and embedding context.

**S5 — W3C, Indexed Database API 3.0**  
https://w3c.github.io/IndexedDB/  
Transaction/store semantics inform the requirement to await a successful storage transaction rather than label a queued write complete.

**S6 — Mozilla, Navigator.onLine**  
https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine  
Explains why online status is an unreliable reachability signal. We do not use it as proof the LMS received data.

**S7 — Mozilla, Web Locks API**  
https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API  
Supports same-origin coordination; does not provide cross-device locking. The fallback lease and single-writer policy are our design requirements.

**S8 — Mozilla, beforeunload event**  
https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event  
Describes lifecycle unreliability and reasons not to depend on unload alone. Regular save scheduling and recovery are separate product controls.

**S9 — ProseMirror, official document model repository**  
https://github.com/ProseMirror/prosemirror-model  
https://code.haverbeke.berlin/prosemirror/prosemirror-model  
The official GitHub repository states it moved to the maintainer-hosted location. It describes the schema-based document model and MIT licensing. The public documentation guide/reference endpoints returned HTTP 403 during this handoff research; no claim is made that a particular release was downloaded or browser-tested. Codex must resolve and pin a maintained actual version before implementation.

**S10 — W3C, WCAG 2.2**  
https://www.w3.org/TR/WCAG22/  
Accessibility benchmark; the handoff targets AA but is not a conformance certification. Product-specific target sizes and test dimensions are design choices.

**S11 — fflate, maintainer repository**  
https://github.com/101arrowz/fflate  
Candidate locally bundled gzip implementation. No production dependency is installed by this handoff; exact version/license and bounded-decompression integration require implementation review. Node's zlib is used only in the included codec oracle tests.

## File evidence
The original ZIP, six source files and supplied reference images were inspected in the working container. `verification/original-source-inventory.json` and `reference/reference-manifest.json` record exact hashes and roles. The original README expressly calls it a development ZIP, not a SCORM package. The audit's file sizes, functions and fixed storage keys derive from these actual files, not a web description.

## Verification not performed here
No authenticated Brightspace learner launch, package upload/version replacement, real assignment submission, district retention audit, teacher approval of guides or production editor end-to-end test. All such outcomes remain NOT RUN or approval-required. See the separate QA report for the exact local handoff checks that were executed.
