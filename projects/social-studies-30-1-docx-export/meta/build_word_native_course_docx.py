from __future__ import annotations

from html import escape
import importlib.util
import json
import re
import subprocess
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[3]
SHARED_SCRIPT = REPO_ROOT / "scripts" / "brightspace_zip_to_docx_upload_package.py"
COURSE_KEY = "social30-1"


def load_shared_module():
    spec = importlib.util.spec_from_file_location("brightspace_zip_to_docx_upload_package", SHARED_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load shared converter: {SHARED_SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def extract_style(html_text: str) -> str:
    match = re.search(r"<style>\s*(?P<style>.*?)\s*</style>", html_text, flags=re.IGNORECASE | re.DOTALL)
    return match.group("style") if match else ""


def extract_main(html_text: str) -> str:
    match = re.search(
        r'<main\s+class=["\']docx-root["\']>\s*(?P<body>.*?)\s*</main>',
        html_text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    return match.group("body") if match else html_text


def ps_quote(path: Path) -> str:
    return str(path.resolve()).replace("'", "''")


def import_html_with_word(html_path: Path, docx_path: Path) -> None:
    ps1 = html_path.with_name("word-import-combined-course.ps1")
    ps1.write_text(
        f"""
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {{
  $doc = $word.Documents.Open('{ps_quote(html_path)}', $false, $true)
  foreach ($shape in @($doc.InlineShapes)) {{
    try {{
      $link = $shape.LinkFormat
      if ($null -ne $link) {{
        $link.SavePictureWithDocument = $true
        $link.BreakLink()
      }}
    }} catch {{
    }}
  }}
  foreach ($shape in @($doc.Shapes)) {{
    try {{
      $link = $shape.LinkFormat
      if ($null -ne $link) {{
        $link.SavePictureWithDocument = $true
        $link.BreakLink()
      }}
    }} catch {{
    }}
  }}
  $doc.SaveAs([ref]'{ps_quote(docx_path)}', [ref]16)
  $doc.Close($false)
}} finally {{
  $word.Quit()
}}
""".strip(),
        encoding="utf-8",
    )
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps1)],
        check=True,
    )


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def xml_text(root: ET.Element, name: str) -> str:
    for node in root.iter():
        if local_name(node.tag) == name:
            return "".join(node.itertext()).strip()
    return ""


def extract_xml_resource(zip_file: zipfile.ZipFile, package_href: str) -> dict[str, str]:
    try:
        text = zip_file.read(package_href).decode("utf-8-sig", errors="replace")
        root = ET.fromstring(text)
    except Exception:
        return {"kind": "Package XML", "title": Path(package_href).name, "url": "", "source": package_href}

    root_name = local_name(root.tag)
    if root_name == "webLink":
        title = xml_text(root, "title") or Path(package_href).stem
        url = ""
        for node in root.iter():
            if local_name(node.tag) == "url":
                url = node.get("href") or ""
                break
        return {"kind": "Web link", "title": title, "url": url, "source": package_href}
    if root_name == "cartridge_basiclti_link":
        return {
            "kind": "LTI external tool",
            "title": xml_text(root, "title") or Path(package_href).stem,
            "url": xml_text(root, "launch_url"),
            "source": package_href,
        }
    return {"kind": root_name or "Package XML", "title": xml_text(root, "title") or Path(package_href).stem, "url": "", "source": package_href}


def render_resource_record(record: dict[str, str], fallback_title: str) -> str:
    label = escape(record.get("title") or fallback_title)
    kind = escape(record.get("kind") or "Resource")
    source = escape(record.get("source") or "")
    url = record.get("url") or ""
    if url:
        escaped_url = escape(url, quote=True)
        return (
            f'<div class="resource-link">'
            f'<p><strong>{kind}:</strong> <a href="{escaped_url}">{label}</a></p>'
            f'<p class="raw-url"><a href="{escaped_url}">{escape(url)}</a></p>'
            f'<p class="source-path">Source package path: {source}</p>'
            f"</div>"
        )
    return (
        f'<div class="resource-link">'
        f"<p><strong>{kind}:</strong> {label}</p>"
        f'<p class="source-path">Source package path: {source}</p>'
        f"</div>"
    )


def collect_identifierrefs(shared, item) -> set[str]:
    refs: set[str] = set()
    ref = item.get("identifierref")
    if ref:
        refs.add(ref)
    for child in shared.item_children(item):
        refs.update(collect_identifierrefs(shared, child))
    return refs


def render_manifest_item(shared, exporter, zip_file: zipfile.ZipFile, item, depth: int = 2) -> str:
    title = shared.item_title(item)
    files = exporter.resource_files(item)
    children = shared.item_children(item)
    heading_level = min(max(depth, 2), 5)
    parts = [f'<div class="manifest-item depth-{depth}">']
    if title:
        parts.append(f"<h{heading_level}>{escape(title)}</h{heading_level}>")
    if files:
        for package_href in files:
            parts.append(render_resource_record(extract_xml_resource(zip_file, package_href), title))
    elif not children:
        parts.append(
            '<p class="missing-resource">No HTML page, media file, or linked resource was included in this ZIP for this Brightspace item.</p>'
        )
    for child in children:
        parts.append(render_manifest_item(shared, exporter, zip_file, child, depth + 1))
    parts.append("</div>")
    return "\n".join(parts)


def build_manifest_resource_outline(shared, exporter, upload_root: Path) -> dict[str, object] | None:
    html_dir = upload_root / "04_HTML_SOURCE_USED_FOR_IMPORT"
    docx_dir = upload_root / "01_DOCX_BY_UNIT"
    combined_html_path = html_dir / "00-Social Studies 30-1 - ALL UNITS COMBINED.html"
    combined_docx_path = docx_dir / "00 - Social Studies 30-1 - ALL UNITS COMBINED.docx"

    resource_links: list[dict[str, str]] = []
    with zipfile.ZipFile(exporter.source_zip) as zip_file:
        parts = [
            '<section class="course-note">',
            "<h1>Social Studies 30-1</h1>",
            "<p>This Brightspace export contains no HTML lesson pages, images, CSS, or media files. The DOCX below preserves the exported course structure and every XML-based web/LTI resource that is present in the ZIP.</p>",
            "</section>",
        ]
        refs: set[str] = set()
        for unit in shared.item_children(next(node for node in exporter.manifest_root.iter() if shared.local_name(node.tag) == "organization")):
            unit_title = shared.item_title(unit)
            if not unit_title:
                for child in shared.item_children(unit):
                    refs.update(collect_identifierrefs(shared, child))
                    parts.append(f'<section class="docx-group-heading"><h1>{escape(shared.item_title(child))}</h1></section>')
                    parts.append(render_manifest_item(shared, exporter, zip_file, child, depth=2))
                continue
            refs.update(collect_identifierrefs(shared, unit))
            parts.append(f'<section class="docx-group-heading"><h1>{escape(unit_title)}</h1></section>')
            for child in shared.item_children(unit):
                parts.append(render_manifest_item(shared, exporter, zip_file, child, depth=2))

        orphan_parts: list[str] = []
        for identifier, files in exporter.resources.items():
            if identifier in refs:
                continue
            for package_href in files:
                record = extract_xml_resource(zip_file, package_href)
                resource_links.append(record)
                orphan_parts.append(render_resource_record(record, record.get("title", "")))
        if orphan_parts:
            parts.append('<section class="docx-group-heading"><h1>Unplaced exported LTI/web resources</h1></section>')
            parts.append(
                "<p>These resources are present in the ZIP but are not attached to visible manifest items. They are preserved here so they do not disappear.</p>"
            )
            parts.extend(orphan_parts)

    css = """
@page { size: 8.5in 11in; margin: 0.6in; }
body { color: #1f2933; font-family: Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.45; }
.docx-root { width: 7.25in; margin: 0 auto; }
.course-note { background: #ebf5eb; border: 1px solid #9fc49f; padding: 12pt; margin-bottom: 18pt; }
.course-note h1 { color: #30445f; font-size: 22pt; margin: 0 0 8pt; }
.docx-group-heading { page-break-before: always; border-bottom: 1px solid #b8c7d8; margin: 18pt 0 12pt; padding-bottom: 6pt; }
.docx-group-heading h1 { color: #30445f; font-size: 18pt; margin: 0; }
.manifest-item { margin: 8pt 0 10pt; padding: 8pt 10pt; border-left: 3pt solid #6096bf; background: #f8fbfd; }
.manifest-item .manifest-item { background: #ffffff; border-left-color: #b8c7d8; }
h2, h3, h4, h5 { color: #374151; margin: 0 0 6pt; line-height: 1.2; }
h2 { font-size: 15pt; }
h3 { font-size: 13.5pt; }
h4, h5 { font-size: 12.5pt; }
p { margin: 0 0 7pt; }
a { color: #0563c1; text-decoration: underline; }
.resource-link { background: #ebf5eb; border: 1px solid #c9dfc9; padding: 8pt; margin: 6pt 0; }
.raw-url { word-break: break-all; }
.source-path, .missing-resource { color: #667085; font-size: 10.5pt; }
"""
    combined_html_path.write_text(
        f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Social Studies 30-1 - All Units Combined</title>
<style>{css}</style>
</head>
<body>
<main class="docx-root">
{''.join(parts)}
</main>
</body>
</html>
""",
        encoding="utf-8",
    )
    import_html_with_word(combined_html_path, combined_docx_path)
    exporter.clamp_docx_image_extents(combined_docx_path)
    return {
        "mode": "manifest-resource-outline",
        "htmlPath": shared.rel_posix(combined_html_path, upload_root),
        "docxPath": shared.rel_posix(combined_docx_path, upload_root),
        "unitCount": len(exporter.generated_units),
        "orphanResourceLinksPreserved": len(resource_links),
        "docxBytes": combined_docx_path.stat().st_size if combined_docx_path.exists() else 0,
    }


def build_combined_docx(shared, exporter, upload_root: Path) -> dict[str, object] | None:
    html_dir = upload_root / "04_HTML_SOURCE_USED_FOR_IMPORT"
    docx_dir = upload_root / "01_DOCX_BY_UNIT"
    html_dir.mkdir(parents=True, exist_ok=True)
    docx_dir.mkdir(parents=True, exist_ok=True)

    if not exporter.generated_units:
        return None
    if not exporter.audit["htmlSectionsRendered"]:
        return build_manifest_resource_outline(shared, exporter, upload_root)

    first_html = upload_root / exporter.generated_units[0]["htmlPath"]
    style = extract_style(first_html.read_text(encoding="utf-8"))
    parts: list[str] = []
    for unit in exporter.generated_units:
        html_path = upload_root / unit["htmlPath"]
        body = extract_main(html_path.read_text(encoding="utf-8"))
        title = escape(str(unit["title"]))
        parts.append(f'<section class="docx-group-heading"><h1>{title}</h1></section>\n{body}')

    combined_html_path = html_dir / "00-Social Studies 30-1 - ALL UNITS COMBINED.html"
    combined_docx_path = docx_dir / "00 - Social Studies 30-1 - ALL UNITS COMBINED.docx"
    combined_html_path.write_text(
        f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Social Studies 30-1 - All Units Combined</title>
<style>
{style}
.docx-group-heading:first-child {{ page-break-before: auto; }}
</style>
</head>
<body>
<main class="docx-root">
{''.join(parts)}
</main>
</body>
</html>
""",
        encoding="utf-8",
    )
    import_html_with_word(combined_html_path, combined_docx_path)
    exporter.clamp_docx_image_extents(combined_docx_path)

    return {
        "htmlPath": shared.rel_posix(combined_html_path, upload_root),
        "docxPath": shared.rel_posix(combined_docx_path, upload_root),
        "unitCount": len(exporter.generated_units),
        "docxBytes": combined_docx_path.stat().st_size if combined_docx_path.exists() else 0,
    }


def update_package_notes(upload_root: Path, meta_dir: Path, combined: dict[str, object] | None) -> None:
    if not combined:
        return
    for audit_path in (
        upload_root / "03_AUDITS" / "course-docx-audit.json",
        meta_dir / "course-docx-audit.json",
    ):
        if audit_path.exists():
            audit = json.loads(audit_path.read_text(encoding="utf-8"))
            audit["combinedCourseDocx"] = combined
            audit_path.write_text(json.dumps(audit, indent=2, ensure_ascii=False), encoding="utf-8")

    readme_path = upload_root / "00_README.md"
    if readme_path.exists():
        readme = readme_path.read_text(encoding="utf-8")
        readme += (
            "\n\n## Combined course DOCX\n\n"
            f"- `{combined['docxPath']}` contains all generated units in one Word document.\n"
        )
        readme_path.write_text(readme, encoding="utf-8")


def main() -> None:
    shared = load_shared_module()
    config = shared.COURSES[COURSE_KEY]
    exporter = shared.BrightspaceCourseDocxExporter(config)
    upload_root = exporter.build()
    combined = build_combined_docx(shared, exporter, upload_root)
    update_package_notes(upload_root, exporter.meta_dir, combined)
    print(f"Wrote upload package: {upload_root}")
    print(f"Included units: {len(exporter.generated_units)}")
    print(f"Skipped top-level modules: {len(exporter.skipped_modules)}")
    print(f"HTML sections rendered: {len(exporter.audit['htmlSectionsRendered'])}")
    print(f"Images copied: {len(exporter.audit['imagesCopied'])}")
    print(f"Media references: {len(exporter.audit['mediaReferences'])}")
    print(f"Support files: {len(exporter.audit['supportFiles'])}")
    if combined:
        print(f"Combined course DOCX: {upload_root / combined['docxPath']}")


if __name__ == "__main__":
    main()
