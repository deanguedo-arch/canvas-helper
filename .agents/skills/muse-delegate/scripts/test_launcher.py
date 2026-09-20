#!/usr/bin/env python3

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
import stat
import subprocess
import sys
import tempfile
import textwrap
import unittest

from launch import normalize_allow_path, path_is_allowed
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

    def create_fake_muse(self, root: Path, changed_path: str | None, *, message: str = "fixture complete", exit_code: int = 0) -> Path:
        label = changed_path.replace('.', '-') if changed_path else "no-change"
        fake = root / f"fake-muse-{label}-{exit_code}"
        change_statement = (
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
                import sys
                args = sys.argv
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

    def launch(self, root: Path, repo: Path, fake: Path, *, sparse: bool = False) -> subprocess.CompletedProcess[str]:
        arguments = [
                sys.executable,
                str(LAUNCHER),
                "--workspace",
                str(repo),
                "--prompt-file",
                str(repo / "prompt.md"),
                "--name",
                "fixture",
                "--allow-path",
                "allowed.txt",
                "--muse-bin",
                str(fake),
                "--worktree-root",
                str(root / "worktrees"),
                "--runtime-root",
                str(root / "runs"),
            ]
        if sparse:
            arguments.extend(["--sparse-path", "allowed-dir"])
        return subprocess.run(
            arguments,
            text=True,
            capture_output=True,
        )

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
            limited = self.create_fake_muse(root, None, message="Muse usage limit reached", exit_code=9)
            first = self.launch(root, repo, limited)
            self.assertEqual(first.returncode, 7, first.stdout + first.stderr)
            manifests = list((root / "runs").glob("*/manifest.json"))
            self.assertEqual(len(manifests), 1)
            manifest = json.loads(manifests[0].read_text(encoding="utf-8"))
            self.assertEqual(manifest["status"], "usage_limited")
            self.assertTrue(manifest["automaticDisabledUntil"])
            summary = usage_summary(read_ledger(root / "runs"))
            self.assertIsNone(summary["activeWindow"])
            self.assertEqual(summary["quotaWallCount"], 1)
            self.assertEqual(summary["latestQuotaWall"]["totals"]["delegatedPrompts"], 1)
            self.assertEqual(summary["latestQuotaWall"]["totals"]["inputTokens"], 1200)

            refused = self.launch(root, repo, limited)
            self.assertEqual(refused.returncode, 6, refused.stdout + refused.stderr)
            state_path = root / "runs" / "delegation-state.json"
            state = json.loads(state_path.read_text(encoding="utf-8"))
            cooldown_seconds = (
                datetime.fromisoformat(state["disabledUntil"]) - datetime.fromisoformat(state["changedAt"])
            ).total_seconds()
            self.assertEqual(cooldown_seconds, 5 * 60 * 60)
            state["disabledUntil"] = "2000-01-01T00:00:00+00:00"
            state_path.write_text(json.dumps(state), encoding="utf-8")

            recovered = self.launch(root, repo, self.create_fake_muse(root, "allowed.txt"))
            self.assertEqual(recovered.returncode, 0, recovered.stdout + recovered.stderr)
            self.assertFalse(state_path.exists())


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
