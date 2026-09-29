#!/usr/bin/env python3
"""Build local, individual-question crops from verified Chapter 3 PDFs.

Generated PNGs remain private local review assets. The manifest records every
question's printed page and crop so the bank can be regenerated and audited.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / "projects/math10c-unit3-pilot"
WORKSPACE = PROJECT / "workspace"
SOURCE_MAP = PROJECT / "meta/textbook-source-map.json"
OUTPUT = WORKSPACE / "assets/textbook-crops"
MANIFEST = PROJECT / "meta/textbook-question-crops.json"


def nums(start: int, end: int) -> list[int]:
    return list(range(start, end + 1))


# Each column gives question numbers, crop x-bounds, and the x-range in which
# the printed question number must appear. Printed pages are authoritative.
SPECS = [
    ("3.1", "3.1", 140, [(nums(3, 12), 82, 338, 90, 140), (nums(13, 19), 340, 648, 350, 405)]),
    ("3.1", "3.1", 141, [([20], 82, 338, 90, 140), (nums(21, 22), 340, 648, 350, 405)]),
    ("3.2", "3.2", 146, [(nums(4, 5), 82, 338, 90, 140), ([6], 340, 648, 350, 405)]),
    ("3.2", "3.2", 147, [(nums(7, 13), 82, 338, 90, 140), (nums(14, 18), 340, 648, 350, 405)]),
    ("3.3", "3.3", 155, [(nums(4, 8), 82, 338, 90, 140), (nums(9, 14), 340, 648, 350, 405)]),
    ("3.3", "3.3", 156, [(nums(15, 18), 82, 338, 90, 140), (nums(19, 22), 340, 648, 350, 405)]),
    ("3.4", "3.4", 158, [(nums(1, 4), 205, 648, 225, 275)]),
    ("3.5", "3.5", 166, [(nums(4, 6), 82, 338, 90, 140), (nums(7, 11), 340, 648, 350, 405)]),
    ("3.5", "3.5", 167, [(nums(12, 18), 82, 338, 90, 140), (nums(19, 23), 340, 648, 350, 405)]),
    ("3.6", "3.6", 177, [(nums(5, 7), 82, 338, 90, 140), (nums(8, 13), 340, 648, 350, 405)]),
    ("3.6", "3.6", 178, [(nums(14, 18), 82, 338, 90, 140), (nums(19, 23), 340, 648, 350, 405)]),
    ("3.7", "3.7", 186, [(nums(4, 7), 82, 338, 90, 140), (nums(8, 15), 340, 648, 350, 405)]),
    ("3.7", "3.7", 187, [(nums(16, 17), 82, 338, 90, 140), (nums(18, 22), 340, 648, 350, 405)]),
    ("3.8", "3.8", 194, [(nums(4, 8), 82, 338, 90, 140), ([9], 340, 648, 350, 405)]),
    ("3.8", "3.8", 195, [(nums(10, 15), 82, 338, 90, 140), (nums(16, 21), 340, 648, 350, 405)]),
    ("review", "Review", 198, [(nums(1, 6), 82, 338, 90, 140), (nums(7, 10), 340, 648, 350, 410)]),
    ("review", "Review", 199, [(nums(11, 16), 82, 338, 90, 140), (nums(17, 22), 340, 648, 350, 410)]),
    ("review", "Review", 200, [(nums(23, 28), 82, 338, 90, 140), (nums(29, 35), 340, 648, 350, 410)]),
    ("review", "Practice test", 201, [(nums(1, 9), 82, 648, 90, 140)]),
]


def bounded(page, box):
    x0, top, x1, bottom = box
    return (
        max(0, min(x0, page.width - 2)),
        max(0, min(top, page.height - 2)),
        max(2, min(x1, page.width)),
        max(2, min(bottom, page.height)),
    )


def question_token(words, number, anchor_min, anchor_max):
    token = f"{number}."
    matches = [w for w in words if w["text"] == token and anchor_min <= w["x0"] <= anchor_max]
    if len(matches) != 1:
        raise RuntimeError(f"Expected one anchored {token}; found {len(matches)}")
    return matches[0]


def main():
    source = json.loads(SOURCE_MAP.read_text())
    by_printed = {}
    for item in source["items"]:
        for offset in range(item["pdfPages"]):
            by_printed[item["printedStart"] + offset] = (item, offset)

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)
    entries = []
    open_pdfs = {}
    try:
        for section, group, printed, columns in SPECS:
            item, offset = by_printed[printed]
            source_path = WORKSPACE / item["file"]
            pdf = open_pdfs.setdefault(source_path, pdfplumber.open(source_path))
            page = pdf.pages[offset]
            words = page.extract_words(x_tolerance=2, y_tolerance=3)
            reflect = page.search("Reflect", regex=False, case=False)
            page_bottom = reflect[0]["top"] - 12 if reflect else page.height - 45

            for question_numbers, x0, x1, anchor_min, anchor_max in columns:
                starts = [(n, question_token(words, n, anchor_min, anchor_max)) for n in question_numbers]
                for index, (number, start) in enumerate(starts):
                    bottom = starts[index + 1][1]["top"] - 7 if index + 1 < len(starts) else page_bottom
                    box = bounded(page, (x0, start["top"] - 8, x1, bottom))
                    if group == "Practice test":
                        prefix, question_id, label = "test", f"test-q{number}", f"Practice test {number}"
                    elif group == "Review":
                        prefix, question_id, label = "review", f"review-q{number}", f"Review {number}"
                    else:
                        prefix, question_id, label = section.replace(".", "-"), f"q{number}", f"Q{number}"
                    output_rel = f"assets/textbook-crops/{prefix}-q{number}.png"
                    output_path = WORKSPACE / output_rel
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
                            "sourceFile": item["file"],
                            "pdfPage": offset + 1,
                            "crop": [round(value, 2) for value in box],
                        }
                    )
    finally:
        for pdf in open_pdfs.values():
            pdf.close()

    expected = 178
    if len(entries) != expected:
        raise RuntimeError(f"Expected {expected} individual questions; generated {len(entries)}")
    if len({(e["section"], e["questionId"]) for e in entries}) != expected:
        raise RuntimeError("Question IDs are not unique within their practice section")

    MANIFEST.write_text(
        json.dumps(
            {
                "schemaVersion": 2,
                "distributionStatus": "private-local-review-pending-source-approval",
                "generatedBy": "scripts/build-math10c-unit3-question-crops.py",
                "notes": "Each learner choice maps to one cropped textbook question. Checkpoint and study-guide pages remain available only through the full textbook library.",
                "entries": entries,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"Generated {len(entries)} individual question crops in {OUTPUT}")


if __name__ == "__main__":
    main()
