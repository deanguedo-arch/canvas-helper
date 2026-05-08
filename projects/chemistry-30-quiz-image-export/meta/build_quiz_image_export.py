from __future__ import annotations

import csv
import hashlib
import html
import json
import os
import posixpath
import re
import shutil
import unicodedata
import zipfile
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import unquote
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[3]
PROJECT_ROOT = REPO_ROOT / "projects" / "chemistry-30-quiz-image-export"
ZIP_PATH = Path(
    r"C:\Users\dean.guedo\Downloads\D2LCCExport_151127_25-26 _ S2 _ Chemistry 30 _ Per 1(A) _ Sec 2_20265706.zip"
)

RAW_DIR = PROJECT_ROOT / "raw"
META_DIR = PROJECT_ROOT / "meta"
EXPORT_DIR = PROJECT_ROOT / "exports"
PACKAGE_DIR = EXPORT_DIR / "quiz-image-package"
QUIZZES_DIR = PACKAGE_DIR / "quizzes"
OUTPUT_ZIP = EXPORT_DIR / "chemistry-30-brightspace-quiz-image-package.zip"

QTI_NS = "http://www.imsglobal.org/xsd/ims_qtiasiv1p2"
IMG_RE = re.compile(r"<img\b[^>]*\bsrc=[\"']([^\"']+)[\"']", re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")


@dataclass
class ImageRef:
    question_number: int
    context: str
    image_number: int
    source_src: str
    source_href: str | None
    output_relative_path: str | None = None
    source_bytes: int = 0
    missing: bool = False


@dataclass
class ChoiceRecord:
    order: int
    ident: str
    label: str
    html: str
    text: str
    images: list[ImageRef] = field(default_factory=list)
    correct: bool = False


@dataclass
class QuestionRecord:
    number: int
    ident: str
    question_type: str
    weighting: str
    prompt_html: str
    prompt_text: str
    images: list[ImageRef]
    choices: list[ChoiceRecord]
    correct_response_idents: list[str]


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def safe_name(value: str, max_len: int = 110) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_value = re.sub(r"[^\w\s().,&+-]+", "", ascii_value)
    ascii_value = re.sub(r"\s+", " ", ascii_value).strip()
    ascii_value = ascii_value.replace("&", "and")
    ascii_value = ascii_value.strip(" .")
    if not ascii_value:
        ascii_value = "untitled"
    return ascii_value[:max_len].strip(" .")


def to_text(html_value: str) -> str:
    text = TAG_RE.sub(" ", html.unescape(html_value or ""))
    text = text.replace("\xa0", " ")
    return re.sub(r"\s+", " ", text).strip()


def all_text(element: ET.Element | None) -> str:
    if element is None:
        return ""
    return "".join(element.itertext()).strip()


def qti_find(element: ET.Element, selector: str) -> ET.Element | None:
    return element.find(selector, {"q": QTI_NS})


def qti_findall(element: ET.Element, selector: str) -> list[ET.Element]:
    return element.findall(selector, {"q": QTI_NS})


def mattext_html(element: ET.Element | None) -> str:
    if element is None:
        return ""
    parts = [all_text(node) for node in qti_findall(element, ".//q:mattext")]
    return "\n".join(part for part in parts if part)


def metadata_value(element: ET.Element, label: str) -> str:
    for field_node in qti_findall(element, ".//q:qtimetadatafield"):
        field_label = all_text(qti_find(field_node, "q:fieldlabel"))
        if field_label == label:
            return all_text(qti_find(field_node, "q:fieldentry"))
    return ""


def resolve_href(qti_href: str, src: str, package_names: set[str]) -> str | None:
    cleaned = unquote((src or "").split("#", 1)[0].split("?", 1)[0].replace("\\", "/").strip())
    if not cleaned or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", cleaned):
        return None
    candidates = [
        posixpath.normpath(posixpath.join(posixpath.dirname(qti_href), cleaned)),
        cleaned.lstrip("/"),
    ]
    for candidate in candidates:
        if candidate in package_names:
            return candidate
    basename = posixpath.basename(cleaned)
    folder = posixpath.dirname(qti_href)
    candidate = f"{folder}/{basename}"
    if candidate in package_names:
        return candidate
    return None


def extract_image_refs(
    html_value: str,
    qti_href: str,
    package_names: set[str],
    question_number: int,
    context: str,
) -> list[ImageRef]:
    refs = []
    for index, src in enumerate(IMG_RE.findall(html.unescape(html_value or "")), start=1):
        source_href = resolve_href(qti_href, src, package_names)
        refs.append(
            ImageRef(
                question_number=question_number,
                context=context,
                image_number=index,
                source_src=src,
                source_href=source_href,
                missing=source_href is None,
            )
        )
    return refs


def correct_response_idents(item: ET.Element) -> list[str]:
    correct = []
    for condition in qti_findall(item, ".//q:respcondition"):
        setvar = qti_find(condition, "q:setvar")
        score = all_text(setvar)
        if setvar is None or score.strip() in {"", "0"}:
            continue
        for varequal in qti_findall(condition, ".//q:varequal"):
            value = all_text(varequal)
            if value:
                correct.append(value)
    return correct


def extract_prompt_html(item: ET.Element) -> str:
    presentation = qti_find(item, "q:presentation")
    if presentation is None:
        return ""
    direct_parts = []
    for material in qti_findall(presentation, "q:material"):
        direct_parts.append(mattext_html(material))
    return "\n".join(part for part in direct_parts if part)


def choice_label(order: int, text: str) -> str:
    cleaned = to_text(text)
    if cleaned and len(cleaned) <= 12:
        return safe_name(cleaned, 12)
    return chr(64 + order) if 1 <= order <= 26 else f"choice-{order}"


def parse_question(item: ET.Element, qti_href: str, package_names: set[str], number: int) -> QuestionRecord:
    prompt_html = extract_prompt_html(item)
    prompt_images = extract_image_refs(prompt_html, qti_href, package_names, number, "prompt")
    correct = correct_response_idents(item)
    choices = []
    for order, response_label in enumerate(qti_findall(item, ".//q:response_label"), start=1):
        ident = response_label.attrib.get("ident", "")
        choice_html = mattext_html(response_label)
        label = choice_label(order, choice_html)
        images = extract_image_refs(choice_html, qti_href, package_names, number, f"choice_{label}")
        choices.append(
            ChoiceRecord(
                order=order,
                ident=ident,
                label=label,
                html=choice_html,
                text=to_text(choice_html),
                images=images,
                correct=ident in correct,
            )
        )

    return QuestionRecord(
        number=number,
        ident=item.attrib.get("ident", ""),
        question_type=metadata_value(item, "cc_profile"),
        weighting=metadata_value(item, "cc_weighting"),
        prompt_html=prompt_html,
        prompt_text=to_text(prompt_html),
        images=prompt_images,
        choices=choices,
        correct_response_idents=correct,
    )


def copy_image(zip_file: zipfile.ZipFile, ref: ImageRef, quiz_dir: Path, used_names: set[str]):
    if not ref.source_href:
        return
    ext = Path(ref.source_href).suffix.lower() or ".png"
    context = safe_name(ref.context, 42).replace(" ", "_")
    base = f"q{ref.question_number:03d}_{context}_img{ref.image_number:02d}{ext}"
    destination_name = base
    counter = 2
    while destination_name.lower() in used_names:
        destination_name = f"{Path(base).stem}_{counter}{ext}"
        counter += 1
    used_names.add(destination_name.lower())
    destination = quiz_dir / "images" / destination_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    data = zip_file.read(ref.source_href)
    destination.write_bytes(data)
    ref.output_relative_path = destination.relative_to(quiz_dir).as_posix()
    ref.source_bytes = len(data)


def copy_unreferenced_image(zip_file: zipfile.ZipFile, source_href: str, quiz_dir: Path, used_names: set[str]) -> tuple[str, int]:
    ext = Path(source_href).suffix.lower() or ".image"
    digest = hashlib.sha1(source_href.encode("utf-8")).hexdigest()[:8]
    stem = safe_name(Path(source_href).stem, 78).replace(" ", "_")
    base = f"{stem}-{digest}{ext}"
    destination_name = base
    counter = 2
    while destination_name.lower() in used_names:
        destination_name = f"{Path(base).stem}_{counter}{ext}"
        counter += 1
    used_names.add(destination_name.lower())
    destination = quiz_dir / "unreferenced-source-images" / destination_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    data = zip_file.read(source_href)
    destination.write_bytes(data)
    return destination.relative_to(quiz_dir).as_posix(), len(data)


def rewrite_html_images(html_value: str, refs: list[ImageRef]) -> str:
    queue = list(refs)

    def replace(match: re.Match[str]) -> str:
        original = match.group(0)
        if not queue:
            return original
        ref = queue.pop(0)
        if not ref.output_relative_path:
            return original
        return re.sub(
            r"\bsrc=[\"'][^\"']+[\"']",
            f'src="{html.escape(ref.output_relative_path)}"',
            original,
            count=1,
            flags=re.IGNORECASE,
        )

    return IMG_RE.sub(replace, html.unescape(html_value or ""))


def render_quiz_html(quiz: dict[str, Any], questions: list[QuestionRecord], quiz_dir: Path):
    lines = [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '<meta charset="utf-8" />',
        '<meta name="viewport" content="width=device-width, initial-scale=1" />',
        f"<title>{html.escape(quiz['title'])}</title>",
        "<style>",
        "body{font-family:Arial,sans-serif;line-height:1.45;margin:32px;max-width:1100px;color:#172033}",
        "h1{font-size:28px} h2{border-top:1px solid #d5dbe8;padding-top:20px;margin-top:28px}",
        ".meta{color:#536179}.choice{margin:8px 0 8px 20px}.correct{font-weight:700;color:#0f766e}",
        "img{max-width:100%;height:auto;border:1px solid #d5dbe8;border-radius:6px;margin:8px 0}",
        "code{background:#eef2f7;padding:2px 5px;border-radius:4px}",
        "</style>",
        "</head>",
        "<body>",
        f"<h1>{html.escape(quiz['title'])}</h1>",
        f"<p class=\"meta\">Questions: {len(questions)} | Referenced image placements: {quiz['referencedImageCount']} | Unique source images: {quiz['uniqueImageCount']}</p>",
        f"<p class=\"meta\">Raw QTI: <code>{html.escape(quiz['qtiFile'])}</code></p>",
    ]
    for question in questions:
        lines.append(f"<h2>Question {question.number}</h2>")
        lines.append(
            f"<p class=\"meta\">Type: {html.escape(question.question_type or 'unknown')} | Weight: {html.escape(question.weighting or 'unknown')}</p>"
        )
        prompt_refs = question.images
        prompt_html = rewrite_html_images(question.prompt_html, prompt_refs)
        lines.append(prompt_html or "<p><em>No prompt text.</em></p>")
        for choice in question.choices:
            choice_html = rewrite_html_images(choice.html, choice.images)
            class_name = "choice correct" if choice.correct else "choice"
            correct_mark = " (correct)" if choice.correct else ""
            lines.append(
                f'<div class="{class_name}"><strong>{html.escape(choice.label)}{correct_mark}:</strong> {choice_html}</div>'
            )
    lines.extend(["</body>", "</html>"])
    (quiz_dir / "quiz-preview.html").write_text("\n".join(lines), encoding="utf-8")


def write_quiz_reports(quiz: dict[str, Any], questions: list[QuestionRecord], quiz_dir: Path):
    rows = []
    image_rows = []
    for question in questions:
        all_question_images = question.images + [image for choice in question.choices for image in choice.images]
        rows.append(
            {
                "questionNumber": question.number,
                "questionIdent": question.ident,
                "questionType": question.question_type,
                "weighting": question.weighting,
                "promptText": question.prompt_text,
                "choices": " | ".join(
                    f"{choice.label}{'*' if choice.correct else ''}: {choice.text}" for choice in question.choices
                ),
                "correctChoiceLabels": ", ".join(choice.label for choice in question.choices if choice.correct),
                "imageFiles": " | ".join(image.output_relative_path or "" for image in all_question_images),
                "sourceImageFiles": " | ".join(image.source_href or image.source_src for image in all_question_images),
            }
        )
        for image in all_question_images:
            image_rows.append(
                {
                    "questionNumber": question.number,
                    "context": image.context,
                    "imageNumber": image.image_number,
                    "outputRelativePath": image.output_relative_path or "",
                    "sourceSrc": image.source_src,
                    "sourceHref": image.source_href or "",
                    "bytes": image.source_bytes,
                    "missing": image.missing,
                }
            )

    with (quiz_dir / "questions.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()) if rows else ["questionNumber"])
        writer.writeheader()
        writer.writerows(rows)

    with (quiz_dir / "image-map.csv").open("w", encoding="utf-8", newline="") as handle:
        fieldnames = [
            "questionNumber",
            "context",
            "imageNumber",
            "outputRelativePath",
            "sourceSrc",
            "sourceHref",
            "bytes",
            "missing",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(image_rows)

    markdown = [
        f"# {quiz['title']}",
        "",
        f"- Source QTI: `{quiz['sourceQtiHref']}`",
        f"- Questions: {len(questions)}",
        f"- Referenced image placements: {quiz['referencedImageCount']}",
        f"- Unique source images: {quiz['uniqueImageCount']}",
        "",
    ]
    for question in questions:
        markdown.append(f"## Question {question.number}")
        if question.prompt_text:
            markdown.append(question.prompt_text)
        images = question.images + [image for choice in question.choices for image in choice.images]
        for image in images:
            label = image.output_relative_path or image.source_src
            markdown.append(f"- Image: `{label}` from `{image.source_href or image.source_src}`")
        if question.choices:
            markdown.append("")
            markdown.append("Choices:")
            for choice in question.choices:
                suffix = " (correct)" if choice.correct else ""
                markdown.append(f"- {choice.label}{suffix}: {choice.text}")
        markdown.append("")
    (quiz_dir / "questions.md").write_text("\n".join(markdown), encoding="utf-8")

    quiz_info = {
        **quiz,
        "questions": [
            {
                "number": question.number,
                "ident": question.ident,
                "questionType": question.question_type,
                "weighting": question.weighting,
                "promptText": question.prompt_text,
                "correctResponseIdents": question.correct_response_idents,
                "choices": [
                    {
                        "order": choice.order,
                        "ident": choice.ident,
                        "label": choice.label,
                        "text": choice.text,
                        "correct": choice.correct,
                    }
                    for choice in question.choices
                ],
                "images": [
                    {
                        "context": image.context,
                        "imageNumber": image.image_number,
                        "outputRelativePath": image.output_relative_path,
                        "sourceSrc": image.source_src,
                        "sourceHref": image.source_href,
                        "bytes": image.source_bytes,
                        "missing": image.missing,
                    }
                    for image in (question.images + [image for choice in question.choices for image in choice.images])
                ],
            }
            for question in questions
        ],
    }
    (quiz_dir / "quiz-info.json").write_text(json.dumps(quiz_info, indent=2), encoding="utf-8")


def build_package():
    if not ZIP_PATH.exists():
        raise SystemExit(f"Source ZIP not found: {ZIP_PATH}")
    if PACKAGE_DIR.exists():
        shutil.rmtree(PACKAGE_DIR)
    PACKAGE_DIR.mkdir(parents=True, exist_ok=True)
    QUIZZES_DIR.mkdir(parents=True, exist_ok=True)
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    META_DIR.mkdir(parents=True, exist_ok=True)

    audit: dict[str, Any] = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "sourceZip": str(ZIP_PATH),
        "sourceZipBytes": ZIP_PATH.stat().st_size,
        "quizzes": [],
        "missingImages": [],
        "unreferencedQuizImages": [],
    }

    with zipfile.ZipFile(ZIP_PATH) as zip_file:
        package_names = set(zip_file.namelist())
        (RAW_DIR / "imsmanifest.xml").write_bytes(zip_file.read("imsmanifest.xml"))
        (PACKAGE_DIR / "imsmanifest.xml").write_bytes(zip_file.read("imsmanifest.xml"))
        qti_hrefs = [
            name
            for name in zip_file.namelist()
            if name.startswith("quiz/") and name.lower().endswith(".xml")
        ]

        quiz_index_rows = []
        for quiz_number, qti_href in enumerate(qti_hrefs, start=1):
            qti_bytes = zip_file.read(qti_href)
            root = ET.fromstring(qti_bytes.decode("utf-8-sig"))
            assessment = qti_find(root, ".//q:assessment")
            title = assessment.attrib.get("title", f"Quiz {quiz_number}") if assessment is not None else f"Quiz {quiz_number}"
            folder_name = f"{quiz_number:02d} - {safe_name(title, 90)}"
            quiz_dir = QUIZZES_DIR / folder_name
            quiz_dir.mkdir(parents=True, exist_ok=True)
            qti_filename = "source.qti.xml"
            (quiz_dir / qti_filename).write_bytes(qti_bytes)

            items = qti_findall(root, ".//q:item")
            questions = [
                parse_question(item, qti_href, package_names, question_number)
                for question_number, item in enumerate(items, start=1)
            ]

            used_names: set[str] = set()
            all_refs: list[ImageRef] = []
            for question in questions:
                refs = question.images + [image for choice in question.choices for image in choice.images]
                all_refs.extend(refs)
                for ref in refs:
                    if ref.missing:
                        audit["missingImages"].append(
                            {
                                "quizTitle": title,
                                "questionNumber": question.number,
                                "context": ref.context,
                                "sourceSrc": ref.source_src,
                            }
                        )
                    else:
                        copy_image(zip_file, ref, quiz_dir, used_names)

            quiz_folder = posixpath.dirname(qti_href)
            folder_images = sorted(
                name
                for name in package_names
                if name.startswith(f"{quiz_folder}/") and name.lower().endswith(IMAGE_EXTENSIONS)
            )
            referenced_unique = {ref.source_href for ref in all_refs if ref.source_href}
            unreferenced = [name for name in folder_images if name not in referenced_unique]
            unreferenced_used_names: set[str] = set()
            for source_href in unreferenced:
                output_path, bytes_written = copy_unreferenced_image(
                    zip_file, source_href, quiz_dir, unreferenced_used_names
                )
                audit["unreferencedQuizImages"].append(
                    {
                        "quizTitle": title,
                        "sourceHref": source_href,
                        "outputRelativePath": f"quizzes/{folder_name}/{output_path}",
                        "bytes": bytes_written,
                    }
                )

            quiz_record = {
                "number": quiz_number,
                "title": title,
                "folder": f"quizzes/{folder_name}",
                "sourceQtiHref": qti_href,
                "qtiFile": qti_filename,
                "questionCount": len(questions),
                "referencedImageCount": len(all_refs),
                "uniqueImageCount": len(referenced_unique),
                "sourceFolderImageCount": len(folder_images),
                "unreferencedSourceImageCount": len(unreferenced),
            }
            write_quiz_reports(quiz_record, questions, quiz_dir)
            render_quiz_html(quiz_record, questions, quiz_dir)
            audit["quizzes"].append(quiz_record)
            quiz_index_rows.append(
                {
                    "quizNumber": quiz_number,
                    "title": title,
                    "folder": quiz_record["folder"],
                    "questions": len(questions),
                    "referencedImagePlacements": len(all_refs),
                    "uniqueSourceImages": len(referenced_unique),
                    "sourceFolderImages": len(folder_images),
                    "unreferencedSourceImages": len(unreferenced),
                }
            )

    with (PACKAGE_DIR / "quiz-index.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(quiz_index_rows[0].keys()))
        writer.writeheader()
        writer.writerows(quiz_index_rows)

    index_lines = [
        "# Chemistry 30 Brightspace Quiz Image Package",
        "",
        f"- Generated: {audit['generatedAt']}",
        f"- Source ZIP: `{audit['sourceZip']}`",
        f"- Quizzes: {len(audit['quizzes'])}",
        f"- Total question count: {sum(quiz['questionCount'] for quiz in audit['quizzes'])}",
        f"- Total referenced image placements: {sum(quiz['referencedImageCount'] for quiz in audit['quizzes'])}",
        f"- Total unique source images: {sum(quiz['uniqueImageCount'] for quiz in audit['quizzes'])}",
        "",
        "## Quizzes",
        "",
    ]
    for quiz in audit["quizzes"]:
        index_lines.append(
            f"- `{quiz['folder']}`: {quiz['questionCount']} question(s), "
            f"{quiz['referencedImageCount']} image placement(s), {quiz['uniqueImageCount']} unique image(s)"
        )
    if audit["unreferencedQuizImages"]:
        index_lines.extend(["", "## Unreferenced Source Images", ""])
        for item in audit["unreferencedQuizImages"]:
            index_lines.append(f"- `{item['quizTitle']}`: `{item['sourceHref']}`")
    if audit["missingImages"]:
        index_lines.extend(["", "## Missing Image References", ""])
        for item in audit["missingImages"]:
            index_lines.append(f"- `{item}`")
    (PACKAGE_DIR / "README.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")

    audit["totals"] = {
        "quizCount": len(audit["quizzes"]),
        "questionCount": sum(quiz["questionCount"] for quiz in audit["quizzes"]),
        "referencedImageCount": sum(quiz["referencedImageCount"] for quiz in audit["quizzes"]),
        "uniqueImageCount": sum(quiz["uniqueImageCount"] for quiz in audit["quizzes"]),
        "missingImageCount": len(audit["missingImages"]),
        "unreferencedSourceImageCount": len(audit["unreferencedQuizImages"]),
    }
    (PACKAGE_DIR / "audit.json").write_text(json.dumps(audit, indent=2), encoding="utf-8")
    (META_DIR / "quiz-image-export-audit.json").write_text(json.dumps(audit, indent=2), encoding="utf-8")

    source_note = {
        "sourceZip": str(ZIP_PATH),
        "sourceZipBytes": ZIP_PATH.stat().st_size,
        "sourceZipLastWriteTime": datetime.fromtimestamp(ZIP_PATH.stat().st_mtime).isoformat(timespec="seconds"),
        "rawStorageNote": "The full ZIP is not duplicated in raw/. The generated package includes copied raw QTI files and question-labeled images.",
    }
    (RAW_DIR / "source-package.json").write_text(json.dumps(source_note, indent=2), encoding="utf-8")

    if OUTPUT_ZIP.exists():
        OUTPUT_ZIP.unlink()
    with zipfile.ZipFile(OUTPUT_ZIP, "w", compression=zipfile.ZIP_DEFLATED) as output_zip:
        for file_path in sorted(PACKAGE_DIR.rglob("*")):
            if file_path.is_file():
                arcname = f"chemistry-30-brightspace-quiz-image-package/{file_path.relative_to(PACKAGE_DIR).as_posix()}"
                output_zip.write(file_path, arcname)

    verification = verify_export(audit)
    (META_DIR / "quiz-image-export-verification.json").write_text(
        json.dumps(verification, indent=2), encoding="utf-8"
    )
    if not verification["passed"]:
        raise SystemExit("Quiz image export verification failed.")


def verify_export(audit: dict[str, Any]) -> dict[str, Any]:
    quiz_dirs = sorted((PACKAGE_DIR / "quizzes").glob("*"))
    image_files = sorted((PACKAGE_DIR / "quizzes").glob("*/images/*"))
    unreferenced_files = sorted((PACKAGE_DIR / "quizzes").glob("*/unreferenced-source-images/*"))
    zip_ok = False
    zip_entries = 0
    if OUTPUT_ZIP.exists():
        with zipfile.ZipFile(OUTPUT_ZIP) as z:
            names = z.namelist()
            zip_entries = len(names)
            zip_ok = "chemistry-30-brightspace-quiz-image-package/README.md" in names
    expected_image_copies = audit["totals"]["referencedImageCount"] - audit["totals"]["missingImageCount"]
    return {
        "passed": (
            len(quiz_dirs) == audit["totals"]["quizCount"]
            and len(image_files) == expected_image_copies
            and len(unreferenced_files) == audit["totals"]["unreferencedSourceImageCount"]
            and audit["totals"]["missingImageCount"] == 0
            and OUTPUT_ZIP.exists()
            and zip_ok
        ),
        "quizDirCount": len(quiz_dirs),
        "expectedQuizCount": audit["totals"]["quizCount"],
        "imageFileCount": len(image_files),
        "expectedImageCopies": expected_image_copies,
        "unreferencedImageFileCount": len(unreferenced_files),
        "expectedUnreferencedImageCopies": audit["totals"]["unreferencedSourceImageCount"],
        "missingImageCount": audit["totals"]["missingImageCount"],
        "outputZip": str(OUTPUT_ZIP),
        "outputZipBytes": OUTPUT_ZIP.stat().st_size if OUTPUT_ZIP.exists() else 0,
        "zipEntries": zip_entries,
    }


if __name__ == "__main__":
    build_package()
