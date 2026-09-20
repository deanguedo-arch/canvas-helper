#!/usr/bin/env python3
"""Synthetic-fixture tests for build-math-source-registry.py.

Uses small synthetic ZIPs/files only; never requires the real private source
files. Run with:  python3 scripts/test-build-math-source-registry.py
"""

import hashlib
import importlib.util
import json
import os
import struct
import subprocess
import sys
import tempfile
import unittest
import warnings
import zipfile

SCRIPT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "build-math-source-registry.py")


def _load_builder():
    spec = importlib.util.spec_from_file_location(
        "build_math_source_registry", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _sha256_file(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        while True:
            chunk = handle.read(1 << 20)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def _write(path, data):
    with open(path, "wb") as handle:
        handle.write(data)


def _make_zip(path, members):
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for name, data in members.items():
            zf.writestr(name, data)


def _tiny_png(width=7, height=5):
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    out = [b"\x89PNG\r\n\x1a\n"]
    for chunk_type, payload in ((b"IHDR", ihdr), (b"IEND", b"")):
        out.append(struct.pack(">I", len(payload)))
        out.append(chunk_type)
        out.append(payload)
        out.append(struct.pack(">I", 0))
    return b"".join(out)


MANIFEST_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MAN-1">
  <organizations>
    <organization identifier="ORG-1"><title>Factoring Unit</title>
      <item identifier="ITEM-1" identifierref="RES-1"><title>Lesson One</title></item>
      <item identifier="ITEM-2" identifierref="RES-2"><title>Lesson Two</title></item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" href="content/lesson1.html"/>
    <resource identifier="RES-2" href="content/lesson2.html"/>
  </resources>
</manifest>
"""

HTML_UTF8 = (
    "<!DOCTYPE html><html><head><title>Factoring Basics</title></head>"
    "<body><h1>Factoring Basics</h1>"
    "<p>FACTOR-SECRET-PHRASE-xyz factor trinomials here</p>"
    "<math><mi>x</mi></math><input type=\"text\">"
    "<img src=\"images/fig1.png\">"
    "<a href=\"https://example.edu/page?x=1&amp;y=2\">link</a>"
    "</body></html>"
).encode("utf-8")

HTML_UTF16 = (
    "<html><head><title>Trig Page</title></head>"
    "<body><p>right triangle trigonometry intro</p>"
    "<iframe src=\"media/vid.mp4\"></iframe></body></html>"
).encode("utf-16")

QUESTIONDB_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<questiondb>
  <item ident="Q-1" label="first"><itemmetadata><qtimetadata>
    <qti_metadatafield><fieldlabel>qmd_questiontype</fieldlabel><fieldentry>Multiple Choice</fieldentry></qti_metadatafield>
    <qti_metadatafield><fieldlabel>qmd_globalid</fieldlabel><fieldentry>global-q-1</fieldentry></qti_metadatafield>
  </qtimetadata></itemmetadata><presentation><material><mattext>What factoring pair gives 2+2?</mattext></material></presentation>
    <resprocessing><respcondition><varequal>4</varequal></respcondition></resprocessing>
    <itemfeedback><material><mattext>Good job feedback body</mattext></material></itemfeedback>
  </item>
  <item ident="Q-2"><presentation><material><mattext>Pick red or blue?</mattext><matimage imageref="images/fig1.png"/></material></presentation></item>
</questiondb>
"""

QUIZ_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<assessment ident="QUIZ-9" title="Quiz Nine">
  <section ident="SEC-A"><itemref identref="first"/><itemref identref="Q-2"/></section>
  <section ident="SEC-B"><itemref identref="Q-MISSING"/></section>
  <item ident="Q-INLINE" label="inline"><presentation><material><mattext>right triangle trigonometry</mattext></material></presentation></item>
</assessment>
"""


class _Harness(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.src = os.path.join(self.tmp.name, "src")
        self.out = os.path.join(self.tmp.name, "out")
        os.makedirs(self.src)
        self.builder = _load_builder()

    def tearDown(self):
        self.tmp.cleanup()

    # -- helpers ---------------------------------------------------------
    def _add_file(self, filename, data):
        path = os.path.join(self.src, filename)
        _write(path, data)
        return {
            "filename": filename,
            "expectedBytes": len(data),
            "expectedSha256": hashlib.sha256(data).hexdigest(),
        }

    def _add_zip(self, filename, members):
        path = os.path.join(self.src, filename)
        _make_zip(path, members)
        size = os.path.getsize(path)
        return {
            "filename": filename,
            "expectedBytes": size,
            "expectedSha256": _sha256_file(path),
        }

    def _write_inputs(self, records):
        inputs = os.path.join(self.tmp.name, "inputs.json")
        with open(inputs, "w", encoding="utf-8") as handle:
            json.dump({"schemaVersion": 1, "records": records}, handle)
        return inputs

    def _run_cli(self, records, extra_args=None):
        inputs = self._write_inputs(records)
        cmd = [sys.executable, SCRIPT_PATH, "--source-root", self.src,
               "--inputs", inputs, "--output-dir", self.out]
        cmd.extend(extra_args or [])
        proc = subprocess.run(cmd, capture_output=True, text=True)
        return proc

    def _read_json(self, name):
        with open(os.path.join(self.out, name), encoding="utf-8") as handle:
            return json.load(handle)

    def _read_ndjson(self, name):
        rows = []
        with open(os.path.join(self.out, name), encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    rows.append(json.loads(line))
        return rows

    def _outputs_text(self):
        blob = []
        for name in os.listdir(self.out):
            with open(os.path.join(self.out, name), encoding="utf-8") as h:
                blob.append(h.read())
        return "\n".join(blob)

    # -- tests -----------------------------------------------------------
    def test_deterministic_output(self):
        members = {
            "imsmanifest.xml": MANIFEST_XML,
            "content/lesson1.html": HTML_UTF8,
            "questiondb.xml": QUESTIONDB_XML,
            "quizzes/quiz1.xml": QUIZ_XML,
            "images/fig1.png": _tiny_png(),
        }
        rec = self._add_zip("D2LExport_test.zip", members)
        rec["artifactRole"] = "authoritative_source_export"
        rec["courseCode"] = "Math 10C"
        rec["sourceVariant"] = "NXT Master"
        proc = self._run_cli([rec])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        first = {}
        for name in sorted(os.listdir(self.out)):
            with open(os.path.join(self.out, name), "rb") as handle:
                first[name] = handle.read()
        out2 = os.path.join(self.tmp.name, "out2")
        inputs = self._write_inputs([rec])
        proc2 = subprocess.run(
            [sys.executable, SCRIPT_PATH, "--source-root", self.src,
             "--inputs", inputs, "--output-dir", out2],
            capture_output=True, text=True)
        self.assertEqual(proc2.returncode, 0, proc2.stderr)
        for name, data in first.items():
            with open(os.path.join(out2, name), "rb") as handle:
                self.assertEqual(handle.read(), data, name)

    def test_hash_and_size_validation(self):
        rec = self._add_file("notes.bin", b"hello-bytes")
        rec["artifactRole"] = "planning_evidence"
        bad_hash = dict(rec)
        bad_hash["expectedSha256"] = "0" * 64
        proc = self._run_cli([bad_hash])
        self.assertNotEqual(proc.returncode, 0)
        summary = self._read_json("registry-summary.json")
        self.assertEqual(summary["records"][0]["status"], "hash-mismatch")
        bad_size = dict(rec)
        bad_size["expectedBytes"] = rec["expectedBytes"] + 1
        proc = self._run_cli([bad_size])
        self.assertNotEqual(proc.returncode, 0)
        summary = self._read_json("registry-summary.json")
        self.assertEqual(summary["records"][0]["status"], "size-mismatch")

    def test_duplicate_grouping_and_skip(self):
        members = {"content/a.html": HTML_UTF8}
        rec_a = self._add_zip("export-a.zip", members)
        # Second file with identical bytes: true local duplicate.
        with open(os.path.join(self.src, "export-a.zip"), "rb") as handle:
            data = handle.read()
        _write(os.path.join(self.src, "export-a (1).zip"), data)
        rec_b = {
            "filename": "export-a (1).zip",
            "expectedBytes": rec_a["expectedBytes"],
            "expectedSha256": rec_a["expectedSha256"],
            "artifactRole": "duplicate_local_copy",
            "duplicateOf": "export-a.zip",
        }
        rec_a["artifactRole"] = "authoritative_source_export"
        proc = self._run_cli([rec_a, rec_b])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        summary = self._read_json("registry-summary.json")
        self.assertEqual(summary["counts"]["archivesScanned"], 1)
        self.assertEqual(len(summary["duplicateGroups"]), 1)
        group = summary["duplicateGroups"][0]
        self.assertEqual(sorted(group["filenames"]),
                         ["export-a (1).zip", "export-a.zip"])
        by_name = {r["filename"]: r for r in summary["records"]}
        self.assertTrue(by_name["export-a.zip"]["scannedAsSourceTruth"])
        self.assertFalse(by_name["export-a (1).zip"]["scannedAsSourceTruth"])

    def test_utf8_utf16_html_metadata(self):
        members = {
            "content/factoring.html": HTML_UTF8,
            "content/trig.html": HTML_UTF16,
        }
        rec = self._add_zip("html-pack.zip", members)
        rec["artifactRole"] = "authoritative_source_export"
        rec["courseCode"] = "Math 10C"
        proc = self._run_cli([rec])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        rows = {r["member"]: r for r in self._read_ndjson("content-index.ndjson")}
        utf8 = rows["content/factoring.html"]
        self.assertEqual(utf8["encoding"], "utf-8")
        self.assertEqual(utf8["title"], "Factoring Basics")
        self.assertTrue(utf8["hasMathml"])
        self.assertTrue(utf8["hasInput"])
        self.assertIn("images/fig1.png", utf8["imageRefs"])
        self.assertIn("example.edu", utf8["externalHosts"])
        self.assertIn("factoring", utf8["topicTags"])
        utf16 = rows["content/trig.html"]
        self.assertEqual(utf16["encoding"], "utf-16")
        self.assertTrue(utf16["hasIframe"])
        self.assertIn("right-triangle-trigonometry", utf16["topicTags"])
        blob = self._outputs_text()
        self.assertNotIn("FACTOR-SECRET-PHRASE-xyz", blob)
        self.assertNotIn("?x=1", blob)

    def test_manifest_hierarchy(self):
        rec = self._add_zip("manifest-pack.zip",
                            {"imsmanifest.xml": MANIFEST_XML})
        rec["artifactRole"] = "authoritative_source_export"
        proc = self._run_cli([rec])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        archives = self._read_json("course-archives.json")["archives"]
        self.assertEqual(len(archives), 1)
        archive = archives[0]
        self.assertTrue(archive["manifestPresent"])
        self.assertIn("Factoring Unit", archive["organizationTitles"])
        self.assertEqual(
            archive["manifestTopLevelTitles"], ["Lesson One", "Lesson Two"]
        )
        self.assertEqual(archive["manifestItemCount"], 2)
        self.assertEqual(archive["manifestResourceCount"], 2)

    def test_question_ids_itemrefs_without_leakage(self):
        members = {
            "questiondb.xml": QUESTIONDB_XML,
            "quizzes/quiz1.xml": QUIZ_XML,
        }
        rec = self._add_zip("assess-pack.zip", members)
        rec["artifactRole"] = "authoritative_source_export"
        proc = self._run_cli([rec])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        questions = self._read_ndjson("question-reference-index.ndjson")
        idents = sorted(q["itemIdent"] for q in questions)
        self.assertEqual(idents, ["Q-1", "Q-2", "Q-INLINE"])
        q1 = next(q for q in questions if q["itemIdent"] == "Q-1")
        self.assertTrue(q1["hasResponseKey"])
        self.assertTrue(q1["hasFeedback"])
        self.assertEqual(q1["questionType"], "Multiple Choice")
        self.assertEqual(q1["globalId"], "global-q-1")
        self.assertIn("factoring", q1["topicTags"])
        self.assertEqual(q1["assessmentRole"], "unclassified")
        inline = next(q for q in questions if q["itemIdent"] == "Q-INLINE")
        self.assertEqual(inline["sourceKind"], "quiz-inline")
        self.assertIn("right-triangle-trigonometry", inline["topicTags"])
        relations = self._read_ndjson("assessment-relations.ndjson")
        self.assertEqual(len(relations), 1)
        rel = relations[0]
        self.assertEqual(rel["quizId"], "QUIZ-9")
        self.assertEqual(rel["sectionIds"], ["SEC-A", "SEC-B"])
        self.assertEqual(rel["referencedItemCount"], 3)
        self.assertEqual(rel["resolvedCount"], 2)
        self.assertEqual(rel["unresolvedCount"], 1)
        self.assertEqual(rel["unresolvedRefIds"], ["Q-MISSING"])
        self.assertEqual(rel["inlineItemIds"], ["Q-INLINE"])
        blob = self._outputs_text()
        for leaked in ("What factoring pair gives 2+2?", "Pick red or blue?",
                       "Good job feedback body", "varequal"):
            self.assertNotIn(leaked, blob)

    def test_image_metadata_reference_linkage(self):
        members = {
            "content/page.html": HTML_UTF8,
            "images/fig1.png": _tiny_png(width=7, height=5),
        }
        rec = self._add_zip("asset-pack.zip", members)
        rec["artifactRole"] = "authoritative_source_export"
        proc = self._run_cli([rec])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        assets = self._read_ndjson("asset-index.ndjson")
        self.assertEqual(len(assets), 1)
        asset = assets[0]
        self.assertEqual(asset["extension"], ".png")
        self.assertEqual(asset["mediaClass"], "image")
        self.assertEqual(asset["width"], 7)
        self.assertEqual(asset["height"], 5)
        self.assertIn("content/page.html", asset["referencedBy"])
        self.assertEqual(asset["rightsStatus"], "unreviewed")
        self.assertEqual(asset["learnerUseStatus"], "not-approved")

    def test_unsafe_and_case_colliding_names(self):
        members = {
            "../evil.html": b"<html><body>evil</body></html>",
            "/abs.html": b"<html><body>abs</body></html>",
            "Folder/A.html": b"<html><body>upper</body></html>",
            "folder/a.html": b"<html><body>lower</body></html>",
            "ok.html": b"<html><body>ok</body></html>",
        }
        rec = self._add_zip("risky-pack.zip", members)
        rec["artifactRole"] = "authoritative_source_export"
        proc = self._run_cli([rec])
        self.assertNotEqual(proc.returncode, 0, proc.stderr)
        archives = self._read_json("course-archives.json")["archives"]
        archive = archives[0]
        reasons = {u["member"]: u["reason"] for u in archive["unsafeMembers"]}
        self.assertEqual(reasons.get("../evil.html"), "path-traversal")
        self.assertEqual(reasons.get("/abs.html"), "absolute-path")
        self.assertEqual(len(archive["caseCollisions"]), 1)
        self.assertEqual(sorted(archive["caseCollisions"][0]),
                         ["Folder/A.html", "folder/a.html"])
        indexed = {r["member"]
                   for r in self._read_ndjson("content-index.ndjson")}
        self.assertNotIn("../evil.html", indexed)
        self.assertNotIn("/abs.html", indexed)

    def test_per_archive_budget_resets(self):
        records = []
        for number in (1, 2):
            rec = self._add_zip(
                f"course-{number}.zip",
                {f"content/lesson-{number}.html": HTML_UTF8},
            )
            rec["artifactRole"] = "authoritative_source_export"
            records.append(rec)
        budget = len(HTML_UTF8) + 64
        proc = self._run_cli(
            records, ["--max-total-bytes", str(budget)]
        )
        self.assertEqual(proc.returncode, 0, proc.stderr)
        rows = self._read_ndjson("content-index.ndjson")
        self.assertEqual(len(rows), 2)

    def test_duplicate_member_name_fails_archive_safety(self):
        path = os.path.join(self.src, "duplicate-member.zip")
        with warnings.catch_warnings():
            warnings.simplefilter("ignore", UserWarning)
            with zipfile.ZipFile(path, "w") as zf:
                zf.writestr("same.html", b"<html>one</html>")
                zf.writestr("same.html", b"<html>two</html>")
        rec = {
            "filename": "duplicate-member.zip",
            "expectedBytes": os.path.getsize(path),
            "expectedSha256": _sha256_file(path),
            "artifactRole": "authoritative_source_export",
        }
        proc = self._run_cli([rec])
        self.assertNotEqual(proc.returncode, 0, proc.stderr)
        archive = self._read_json("course-archives.json")["archives"][0]
        self.assertEqual(archive["duplicateMembers"], ["same.html"])

    def test_missing_source(self):
        rec = {
            "filename": "not-here.zip",
            "expectedBytes": 10,
            "expectedSha256": "0" * 64,
            "artifactRole": "authoritative_source_export",
        }
        proc = self._run_cli([rec])
        self.assertNotEqual(proc.returncode, 0)
        summary = self._read_json("registry-summary.json")
        self.assertEqual(summary["records"][0]["status"], "missing")

    def test_output_privacy_self_audit(self):
        passed, checked, hits = self.builder.audit_outputs(self.out)
        self.assertTrue(passed)
        self.assertEqual(hits, [])
        os.makedirs(self.out, exist_ok=True)
        planted = os.path.join(self.out, "content-index.ndjson")
        with open(planted, "w", encoding="utf-8") as handle:
            handle.write('{"member": "x", "prompt": "leaked"}\n')
        passed, checked, hits = self.builder.audit_outputs(self.out)
        self.assertFalse(passed)
        self.assertTrue(any(h["token"] == "prompt" for h in hits))

    def test_non_authoritative_not_parsed(self):
        members = {"content/plan.html": HTML_UTF8}
        rec = self._add_zip("plan-pack.zip", members)
        rec["artifactRole"] = "planning_evidence"
        proc = self._run_cli([rec])
        self.assertEqual(proc.returncode, 0, proc.stderr)
        summary = self._read_json("registry-summary.json")
        self.assertEqual(summary["counts"]["archivesScanned"], 0)
        self.assertEqual(self._read_ndjson("content-index.ndjson"), [])
        self.assertEqual(summary["records"][0]["status"], "ok")


if __name__ == "__main__":
    unittest.main(verbosity=2)
