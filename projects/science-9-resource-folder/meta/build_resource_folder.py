from __future__ import annotations

import json
import os
import re
import shutil
import zipfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET


ROOT = Path(__file__).resolve().parents[3]
PROJECT = ROOT / "projects" / "science-9-resource-folder"
EXPORTS = PROJECT / "exports"
RESOURCE_FOLDER = EXPORTS / "resource-folder"
AUDIT_PATH = PROJECT / "meta" / "resource-folder-audit.json"
SOURCE_ZIP = Path(
    os.environ.get("SCIENCE_9_SOURCE_ZIP")
    or r"c:\Users\dean.guedo\Downloads\D2LExport_151050_25-26 _ Science 9 _ Per 1(A) _ Sec 1_202652151.zip"
)

IMS_NS = {"ims": "http://www.imsglobal.org/xsd/imscp_v1p1"}
RESOURCE_EXTENSIONS = {".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".pdf", ".webm"}


@dataclass
class ResourceItem:
    title: str
    href: str
    output: str
    bytes: int


@dataclass
class Unit:
    title: str
    hidden: bool
    folder: str
    resources: list[ResourceItem]


def text_of(element: ET.Element, xpath: str) -> str:
    found = element.find(xpath, IMS_NS)
    if found is None or found.text is None:
        return ""
    return found.text.strip()


def sanitize_folder_name(value: str) -> str:
    value = re.sub(r"[\\/:*?\"<>|]+", "_", value.strip())
    value = re.sub(r"\s+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("._ ") or "untitled"


def manifest_items(node: ET.Element):
    for child in node.findall("ims:item", IMS_NS):
        yield child
        yield from manifest_items(child)


def read_manifest(zip_file: zipfile.ZipFile) -> tuple[list[Unit], dict[str, str]]:
    manifest = ET.fromstring(zip_file.read("imsmanifest.xml").decode("utf-8-sig"))
    resources_by_id: dict[str, str] = {}
    for resource in manifest.findall(".//ims:resource", IMS_NS):
        identifier = resource.attrib.get("identifier", "")
        href = resource.attrib.get("href", "").replace("\\", "/")
        if identifier and href:
            resources_by_id[identifier] = href

    organization = manifest.find(".//ims:organization", IMS_NS)
    if organization is None:
        raise RuntimeError("imsmanifest.xml does not contain an organization")

    units: list[Unit] = []
    for unit_index, unit_node in enumerate(organization.findall("ims:item", IMS_NS), start=1):
        title = text_of(unit_node, "ims:title")
        hidden = unit_node.attrib.get("isvisible", "true").lower() == "false"
        folder = f"{unit_index:02d}_{sanitize_folder_name(title)}"
        if hidden:
            folder += "_HIDDEN"
        resources: list[ResourceItem] = []
        resource_index = 0
        for item_node in manifest_items(unit_node):
            href = resources_by_id.get(item_node.attrib.get("identifierref", ""), "")
            if not href or Path(href).suffix.lower() not in RESOURCE_EXTENSIONS:
                continue
            resource_index += 1
            item_title = text_of(item_node, "ims:title") or Path(href).stem
            output_name = f"{resource_index:02d}_{Path(href).name}"
            resources.append(ResourceItem(item_title, href, output_name, 0))
        units.append(Unit(title, hidden, folder, resources))
    return units, resources_by_id


def copy_from_zip(zip_file: zipfile.ZipFile, source_href: str, destination: Path) -> int:
    normalized = source_href.replace("\\", "/")
    if normalized not in zip_file.namelist():
        raise FileNotFoundError(f"Manifest resource is missing from ZIP: {source_href}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zip_file.open(normalized) as source, destination.open("wb") as target:
        shutil.copyfileobj(source, target)
    return destination.stat().st_size


def write_readme(units: list[Unit], unreferenced: list[str]) -> None:
    lines = [
        "# Science 9 Resource Folder",
        "",
        "Downloadable resources are grouped by the top-level unit order in the Brightspace manifest.",
        "Units hidden in the source course include `_HIDDEN` in the folder name.",
        "HTML lesson pages and image support folders are not duplicated here; this package is for teacher-facing downloadable resources.",
        "",
        "## Unit Folders",
        "",
    ]
    for unit in units:
        visibility = " hidden in source" if unit.hidden else ""
        lines.append(f"- `{unit.folder}`: {unit.title} ({len(unit.resources)} files{visibility})")
    lines.extend(["", "## Unreferenced Source Files", ""])
    if unreferenced:
        lines.append("These downloadable files were present in the ZIP but were not referenced by the Brightspace manifest:")
        lines.append("")
        for name in unreferenced:
            lines.append(f"- `{name}`")
    else:
        lines.append("None.")
    (RESOURCE_FOLDER / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def zip_resource_folder() -> Path:
    zip_path = EXPORTS / "science-9-resource-folder.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for path in sorted(RESOURCE_FOLDER.rglob("*")):
            if path.is_file():
                package.write(path, path.relative_to(RESOURCE_FOLDER.parent).as_posix())
    return zip_path


def build() -> dict:
    if not SOURCE_ZIP.exists():
        raise FileNotFoundError(f"Source ZIP not found: {SOURCE_ZIP}")
    if RESOURCE_FOLDER.exists():
        shutil.rmtree(RESOURCE_FOLDER)
    RESOURCE_FOLDER.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(SOURCE_ZIP) as zip_file:
        units, resources_by_id = read_manifest(zip_file)
        referenced_hrefs = set()
        for unit in units:
            unit_dir = RESOURCE_FOLDER / unit.folder
            unit_dir.mkdir(parents=True, exist_ok=True)
            for resource in unit.resources:
                destination = unit_dir / resource.output
                resource.bytes = copy_from_zip(zip_file, resource.href, destination)
                referenced_hrefs.add(resource.href)

        source_files = [
            name
            for name in zip_file.namelist()
            if Path(name).suffix.lower() in RESOURCE_EXTENSIONS and not name.endswith("/")
        ]
        unreferenced = sorted(name for name in source_files if name not in referenced_hrefs)
        if unreferenced:
            unreferenced_dir = RESOURCE_FOLDER / "unreferenced-source-files"
            for name in unreferenced:
                copy_from_zip(zip_file, name, unreferenced_dir / Path(name))

    write_readme(units, unreferenced)
    zip_path = zip_resource_folder()

    audit = {
        "schemaVersion": 1,
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "projectSlug": "science-9-resource-folder",
        "sourceZip": str(SOURCE_ZIP),
        "exportFolder": str(RESOURCE_FOLDER),
        "exportZip": str(zip_path),
        "resourceCount": sum(len(unit.resources) for unit in units),
        "unreferencedResourceCount": len(unreferenced),
        "sourceDownloadableFileCount": len(unreferenced) + sum(len(unit.resources) for unit in units),
        "manifestResourceCount": len(resources_by_id),
        "includedExtensions": sorted(RESOURCE_EXTENSIONS),
        "units": [
            {
                "title": unit.title,
                "hidden": unit.hidden,
                "folder": unit.folder,
                "resourceCount": len(unit.resources),
                "resources": [
                    {
                        "title": resource.title,
                        "sourceHref": resource.href,
                        "outputPath": f"{unit.folder}/{resource.output}",
                        "bytes": resource.bytes,
                    }
                    for resource in unit.resources
                ],
            }
            for unit in units
        ],
        "unreferencedSourceFiles": unreferenced,
    }
    AUDIT_PATH.write_text(json.dumps(audit, indent=2), encoding="utf-8")
    return audit


if __name__ == "__main__":
    result = build()
    print(
        f"Built {result['resourceCount']} manifest resources into {len(result['units'])} unit folders; "
        f"preserved {result['unreferencedResourceCount']} unreferenced source files."
    )
