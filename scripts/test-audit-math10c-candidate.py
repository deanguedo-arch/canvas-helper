#!/usr/bin/env python3
"""Focused standard-library tests for scripts/audit-math10c-candidate.py.

Run: python3 scripts/test-audit-math10c-candidate.py
"""

import json
import os
import subprocess
import sys
import tempfile
import unittest
import zipfile

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCANNER = os.path.join(REPO_ROOT, "scripts", "audit-math10c-candidate.py")
REQUIREMENTS = os.path.join(REPO_ROOT, "tasks", "math10c-preflight",
                            "ASTRA_REQUIREMENTS.json")

GOOD_HTML = """<!DOCTYPE html>
<html lang="en">
<head><title>Factoring practice</title></head>
<body>
<h1>Learn: factoring trinomials</h1>
<p>Try your turn: factor x^2 + 5x + 6. Feedback with a hint, then try again for a fresh attempt.</p>
<form><label>Answer<input type="text" name="answer"></label></form>
<img src="diagram.png" alt="Factoring area diagram">
<a href="#practice">Show what you know quiz</a>
</body>
</html>
"""


def run_scanner(candidate, tmpdir, name="report.json"):
    output = os.path.join(tmpdir, name)
    result = subprocess.run(
        [sys.executable, SCANNER, candidate,
         "--requirements", REQUIREMENTS, "--output", output],
        capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    with open(output, "r", encoding="utf-8") as handle:
        return json.load(handle)


def write_candidate(tmpdir, files):
    root = os.path.join(tmpdir, "candidate")
    os.makedirs(root)
    for relpath, data in files.items():
        full = os.path.join(root, relpath)
        os.makedirs(os.path.dirname(full) or root, exist_ok=True)
        mode = "wb" if isinstance(data, bytes) else "w"
        kwargs = {} if isinstance(data, bytes) else {"encoding": "utf-8"}
        with open(full, mode, **kwargs) as handle:
            handle.write(data)
    return root


def check_status(report, check_id):
    for check in report["checks"]:
        if check["id"] == check_id:
            return check["status"]
    raise AssertionError(f"missing check {check_id}")


class TestAuditHarness(unittest.TestCase):
    def test_valid_minimal_directory(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "index.html": GOOD_HTML,
                "diagram.png": b"\x89PNG\r\n\x1a\n",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(report["candidate"]["kind"], "directory")
            self.assertEqual(check_status(report, "HTML_DECODING"), "pass")
            self.assertEqual(check_status(report, "LOCAL_REFS"), "pass")
            self.assertEqual(check_status(report, "A11Y_LANG_TITLE"), "pass")
            self.assertEqual(check_status(report, "A11Y_IMG_ALT"), "pass")
            self.assertEqual(check_status(report, "A11Y_FORM_LABELS"), "pass")
            self.assertEqual(check_status(report, "LEARNER_FLOW"), "pass")
            self.assertEqual(check_status(report, "PILOT_FACTORING"), "pass")
            self.assertIn("/", report["requirementCoverage"]["verifiedFraction"])

    def test_valid_minimal_zip(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            zippath = os.path.join(tmpdir, "candidate.zip")
            with zipfile.ZipFile(zippath, "w") as archive:
                archive.writestr("index.html", GOOD_HTML)
                archive.writestr("diagram.png", b"\x89PNG\r\n\x1a\n")
            report = run_scanner(zippath, tmpdir)
            self.assertEqual(report["candidate"]["kind"], "zip")
            self.assertEqual(check_status(report, "ZIP_PATHS"), "pass")
            self.assertEqual(check_status(report, "ZIP_DUPLICATES"), "pass")
            self.assertEqual(check_status(report, "LOCAL_REFS"), "pass")

    def test_path_traversal_member(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            zippath = os.path.join(tmpdir, "evil.zip")
            with zipfile.ZipFile(zippath, "w") as archive:
                archive.writestr("../escape.html", "<html></html>")
                archive.writestr("index.html", GOOD_HTML)
            report = run_scanner(zippath, tmpdir)
            self.assertEqual(check_status(report, "ZIP_PATHS"), "fail")

    def test_duplicate_and_case_colliding_zip_members(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            zippath = os.path.join(tmpdir, "duplicates.zip")
            with zipfile.ZipFile(zippath, "w") as archive:
                archive.writestr("index.html", GOOD_HTML)
                archive.writestr("index.html", GOOD_HTML)
                archive.writestr("INDEX.HTML", GOOD_HTML)
            report = run_scanner(zippath, tmpdir)
            self.assertEqual(check_status(report, "ZIP_DUPLICATES"), "fail")
            self.assertEqual(report["candidate"]["entryCount"], 3)
            self.assertEqual(report["candidate"]["fileCount"], 2)

    def test_broken_local_reference(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "index.html": GOOD_HTML.replace("diagram.png", "missing.png"),
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(check_status(report, "LOCAL_REFS"), "fail")
            evidence = " ".join(
                item for c in report["checks"]
                if c["id"] == "LOCAL_REFS" for item in c["evidence"])
            self.assertIn("missing.png", evidence)

    def test_parent_relative_reference_resolves_from_nested_page(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "lessons/factoring/index.html": GOOD_HTML.replace(
                    "diagram.png", "../diagram.png"),
                "lessons/diagram.png": b"diagram",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(check_status(report, "LOCAL_REFS"), "pass")

    def test_same_id_on_separate_pages_is_not_a_duplicate(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            page = GOOD_HTML.replace("<h1>", "<h1 id='lesson-title'>")
            candidate = write_candidate(tmpdir, {
                "one.html": page,
                "two.html": page,
                "diagram.png": b"diagram",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertNotEqual(check_status(report, "STABLE_IDS"), "fail")

    def test_utf16_html(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "index.html": GOOD_HTML.encode("utf-16"),
                "diagram.png": b"\x89PNG\r\n\x1a\n",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(check_status(report, "HTML_DECODING"), "pass")
            self.assertEqual(check_status(report, "LOCAL_REFS"), "pass")

    def test_placeholder_and_internal_note_flag(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "index.html": GOOD_HTML + "\n<!-- TODO: replace me -->\n",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(check_status(report, "PLACEHOLDERS"),
                             "manual_review")

    def test_accessibility_indicators(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "index.html": "<!DOCTYPE html><html><head></head><body>"
                              "<img src='x.png'><input type='text'>"
                              "</body></html>",
                "x.png": b"fake",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(check_status(report, "A11Y_LANG_TITLE"), "fail")
            self.assertEqual(check_status(report, "A11Y_IMG_ALT"),
                             "manual_review")
            self.assertEqual(check_status(report, "A11Y_FORM_LABELS"), "fail")

    def test_deterministic_output(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            candidate = write_candidate(tmpdir, {
                "index.html": GOOD_HTML,
                "diagram.png": b"\x89PNG\r\n\x1a\n",
            })
            first = run_scanner(candidate, tmpdir, "r1.json")
            second = run_scanner(candidate, tmpdir, "r2.json")
            self.assertEqual(first, second)
            self.assertNotIn("r1.json", json.dumps(first))
            self.assertNotIn("r2.json", json.dumps(second))

    def test_secret_flag_withholds_contents(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            secret = "supersecret-answer-value-12345"
            candidate = write_candidate(tmpdir, {
                "index.html": GOOD_HTML + f"\n<p>answer key: {secret}</p>\n",
            })
            report = run_scanner(candidate, tmpdir)
            self.assertEqual(check_status(report, "SECRET_EXPOSURE"),
                             "manual_review")
            self.assertNotIn(secret, json.dumps(report))


if __name__ == "__main__":
    unittest.main(verbosity=2)
