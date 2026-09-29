#!/usr/bin/env python3
"""Build a self-contained Science 24 A-D HTML review bundle for coworkers."""

from __future__ import annotations

import hashlib
import html
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path


REPO = Path(__file__).resolve().parents[2]
NAME = "Science24_ABCD_Coworker_HTML_Review_2026-09-25"
STAGE = Path.home() / "Downloads" / NAME
ARCHIVE = STAGE.parent / f"{NAME}.zip"
CHECKSUM = STAGE.parent / f"{NAME}.sha256.txt"

UNITS = {
    "a": {
        "title": "Matter and Chemical Change",
        "lessons": 15,
        "questions": 32,
        "description": "Chemistry in everyday life, chemical change, reactions, combustion and environmental chemistry.",
    },
    "b": {
        "title": "Energy Transformations",
        "lessons": 17,
        "questions": 35,
        "description": "Energy conversions, electrical energy, energy for life and fossil fuels.",
    },
    "c": {
        "title": "Disease Defence and Human Health",
        "lessons": 18,
        "questions": 29,
        "description": "Disease, public health, immunity, medicines, genetics and ethical decisions.",
    },
    "d": {
        "title": "Safety in Transportation",
        "lessons": 13,
        "questions": 50,
        "description": "Reaction time, motion graphs, momentum, collision systems and vehicle safety.",
    },
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=REPO, text=True).strip()


def workspace_files(root: Path) -> list[Path]:
    return sorted(
        path for path in root.rglob("*")
        if path.is_file() and path.name != ".DS_Store" and "__pycache__" not in path.parts
    )


def copy_and_verify(source: Path, destination: Path) -> dict:
    shutil.copytree(source, destination, ignore=shutil.ignore_patterns(".DS_Store", "__pycache__"))
    source_files = workspace_files(source)
    destination_files = workspace_files(destination)
    source_rel = [path.relative_to(source) for path in source_files]
    destination_rel = [path.relative_to(destination) for path in destination_files]
    if source_rel != destination_rel:
        raise RuntimeError(f"Copied file inventory differs for {source.name}")
    mismatches = []
    total_bytes = 0
    for relative in source_rel:
        original = source / relative
        copied = destination / relative
        total_bytes += copied.stat().st_size
        if sha256(original) != sha256(copied):
            mismatches.append(relative.as_posix())
    if mismatches:
        raise RuntimeError(f"Copied file hashes differ: {mismatches[:5]}")
    return {
        "fileCount": len(source_rel),
        "bytes": total_bytes,
        "indexSha256": sha256(destination / "index.html"),
        "sourceParity": "verified",
    }


def landing_page(commit: str) -> str:
    cards = []
    for unit, details in UNITS.items():
        cards.append(f"""
        <article class="unit">
          <div class="unit-number" aria-hidden="true">{unit.upper()}</div>
          <div class="unit-copy">
            <p class="unit-label">Science 24 · Unit {unit.upper()}</p>
            <h2>{html.escape(details['title'])}</h2>
            <p>{html.escape(details['description'])}</p>
            <dl>
              <div><dt>Course sequence</dt><dd>{details['lessons']} lesson routes</dd></div>
              <div><dt>Textbook Practice</dt><dd>{details['questions']} question choices</dd></div>
            </dl>
            <div class="actions">
              <a class="primary" href="units/unit-{unit}/index.html#overview">Open Unit {unit.upper()}</a>
              <a href="units/unit-{unit}/index.html#textbook-practice">Check textbook practice</a>
            </div>
          </div>
        </article>""")
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Science 24 A-D · Coworker Review</title>
  <style>
    :root {{ color-scheme: light; --ink:#18201c; --muted:#56615a; --green:#124b1b; --teal:#08766c; --line:#ced6d0; --wash:#f3f6f3; --paper:#fff; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; color:var(--ink); background:var(--wash); font:16px/1.55 Arial, sans-serif; }}
    header {{ color:#fff; background:#151a18; border-bottom:4px solid var(--green); }}
    header>div, main, footer {{ width:min(1100px, calc(100% - 40px)); margin:auto; }}
    header>div {{ padding:38px 0 34px; }}
    h1,h2 {{ margin:0; line-height:1.15; letter-spacing:-.02em; }}
    h1 {{ max-width:820px; font-size:clamp(34px,6vw,58px); }}
    header p {{ max-width:720px; margin:16px 0 0; color:#d7ded9; }}
    main {{ padding:34px 0 54px; }}
    .status {{ display:grid; grid-template-columns:minmax(0,1fr) auto; gap:22px; align-items:center; padding:20px 22px; border:1px solid #afbab2; border-left:5px solid #a45a00; background:#fffaf1; }}
    .status strong {{ display:block; font-size:18px; }}
    .status p {{ margin:3px 0 0; color:var(--muted); }}
    .status a {{ color:var(--green); font-weight:700; }}
    .units {{ display:grid; gap:18px; margin-top:28px; }}
    .unit {{ display:grid; grid-template-columns:94px minmax(0,1fr); border:1px solid var(--line); background:var(--paper); }}
    .unit-number {{ display:grid; place-items:center; color:#fff; background:var(--green); font-size:42px; font-weight:800; }}
    .unit-copy {{ padding:25px 28px 27px; }}
    .unit-label {{ margin:0 0 5px; color:var(--teal); font-size:12px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; }}
    .unit h2 {{ font-size:28px; }}
    .unit-copy>p:not(.unit-label) {{ max-width:760px; margin:10px 0 15px; color:var(--muted); }}
    dl {{ display:flex; flex-wrap:wrap; gap:12px 36px; margin:0 0 20px; }}
    dl div {{ min-width:180px; }}
    dt {{ color:var(--muted); font-size:12px; font-weight:700; text-transform:uppercase; }}
    dd {{ margin:2px 0 0; font-weight:700; }}
    .actions {{ display:flex; flex-wrap:wrap; gap:10px; }}
    .actions a {{ display:inline-flex; align-items:center; min-height:44px; padding:9px 14px; border:1px solid var(--green); color:var(--green); font-weight:750; text-decoration:none; }}
    .actions a:hover,.actions a:focus-visible {{ outline:3px solid #8fc5ba; outline-offset:2px; }}
    .actions .primary {{ color:#fff; background:var(--green); }}
    .review {{ margin-top:30px; padding:24px 28px; border:1px solid var(--line); background:#fff; }}
    .review h2 {{ font-size:25px; }}
    .review ol {{ margin-bottom:0; padding-left:22px; }}
    footer {{ padding:18px 0 28px; color:var(--muted); font-size:13px; }}
    code {{ font-family:ui-monospace, SFMono-Regular, Menlo, monospace; }}
    @media (max-width:650px) {{
      header>div,main,footer {{ width:min(100% - 24px,1100px); }}
      .status {{ grid-template-columns:1fr; }}
      .unit {{ grid-template-columns:1fr; }}
      .unit-number {{ min-height:70px; justify-content:start; padding-left:24px; }}
      .unit-copy {{ padding:22px; }}
      .actions a {{ width:100%; justify-content:center; }}
    }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Science 24 Units A-D</h1>
      <p>Coworker review copy · compare instructional depth, visual teaching, practice, navigation and learner support across the four units.</p>
    </div>
  </header>
  <main>
    <section class="status" aria-label="Review status">
      <div><strong>Review candidate</strong><p>These units remain blocked while teacher, accessibility, export and Brightspace checks are completed.</p></div>
      <a href="README.html">Read the reviewer notes</a>
    </section>
    <section class="units" aria-label="Science 24 units">
      {''.join(cards)}
    </section>
    <section class="review">
      <h2>Suggested comparison pass</h2>
      <ol>
        <li>Open each overview and compare the sequence, progress explanation and route clarity.</li>
        <li>Open two lessons per unit and compare explanation depth, figures, practice, video support and required checks.</li>
        <li>Open Textbook Practice and inspect question crops, readable context, accessible text and saved written work.</li>
        <li>Repeat a lesson and Textbook Practice check at a narrow browser width.</li>
        <li>Record unit-specific gaps without treating this review copy as a released course.</li>
      </ol>
    </section>
  </main>
  <footer>Snapshot commit <code>{html.escape(commit)}</code> · built 2026-09-25 · learner work stays in the reviewing browser.</footer>
</body>
</html>
"""


def reviewer_notes() -> str:
    return """<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Science 24 A-D Reviewer Notes</title>
<style>body{max-width:820px;margin:40px auto;padding:0 22px;color:#18201c;font:16px/1.6 Arial,sans-serif}h1,h2{line-height:1.2}a{color:#124b1b;font-weight:700}.notice{padding:16px 18px;border-left:5px solid #a45a00;background:#fff7e9}li{margin:8px 0}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}</style></head>
<body><p><a href="index.html">← Return to the unit launcher</a></p>
<h1>Reviewer notes</h1>
<p class="notice"><strong>Status:</strong> review candidate. This package is for comparison and feedback. It is not a Brightspace upload, SCORM package or released learner course.</p>
<h2>Opening the package</h2>
<ol><li>Keep the folder structure intact.</li><li>Open <code>index.html</code> in a current Chrome, Edge, Firefox or Safari browser.</li><li>Use the launcher to open a unit. Videos require internet access; every video section includes a written explanation.</li></ol>
<h2>What to review</h2>
<ul><li>Explanations teach the concept before asking for independent work.</li><li>Figures have a clear instructional purpose, readable sizing and useful captions.</li><li>Worked examples show the method and practice checks the same reasoning.</li><li>Required checks are unambiguous and visually aligned.</li><li>Textbook Practice is organized by question, with a focused crop and full-page context.</li><li>Vocabulary, textbook links, drawers, dialogs and navigation behave consistently across A-D.</li><li>Phone layouts remain readable without horizontal scrolling.</li></ul>
<h2>Saving and privacy</h2>
<p>Responses save only in the browser on the device used for review. Nothing is submitted automatically. Use fictional sample responses during review and do not enter student information.</p>
<h2>Technical boundary</h2>
<p>The package contains the complete learner-facing HTML, CSS, JavaScript, images and supplied learner PDFs for all four units. Original Brightspace archives, hidden assessments, repository metadata and export outputs are excluded.</p>
</body></html>"""


def build() -> None:
    if STAGE.exists():
        shutil.rmtree(STAGE)
    STAGE.mkdir(parents=True)

    branch = git("branch", "--show-current")
    commit = git("rev-parse", "HEAD")
    manifest = {
        "schema": "science24-coworker-html-review-v1",
        "builtAt": "2026-09-25",
        "sourceBranch": branch,
        "sourceCommit": commit,
        "status": "blocked-review-candidate",
        "entry": "index.html",
        "excluded": ["raw sources", "hidden assessments", "project metadata", "generated exports"],
        "units": {},
    }

    for unit, details in UNITS.items():
        source = REPO / f"projects/science24-unit-{unit}/workspace"
        destination = STAGE / f"units/unit-{unit}"
        copy_report = copy_and_verify(source, destination)
        manifest["units"][unit] = {
            "title": details["title"],
            "entry": f"units/unit-{unit}/index.html",
            "lessonRoutes": details["lessons"],
            "textbookPracticeQuestions": details["questions"],
            **copy_report,
        }

    (STAGE / "index.html").write_text(landing_page(commit), encoding="utf-8")
    (STAGE / "README.html").write_text(reviewer_notes(), encoding="utf-8")
    (STAGE / "PACKAGE_MANIFEST.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    all_files = sorted(path for path in STAGE.rglob("*") if path.is_file() and path.name != "MANIFEST_SHA256.txt")
    lines = [f"{sha256(path)}  {path.relative_to(STAGE).as_posix()}" for path in all_files]
    (STAGE / "MANIFEST_SHA256.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    forbidden = ("questiondb.xml", "quiz_d2l", "testbank", "test-bank")
    forbidden_hits = [
        path.relative_to(STAGE).as_posix() for path in workspace_files(STAGE)
        if any(token in path.name.lower() for token in forbidden)
    ]
    if forbidden_hits:
        raise RuntimeError(f"Hidden assessment-like files found: {forbidden_hits[:5]}")

    if ARCHIVE.exists():
        ARCHIVE.unlink()
    with zipfile.ZipFile(ARCHIVE, "w", allowZip64=True) as archive:
        for path in workspace_files(STAGE):
            suffix = path.suffix.lower()
            compression = zipfile.ZIP_STORED if suffix in {".jpg", ".jpeg", ".png", ".webp", ".pdf", ".mp4", ".zip"} else zipfile.ZIP_DEFLATED
            archive.write(path, f"{NAME}/{path.relative_to(STAGE).as_posix()}", compress_type=compression, compresslevel=6 if compression == zipfile.ZIP_DEFLATED else None)
    with zipfile.ZipFile(ARCHIVE) as archive:
        broken = archive.testzip()
        if broken:
            raise RuntimeError(f"ZIP integrity failed at {broken}")
        zip_members = len(archive.namelist())

    CHECKSUM.write_text(f"{sha256(ARCHIVE)}  {ARCHIVE.name}\n", encoding="utf-8")
    print(json.dumps({
        "stage": str(STAGE),
        "archive": str(ARCHIVE),
        "checksum": sha256(ARCHIVE),
        "archiveBytes": ARCHIVE.stat().st_size,
        "zipMembers": zip_members,
        "units": manifest["units"],
    }, indent=2))


if __name__ == "__main__":
    try:
        build()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
