#!/usr/bin/env python3
"""Build three private-review Chapter 4 textbook-practice notebooks.

The supplied NXT D2L export is the source boundary. Learner projects contain
only the six textbook sections, the study guide, review, and practice test.
Solutions, answer keys, quizzes, exams, and class-specific material are never
extracted or referenced.
"""

from __future__ import annotations

import hashlib
import html
import json
import shutil
import tempfile
import zipfile
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = Path("/Users/deanguedo/Downloads/D2LExport_6861_NXT Math 10C (Master)_202692441.zip")
TEMPLATE = ROOT / "tasks/math10c-chapter4-textbook-practice/templates"
RESOURCE_MAP = ROOT / "projects/resources/math10c-production/v1/chapter4/textbook-practice-source-map.json"
LOGO = ROOT / "projects/math10c-unit3-textbook-1/workspace/assets/nextstep.png"


def nums(start: int, end: int) -> list[int]:
    return list(range(start, end + 1))


SOURCES = {
    "4.1": {
        "member": "Textbook/Ch.4/Math 10C Textbook 4.1.pdf",
        "file": "math10c-4-1.pdf",
        "title": "4.1 Estimating roots",
        "printedStart": 204,
        "printedEnd": 206,
    },
    "4.2": {
        "member": "Textbook/Ch.4/Math 10C Textbook 4.2.pdf",
        "file": "math10c-4-2.pdf",
        "title": "4.2 Irrational numbers",
        "printedStart": 207,
        "printedEnd": 212,
    },
    "4.3": {
        "member": "Textbook/Ch.4/Math 10C Textbook 4.3.pdf",
        "file": "math10c-4-3.pdf",
        "title": "4.3 Mixed and entire radicals",
        "printedStart": 213,
        "printedEnd": 221,
    },
    "4.4": {
        "member": "Textbook/Ch.4/Math 10C Textbook 4.4.pdf",
        "file": "math10c-4-4.pdf",
        "title": "4.4 Fractional exponents and radicals",
        "printedStart": 222,
        "printedEnd": 228,
    },
    "4.5": {
        "member": "Textbook/Ch.4/Math 10C Textbook 4.5.pdf",
        "file": "math10c-4-5.pdf",
        "title": "4.5 Negative exponents and reciprocals",
        "printedStart": 229,
        "printedEnd": 236,
    },
    "4.6": {
        "member": "Textbook/Ch.4/Math 10C Textbook 4.6.pdf",
        "file": "math10c-4-6.pdf",
        "title": "4.6 Applying the exponent laws",
        "printedStart": 237,
        "printedEnd": 243,
    },
    "study": {
        "member": "Textbook/Ch.4/Math 10C Textbook Study Guide 4.pdf",
        "file": "math10c-study-guide-4.pdf",
        "title": "Chapter 4 study guide",
        "printedStart": 244,
        "printedEnd": 245,
    },
    "review": {
        "member": "Textbook/Ch.4/Math 10C Textbook Review 4.pdf",
        "file": "math10c-review-4.pdf",
        "title": "Chapter 4 review",
        "printedStart": 246,
        "printedEnd": 248,
    },
    "test": {
        "member": "Textbook/Ch.4/Math 10C Textbook Practice Test 4.pdf",
        "file": "math10c-practice-test-4.pdf",
        "title": "Chapter 4 practice test",
        "printedStart": 249,
        "printedEnd": 249,
    },
}


# section, group, printed page, and columns of question numbers with crop and
# anchored-number x bounds. Checkpoint questions and study-guide examples are
# intentionally excluded from the selectable bank.
SPECS = [
    ("4.1", "4.1", 206, [(nums(1, 6), 228, 644, 230, 285)]),
    ("4.2", "4.2", 211, [(nums(3, 8), 92, 350, 100, 145), (nums(9, 15), 345, 644, 355, 415)]),
    ("4.2", "4.2", 212, [(nums(16, 18), 92, 350, 95, 145), (nums(19, 24), 345, 644, 350, 415)]),
    ("4.3", "4.3", 218, [(nums(3, 10), 92, 350, 98, 145), (nums(11, 18), 345, 644, 350, 415)]),
    ("4.3", "4.3", 219, [(nums(19, 20), 92, 350, 98, 145), (nums(21, 25), 345, 644, 350, 415)]),
    ("4.4", "4.4", 227, [(nums(3, 10), 92, 350, 100, 145), (nums(11, 16), 345, 644, 350, 415)]),
    ("4.4", "4.4", 228, [(nums(17, 20), 92, 350, 95, 145), (nums(21, 22), 345, 644, 350, 415)]),
    ("4.5", "4.5", 233, [(nums(3, 10), 92, 350, 100, 145), (nums(11, 14), 345, 644, 350, 415)]),
    ("4.5", "4.5", 234, [(nums(15, 19), 92, 350, 95, 145), (nums(20, 21), 345, 644, 350, 415)]),
    ("4.6", "4.6", 241, [(nums(3, 4), 92, 350, 100, 145), (nums(5, 6), 345, 644, 350, 415)]),
    ("4.6", "4.6", 242, [(nums(7, 13), 92, 350, 95, 145), (nums(14, 19), 345, 644, 350, 415)]),
    ("4.6", "4.6", 243, [(nums(20, 22), 92, 350, 95, 145), (nums(23, 24), 345, 644, 350, 415)]),
    ("review", "Review", 246, [(nums(1, 9), 92, 350, 95, 145), (nums(10, 13), 345, 644, 350, 415)]),
    ("review", "Review", 247, [(nums(14, 20), 92, 350, 95, 145), (nums(21, 26), 345, 644, 350, 415)]),
    ("review", "Review", 248, [(nums(27, 29), 92, 350, 95, 145), (nums(30, 32), 345, 644, 350, 415)]),
    ("review", "Practice test", 249, [(nums(1, 8), 92, 644, 95, 150)]),
]


PARTS = {
    1: {
        "slug": "math10c-unit4-textbook-1",
        "label": "Textbook sections 4.1-4.2",
        "lead": "Textbook sections 4.1-4.2",
        "sections": ["4.1", "4.2"],
    },
    2: {
        "slug": "math10c-unit4-textbook-2",
        "label": "Textbook sections 4.3-4.4",
        "lead": "Textbook sections 4.3-4.4",
        "sections": ["4.3", "4.4"],
    },
    3: {
        "slug": "math10c-unit4-textbook-3",
        "label": "Textbook sections 4.5-4.6 and chapter review",
        "lead": "Textbook sections 4.5-4.6 and chapter review",
        "sections": ["4.5", "4.6", "review"],
    },
}


SECTION_PART = {section: part for part, config in PARTS.items() for section in config["sections"]}


def bounded(page, box):
    x0, top, x1, bottom = box
    page_x0, page_top, page_x1, page_bottom = page.bbox
    return (
        max(page_x0, min(x0, page_x1 - 2)),
        max(page_top, min(top, page_bottom - 2)),
        max(page_x0 + 2, min(x1, page_x1)),
        max(page_top + 2, min(bottom, page_bottom)),
    )


def question_token(words, number, anchor_min, anchor_max):
    token = f"{number}."
    matches = [word for word in words if word["text"] == token and anchor_min <= word["x0"] <= anchor_max]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one anchored {token}; found {len(matches)}")
    return matches[0]


def source_key_for_printed(printed: int) -> str:
    for key, source in SOURCES.items():
        if source["printedStart"] <= printed <= source["printedEnd"]:
            return key
    raise KeyError(printed)


def crop_questions(extracted: Path) -> list[dict]:
    entries = []
    open_pdfs = {}
    try:
        for section, group, printed, columns in SPECS:
            source_key = source_key_for_printed(printed)
            source = SOURCES[source_key]
            pdf_path = extracted / source["file"]
            pdf = open_pdfs.setdefault(pdf_path, pdfplumber.open(pdf_path))
            offset = printed - source["printedStart"]
            page = pdf.pages[offset]
            words = page.extract_words(x_tolerance=2, y_tolerance=3)
            footer_tops = [word["top"] - 7 for word in words if word["text"] == str(printed) and word["top"] > 700]
            marker_tops = [word["top"] - 12 for word in words if word["text"].lower() == "reflect" or word["text"] == "WORLD"]
            page_bottom = min(footer_tops + marker_tops + [page.bbox[3] - 8])
            for question_numbers, x0, x1, anchor_min, anchor_max in columns:
                starts = [(number, question_token(words, number, anchor_min, anchor_max)) for number in question_numbers]
                for index, (number, start) in enumerate(starts):
                    bottom = starts[index + 1][1]["top"] - 7 if index + 1 < len(starts) else page_bottom
                    if bottom <= start["top"]:
                        raise RuntimeError(f"Invalid crop height for {section} question {number} on printed page {printed}")
                    box = bounded(page, (x0, start["top"] - 8, x1, bottom))
                    if group == "Practice test":
                        prefix, question_id, label = "test", f"test-q{number}", f"Practice test {number}"
                    elif group == "Review":
                        prefix, question_id, label = "review", f"review-q{number}", f"Review {number}"
                    else:
                        prefix, question_id, label = section.replace(".", "-"), f"q{number}", f"Q{number}"
                    part = SECTION_PART[section]
                    project = ROOT / "projects" / PARTS[part]["slug"]
                    output_rel = f"assets/textbook-crops/{prefix}-q{number}.png"
                    output_path = project / "workspace" / output_rel
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    page.crop(box).to_image(resolution=190, antialias=True).save(output_path, format="PNG")
                    entries.append(
                        {
                            "section": section,
                            "group": group,
                            "questionId": question_id,
                            "label": label,
                            "number": number,
                            "printedPage": printed,
                            "image": output_rel,
                            "sourceFile": f"assets/textbook/{source['file']}",
                            "pdfPage": offset + 1,
                            "crop": [round(value, 2) for value in box],
                            "part": part,
                        }
                    )
    finally:
        for pdf in open_pdfs.values():
            pdf.close()
    if len(entries) != 152:
        raise RuntimeError(f"Expected 152 individual questions; generated {len(entries)}")
    if len({(entry["section"], entry["questionId"]) for entry in entries}) != 152:
        raise RuntimeError("Question IDs are not unique within their practice section")
    return entries


def button(index: int, label: str) -> str:
    return (
        f'<button type="button" data-question-index="{index}" '
        f'data-canvas-helper-studio-edit="annotation-only" aria-pressed="false">{html.escape(label)}</button>'
    )


def reader_button(source_key: str) -> str:
    source = SOURCES[source_key]
    return (
        '<button type="button" class="secondary" '
        f'data-reader-file="assets/textbook/{source["file"]}" '
        f'data-reader-title="{html.escape(source["title"])}">View {html.escape(source["title"])}</button>'
    )


def render_section(slug: str, section: str, entries: list[dict]) -> str:
    if section == "review":
        title = "Chapter review and practice test"
        groups = []
        for group in ["Review", "Practice test"]:
            rows = [(index, entry) for index, entry in enumerate(entries) if entry["group"] == group]
            groups.append(
                f'<div class="question-group"><h3>{group}</h3><div class="question-buttons" role="group" '
                f'aria-label="Choose a question from {group}">{"".join(button(index, entry["label"]) for index, entry in rows)}</div></div>'
            )
        readers = "".join(reader_button(key) for key in ["study", "review", "test"])
    else:
        title = SOURCES[section]["title"]
        rows = [(index, entry) for index, entry in enumerate(entries) if entry["section"] == section]
        groups = [
            f'<div class="question-group"><div class="question-buttons" role="group" '
            f'aria-label="Choose a question from {section}">{"".join(button(index, entry["label"]) for index, entry in rows)}</div></div>'
        ]
        readers = reader_button(section)
    route = section.replace(".", "-")
    return f'''<section class="practice-section" id="section-{route}" aria-labelledby="heading-{route}" data-section-id="{section}">
<header class="section-heading"><h2 id="heading-{route}" data-canvas-helper-edit-key="{slug}-{route}-title">{html.escape(title)}</h2>
<p data-canvas-helper-edit-key="{slug}-{route}-directions">Choose a question to show its exact textbook excerpt and a saved work box. Use the math buttons for common notation, or open the complete source pages here for more context.</p></header>
{"".join(groups)}
<div class="reader-actions">{readers}</div>
<div class="question-stage" data-question-stage="{section}"><p>Choose a question above to begin.</p></div>
<div class="reader-stage" data-reader-stage="{section}" hidden></div></section>'''


def render_html(part: int, entries: list[dict]) -> str:
    config = PARTS[part]
    slug = config["slug"]
    title = f"Math 10C - Chapter 4 Textbook Practice {part}"
    nav = []
    for section in config["sections"]:
        route = section.replace(".", "-")
        label = "Review and practice test" if section == "review" else SOURCES[section]["title"]
        nav.append(f'<a href="#section-{route}" data-page-link="section-{route}">{html.escape(label)}</a>')
    sections = "\n".join(render_section(slug, section, entries) for section in config["sections"])
    payload = [
        {
            "section": entry["section"],
            "id": entry["questionId"],
            "label": entry["label"],
            "printed": entry["printedPage"],
            "image": entry["image"],
            "file": entry["sourceFile"],
            "pdfPage": entry["pdfPage"],
        }
        for entry in entries
    ]
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title data-canvas-helper-course-title>{html.escape(title)}</title><link rel="stylesheet" href="styles.css"></head>
<body data-project-slug="{slug}"><a class="skip-link" href="#main-content">Skip to textbook practice</a>
<header class="topbar"><div class="topbar-inner"><img src="assets/nextstep.png" alt="Next Step Continuing Education"><div><strong data-canvas-helper-course-title>{html.escape(title)}</strong><span>{html.escape(config["label"])}</span></div><p id="save-status" role="status">Opening saved work...</p></div></header>
<div class="shell"><aside class="sidebar" aria-label="Textbook practice sections"><h2>Chapter 4</h2><a href="#overview" data-page-link="overview">Overview</a>{''.join(nav)}<p>Optional and ungraded</p></aside>
<main id="main-content"><section class="overview" id="overview"><h1 data-canvas-helper-course-title data-canvas-helper-edit-key="course-title-main">{html.escape(title)}</h1><p class="lead" data-canvas-helper-edit-key="course-summary">{html.escape(config["lead"])}. Work from a focused image of each question, keep written steps beside it, and open the complete source pages in place whenever you want more context.</p><div class="notice"><strong>Your work saves automatically.</strong><p>This optional notebook does not report a grade or change mastery in the main Chapter 4 course.</p></div><div class="print-actions"><button type="button" class="print-button" id="print-work">Print or save my written work</button><p>Includes every question with entered work. In the print window, choose a printer or Save as PDF, then upload the file to your Brightspace evidence dropbox. Printing does not submit it.</p><p id="print-message" role="status" aria-live="polite"></p></div></section>
{sections}<section class="recovery" id="recovery" hidden><h2>Saved-work recovery</h2><p id="recovery-message"></p><div id="recovery-versions"></div></section></main></div><section id="print-sheet" aria-label="Printable textbook work" hidden></section>
<script type="application/json" id="question-data">{json.dumps(payload, separators=(",", ":"), ensure_ascii=False).replace("</", "<\\/")}</script><script src="assets/save-controller.js"></script><script src="course.js" defer></script></body></html>'''


def project_source_keys(part: int) -> list[str]:
    keys = [section for section in PARTS[part]["sections"] if section != "review"]
    if "review" in PARTS[part]["sections"]:
        keys.extend(["study", "review", "test"])
    return keys


def write_project(part: int, all_entries: list[dict], extracted: Path):
    config = PARTS[part]
    slug = config["slug"]
    project = ROOT / "projects" / slug
    workspace = project / "workspace"
    entries = [{key: value for key, value in entry.items() if key != "part"} for entry in all_entries if entry["part"] == part]
    textbook = workspace / "assets/textbook"
    textbook.mkdir(parents=True, exist_ok=True)
    for source_key in project_source_keys(part):
        source = SOURCES[source_key]
        shutil.copy2(extracted / source["file"], textbook / source["file"])
    shutil.copy2(TEMPLATE / "course.js", workspace / "course.js")
    shutil.copy2(TEMPLATE / "styles.css", workspace / "styles.css")
    shutil.copy2(TEMPLATE / "save-controller.js", workspace / "assets/save-controller.js")
    shutil.copy2(LOGO, workspace / "assets/nextstep.png")
    (workspace / "index.html").write_text(render_html(part, entries), encoding="utf-8")
    page_ids = ["overview"] + [f"section-{section.replace('.', '-')}" for section in config["sections"]]
    (workspace / "scorm-tracking.json").write_text(json.dumps({"schemaVersion": 1, "adapter": "hash-pages-v1", "pageIds": page_ids, "defaultPageId": "overview", "state": {"adapter": "course-state-v1"}}, indent=2) + "\n")
    manifest = {
        "schemaVersion": 1,
        "distributionStatus": "private-local-review-pending-source-approval",
        "generatedBy": "scripts/build-math10c-unit4-textbook-practice.py",
        "notes": "Each learner choice maps to one cropped textbook question. Checkpoints and study-guide examples remain available only through complete source pages.",
        "entries": entries,
    }
    (project / "meta/textbook-question-crops.json").write_text(json.dumps(manifest, indent=2) + "\n")
    (project / "meta/e2e-contract.json").write_text(json.dumps({"projectSlug": slug, "requiredTestIds": ["studio-shell", "course-studio-tab", "workspace-project-select", "project-root", "workspace-preview-frame"], "modes": {"enabled": False}, "navigation": {"enabled": False}, "quiz": {"enabled": False, "lessonTitle": "Optional textbook practice"}, "fallbackPanel": {"enabled": False}, "modulePassTargets": [], "visibilityChecks": []}, indent=2) + "\n")
    prompt = f'''# {config["slug"]} - Codex to Studio contract

- Workflow: generated-course
- Canonical learner page: projects/{slug}/workspace/index.html
- Canonical presentation: projects/{slug}/workspace/styles.css
- Canonical runtime: projects/{slug}/workspace/course.js
- Boundary: {config["label"]}; {len(entries)} optional, ungraded textbook questions
- Persistence: compact SCORM 2004 course-state adapter; 600 characters per question
- Completion and grading: deliberately absent
- Release status: private review only, pending source-use and accessibility approval

## Authoring rules

- Keep question choices, instructions, headings, links, and images in canonical HTML.
- Preserve package-local question order because saved answers use question indices.
- Keep complete source pages in the in-course reader; do not open a new tab.
- Preserve symbol-entry help, print/Save-as-PDF evidence, and automatic saving.
- Do not add solutions, answer keys, formal assessments, mastery scoring, or submission integration.

## Rollout checks

- npm run course:doctor -- --project {slug}
- npm run verify -- --project {slug} --mode workspace
- npm run test:e2e:project -- --project {slug}
- Export only as review-only SCORM until source-use and accessibility gates close.
'''
    (project / "meta/prompt-pack.md").write_text(prompt, encoding="utf-8")
    metadata_path = project / "meta/project.json"
    metadata = json.loads(metadata_path.read_text())
    canonical = [
        f"projects/{slug}/workspace/index.html",
        f"projects/{slug}/workspace/styles.css",
        f"projects/{slug}/workspace/course.js",
        f"projects/{slug}/workspace/assets/save-controller.js",
        f"projects/{slug}/workspace/scorm-tracking.json",
        f"projects/{slug}/workspace/assets/nextstep.png",
        f"projects/{slug}/meta/e2e-contract.json",
        f"projects/{slug}/meta/textbook-question-crops.json",
    ]
    canonical.extend(f"projects/{slug}/workspace/assets/textbook/{SOURCES[key]['file']}" for key in project_source_keys(part))
    canonical.extend(f"projects/{slug}/workspace/{entry['image']}" for entry in entries)
    metadata.update({
        "canonicalSources": canonical,
        "authoringStatus": "active",
        "exportTargets": [
            {"target": "html", "enabled": True, "notes": "Private local review copy pending source-use and accessibility approval."},
            {"target": "scorm", "enabled": True, "notes": "Review-only SCORM 2004 with compact notebook state; optional and ungraded."},
        ],
        "sourceOfTruthNotes": f"Direct Studio notebook generated from the reviewed Chapter 4 textbook-practice boundary. It contains {len(entries)} optional questions for {config['label']}; textbook work is outside automated mastery. Source-use and accessibility approval remain open.",
        "textbookPractice": {"schemaVersion": 1, "part": part, "label": config["label"], "questionCount": len(entries), "responseLimit": 600, "graded": False, "completion": False, "sourceProject": "math10c-unit4-pilot"},
    })
    metadata_path.write_text(json.dumps(metadata, indent=2) + "\n")
    shutil.copy2(workspace / "index.html", project / "raw/original.html")
    shutil.copy2(workspace / "styles.css", project / "raw/styles.css")
    shutil.copy2(workspace / "course.js", project / "raw/course.js")


def main():
    if not ARCHIVE.exists():
        raise FileNotFoundError(ARCHIVE)
    required = [source["member"] for source in SOURCES.values()]
    with tempfile.TemporaryDirectory(prefix="math10c-ch4-textbook-") as tmp:
        extracted = Path(tmp)
        with zipfile.ZipFile(ARCHIVE) as archive:
            missing = [member for member in required if member not in archive.namelist()]
            if missing:
                raise RuntimeError(f"Missing expected textbook members: {missing}")
            for source in SOURCES.values():
                (extracted / source["file"]).write_bytes(archive.read(source["member"]))
        for part, config in PARTS.items():
            crop_dir = ROOT / "projects" / config["slug"] / "workspace/assets/textbook-crops"
            if crop_dir.exists():
                shutil.rmtree(crop_dir)
            crop_dir.mkdir(parents=True)
        entries = crop_questions(extracted)
        for part in PARTS:
            write_project(part, entries, extracted)
    source_map = {
        "schemaVersion": 1,
        "distributionStatus": "private-local-review-pending-source-approval",
        "sourceArchive": {"filename": ARCHIVE.name, "sha256": hashlib.sha256(ARCHIVE.read_bytes()).hexdigest()},
        "excluded": ["Textbook solutions and answer keys", "CBE/NXT quizzes and exams", "Class-specific submissions and identifiers", "Checkpoint and study-guide examples as selectable questions"],
        "items": [{**source, "pdfPages": source["printedEnd"] - source["printedStart"] + 1} for source in SOURCES.values()],
        "questionCount": 152,
        "parts": [{"part": part, "slug": config["slug"], "label": config["label"], "questionCount": len([entry for entry in entries if entry["part"] == part])} for part, config in PARTS.items()],
        "notes": "Complete source PDFs remain in the private review packages. Every selectable question has an exact crop and printed-page mapping. Textbook work is optional and excluded from mastery.",
    }
    RESOURCE_MAP.write_text(json.dumps(source_map, indent=2) + "\n")
    print("Built Chapter 4 textbook practice projects: " + ", ".join(config["slug"] for config in PARTS.values()))
    print("Question counts: " + ", ".join(f"part {part}={len([entry for entry in entries if entry['part'] == part])}" for part in PARTS))


if __name__ == "__main__":
    main()
