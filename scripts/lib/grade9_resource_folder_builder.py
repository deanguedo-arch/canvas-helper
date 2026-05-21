from __future__ import annotations

import json
import re
import shutil
import zipfile
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from xml.etree import ElementTree as ET


IMS_NS = {"ims": "http://www.imsglobal.org/xsd/imscp_v1p1"}
RESOURCE_EXTENSIONS = {".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".pdf", ".webm", ".mp4", ".m4v", ".mov", ".mp3", ".wav", ".zip"}


@dataclass
class ResourceItem:
    title: str
    href: str
    output: str
    bytes: int


@dataclass
class MissingResource:
    unit_title: str
    title: str
    href: str


@dataclass
class Unit:
    title: str
    hidden: bool
    folder: str
    resources: list[ResourceItem]
    missing: list[MissingResource]


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
    names = set(zip_file.namelist())
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
        missing: list[MissingResource] = []
        resource_index = 0
        for item_node in manifest_items(unit_node):
            href = resources_by_id.get(item_node.attrib.get("identifierref", ""), "")
            if not href or Path(href).suffix.lower() not in RESOURCE_EXTENSIONS:
                continue
            item_title = text_of(item_node, "ims:title") or Path(href).stem
            if href not in names:
                missing.append(MissingResource(title, item_title, href))
                continue
            resource_index += 1
            resources.append(ResourceItem(item_title, href, f"{resource_index:02d}_{Path(href).name}", 0))
        units.append(Unit(title, hidden, folder, resources, missing))
    return units, resources_by_id


def copy_from_zip(zip_file: zipfile.ZipFile, source_href: str, destination: Path) -> int:
    normalized = source_href.replace("\\", "/")
    if normalized not in zip_file.namelist():
        raise FileNotFoundError(f"Resource is missing from ZIP: {source_href}")
    destination.parent.mkdir(parents=True, exist_ok=True)
    with zip_file.open(normalized) as source, destination.open("wb") as target:
        shutil.copyfileobj(source, target)
    return destination.stat().st_size


def write_readme(course_title: str, resource_folder: Path, units: list[Unit], unreferenced: list[str]) -> None:
    lines = [
        f"# {course_title} Resource Folder",
        "",
        "Downloadable resources are grouped by the top-level unit order in the Brightspace manifest.",
        "Units hidden in the source course include `_HIDDEN` in the folder name.",
        "Unreferenced downloadable files are preserved separately instead of being assigned by filename guesswork.",
        "",
        "## Unit Folders",
        "",
    ]
    for unit in units:
        visibility = " hidden in source" if unit.hidden else ""
        missing = f", {len(unit.missing)} missing from source ZIP" if unit.missing else ""
        lines.append(f"- `{unit.folder}`: {unit.title} ({len(unit.resources)} files{visibility}{missing})")
    lines.extend(["", "## Unreferenced Source Files", ""])
    if unreferenced:
        lines.append("These downloadable files were present in the ZIP but were not referenced by the Brightspace manifest:")
        lines.append("")
        for name in unreferenced:
            lines.append(f"- `{name}`")
    else:
        lines.append("None.")
    resource_folder.joinpath("README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def zip_resource_folder(resource_folder: Path, zip_path: Path) -> Path:
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as package:
        for path in sorted(resource_folder.rglob("*")):
            if path.is_file():
                package.write(path, path.relative_to(resource_folder.parent).as_posix())
    return zip_path


def build_resource_folder(project: Path, slug: str, course_title: str, source_zip: Path) -> dict:
    exports = project / "exports"
    resource_folder = exports / "resource-folder"
    audit_path = project / "meta" / "resource-folder-audit.json"
    if not source_zip.exists():
        raise FileNotFoundError(f"Source ZIP not found: {source_zip}")
    if resource_folder.exists():
        shutil.rmtree(resource_folder)
    resource_folder.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(source_zip) as zip_file:
        units, resources_by_id = read_manifest(zip_file)
        referenced_hrefs = set()
        for unit in units:
            unit_dir = resource_folder / unit.folder
            unit_dir.mkdir(parents=True, exist_ok=True)
            for resource in unit.resources:
                resource.bytes = copy_from_zip(zip_file, resource.href, unit_dir / resource.output)
                referenced_hrefs.add(resource.href)
            for missing in unit.missing:
                referenced_hrefs.add(missing.href)

        source_files = [
            name
            for name in zip_file.namelist()
            if Path(name).suffix.lower() in RESOURCE_EXTENSIONS and not name.endswith("/")
        ]
        unreferenced = sorted(name for name in source_files if name not in referenced_hrefs)
        if unreferenced:
            unreferenced_dir = resource_folder / "unreferenced-source-files"
            for name in unreferenced:
                copy_from_zip(zip_file, name, unreferenced_dir / Path(name))

    write_readme(course_title, resource_folder, units, unreferenced)
    zip_path = zip_resource_folder(resource_folder, exports / f"{slug}.zip")
    missing_manifest_resources = [missing for unit in units for missing in unit.missing]

    audit = {
        "schemaVersion": 1,
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "projectSlug": slug,
        "sourceZip": str(source_zip),
        "exportFolder": str(resource_folder),
        "exportZip": str(zip_path),
        "resourceCount": sum(len(unit.resources) for unit in units),
        "missingManifestResourceCount": len(missing_manifest_resources),
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
                "missingManifestResourceCount": len(unit.missing),
                "resources": [
                    {
                        "title": resource.title,
                        "sourceHref": resource.href,
                        "outputPath": f"{unit.folder}/{resource.output}",
                        "bytes": resource.bytes,
                    }
                    for resource in unit.resources
                ],
                "missingManifestResources": [
                    {"title": missing.title, "sourceHref": missing.href}
                    for missing in unit.missing
                ],
            }
            for unit in units
        ],
        "missingManifestResources": [
            {
                "unitTitle": missing.unit_title,
                "title": missing.title,
                "sourceHref": missing.href,
            }
            for missing in missing_manifest_resources
        ],
        "unreferencedSourceFiles": unreferenced,
    }
    audit_path.write_text(json.dumps(audit, indent=2), encoding="utf-8")
    return audit
