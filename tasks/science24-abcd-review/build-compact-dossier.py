#!/usr/bin/env python3
"""Make a lighter text/source/visual review ZIP from the frozen full packet."""

import hashlib
import zipfile
from pathlib import Path

STAGE = Path.home() / "Downloads/Science24_ABCD_Review_Package_2026-09-25"
OUTPUT = STAGE.parent / "Science24_ABCD_Compact_Review_Dossier_2026-09-25.zip"
ROOT = "Science24_ABCD_Compact_Review_Dossier_2026-09-25"
CODE_EXT = {".html", ".css", ".js", ".json"}


def include(relative: Path) -> bool:
    parts = relative.parts
    if parts[0] in {"derived", "screenshots", "source-text"}:
        return True
    if len(parts) == 1 and relative.suffix.lower() in {".md", ".json"}:
        return relative.name != "MANIFEST_SHA256.txt"
    if len(parts) >= 4 and parts[0] == "units":
        if parts[2] == "evidence":
            return True
        if parts[2] == "workspace":
            if len(parts) == 4 and relative.suffix.lower() in CODE_EXT:
                return True
            if len(parts) == 5 and parts[3] == "assets":
                return relative.suffix.lower() in {".pdf", ".svg", ".css"}
    if len(parts) >= 3 and parts[:2] == ("reference", "biology30-pilot3"):
        if parts[2] == "evidence":
            return True
        if parts[2] == "workspace" and len(parts) == 4:
            return relative.suffix.lower() in CODE_EXT
    return False


files = sorted(p for p in STAGE.rglob("*") if p.is_file() and include(p.relative_to(STAGE)))
if not files:
    raise SystemExit("Full frozen packet is missing")
readme = """# Compact Science 24 review dossier

This contains all A–D lesson/check/vocabulary text, current metadata and source maps, matched screenshots, all supplied Science 24 PDFs with searchable extraction, and canonical top-level HTML/CSS/JS/JSON. It omits generated reader-page JPEGs and most inline asset images to make Chat review easier. Use the full `Science24_ABCD_Review_Package_2026-09-25.zip` for a working local preview, exact inline image files and a complete asset audit. Both archives were frozen from the same candidate snapshot; compare `CANDIDATE_SNAPSHOT.json` and checksums.

Start with `START_HERE.md` and paste `PASTE_IN_CHAT.md`. Source PDFs and screenshots require visual inspection where OCR or a text extract hides a figure. The original Brightspace and CBE archives remain outside this learner-visible packet.
"""
hashes = []
with zipfile.ZipFile(OUTPUT, "w", allowZip64=True) as archive:
    archive.writestr(f"{ROOT}/COMPACT_DOSSIER_README.md", readme)
    for file in files:
        relative = file.relative_to(STAGE).as_posix()
        data = file.read_bytes()
        hashes.append(f"{hashlib.sha256(data).hexdigest()}  {relative}")
        compressed = file.suffix.lower() not in {".jpg", ".jpeg", ".png", ".pdf", ".webp"}
        archive.writestr(f"{ROOT}/{relative}", data,
                         compress_type=zipfile.ZIP_DEFLATED if compressed else zipfile.ZIP_STORED,
                         compresslevel=5 if compressed else None)
    archive.writestr(f"{ROOT}/DOSSIER_SHA256.txt", "\n".join(hashes) + "\n")
with zipfile.ZipFile(OUTPUT) as archive:
    bad = archive.testzip()
    if bad:
        raise RuntimeError(f"ZIP integrity failed at {bad}")
digest = hashlib.sha256(OUTPUT.read_bytes()).hexdigest()
(OUTPUT.parent / f"{OUTPUT.stem}.sha256.txt").write_text(f"{digest}  {OUTPUT.name}\n")
print(f"Compact dossier: {OUTPUT}\nFiles: {len(files) + 2}\nBytes: {OUTPUT.stat().st_size}\nSHA-256: {digest}")
