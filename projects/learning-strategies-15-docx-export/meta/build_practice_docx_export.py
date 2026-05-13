from __future__ import annotations

import importlib.util
import json
import os
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[3]
PROJECT_ROOT = REPO_ROOT / "projects" / "learning-strategies-15-docx-export"
SOCIAL_BUILDER_PATH = (
    REPO_ROOT / "projects" / "social-studies-10-1-docx-export" / "meta" / "build_unit1_docx_export.py"
)
SOURCE_ZIP_NAME = "D2LCCExport_149766_25-26 _ S1 _ Learning Strategies 15 (2018) _ Per 1_202651252.zip"
PRACTICE_UNIT_TITLES = [
    "Module 1: Understanding Self as Learner",
    "Module 2: Goal Setting and Organization",
    "Module 3: The Learning Process and Assessment",
]


def first_existing_path(env_var: str, candidates: list[Path]) -> Path:
    override = os.environ.get(env_var)
    paths = ([Path(override)] if override else []) + candidates
    for path in paths:
        if path.exists():
            return path
    return paths[0]


ZIP_PATH = first_existing_path(
    "LS15_SOURCE_ZIP",
    [
        Path.home() / "Downloads" / SOURCE_ZIP_NAME,
        Path("/Users/deanguedo/Downloads") / SOURCE_ZIP_NAME,
    ],
)
META_DIR = PROJECT_ROOT / "meta"
EXPORT_DIR = PROJECT_ROOT / "exports"
DOCX_DIR = EXPORT_DIR / "practice-docx"
SUPPORT_DIR = EXPORT_DIR / "practice-supporting-files"
QA_DIR = EXPORT_DIR / "practice-qa"


def load_social_builder() -> Any:
    spec = importlib.util.spec_from_file_location("social_docx_builder", SOCIAL_BUILDER_PATH)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Unable to load Social Studies DOCX builder: {SOCIAL_BUILDER_PATH}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    module.PROJECT_ROOT = PROJECT_ROOT
    module.ZIP_PATH = ZIP_PATH
    module.META_DIR = META_DIR
    module.EXPORT_DIR = EXPORT_DIR
    module.DOCX_DIR = DOCX_DIR
    module.SUPPORT_DIR = SUPPORT_DIR
    module.QA_DIR = QA_DIR
    module.UNIT_TITLE = PRACTICE_UNIT_TITLES[0]
    module.STYLE_REFERENCE_ZIP = Path("")
    module.SITE_HEADER_WIDTH_IN = 7.15
    module.SITE_FULL_IMAGE_WIDTH_IN = 7.0
    return module


class LearningStrategiesPracticeExporter:
    def __init__(self, renderer_module: Any, zip_file: zipfile.ZipFile, manifest_root: ET.Element):
        self.renderer_module = renderer_module
        self.inner = renderer_module.UnitOneDocxExporter(zip_file, manifest_root)
        self.inner.audit["courseTitle"] = "Learning Strategies 15"
        self.inner.audit["unitTitle"] = "Learning Strategies 15 practice content modules"
        self.inner.audit["practiceUnitTitles"] = PRACTICE_UNIT_TITLES
        self.inner.audit["docxStylePreset"] = "brightspace_google_docs_handoff_practice"
        self.inner.audit["notes"] = [
            "Practice export for testing Social Studies DOCX media/image logic on Learning Strategies 15.",
            "Missing image references are audit-only and are not printed into learner-facing DOCX body text.",
            "Embedded media, when present, uses a hyperlinked preview image plus a visible raw public URL line for Google Docs import testing.",
            "This ZIP has no packaged image files, so source-package image fidelity is limited.",
        ]

    def __getattr__(self, name: str) -> Any:
        return getattr(self.inner, name)

    def build(self) -> list[Path]:
        self.prepare_outputs()
        outputs: list[Path] = []
        output_records: list[dict[str, Any]] = []
        for index, unit_title in enumerate(PRACTICE_UNIT_TITLES, start=1):
            unit = self.find_unit_by_title(unit_title)
            document = self.new_document()
            children = self.renderer_module.item_children(unit)
            for child_index, child in enumerate(children):
                self.render_manifest_item(document, child, root=unit, depth=1)
                if child_index < len(children) - 1:
                    document.add_page_break()

            output_path = self.available_output_path(
                DOCX_DIR / f"{index:02d} - {self.renderer_module.safe_name(unit_title)} - practice.docx"
            )
            document.save(output_path)
            outputs.append(output_path)
            output_records.append(
                {
                    "unitTitle": unit_title,
                    "outputPath": self.renderer_module.rel_posix(output_path, PROJECT_ROOT),
                    "outputBytes": output_path.stat().st_size,
                }
            )
        self.inner.audit["outputPath"] = output_records[0]["outputPath"] if output_records else ""
        self.inner.audit["outputs"] = output_records
        self.inner.audit["outputBytes"] = sum(record["outputBytes"] for record in output_records)
        self.write_indexes()
        self.verify_output(outputs)
        self.write_audit_markdown()
        return outputs

    def find_unit_by_title(self, wanted_title: str) -> ET.Element:
        wanted = self.renderer_module.normalize_key(wanted_title)
        for item in self.top_level_modules():
            if self.renderer_module.normalize_key(self.renderer_module.item_title(item)) == wanted:
                return item
        raise SystemExit(f"Could not find practice module in imsmanifest.xml: {wanted_title}")

    def verify_output(self, output_paths: list[Path]) -> None:
        verification: dict[str, Any] = {
            "docxPaths": [self.renderer_module.rel_posix(path, PROJECT_ROOT) for path in output_paths],
            "docxBytes": sum(path.stat().st_size for path in output_paths),
            "validDocxZipCount": 0,
            "documentXmlPresentCount": 0,
            "includedItems": len(self.inner.audit["includedItems"]),
            "embeddedImages": self.inner.audit["embeddedImages"],
            "mediaReferences": len(self.inner.audit["mediaReferences"]),
            "supportFileCount": len(self.inner.audit["supportFiles"]),
            "passed": False,
        }
        word_media_files = 0
        errors = []
        for output_path in output_paths:
            try:
                with zipfile.ZipFile(output_path) as docx_zip:
                    verification["validDocxZipCount"] += 1
                    doc_xml = docx_zip.getinfo("word/document.xml")
                    if doc_xml.file_size > 0:
                        verification["documentXmlPresentCount"] += 1
                    word_media_files += len(
                        [name for name in docx_zip.namelist() if name.startswith("word/media/")]
                    )
            except Exception as exc:
                errors.append({"path": str(output_path), "error": str(exc)})
        verification["wordMediaFiles"] = word_media_files
        if errors:
            verification["errors"] = errors
        verification["passed"] = bool(
            len(output_paths) == len(PRACTICE_UNIT_TITLES)
            and verification["validDocxZipCount"] == len(output_paths)
            and verification["documentXmlPresentCount"] == len(output_paths)
            and verification["includedItems"] >= 1
        )
        self.inner.audit["verification"] = verification
        (META_DIR / "practice-docx-export-verification.json").write_text(
            json.dumps(verification, indent=2), encoding="utf-8"
        )
        (META_DIR / "practice-docx-export-audit.json").write_text(
            json.dumps(self.inner.audit, indent=2), encoding="utf-8"
        )
        if not verification["passed"]:
            raise SystemExit("DOCX verification failed. See meta/practice-docx-export-verification.json")

    def write_indexes(self) -> None:
        structure = [self.structure_record(self.find_unit_by_title(title)) for title in PRACTICE_UNIT_TITLES]
        (META_DIR / "practice-conversion-map.json").write_text(
            json.dumps(
                {
                    "unitTitles": PRACTICE_UNIT_TITLES,
                    "sourceZip": str(ZIP_PATH),
                    "structure": structure,
                },
                indent=2,
            ),
            encoding="utf-8",
        )

    def write_audit_markdown(self) -> None:
        lines = [
            "# Learning Strategies 15 Practice DOCX Export Audit",
            "",
            f"- Generated: {datetime.now().isoformat(timespec='seconds')}",
            f"- Source ZIP: `{ZIP_PATH}`",
            f"- Practice units: `{', '.join(PRACTICE_UNIT_TITLES)}`",
            f"- Outputs: {len(self.inner.audit.get('outputs', []))}",
            f"- Included Brightspace items: {len(self.inner.audit['includedItems'])}",
            f"- Embedded package images: {self.inner.audit['embeddedImages']}",
            f"- Media references: {len(self.inner.audit['mediaReferences'])}",
            f"- Unresolved assets: {len(self.inner.audit['unresolvedAssets'])}",
            "",
            "## Brightspace Item Order",
            "",
        ]
        for item in self.inner.audit["includedItems"]:
            files = ", ".join(item.get("files") or [])
            lines.append(f"- `{item['title']}`{f' -> `{files}`' if files else ''}")
        if self.inner.audit["mediaReferences"]:
            lines.extend(["", "## Embedded Media Handoff Links", ""])
            for media in self.inner.audit["mediaReferences"]:
                lines.append(
                    f"- `{media['sourceTitle']}`: {media['title']} -> {media.get('handoffUrl') or media['src']}"
                )
        if self.inner.audit["unresolvedAssets"]:
            lines.extend(["", "## Audit-Only Missing/Fallback Items", ""])
            for asset in self.inner.audit["unresolvedAssets"][:40]:
                lines.append(f"- `{asset}`")
        lines.append("")
        (META_DIR / "practice-docx-export-audit.md").write_text("\n".join(lines), encoding="utf-8")


def write_project_metadata() -> None:
    metadata = {
        "migrationState": "legacy",
        "projectType": "conversion",
        "preferredWorkflows": ["conversion"],
        "canonicalEntry": "meta/build_practice_docx_export.py",
        "canonicalSources": ["meta/build_practice_docx_export.py"],
        "authoringStatus": "active",
        "exportTargets": ["docx"],
        "generatedOutputs": [
            "exports/practice-docx/01 - Module 1 Understanding Self as Learner - practice.docx",
            "exports/practice-docx/02 - Module 2 Goal Setting and Organization - practice.docx",
            "exports/practice-docx/03 - Module 3 The Learning Process and Assessment - practice.docx",
        ],
        "regenerateCommand": "python projects/learning-strategies-15-docx-export/meta/build_practice_docx_export.py",
        "sourceOfTruthNotes": "Practice DOCX export reuses the Social Studies pilot renderer and targets the three content modules for Google Docs handoff testing.",
    }
    (META_DIR / "project.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")


def main() -> None:
    if not ZIP_PATH.exists():
        raise SystemExit(f"Source ZIP not found: {ZIP_PATH}")
    renderer_module = load_social_builder()
    META_DIR.mkdir(parents=True, exist_ok=True)
    write_project_metadata()
    with zipfile.ZipFile(ZIP_PATH) as zip_file:
        manifest_root = ET.fromstring(zip_file.read("imsmanifest.xml"))
        exporter = LearningStrategiesPracticeExporter(renderer_module, zip_file, manifest_root)
        outputs = exporter.build()
        for output in outputs:
            print(f"Wrote {output}")


if __name__ == "__main__":
    main()
