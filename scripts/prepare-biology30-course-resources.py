"""Checksum-pinned, transactional Biology B/C/D authoring intake. Never renders a course.

Run via prepare:biology30-course:resources. Originals and committed intake packets
are immutable. A packet's existence proves availability only, never clearance.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import tempfile
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
RESOURCE = Path("projects/resources/biology30-production/v1/pilot2")
CHECKPOINT = Path("projects/biology30-unit-a-pilot/meta/bcd-rebuild-handoff-checkpoint.json")
DEFAULT_MANIFEST = Path("projects/biology30-unit-a-pilot/meta/bcd-rebuild-intake-manifest.json")
NS = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main",
      "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
      "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def json_bytes(value):
    return (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode()


def tree_inventory(directory):
    result = []
    for p in sorted(directory.rglob("*")):
        if p.is_symlink():
            raise ValueError(f"Symlink in protected tree: {p}")
        if p.is_file():
            result.append({"path": p.relative_to(directory).as_posix(),
                           "sha256": digest(p.read_bytes()), "bytes": p.stat().st_size})
    return result


def tree_hash(records):
    return digest("".join(x["path"] + "\0" + x["sha256"] + "\n" for x in records).encode())


def checked_bytes(p, expected):
    if p.is_symlink():
        raise ValueError(f"Refusing symlink: {p}")
    data = p.read_bytes()
    if digest(data) != expected:
        raise ValueError(f"Source drift: {p}")
    return data


def safe_zip(data):
    z = zipfile.ZipFile(io.BytesIO(data))
    seen = set()
    for entry in z.infolist():
        name = entry.filename
        pp = PurePosixPath(name)
        if (name in seen or "\\" in name or pp.is_absolute() or ".." in pp.parts
                or (entry.external_attr >> 16) & 0o170000 == 0o120000):
            raise ValueError(f"Unsafe or duplicate archive member: {name}")
        seen.add(name)
    return z


def verify_packet(target):
    expected = json.loads((target / "packet-files.json").read_text())
    actual = [x for x in tree_inventory(target) if x["path"] != "packet-files.json"]
    if actual != expected:
        raise ValueError(f"Immutable packet changed: {target}")


def publish_packet(target, producer):
    """One atomic rename; never merge into or overwrite a prior packet."""
    if target.exists():
        verify_packet(target)
        return False
    target.parent.mkdir(parents=True, exist_ok=True)
    stage = Path(tempfile.mkdtemp(prefix=".stage-", dir=target.parent))
    try:
        producer(stage)
        (stage / "packet-files.json").write_bytes(json_bytes(tree_inventory(stage)))
        verify_packet(stage)
        if target.exists():
            raise ValueError(f"Concurrent intake appeared: {target}")
        stage.rename(target)
    finally:
        if stage.exists():
            shutil.rmtree(stage)
    return True


def verify_sources(manifest):
    sources = []
    for src in manifest["sources"]:
        data = checked_bytes(Path(src["path"]), src["sha256"])
        if len(data) != src["bytes"]:
            raise ValueError(f"Source length drift: {src['path']}")
        safe_zip(data).close()
        if src.get("sharedCopy"):
            checked_bytes(ROOT / src["sharedCopy"], src["sha256"])
        sources.append({"path": src["path"], "sha256": src["sha256"], "status": "verified"})
    for member in manifest["textbookMembers"]:
        with zipfile.ZipFile(ROOT / member["archive"]) as z:
            data = z.read(member["member"])
        if digest(data) != member["sha256"] or data.find(b"%PDF-") != member["pdfHeaderOffset"]:
            raise ValueError(f"Textbook member drift: {member['member']}")
    return sources


def baseline(checkpoint, verify_only):
    target = ROOT / RESOURCE / "baselines" / checkpoint["git"]["commit"]
    git = {"branch": subprocess.check_output(["git", "branch", "--show-current"], cwd=ROOT, text=True).strip(),
           "commit": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip()}
    if git != {key: checkpoint["git"][key] for key in git}:
        raise ValueError("Branch/HEAD differs from the authorized checkpoint")
    trees = []
    for record in checkpoint["protectedBeforeAndAfterThisDocumentationCycle"]:
        actual = tree_hash(tree_inventory(ROOT / record["path"]))
        # Source-owner and B/C/D trees may change only after their originals are preserved.
        permanent = "unit-a" in record["path"]
        if (permanent or not target.exists()) and actual != record["sha256"]:
            raise ValueError(f"Undocumented baseline drift: {record['path']}")
        trees.append({"path": record["path"], "sha256": actual, "checkpointSha256": record["sha256"]})
    if target.exists():
        verify_packet(target)
    elif not verify_only:
        paths = set()
        for record in checkpoint["protectedBeforeAndAfterThisDocumentationCycle"]:
            # A is protected by checksums; this packet preserves B/C/D and owning inputs.
            if "unit-a" not in record["path"]:
                paths.update(p for p in (ROOT / record["path"]).rglob("*") if p.is_file())
        for unit in "bcd":
            meta = ROOT / f"projects/biology30-unit-{unit}/meta"
            paths.update(p for p in meta.rglob("*") if p.is_file())
            manifest = json.loads((meta / "project.json").read_text())
            for file in manifest["canonicalSources"]:
                p = ROOT / file
                if p.is_file():
                    paths.add(p)
        paths.update(ROOT / p for p in ["scripts/build-biology30-course.ts", "package.json", str(CHECKPOINT), str(DEFAULT_MANIFEST)])
        inventory = [{"path": p.relative_to(ROOT).as_posix(), "sha256": digest(p.read_bytes())} for p in sorted(paths)]
        status = subprocess.check_output(["git", "status", "--porcelain=v1", "--untracked-files=all"], cwd=ROOT)

        def produce(stage):
            for item in inventory:
                data = checked_bytes(ROOT / item["path"], item["sha256"])
                dest = stage / "files" / item["path"]
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
            (stage / "git-status.txt").write_bytes(status)
            (stage / "baseline.json").write_bytes(json_bytes({"schemaVersion": 1, "git": git,
                "gitStatusSha256": digest(status), "trees": trees, "files": inventory,
                "stateBoundary": "Original workspace, metadata, runtime and suspend-data source preserved; no access to browser/LMS learner payloads claimed."}))
            # Reject edits while copying, before installing the baseline.
            for item in inventory:
                checked_bytes(ROOT / item["path"], item["sha256"])
        publish_packet(target, produce)
    return {"path": str(target.relative_to(ROOT)), "preserved": target.exists(), "trees": trees}


def relationships(z, part):
    p = PurePosixPath(part)
    relpath = str(p.parent / "_rels" / (p.name + ".rels"))
    if relpath not in z.namelist():
        return []
    return [dict(x.attrib) for x in ET.fromstring(z.read(relpath))]


def youtube_id(target):
    parsed = urllib.parse.urlparse(target)
    host = (parsed.hostname or "").lower()
    value = None
    if host in ["youtu.be", "www.youtu.be"]:
        value = parsed.path.strip("/").split("/")[0]
    elif host in ["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"]:
        value = urllib.parse.parse_qs(parsed.query).get("v", [None])[0]
        if not value and parsed.path.startswith(("/embed/", "/shorts/")):
            value = parsed.path.split("/")[2]
    return value if value and re.fullmatch(r"[A-Za-z0-9_-]{11}", value) else None


def extract_deck(z, src, stage):
    rels = {r["Id"]: r for r in relationships(z, "ppt/presentation.xml")}
    presentation = ET.fromstring(z.read("ppt/presentation.xml"))
    slides = []
    for number, element in enumerate(presentation.findall("p:sldIdLst/p:sldId", NS), 1):
        target = rels[element.attrib["{" + NS["r"] + "}id"]]["Target"]
        part = os.path.normpath("ppt/" + target).replace(os.sep, "/")
        if part not in z.namelist():
            raise ValueError(f"Missing slide: {part}")
        root = ET.fromstring(z.read(part))
        relations = relationships(z, part)
        slides.append({"id": f"deck-{src['chapter']}-slide-{number:03}", "number": number,
            "part": part, "text": [p.text or "" for p in root.findall(".//a:t", NS)],
            "relationships": relations, "visualReview": "pending", "disposition": None,
            "youtube": [{"relationshipId": r["Id"], "videoId": youtube_id(r["Target"]), "url": r["Target"]}
                        for r in relations if youtube_id(r["Target"])]})
    media = []
    for name in sorted(z.namelist()):
        if name.startswith("ppt/media/") and not name.endswith("/"):
            data = z.read(name)
            local = f"media/{digest(data)}{PurePosixPath(name).suffix.lower()}"
            dest = stage / local
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            media.append({"part": name, "sha256": digest(data), "bytes": len(data), "local": local,
                          "rights": "not-cleared-for-learner-reuse", "disposition": None})
    return {"unit": src["unit"], "chapter": src["chapter"], "sourceSha256": src["sha256"],
            "slides": slides, "media": media}


def extract_plan(z, src):
    doc = ET.fromstring(z.read("word/document.xml"))
    rows = [[" ".join(t.text or "" for t in cell.findall(".//w:t", NS))
             for cell in row.findall("w:tc", NS)] for row in doc.findall(".//w:tr", NS)]
    paragraphs = [" ".join(t.text or "" for t in p.findall(".//w:t", NS)) for p in doc.findall(".//w:p", NS)]
    chapter = int(re.search(r"Chapter (\d+)", src["path"])[1])
    return {"unit": src["unit"], "chapter": chapter, "sourceSha256": src["sha256"],
            "rows": [{"id": f"plan-{chapter}-row-{i+1:02}", "cells": row, "disposition": None} for i, row in enumerate(rows)],
            "paragraphs": paragraphs, "relationships": relationships(z, "word/document.xml")}


def package_relationships(z):
    return [{"part": name, **dict(rel.attrib)} for name in sorted(z.namelist())
            if name.endswith(".rels") for rel in ET.fromstring(z.read(name))]


def prepare_relationship_supplement(manifest, manifest_data, verify_only):
    # Separate immutable packet extends the original intake without rewriting it.
    target = ROOT / RESOURCE / "relationships" / digest(manifest_data)
    if target.exists():
        verify_packet(target)
    elif not verify_only:
        def produce(stage):
            decks, plans = [], []
            for src in manifest["sources"]:
                if src["kind"] == "archive":
                    continue
                with safe_zip(checked_bytes(Path(src["path"]), src["sha256"])) as z:
                    relations = package_relationships(z)
                    if src["kind"] == "powerpoint":
                        notes = [{"part": name, "text": [t.text or "" for t in ET.fromstring(z.read(name)).findall(".//a:t", NS)]}
                                 for name in sorted(z.namelist()) if re.fullmatch(r"ppt/notesSlides/notesSlide\d+\.xml", name)]
                        decks.append({"unit": src["unit"], "chapter": src["chapter"], "sourceSha256": src["sha256"], "relationships": relations, "notes": notes})
                    else:
                        plans.append({"unit": src["unit"], "sourceSha256": src["sha256"], "relationships": relations})
            count = sum(1 for deck in decks for rel in deck["relationships"] if rel.get("TargetMode") == "External")
            if count != manifest["totals"]["priorPlanningExternalHyperlinkRelationships"]:
                raise ValueError(f"Complete deck hyperlink inventory drift: {count}")
            (stage / "package-relationships.json").write_bytes(json_bytes({"decks": decks, "plans": plans,
                "externalDeckRelationships": count, "status": "inventoried-disposition-pending"}))
            verify_sources(manifest)
        publish_packet(target, produce)
    return {"path": str(target.relative_to(ROOT)), "prepared": target.exists()}


def prepare(manifest, manifest_data, verify_only=False, check_video_links=False):
    from pypdf import PdfReader, PdfWriter
    source_results = verify_sources(manifest)
    checkpoint = json.loads((ROOT / CHECKPOINT).read_text())
    base = baseline(checkpoint, verify_only)
    target = ROOT / RESOURCE / "intake" / digest(manifest_data)
    if target.exists():
        verify_packet(target)
    elif not verify_only:
        def produce(stage):
            decks, plans, textbooks = [], [], []
            (stage / "intake-manifest.json").write_bytes(manifest_data)
            for src in manifest["sources"]:
                data = checked_bytes(Path(src["path"]), src["sha256"])
                if src["kind"] == "archive":
                    continue  # Shared content-addressed archive originals are already preserved.
                out = stage / "originals" / (src["sha256"] + Path(src["path"]).suffix.lower())
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_bytes(data)
                with safe_zip(data) as z:
                    if src["kind"] == "powerpoint":
                        decks.append(extract_deck(z, src, stage))
                    else:
                        plans.append(extract_plan(z, src))
            for chapter in range(14, 21):
                members = [m for m in manifest["textbookMembers"] if m["chapter"] == chapter]
                writer, mappings = PdfWriter(), []
                for member in members:
                    with zipfile.ZipFile(ROOT / member["archive"]) as z:
                        original = z.read(member["member"])
                    normalized = original[member["pdfHeaderOffset"]:]
                    reader = PdfReader(io.BytesIO(normalized))
                    if len(reader.pages) != member["previousPlanningPageCount"]:
                        raise ValueError(f"Textbook page count drift: {chapter}")
                    for index, page in enumerate(reader.pages, 1):
                        writer.add_page(page)
                        mappings.append({"physicalPage": len(mappings)+1, "originalPart": member["part"],
                            "originalPhysicalPage": index, "printedFolio": None, "academicReview": "pending"})
                dest = stage / "textbook" / f"chapter-{chapter}.pdf"
                dest.parent.mkdir(parents=True, exist_ok=True)
                with dest.open("wb") as out:
                    writer.write(out)
                if len(PdfReader(dest).pages) != len(mappings):
                    raise ValueError("Normalized PDF verification failed")
                textbooks.append({"chapter": chapter, "path": str(dest.relative_to(stage)),
                    "sha256": digest(dest.read_bytes()), "pages": mappings, "sourceMembers": members,
                    "rights": "authoring-reference-only-pending-learner-reuse-review"})
            occurrences = [dict(item, slideId=slide["id"], unit=deck["unit"]) for deck in decks for slide in deck["slides"] for item in slide["youtube"]]
            videos = [{"id": v, "occurrences": [x for x in occurrences if x["videoId"] == v],
                       "disposition": None, "captionReview": "pending", "required": False} for v in sorted({x["videoId"] for x in occurrences})]
            counts = {"slides": sum(len(x["slides"]) for x in decks), "embeddedMediaFiles": sum(len(x["media"]) for x in decks),
                      "youtubeOccurrences": len(occurrences), "distinctYoutubeIds": len(videos)}
            for key, value in counts.items():
                if value != manifest["totals"][key]:
                    raise ValueError(f"Intake count drift {key}: {value} != {manifest['totals'][key]}")
            for name, data in [("decks", decks), ("daily-plans", plans), ("textbooks", textbooks), ("videos", videos)]:
                (stage / f"{name}.json").write_bytes(json_bytes(data))
            (stage / "availability.json").write_bytes(json_bytes({"schemaVersion": 1, "manifestSha256": digest(manifest_data),
                "status": "sources-preserved-individual-review-pending", "counts": counts, "baseline": base["path"],
                "readyForRendering": False, "teacherAcceptance": None}))
            verify_sources(manifest)  # No source may change during staging.
        publish_packet(target, produce)
    supplement = prepare_relationship_supplement(manifest, manifest_data, verify_only)
    return {"sourceChecks": len(source_results), "textbookMemberChecks": len(manifest["textbookMembers"]),
            "baseline": base, "intake": str(target.relative_to(ROOT)), "prepared": target.exists(),
            "completeRelationships": supplement,
            "readyForRendering": False, "videoLinkCheckRequested": check_video_links}


def verify_build_inputs(manifest, manifest_data):
    """Cold read-only source check that remains valid after sequential B/C/D builds.

    The owner separately checks the target workspace and all protected Unit A
    trees. Requiring every original B/C/D tree here would prevent C after B.
    """
    sources = verify_sources(manifest)
    target = ROOT / RESOURCE / "intake" / digest(manifest_data)
    if not target.is_dir():
        raise ValueError("Production build requires the preserved intake packet")
    verify_packet(target)
    supplement = prepare_relationship_supplement(manifest, manifest_data, True)
    if not supplement["prepared"]:
        raise ValueError("Production build requires the preserved relationship packet")
    return {"sourceChecks": len(sources), "textbookMemberChecks": len(manifest["textbookMembers"]),
            "intake": str(target.relative_to(ROOT)), "completeRelationships": supplement,
            "writesPerformed": False, "teacherAcceptance": None}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--units", default="B,C,D", choices=["B,C,D"], help="Atomic all-unit intake precedes sequential B/C/D builds")
    parser.add_argument("--intake-manifest", type=Path, default=DEFAULT_MANIFEST)
    parser.add_argument("--verify-only", action="store_true", help="Verify originals/protected trees/any preserved packet; write nothing")
    parser.add_argument("--verify-build-inputs", action="store_true", help="Read-only source/packet verification for sequential builds; owner must separately verify protected trees")
    parser.add_argument("--check-video-links", action="store_true")
    args = parser.parse_args()
    data = (ROOT / args.intake_manifest).read_bytes()
    if args.verify_build_inputs:
        if args.check_video_links:
            parser.error("--verify-build-inputs cannot request network video checks")
        print(json.dumps(verify_build_inputs(json.loads(data), data), indent=2))
        return
    result = prepare(json.loads(data), data, args.verify_only, args.check_video_links)
    if args.check_video_links:
        # This flag never constitutes transcript, factual, rights or pace clearance.
        packet = ROOT / result["intake"]
        if not packet.exists():
            raise ValueError("Video checks require the preserved intake packet first")
        def probe(video):
            endpoint = "https://www.youtube.com/oembed?" + urllib.parse.urlencode({"url": "https://www.youtube.com/watch?v="+video["id"], "format": "json"})
            try:
                with urllib.request.urlopen(endpoint, timeout=15) as response:
                    payload = json.load(response)
                return {"id": video["id"], "status": "metadata-reachable", "title": payload.get("title"), "captionReview": "pending"}
            except Exception as error:
                return {"id": video["id"], "status": "unavailable-or-probe-blocked", "error": str(error), "captionReview": "pending"}
        with ThreadPoolExecutor(max_workers=6) as pool:
            result["videoLinkChecks"] = list(pool.map(probe, json.loads((packet / "videos.json").read_text())))
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
