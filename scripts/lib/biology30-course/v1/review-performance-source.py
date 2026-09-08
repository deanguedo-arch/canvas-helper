"""Extract the pinned Biology performance table by its actual PDF columns.

This is an authoring reference register, not a curriculum-completeness assertion.
The rendered source columns were inspected separately; examples are neither
prescriptive nor exhaustive. Knowledge-row labels are context, not skill mappings.
"""
import hashlib
import json
from pathlib import Path
import re
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[4]
BASE = ROOT / "projects/resources/biology30-production/v1/pilot2"
PDF = BASE / "authority/performance.pdf"
SHA = "72773dbdd42b1c9a778ebf33a70d471e89b621c3c4026e7ca4622ae6542ef794"


def extract():
    if hashlib.sha256(PDF.read_bytes()).hexdigest() != SHA:
        raise ValueError("Performance source drift; inspect new columns before extraction")
    records = []
    for number, page in enumerate(PdfReader(PDF).pages, 1):
        if number < 11:
            continue
        runs = []
        page.extract_text(visitor_text=lambda text, cm, tm, font, size:
            runs.append((tm[4], tm[5], text)) if text.strip() else None)
        row, current = None, None
        def flush():
            if current and current["text"].strip():
                current["text"] = re.sub(r"\s+", " ", current["text"]).strip()
                current["referencedOutcomeIds"] = sorted(set(re.findall(r"[BCD][123]\.\d+(?:sts|[ks])", current["text"])))
                records.append(current.copy())
        for x, y, text in runs:
            stripped = text.strip()
            if re.fullmatch(r"[BCD][123]\.\dk", stripped) and x < 110:
                flush()
                current = None
                row = stripped
            elif stripped == "•":
                flush()
                current = {"physicalPage": number, "printedPage": number-4,
                    "nearestPrecedingPrintedKnowledgeLabel": row, "column": None,
                    "firstTextCoordinates": None, "text": ""}
            elif current and 65 < y < 680 and x >= 120:
                if current["column"] is None:
                    current["column"] = "acceptable-example" if x < 325 else "excellence-example"
                    current["firstTextCoordinates"] = {"x": round(x, 2), "y": round(y, 2)}
                current["text"] += text
        flush()
    for index, record in enumerate(records, 1):
        record["id"] = f"performance-bcd-{index:03}"
        record["mandatoryByItself"] = False
        record["curriculumBindingStatus"] = "pending-atomic-review"
    return records


if __name__ == "__main__":
    records = extract()
    result = {"schemaVersion": 1, "sourceSha256": SHA,
        "source": str(PDF.relative_to(ROOT)), "status": "columns-reviewed-atomic-bindings-pending",
        "sourceColumnReview": {"physicalPagesOpened": list(range(11, 30)), "checkedDate": "2026-09-06",
            "scope": "Both actual columns inspected in rendered source pages; not full-course academic clearance.",
            "criticalDistinctions": [
                "B1.3k tissue/gamete identification examples occupy the excellence column; the underlying B1.3k curriculum outcome still requires teaching.",
                "B2 hormone graph construction/analysis appears in excellence examples; graph skills may independently be required by Program of Studies skill outcomes.",
                "C1.2k photo-based phase interpretation and relative-duration calculations are excellence examples; simulation and model karyotypes also appear in acceptable examples.",
                "C3.5k transformation has an excellence example and an empty acceptable cell; the Program of Studies outcome is still required.",
                "The D1.4k row appears beneath a D2 heading on printed page 23; use the printed row ID and Program of Studies, not the heading alone.",
                "D3.2k distinguishes growth rate delta N/delta t from per-capita change delta N/N across a specified interval; do not conflate the two units.",
                "Source C3.3k wording uses coding strand and tRNA codons imprecisely; teach template versus coding orientation and tRNA anticodons explicitly."]},
        "interpretation": "Examples are neither prescriptive nor exhaustive. Do not reclassify excellence as acceptable or demote a mandatory curriculum outcome because its acceptable cell is empty. Independent online evidence does not certify physical laboratory work or collaboration.",
        "records": records}
    (BASE / "authority/performance-column-register.json").write_text(json.dumps(result, ensure_ascii=False, indent=2)+"\n")
    from collections import Counter
    print(dict(Counter(record["column"] for record in records)))
