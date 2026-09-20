#!/usr/bin/env python3
"""Standard-library synthetic tests for build-math-source-review-pack.py.

Builds synthetic Math 10C / Math 20 ZIPs, a synthetic SOURCE_INPUTS.json,
and synthetic registry fixtures in temporary directories, then runs the
builder as a subprocess and asserts selection, matching, sanitization,
image validation, determinism, caps, decision preservation, privacy, and
output-directory policy. Contains no real answers, solutions, or feedback.

Usage:
    python3 scripts/test-build-math-source-review-pack.py
"""

import hashlib
import importlib.util
import json
import os
import re
import struct
import subprocess
import sys
import tempfile
import zipfile
from xml.sax.saxutils import escape as xml_escape

TEST_DIR = os.path.abspath(os.path.dirname(__file__))
REPO_ROOT = os.path.abspath(os.path.join(TEST_DIR, os.pardir))
BUILDER = os.path.join(TEST_DIR, "build-math-source-review-pack.py")

_spec = importlib.util.spec_from_file_location(
    "review_pack_mod", BUILDER)
mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(mod)

FAILURES = []
PASSES = []


def check(name, condition, detail=""):
    if condition:
        PASSES.append(name)
        print("PASS %s" % name)
    else:
        FAILURES.append(name)
        print("FAIL %s %s" % (name, detail))


def sha(data):
    return hashlib.sha256(data).hexdigest()


def mini_png(width, height, seed=b"\x01"):
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + struct.pack(">I", 13) + b"IHDR" + ihdr
            + b"\x00\x00\x00\x00" + seed)


def mini_gif(width, height):
    return b"GIF89a" + struct.pack("<HH", width, height) + b"\x00\x00\x00"


def mini_jpeg():
    return (b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01"
            b"\x00\x00\xff\xd9")


PNG_FACTOR = mini_png(3, 2, b"\x01")
PNG_SHARED = mini_png(4, 4, b"\x02")
PNG_BIG = mini_png(9, 9, b"\x03")
GIF_TRIG = mini_gif(5, 4)
JPEG_QUIZ = mini_jpeg()
BADMAGIC = b"this is plain text, not a png file...."
SVG_BYTES = (b'<svg xmlns="http://www.w3.org/2000/svg">'
             b'<script>alert(1)</script></svg>')
PDF_BYTES = b"%PDF-1.4 fake pdf bytes for exclusion test"
HASHMISMATCH_BYTES = mini_png(6, 6, b"\x04")
NOTINSPECTED_BYTES = mini_png(7, 7, b"\x05")

ANSWER_SECRET = "SECRET_CORRECT_Bravo"
SOLUTION_SECRET = "SOLUTION_BODY_SECRET_Zulu"
FEEDBACK_SECRET = "FEEDBACK_SECRET_Yankee"


def qti_item(ident, prompt, choices, refs=()):
    choice_xml = "".join(
        '<response_label ident="%s"><material><mattext>%s</mattext>'
        "</material></response_label>" % (cid, xml_escape(ctext))
        for cid, ctext in choices)
    ref_xml = "".join("<matimage imageref=\"%s\"/>" % xml_escape(r)
                      for r in refs)
    return (
        "<item ident=\"%s\">"
        "<presentation>"
        "<material><mattext>%s</mattext></material>"
        "<response_lid><render_choice>%s</render_choice></response_lid>"
        "%s"
        "<display_style>META_DISPLAY_SECRET</display_style>"
        "<enumeration>META_ENUM_SECRET</enumeration>"
        "<grading_type>META_GRADING_SECRET</grading_type>"
        "</presentation>"
        "<resprocessing><respcondition><conditionvar>"
        "<varequal>%s</varequal>"
        "</conditionvar></respcondition></resprocessing>"
        "<itemfeedback><material><mattext>%s %s</mattext></material>"
        "</itemfeedback>"
        "</item>"
        % (ident, xml_escape(prompt), choice_xml, ref_xml,
           ANSWER_SECRET, SOLUTION_SECRET, FEEDBACK_SECRET))


def qti_doc(items):
    return ("<?xml version=\"1.0\" encoding=\"UTF-8\"?><questestinterop>"
            "<assessment><section>%s</section></assessment>"
            "</questestinterop>" % "".join(items)).encode("utf-8")


XSS_PROMPT = ("Solve <script>alert('xss')</script> & review \"quotes\". "
              "<math><mrow><mi>x</mi><mo>+</mo><mn>2</mn></mrow>"
              "<annotation>HIDDEN_MATH_ANNOTATION</annotation></math>")
XSS_CHOICE = "Pick <img src=x onerror=alert(1)> this one"

BANK_ITEMS = [
    qti_item("QF1", "FACTOR_PROMPT_VISIBLE factor x*x+5*x+6",
             [("A", "CHOICE_ALPHA_VISIBLE"), ("B", "CHOICE_BETA_VISIBLE")],
             refs=("media/fig_factor.png", "media/shared.png",
                   "media/big.png")),
    qti_item("QT1", "TRIG_PROMPT_VISIBLE right triangle sohcahtoa "
             + XSS_PROMPT,
             [("A", XSS_CHOICE), ("B", "CHOICE_TRIG_VISIBLE")],
             refs=("media/fig_trig.gif", "media/shared.png",
                   "media/badmagic.png", "media/hashmismatch.png",
                   "media/diagram.svg", "media/notes.pdf",
                   "media/notinspected.png")),
    qti_item("QX1", "UNCLASSIFIED_PROMPT_VISIBLE unrelated content",
             [("A", "CHOICE_X_VISIBLE")]),
]
QUIZ_ITEMS = [
    qti_item("QQ1", "QUIZ_FACTOR_PROMPT_VISIBLE factor trinomial",
             [("A", "CHOICE_QUIZ_VISIBLE")],
             refs=("media/fig_quiz.jpg", "../evil.png")),
]
DUP_ITEM = qti_item("DUP1", "DUP_PROMPT_VISIBLE factor duplicate",
                    [("A", "CHOICE_DUP_VISIBLE")])
MISMATCH_ITEM = qti_item("MM1", "MISMATCH_PROMPT_VISIBLE factor mismatch",
                         [("A", "CHOICE_MM_VISIBLE")])
M20_ITEM = qti_item("M201", "M20_FACTOR_PROMPT_VISIBLE factor math20",
                    [("A", "CHOICE_M20_VISIBLE")])
NO_PRESENTATION_ITEM = (
    '<item ident="NP1"><material><mattext>NO_PRESENTATION_SECRET</mattext>'
    '</material></item>')

MATH10_MEMBERS = {
    "questiondb/bank1.xml": qti_doc(BANK_ITEMS),
    "quizzes/quiz1.xml": qti_doc(QUIZ_ITEMS),
    "questiondb/dups.xml": qti_doc([DUP_ITEM, DUP_ITEM]),
    "questiondb/mismatch.xml": qti_doc([MISMATCH_ITEM]),
    "questiondb/no-presentation.xml": qti_doc([NO_PRESENTATION_ITEM]),
    "media/fig_factor.png": PNG_FACTOR,
    "media/shared.png": PNG_SHARED,
    "media/big.png": PNG_BIG,
    "media/fig_trig.gif": GIF_TRIG,
    "media/fig_quiz.jpg": JPEG_QUIZ,
    "media/badmagic.png": BADMAGIC,
    "media/hashmismatch.png": HASHMISMATCH_BYTES,
    "media/diagram.svg": SVG_BYTES,
    "media/notes.pdf": PDF_BYTES,
    "media/notinspected.png": NOTINSPECTED_BYTES,
}
MATH20_MEMBERS = {
    "questiondb/m20.xml": qti_doc([M20_ITEM]),
    "media/m20.png": mini_png(2, 2, b"\x09"),
}

MATH10_NAME = "synth-math10c.zip"
MATH20_NAME = "synth-math20.zip"


def write_zip(path, members):
    with zipfile.ZipFile(path, mode="w",
                         compression=zipfile.ZIP_DEFLATED) as zf:
        for name in sorted(members):
            zf.writestr(name, members[name])


def presentation_hash(member_bytes, ident):
    for item in mod.parse_member_items(member_bytes):
        if item["item_ident"] == ident:
            return item["presentation_sha256"]
    raise AssertionError("ident %s not found" % ident)


def qrow(source_key, member, kind, ident, tags, refs, pres_hash=None):
    return {
        "sourceKey": source_key,
        "member": member,
        "sourceKind": kind,
        "itemIdent": ident,
        "itemLabel": None,
        "globalId": None,
        "questionType": "multiple_choice",
        "presentationSha256": pres_hash,
        "hasFeedback": True,
        "hasImage": bool(refs),
        "referencedAssets": list(refs),
        "hasResponseKey": True,
        "topicTags": list(tags),
        "assessmentRole": "unclassified",
    }


def arow(source_key, member, ext, status, digest, tags):
    return {
        "sourceKey": source_key,
        "member": member,
        "extension": ext,
        "mediaClass": "image" if ext in (".png", ".jpg", ".gif", ".svg")
        else "pdf",
        "byteSize": 0,
        "crc32": "00000000",
        "sha256": digest,
        "inspectionStatus": status,
        "width": None,
        "height": None,
        "referencedBy": [],
        "topicTags": list(tags),
        "rightsStatus": "unreviewed",
        "learnerUseStatus": "not-approved",
    }


def build_fixture(root):
    source_dir = os.path.join(root, "source")
    registry_dir = os.path.join(root, "registry")
    os.makedirs(source_dir)
    os.makedirs(registry_dir)
    math10_path = os.path.join(source_dir, MATH10_NAME)
    math20_path = os.path.join(source_dir, MATH20_NAME)
    write_zip(math10_path, MATH10_MEMBERS)
    write_zip(math20_path, MATH20_MEMBERS)

    def record(path, role, course, variant):
        with open(path, "rb") as handle:
            data = handle.read()
        return {
            "filename": os.path.basename(path),
            "expectedBytes": len(data),
            "expectedSha256": sha(data),
            "artifactRole": role,
            "courseCode": course,
            "sourceVariant": variant,
        }

    inputs = {
        "schemaVersion": 1,
        "records": sorted([
            record(math10_path, "authoritative_source_export", "Math 10C",
                   "synthetic"),
            record(math20_path, "authoritative_source_export", "Math 20-1",
                   "synthetic"),
        ], key=lambda r: r["filename"]),
    }
    inputs_path = os.path.join(root, "SOURCE_INPUTS.json")
    with open(inputs_path, "w", encoding="utf-8") as handle:
        json.dump(inputs, handle, sort_keys=True, indent=2)
        handle.write("\n")

    bank = MATH10_MEMBERS["questiondb/bank1.xml"]
    quiz = MATH10_MEMBERS["quizzes/quiz1.xml"]
    dups = MATH10_MEMBERS["questiondb/dups.xml"]
    mismatch = MATH10_MEMBERS["questiondb/mismatch.xml"]
    no_presentation = MATH10_MEMBERS["questiondb/no-presentation.xml"]
    m20 = MATH20_MEMBERS["questiondb/m20.xml"]
    bad_hash = presentation_hash(mismatch, "MM1")
    bad_hash = bad_hash[:-1] + ("0" if bad_hash[-1] != "0" else "1")
    questions = [
        qrow(MATH10_NAME, "questiondb/bank1.xml", "question-db", "QF1",
             ["factoring"],
             ["media/fig_factor.png", "media/shared.png", "media/big.png"],
             presentation_hash(bank, "QF1")),
        qrow(MATH10_NAME, "questiondb/bank1.xml", "question-db", "QT1",
             ["right-triangle-trigonometry"],
             ["media/fig_trig.gif", "media/shared.png",
              "media/badmagic.png", "media/hashmismatch.png",
              "media/diagram.svg", "media/notes.pdf",
              "media/notinspected.png"],
             presentation_hash(bank, "QT1")),
        qrow(MATH10_NAME, "questiondb/bank1.xml", "question-db", "QX1",
             ["unclassified"], [], presentation_hash(bank, "QX1")),
        qrow(MATH10_NAME, "quizzes/quiz1.xml", "quiz-inline", "QQ1",
             ["factoring"], ["media/fig_quiz.jpg", "../evil.png"],
             presentation_hash(quiz, "QQ1")),
        qrow(MATH10_NAME, "questiondb/dups.xml", "question-db", "DUP1",
             ["factoring"], [], presentation_hash(dups, "DUP1")),
        qrow(MATH10_NAME, "questiondb/mismatch.xml", "question-db", "MM1",
             ["factoring"], [], bad_hash),
        qrow(MATH10_NAME, "questiondb/no-presentation.xml", "question-db",
             "NP1", ["factoring"], [],
             presentation_hash(no_presentation, "NP1")),
        qrow(MATH20_NAME, "questiondb/m20.xml", "question-db", "M201",
             ["factoring", "math20-fixture"], [],
             presentation_hash(m20, "M201")),
    ]
    assets = [
        arow(MATH10_NAME, "media/fig_factor.png", ".png", "inspected",
             sha(PNG_FACTOR), ["factoring"]),
        arow(MATH10_NAME, "media/shared.png", ".png", "inspected",
             sha(PNG_SHARED), ["factoring"]),
        arow(MATH10_NAME, "media/big.png", ".png", "inspected",
             sha(PNG_BIG), ["factoring"]),
        arow(MATH10_NAME, "media/fig_trig.gif", ".gif", "inspected",
             sha(GIF_TRIG), ["right-triangle-trigonometry"]),
        arow(MATH10_NAME, "media/fig_quiz.jpg", ".jpg", "inspected",
             sha(JPEG_QUIZ), ["factoring"]),
        arow(MATH10_NAME, "media/badmagic.png", ".png", "inspected",
             sha(BADMAGIC), ["right-triangle-trigonometry"]),
        arow(MATH10_NAME, "media/hashmismatch.png", ".png", "inspected",
             "0" * 64, ["right-triangle-trigonometry"]),
        arow(MATH10_NAME, "media/diagram.svg", ".svg", "inspected",
             sha(SVG_BYTES), ["right-triangle-trigonometry"]),
        arow(MATH10_NAME, "media/notes.pdf", ".pdf", "inspected",
             sha(PDF_BYTES), ["right-triangle-trigonometry"]),
        arow(MATH10_NAME, "media/notinspected.png", ".png",
             "metadata-only-not-selected", sha(NOTINSPECTED_BYTES),
             ["right-triangle-trigonometry"]),
        arow(MATH10_NAME, "../evil.png", ".png", "not-inspected-unsafe",
             sha(PNG_FACTOR), ["factoring"]),
        arow(MATH20_NAME, "media/m20.png", ".png", "inspected",
             sha(MATH20_MEMBERS["media/m20.png"]), ["math20-fixture"]),
    ]
    content = [
        {"sourceKey": MATH10_NAME, "member": "lessons/a.html",
         "topicTags": ["factoring"]},
        {"sourceKey": MATH20_NAME, "member": "lessons/b.html",
         "topicTags": ["math20-fixture"]},
    ]
    for name, rows in (("question-reference-index.ndjson", questions),
                       ("asset-index.ndjson", assets),
                       ("content-index.ndjson", content)):
        with open(os.path.join(registry_dir, name), "w", encoding="utf-8",
                  newline="\n") as handle:
            for row in rows:
                handle.write(json.dumps(row, sort_keys=True) + "\n")
    return source_dir, inputs_path, registry_dir


def run_builder(source_dir, inputs_path, registry_dir, output_dir, *extra):
    proc = subprocess.run(
        [sys.executable, BUILDER, "--source-root", source_dir,
         "--inputs", inputs_path, "--registry-dir", registry_dir,
         "--output-dir", output_dir] + list(extra),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return proc


def read_queue(output_dir):
    rows = []
    with open(os.path.join(output_dir,
                           "question-review-queue.ndjson"),
              encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                rows.append(json.loads(line))
    return rows


def output_bytes(output_dir):
    digest = hashlib.sha256()
    for base, _, files in os.walk(output_dir):
        for name in sorted(files):
            if name.endswith(".tmp"):
                continue
            path = os.path.join(base, name)
            digest.update(os.path.relpath(path, output_dir).encode())
            with open(path, "rb") as handle:
                digest.update(handle.read())
    return digest.hexdigest()


def snapshot_files(directories):
    state = {}
    for directory in directories:
        for base, _, files in os.walk(directory):
            for name in files:
                path = os.path.join(base, name)
                with open(path, "rb") as handle:
                    state[path] = sha(handle.read())
    return state


def test_selection_matching_and_provenance(root):
    source_dir, inputs_path, registry_dir = build_fixture(
        os.path.join(root, "t1"))
    before = snapshot_files([source_dir, registry_dir])
    out = os.path.join(root, "t1-out")
    proc = run_builder(source_dir, inputs_path, registry_dir, out)
    check("default-run-exit-0", proc.returncode == 0, proc.stderr[-2000:])
    check("inputs-unmodified",
          snapshot_files([source_dir, registry_dir]) == before)
    queue = read_queue(out)
    by_ident = {q["itemIdent"]: q for q in queue}
    check("factoring-selected", "QF1" in by_ident)
    check("trig-selected", "QT1" in by_ident)
    check("quiz-inline-selected", "QQ1" in by_ident)
    check("unclassified-excluded", "QX1" not in by_ident)
    check("math20-excluded", "M201" not in by_ident)
    check("ambiguous-rejected", "DUP1" not in by_ident)
    check("hash-mismatch-rejected", "MM1" not in by_ident)
    check("missing-presentation-rejected", "NP1" not in by_ident)
    check("emitted-count", len(queue) == 3, str(len(queue)))
    with open(os.path.join(out, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary = json.load(handle)
    reasons = summary["skippedQuestionReasons"]
    for reason in ("non-math10c-source", "topic-out-of-scope",
                   "ambiguous-match", "no-match-or-hash-mismatch",
                   "presentation-missing"):
        check("skip-reason-" + reason, reason in reasons, str(reasons))
    qf1 = by_ident["QF1"]
    for key in ("sourceKey", "member", "sourceKind", "itemIdent",
                "presentationSha256", "questionType", "topicTags",
                "promptText", "choices"):
        check("provenance-" + key, key in qf1 and qf1[key] not in (None, ""),
              key)
    check("source-kind-bank", qf1["sourceKind"] == "question-db")
    check("source-kind-quiz",
          by_ident["QQ1"]["sourceKind"] == "quiz-inline")
    check("no-tmp-leftovers",
          not [n for _, _, fs in os.walk(out) for n in fs
               if n.endswith(".tmp")])
    return source_dir, inputs_path, registry_dir, out, queue, summary


def test_no_answer_leakage(out, queue):
    blob = "\n".join(json.dumps(q, sort_keys=True) for q in queue)
    for secret in (ANSWER_SECRET, SOLUTION_SECRET, FEEDBACK_SECRET):
        check("secret-absent", secret not in blob, secret[:12])
    for secret in ("META_DISPLAY_SECRET", "META_ENUM_SECRET",
                   "META_GRADING_SECRET"):
        check("presentation-metadata-absent", secret not in blob, secret)
    for token in ("resprocessing", "varequal", "itemfeedback",
                  "respcondition", "correctresponse", "correctanswer"):
        check("markup-absent-" + token, token not in blob.lower(), token)
    prompts = {q["itemIdent"]: q["promptText"] for q in queue}
    check("prompt-visible-factoring",
          "FACTOR_PROMPT_VISIBLE" in prompts.get("QF1", ""))
    check("prompt-visible-trig",
          "TRIG_PROMPT_VISIBLE" in prompts.get("QT1", ""))
    qf1_choices = " ".join(c["text"]
                           for c in [q for q in queue
                                     if q["itemIdent"] == "QF1"][0]["choices"])
    check("choices-visible",
          "CHOICE_ALPHA_VISIBLE" in qf1_choices
          and "CHOICE_BETA_VISIBLE" in qf1_choices)
    with open(os.path.join(out, "question-decisions.json"),
              encoding="utf-8") as handle:
        decisions = json.load(handle)
    check("decision-enum",
          decisions["allowedDecisions"] == ["formative_candidate",
                                            "formal_or_restricted",
                                            "adaptable", "unsuitable"])
    check("decisions-blank",
          all(d["decision"] is None and d["notes"] == ""
              for d in decisions["decisions"]),
          str(decisions["decisions"]))
    with open(os.path.join(out, "image-review-queue.ndjson"),
              encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                row = json.loads(line)
                check("image-decisions-blank-%s" % row["imageId"][:8],
                      row["rightsDecision"] is None
                      and row["learnerUseDecision"] is None
                      and row["accessibilityDecision"] is None
                      and row["altText"] == "")


def test_xss_and_index(out):
    with open(os.path.join(out, "index.html"), encoding="utf-8") as handle:
        text = handle.read()
    check("no-script-tag", "<script" not in text.lower())
    check("no-iframe-or-form",
          "<iframe" not in text.lower() and "<form" not in text.lower())
    check("no-http-url", "http://" not in text and "https://" not in text)
    check("embedded-markup-removed", "&lt;script" not in text.lower()
          and "&lt;img" not in text.lower() and "&lt;math" not in text.lower())
    imgs = re.findall(r"<img\b[^>]*>", text)
    check("only-self-images",
          bool(imgs) and all('src="images/' in tag for tag in imgs),
          str(imgs)[:300])
    check("xss-payload-removed",
          "onerror" not in text and "alert('xss')" not in text
          and "HIDDEN_MATH_ANNOTATION" not in text)
    check("math-text-retained", "x + 2" in text)
    check("csp-present", "default-src 'none'" in text
          and "Content-Security-Policy" in text)
    check("no-external-resources",
          "stylesheet" not in text.lower() and "src=\"http" not in text)
    check("image-css-constrained", "max-width" in text
          and "review-image" in text)
    check("no-answers-in-index",
          ANSWER_SECRET not in text and SOLUTION_SECRET not in text
          and FEEDBACK_SECRET not in text)
    check("reuse-warning", "no permission to reuse" in text.lower())


def test_images(root, out):
    images_dir = os.path.join(out, "images")
    copied = sorted(os.listdir(images_dir))
    expected = sorted([sha(PNG_FACTOR) + ".png", sha(PNG_SHARED) + ".png",
                       sha(PNG_BIG) + ".png", sha(GIF_TRIG) + ".gif",
                       sha(JPEG_QUIZ) + ".jpg"])
    check("expected-images-copied", copied == expected, str(copied))
    with open(os.path.join(out, "image-review-queue.ndjson"),
              encoding="utf-8") as handle:
        rows = [json.loads(l) for l in handle if l.strip()]
    check("image-queue-count", len(rows) == 5, str(len(rows)))
    shared = [r for r in rows if r["sha256"] == sha(PNG_SHARED)]
    check("dedupe-single-record", len(shared) == 1)
    if shared:
        check("dedupe-referrers", len(shared[0]["referringQuestionIds"]) == 2,
              str(shared[0]["referringQuestionIds"]))
    dims = {r["sha256"]: (r["width"], r["height"]) for r in rows}
    check("png-dims", dims.get(sha(PNG_FACTOR)) == (3, 2),
          str(dims.get(sha(PNG_FACTOR))))
    check("gif-dims", dims.get(sha(GIF_TRIG)) == (5, 4),
          str(dims.get(sha(GIF_TRIG))))
    with open(os.path.join(out, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary = json.load(handle)
    check("duplicate-count",
          summary["counts"]["duplicateImageReferences"] == 1,
          str(summary["counts"]))
    reasons = summary["skippedImageReasons"]
    for reason in ("magic-mismatch", "hash-mismatch",
                   "unapproved-media-type", "asset-not-inspected",
                   "asset-unresolved"):
        check("image-skip-" + reason, reason in reasons, str(reasons))
    check("unsafe-member-rejected",
          mod.member_unsafe_reason("../evil.png") == "path-traversal")
    for name in copied:
        check("copied-name-safe-" + name[-4:],
              bool(re.fullmatch(r"[0-9a-f]{64}\.(png|jpg|gif)", name)), name)


def test_determinism(root, source_dir, inputs_path, registry_dir):
    out_a = os.path.join(root, "det-a")
    out_b = os.path.join(root, "det-b")
    proc_a = run_builder(source_dir, inputs_path, registry_dir, out_a)
    proc_b = run_builder(source_dir, inputs_path, registry_dir, out_b)
    check("determinism-exit",
          proc_a.returncode == 0 and proc_b.returncode == 0)
    check("determinism-bytes", output_bytes(out_a) == output_bytes(out_b))


def test_caps(root, source_dir, inputs_path, registry_dir):
    out = os.path.join(root, "caps-q")
    proc = run_builder(source_dir, inputs_path, registry_dir, out,
                       "--max-questions", "1")
    check("question-cap-exit", proc.returncode == 0, proc.stderr[-1000:])
    check("question-cap-count", len(read_queue(out)) == 1)
    with open(os.path.join(out, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary = json.load(handle)
    check("question-cap-reason",
          "question-cap" in summary["skippedQuestionReasons"])
    out2 = os.path.join(root, "caps-i")
    proc2 = run_builder(source_dir, inputs_path, registry_dir, out2,
                        "--max-images", "1")
    check("image-cap-exit", proc2.returncode == 0, proc2.stderr[-1000:])
    with open(os.path.join(out2, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary2 = json.load(handle)
    check("image-cap-count", summary2["counts"]["emittedImages"] == 1)
    check("image-cap-reason", "image-cap" in summary2["skippedImageReasons"])
    out3 = os.path.join(root, "caps-b")
    proc3 = run_builder(source_dir, inputs_path, registry_dir, out3,
                        "--max-image-bytes", "15")
    check("byte-cap-exit", proc3.returncode == 0, proc3.stderr[-1000:])
    with open(os.path.join(out3, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary3 = json.load(handle)
    check("byte-cap-reason",
          "image-too-large" in summary3["skippedImageReasons"])
    check("byte-cap-partial", summary3["counts"]["emittedImages"] == 1,
          str(summary3["counts"]))


def test_decision_preservation(root, source_dir, inputs_path, registry_dir,
                               queue):
    out = os.path.join(root, "dec")
    proc = run_builder(source_dir, inputs_path, registry_dir, out)
    check("dec-first-exit", proc.returncode == 0, proc.stderr[-1000:])
    first_id = read_queue(out)[0]["questionId"]
    qpath = os.path.join(out, "question-decisions.json")
    with open(qpath, encoding="utf-8") as handle:
        decisions = json.load(handle)
    decisions["decisions"][0] = {"id": first_id,
                                 "decision": "adaptable",
                                 "notes": "reviewer note kept"}
    decisions["decisions"].append({"id": "qstale0000000000",
                                   "decision": "unsuitable",
                                   "notes": "stale note"})
    with open(qpath, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(decisions, handle, sort_keys=True, indent=2)
        handle.write("\n")
    ipath = os.path.join(out, "image-decisions.json")
    with open(ipath, encoding="utf-8") as handle:
        idec = json.load(handle)
    img_first = idec["decisions"][0]["id"]
    idec["decisions"][0] = {"id": img_first, "rightsDecision": None,
                            "learnerUseDecision": None,
                            "accessibilityDecision": None,
                            "altText": "draft alt kept"}
    with open(ipath, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(idec, handle, sort_keys=True, indent=2)
        handle.write("\n")
    proc2 = run_builder(source_dir, inputs_path, registry_dir, out)
    check("dec-rerun-exit", proc2.returncode == 0, proc2.stderr[-1000:])
    with open(qpath, encoding="utf-8") as handle:
        after = json.load(handle)
    kept = [d for d in after["decisions"] if d["id"] == first_id]
    check("decision-preserved",
          kept and kept[0]["decision"] == "adaptable"
          and kept[0]["notes"] == "reviewer note kept", str(kept))
    check("stale-retained",
          any(d["id"] == "qstale0000000000"
              for d in after.get("staleDecisions", [])),
          str(after.get("staleDecisions")))
    check("new-blanks-added",
          any(d["id"] != first_id and d["decision"] is None
              for d in after["decisions"]))
    with open(os.path.join(out, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary = json.load(handle)
    check("stale-counted",
          summary["counts"]["staleQuestionDecisions"] == 1
          and summary["counts"]["preservedQuestionDecisions"] == 1,
          str(summary["counts"]))
    with open(ipath, encoding="utf-8") as handle:
        iafter = json.load(handle)
    ikept = [d for d in iafter["decisions"] if d["id"] == img_first]
    check("image-decision-preserved",
          ikept and ikept[0]["altText"] == "draft alt kept", str(ikept))
    proc_stale = run_builder(source_dir, inputs_path, registry_dir, out,
                             "--max-questions", "0")
    check("stale-survives-multiple-reruns", proc_stale.returncode == 0,
          proc_stale.stderr[-1000:])
    with open(qpath, encoding="utf-8") as handle:
        stale_again = json.load(handle)
    check("stale-decision-still-retained",
          any(d["id"] == first_id
              and d["decision"] == "adaptable"
              and d["notes"] == "reviewer note kept"
              for d in stale_again.get("staleDecisions", [])),
          str(stale_again.get("staleDecisions")))
    proc3 = run_builder(source_dir, inputs_path, registry_dir, out,
                        "--overwrite-decisions")
    check("overwrite-exit", proc3.returncode == 0, proc3.stderr[-1000:])
    with open(qpath, encoding="utf-8") as handle:
        reset = json.load(handle)
    check("overwrite-blanks",
          all(d["decision"] is None and d["notes"] == ""
              for d in reset["decisions"])
          and reset.get("staleDecisions") == [], str(reset))


def test_invalid_decisions_fail_closed(root, source_dir, inputs_path,
                                       registry_dir):
    out = os.path.join(root, "bad-dec")
    proc = run_builder(source_dir, inputs_path, registry_dir, out)
    check("bad-decision-setup", proc.returncode == 0, proc.stderr[-1000:])
    qpath = os.path.join(out, "question-decisions.json")
    with open(qpath, encoding="utf-8") as handle:
        data = json.load(handle)
    data["decisions"][0]["decision"] = "invented_status"
    with open(qpath, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(data, handle, sort_keys=True, indent=2)
        handle.write("\n")
    proc2 = run_builder(source_dir, inputs_path, registry_dir, out)
    check("invalid-decision-rejected", proc2.returncode == 1,
          proc2.stderr[-1000:])


def test_stale_generated_image_cleanup(root, source_dir, inputs_path,
                                       registry_dir):
    out = os.path.join(root, "stale-image")
    proc = run_builder(source_dir, inputs_path, registry_dir, out)
    check("stale-image-setup", proc.returncode == 0, proc.stderr[-1000:])
    stale_name = "f" * 64 + ".png"
    stale_path = os.path.join(out, "images", stale_name)
    with open(stale_path, "wb") as handle:
        handle.write(PNG_FACTOR)
    proc2 = run_builder(source_dir, inputs_path, registry_dir, out)
    check("stale-image-rerun", proc2.returncode == 0, proc2.stderr[-1000:])
    check("stale-generated-image-removed", not os.path.exists(stale_path))
    with open(os.path.join(out, "review-pack-summary.json"),
              encoding="utf-8") as handle:
        summary = json.load(handle)
    check("stale-generated-image-counted",
          summary["counts"]["staleGeneratedImagesRemoved"] == 1,
          str(summary["counts"]))


def test_privacy_and_policy(root, source_dir, inputs_path, registry_dir, out):
    texts = []
    for base, _, files in os.walk(out):
        for name in files:
            if name.endswith((".json", ".ndjson")):
                with open(os.path.join(base, name), encoding="utf-8") as h:
                    texts.append(h.read())
    blob = "\n".join(texts)
    for marker in (source_dir, registry_dir, out, tempfile.gettempdir()):
        check("no-abs-path", marker not in blob, marker)
    check("no-drive-path", not re.search(r"[A-Za-z]:\\", blob))
    for token in ("correctanswer", "answerkey", "responsevalue",
                  "feedbacktext", "feedbackbody", "resprocessing"):
        check("no-forbidden-key-" + token,
              not re.search(r'"%s"\s*:' % token, blob, re.IGNORECASE), token)
    check("no-raw-xml",
          "<resprocessing" not in blob and "<response_label" not in blob
          and "<itemfeedback" not in blob)
    bad_out = os.path.join(REPO_ROOT, "tmp-review-pack-refusal-probe")
    proc = run_builder(source_dir, inputs_path, registry_dir, bad_out)
    check("tracked-output-refused", proc.returncode == 2, proc.stderr[-500:])
    check("refused-dir-untouched", not os.path.exists(bad_out))


def main():
    root = tempfile.mkdtemp(prefix="review-pack-test-")
    try:
        source_dir, inputs_path, registry_dir, out, queue, _ = (
            test_selection_matching_and_provenance(root))
        test_no_answer_leakage(out, queue)
        test_xss_and_index(out)
        test_images(root, out)
        test_determinism(root, source_dir, inputs_path, registry_dir)
        test_caps(root, source_dir, inputs_path, registry_dir)
        test_decision_preservation(root, source_dir, inputs_path,
                                   registry_dir, queue)
        test_invalid_decisions_fail_closed(root, source_dir, inputs_path,
                                           registry_dir)
        test_stale_generated_image_cleanup(root, source_dir, inputs_path,
                                           registry_dir)
        test_privacy_and_policy(root, source_dir, inputs_path, registry_dir,
                                out)
    except Exception as exc:  # noqa: BLE001 - report then fail
        FAILURES.append("harness")
        print("FAIL harness exception: %r" % exc)
    print("----")
    print("%d passed, %d failed" % (len(PASSES), len(FAILURES)))
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
