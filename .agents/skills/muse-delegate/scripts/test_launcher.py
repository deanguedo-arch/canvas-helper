#!/usr/bin/env python3

from __future__ import annotations

import json
import os
from datetime import datetime
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import textwrap
import unittest

from hardening import AdmissionLease, classify_failure
from launch import normalize_allow_path, path_is_allowed
from shared_state import admit, billing_verified, cooldown, release, set_mode, status
from usage import close_elapsed_window, empty_usage, read_ledger, record_run_usage, usage_summary


SCRIPT_DIR = Path(__file__).resolve().parent
LAUNCHER = SCRIPT_DIR / "launch.py"
REPORTER = SCRIPT_DIR / "report.py"
CONTROL = SCRIPT_DIR / "control.py"


def command(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(list(args), cwd=cwd, text=True, capture_output=True, check=True)


class AllowlistTests(unittest.TestCase):
    def test_normalization_and_matching(self) -> None:
        self.assertEqual(normalize_allow_path("scripts/lib"), "scripts/lib")
        self.assertTrue(path_is_allowed("scripts/lib/scorm.ts", ["scripts/lib"]))
        self.assertTrue(path_is_allowed("scripts/lib", ["scripts/lib"]))
        self.assertFalse(path_is_allowed("scripts/library.ts", ["scripts/lib"]))
        with self.assertRaises(ValueError):
            normalize_allow_path("../outside")
        with self.assertRaises(ValueError):
            normalize_allow_path("/absolute")


class LauncherIntegrationTests(unittest.TestCase):
    def create_repo(self, root: Path) -> Path:
        repo = root / "repo"
        repo.mkdir()
        command("git", "init", "-q", cwd=repo)
        command("git", "config", "user.email", "muse-delegate@example.invalid", cwd=repo)
        command("git", "config", "user.name", "Muse Delegate Test", cwd=repo)
        (repo / "allowed.txt").write_text("before\n", encoding="utf-8")
        (repo / "outside.txt").write_text("before\n", encoding="utf-8")
        command("git", "add", ".", cwd=repo)
        command("git", "commit", "-qm", "fixture", cwd=repo)
        (repo / "prompt.md").write_text("Make the requested fixture change.\n", encoding="utf-8")
        return repo

    def create_fake_muse(
        self,
        root: Path,
        changed_path: str | None,
        *,
        message: str = "fixture complete",
        exit_code: int = 0,
        provider_error: str = "",
        delay_seconds: float = 0,
        code_override: str | None = None,
    ) -> Path:
        label = changed_path.replace('.', '-') if changed_path else "no-change"
        fake = root / f"fake-muse-{label}-{exit_code}"
        change_statement = code_override or (
            f"(worktree / {changed_path!r}).write_text('after\\n', encoding='utf-8')"
            if changed_path
            else "pass"
        )
        fake.write_text(
            textwrap.dedent(
                f"""\
                #!{sys.executable}
                import json
                from pathlib import Path
                import subprocess
                import sys
                import time
                args = sys.argv
                if len(args) > 1 and args[1] == '--version':
                    print('Muse Code fixture')
                    raise SystemExit(0)
                if len(args) > 1 and args[1] == 'export':
                    out = Path(args[args.index('--out') + 1])
                    out.write_text(json.dumps({{
                        'events': [{{
                            'recorded_at': 1789917000000000,
                            'usage': {{
                                'input_tokens': 1200,
                                'cached_tokens': 900,
                                'output_tokens': 120,
                                'reasoning_tokens': 60,
                            }},
                        }}, {{'recorded_at': 1789917001000000}}]
                    }}), encoding='utf-8')
                    raise SystemExit(0)
                worktree = Path(args[args.index('--worktree-existing') + 1])
                {change_statement}
                time.sleep({delay_seconds!r})
                print(json.dumps({{
                    'payload_type': 'provider.usage',
                    'stream': {{'kind': 'session', 'id': 'fixture-session'}},
                    'payload': {{'usage': {{
                        'input_tokens': 1000,
                        'cached_tokens': 800,
                        'output_tokens': 100,
                        'reasoning_tokens': 50,
                    }}}}
                }}))
                if {provider_error!r}:
                    print(json.dumps({{
                        'payload_type': 'provider.error',
                        'payload': {{'message': {provider_error!r}}}
                    }}))
                print(json.dumps({{
                    'payload_type': 'run.terminal.completed',
                    'payload': {{'text': {message!r}}}
                }}))
                raise SystemExit({exit_code})
                """
            ),
            encoding="utf-8",
        )
        fake.chmod(fake.stat().st_mode | stat.S_IXUSR)
        return fake

    def launch(
        self,
        root: Path,
        repo: Path,
        fake: Path,
        *,
        sparse: bool = False,
        max_wall_clock_seconds: int = 30,
        environment: dict[str, str] | None = None,
        allowed_paths: list[str] | None = None,
        disable_shell: bool = False,
    ) -> subprocess.CompletedProcess[str]:
        arguments = [
                sys.executable,
                str(LAUNCHER),
                "--workspace",
                str(repo),
                "--prompt-file",
                str(repo / "prompt.md"),
                "--name",
                "fixture",
                "--muse-bin",
                str(fake),
                "--worktree-root",
                str(root / "worktrees"),
                "--runtime-root",
                str(root / "runs"),
                "--state-root",
                str(root / "state"),
                "--max-wall-clock-seconds",
                str(max_wall_clock_seconds),
            ]
        for allowed_path in allowed_paths or ["allowed.txt"]:
            arguments.extend(["--allow-path", allowed_path])
        if sparse:
            arguments.extend(["--sparse-path", "allowed-dir"])
        if disable_shell:
            arguments.append("--disable-shell")
        safe_environment = dict(os.environ)
        safe_environment.pop("MODEL_API_KEY", None)
        safe_environment.pop("META_API_KEY", None)
        if environment:
            safe_environment.update(environment)
        return subprocess.run(
            arguments,
            text=True,
            capture_output=True,
            env=safe_environment,
        )

    def test_worker_receives_run_private_temporary_directory(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            fake = self.create_fake_muse(root, None, code_override="import os; assert os.environ['TMPDIR'] == os.environ['TMP'] == os.environ['TEMP']; assert Path(os.environ['TMPDIR']).is_dir(); assert 'worker-tmp' in os.environ['TMPDIR']")
            result = self.launch(root, repo, fake)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_file_tools_only_mode_disables_shell(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            fake = self.create_fake_muse(root, None, code_override="assert '--disable-shell' in args")
            result = self.launch(root, repo, fake, disable_shell=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

    def test_allowed_change_completes_and_is_recorded(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            result = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"))
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            manifest_path = next((root / "runs").glob("*/manifest.json"))
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "completed")
            self.assertEqual(manifest["changedPaths"], ["allowed.txt"])
            self.assertEqual(manifest["scopeViolations"], [])
            self.assertEqual(manifest["usage"]["providerCalls"], 1)
            self.assertEqual(manifest["usage"]["inputTokens"], 1200)
            self.assertEqual(manifest["usage"]["cachedInputTokens"], 900)
            self.assertEqual(manifest["usage"]["uncachedInputTokens"], 300)
            self.assertEqual(manifest["museSessionId"], "fixture-session")
            self.assertTrue(Path(manifest["sessionExport"]).is_file())
            ledger = read_ledger(root / "runs")
            self.assertEqual(ledger["activeWindow"]["totals"]["delegatedPrompts"], 1)
            self.assertEqual(ledger["activeWindow"]["totals"]["providerCalls"], 1)
            self.assertEqual((Path(manifest["worktree"]) / "allowed.txt").read_text(), "after\n")
            report = subprocess.run(
                [sys.executable, str(REPORTER), str(manifest_path.parent), "--workspace", str(repo), "--json"],
                text=True,
                capture_output=True,
            )
            self.assertEqual(report.returncode, 0, report.stdout + report.stderr)
            report_payload = json.loads(report.stdout)
            self.assertTrue(report_payload["headMatchesBase"])
            self.assertEqual(report_payload["changedPaths"], ["allowed.txt"])

    def test_out_of_scope_change_is_rejected(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            result = self.launch(root, repo, self.create_fake_muse(root, "outside.txt"))
            self.assertEqual(result.returncode, 4, result.stdout + result.stderr)
            manifest_path = next((root / "runs").glob("*/manifest.json"))
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "scope_violation")
            self.assertEqual(manifest["scopeViolations"], ["outside.txt"])

    def test_sparse_worktree_materializes_only_requested_directory_plus_root_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            (repo / "allowed-dir").mkdir()
            (repo / "allowed-dir" / "kept.txt").write_text("kept\n", encoding="utf-8")
            (repo / "large-unrelated-dir").mkdir()
            (repo / "large-unrelated-dir" / "omitted.txt").write_text("omitted\n", encoding="utf-8")
            command("git", "add", ".", cwd=repo)
            command("git", "commit", "-qm", "sparse fixture", cwd=repo)
            result = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"), sparse=True)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            manifest_path = next((root / "runs").glob("*/manifest.json"))
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            worktree = Path(manifest["worktree"])
            self.assertEqual(manifest["sparsePaths"], ["allowed-dir"])
            self.assertTrue((worktree / "allowed-dir" / "kept.txt").is_file())
            self.assertFalse((worktree / "large-unrelated-dir").exists())

    def test_local_control_disables_and_reenables_launches(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            fake = self.create_fake_muse(root, "allowed.txt")
            runtime_root = root / "runs"
            disable = subprocess.run(
                [
                    sys.executable,
                    str(CONTROL),
                    "disable",
                    "--workspace",
                    str(repo),
                    "--runtime-root",
                    str(runtime_root),
                    "--state-root",
                    str(root / "state"),
                    "--reason",
                    "usage exhausted",
                ],
                text=True,
                capture_output=True,
            )
            self.assertEqual(disable.returncode, 0, disable.stdout + disable.stderr)
            self.assertIn("Muse delegation: disabled", disable.stdout)
            refused = self.launch(root, repo, fake)
            self.assertEqual(refused.returncode, 6, refused.stdout + refused.stderr)
            self.assertIn("usage exhausted", refused.stderr)

            enable = subprocess.run(
                [
                    sys.executable,
                    str(CONTROL),
                    "enable",
                    "--workspace",
                    str(repo),
                    "--runtime-root",
                    str(runtime_root),
                    "--state-root",
                    str(root / "state"),
                ],
                text=True,
                capture_output=True,
            )
            self.assertEqual(enable.returncode, 0, enable.stdout + enable.stderr)
            self.assertIn("Muse delegation: enabled", enable.stdout)
            resumed = self.launch(root, repo, fake)
            self.assertEqual(resumed.returncode, 0, resumed.stdout + resumed.stderr)

    def test_confirmed_usage_limit_opens_then_expires_automatic_circuit(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            limited = self.create_fake_muse(
                root,
                None,
                message="provider stopped",
                provider_error="Muse usage limit reached",
                exit_code=9,
            )
            first = self.launch(root, repo, limited)
            self.assertEqual(first.returncode, 7, first.stdout + first.stderr)
            manifests = list((root / "runs").glob("*/manifest.json"))
            self.assertEqual(len(manifests), 1)
            manifest = json.loads(manifests[0].read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "usage_limited")
            self.assertEqual(manifest["failureReason"], "SUBSCRIPTION_EXHAUSTED")
            self.assertTrue(manifest["automaticDisabledUntil"])
            result_payload = json.loads(Path(manifest["result"]).read_text(encoding="utf-8"))
            self.assertEqual(result_payload["outcome"], "fallback")
            self.assertEqual(result_payload["nextAction"], "continue_in_current_codex_session")
            self.assertTrue(result_payload["workerStopped"])
            summary = usage_summary(read_ledger(root / "runs"))
            self.assertIsNone(summary["activeWindow"])
            self.assertEqual(summary["quotaWallCount"], 1)
            self.assertEqual(summary["latestQuotaWall"]["totals"]["delegatedPrompts"], 1)
            self.assertEqual(summary["latestQuotaWall"]["totals"]["inputTokens"], 1200)

            refused = self.launch(root, repo, limited)
            self.assertEqual(refused.returncode, 6, refused.stdout + refused.stderr)
            state_path = root / "state" / "state.json"
            state = json.loads(state_path.read_text(encoding="utf-8"))
            cooldown_seconds = (datetime.fromisoformat(state["cooldown"]["until"]) - datetime.now().astimezone()).total_seconds()
            self.assertTrue(5 * 60 * 60 <= cooldown_seconds <= 5 * 60 * 60 + 60)
            state["cooldown"]["until"] = "2000-01-01T00:00:00+00:00"
            state_path.write_text(json.dumps(state), encoding="utf-8")

            recovered = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"))
            self.assertEqual(recovered.returncode, 0, recovered.stdout + recovered.stderr)
            self.assertIsNone(json.loads(state_path.read_text(encoding="utf-8"))["cooldown"])

    def test_terminal_text_cannot_false_trigger_quota_circuit(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            fake = self.create_fake_muse(root, "allowed.txt", message="A source fixture says quota exceeded.")
            result = self.launch(root, repo, fake)
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            manifest = json.loads(next((root / "runs").glob("*/manifest.json")).read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "completed")
            self.assertEqual(manifest["failureReason"], "NONE")

    def test_wall_clock_timeout_stops_worker_and_preserves_partial_change(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            fake = self.create_fake_muse(root, "allowed.txt", delay_seconds=5)
            result = self.launch(root, repo, fake, max_wall_clock_seconds=1)
            self.assertEqual(result.returncode, 9, result.stdout + result.stderr)
            manifest = json.loads(next((root / "runs").glob("*/manifest.json")).read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "worker_timeout")
            self.assertEqual(manifest["failureReason"], "WORKER_TIMEOUT")
            self.assertTrue(manifest["workerStopped"])
            payload = json.loads(Path(manifest["result"]).read_text(encoding="utf-8"))
            self.assertEqual(payload["changedPaths"], ["allowed.txt"])
            self.assertEqual(payload["nextAction"], "continue_in_current_codex_session")

    def test_machine_wide_admission_lease_rejects_second_run(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            lease = AdmissionLease(root / "state", "already-running")
            acquired, _reason = lease.acquire()
            self.assertTrue(acquired)
            try:
                result = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"))
            finally:
                lease.release()
            self.assertEqual(result.returncode, 8, result.stdout + result.stderr)
            self.assertIn("muse-delegate is busy", result.stderr)
            self.assertFalse((root / "runs").exists())

    def test_metered_environment_override_is_refused_before_launch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            environment = dict(os.environ)
            environment["MODEL_API_KEY"] = "not-a-real-secret"
            result = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"), environment=environment)
            self.assertEqual(result.returncode, 10, result.stdout + result.stderr)
            self.assertIn("may select metered Model API billing", result.stderr)
            self.assertNotIn("not-a-real-secret", result.stdout + result.stderr)
            self.assertFalse((root / "runs").exists())

    def test_meta_api_key_override_is_refused_before_launch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            environment = {"META_API_KEY": "synthetic-metered-key"}
            result = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"), environment=environment)
            self.assertEqual(result.returncode, 10, result.stdout + result.stderr)
            self.assertIn("META_API_KEY", result.stderr)
            self.assertNotIn("synthetic-metered-key", result.stdout + result.stderr)
            self.assertFalse((root / "runs").exists())

    def test_automatic_muse_refuses_unverified_billing(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            fake = self.create_fake_muse(root, "allowed.txt")
            result = subprocess.run(
                [sys.executable, str(LAUNCHER), "--workspace", str(repo), "--prompt-file", str(repo / "prompt.md"), "--allow-path", "allowed.txt", "--muse-bin", str(fake), "--runtime-root", str(root / "runs"), "--state-root", str(root / "state"), "--automatic"],
                text=True, capture_output=True, env={key: value for key, value in os.environ.items() if key not in ("META_API_KEY", "MODEL_API_KEY")},
            )
            self.assertEqual(result.returncode, 10, result.stdout + result.stderr)
            self.assertIn("billing is unverified", result.stderr)
            self.assertFalse((root / "runs").exists())

    def test_binary_and_untracked_changes_are_snapshotted_with_hashes(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            (repo / "allowed-dir").mkdir()
            (repo / "allowed-dir" / "kept.txt").write_text("before\n", encoding="utf-8")
            command("git", "add", ".", cwd=repo)
            command("git", "commit", "-qm", "directory fixture", cwd=repo)
            fake = self.create_fake_muse(root, None, code_override="(worktree / 'allowed-dir' / 'kept.txt').write_text('after\\n'); (worktree / 'allowed-dir' / 'new.bin').write_bytes(bytes([0, 1, 255]))")
            result = self.launch(root, repo, fake, allowed_paths=["allowed-dir"])
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            payload = json.loads(next((root / "runs").glob("*/result.json")).read_text(encoding="utf-8"))
            self.assertEqual(payload["changedPaths"], ["allowed-dir/kept.txt", "allowed-dir/new.bin"])
            artifacts = json.loads(Path(payload["artifactManifest"]).read_text(encoding="utf-8"))["artifactRefs"]
            artifact = next(item for item in artifacts if item["path"] == "allowed-dir/new.bin")
            self.assertEqual(Path(artifact["snapshot"]).read_bytes(), bytes([0, 1, 255]))
            self.assertEqual(len(artifact["sha256"]), 64)
            self.assertTrue(any(item["kind"] == "patch" for item in artifacts))

    def test_source_drift_preserves_worker_result_but_rejects_integration(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            source = repo / "allowed.txt"
            code = f"(worktree / 'allowed.txt').write_text('worker\\n'); Path({str(source)!r}).write_text('lead\\n')"
            result = self.launch(root, repo, self.create_fake_muse(root, None, code_override=code))
            self.assertEqual(result.returncode, 4, result.stdout + result.stderr)
            payload = json.loads(next((root / "runs").glob("*/result.json")).read_text(encoding="utf-8"))
            self.assertEqual(payload["sourceDriftPaths"], ["allowed.txt"])
            self.assertEqual(payload["nextAction"], "reject_delegated_changes")
            self.assertEqual(source.read_text(encoding="utf-8"), "lead\n")

    def test_symlink_artifact_is_rejected_without_following_target(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            target = root / "outside.txt"
            target.write_text("secret\n", encoding="utf-8")
            code = f"(worktree / 'allowed.txt').unlink(); (worktree / 'allowed.txt').symlink_to(Path({str(target)!r}))"
            result = self.launch(root, repo, self.create_fake_muse(root, None, code_override=code))
            self.assertEqual(result.returncode, 4, result.stdout + result.stderr)
            payload = json.loads(next((root / "runs").glob("*/result.json")).read_text(encoding="utf-8"))
            self.assertEqual(payload["unsafeArtifactPaths"], ["allowed.txt"])
            self.assertEqual(target.read_text(encoding="utf-8"), "secret\n")

    def test_changed_file_limit_rejects_nine_files(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            (repo / "allowed-dir").mkdir()
            (repo / "allowed-dir" / "kept.txt").write_text("before\n", encoding="utf-8")
            command("git", "add", ".", cwd=repo)
            command("git", "commit", "-qm", "directory fixture", cwd=repo)
            code = "[(worktree / 'allowed-dir' / f'new-{index}.txt').write_text(str(index)) for index in range(9)]"
            result = self.launch(root, repo, self.create_fake_muse(root, None, code_override=code), allowed_paths=["allowed-dir"])
            self.assertEqual(result.returncode, 4, result.stdout + result.stderr)
            manifest = json.loads(next((root / "runs").glob("*/manifest.json")).read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "changed_file_limit")

    def test_parent_exit_stops_descendant_before_releasing_worker(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = self.create_repo(root)
            code = "(worktree / 'allowed.txt').write_text('after\\n'); subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'])"
            result = self.launch(root, repo, self.create_fake_muse(root, None, code_override=code))
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            payload = json.loads(next((root / "runs").glob("*/result.json")).read_text(encoding="utf-8"))
            self.assertTrue(payload["workerStopped"])
            self.assertIsNone(status(root / "state")["active"])


class SharedAdmissionTests(unittest.TestCase):
    def test_cross_provider_single_worker_and_quarantine(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = admit(root, "luna", "task", "a1")
            self.assertTrue(first["admitted"])
            self.assertEqual(admit(root, "muse", "other", "a1")["reason"], "worker_active_or_quarantined")
            self.assertFalse(release(root, first["token"], False, "failure")["released"])
            self.assertEqual(status(root)["active"]["status"], "quarantined")
            self.assertFalse(admit(root, "muse", "other", "a1")["admitted"])
            self.assertTrue(release(root, first["token"], True, "failure")["released"])
            self.assertTrue(admit(root, "muse", "other", "a1")["admitted"])

    def test_mode_off_preserves_active_worker_and_cooldown(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            active = admit(root, "luna", "task", "a1")
            cooldown(root, "confirmed fixture")
            state = set_mode(root, "off")
            self.assertEqual(state["active"]["status"], "quarantined_pending_stop")
            self.assertIsNotNone(state["cooldown"])
            self.assertFalse(admit(root, "muse", "other", "a1")["admitted"])
            release(root, active["token"], True, "cancelled")
            self.assertIsNotNone(set_mode(root, "auto")["cooldown"])

    def test_expired_cooldown_allows_one_recovery_trial(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cooldown(root, "confirmed fixture", "2000-01-01T00:00:00+00:00")
            probe = admit(root, "muse", "task", "a1")
            self.assertTrue(probe["recoveryProbe"])
            self.assertFalse(admit(root, "muse", "other", "a1")["admitted"])
            release(root, probe["token"], True, "failure")
            self.assertEqual(admit(root, "muse", "next", "a1")["reason"], "muse_disabled")

    def test_one_correction_round_and_duplicate_attempt_are_enforced(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = admit(root, "luna", "same-task", "a1")
            release(root, first["token"], True, "failure")
            self.assertEqual(admit(root, "luna", "same-task", "a1")["reason"], "duplicate_attempt")
            second = admit(root, "luna", "same-task", "a2")
            self.assertTrue(second["admitted"])
            release(root, second["token"], True, "failure")
            self.assertEqual(admit(root, "luna", "same-task", "a3")["reason"], "correction_budget_exhausted")

    def test_billing_proof_rejects_missing_and_metered_override(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.assertFalse(billing_verified(root))
            (root / "muse-billing-proof.json").write_text(json.dumps({"schemaVersion": 1, "source": "supported-provider-account-status", "subscriptionActive": True, "credentialSource": "muse-code-login", "observedAt": datetime.now().astimezone().isoformat()}), encoding="utf-8")
            self.assertTrue(billing_verified(root))
            previous = os.environ.get("META_API_KEY")
            os.environ["META_API_KEY"] = "fixture"
            try:
                self.assertFalse(billing_verified(root))
            finally:
                if previous is None:
                    os.environ.pop("META_API_KEY", None)
                else:
                    os.environ["META_API_KEY"] = previous


class FailureClassificationTests(unittest.TestCase):
    def test_exit_two_and_generic_rate_limit_are_not_subscription_exhaustion(self) -> None:
        self.assertEqual(classify_failure(2, "", timed_out=False, cancelled=False), "CLI_INVOCATION_ERROR")
        self.assertEqual(
            classify_failure(1, "provider failed: HTTP 429 rate limited", timed_out=False, cancelled=False),
            "TRANSIENT_THROTTLE",
        )
        self.assertEqual(classify_failure(1, "approval denied", timed_out=False, cancelled=False), "PERMISSION_DENIED")
        self.assertEqual(classify_failure(1, "HTTP 401 unauthorized", timed_out=False, cancelled=False), "AUTH_REQUIRED")


class UsageWindowTests(unittest.TestCase):
    def test_elapsed_five_hour_window_rotates_and_wall_closes_current_window(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            first = empty_usage()
            first.update({"providerCalls": 2, "inputTokens": 2000, "cachedInputTokens": 1000, "uncachedInputTokens": 1000, "outputTokens": 200})
            record_run_usage(
                root,
                run_id="first",
                started_at="2026-09-20T10:00:00+00:00",
                finished_at="2026-09-20T10:05:00+00:00",
                status="completed",
                usage=first,
            )
            second = empty_usage()
            second.update({"providerCalls": 1, "inputTokens": 500, "cachedInputTokens": 400, "uncachedInputTokens": 100, "outputTokens": 50})
            record_run_usage(
                root,
                run_id="second",
                started_at="2026-09-20T15:30:00+00:00",
                finished_at="2026-09-20T15:31:00+00:00",
                status="usage_limited",
                usage=second,
            )
            ledger = read_ledger(root)
            self.assertIsNone(ledger["activeWindow"])
            self.assertEqual([item["endedReason"] for item in ledger["completedWindows"]], ["five_hour_window_elapsed", "usage_limit"])
            self.assertEqual(ledger["completedWindows"][0]["totals"]["inputTokens"], 2000)
            self.assertEqual(ledger["completedWindows"][1]["totals"]["inputTokens"], 500)

    def test_status_closes_an_elapsed_active_window(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            record_run_usage(
                root,
                run_id="first",
                started_at="2026-09-20T10:00:00+00:00",
                finished_at="2026-09-20T10:05:00+00:00",
                status="completed",
                usage=empty_usage(),
            )
            ledger = close_elapsed_window(root, datetime.fromisoformat("2026-09-20T15:00:01+00:00"))
            self.assertIsNone(ledger["activeWindow"])
            self.assertEqual(ledger["completedWindows"][0]["endedReason"], "five_hour_window_elapsed")
            self.assertEqual(ledger["completedWindows"][0]["elapsedSeconds"], 5 * 60 * 60)


if __name__ == "__main__":
    unittest.main()
