# Studio real-time editability Phase 0.5 contracts

- Date: 2026-08-14
- Status: implemented locally through the census and ephemeral-preview checkpoints; independent implementation audit and exact-head CI are pending
- Applies to: element-level editability census and ephemeral Studio preview
- Accepted inherited baseline: Direct Editing at `e71241433e173c7617dbf5ea5e5ddcc5bf712c11`
- Plan-audit disposition being resolved: **REQUEST CHANGES** at `a5645d2ef8e40487b6afa7c9d4a95fadd8dc233a`
- Parent product plan: [`2026-08-13-studio-real-time-editability-and-rollout.md`](2026-08-13-studio-real-time-editability-and-rollout.md)
- Independent audit protocol: [`../audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md`](../audits/2026-08-13-chatgpt-pro-real-time-editability-audit-plan.md)

## Purpose and authority

This document locks the measurement and preview-authority contracts that were missing from the first real-time editability plan. It began as a non-behavioural specification checkpoint; the August 14 implementation now maps these contracts into shared schemas, a read-only rendered census, server preview normalization, an ordered inert-overlay bridge, bounded memory-only image preview, and teacher-facing controls.

The words **must**, **must not**, **required**, and **prohibited** are normative. An implementation may choose different internal names only when its public schemas, invariants, failure behavior, and audit evidence remain equivalent.

Implementation does not itself constitute independent approval. The audit packet must verify the code against every contract below and distinguish local evidence from exact-head CI, teacher rollout, Brightspace, deployed-host, cross-browser SCORM, and full-WCAG acceptance.

## Implementation correspondence

- Shared inventories, candidates, reasons, report shapes, and limits: `app/shared/course-editability.ts`.
- Mutation-prohibited loader and adapter inventories: `scripts/lib/course-editability/read-only-project.ts` and `inventory.ts`.
- Fresh-context Chromium collection, runtime semantic candidates, state/network/storage instrumentation, and production Resolve parity: `scripts/lib/course-editability/rendered.ts`.
- Non-overlapping scoring, cross-surface duplicate ownership, canonical JSON, digest, and repository residue proof: `scripts/lib/course-editability/scoring.ts` and `report.ts`.
- CLI and exact-head workflow: `scripts/report-course-editability.ts`, `package.json`, and `.github/workflows/studio-direct-editing.yml`.
- New-course enforcement: `scripts/lib/new-course-readiness.ts`, `scripts/verify-new-course-readiness.ts`, the versioned manifest marker, and `.github/workflows/new-course-readiness.yml`. Policy inception grandfathers the existing catalog while additions, activation/onboarding, and later governed project/resource changes must pass the fresh-course floor plus a reversible public-route lifecycle.
- Preview authority and in-memory assets: `app/server/lib/course-edit-preview.ts`, `course-edit-preview-assets.ts`, and the canonicalizer in `course-editing.ts`.
- Ordered bridge and inert overlay: `app/shared/preview-bridge.ts` and `app/server/preview-bridge-runtime.ts`.
- Teacher workflow and reset handling: `app/studio/src/hooks/useCourseEditing.ts`, `usePreviewScrollSync.ts`, `components/CourseEditPanel.tsx`, and `App.tsx`.

The collector treats attempted storage writes as a surface-level `storage-write-attempt` and nulls that surface. Because every surface uses a fresh non-persistent context and the temporary browser profile closes before repository proof, a blocked attempt is reported separately from actual persistent browser residue. Native `<details>` content uses the explicit bounded state key `native-details-open`; custom tabs, selectors, or runtime module states remain incomplete until their adapter declares or implements them.

## Truth boundary

The inherited Direct Editing baseline remains accepted. This specification does not reopen its source ownership, Apply, rebuild, learner-render, recovery, export-freshness, or Undo decisions.

The following claims remain unproven until later exact-head implementation evidence exists:

- the percentage of routine content editable in any legacy course;
- the percentage of routine content editable in a newly generated course;
- complete learner-surface inventory for the current catalog;
- immediate preview while typing;
- preview and Apply parity;
- teacher acceptance.

`50 / 63` remains a course-level reversible-lifecycle result. It must never be presented as element, page, text, or capability coverage.

## Contract 1 — authoritative learner surfaces

### Schema

The census must use a versioned adapter-owned inventory, not Studio's bounded HTML picker scan.

```ts
type LearnerSurfaceInventorySource = "manifest" | "course-outline" | "adapter";

type LearnerSurface = {
  surfaceId: string;
  projectSlug: string;
  htmlPath: string;
  route: string;
  stateKey: string | null;
  inventorySource: LearnerSurfaceInventorySource;
};

type LearnerSurfaceInventoryErrorCode =
  | "manifest-missing"
  | "manifest-invalid"
  | "driver-unsupported"
  | "declared-page-missing"
  | "route-declaration-missing"
  | "state-declaration-missing"
  | "factory-outline-invalid"
  | "snapshot-boundary-invalid"
  | "inventory-truncated"
  | "inventory-timeout"
  | "inventory-internal-error";

type LearnerSurfaceInventory = {
  schemaVersion: 1;
  complete: boolean;
  surfaces: LearnerSurface[];
  errorCode: LearnerSurfaceInventoryErrorCode | null;
};
```

`htmlPath` is a normalized workspace-relative HTML path. `route` is the normalized path, query, and hash used to display the surface from that HTML document. `stateKey` identifies a required learner state that cannot be represented by the route alone, such as an outline lesson ID, selected tab, or paginated module state. It is `null` only when loading the route is sufficient to display the complete surface.

`surfaceId` must be deterministic. Schema V1 defines it as `ls1:` plus the first 24 lowercase hexadecimal characters of SHA-256 over the UTF-8 sequence:

```text
projectSlug NUL htmlPath NUL route NUL stateKey-or-empty
```

The same tuple may occur only once. Surfaces are sorted by `htmlPath`, `route`, and `stateKey` using Unicode code-point order before serialization.

### Complete means complete

`complete: true` means the adapter has enumerated every learner page, route, and required content state inside its declared authoring boundary. It does not mean that a bounded scan found some HTML files.

The inventory must be `complete: false` when any of these conditions applies:

- a declared page, route, or state cannot be loaded;
- the adapter knows that runtime routes or lesson states exist but cannot enumerate them;
- a fallback scan reaches an entry, directory, depth, time, or memory limit;
- the source outline and generated learner routes disagree;
- duplicated IDs or non-deterministic ordering prevent a stable inventory;
- the adapter cannot prove that its declaration is exhaustive.

When `complete` is false, `errorCode` must be non-null and no coverage percentage may be emitted for that project or any aggregate containing it. Partial surface results may remain as diagnostics, clearly labeled incomplete.

An inventory with zero surfaces is never a successful complete inventory for an enabled learner course. It is `complete: false` with a bounded error.

### Adapter ownership

Each supported adapter must implement one inventory provider behind a shared exhaustive adapter dispatch. Coverage code must not infer a provider from filenames or reuse another adapter's rules.

Direct and snapshot projects use this exact future `authoring.learnerSurfaces` declaration:

```ts
type ProjectLearnerSurfaceDeclaration = {
  htmlPath: string;
  route: string;
  stateKey: string | null;
};

type ProjectLearnerSurfacesV1 =
  | {
      schemaVersion: 1;
      mode: "static-pages-complete";
      pages: Array<{ htmlPath: string; route: string }>;
    }
  | {
      schemaVersion: 1;
      mode: "declared-routes-and-states";
      surfaces: ProjectLearnerSurfaceDeclaration[];
    };
```

`static-pages-complete` is an explicit author assertion that each listed physical HTML route is one complete learner surface and that the course has no additional SPA, hash, query, tab, pagination, lesson-data, or interaction state required for content coverage. Its provider emits `stateKey: null`. If the rendered collector observes undeclared navigation/state mechanisms, it invalidates that assertion and returns `state-declaration-missing`.

`declared-routes-and-states` lists every required tuple explicitly. `htmlPath` must name a declared canonical HTML file for Direct or preserved canonical HTML file for snapshot. Duplicate normalized tuples, an empty list, missing files, cross-workspace paths, or a route that cannot be reached from the declared HTML page makes the inventory incomplete.

The field is required before a Direct or snapshot provider may return `complete: true`. Omission never defaults to static completeness. Phase 1A may leave a project incomplete rather than guessing; declaration onboarding is a separate evidence-producing change.

| Adapter | Authoritative inventory source | Completeness rule |
| --- | --- | --- |
| Direct | Explicit learner-surface declarations in project metadata, backed by declared canonical HTML files | Static HTML-only courses may declare one route per canonical HTML page. SPA/hash/query/state courses must declare every required route/state. Missing runtime declarations make the inventory incomplete. |
| English factory | The factory-owned unit/lesson outline used to generate learner navigation | Every outline-owned learner lesson must reconcile to one generated route/state. The workspace scan is not authority. |
| Social factory | The checksum-backed Social course/lesson manifest used by the owning builder | Every declared issue/module/lesson learner state must reconcile to one generated route/state. |
| Legacy snapshot | Explicit preserved canonical HTML pages plus any explicitly declared route/state inventory | No historical builder may run. If the preserved page contains learner states that cannot be enumerated from declarations, the inventory is incomplete. |
| Runtime-heavy | Explicit adapter or manifest route/state declarations | Absence of declarations is `route-declaration-missing` or `state-declaration-missing`, never an inferred one-page success. |

The current `listStudioHtmlFiles` function remains useful for picker diagnostics. Its bounded scan and returned filename list must never establish inventory completeness or the denominator for a product percentage.

## Contract 2 — rendered candidates and source ownership

### Two independent collectors

The census must combine two collectors:

1. **Source ownership collector** — parses the canonical source and obtains the server-authored edit map, source digest, adapter, capabilities, durable identity, and canonical owner.
2. **Rendered semantic collector** — loads each authoritative surface in an isolated Chromium context, waits for bounded settlement, and enumerates visible semantic units after learner JavaScript has run.

The source collector cannot enumerate runtime-created content. The rendered collector cannot grant source ownership. Neither collector is sufficient alone.

The required reconciliation pipeline is:

```text
rendered semantic occurrence
  -> primary candidate or declared duplicate/exclusion
  -> source node match, if one exists
  -> current source/render fingerprint match
  -> actual read-only Resolve eligibility
  -> canonical owner
  -> editable or stable Annotation-only reason
```

Every candidate reported as editable must pass the actual production Resolve logic in read-only mode with the rendered fingerprints observed for that candidate. A green page-map action is informational and is not enough. The census must not implement a looser copy of Resolve.

Runtime-created content without a source node still enters the rendered denominator and receives an Annotation-only reason such as `runtime-owned` or `unsupported-component`. It must not disappear because the source collector cannot see it.

### Primary candidate schema

```ts
type CandidateKind =
  | "heading"
  | "prose"
  | "list-item"
  | "link-label"
  | "button-label"
  | "image"
  | "caption"
  | "table-cell"
  | "callout-title"
  | "callout-body"
  | "course-name";

type CourseEditCandidateClassification = "editable" | "annotation-only";

type CourseEditCandidateOwnership =
  | "source-backed"
  | "runtime-owned"
  | "unsupported-structured";

type CourseEditCandidate = {
  schemaVersion: 1;
  candidateId: string;
  surfaceId: string;
  kind: CandidateKind;
  classification: CourseEditCandidateClassification;
  ownership: CourseEditCandidateOwnership;
  reasonCode: CourseEditReasonCode;
  sourceNodeId: string | null;
  canonicalOwnerDigest: string | null;
  renderedFingerprint: string;
  normalizedTextCodeUnits: number;
  resolveChecked: boolean;
  resolveEligible: boolean;
};
```

Candidate objects are internal reconciliation records. Per-candidate rendered fingerprints and source node IDs must not be emitted in the publishable aggregate report. The report must not contain course text, HTML, attribute values, URLs, learner answers, image bytes, or text-derived hashes that are practical dictionary or correlation identifiers.

The rendered collector also records how every semantic occurrence was handled:

```ts
type CourseEditRenderedExclusionCode =
  | "not-teacher-content"
  | "layout-only"
  | "studio-owned"
  | "decorative-image"
  | "empty-semantic-unit";

type CourseEditRenderedOccurrenceDisposition =
  | { kind: "primary-candidate"; candidateId: string }
  | { kind: "duplicate-presentation"; candidateId: string }
  | { kind: "excluded"; exclusionCode: CourseEditRenderedExclusionCode }
  | { kind: "incomplete"; reasonCode: CourseEditReasonCode };

type CourseEditRenderedOccurrence = {
  schemaVersion: 1;
  occurrenceId: string;
  surfaceId: string;
  semanticKind: CandidateKind;
  disposition: CourseEditRenderedOccurrenceDisposition;
};
```

`occurrenceId` is deterministic from surface identity, semantic kind, a text-free structural fingerprint, and stable DOM-order ordinal. The publishable report contains only disposition totals and reason/exclusion histograms, not occurrence IDs.

### Non-overlapping ownership rules

The rendered collector must assign each visible teacher-content text node to at most one primary candidate. Assignment follows this order:

1. Exclude non-rendered, hidden, inert, script, style, template, metadata, and Studio-owned nodes.
2. Identify explicitly marked course-name, callout-title, callout-body, and caption units.
3. Identify semantic leaf blocks: table header/data cells, list items, headings, paragraphs, buttons, and standalone links.
4. Assign normalized visible text nodes to the nearest eligible semantic owner.
5. Do not create a parent wrapper candidate when all of its teacher text is already owned by child candidates.
6. Do not create candidates for `strong`, `em`, `span`, or similar inline formatting unless the element is the sole semantic standalone owner.
7. Collapse presentation duplicates only when they prove the same canonical owner. Record each collapsed occurrence separately; it cannot add to the editable numerator.
8. If apparently duplicated content cannot prove a common canonical owner, keep one primary candidate and classify the additional occurrence as Annotation only with `duplicate-presentation` rather than guessing.

Normative examples:

- `<p>Read the <a>assignment guide</a>.</p>` is one `prose` candidate. The link destination is a capability opportunity attached to it; the link label is not a second primary block.
- A standalone navigation/content link with no owning prose block is one `link-label` candidate.
- An image is one `image` candidate. Image source, alt, and title are separate capability opportunities, not three blocks.
- A heading containing a link is one `heading` candidate plus a link-destination opportunity.
- A list is not a candidate. Each visible list item is one candidate; nested child list items own their own text, and the parent owns only its remaining direct text.
- A table is not a candidate. Each visible header or data cell is one `table-cell` candidate.
- A card wrapper is not a candidate when its heading and body already form candidates.
- Repeated mobile and desktop presentations do not count twice when they prove the same canonical owner.

`candidateId` is deterministic from the surface ID, kind, canonical owner digest when present, rendered structural fingerprint, and occurrence ordinal after stable DOM-order traversal. It must not depend on raw text.

### Capability opportunities

Block coverage and field/capability coverage are separate metrics.

```ts
type CourseEditCapabilityOpportunityKind =
  | "rich-text"
  | "link-destination"
  | "image-source"
  | "image-alt"
  | "image-title"
  | "curated-style"
  | "rename-synchronization";

type CourseEditCapabilityOpportunity = {
  schemaVersion: 1;
  opportunityId: string;
  candidateId: string;
  kind: CourseEditCapabilityOpportunityKind;
  supported: boolean;
  reasonCode: CourseEditReasonCode;
};
```

One candidate may own multiple opportunities. Multiple links inside one prose candidate create multiple distinct link-destination opportunities. Capability opportunities never change the primary block denominator.

## Contract 3 — stable reasons and complete classification

Human-readable explanations are presentation text. Historical measurement must use versioned stable codes.

```ts
type CourseEditReasonCode =
  | "ready"
  | "runtime-owned"
  | "ambiguous-identity"
  | "complex-structure"
  | "unsupported-component"
  | "not-canonical"
  | "stale-source"
  | "render-source-mismatch"
  | "resolve-rejected"
  | "uninspectable-page"
  | "surface-inventory-incomplete"
  | "candidate-truncated"
  | "duplicate-presentation"
  | "intentional-annotation-only"
  | "storage-write-attempt"
  | "service-worker-attempt"
  | "project-repair-attempt"
  | "external-network-attempt"
  | "surface-timeout"
  | "surface-memory-limit";
```

Changing teacher-facing wording must not change a reason code. Adding or removing a code requires a schema-version change or a backward-compatible versioned reason registry.

Every rendered semantic occurrence must end in exactly one of these states:

- represented by one primary candidate;
- recorded as a proven duplicate of a named primary candidate;
- recorded as a non-content exclusion with a stable exclusion code;
- causes the surface to become incomplete.

There is no silent omission state.

## Contract 4 — scoring rules

### Status before percentage

```ts
type CourseEditCoverageStatus =
  | "complete"
  | "no-candidates"
  | "incomplete"
  | "error";
```

A percentage is legal only when status is `complete` and the denominator is greater than zero. `no-candidates`, `incomplete`, and `error` use `percentage: null`.

A surface, project, or aggregate is `incomplete` when any included inventory is incomplete, a collector truncates, any semantic occurrence is unresolved, Resolve parity is skipped for an editable candidate, or the read-only residue proof fails. Partial counts remain diagnostics only.

The UI map's 4,000-entry limit must not be reused as a census limit. Phase 1 must stream or paginate internal results. A separate hard resource ceiling is still required; reaching it produces `candidate-truncated`, status `incomplete`, and a null percentage.

### Primary metrics

For a complete non-empty scope:

```text
blockCoverage = editable primary candidates / all primary candidates

teacherTextCoverage = normalized text code units belonging to editable
                      text-bearing primary candidates
                      / normalized text code units in all text-bearing
                        primary candidates
```

Project and catalog totals use sums of raw numerators and denominators. They must never average page percentages.

The report must include raw numerators, denominators, an unrounded decimal ratio, and a display percentage derived only at presentation time. Candidate counts are broken down by kind. Capability opportunities are broken down by opportunity kind with their own supported/total counts.

### Fresh-course acceptance floor

A fresh course created by the Studio-aware Codex generator passes the routine-content threshold only when all of these are true:

- learner-surface inventory is complete;
- every rendered semantic occurrence is reconciled;
- overall block coverage is at least 0.90;
- aggregate teacher-text code-unit coverage is at least 0.90;
- each standard candidate kind promised by the generator profile and present in the fixture has block coverage of at least 0.80;
- `course-name` and `rename-synchronization` are 1.00 when Rename is promised;
- promised link-destination, image-source, and image-alt opportunity coverage is at least 0.90;
- no surface is incomplete, truncated, or scored as zero-candidate success;
- the fixture contains every standard block kind promised by that generator profile and at least one intentional runtime/structured Annotation-only region.

These floors prevent an easy prose-heavy fixture from hiding an uneditable promised category. They do not establish a 95% product claim.

Legacy courses receive measurements, not a universal acceptance floor. Their migration priority is determined by teacher value, code-unit impact, reason, and canonical ownership—not by the easiest raw count increase.

## Contract 5 — read-only census execution

### Repository loader

Coverage must use a new explicit read-only project inspection context. It must not call a loader that can import, repair, materialize, rebuild, update metadata, create a lock, recover a transaction, or publish an asset.

In particular, the census must not reach `ensureProjectFromProcessedSnapshot` through `loadProjectManifest`, `listProjectSlugs`, or `readStudioProjectBundle`. A missing project or manifest is a bounded inventory error. Auto-import is prohibited.

The inspection context must expose read operations explicitly and reject mutation-capable dependencies during construction. Attempted repair becomes `project-repair-attempt`, invalidates the project score, and fails the command's acceptance exit code.

### Browser isolation profile

Every learner surface runs in a fresh, non-persistent Chromium context with this schema-V1 profile:

- no shared browser profile, cookies, cache, storage, or service workers;
- service-worker registration blocked before learner code runs;
- external HTTP, HTTPS, WebSocket, WebRTC, worker, beacon, and form traffic blocked;
- capability-scoped local preview resources allowed only for the current project/surface;
- localStorage, sessionStorage, IndexedDB, Cache Storage, cookies, and service-worker writes instrumented before learner code runs;
- storage cleared before and after the surface;
- any persistent-storage write attempt invalidates the surface with `storage-write-attempt`;
- deterministic viewport `1440 x 1000`, device scale factor `1`, locale `en-CA`, timezone `America/Edmonton`, light color scheme, and reduced motion;
- wall clock fixed to the reviewed Git commit timestamp while monotonic timers continue normally;
- no browser context reused between routes or states;
- navigation deadline of 30 seconds, bounded settlement window of 5 seconds, and total surface deadline of 45 seconds;
- one surface per worker, maximum two workers, 512 MiB browser-process RSS ceiling per worker, and a 50,000 rendered-occurrence ceiling per surface.

The final implementation may lower resource ceilings after representative evidence, but it may not raise or remove them silently. Limits and the observed limit outcome must appear in the report schema.

### Read-only residue proof

The command must capture and compare before/after fingerprints for:

- tracked repository files;
- each project workspace, metadata, and resource boundary;
- exports;
- Studio edit metadata, drafts, locks, checkpoints, journals, and recovery directories;
- generated factory workspaces;
- browser storage residue.

Only the declared ignored report file may change. The first implementation must run in a disposable checkout and prove two consecutive normalized runs produce byte-identical report evidence. Any other mutation makes the run non-publishable and exits non-zero.

## Contract 6 — report and digest

The Phase 1 report must separate deterministic evidence from optional execution diagnostics. The publishable report file contains deterministic evidence only.

Minimum top-level fields:

```ts
type CourseEditabilityCoverageReport = {
  schemaVersion: 1;
  exactCommit: string;
  commitTimestamp: string;
  worktreeClean: boolean;
  inventorySchemaVersion: 1;
  candidateSchemaVersion: 1;
  reasonRegistryVersion: 1;
  isolationProfileVersion: 1;
  limits: Record<string, number>;
  projects: CourseEditabilityProjectReport[];
  aggregate: CourseEditabilityAggregate;
  residue: CourseEditabilityResidueProof;
  reportDigest: string;
};
```

Canonical serialization rules are fixed:

1. UTF-8 without BOM.
2. Object keys sorted recursively by Unicode code point.
3. Arrays sorted by their schema-defined stable keys; arrays whose order is semantically meaningful declare that order explicitly.
4. Integers serialized in base 10 with no leading zero; ratios serialized as numerator and denominator integers, never platform-formatted floats.
5. No volatile wall-clock generation time, absolute path, hostname, username, duration, random ID, or course content in the publishable object.
6. `commitTimestamp` is the exact reviewed commit timestamp and is deterministic for that SHA.
7. `reportDigest` is lowercase SHA-256 of the canonical JSON object with `reportDigest` omitted.
8. The final file is the canonical object with `reportDigest` inserted and one trailing newline.

Dirty-worktree runs may produce local diagnostics, but `worktreeClean: false` makes them ineligible as acceptance evidence. CI artifacts must bind the report digest to the workflow's exact SHA.

## Contract 7 — canonical preview normalization

Preview must not display a raw browser-created patch. The only allowed flow is:

```text
teacher input
  -> bounded Normalize Preview request
  -> server re-resolves current target
  -> server runs the same sanitizer and capability/no-op logic as Apply
  -> server returns canonical patch, digest, and inert render representation
  -> Studio stores the canonical patch
  -> presentation overlay displays only the returned representation
  -> Apply re-resolves and re-normalizes, then requires the same digest
```

The server normalization route must use the production target resolver and a single shared side-effect-free canonicalizer extracted from the current Apply `sanitizeDraft` behavior. Apply must call that same canonicalizer again; preview normalization never substitutes for Apply preflight.

```ts
type CourseEditPreviewNormalizeRequest = {
  schemaVersion: 1;
  previewSessionId: string;
  revision: number;
  projectSlug: string;
  identity: CourseEditTargetIdentity;
  patch: CourseEditPatch;
  pendingAssets: CourseEditPendingAssetReference[];
};

type CourseEditPreviewNormalizeResponse = {
  schemaVersion: 1;
  previewSessionId: string;
  revision: number;
  pageIdentity: string;
  mapSourceDigest: string;
  targetNodeId: string;
  canonicalPatch: CourseEditPatch;
  canonicalPatchDigest: string;
  representation: CourseEditPreviewRepresentation;
};
```

The response representation may contain only sanitized inert rich text, normalized display values, curated semantic style tokens, and capability-scoped image-preview URLs. It must not contain script, handler, executable URL, arbitrary selector, arbitrary CSS, filesystem path, or unsanitized teacher input.

Canonical patches saved after this feature lands must carry `canonicalPatchDigest`. Apply re-normalizes against current source and fails the whole batch without writes when the resulting digest differs. Older draft schemas must be explicitly normalized and upgraded before they can be previewed or applied; they must not be silently trusted.

Preview/Apply parity is field-exact for normalized rich text, rendered text, link destination, image digest/source semantics, alt, title, and curated style keys. After Apply/rebuild/reload, the rendered target must also match the representation's bounded computed-presentation fields for font family, font size, line height, weight, alignment, direction, foreground/background color, and spacing. Numeric pixel fields allow at most one device-independent pixel of rounding difference; normalized colors and enum fields must match exactly. A mismatch rejects the checkpoint even when both versions look individually reasonable.

## Contract 8 — preview session and ordering protocol

Every preview command and acknowledgement must include:

```ts
type CourseEditPreviewEnvelope = {
  previewSessionId: string;
  revision: number;
  projectSlug: string;
  pageIdentity: string;
  mapSourceDigest: string;
  targetNodeId: string;
  canonicalPatchDigest: string;
};
```

`previewSessionId` is a server-bound cryptographically random identifier for one selected target and one preview generation. `revision` is a positive safe integer that increases monotonically within that session.

Protocol rules:

- normalization responses and bridge commands with a revision less than or equal to the last accepted revision are ignored and acknowledged as stale;
- a target, page, project, source digest, or session mismatch fails closed;
- Clear carries the next revision and closes the session generation;
- a closed generation can never be revived by a late Normalize response or bridge command;
- selecting another target always creates a new session ID;
- an ACK echoes the entire envelope plus `applied`, `stale`, `rejected`, or `cleared`;
- Studio renders only the highest acknowledged revision;
- Apply closes the preview generation before any mutation request starts.

The state machine is:

```text
baseline
  -> unsaved-preview
  -> saved-draft-preview
  -> applying
  -> applied | rejected-and-restored
```

`Save draft` stores the canonical patch and digest in Studio draft storage but makes no repository write. `rejected-and-restored` means the learner view is baseline and drafts remain available; Studio must create a new session and re-normalize before showing that draft again.

## Contract 9 — non-mutating preview renderer

V1 preview must use a host-owned inert presentation overlay. Generic learner-node mutation is prohibited.

The renderer lives outside the learner document, above the cross-origin iframe in the Studio or Full Preview host. The course bridge reports bounded target geometry and presentation descriptors tied to the preview envelope.

```ts
type CourseEditPreviewPlacement = {
  targetNodeId: string;
  viewportRevision: number;
  rect: { x: number; y: number; width: number; height: number };
  clippingRect: { x: number; y: number; width: number; height: number } | null;
  presentation: {
    fontFamily: string;
    fontSizePx: number;
    lineHeightPx: number;
    letterSpacingPx: number;
    fontWeight: 300 | 400 | 500 | 600 | 700 | 800 | 900;
    textAlign: "left" | "center" | "right" | "start" | "end";
    direction: "ltr" | "rtl";
    foregroundRgba: string;
    backgroundRgba: string;
    borderRadiusPx: number;
    paddingPx: { top: number; right: number; bottom: number; left: number };
  };
};
```

Geometry and numeric fields are finite and clamped to the current iframe viewport. RGBA fields must parse as bounded numeric `rgba(r,g,b,a)` values. `fontFamily` is at most 256 code units and must parse only as a comma-separated CSS family-name list; URL, function, control character, or declaration delimiters are rejected. No raw `cssText`, CSS variable, URL, transform, selector, or unbounded font-family string crosses the bridge. `viewportRevision` increases on every scroll, resize, zoom, or layout change so stale geometry cannot reposition a newer representation.

One normalized representation may contain up to 12 server-authorized placements on the current surface for a coordinated operation such as Rename. Each placement node must exist in the current page map and share the same map source digest. Cross-page placements are never kept alive across navigation.

The host renders the server-normalized representation in an overlay with:

- no insertion into or attribute/text mutation of the learner DOM;
- `pointer-events: none`, `inert`, and `aria-hidden="true"`;
- no IDs, names, form participation, tabbable descendants, navigation, script, media autoplay, or executable URLs;
- dimensions and clipping bounded to the selected target;
- a visible `Unapplied preview` status outside the course content;
- geometry refresh tied to the same session/revision after scroll or resize;
- immediate removal on Clear, stale geometry, navigation, disconnect, or mode reset.

The original learner subtree, node identity, event listeners, framework references, focus state, accessibility tree, form state, and runtime data remain untouched. Restoring an `innerHTML` snapshot is not an accepted reset mechanism.

Strict leaf-only learner-node mutation is deferred and is not part of V1. Adding it later requires a separate audited contract and reload-based recovery when object-identity preservation cannot be proven.

## Contract 10 — ephemeral image preview

The current asset upload writes canonical and workspace files and therefore cannot be called while choosing or previewing an image.

Phase 2 must add a validation-only service with this flow:

1. Studio uploads bounded bytes to a preview-only endpoint.
2. The server fully decodes and validates the image using the accepted format, pixel, dimension, and channel limits.
3. The server retains only the validated encoded bytes and metadata in process memory; decoded buffers are released.
4. The server returns an opaque pending-asset reference plus a capability-scoped URL served on the isolated preview origin.
5. The reference is bound to project, page identity, target node, preview session, source digest, byte digest, and image metadata.
6. The overlay may display the preview URL. The canonical patch records the deterministic future materialized `src` and asset digest, never the preview URL.
7. Save draft stores the pending asset digest/metadata but makes no repository write.
8. Reopening a saved draft may rebind still-live bytes to a new preview session only after the server re-resolves the same project/page/target/source identity and matches the full byte digest. Rebinding never returns bytes or broadens project scope.
9. Apply carries the pending-asset references beside the canonical drafts, resolves them from the server memory store by exact project/target/digest binding, persists them inside the protected Apply transaction, materializes the final path, and validates the final decoded identity and dimensions.
10. If the process, token, or bytes have expired, Apply fails residue-free and asks for re-upload. It must not silently apply only the text portion of the draft.

```ts
type CourseEditPendingAssetReference = {
  assetDigest: string;
  mimeType: "image/png" | "image/jpeg" | "image/gif";
  byteLength: number;
  width: number;
  height: number;
  materializedSrc: string;
};
```

The session-only capability token and preview URL are never stored in the draft patch, report, source, metadata override, or export.

Schema-V1 limits are:

- 10 MiB encoded bytes per image;
- 32 million decoded pixels and at most four decoded channels;
- five live images and 25 MiB encoded bytes per preview session;
- 256 MiB encoded bytes across the server;
- at most two concurrent decodes;
- 10-minute idle TTL and 30-minute absolute lifetime;
- `Cache-Control: no-store` on preview responses.

Pending bytes expire on Cancel, target/page/project navigation, disconnect, Apply completion or rejection, session close, TTL, or process exit. Global pressure evicts the least-recently-used closed/idle session first; evicting an active pending asset produces an explicit error rather than a partial Apply.

Final parity compares the pending byte digest, decoded type, dimensions, and learner-render natural dimensions. Literal equality between the ephemeral URL and final materialized `src` is neither expected nor sufficient.

## Contract 11 — reset and Studio interaction matrix

Every row must have an automated outcome before Preview checkpoint approval.

| Event | Required outcome |
| --- | --- |
| Cancel or target change | Close session, remove overlay, retain no pending representation. |
| Focus ↔ Split | Close the geometry generation; retain editor input, create a new session and re-normalize only if the teacher resumes preview. |
| Original ↔ Current | Original always shows baseline with no overlay. Returning to Current requires a new session. |
| Desktop/tablet/mobile or zoom | Close and recreate the geometry generation after layout settles; stale ACKs cannot repaint it. |
| Full Preview open/close | Do not transfer a live session. The destination may start a new session from the canonical saved draft. |
| Project, root, page, route, state, or preview-mode change | Close session, evict bound assets, and remove overlay before navigation. |
| Annotation transition | Close preview before Annotation becomes active. |
| Browser back/forward or iframe reload | Close session; no automatic revival from cached messages. |
| Bridge disconnect/reconnect | Close session and require fresh Resolve plus Normalize. |
| Source digest drift | Reject Normalize/preview, clear overlay, and require reload. |
| Save draft | Enter `saved-draft-preview`; draft remains explicitly unapplied. |
| Multi-draft Apply | Clear the one selected overlay before preflight; no draft is visually treated as applied until the whole batch succeeds. |
| Apply success | Reload learner output, prove final render, enter `applied`. |
| Apply rejection | Show baseline, retain canonical drafts, enter `rejected-and-restored`; re-preview requires a new session. |
| Screenshot capture | Disabled while any unsaved or saved-draft preview overlay is visible, with a teacher-facing explanation. |
| Review Set save/copy | Disabled while a preview overlay is visible so unapplied content cannot enter review evidence without provenance. |

Disabling capture and Review Set evidence while an overlay is visible is the V1 decision. A future workflow that captures unapplied preview must burn a visible marker into the image and store an explicit `unapplied-preview` evidence state; that is outside this phase.

## Contract 12 — teacher-rollout evidence

Teacher acceptance requires quantitative evidence, not twenty unstructured paragraph edits.

Minimum cohort:

- at least 20 observed sessions;
- at least five distinct teachers;
- at least two teachers new to Studio and two regular Studio users;
- no one participant supplies more than 40% of sessions;
- the four accepted adapter representatives plus at least six additional high-use courses.

Predetermined task coverage across the cohort:

- five text/prose tasks;
- three rich-text tasks;
- three link tasks;
- three image-plus-alt tasks;
- two curated-style tasks;
- two Rename tasks;
- two intentional rejection/reset tasks;
- two drift-safe Undo refusal tasks.

Exit metrics:

- non-image preview acknowledgement median at or below 200 ms and p95 at or below 750 ms after the input debounce;
- validated image preview acknowledgement p95 at or below 2.5 seconds for in-limit files;
- at least 90% completion of supported ordinary tasks without Codex;
- zero false-editable incidents;
- false Annotation-only rate below 5% on independently verified safe targets;
- valid supported-task Apply rejection rate at or below 5%;
- zero preview/Apply material mismatches;
- zero silent corruption, unsafe Undo, or unexplained residue;
- no more than 0.25 recorded workflow-confusion incidents per session;
- Codex handoff rate reported by task class rather than treated as a generic failure.

Any P0/P1 event stops rollout regardless of aggregate metrics.

## Implementation sequence after specification approval

### Phase 1A — schemas and inventory

- add shared versioned inventory, candidate, opportunity, reason, scoring, and report types;
- add a mutation-prohibited project reader;
- implement exhaustive adapter inventory providers;
- test static pages, SPA/hash/query routes, factory outline states, snapshots, missing declarations, duplicates, and incomplete inventories.

### Phase 1B — dual census and deterministic evidence

- implement source ownership and rendered semantic collectors;
- reconcile through actual read-only Resolve;
- stream candidates without the UI-map cap;
- enforce browser isolation and residue proof;
- publish the deterministic report command and exact-head artifact only after focused tests pass.

### Phase 2A — preview authority

- extract one shared canonical server normalizer used by Normalize Preview and Apply;
- land schema validators, session/revision state machine, ACK behavior, and adversarial ordering tests;
- land the memory-only image service and Apply-owned materialization.

### Phase 2B — host overlay and teacher UI

- add the inert host overlay;
- wire debounced controls to Normalize Preview;
- implement the complete reset matrix and visible state labels;
- prove preview/Apply parity and zero learner-state/file writes across supported capabilities.

Phase 3 new-course measurement, Phase 4 legacy migrations, and Phase 5 teacher rollout retain the parent plan order.

## Specification exit gate

An independent reviewer may approve Phase 0.5 only when the review confirms all of the following:

- “learner surface,” “candidate,” “editable,” “duplicate,” “incomplete,” and “preview” have non-circular definitions;
- adapter inventory cannot be replaced by bounded HTML discovery;
- runtime-only content stays in the rendered denominator;
- primary blocks and capability opportunities cannot double-count one another;
- a truncated, incomplete, mutated, or zero-candidate surface cannot produce a flattering percentage;
- census loading cannot auto-import or repair a project;
- editable classification requires actual read-only Resolve parity;
- raw input cannot cross into the preview renderer without server canonicalization;
- ordering and reset behavior cannot revive stale preview state;
- the renderer never mutates the learner subtree;
- image preview is memory-only until the protected Apply transaction;
- teacher rollout has measurable representation, latency, correctness, and confusion gates.

Until that independent approval, the correct disposition is:

- inherited Direct Editing baseline: **GREEN / GO**;
- Phase 0.5 specification: **READY FOR AUDIT**;
- element census: **NOT AUDITABLE YET / NOT IMPLEMENTED**;
- ephemeral preview: **NOT AUDITABLE YET / NOT IMPLEMENTED**;
- fresh-course threshold, legacy migration, and teacher rollout: **NOT AUDITABLE YET / NOT IMPLEMENTED**.
