#!/usr/bin/env python3
"""Build question-level Science 24 textbook practice data and image crops.

The original page catalog remains frozen in each generated overlay so existing
page-level saved work can still be shown in All My Work. Current practice uses
new, question-specific IDs and bounded source crops.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path

import pdfplumber
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
UNITS = "abcd"
HEADINGS = (
    "What Did You Find Out",
    "Solve These",
    "Check Your Understanding",
    "Reading Check",
)
SCALE = 2.4


@dataclass
class Line:
    text: str
    top: float
    bottom: float
    x0: float
    x1: float
    words: list[dict]


def load_pages(unit: str) -> list[dict]:
    workspace = ROOT / f"projects/science24-unit-{unit}/workspace"
    json_path = workspace / "course-data.json"
    if json_path.exists():
        return json.loads(json_path.read_text())["bookQuestions"]
    command = (
        "global.window={};require('./projects/science24-unit-a/workspace/course-data.js');"
        "process.stdout.write(JSON.stringify(window.S24_DATA.bookQuestions));"
    )
    result = subprocess.run(
        ["node", "-e", command], cwd=ROOT, check=True, capture_output=True, text=True
    )
    return json.loads(result.stdout)


def page_words(page) -> list[dict]:
    return page.extract_words(
        use_text_flow=False, keep_blank_chars=False, extra_attrs=["size"]
    )


def page_lines(page) -> list[Line]:
    words = page_words(page)
    buckets: list[list[dict]] = []
    for word in sorted(words, key=lambda x: (round(x["top"], 1), x["x0"])):
        for bucket in reversed(buckets[-4:]):
            if abs(bucket[0]["top"] - word["top"]) <= 2.4:
                bucket.append(word)
                break
        else:
            buckets.append([word])
    lines = []
    for bucket in buckets:
        bucket.sort(key=lambda x: x["x0"])
        lines.append(
            Line(
                text=" ".join(word["text"] for word in bucket),
                top=min(word["top"] for word in bucket),
                bottom=max(word["bottom"] for word in bucket),
                x0=min(word["x0"] for word in bucket),
                x1=max(word["x1"] for word in bucket),
                words=bucket,
            )
        )
    return sorted(lines, key=lambda x: (x.top, x.x0))


def normalized(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def heading_marker(line: Line) -> tuple[str, Line] | None:
    tokens = [normalized(word["text"]) for word in line.words]
    for heading in HEADINGS:
        target = normalized(heading).split()
        for index in range(0, len(tokens) - len(target) + 1):
            if tokens[index : index + len(target)] == target:
                words = line.words[index : index + len(target)]
                return heading, Line(
                    text=heading,
                    top=min(word["top"] for word in words),
                    bottom=max(word["bottom"] for word in words),
                    x0=min(word["x0"] for word in words),
                    x1=max(word["x1"] for word in words),
                    words=words,
                )
    return None


def number_from_word(word: dict) -> int | None:
    match = re.match(r"^(\d{1,2})[.)]$", word["text"])
    if not match:
        return None
    return int(match.group(1))


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def question_right_edge(page, question: dict) -> float:
    """Stop a left-column question before an adjacent glossary/sidebar."""
    if question["x0"] >= page.width * 0.5:
        return page.width
    row = sorted(
        (
            word
            for word in page_words(page)
            if abs(word["top"] - question["top"]) <= 3
            and word["x0"] >= question["x0"] - 10
        ),
        key=lambda word: word["x0"],
    )
    for left, right in zip(row, row[1:]):
        gap = right["x0"] - left["x1"]
        if gap >= 22 and right["x0"] >= page.width * 0.70:
            return (left["x1"] + right["x0"]) / 2
    return page.width


def image_box(page, question: dict, next_top: float, sx: float, sy: float) -> tuple[int, int, int, int]:
    right_edge = question_right_edge(page, question)
    words = [
        word
        for word in page_words(page)
        if question["top"] - 2 <= word["top"] < next_top
        and word["x0"] >= question["x0"] - 10
        and word["x0"] < right_edge
        and word["bottom"] < page.height - 28
    ]
    if not words:
        raise RuntimeError(f"No source words for question at y={question['top']}")
    # Question areas are usually full-width. Tight vertical bounds stop the
    # reader from seeing a complete page while keeping diagrams and tables that
    # share the question's band.
    x0 = max(0, question["x0"] - 14)
    x1 = min(page.width, right_edge, max(word["x1"] for word in words) + 18)
    y0 = max(question["top"] - 7, 0)
    y1 = min(page.height, next_top - 12, max(word["bottom"] for word in words) + 3)
    if y1 - y0 < 34:
        y1 = min(page.height, y0 + 34)
    crop_x0, crop_y0, _, _ = page.cropbox
    return (
        round((x0 - crop_x0) * sx),
        round((y0 - crop_y0) * sy),
        round((x1 - crop_x0) * sx),
        round((y1 - crop_y0) * sy),
    )


def question_text(page, question: dict, next_top: float) -> str:
    right_edge = question_right_edge(page, question)
    words = [
        word
        for word in page_words(page)
        if question["top"] - 2 <= word["top"] < next_top
        and word["x0"] >= question["x0"] - 10
        and word["x0"] < right_edge
        and word["bottom"] < page.height - 28
    ]
    words.sort(key=lambda word: (round(word["top"], 1), word["x0"]))
    return re.sub(r"\s+", " ", " ".join(word["text"] for word in words)).strip()


def build_unit(unit: str) -> list[dict]:
    project = ROOT / f"projects/science24-unit-{unit}"
    workspace = project / "workspace"
    pdf_name = "science24-unit-a-textbook.pdf" if unit == "a" else "textbook.pdf"
    pdf_path = workspace / "assets" / pdf_name
    page_records = load_pages(unit)
    output_dir = workspace / "assets" / "textbook-practice"
    output_dir.mkdir(parents=True, exist_ok=True)
    for old in output_dir.glob("*.png"):
        old.unlink()

    manifest: list[dict] = []
    with pdfplumber.open(pdf_path) as pdf:
        for source in page_records:
            page = pdf.pages[source["physicalPage"] - 1]
            lines = page_lines(page)
            headings = []
            for index, line in enumerate(lines):
                marker = heading_marker(line)
                if marker:
                    group, bounded = marker
                    headings.append((index, bounded, group))
            if not headings:
                continue
            rendered = page.to_image(resolution=72 * SCALE, antialias=True).original.convert("RGB")
            crop_x0, crop_y0, crop_x1, crop_y1 = page.cropbox
            sx, sy = rendered.width / (crop_x1 - crop_x0), rendered.height / (crop_y1 - crop_y0)
            for heading_index, (line_index, heading, group) in enumerate(headings):
                section_end = headings[heading_index + 1][1].top if heading_index + 1 < len(headings) else page.height - 22
                anchors = []
                for word in page_words(page):
                    if word["top"] <= heading.bottom or word["top"] >= section_end:
                        continue
                    number = number_from_word(word)
                    if number is not None and abs(word["x0"] - heading.x0) <= 65:
                        anchors.append((word, number))
                anchors.sort(key=lambda item: (item[0]["top"], item[0]["x0"]))
                # Repeated step numbering or OCR noise can create a non-monotonic
                # sequence. Keep the first occurrence of each printed question.
                unique = []
                seen = set()
                for word, number in anchors:
                    if number in seen:
                        continue
                    seen.add(number)
                    unique.append((word, number))
                for index, (anchor, number) in enumerate(unique):
                    if index + 1 < len(unique):
                        next_top = unique[index + 1][0]["top"]
                    else:
                        major = [
                            word["top"]
                            for word in page_words(page)
                            if word["top"] > anchor["top"] + 12
                            and word["top"] < section_end
                            and float(word.get("size", 0)) >= 16
                        ]
                        next_top = min([section_end, anchor["top"] + 150, *major])
                    box = image_box(page, anchor, next_top, sx, sy)
                    text = question_text(page, anchor, next_top)
                    filename = f"s24-{unit}-p{source['printedPage']}-{slug(group)}-q{number}.png"
                    cropped = rendered.crop(box)
                    stored_box = list(box)
                    if index + 1 < len(unique) and cropped.height > 36:
                        cropped = cropped.crop((0, 0, cropped.width, cropped.height - 12))
                        stored_box[3] -= 12
                    cropped.save(output_dir / filename, optimize=True)
                    manifest.append(
                        {
                            "id": f"s24-{unit}-textbook-p{source['printedPage']}-{slug(group)}-q{number}",
                            "title": f"{group} · p. {source['printedPage']} · question {number}",
                            "prompt": text,
                            "resourceId": source["resourceId"],
                            "printedPage": source["printedPage"],
                            "physicalPage": source["physicalPage"],
                            "topic": source["topic"],
                            "questionNumber": str(number),
                            "group": group,
                            "image": f"assets/textbook-practice/{filename}",
                            "fullPageImage": source["image"],
                            "originalText": text,
                            "legacyPageId": source["id"],
                            "cropBoxPixels": stored_box,
                            "disposition": "original-question-written-work",
                        }
                    )

    meta_dir = project / "meta"
    meta_dir.mkdir(exist_ok=True)
    (meta_dir / "textbook-question-manifest.json").write_text(
        json.dumps({"schemaVersion": 1, "unit": unit.upper(), "questions": manifest}, indent=2) + "\n"
    )
    overlay = (
        "/* Generated by scripts/build-science24-textbook-practice.py. */\n"
        "(()=>{const D=window.S24_DATA;if(!D)return;"
        "D.legacyBookQuestions=Array.isArray(D.bookQuestions)?D.bookQuestions.slice():[];"
        f"D.bookQuestions={json.dumps(manifest, ensure_ascii=False, separators=(',', ':'))};"
        "})();\n"
    )
    (workspace / "textbook-practice-data.js").write_text(overlay)
    ensure_load_order(workspace, unit)
    build_contact_sheets(project, manifest)
    return manifest


def ensure_load_order(workspace: Path, unit: str) -> None:
    index_path = workspace / "index.html"
    source = index_path.read_text()
    if 'src="textbook-practice-data.js"' not in source:
        source = source.replace(
            '<script src="course-data.js"></script>',
            '<script src="course-data.js"></script><script src="textbook-practice-data.js"></script>',
            1,
        )
    if '<link href="textbook-practice.css" rel="stylesheet">' not in source:
        marker = f'<link href="unit-{unit}.css'
        start = source.index(marker)
        end = source.index('>', start) + 1
        source = source[:end] + '<link href="textbook-practice.css" rel="stylesheet">' + source[end:]
    index_path.write_text(source)


def build_contact_sheets(project: Path, manifest: list[dict]) -> None:
    review_dir = project / "meta" / "textbook-practice-review"
    review_dir.mkdir(parents=True, exist_ok=True)
    for old in review_dir.glob("contact-*.png"):
        old.unlink()
    width, cell_w, cell_h = 1500, 720, 340
    font = ImageFont.load_default()
    for sheet_index in range(0, len(manifest), 8):
        subset = manifest[sheet_index : sheet_index + 8]
        canvas = Image.new("RGB", (width, 4 * cell_h), "white")
        draw = ImageDraw.Draw(canvas)
        for local, item in enumerate(subset):
            row, col = divmod(local, 2)
            left, top = 20 + col * 740, row * cell_h + 20
            source = project / "workspace" / item["image"]
            crop = Image.open(source).convert("RGB")
            crop.thumbnail((cell_w, 270))
            canvas.paste(crop, (left, top + 36))
            draw.text((left, top), item["title"], fill="black", font=font)
        number = sheet_index // 8 + 1
        canvas.save(review_dir / f"contact-{number:02}.png", optimize=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build question-level Science 24 textbook practice crops."
    )
    parser.add_argument(
        "--project",
        choices=[f"science24-unit-{unit}" for unit in UNITS],
        help="Build one Science 24 unit. Omit to rebuild A-D.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    units = args.project.rsplit("-", 1)[-1] if args.project else UNITS
    totals = {}
    for unit in units:
        records = build_unit(unit)
        if not records:
            raise SystemExit(f"Unit {unit.upper()} produced no question records")
        totals[unit.upper()] = len(records)
    print(json.dumps(totals, indent=2))


if __name__ == "__main__":
    main()
