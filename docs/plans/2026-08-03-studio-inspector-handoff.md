# Studio Inspector and Codex Handoff Implementation Plan

- Status: implemented through the Inspector, private preview bridge, and consent-based screenshot annotation; a real Science course remains intentionally blocked until its source ZIPs are supplied
- Date: 2026-08-03
- Scope: the Studio shell, preview safety boundary, provenance metadata, and an API-free handoff workflow
- Explicitly out of scope: changing any current Social or English learner content; editing raw or exported artifacts; inventing a Science factory before real Science source material exists

## Implementation record — 2026-08-04

The planned workflow is now implemented in the Studio shell without changing a current learner course.

- The unused API Assistant, its server route, provider code, dependencies, and saved UI state are gone.
- Preview content runs on a dedicated read-only `127.0.0.1` origin. It has no Studio APIs, rejects traversal and symlink escapes, pins the Studio parent through CSP, and denies screen capture permission.
- Studio and preview use an early-injected private `MessageChannel`, not a URL or browser-storage nonce. A preview can report bounded opaque facts only; it cannot name a source file or command.
- Inspect resolves the existing direct, Social, and English ownership patterns as `exact`, `bounded`, or `unknown`; Social and English generated workspaces remain non-edit targets.
- A direct static workspace can now include its verified current source line in the handoff. Generated Social and English workspaces intentionally keep that field empty because their displayed HTML is not the source of truth.
- Copy for Codex is a teacher-triggered bounded text packet with an issue focus and note. It contains no full source, absolute path, browser storage, or image data.
- Screenshot annotation is now an optional, consent-gated extension: Studio asks the browser for one tab frame only after the teacher clicks the control, registers it for cleanup as soon as permission resolves, stops it after the one frame and even if selection refresh fails, crops to the visible preview, keeps the working image only in memory, and requires a separate Download or Discard action.
- Inspection failures return a fixed bounded message instead of raw filesystem errors, so a malformed request cannot reveal an absolute local path.
- The Science intake and decision-log workflow is ready for the first real source-backed unit. Phase 6 cannot honestly be marked complete until real Science source archives and a representative-unit decision exist.

Focused proof currently includes 20 Inspector/security tests, four Inspector browser tests, Studio production build, direct/Social/English ownership checks, and path/origin negative tests. Repository-wide typecheck retains pre-existing unrelated errors; the implementation adds none.

## Historical pre-implementation plan

The remaining sections record the original vetted rationale, design choices, and phase gates. When they conflict with the implementation record above, the implementation record is current: the nonce design was replaced by a private port handshake, and the later consent-based screenshot phase has now passed its local implementation gate.

## Plain-English outcome

Canvas Studio will stop offering its unused API Assistant. In its place, it will give you a focused way to point at something in a live course preview and produce a truthful, compact handoff for Codex.

The first useful version works like this:

1. Open a project in Studio and turn on Inspect.
2. Hover and click a meaningful learner-facing block.
3. Choose what you want help with: content, layout, interaction, accessibility, or unsure.
4. See the repository-owned answer to: what created this, where should it actually be changed, how should it be rebuilt, and how confident is that answer?
5. Click Copy for Codex.
6. Paste the copied packet into ChatGPT Pro with the GitHub connector enabled. Paste its recommendation back into Codex for local verification and implementation.

There is no API key, automatic model call, hidden network request, automatic code write, or whole-repository context dump in this workflow.

Screenshot capture and visual annotation are now implemented as a separate, consent-based extension of the Inspect and Copy loop. Browsers do not let a Studio page silently capture pixels from an isolated preview iframe, so Studio requests a browser-tab capture only from an explicit teacher click, refreshes the selected element's geometry before capture, stops sharing immediately, and keeps the resulting image outside the text packet.

## Review result that governs this plan

This plan combines local repository evidence with an independent ChatGPT Pro red-team and green-team review. The first exact-commit green-team pass identified two real release blockers that were fixed and regression-tested locally: a late screen-share cleanup race and raw filesystem-error exposure. The final GitHub-backed re-review of `ac9081c12cf26e7d7be7db4001a5d362dabfe0ab` returned `GREEN` with no remaining must-fix items; the only remaining gates are the browser-owned manual capture checks described below.

The earlier review also established two sequencing changes and two cuts:

- Define the smallest bridge and provenance contracts before moving the preview to a separate origin.
- Build adapter conformance checks while the provenance adapters are built, not afterward.
- The original V1 excluded screenshots; the later consent-based implementation required a separate review and dedicated browser coverage before it was enabled.
- Do not build local handoff history until real use proves it is needed.

No implementation decision is considered approved simply because two models express an opinion. A decision is approved when both review paths agree on the exact repository source, risk boundary, verification evidence, and rollback condition. Codex remains responsible for checking all local facts before changing code.

## Why the current Studio cannot safely provide this yet

| Current area | Verified current behavior | Why it must change |
| --- | --- | --- |
| Assistant | The top bar opens GenerativePanel, which posts to /api/generate and ultimately depends on OpenAI or Gemini API credentials. | It is not useful without an API and leaves an unnecessary generation/write surface in the product. |
| Preview | Studio serves course previews under the same local origin as the Studio application. | A course preview with scripts cannot be treated as an untrusted document while sharing Studio's privileged origin. |
| Preview communication | Studio scroll synchronization reads iframe.contentWindow and iframe.contentDocument directly. | That prevents origin isolation and couples Studio to arbitrary course DOM. |
| Source ownership | Project manifests already know canonical entries, sources, generated outputs, and rebuild commands. Social and English have driver-specific ownership. | A clicked element cannot truthfully be mapped by guessing from generated HTML alone. |
| Existing pilots | Forensics 35 is direct-workspace; Social 30-1 Related Issue is builder-owned; ELA 20-1 Crucible is English-factory-owned. | These three different ownership models are the correct minimum proving set. |

The browser security reason is concrete: the HTML Standard warns that a same-origin iframe using both allow-scripts and allow-same-origin can remove its sandbox and reload without it. A potentially untrusted preview must therefore live on a dedicated origin with no privileged Studio endpoints. See [the HTML Standard sandbox guidance](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox).

## Product boundaries

### This feature will do

- Let a teacher inspect authored learner-facing blocks in a running preview.
- Resolve a source-of-truth result from trusted repository metadata.
- Tell Codex and ChatGPT Pro the minimal relevant evidence, including the correct canonical target or rebuild route.
- Preserve current preview behavior, including forms, navigation, and save/restore, while Inspect is off.
- Fail closed: if the source cannot be proved, the UI says Unknown rather than inventing a source file or line.

### This feature will not do

- Call ChatGPT, OpenAI, Gemini, or any other model from Studio.
- Open ChatGPT, paste into it, or read the user's clipboard automatically.
- Send full source files, DOM dumps, learner answers, cookies, tokens, or absolute machine paths in a handoff.
- Treat generated Social or English workspace HTML as the primary edit target.
- Automatically edit a course, rebuild a course, or make decisions on behalf of the teacher.
- Become a general-purpose browser developer tool.
- Create local handoff history in the first release.
- Capture a screenshot silently, accept a non-tab source, or include pixels in the copied packet.

## Target architecture and trust boundaries

### 1. Separate Studio and preview origins

Studio stays on its current local application origin. Preview content moves to a separate loopback origin on a separately allocated port, bound to 127.0.0.1.

The new preview service must serve only read-only, allowlisted preview files and its small bridge script. It must not expose Studio routes, project mutation routes, arbitrary filesystem reads, credentials, cookies, model configuration, or source-resolution APIs.

A separate port is a distinct browser origin. This means a course document may still need allow-scripts and allow-same-origin for normal course behavior, but it cannot escape into the Studio application origin. The preview service remains read-only even if a preview removes its own iframe sandbox.

### 2. A typed postMessage bridge replaces direct iframe DOM access

Studio and the preview iframe communicate through one shared, versioned protocol. Production Studio code must not read the preview iframe through contentDocument or contentWindow.document.

The bridge uses exact expected origins, the actual iframe window object, a per-preview-session nonce, schema validation, and bounded payload sizes. It never uses a wildcard target origin.

~~~ts
type PreviewBridgeEnvelope = {
  version: 1;
  sessionNonce: string;
  type:
    | "bridge-ready"
    | "set-inspect-mode"
    | "inspect-hover"
    | "inspect-select"
    | "inspect-cancel"
    | "scroll-state"
    | "restore-scroll"
    | "preview-error";
  payload: unknown;
};
~~~

The preview may send only opaque selection facts such as a node ID, a safe label, and a viewport rectangle. It must never declare a source path, source line, canonical edit target, rebuild command, or editability. The Studio server resolves those facts from repository-owned provenance.

### 3. Provenance is an ownership graph, not a guessed file name

Each resolvable inspection target has an opaque node ID and a server-validated provenance entry. The result can name several contributors, but it must clearly identify the primary place to change and whether the result is exact, bounded, or unknown.

~~~ts
type InspectionResolution = {
  projectSlug: string;
  nodeId: string;
  resolution: "exact" | "bounded" | "unknown";
  freshness: "current" | "stale" | "invalid";
  learnerArtifact: {
    repoRelativePath: string;
    role: "canonical-editable-source" | "runtime-generated-output";
  };
  primaryEditTarget?: {
    repoRelativePath: string;
    lineStart?: number;
    lineEnd?: number;
    reason: string;
  };
  contributingSources: Array<{
    repoRelativePath: string;
    role: string;
    reason: string;
  }>;
  regenerateCommand?: string;
  verificationCommand?: string;
  safeExcerpt?: string;
};
~~~

The actual wire schema will be defined in shared/server-safe types and validated at runtime. The example above shows the required meaning, not a license to trust browser-supplied values.

Every result is checked against:

- the selected project's current manifest and canonical-source rules;
- a provenance-map schema version;
- manifest, source, and generated-artifact digests;
- a repo-relative allowlist;
- the current authoring driver;
- an exact node ID that belongs to the preview artifact.

If any check fails, the UI renders Stale or Unknown and Copy for Codex does not pretend to have an exact source pointer.

Some legacy manifests still contain absolute canonical-entry paths. The resolver must use the existing course-authoring normalization in memory, then emit only a verified repo-relative target in the packet. Inspection must not rewrite a manifest merely to normalize it. Driver-specific ownership also takes precedence over a generic legacy canonical entry when an English factory or Social builder owns the learner artifact.

### 4. One adapter contract, three proof adapters

The provenance resolver has one normalized contract and three initial adapters:

| Adapter | Ownership truth | Required behavior |
| --- | --- | --- |
| Direct workspace | Declared canonical entry and canonical workspace source | Map an authored preview block to a static source span only when parser positions and current digests prove it. Otherwise return bounded or unknown. |
| Social related issues | The Social builder, named verified resource, and project manifest | Emit opaque inspection IDs and generated provenance during the owning build. Point back to the builder or declared source resource, never to generated workspace HTML as the edit target. |
| English factory | English recipe, factory renderer, custom components/assets, and manifest | Emit provenance at factory-build time. Preserve a custom component as a contributor when it owns the selected block; otherwise name the recipe/renderer path and rebuild command. |

Existing conversion source-map files may be reused only where their schema and digests prove an exact current match. They are not universal provenance authority.

For direct HTML projects, the preview service may add opaque target attributes while serving the document; it must not write those attributes back to the canonical file. For driver-owned projects, the owning builder may emit opaque markers and a generated metadata sidecar as part of its normal rebuild. No one hand-edits generated workspace output to make inspection work.

### 5. An intentionally small, manual handoff packet

Copy for Codex is a user-triggered clipboard action. It produces text only in V1 and caps the packet at 5 KB.

It includes:

- project slug, preview mode, current branch/commit when available, and a small list of changed repo-relative paths;
- the opaque inspection ID and the teacher's issue category;
- a maximum 240-character source-derived excerpt;
- exact, bounded, or unknown status and stale state;
- primary edit target only when validated;
- up to five validated contributing sources;
- rebuild and verification commands when declared;
- the teacher's optional short note;
- explicit omissions, such as screenshot not included or source resolution unknown.

It never includes:

- full DOM or HTML;
- full source files;
- absolute paths;
- form values, typed learner work, quiz answers, cookies, tokens, or browser storage;
- screenshot base64 or an image blob;
- automatic telemetry or an outbound network request.

A packet is deliberately useful enough to focus a ChatGPT Pro or Codex task, but too small to recreate the current context-window problem.

## User interaction design

### Inspect mode

- Add an Inspect control in the Studio top bar. It replaces the Assistant control; it is not an additional generator option.
- When off, the preview behaves as it does today.
- When on, the preview bridge highlights only mapped, meaningful learner-facing blocks. Form inputs, textareas, contenteditable areas, and explicitly private/no-inspect elements are excluded.
- Hover shows a modest outline and source-confidence hint. Click selects the nearest mapped authored block.
- A selected item shows a breadcrumb/label, ownership confidence, source status, and a concise explanation of why the proposed target is correct.
- The teacher chooses content, layout, interaction, accessibility, or unsure and may add a short note.
- Copy for Codex is enabled only when the inspection payload has passed validation. Unknown is still copyable only as an explicit request to investigate, not as a fictitious source location.
- Keyboard and screen-reader behavior must expose the selected target, its source status, and the copy result without relying on color or hover alone.

The existing project-information panel should stay useful as a project safety/context view. It should not be overloaded into a misleading universal source inspector.

### ChatGPT Pro and Codex operating loop

~~~text
Teacher selects a preview block
  -> Studio resolves trusted provenance
  -> Teacher clicks Copy for Codex
  -> Teacher pastes packet into ChatGPT Pro with GitHub access
  -> ChatGPT Pro returns a proposed minimal change and risk list
  -> Teacher pastes that advice into Codex
  -> Codex verifies the actual local files, applies a scoped change, and runs tests
~~~

ChatGPT Pro is an adviser with connected repository visibility; it is not a source of truth. Codex must compare the advice against the manifest, driver, source map, and local checkout before editing. If the reviewer and Codex disagree, the next packet must state the exact factual disagreement and test it, rather than hiding it behind a consensus claim.

## Implementation phases

### Phase 0 — Remove the API Assistant cleanly

**Goal:** eliminate the unsupported model-generation feature before adding a new, API-free workflow.

**Expected files to inspect and change:**

- <code>app/studio/src/App.tsx</code>
- <code>app/studio/src/components/Topbar.tsx</code>
- <code>app/studio/src/components/GenerativePanel.tsx</code>
- <code>app/server/studio-server.ts</code>
- <code>app/server/routes/generate.ts</code>
- <code>scripts/lib/engine/llm.ts</code>
- <code>scripts/lib/engine/context-builder.ts</code>
- <code>scripts/lib/engine/apply-generation.ts</code>
- generation-only tests and package scripts
- <code>package.json</code> and the lockfile
- documentation that still tells people to configure an LLM provider

**Implementation rules:**

- Delete the Assistant UI, toggle, route registration, provider configuration, model request logic, and dead tests together after confirming their consumers with a targeted search.
- Remove <code>openai</code> and <code>@google/genai</code> only after the search shows they have no non-Assistant consumer.
- Do not leave a reachable write-capable <code>/api/generate</code> route as hidden technical debt.
- Keep current canonical-source and course-authoring protections; the removal must not alter learner workspaces.

**Verification:**

~~~bash
rg -n "GenerativePanel|/api/generate|@google/genai|from ['\"]openai['\"]|OPENAI_API_KEY|GEMINI_API_KEY" app scripts package.json README.md ARCHITECTURE.md
npm run build:studio
npm run test:metadata-policy
git diff --check
~~~

**Exit gate:** no Assistant control, no reachable generate route, no API-key engine, and no orphaned documentation or test script.

**Suggested isolated commit:** <code>chore(studio): remove api assistant</code>.

### Phase 1 — Freeze the bridge, packet, and provenance contracts

**Goal:** create small shared types and tests before changing origins or user interfaces.

**Expected ownership:**

- Shared browser/server-safe protocol: <code>app/shared/</code>
- Server-side validation/resolution: <code>app/server/</code> and <code>scripts/lib/</code>
- Tests: existing focused Node test locations and <code>e2e/</code>
- Security/operating documentation: <code>docs/</code>

**Work:**

- Define the versioned bridge envelope, strict event allowlist, session nonce, bounds, and error behavior.
- Define the normalized inspection resolution and handoff-packet schemas.
- Define source-role vocabulary and exact/bounded/unknown semantics.
- Define provenance freshness/digest behavior and a redaction policy.
- Capture baseline preview behavior for the direct, Social, and English proof projects before isolating origins.
- Add characterization tests for the current scroll/save/navigation paths so the origin migration has an observable target.

**Exit gate:** malformed messages, wildcard origins, invalid session nonces, overlarge packets, absolute paths, and forbidden data categories all fail tests before the preview origin is separated.

### Phase 2 — Isolate preview on a dedicated loopback origin

**Goal:** make the course preview a read-only, distinct-origin document without breaking normal preview behavior.

**Expected files to inspect and change:**

- <code>app/server/studio-server.ts</code>
- <code>app/server/routes/preview.ts</code>
- a new narrowly scoped preview-service module under <code>app/server/</code>
- <code>app/shared/preview-bridge.ts</code>
- <code>app/studio/src/lib/preview-urls.ts</code>
- <code>app/studio/src/components/PreviewPane.tsx</code>
- <code>app/studio/src/hooks/usePreviewScrollSync.ts</code>
- <code>app/studio/src/lib/preview-scroll.ts</code>
- preview-route and end-to-end tests

**Work:**

- Start one read-only preview service on an independently allocated 127.0.0.1 port as part of the existing local Studio lifecycle.
- Keep the current path allowlists and missing-preview diagnostics, but move file serving behind the preview-only service.
- Inject a small bridge script into served HTML at response time. Do not write injected code into source, raw, workspace, or export files.
- Pass the Studio origin and session nonce explicitly to the preview. Validate both directions with exact origin and source checks.
- Replace direct iframe DOM scroll reads/writes with bridge messages. Preserve only the current behavior that can be safely described by the protocol.
- Keep test automation free to inspect cross-origin iframes through Playwright; the no-direct-DOM rule applies to production Studio code, not the browser test harness.
- Add a focused source-level guard so production Studio code cannot quietly reintroduce <code>iframe.contentDocument</code> or <code>iframe.contentWindow.document</code> access.

**Security tests:**

- A preview-origin page cannot fetch or invoke Studio mutation routes.
- A forged postMessage from the wrong origin, wrong window, wrong nonce, unsupported type, or malformed payload is ignored and recorded only as a local UI-safe error.
- The iframe retains no privileged filesystem or source-resolution endpoint.
- Preview route traversal protection and missing-file diagnostics continue to pass.

**Exit gate:** the direct, Social, and English proof previews load and retain their agreed baseline behavior, while production Studio contains no direct preview-DOM access.

**Suggested isolated commit:** <code>feat(server): isolate studio preview</code>.

### Phase 3 — Build trusted provenance and adapter conformance together

**Goal:** resolve source ownership accurately for the three real project styles.

**Expected ownership:**

- Generic inspection types, resolver, packet builder, and validation: <code>scripts/lib/inspection/</code> or the closest existing ownership module
- Studio server inspection endpoint: <code>app/server/routes/</code>
- Driver-specific emission: the direct workspace adapter, <code>scripts/build-social30-related-issues.ts</code>, and the English factory modules
- Per-project generated metadata: <code>projects/&lt;slug&gt;/meta/inspection-provenance.json</code>, declared as generated operational metadata when it exists
- Readiness diagnostic: extend the existing course doctor rather than inventing an unowned global scanner

**Work:**

- Build one schema-validating resolver that accepts only a selected Studio project/session and an opaque node ID.
- Require the resolver to derive all target paths, source roles, and rebuild commands from manifests and trusted provenance, never from the browser request.
- Produce a provenance sidecar with artifact and source digests for pilot drivers.
- Give each mapped block a stable opaque node ID. The ID is an identifier, not a path, selector, user answer, or source snippet.
- Implement the direct adapter first for a narrowly defined static canonical-entry proof. Return bounded or unknown for cases it cannot prove.
- Implement the Social adapter as build-generated ownership that points to its builder/resource pipeline.
- Implement the English adapter as factory-generated ownership that distinguishes recipe/renderer ownership from custom components/assets.
- Add adapter conformance fixtures that assert all three adapters return the same normalized contract and reject stale/foreign IDs.
- Extend <code>course:doctor</code> with an inspection/provenance check for a specific project rather than trusting a map that happens to exist.

**Required negative cases:**

- stale manifest digest;
- changed generated artifact digest;
- node ID from a different project or preview mode;
- source outside declared canonical/owner allowlists;
- multiple plausible owners without an exact rule;
- an existing conversion source map with an unknown or stale schema.

**Exit gate:** Forensics 35, Social 30-1 Related Issue 1 Option 2, and ELA 20-1 Crucible each pass the same conformance suite. A generated file is never returned as the primary source target when its manifest declares a builder/factory owner.

**Suggested isolated commit:** <code>feat(authoring): add inspection provenance</code>.

### Phase 4 — Ship Inspect and Copy for Codex V1

**Goal:** make the useful, no-screenshot workflow available in Studio.

**Expected files to inspect and change:**

- <code>app/studio/src/App.tsx</code>
- <code>app/studio/src/components/Topbar.tsx</code>
- <code>app/studio/src/components/PreviewPane.tsx</code>
- a new focused inspection panel under <code>app/studio/src/components/</code>
- Studio client types/state/hooks as needed
- the server inspection-resolution route
- stable E2E selectors and project E2E contracts where learner-facing preview behavior requires them

**Work:**

- Replace the former Assistant top-bar control with Inspect.
- Add clear off, armed, hover, selected, unknown, stale, copied, and error states.
- Show source confidence and ownership without burying the teacher in implementation jargon.
- Let the teacher categorize the issue and add an optional short note.
- Build the packet on the server from a validated resolution, then expose it for an explicit user-clicked clipboard copy.
- Provide a visible fallback when clipboard permissions fail, such as selectable packet text; do not silently retry or read clipboard contents.
- Keep inspect handling passive: it must not submit forms, navigate, trigger learner actions, or mutate course state.
- Keep the existing InspectorPanel's project information available, but do not claim it maps source ownership unless it is using the new resolver.

**Verification:**

- Unit tests for packet size, redaction, omission notices, and exact/bounded/unknown output.
- Unit tests for the resolver's source and digest guards.
- E2E tests for Inspect off behavior, hover/select, unknown/stale behavior, category selection, packet copy fallback, and no learner action on inspection.
- Direct, Social, and English end-to-end proof paths.
- Manual keyboard and screen-reader check of selection and copy feedback.

**Exit gate:** a teacher can create a useful text handoff in all three proof projects without an API key, without a screenshot, and without any source-location fiction.

**Suggested isolated commit:** <code>feat(studio): add inspect handoff</code>.

### Phase 5 — Add screenshot and annotation only after V1 is proven

**Goal:** add a visual aid without weakening privacy, source truth, or the V1 workflow.

**Hard constraint:** Studio cannot reliably use a normal page canvas or html2canvas to capture an isolated cross-origin iframe. Any release-quality solution must use a capability that genuinely captures the visible current preview state.

**Technical spike and decision gate:**

- Evaluate explicit user-consent browser screen/tab capture through getDisplayMedia, cropped to the visible preview frame.
- If that cannot reliably capture the current Studio tab across target browsers, evaluate a future native desktop or browser-extension bridge with separate user approval.
- Do not use headless screenshots as a substitute for the teacher's live interactive state unless the product explicitly labels them as a rebuilt reference snapshot.
- Do not ship a screenshot feature until the capture origin, consent flow, crop accuracy, user-state behavior, and privacy behavior are demonstrated in the target browsers.

**If the spike passes:**

- Add a Capture annotation action only while a target is selected.
- Require an explicit browser permission action each capture.
- Let the teacher draw lightweight arrows, boxes, and a short label over a transient image.
- Keep the image in memory only for the current handoff unless the teacher deliberately exports it.
- Never send image data automatically to a model or service.
- Produce a text packet plus an optional separately user-managed image. The text packet must say whether an image was included.
- Add a clear delete/close action that drops the transient image and annotations.

**Exit gate:** the screenshot is visibly the same preview state the teacher selected, it is never captured without consent, and the no-screenshot V1 remains fully usable if capture is unavailable.

### Phase 6 — Make the workflow reusable for a real Science pilot

**Goal:** let a new course use the same ownership and inspection discipline without forcing Social or English assumptions onto Science.

**Work:**

- Start only after a real Science resource intake and decision log exist.
- Define a Science-specific authoring driver from actual source material, learner loop, persistence needs, and export target.
- Make that driver emit or resolve the same normalized inspection provenance contract.
- Add it to adapter conformance only when its canonical source/rebuild path is proven.
- Keep the subject's structure and instructional design free to differ; reuse the operating contract, not the Social or English course shape.
- Add a compact project prompt pack and exact source mapping before broad authoring begins.

**Exit gate:** the first representative Science unit can be inspected, copied, rebuilt, and verified through its own declared driver. No generic Science factory is created just to satisfy a repository pattern.

## Release gates for V1

The feature is not ready until all of these are true:

1. Assistant UI, API route, API-key engine, provider dependencies, and dead docs are gone.
2. Studio and preview run on distinct local origins, and preview has no privileged mutation/source-resolution routes.
3. Production Studio does not directly inspect preview iframe DOM.
4. The bridge validates version, exact origin, window, nonce, type, schema, and payload bounds.
5. A preview can send only opaque node facts; it cannot tell Studio what file, line, source owner, or rebuild command to use.
6. Provenance is exact, bounded, or unknown and uses freshness/digest validation; no fuzzy source matching is permitted.
7. Direct, Social, and English adapters pass the same contract and negative-case tests.
8. Generated Social and English workspace output is never presented as the primary edit target where a builder/factory owns it.
9. A copied packet is at most 5 KB, uses only repo-relative paths, excludes private/browser data, and is copied solely on an explicit user action.
10. The entire V1 workflow succeeds with screenshots unavailable.

## Verification matrix

| Concern | Minimum proof |
| --- | --- |
| Assistant removal | targeted search has no live UI, route, provider, key, or test-script consumer; Studio build passes |
| Preview serving | preview-route tests preserve current path containment and missing-file diagnostics |
| Origin security | forged bridge messages and cross-origin route attempts fail; no direct DOM calls remain in production code |
| Scroll and learner behavior | focused E2E baseline before/after migration plus direct manual check |
| Provenance | schema, digest, stale/foreign node, source-allowlist, and ambiguity tests |
| Direct/Social/English | one adapter conformance suite plus project doctor proof for all three |
| Packet | byte cap, redaction, Clipboard user action/fallback, and unknown/stale copy behavior |
| UI access | keyboard, focus, non-color states, and screen-reader announcement checks |
| Screenshot later | browser-permission, crop, privacy, state-match, and deletion tests before enabling it |
| Course safety | no raw or export writes, no manual generated-workspace patch, and each rebuild runs through its owning driver |

Run the smallest relevant tests per phase, then before releasing V1 run the focused Studio build, preview route tests, metadata/doctor checks, and the required project E2E runs. Treat known repository-wide typecheck noise as baseline noise only after confirming no new touched-file errors.

## Red-team and green-team packet protocol

Use this process for a future change proposed from an inspector packet:

1. Studio produces the bounded packet from a selected preview target.
2. The teacher gives ChatGPT Pro the packet and asks for a minimal recommendation, alternative, risks, source assumptions, and verification plan.
3. ChatGPT Pro may use the connected GitHub repository, but it must identify anything it cannot prove.
4. The teacher gives Codex the packet plus the ChatGPT Pro response.
5. Codex checks the local checkout, manifest, driver, source provenance, and tests before making any edit.
6. If the two paths disagree, record the exact disputed claim, run the smallest decisive repository check, and repeat only with that evidence.
7. Mark the decision approved only when the source target, boundary, verification, and rollback are explicit.

A good adviser prompt is:

~~~text
You are reviewing a Canvas Helper Inspector packet. Use the connected repository only to verify the packet's declared project, source ownership, and rebuild path. Propose the smallest safe change. State: (1) exact files likely involved, (2) evidence you verified, (3) assumptions or unknowns, (4) risks, (5) targeted tests, and (6) a rollback boundary. Do not recommend edits to raw or generated output unless the packet explicitly declares an emergency repair.
~~~

## Implementation guardrails

- Begin each phase from a clean, understood Git state. Do not sweep unrelated user changes into this work.
- Keep Assistant removal, origin isolation, provenance, UI, and screenshots in separate reviewable commits.
- Do not change learner course content as a side effect of an inspection feature.
- Do not hand-patch <code>projects/&lt;slug&gt;/workspace/index.html</code> for generated Social or English projects.
- Do not accept a ChatGPT Pro recommendation as evidence when it conflicts with local manifest/driver facts.
- Do not broaden direct-workspace behavior into a promise that every dynamic course element has an exact source line.
- Do not create a generic Science factory until a real resource-backed Science pilot passes its own gates.
- Reassess screenshot feasibility after V1 is used in real course work; do not let an attractive annotation idea reintroduce context bloat or hidden data capture.

## What success looks like

For a new or existing course, you will be able to open exactly the part of the live preview that looks wrong, copy a small accurate handoff, get a well-grounded second opinion from ChatGPT Pro, and give Codex the real edit/rebuild target without feeding either system an entire course or repository.

That is the streamlined operating system: inspect one thing, prove ownership, change the canonical source, rebuild through the right driver, verify the learner experience, and keep the next course easier than the last.
