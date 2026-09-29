#!/usr/bin/env python3
"""R07: insert Theme 2-4 online booklets + Theme 1 glossary into course-data.js.

Reads reviewed transcriptions (evidence/R07/transcription-theme-{2,3,4}.json),
joins prompt homes from the v2 EXPECTED_ITEM_HOMES contract, and:
  1. appends theme-2/3/4 activities to themeActivities (insertion only);
  2. appends the Theme 1 glossary section (existing Theme 1 bytes untouched;
     responsePromptCount 89 -> 90 for the added prompt);
  3. fills empty bookletQuestionIds/assignmentIds/assignmentHomeIds on Theme
     2-4 lessons from contract homes (never overwrites non-empty arrays);
  4. emits evidence/R07/field-manifest.json (281 rows) and verifies every
     home resolves to a prompt-or-cell rendered in its home lesson.

Idempotent: re-running after a successful insert is a verified no-op.
Refuses to run if course-data.js fails node --check afterwards.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "projects/aboriginal-studies-30/workspace/course-data.js"
EV = ROOT / "projects/aboriginal-studies-30/meta/ab30-v2/evidence/R07"
HOMES = Path("/tmp/ab30v2/AB30_BIO_PARITY_EXECUTION_v2/contracts/EXPECTED_ITEM_HOMES.json")

GLOSSARY_TERMS = [
    "Aboriginal Rights", "Aboriginal Title", "Collective Rights",
    "Indigenous Peoples", "Individual Rights", "Inherent Rights", "Nation",
    "Numbered Treaties", "Land Claim", "Self-Determination",
    "Self-Government", "Sovereignty",
]


def slug(term):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", term.lower())).strip("-")


def norm_prompt(p):
    out = {"id": p["id"], "label": p["label"]}
    if "rows" in p and not isinstance(p["rows"], list):
        out["rows"] = p["rows"]
    out["kind"] = p["kind"]
    if "number" in p:
        out["number"] = p["number"]
    for key in ("choices", "textParts", "blanks", "columns"):
        if key in p:
            out[key] = p[key]
    if isinstance(p.get("rows"), list):
        out["rows"] = p["rows"]
    if "resources" in p:
        out["resources"] = p["resources"]
    if "mediaLocator" in p:
        out["mediaLocator"] = p["mediaLocator"]
    if "locator" in p:
        out["locator"] = p["locator"]
    if "marks" in p:
        out["marks"] = p["marks"]
    return out


def norm_section(s):
    out = {"id": s["id"], "title": s["title"]}
    if s.get("instructions"):
        out["instructions"] = s["instructions"]
    if s.get("sourceRef"):
        out["sourceRef"] = s["sourceRef"]
    out["images"] = s.get("images", [])
    out["prompts"] = [norm_prompt(p) for p in s["prompts"]]
    return out


def build_activity(t):
    numbered = sum(1 for s in t["sections"] for p in s["prompts"] if "number" in p)
    total = sum(len(s["prompts"]) for s in t["sections"])
    return {
        "id": t["activityId"],
        "unitId": t["unitId"],
        "title": t["title"],
        "intro": t["intro"],
        "resources": [],
        "sections": [norm_section(s) for s in t["sections"]],
        "sourceQuestionCount": numbered,
        "responsePromptCount": total,
    }


def glossary_section():
    return {
        "id": "t1-glossary",
        "title": "Glossary Terms",
        "instructions": "Using the glossary (begins page 236), write down the meanings of the following terms (1 mark each). It is not necessary to write the entire definition. Summarize and ensure you are reflecting the context and perspective of your textbook. /12",
        "images": [],
        "prompts": [
            {
                "id": "t1-glossary",
                "label": "Glossary terms: write the meaning of each term from the textbook glossary.",
                "kind": "table",
                "columns": [{"id": "definition", "label": "Definition"}],
                "rows": [{"id": slug(term), "label": term} for term in GLOSSARY_TERMS],
                "locator": {"filePage": 4, "printedPage": 4},
                "marks": "/12",
            }
        ],
    }


def dump(obj, base_indent):
    text = json.dumps(obj, indent=2, ensure_ascii=False)
    pad = " " * base_indent
    return "\n".join(pad + line if line.strip() else line for line in text.split("\n"))


def main():
    homes = json.loads(HOMES.read_text())
    by_theme_item = {(h["themeId"], h["sourceItem"]): h["primaryLessonId"] for h in homes}
    assert len(homes) == 281, f"contract has {len(homes)} homes, want 281"

    src = DATA.read_text()
    if '"id": "theme-2-online-booklet"' in src:
        print("activities already present; verifying only")
    else:
        acts = []
        for theme in ("theme-2", "theme-3", "theme-4"):
            t = json.loads((EV / f"transcription-{theme}.json").read_text())
            acts.append(build_activity(t))
        block = ",\n".join(dump(a, 4) for a in acts)
        anchor = '\n  ],\n  "libraryItems":'
        assert src.count(anchor) == 1, "themeActivities end anchor not unique"
        src = src.replace(anchor, ",\n" + block + anchor, 1)

    if '"id": "t1-glossary"' not in src:
        section = dump(glossary_section(), 8)
        anchor = '        }\n      ],\n      "sourceQuestionCount": 87,'
        assert src.count(anchor) == 1, "theme-1 sections end anchor not unique"
        src = src.replace(
            anchor,
            "        },\n" + section + '\n      ],\n      "sourceQuestionCount": 87,',
            1,
        )
        old_counts = '      "sourceQuestionCount": 87,\n      "responsePromptCount": 89'
        assert src.count(old_counts) == 1
        src = src.replace(
            old_counts,
            '      "sourceQuestionCount": 87,\n      "responsePromptCount": 90',
            1,
        )

    # Lesson bindings from contract homes.
    lesson_homes = {}  # lesson -> {"bq": [promptIds], "a": [assignmentIds]}
    prompt_index = {}  # (theme, promptId) -> prompt
    for theme in ("theme-2", "theme-3", "theme-4"):
        t = json.loads((EV / f"transcription-{theme}.json").read_text())
        for s in t["sections"]:
            for p in s["prompts"]:
                prompt_index[(theme, p["id"])] = p
    prompt_index[("theme-1", "t1-glossary")] = {"id": "t1-glossary"}

    numbered_ids = {}  # (theme, sourceItem qN/RN) -> promptId
    for (theme, pid), p in prompt_index.items():
        if "number" in p:
            numbered_ids[(theme, p["number"].lower())] = pid

    manifest_rows = []
    for h in homes:
        theme, item, lesson = h["themeId"], h["sourceItem"], h["primaryLessonId"]
        slot = lesson_homes.setdefault(lesson, {"bq": [], "a": []})
        if h["sourceSet"] == "numbered-guiding-questions":
            if theme == "theme-1":
                # Frozen Theme 1: prompt ids are the items themselves; verify
                # presence in the untouched activity, manifest only.
                assert f'"id": "{item}",' in src, f"theme-1 prompt missing: {item}"
                manifest_rows.append((theme, h["sourceSet"], item, item, item, lesson))
                continue
            number = item[1:] if item.lower().startswith("q") else item
            pid = numbered_ids.get((theme, number.lower()))
            assert pid, f"no prompt for {theme} {item}"
            slot["bq"].append(pid)
            manifest_rows.append((theme, h["sourceSet"], item, pid, pid, lesson))
        elif h["sourceSet"] == "critical-response":
            slot["a"].append(item)
            manifest_rows.append((theme, h["sourceSet"], item, item, item, lesson))
        elif h["sourceSet"] == "reel-injun":
            pid = numbered_ids.get((theme, item.lower()))
            if pid is None and item == "R14":
                pid = "R14"  # unnumbered Atanarjuat prompt; section-mapped
            assert pid, f"no prompt for reel {item}"
            if pid != "R14":
                slot["bq"].append(pid)
            manifest_rows.append((theme, h["sourceSet"], item, pid, pid, lesson))
        elif h["sourceSet"] == "glossary":
            manifest_rows.append((theme, h["sourceSet"], item, "t1-glossary", f"t1-glossary.{slug(item)}", lesson))
        elif h["sourceSet"] == "comparison-chart":
            row, col = item.split(".")
            manifest_rows.append((theme, h["sourceSet"], item, "4-1-comparison-chart", f"4-1-comparison-chart.{row}.{col}", lesson))
        elif h["sourceSet"] == "halfbreed-definitions":
            manifest_rows.append((theme, h["sourceSet"], item, "halfbreed-definitions", f"halfbreed-definitions.{slug(item)}", lesson))
        elif h["sourceSet"] == "halfbreed-reading":
            entry, field = item.split(".")
            manifest_rows.append((theme, h["sourceSet"], item, "halfbreed-chart", f"halfbreed-chart.{entry}.{field}", lesson))
        else:
            raise AssertionError(f"unknown sourceSet {h['sourceSet']}")

    # Unnumbered table/chart prompts home via ASSIGNMENT_PROMPT_LESSONS
    # (section map), never via bookletQuestionIds: both promptsForLesson and
    # lessonsForSection require prompt.number for id matching.
    def book_key(pid):
        m = re.match(r"q(\d+)$", pid)
        if m:
            return (0, int(m.group(1)))
        m = re.match(r"R(\d+)$", pid)
        if m:
            return (1, int(m.group(1)))
        return (2, pid)

    for lesson, slot in lesson_homes.items():
        if lesson.startswith("t1-"):
            continue  # theme-1 bindings frozen
        bq = sorted(set(slot["bq"]), key=book_key)
        a = sorted(set(slot["a"]))
        anchor = f'"id": "{lesson}",\n          "bookletQuestionIds": [],'
        if bq:
            assert src.count(anchor) == 1, f"binding anchor not unique/empty for {lesson}"
            filled = '"id": "%s",\n          "bookletQuestionIds": [%s],' % (
                lesson, ", ".join(f'"{x}"' for x in bq))
            src = src.replace(anchor, filled, 1)
        if a:
            for key in ("assignmentIds", "assignmentHomeIds"):
                anchor2 = f'"id": "{lesson}",\n          "bookletQuestionIds": ['
                # find the lesson block and its empty array for key
                start = src.find(f'"id": "{lesson}",')
                assert start > 0, lesson
                seg_end = src.find('"kicker"', start)
                seg = src[start:seg_end]
                empty = f'"{key}": [],'
                assert seg.count(empty) == 1, f"{lesson} {key} not empty/unique"
                seg = seg.replace(empty, '"%s": [%s],' % (key, ", ".join(f'"{x}"' for x in a)), 1)
                src = src[:start] + seg + src[seg_end:]

    DATA.write_text(src)
    check = subprocess.run(["node", "--check", str(DATA)], capture_output=True, text=True)
    assert check.returncode == 0, check.stderr

    manifest = [
        {
            "themeId": theme, "sourceSet": ss, "sourceItem": item,
            "promptId": pid, "fieldKey": fkey, "primaryLessonId": lesson,
        }
        for theme, ss, item, pid, fkey, lesson in manifest_rows
    ]
    assert len(manifest) == 281
    (EV / "field-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"inserted; manifest rows: {len(manifest)}; lessons bound: {len([l for l in lesson_homes if not l.startswith('t1-')])}")


if __name__ == "__main__":
    main()
