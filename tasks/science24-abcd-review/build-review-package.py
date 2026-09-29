#!/usr/bin/env python3
"""Freeze learner-visible Science 24 A–D candidates for a comparative review."""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

from pypdf import PdfReader


REPO = Path(__file__).resolve().parents[2]
TASK = Path(__file__).resolve().parent
NAME = "Science24_ABCD_Review_Package_2026-09-25"
STAGE = Path.home() / "Downloads" / NAME
ARCHIVE = STAGE.parent / f"{NAME}.zip"
TEXT_EXTENSIONS = {".json", ".md", ".txt", ".csv", ".html"}
PILOT_META = [
    "project.json", "prompt-pack.md", "practice-coverage.json",
    "textbook-practice-manifest.json", "source-map.json",
    "review-handoff.md", "readiness-boundary.json",
]
SOURCE_ARCHIVES = {
    "primary-brightspace": REPO / "projects/resources/science24-unit-a/_sources/3d6a4d094ca3ebee56a750117dcbdc33a4e889ea1396bf2306bd544225b2de02.zip",
    "unit-a-v5-authoring": REPO / "projects/resources/science24-unit-a/_sources/dc341c012113a46ef63137e78b793fa26d7b31744fcff48ea2b1f4c0aca057ee.zip",
    "cbe-2020-supplement": REPO / "projects/resources/science24-unit-b/_sources/b68e4799f873afb3346e0741d6a0be2bb5188a495d9fdfc292da1d1f74edf681.zip",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def replace_tree(source: Path, destination: Path) -> None:
    if destination.exists():
        shutil.rmtree(destination)
    shutil.copytree(source, destination, ignore=shutil.ignore_patterns(".DS_Store", "__pycache__"))


def extract_pdf_text(pdf: Path, destination: Path) -> dict:
    reader = PdfReader(str(pdf))
    sections = [f"# Searchable extraction of {pdf.name}", "",
                "This text is for finding passages only. Inspect the original PDF for diagrams, tables, handwriting spaces, print marks and page layout. PDF page numbers below are physical positions, not necessarily printed textbook pages.", ""]
    blank = []
    for index, page in enumerate(reader.pages, 1):
        extracted = (page.extract_text() or "").strip()
        sections.extend([f"\n\n===== PHYSICAL PDF PAGE {index} =====\n", extracted or "[No extractable text; inspect the PDF image.]"])
        if not extracted:
            blank.append(index)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text("\n".join(sections) + "\n", encoding="utf-8")
    return {"pdf": pdf.name, "physicalPages": len(reader.pages), "pagesWithoutExtractableText": blank}


def build() -> None:
    if not (STAGE / "screenshots/capture-report.json").exists():
        raise RuntimeError("Capture current screenshots first with capture-review-screenshots.cjs")
    STAGE.mkdir(parents=True, exist_ok=True)
    for filename in ["START_HERE.md", "PASTE_IN_CHAT.md", "COMPARISON_RUBRIC.md", "USER_REVIEW_PRIORITIES.md"]:
        shutil.copy2(TASK / filename, STAGE / filename)
    shutil.copy2(REPO / "docs/ops/science24-visual-pedagogy-plan-2026-09-25.md", STAGE / "SCIENCE24_VISUAL_PEDAGOGY_PLAN.md")

    subprocess.run(["node", str(TASK / "extract-review-content.cjs"), str(STAGE / "derived")], check=True, cwd=REPO)

    copied = {}
    pdf_reports = {}
    for unit in "abcd":
        project = REPO / f"projects/science24-unit-{unit}"
        target = STAGE / f"units/unit-{unit}"
        replace_tree(project / "workspace", target / "workspace")
        evidence = target / "evidence"
        if evidence.exists():
            shutil.rmtree(evidence)
        for source in (project / "meta").rglob("*"):
            if source.is_file() and source.suffix.lower() in TEXT_EXTENSIONS:
                relative = source.relative_to(project / "meta")
                destination = evidence / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)
        manifest = REPO / f"projects/resources/science24-unit-{unit}/resource-manifest.json"
        if manifest.exists():
            shutil.copy2(manifest, evidence / "resource-manifest.json")
        metadata = json.loads((project / "meta/project.json").read_text(encoding="utf-8"))
        copied[unit] = {
            "status": metadata.get("authoringStatus"),
            "entry": f"units/unit-{unit}/workspace/index.html",
            "entrySha256": sha256(target / "workspace/index.html"),
            "courseDataSha256": sha256(target / "workspace/course-data.js"),
            "evidenceFiles": len(list(evidence.rglob("*"))),
        }
        pdf_reports[unit] = []
        for pdf in sorted((target / "workspace/assets").glob("*.pdf")):
            pdf_reports[unit].append(extract_pdf_text(pdf, STAGE / f"source-text/unit-{unit}/{pdf.stem}.txt"))

    pilot_source = REPO / "projects/biology30-unit-a-pilot-3"
    pilot_target = STAGE / "reference/biology30-pilot3"
    replace_tree(pilot_source / "workspace", pilot_target / "workspace")
    pilot_evidence = pilot_target / "evidence"
    pilot_evidence.mkdir(parents=True, exist_ok=True)
    for filename in PILOT_META:
        source = pilot_source / "meta" / filename
        if source.exists():
            shutil.copy2(source, pilot_evidence / filename)

    provenance = {
        "primaryScience24Source": "The learner-visible textbook, 2023 workbook/key and guided notes are bundled in each unit workspace. Printed-page maps and question dispositions are in unit evidence.",
        "archivesNotBundled": "The original Brightspace archive contains hidden assessments and unrelated course material. CBE 2020 is supplemental and may have unresolved reuse rights. Neither archive is needed to inspect the learner-visible candidates; obtain the original under the recorded repository path if authorized for a deeper archive audit.",
        "archives": {name: {"repositoryPath": str(path.relative_to(REPO)), "sha256": sha256(path), "bytes": path.stat().st_size} for name, path in SOURCE_ARCHIVES.items()},
        "pdfExtraction": pdf_reports,
    }
    (STAGE / "SOURCE_PROVENANCE.json").write_text(json.dumps(provenance, indent=2) + "\n", encoding="utf-8")
    (STAGE / "CANDIDATE_SNAPSHOT.json").write_text(json.dumps({"units": copied, "pilot3Reference": "presentation and interaction only", "sourceArchivesCopied": False}, indent=2) + "\n", encoding="utf-8")

    lines = []
    files = sorted(path for path in STAGE.rglob("*") if path.is_file() and path.name != "MANIFEST_SHA256.txt")
    for path in files:
        lines.append(f"{sha256(path)}  {path.relative_to(STAGE).as_posix()}")
    (STAGE / "MANIFEST_SHA256.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

    if ARCHIVE.exists():
        ARCHIVE.unlink()
    with zipfile.ZipFile(ARCHIVE, "w", allowZip64=True) as archive:
        for path in sorted(path for path in STAGE.rglob("*") if path.is_file()):
            compressed = path.suffix.lower() not in {".jpg", ".jpeg", ".png", ".pdf", ".webp", ".mp4", ".zip"}
            archive.write(path, arcname=f"{NAME}/{path.relative_to(STAGE).as_posix()}",
                          compress_type=zipfile.ZIP_DEFLATED if compressed else zipfile.ZIP_STORED,
                          compresslevel=5 if compressed else None)
    with zipfile.ZipFile(ARCHIVE) as archive:
        broken = archive.testzip()
        if broken:
            raise RuntimeError(f"ZIP integrity failed at {broken}")
        members = len(archive.namelist())
    (STAGE.parent / f"{NAME}.sha256.txt").write_text(f"{sha256(ARCHIVE)}  {ARCHIVE.name}\n", encoding="utf-8")
    print(f"Review package: {ARCHIVE}\nFiles: {members}\nBytes: {ARCHIVE.stat().st_size}\nSHA-256: {sha256(ARCHIVE)}")


if __name__ == "__main__":
    try:
        build()
    except Exception as error:
        print(error, file=sys.stderr)
        raise
