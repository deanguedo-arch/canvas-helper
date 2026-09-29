---
name: muse-delegate
description: Delegate substantial, well-bounded implementation or test work from a Canvas Helper Codex task to the local Muse coding agent, using an isolated Git worktree and returning the patch to Codex for independent review. Use when the user asks to use Muse or when their established preference to shift suitable coding work to Muse applies. Do not use for ambiguous source-of-truth decisions, deployment, publishing, or final acceptance.
---

# Muse Delegate

Use Muse as an implementation worker while Codex remains responsible for task decomposition, repository ownership, review, integration, and user-facing claims.

Automatic routing through `agents:run` is limited to clean, non-sensitive repository tasks with a sparse worktree and shell tools disabled. The user confirmed their request-limited CLI plan, recorded as user testimony rather than provider verification. Live disposable probes showed that the standard sandbox allows outside reads; a run-private temporary directory and file-tools-only profile denied outside writes. One automatic writable probe completed in a detached worktree without changing its source repository. Reject both `META_API_KEY` and `MODEL_API_KEY` overrides. The launcher shares one admission record with participating Luna tasks, limits initial work to 20 model steps, 900 seconds and eight changed files, and quarantines uncertain shutdowns. See `docs/ops/AGENT_EFFICIENCY.md`.

Canvas Helper operates in Muse-first economy mode because the user regularly exhausts their weekly Codex allowance. Prefer delegation for bounded repository reconnaissance, implementation, test iteration, and mechanical documentation. Keep Codex work compact: define the contract once, avoid shadowing a healthy Muse run, inspect the final diff once, and run one focused verification batch. Expand Codex review only when the patch touches state compatibility, destructive behavior, security/trust boundaries, or shows evidence of drift or failure.

## Choose suitable work

Delegate when the subtask is independently executable and has:

- a specific outcome;
- an exact allowed-path list;
- known source ownership;
- objective acceptance checks; and
- enough implementation work to justify a separate agent run.

Keep work in Codex when it requires teacher judgment, ambiguous course-design choices, protected-source decisions, live deployment, credentials, or coordination across unresolved workstreams. Do not delegate merely to avoid understanding the task.

Batch related bounded work into one coherent Muse contract when the allowed source boundary and checks are shared. Avoid several small Muse runs whose setup and repeated Codex reviews would erase the usage savings.

## Prepare the contract

Read the repository and project instructions that govern the delegated boundary. Create a prompt using [the task contract](references/task-contract.md). State the starting commit, allowed paths, required checks, forbidden actions, and the evidence Muse must return.

The launcher adds its own invariant guardrails, but the task-specific prompt must still explain canonical ownership and relevant repository rules.

## Launch

Run from the repository root:

```bash
python3 .agents/skills/muse-delegate/scripts/launch.py \
  --prompt-file <prompt.md> \
  --name <short-task-name> \
  --allow-path <repo-relative-file-or-directory> \
  --allow-path <another-path>
```

For a large repository where the delegated task needs only a few directories,
add one or more `--sparse-path <repo-relative-directory>` arguments. The
launcher will materialize those directories plus root files in the detached
worktree. Every allowed path Muse needs to read or change must be present in
the sparse checkout.

The launcher:

- records the exact starting commit;
- refuses dirty source changes that overlap the delegated boundary;
- creates a detached worktree outside the repository, optionally using a
  sparse checkout for the declared task boundary;
- runs `muse exec --json` with the Muse sandbox enabled;
- stores the transcript, redacted session export, and manifest under ignored `.runtime/muse-delegate/`;
- accumulates prompt, provider-call, and token totals in an ignored five-hour usage-window ledger;
- preserves the worktree for review; and
- reports any changed path outside the allowlist as a scope violation.
- holds a user-private atomic admission shared by participating Luna and Muse
  routes, with one worker total and one correction attempt per task;
- refuses to launch when either `META_API_KEY` or `MODEL_API_KEY` is present;
- requires an eligible billing basis and a live write-boundary proof
  before automatic Muse routing;
- stops the Muse process group and confirms descendant shutdown after a
  900-second wall-clock limit by default;
  and
- writes a structured `result.json` that tells Codex whether to review the
  completed work or continue from preserved partial changes.

Set `MUSE_BIN` when Muse is not discoverable on `PATH` or under `~/.local/bin/muse-bin-*`. Use `--enable-web` only when the task actually requires internet access. Do not pass `--disable-sandbox`, `--disable-approval`, or `--yolo`.

The installed CLI does not expose a command that proves whether its stored
credential is subscription-backed. The user's confirmation establishes an
eligible, explicitly labelled CLI billing basis while the installed version
matches; it is not independent provider verification. Automatic Muse uses the
standard write sandbox and accepts its documented outside-read behavior only
for non-sensitive task scopes. A direct manual launcher run keeps its existing
safeguards. Never infer subscription billing from an unset API-key environment
or use `--api-key-stdin`.

Override the wall-clock ceiling only for a task whose bounded contract
justifies it:

```bash
python3 .agents/skills/muse-delegate/scripts/launch.py \
  --max-wall-clock-seconds 1200 \
  <other arguments>
```

## Turn delegation off or on

When the user asks to stop using Muse, disable delegation without uninstalling the skill:

```bash
python3 .agents/skills/muse-delegate/scripts/control.py disable --reason "Muse usage exhausted"
```

Check or restore it with:

```bash
python3 .agents/skills/muse-delegate/scripts/control.py status
python3 .agents/skills/muse-delegate/scripts/control.py enable
```

The manual switch is stored in ignored `.runtime/muse-delegate/delegation-state.json`.
Shared admission, cooldown, and quarantine are stored separately in a
user-private atomic state directory. Never retry while the manual switch or
shared mode reports off. Continue the task in Codex unless the user asks to pause it.

Muse currently exposes no quota-status command. A confirmed usage or quota
signal opens an estimated five-hour cooldown plus a margin. After expiry,
exactly one recovery trial is eligible; a failed trial holds Muse until
inspection. Generic failures do not open the quota cooldown. Dirty files
inside the allowed write boundary remain with Sol; unrelated dirty files do
not block a clean task.

## Track the five-hour allowance

Every launcher run updates `.runtime/muse-delegate/usage-windows.json`. After Muse exits, the launcher exports the redacted session and derives authoritative provider-call and token totals from that export; streaming totals are only a fallback. The ledger distinguishes one delegated CLI prompt from the provider calls that prompt triggers and records input, cached-input, output, and reasoning tokens. It starts an observed window with the first tracked prompt, rolls to a new window after five hours, and closes the active window immediately when Muse reports a quota wall.

Show the active window and the latest measured quota wall with either command:

```bash
python3 .agents/skills/muse-delegate/scripts/control.py status
python3 .agents/skills/muse-delegate/scripts/usage.py status
```

At a quota wall, report the observed elapsed time, delegated prompts, provider calls, and token totals from the ledger. The ledger measures only Muse work launched through this skill. Treat Muse sessions run directly in another terminal as unobserved account usage unless their exported session is deliberately imported.

## Monitor and review

Keep the user informed while the run is active. After completion, obtain a fresh report:

```bash
python3 .agents/skills/muse-delegate/scripts/report.py <run-id-or-run-directory>
```

Then independently:

1. verify the worktree commit and status;
2. inspect every changed file and the complete diff;
3. confirm the allowlist and `git diff --check` result;
4. rerun the smallest meaningful affected checks outside Muse; and
5. distinguish local evidence from Studio, LMS, deployment, or teacher acceptance.

Treat Muse's final text as an implementation report, not proof. Do not integrate a scope-violating run.

For a failed or timed-out run, read the manifest's `result` file. Continue in
the current Codex session only when `nextAction` is
`continue_in_current_codex_session` and `workerStopped` is true. If worker
shutdown is unconfirmed, quarantine the retained worktree and do not edit or
integrate it.

Do not poll or reread Muse output repeatedly while a healthy run is active. Wait for completion or a needs-attention signal, then review the retained evidence.

## Integration boundary

Delegation authorization does not authorize applying the patch, committing, pushing, packaging, deploying, or publishing. Keep the result isolated until the current task separately authorizes the required next action. Preserve unrelated dirty work.
