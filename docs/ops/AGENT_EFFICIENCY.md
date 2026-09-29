# Canvas Helper agent efficiency layer

## Daily use

New Codex tasks opened in this repository load the repo `AGENTS.md` routing rule and project `.codex/config.toml` defaults. The lead evaluates routing when substantive work begins; the user does not need to request an agent or run a command first. Routing is task-specific and does not run in the background. Tasks opened outside this repository do not inherit this project policy. An explicit session model or effort selection wins over the project default.

**Pre-edit checkpoint:** Before changing a substantive source boundary, identify bounded slices and choose deterministic/local, Sol, Luna, or Muse for each. Inspect dirty overlap first. Plan a clean, non-sensitive bulk Muse candidate before lead edits make that boundary ineligible. Keep a short decision record, including a reason when the lead retains an otherwise suitable slice. Recheck on material scope expansion, not per file. At handoff, distinguish observed routing and local context reuse from measured provider savings; unknown savings remain unknown. This checkpoint is an agent instruction, not an automatic background hook, so it cannot enforce itself if the lead skips it.

Apply the checkpoint to discovery as its own slice. A comparison across multiple project folders or an unfamiliar runtime is a candidate for a bounded Luna scout even when the resulting code edit is small. One compact deterministic read can stay local. The lead must say why it retained a multi-project investigation before consuming broad context; avoid treating `small-edit` as an exemption for preceding investigation. This is a decision prompt, not an automatic spawn, and Luna usage is not free or a measured saving.

`npm run studio:efficient` runs the existing session helper with `--no-headroom` and prints local routing status. The older `studio:codex:session` command retains its behavior. The lead remains responsible for canonical source decisions, review, acceptance, and the existing Build/Rollout checks. An explicit model or effort chosen for a session overrides the project Sol Medium default.

Use `npm run agents:doctor`, `npm run agents:status`, and `npm run agents:report` to inspect capabilities, admission, and observed local events. Use `npm run agents:mode -- off` to stop new worker admissions, or `npm run agents:mode -- auto` to restore eligibility. Off does not erase an active worker or artifacts; confirm descendant shutdown and release the ownership token before another worker starts. Mode auto does not override billing, write-boundary, task-sensitivity, or ownership gates.

For a bounded task, the lead creates a JSON contract, then runs `npm run agents:plan -- --task /absolute/path/task.json`. `npm run agents:run -- --task /absolute/path/task.json` either retains Sol/local ownership, invokes the existing Muse worktree launcher after every gate, or returns a native Luna action for the current Codex host. The shell command never starts a second Codex CLI session. A native result is accepted only through `npm run agents:complete -- --task /absolute/path/task.json --result /absolute/path/result.json --accept` after the lead checks changed paths, exact checks, shutdown, and ownership generation. The report must fit 4,000 UTF-8 bytes; larger evidence stays in referenced local artifacts. The full worker packet must fit 8,000 UTF-8 bytes. Overflow is an explicit refusal.

Example contract (replace paths, checks, and acceptance criteria with the actual bounded task):

```json
{
  "schemaVersion": 1,
  "taskId": "example-inspection",
  "attemptId": "a1",
  "workflow": "conversion",
  "mode": "build",
  "objective": "Inspect one canonical lesson for a reported issue.",
  "taskFamily": "investigation",
  "consequenceLevel": "normal",
  "allowedReadPaths": ["projects/example/workspace/index.html"],
  "allowedWritePaths": [],
  "contextSources": ["projects/example/workspace/index.html"],
  "acceptanceCriteria": ["Identify the exact source location and proposed smallest fix."],
  "requiredChecks": [],
  "deferredChecks": ["Course-wide E2E at rollout"],
  "prohibitedChanges": ["No edits, commit, packaging, or deployment."],
  "privacyScope": "repository"
}
```

Stable context is keyed by applicable instructions, declared source hashes, project metadata/context, and workflow. The baseline SHA, dirty overlay, objective, paths, and checks stay in the changing task section. Reuse of this local text is not a provider cache hit, and a prior test result does not waive a required gate. The existing 5,000-byte project brief limit remains authoritative. Explicit context sources are required for eligible delegation; if dependency coverage is uncertain, the lead retains the work.

The automatic Muse route requires an eligible billing basis and a live disposable proof of the standard write boundary. The user confirmed this working request-limited CLI plan; that is recorded as user testimony, distinct from provider verification, and remains valid for the current Muse CLI version unless revoked. Both `META_API_KEY` and `MODEL_API_KEY` block launch. Automatic tasks must be non-sensitive, have a clean write boundary and explicit sparse paths, and run with Muse shell tools disabled. The standard Muse sandbox still allows outside reads; the lead must keep student/private data and secrets out of delegated tasks. The detached worktree starts at a recorded commit, captures tracked, untracked, and binary changes with hashes, and rejects unsafe paths or main-source drift. Default limits are 20 steps, 900 seconds, eight changed files, and one correction attempt. A confirmed quota wall opens a user-private estimated five-hour cooldown plus margin; one recovery trial follows expiry. Manual disable is separate. A worker whose descendants cannot be confirmed stopped remains quarantined. The existing Muse usage ledger measures only launcher-managed calls.

## Current capability and promotion state (2026-09-22)

Baseline: branch `codex/math-engine-preflight`, HEAD `02a9fadc9148bf26c0c93006560375a9c5c6b4ee`; 175 paths were dirty before this task. Codex CLI `0.155.0-alpha.16`; Muse Code `1.3.0`; both metered override variables absent in the inspected shell. Global Sol Ultra was left untouched. `codex doctor --json` confirmed this checkout loads Sol as its project model. A current-host explicit Luna High scout completed a bounded file audit, returned to the lead, and left the source hash unchanged. Scoped investigation now emits that explicit host action without a write boundary. The host did not expose an independent effective model/effort/custom-role record or a read-only permission guarantee: parent permissions may override the role, so the lead checks for source changes and never treats the scout as an enforced read-only sandbox. The installed Muse CLI does not provide supported subscription credential evidence; the user confirmed their working request-limited CLI plan on 2026-09-22. Provider cache and included allowance telemetry are unavailable.

A live disposable Muse Code probe on 2026-09-22 completed with seven observed provider calls, 160,749 input tokens (145,559 cached), 3,618 output tokens, and no Git worktree edits. It read an approved fixture, failed to find an undeclared file omitted by sparse checkout, **and successfully read and wrote harmless files outside the worktree in the temporary probe area**. This fails the strict isolation gate. The automatic Muse route remains off; the established explicit launcher can still handle bounded tasks under lead review. The probe worktree and transcript remain under the temporary probe root for inspection.

The launcher now supplies a run-private `TMPDIR`, `TMP`, and `TEMP`. A second live probe completed with four provider calls, 90,608 input tokens (66,003 cached), 2,690 output tokens, and no worktree edits. It **denied the attempted outside-worktree temporary write** but still **allowed the outside-worktree read**. Sparse checkout omitted the undeclared repository canary, which is absence rather than a permission denial. Automatic Muse therefore remains off under the original read/write isolation rule. Both probes and the harmless canaries are under `/var/folders/ff/52r3_p9554bgwzvj0nkjw8k00000gn/T/canvas-muse-live-probe-rfzb8kp0/`.

A third live probe used the supported `--disable-shell` option. It completed with three provider calls, 66,302 input tokens (53,459 cached), 1,847 output tokens, and no worktree edits. Muse's file tools denied the outside write, but **still read the outside temporary canary**. [Meta documents its standard sandbox](https://dev.meta.ai/docs/muse-code/permissions) as restricting filesystem **writes** while allowing reads; the observed behavior matches that distinction. After reviewing this evidence, the user delegated the policy choice. The lead selected automatic Muse for clean, non-sensitive repository work under the tested file-tools-only write boundary, with the outside-read limitation visible.

A fourth disposable probe invoked the **automatic** Muse launcher with that profile and edited only `allowed/task.txt` in its detached worktree. It completed with six provider calls, 131,385 input tokens (118,310 cached), 1,906 output tokens, one changed file, a 1,495-byte result, and confirmed worker shutdown. The source repository file remained byte-for-byte unchanged. No probe patch was integrated into Canvas Helper.

The existing launcher ledger's latest completed five-hour window began 2026-09-21 14:41:48 UTC and recorded three delegated prompts, 182 internal provider calls, 23,449,824 input tokens (22,662,102 cached; 787,722 uncached), 114,422 output tokens, and 48,477 reasoning tokens. These are observed launcher counters, not three versus 182 subscription requests or proof of billing class. Direct Muse sessions are outside that ledger.

The six-task comparative pilot is **INCONCLUSIVE** for savings. Luna scouting and a narrow automatic Muse route now work with their stated permission limits. The disposable compatibility probes are not an equivalent six-task comparison. No route has been promoted on a net-savings claim. A future pilot should use equivalent isolated baselines for six bounded task families and record lead preparation/review/correction, accepted work, elapsed time, observed provider usage source, and quality. Missing cache or allowance fields remain unavailable. No course-wide E2E or SCORM gate was triggered by this developer-only change.

| Pilot type | Eligible route after gates | Current result |
| --- | --- | --- |
| Deterministic inventory | Existing local script | No matched pilot run |
| Small known source edit | Sol | No matched pilot run |
| Read-only source comparison | Luna High scout | Eligible with lead source-change check; hard read-only proof unavailable |
| Repeated HTML/CSS edits | Muse file-tools-only, clean non-sensitive scope | Disposable automatic write passed; matched pilot pending |
| Bounded fixture/test batch | Muse file-tools-only when shell is unnecessary | Matched pilot pending; shell-dependent work stays with Sol/manual review |
| High-consequence saved-state review | Sol | No matched pilot run |

## E01–E36 evidence matrix

`PASS` means the named offline behavior was exercised in focused tests. `BLOCKED` means the necessary live proof is unavailable; synthetic tests do not substitute for it. `NOT RUN` marks a remaining scenario.

| ID | Status | Evidence or remaining gate |
| --- | --- | --- |
| E01 | PASS | Off mode and no-worker path retain local/Sol workflow. |
| E02 | PASS | Same dependency block reused with changing task delta. |
| E03 | PASS | Relevant source edit changes dependency digest. |
| E04 | PASS | Unrelated edit leaves scoped block unchanged. |
| E05 | PASS | UTF-8 packet/report caps refuse overflow; existing project brief cap retained. |
| E06 | BLOCKED | Native instruction/history overhead is not exposed as separable telemetry. |
| E07 | PASS | Local cache hit has its own field. |
| E08 | PASS | Provider cache is reported null/unavailable. |
| E09 | PASS | No cross-provider cache savings are claimed. |
| E10 | PASS | Corrupt context cache recomputes; invalid admission state fails closed. |
| E11 | PASS | Deterministic tasks choose existing local commands. |
| E12 | PASS | Small or high-consequence tasks remain with Sol. |
| E13 | BLOCKED | Explicit Luna High child request is accepted; effective model/effort lack an independent host event. |
| E14 | BLOCKED | Parent permission overrides can defeat the role's read-only setting; the lead checks for changes. |
| E15 | PASS | Atomic common admission rejects a second participating worker. |
| E16 | PASS | User-confirmed CLI plan is labelled separately from provider proof; both paid-key override guards fail closed. |
| E17 | PASS | Shared cooldown prevents another terminal's Muse admission. |
| E18 | PASS | Estimated cooldown and later provider bound are retained. |
| E19 | PASS | Generic failures do not become subscription exhaustion. |
| E20 | PASS | One post-expiry recovery admission; a failed trial holds provider. |
| E21 | PASS | Fake worker tracked, untracked, and binary artifacts are hashed. |
| E22 | PASS | Fake descendant shutdown failure retains quarantine. |
| E23 | PASS | Cancellation and permission outcomes do not switch provider. |
| E24 | PASS | Dirty allowed write boundary routes to Sol; unrelated dirt does not. |
| E25 | PASS | Source drift is detected before integration. |
| E26 | PASS | Duplicate attempt and ownership token are rejected. |
| E27 | PASS | Traversal, symlink, unsafe file, and allowlist violations reject. |
| E28 | FAIL | Muse can read outside the worktree. Automatic admission is restricted to non-sensitive repository tasks and this limitation is explicit. |
| E29 | NOT RUN | Completion rejects an observed nonzero worker check, but full lead correction/acceptance flow lacks a native host test. |
| E30 | PASS | Deferred rollout checks remain in the Build packet. |
| E31 | NOT RUN | A real rollout candidate is needed for its complete gate. |
| E32 | PASS | Stale baseline/config proof rejects delegation. |
| E33 | BLOCKED | No authorized live Muse fallback to continue in current Sol session. |
| E34 | NOT RUN | Durable task/result artifacts exist; actual lead-capacity exhaustion was not exercised. |
| E35 | PASS | Context reuse never skips required checks. |
| E36 | PASS | Off mode stops admissions and preserves active quarantine/artifacts. |

## Recovery

Inspect `npm run agents:status`, the task packet under ignored `.runtime/agent-delegation/tasks/`, and Muse's ignored run manifest/worktree. If a worker is still alive or shutdown is uncertain, keep its admission quarantined. Accept only a complete, reviewed diff against the recorded baseline; never reset or clean the user's checkout to make integration easier. When the lead is unavailable, preserve the task, snapshot and exact next action for a resumed session. Rollback is `npm run agents:mode -- off`; it does not delete any work.
