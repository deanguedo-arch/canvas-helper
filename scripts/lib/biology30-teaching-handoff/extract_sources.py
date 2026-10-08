"""Extract public teaching sources, never learner state, into a new source handoff.

Invoked by export-biology30-teaching-handoff.mjs. Text extracts are reading aids;
the unchanged originals remain the visual/scientific source of record.
"""
import argparse
import hashlib
import json
import logging
import posixpath
import re
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from urllib.parse import unquote, urlsplit

from pypdf import PdfReader, PdfWriter


def sha(data):
    return hashlib.sha256(data).hexdigest()


def put_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def extract_sources(repo, output, prompt_zip):
    records, gaps = [], []
    pdf_warnings = []
    context = {"sourceId": None, "pdfPage": None}

    class PdfWarningCapture(logging.Handler):
        def emit(self, record):
            pdf_warnings.append({**context, "level": record.levelname, "message": record.getMessage()})

    logger = logging.getLogger("pypdf")
    logger.handlers = [PdfWarningCapture()]
    logger.propagate = False
    logger.setLevel(logging.WARNING)

    def store(source_id, data, package_path, origin, role, extra=None):
        if data.startswith(b"version https://git-lfs.github.com/spec/v1"):
            raise ValueError(f"Git LFS pointer, not source bytes: {origin}")
        target = output / package_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        record = {"id": source_id, "origin": origin, "packagePath": package_path,
                  "sha256": sha(data), "bytes": len(data), "role": role, **(extra or {})}
        records.append(record)
        if target.suffix.lower() == ".pdf":
            context.update(sourceId=source_id, pdfPage=None)
            reader = PdfReader(target)
            folder = output / "sources/extracted" / source_id
            folder.mkdir(parents=True, exist_ok=True)
            pages = []
            for number, page in enumerate(reader.pages, 1):
                context["pdfPage"] = number
                text = page.extract_text() or ""
                name = f"sources/extracted/{source_id}/pdf-page-{number:03}.txt"
                (output / name).write_text(text, encoding="utf-8")
                pages.append({"pdfPage": number, "textPath": name, "characters": len(text),
                              "widthPoints": float(page.mediabox.width),
                              "heightPoints": float(page.mediabox.height),
                              **({"printedPage": number + 359} if source_id == "chapter11-textbook" else {})})
                if not text.strip():
                    gaps.append({"kind": "image-only-or-empty-pdf-page", "sourceId": source_id,
                                 "pdfPage": number, "action": "Inspect the original PDF visually; no OCR text asserted."})
            record["pdfPages"] = len(reader.pages)
            record["pageIndex"] = f"sources/extracted/{source_id}/page-index.json"
            record["extractionCaution"] = "PDF text order, symbols and columns may be imperfect. Read the original PDF for figures, layout and exact questions."
            put_json(output / record["pageIndex"], pages)
        elif target.suffix.lower() == ".doc":
            result = subprocess.run(["/usr/bin/textutil", "-convert", "txt", "-stdout", str(target)],
                                    capture_output=True, check=False)
            if result.returncode == 0 and result.stdout.strip():
                name = f"sources/extracted/{source_id}/document.txt"
                (output / name).parent.mkdir(parents=True, exist_ok=True)
                (output / name).write_bytes(result.stdout)
                record["textPath"] = name
                record["extractionCaution"] = "Legacy Word text extraction; figures and formatting remain in the original .doc."
            else:
                gaps.append({"kind": "legacy-word-text-unavailable", "sourceId": source_id,
                             "action": "Use original Word document; textutil did not produce usable text."})
        elif target.suffix.lower() in [".html", ".xml"]:
            record["textSource"] = package_path
        return record

    textbook = "projects/biology30-unit-a-pilot-3/workspace/assets/textbook/chapter-11.pdf"
    book = store("chapter11-textbook", (repo / textbook).read_bytes(),
                 "sources/original/chapter-11.pdf", textbook, "textbook science; exact original questions and figures")
    if book["pdfPages"] != 44:
        raise ValueError("Reader page mapping requires the current 44-page Chapter 11 source.")
    # Verify the reader's +359 mapping against every numbered chapter page, not just metadata.
    reader = PdfReader(output / book["packagePath"])
    context.update(sourceId="chapter11-textbook-page-map", pdfPage=None)
    verified = []
    for pdf_page in range(7, 45):
        context["pdfPage"] = pdf_page
        printed = pdf_page + 359
        text = reader.pages[pdf_page - 1].extract_text() or ""
        if not re.search(rf"\b{printed}\b", text[:650]):
            raise ValueError(f"Printed/PDF page mapping not confirmed: {printed}/{pdf_page}")
        verified.append({"printedPage": printed, "pdfPage": pdf_page})
    put_json(output / "sources/textbook-page-map.json", {
        "basis": "Current runtime openTextbookPage uses printedPage=pdfPage+359; every Chapter 11 numbered page 366–403 checked against extracted page header.",
        "unitOpenerPdfPages": [1, 2, 3, 4, 5, 6], "verifiedChapterPages": verified})

    deck_path = "projects/resources/biology30-unit-a-pilot/_sources/74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1.pptx"
    deck = store("chapter11-teacher-deck", (repo / deck_path).read_bytes(),
                 "sources/original/Unit-A-Chapter-11-Teacher-Notes.pptx", deck_path,
                 "teacher voice, examples and emphasis; historical science statements require reconciliation")
    a = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
    rel_ns = "{http://schemas.openxmlformats.org/package/2006/relationships}"
    slides = []
    with zipfile.ZipFile(output / deck["packagePath"]) as z:
        order = sorted((name for name in z.namelist() if re.fullmatch(r"ppt/slides/slide\d+\.xml", name)),
                       key=lambda name: int(re.search(r"slide(\d+)", name).group(1)))
        for name in z.namelist():
            if name.startswith("ppt/media/") and not name.endswith("/"):
                target = output / "sources/teacher-deck-media" / Path(name).name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(z.read(name))
        for name in order:
            number = int(re.search(r"slide(\d+)", name).group(1))
            data = z.read(name)
            root = ET.fromstring(data)
            paragraphs = ["".join(t.text or "" for t in p.findall(".//a:t", a))
                          for p in root.findall(".//a:p", a)]
            rel_name = f"ppt/slides/_rels/slide{number}.xml.rels"
            relationships = []
            notes = []
            if rel_name in z.namelist():
                for rel in ET.fromstring(z.read(rel_name)).findall(rel_ns + "Relationship"):
                    target = rel.attrib["Target"]
                    external = rel.attrib.get("TargetMode") == "External"
                    resolved = target if external else posixpath.normpath(posixpath.join("ppt/slides", target))
                    media_path = "sources/teacher-deck-media/" + Path(resolved).name if resolved.startswith("ppt/media/") else None
                    relationships.append({"id": rel.attrib["Id"], "type": rel.attrib["Type"],
                                          "target": resolved, "external": external, "packageMediaPath": media_path})
                    if "notesSlide" in rel.attrib["Type"] and resolved in z.namelist():
                        nr = ET.fromstring(z.read(resolved))
                        notes = ["".join(t.text or "" for t in p.findall(".//a:t", a))
                                 for p in nr.findall(".//a:p", a)]
            fragment = f"sources/extracted/chapter11-teacher-deck/slide-{number:03}.xml"
            text_path = f"sources/extracted/chapter11-teacher-deck/slide-{number:03}.md"
            (output / fragment).parent.mkdir(parents=True, exist_ok=True)
            (output / fragment).write_bytes(data)
            copy = f"# Teacher deck — slide {number}\n\nSource: {deck['packagePath']}; {name}\n\n"
            copy += "\n\n".join(p for p in paragraphs if p) + "\n\n## Speaker notes (unchanged extracted text)\n\n"
            copy += "\n\n".join(notes) + "\n"
            (output / text_path).write_text(copy, encoding="utf-8")
            slides.append({"slide": number, "xmlMember": name, "xmlPath": fragment,
                           "textPath": text_path, "paragraphs": paragraphs,
                           "speakerNotes": notes, "relationships": relationships})
    deck["slides"] = len(slides)
    deck["slideIndex"] = "sources/extracted/chapter11-teacher-deck/slide-index.json"
    put_json(output / deck["slideIndex"], slides)

    authority = "projects/resources/biology30-production/v1/pilot2/authority"
    registry = json.loads((repo / authority / "sources.json").read_text())
    put_json(output / "sources/authority-cache-registry.json", registry)
    for name, role in [("program", "cached Alberta Biology 20–30 program; scope authority"),
                       ("performance", "cached Alberta performance standards; assessment-depth reference"),
                       ("bulletin", "cached diploma bulletin; historical administrative reference, not current exam policy")]:
        source = f"{authority}/{name}.pdf"
        store("alberta-" + name, (repo / source).read_bytes(), f"sources/authority/{name}.pdf", source,
              role, {"liveCurrencyVerifiedThisRun": False, "cacheRegistry": "sources/authority-cache-registry.json"})
    for source_id, source, page_numbers, name in [
        ("first-batch-textbook", output / book["packagePath"], list(range(7, 14)), "textbook-printed-366-372.pdf"),
        ("first-batch-alberta-a1", output / "sources/authority/program.pdf", [51, 52, 53], "alberta-program-unit-a1.pdf")]:
        r, writer = PdfReader(source), PdfWriter()
        for number in page_numbers:
            writer.add_page(r.pages[number - 1])
        target = output / "first-batch/source-excerpts" / name
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("wb") as handle:
            writer.write(handle)
        records.append({"id": source_id, "packagePath": target.relative_to(output).as_posix(),
                        "sha256": sha(target.read_bytes()), "bytes": target.stat().st_size,
                        "role": "bounded source excerpt, not a new learner resource", "sourcePdfPages": page_numbers,
                        "origin": source.relative_to(output).as_posix()})

    manifest_path = "projects/resources/biology30-unit-a-pilot/resource-manifest.json"
    resource_manifest = json.loads((repo / manifest_path).read_text())
    put_json(output / "sources/resource-manifest-context.json", resource_manifest)
    primary = resource_manifest["resources"][0]["path"]
    selections = [
        ("Chapter 11.html", "chapter11-teacher-instructions", "teacher sequencing and assigned reading; historical LMS instructions"),
        ("Chapter 11 Review.html", "chapter11-review-instructions", "historical teacher review instructions"),
        ("Content/mhriib_tr_comp_ch11.pdf", "chapter11-comprehension-key", "TEACHER ONLY: original textbook comprehension answers"),
        ("Content/mhriib_tr_ans_review_ch11.pdf", "chapter11-review-key", "TEACHER ONLY: original textbook review answers"),
        ("Content/B30 Unit A Chapter 11 Quiz.doc", "chapter11-source-quiz", "TEACHER ONLY: source assessment; calibrate, do not republish as practice"),
        ("Content/B30 Unit A Chapter 11 Quiz KEY.doc", "chapter11-source-quiz-key", "TEACHER ONLY: source assessment key"),
        ("quiz_d2l_59222.xml", "chapter11-source-quiz-qti", "TEACHER ONLY: exact source quiz, responses and feedback"),
        ("Unit A Nervous and Endocrine Systems Notes.pdf", "unit-a-teacher-notes", "teacher notes; broader Unit A source, Chapter 11 portion must be distinguished"),
        ("Nervous and Endocrine System Review Questions.pdf", "unit-a-review-questions", "broader Unit A review; use only relevant Chapter 11 questions"),
        ("Nervous and Endocrine System Review Questions KEY.pdf", "unit-a-review-key", "TEACHER ONLY: broader Unit A review answers"),
        ("B30 Unit A Seminar.pdf", "unit-a-seminar", "broader Unit A seminar; not all items are Chapter 11"),
        ("Bio 30 Unit A Review Seminar KEY.pdf", "unit-a-seminar-key", "TEACHER ONLY: broader Unit A seminar answers"),
    ]
    selection_index = []
    with zipfile.ZipFile(repo / primary) as z:
        resource_rows = []
        for e in ET.fromstring(z.read("imsmanifest.xml")).iter():
            if e.tag.endswith("resource"):
                resource_rows.append({"identifier": e.attrib.get("identifier"),
                                      "href": e.attrib.get("href", "").replace("\\", "/")})
        for member, source_id, role in selections:
            if member not in z.namelist():
                gaps.append({"kind": "missing-selected-source", "sourceId": source_id, "archive": primary, "member": member})
                continue
            category = "teacher-only" if role.startswith("TEACHER ONLY") else "original"
            name = f"sources/{category}/{source_id}{Path(member).suffix.lower()}"
            record = store(source_id, z.read(member), name, {"archive": primary, "member": member}, role,
                           {"resourceIds": [r["identifier"] for r in resource_rows if r["href"] == member]})
            selection_index.append(record)
        qti_member = "quiz_d2l_59222.xml"
        if qti_member in z.namelist():
            image_references = set()
            for element in ET.fromstring(z.read(qti_member)).iter():
                if element.tag.split("}")[-1] == "matimage" and element.attrib.get("uri"):
                    image_references.add(element.attrib["uri"])
                for text in [element.text or ""]:
                    image_references.update(re.findall(r'<img\b[^>]*\bsrc=["\']([^"\']+)', text, re.IGNORECASE))
            media_index = []
            for number, uri in enumerate(sorted(image_references), 1):
                parts = urlsplit(uri)
                if parts.scheme or uri.startswith("//"):
                    media_index.append({"sourceUri": uri, "status": "external; not fetched"})
                    continue
                member = unquote(parts.path).replace("\\", "/").removeprefix("./")
                matches = [n for n in z.namelist() if n == member or Path(n).name == Path(member).name]
                if len(matches) != 1:
                    gaps.append({"kind": "missing-or-ambiguous-quiz-media", "sourceUri": uri, "matches": matches,
                                 "action": "Do not invent or silently omit the source assessment figure."})
                    continue
                member = matches[0]
                media_record = store(f"chapter11-quiz-image-{number}", z.read(member),
                                     "sources/teacher-only/quiz-media/" + Path(member).name,
                                     {"archive": primary, "member": member},
                                     "TEACHER ONLY: original source assessment figure", {"sourceUri": uri})
                media_index.append(media_record)
            put_json(output / "sources/teacher-only/quiz-media-index.json", media_index)
        # A title/link inventory is source evidence only, not authoring approval.
        links = [{"member": m, "bytes": z.getinfo(m).file_size} for m in z.namelist()
                 if any(term in m.lower() for term in ["ch11", "chapter 11", "nervous", "unit a"])
                 and not m.endswith("/")]
        put_json(output / "sources/archive-selection-index.json", {
            "archive": primary, "archiveSha256": sha((repo / primary).read_bytes()),
            "selected": selection_index, "otherRelevantMemberNames": links,
            "excluded": "Full course archives and Chapter 12/13 quizzes are not copied; no browser or learner records are read."})
    qti = output / "sources/teacher-only/chapter11-source-quiz-qti.xml"
    if qti.exists():
        items = []
        root = ET.fromstring(qti.read_bytes())
        for item in root.iter():
            if item.tag.split("}")[-1] == "item":
                items.append({"attributes": item.attrib, "xml": ET.tostring(item, encoding="unicode"),
                              "allTextInDocumentOrder": "\n".join(t.strip() for t in item.itertext() if t.strip())})
        put_json(output / "sources/teacher-only/chapter11-source-quiz-items.json", items)

    with zipfile.ZipFile(prompt_zip) as z:
        prompts = []
        for info in z.infolist():
            if info.filename.endswith(".md") and "__MACOSX/" not in info.filename:
                name = "supplied-standard/" + Path(info.filename).name
                store("supplied-" + Path(info.filename).stem, z.read(info), name,
                      {"archive": str(prompt_zip), "member": info.filename}, "supplied proposal/instructions; current execution boundary still Stage 1")
                prompts.append(name)
        put_json(output / "supplied-standard/archive-provenance.json", {
            "sourcePath": str(prompt_zip), "sha256": sha(prompt_zip.read_bytes()), "files": prompts,
            "status": "Supplied proposed teaching standard; not a repository-wide standards promotion or teacher acceptance of unwritten copy."})

    # Availability is freshly checked; historic inventory/approval fields are not.
    intake = "projects/resources/biology30-production/v1/pilot2/intake/7783e714077e56dcb6c423d61903d577a7decc4756cb38ace124679b279fbf13"
    intake_manifest = json.loads((repo / intake / "intake-manifest.json").read_text())
    originals = list((repo / intake / "originals").iterdir())
    candidates = list((repo / "projects/resources/biology30-unit-a-pilot/_sources").iterdir()) + originals
    # Resolve only named source registries/previously supplied public-course files,
    # not a broad scan of Downloads or any student/browser data.
    recorded_paths = {}
    for source in intake_manifest["sources"]:
        for key in ["path", "sharedCopy"]:
            if source.get(key):
                source_path = Path(source[key])
                source_path = source_path if source_path.is_absolute() else repo / source_path
                if source_path.is_file():
                    recorded_paths.setdefault(source.get("sha256"), []).append(source_path.resolve())
    availability = []
    for chapter in range(11, 21):
        slug = "biology30-unit-a-pilot-3" if chapter == 11 else f"biology30-chapter-{chapter}"
        pdf = repo / f"projects/{slug}/workspace/assets/textbook/chapter-{chapter}.pdf"
        context.update(sourceId=f"chapter{chapter}-availability", pdfPage=None)
        entry = {"chapter": chapter, "textbook": {"path": pdf.relative_to(repo).as_posix(),
                 "sha256": sha(pdf.read_bytes()), "bytes": pdf.stat().st_size, "pdfPages": len(PdfReader(pdf).pages)},
                 "otherSources": []}
        if chapter >= 14:
            declaration = repo / f"projects/{slug}/meta/external-generation/authoring/source-inventory.json"
            declared = json.loads(declaration.read_text())
            if isinstance(declared, dict):
                declared = declared["sources"]
            for source in declared:
                matches = [p for p in candidates if p.stem == source.get("sha256")]
                match = matches[0] if len(matches) == 1 else None
                if not match:
                    matches = recorded_paths.get(source.get("sha256"), [])
                    match = matches[0] if matches else None
                if not match and source.get("name") == f"chapter-{chapter}.pdf":
                    match = pdf
                if not match and source.get("path"):
                    direct = repo / f"projects/{slug}/meta/external-generation" / source["path"]
                    if direct.is_file():
                        match = direct.resolve()
                actual_hash = sha(match.read_bytes()) if match else None
                resolved = match.relative_to(repo).as_posix() if match and match.is_relative_to(repo) else str(match) if match else None
                entry["otherSources"].append({**source, "availability": "available" if match else "not-resolved-in-known-canonical-cache",
                    "resolvedPath": resolved,
                    "actualSha256": actual_hash,
                    "recordedHashMatches": actual_hash == source.get("sha256") if match else None,
                    "reviewStatus": "file availability only; no scientific/teacher acceptance"})
        else:
            for p in candidates:
                if p.suffix != ".pptx" or "unit-a-pilot" not in p.as_posix():
                    continue
                with zipfile.ZipFile(p) as z:
                    initial = " ".join(t.text or "" for i in range(1, 4)
                                       for t in ET.fromstring(z.read(f"ppt/slides/slide{i}.xml")).findall(".//a:t", a))
                if re.search(rf"Chapter\s*{chapter}\b", initial, re.IGNORECASE):
                    entry["otherSources"].append({"role": "teacher deck", "resolvedPath": p.relative_to(repo).as_posix(),
                        "actualSha256": sha(p.read_bytes()), "bytes": p.stat().st_size,
                        "availability": "available", "identificationBasis": "Chapter number in first three slides"})
            entry["otherSources"].append({"role": "shared Unit A instruction/assessment archive", "resolvedPath": primary,
                                           "availability": "available", "scope": "selected Chapter 11 members exported; other chapters inventoried only"})
        availability.append(entry)
    put_json(output / "inventory/current-source-availability.json", availability)
    put_json(output / "sources/pdf-extraction-warnings.json", pdf_warnings)
    if pdf_warnings:
        gaps.append({"kind": "pdf-parser-warnings", "count": len(pdf_warnings),
                     "details": "sources/pdf-extraction-warnings.json",
                     "action": "Text/layout parsing reported malformed numeric objects in historical sources. Originals remain unchanged; use original visual pages and do not claim lossless extraction."})
    gaps.extend([
        {"kind": "missing-evidence", "detail": "No Chapter 11 daily-plan document was located in the known Unit A resource manifest or supplied All daily plan.zip (the latter contains Chapters 14–20).", "blocksStage1Export": False},
        {"kind": "unavailable-earlier-attachment", "path": "/Users/deanguedo/Downloads/BIO30UNITAFILEBUNDLE.zip", "existsNow": Path("/Users/deanguedo/Downloads/BIO30UNITAFILEBUNDLE.zip").exists(), "action": "Known canonical Unit A sources included instead; do not claim the absent bundle was inspected this run."},
        {"kind": "authority-currency", "detail": "Official source cache is included with its original registry. This export does not assert a fresh web verification of 2026 policy."},
        {"kind": "media-currency", "detail": "Video URLs/IDs are inventoried, not fetched, played or certified in Brightspace. No transcript or invented timestamp is supplied."},
        {"kind": "historical-source-science", "detail": "Teacher slides are historical. Reconcile myelination/regeneration, glial functions, pump versus repolarization, refractory phases, neurotransmitter receptor effects and reflex scope against authoritative sources before reusing claims."},
    ])
    put_json(output / "sources/source-register.json", records)
    put_json(output / "sources/extraction-gaps.json", gaps)
    return {"sourceCount": len(records), "deckSlides": len(slides), "textbookPages": book["pdfPages"], "gaps": len(gaps), "pdfParserWarningsRecorded": len(pdf_warnings)}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--prompts", required=True)
    args = parser.parse_args()
    print(json.dumps(extract_sources(Path(args.repo), Path(args.output), Path(args.prompts))))
