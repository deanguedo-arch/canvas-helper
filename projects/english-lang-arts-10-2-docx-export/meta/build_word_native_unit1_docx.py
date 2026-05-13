from __future__ import annotations

import csv
import hashlib
import importlib.util
import json
import posixpath
import re
import shutil
import subprocess
import sys
import urllib.request
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import unquote
from xml.etree import ElementTree as ET

from bs4 import BeautifulSoup, NavigableString, Tag
from PIL import Image, ImageDraw


REPO_ROOT = Path(__file__).resolve().parents[3]
PROJECT_ROOT = REPO_ROOT / "projects" / "english-lang-arts-10-2-docx-export"
META_DIR = PROJECT_ROOT / "meta"
BROWSER_BUILDER_PATH = META_DIR / "build_browser_rendered_practice_docx.py"

UNIT_TITLE = "Unit 1: Introduction to Interpreting and Creating Texts"
OUTPUT_TITLE = "Unit 1 Introduction to Interpreting and Creating Texts - word native editable"

OUTPUT_ROOT = PROJECT_ROOT / "exports" / "word-native-unit1"
WORK_DIR = OUTPUT_ROOT / "html"
ASSET_DIR = WORK_DIR / "assets"
SUPPORT_DIR = OUTPUT_ROOT / "supporting-files"
DOCX_DIR = OUTPUT_ROOT / "docx"


def load_module(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise SystemExit(f"Unable to load module: {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


browser_builder = load_module("ela102_browser_word_native_unit1", BROWSER_BUILDER_PATH)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def item_title(item: ET.Element) -> str:
    for child in item:
        if local_name(child.tag) == "title":
            return "".join(child.itertext()).strip()
    return ""


def item_children(item: ET.Element) -> list[ET.Element]:
    return [child for child in item if local_name(child.tag) == "item"]


def walk_items(item: ET.Element) -> list[ET.Element]:
    result = [item]
    for child in item_children(item):
        result.extend(walk_items(child))
    return result


def normalize_key(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip()).casefold()


def safe_name(value: str, max_len: int = 96) -> str:
    return browser_builder.safe_name(value, max_len=max_len)


def rel_posix(path: Path, start: Path) -> str:
    return Path(path).resolve().relative_to(start.resolve()).as_posix()


def read_resources(manifest_root: ET.Element) -> dict[str, dict[str, Any]]:
    resources: dict[str, dict[str, Any]] = {}
    for resource in manifest_root.iter():
        if local_name(resource.tag) != "resource":
            continue
        identifier = resource.attrib.get("identifier")
        if not identifier:
            continue
        files = [
            file_node.attrib.get("href")
            for file_node in resource
            if local_name(file_node.tag) == "file" and file_node.attrib.get("href")
        ]
        resources[identifier] = {"identifier": identifier, "type": resource.attrib.get("type"), "files": files}
    return resources


def top_level_modules(manifest_root: ET.Element) -> list[ET.Element]:
    organization = next(
        node for node in manifest_root.iter() if local_name(node.tag) == "organization"
    )
    root_items = item_children(organization)
    if len(root_items) == 1 and not item_title(root_items[0]):
        return item_children(root_items[0])
    return root_items


def find_top_level(manifest_root: ET.Element, title: str) -> ET.Element:
    wanted = normalize_key(title)
    for item in top_level_modules(manifest_root):
        if normalize_key(item_title(item)) == wanted:
            return item
    raise SystemExit(f"Unit not found: {title}")


def resolve_package_href(base_href: str, relative_href: str, zip_file: zipfile.ZipFile) -> str | None:
    if not relative_href or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", relative_href):
        return None
    href = relative_href.split("#", 1)[0].split("?", 1)[0].strip()
    if not href:
        return None
    href = unquote(href.replace("\\", "/"))
    candidate = posixpath.normpath(posixpath.join(posixpath.dirname(base_href), href))
    if browser_builder.package_path_exists(zip_file, candidate):
        return candidate
    if browser_builder.package_path_exists(zip_file, href):
        return href
    return None


def safe_asset_name(source: str) -> str:
    ext = Path(source).suffix.lower() or ".asset"
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", Path(source).stem).strip("-") or "asset"
    digest = hashlib.sha1(source.encode("utf-8")).hexdigest()[:8]
    return f"{stem[:48]}-{digest}{ext}"


def reset_dirs() -> None:
    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    SUPPORT_DIR.mkdir(parents=True, exist_ok=True)
    DOCX_DIR.mkdir(parents=True, exist_ok=True)
    META_DIR.mkdir(parents=True, exist_ok=True)


def word_native_css() -> str:
    return """
html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  color: #202122;
}
body {
  font-family: Lato, Aptos, Arial, sans-serif;
  font-size: 19px;
  line-height: 1.42;
}
.docx-content-root {
  width: 820px;
  margin: 0 auto;
  padding: 42px 46px 56px;
  background: #ffffff;
}
.docx-lesson {
  page-break-before: always;
  margin: 0;
  padding: 0;
}
.docx-lesson:first-child {
  page-break-before: auto;
}
h1, h2, h3, h4 {
  font-family: Lato, Aptos, Arial, sans-serif;
  color: #333c48;
  line-height: 1.18;
  font-weight: 700;
  margin-top: 0.75em;
  margin-bottom: 0.55em;
}
h1 {
  font-size: 34px;
  text-align: center;
}
h2 {
  font-size: 25px;
  color: #333c48;
}
h3 {
  font-size: 22px;
}
h4 {
  font-size: 20px;
}
p {
  margin-top: 0;
  margin-bottom: 1em;
}
ul, ol {
  margin-top: 0.35em;
  margin-bottom: 1em;
}
li {
  margin-top: 0.38em;
  margin-bottom: 0.38em;
}
a {
  color: #006fbf;
  text-decoration: underline;
}
img {
  max-width: 100%;
  height: auto;
}
hr {
  border: 0;
  border-top: 1px solid #d7dce2;
  margin: 30px 0;
}
.card {
  border: 1px solid #d6dbe2;
  background: #f8f9fa;
  padding: 22px;
  margin: 22px auto;
}
.card-graphic {
  border: 3px solid #00847f;
  background: #ffffff;
  padding: 30px;
  text-align: center;
}
.two-col-panels .row {
  display: table;
  width: 100%;
  border-spacing: 24px;
}
.two-col-panels .card {
  display: table-cell;
  width: 50%;
  vertical-align: middle;
  text-align: center;
  min-height: 180px;
}
.docx-video-card {
  margin: 22px auto;
  padding: 12px;
  border: 2px solid #222222;
  background: #eef8ee;
}
.docx-video-thumb {
  display: block;
  width: 760px;
  max-width: 100%;
  margin: 0 auto 10px;
}
""".strip()


def remove_noise_nodes(soup: BeautifulSoup) -> None:
    browser_builder.remove_noise_nodes(soup)
    for node in list(soup.find_all(string=True)):
        text = browser_builder.clean_text(str(node))
        if normalize_key(text) in {"template javascript", "image source", "image sources", "source"}:
            node.extract()


def rewrite_local_images(soup: BeautifulSoup, zip_file: zipfile.ZipFile, source_href: str, audit: dict[str, Any]) -> None:
    for img in soup.find_all("img"):
        src = (img.get("src") or "").strip()
        if not src or re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", src):
            continue
        package_href = resolve_package_href(source_href, src, zip_file)
        if not package_href:
            audit["unresolvedImages"].append({"sourceHtml": source_href, "src": src})
            img.decompose()
            continue
        asset_name = safe_asset_name(package_href)
        asset_path = ASSET_DIR / asset_name
        asset_path.write_bytes(zip_file.read(package_href))
        img["src"] = f"assets/{asset_name}"
        audit["imagesCopied"].append({"sourceHtml": source_href, "sourceHref": package_href, "asset": str(asset_path)})


def download_video_thumbnail(url: str, source_url: str, audit: dict[str, Any]) -> str:
    asset_name = safe_asset_name(url or source_url)
    if not asset_name.lower().endswith((".jpg", ".jpeg", ".png", ".gif")):
        asset_name = Path(asset_name).stem + ".jpg"
    asset_path = ASSET_DIR / asset_name
    if url:
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(request, timeout=12) as response:
                asset_path.write_bytes(response.read())
            audit["videoThumbnailsCopied"].append({"sourceUrl": source_url, "thumbnailUrl": url, "asset": str(asset_path)})
            return f"assets/{asset_name}"
        except Exception as exc:
            audit["thumbnailFailures"].append({"sourceUrl": source_url, "thumbnailUrl": url, "error": str(exc)})
    fallback_path = ASSET_DIR / f"video-preview-{hashlib.sha1(source_url.encode('utf-8')).hexdigest()[:8]}.png"
    image = Image.new("RGB", (960, 540), (36, 78, 94))
    draw = ImageDraw.Draw(image)
    draw.ellipse((420, 190, 540, 310), fill=(255, 255, 255))
    draw.polygon([(465, 220), (465, 280), (520, 250)], fill=(20, 43, 52))
    draw.text((48, 44), "Video preview", fill=(255, 255, 255))
    image.save(fallback_path)
    audit["videoThumbnailFallbacks"].append({"sourceUrl": source_url, "asset": str(fallback_path)})
    return f"assets/{fallback_path.name}"


def normalize_video_nodes(soup: BeautifulSoup, source_href: str, audit: dict[str, Any]) -> None:
    for media in list(soup.find_all(["iframe", "video", "audio", "embed", "object"])):
        src = (media.get("src") or media.get("data") or "").strip()
        if not src:
            media.decompose()
            continue
        handoff = browser_builder.public_video_url(src)
        thumb = browser_builder.youtube_thumbnail_url(handoff)
        local_thumb = download_video_thumbnail(thumb, handoff, audit)
        card = soup.new_tag("div")
        card["class"] = "docx-video-card"
        link = soup.new_tag("a", href=handoff)
        link["data-docx-video-generated"] = "1"
        image = soup.new_tag("img", src=local_thumb, alt="Video preview")
        image["class"] = "docx-video-thumb"
        link.append(image)
        url_line = soup.new_tag("p")
        url_link = soup.new_tag("a", href=handoff)
        url_link["data-docx-video-generated"] = "1"
        url_link.string = handoff
        url_line.append(url_link)
        card.append(link)
        card.append(url_line)
        media.replace_with(card)
        audit["mediaReferences"].append({"sourceHtml": source_href, "src": src, "handoffUrl": handoff, "thumbnailUrl": thumb})

    for anchor in soup.find_all("a"):
        if anchor.get("data-docx-video-generated"):
            continue
        href = (anchor.get("href") or "").strip()
        if not href:
            continue
        if browser_builder.is_video_url(href):
            handoff = browser_builder.public_video_url(href)
            anchor["href"] = handoff
            anchor.string = handoff
            audit["mediaReferences"].append({"sourceHtml": source_href, "src": href, "handoffUrl": handoff, "thumbnailUrl": browser_builder.youtube_thumbnail_url(handoff)})
        else:
            anchor["href"] = browser_builder.clean_lms_url(href)


def lesson_body_children(soup: BeautifulSoup) -> list[Any]:
    body = soup.body or soup
    containers = body.select(".container-fluid")
    root = containers[0] if containers else body
    return list(root.contents)


def html_has_heading(soup: BeautifulSoup, title: str) -> bool:
    wanted = normalize_key(title)
    for heading in soup.find_all(["h1", "h2", "h3"]):
        if normalize_key(heading.get_text(" ")) == wanted:
            return True
    return False


def prepare_lesson_section(zip_file: zipfile.ZipFile, source_href: str, lesson_title: str, audit: dict[str, Any]) -> BeautifulSoup:
    raw = zip_file.read(source_href).decode("utf-8", errors="replace")
    soup = BeautifulSoup(raw, "lxml")
    remove_noise_nodes(soup)
    rewrite_local_images(soup, zip_file, source_href, audit)
    normalize_video_nodes(soup, source_href, audit)
    section_soup = BeautifulSoup("", "lxml")
    section = section_soup.new_tag("section")
    section["class"] = "docx-lesson"
    if not html_has_heading(soup, lesson_title):
        h1 = section_soup.new_tag("h1")
        h1.string = lesson_title
        section.append(h1)
    for child in lesson_body_children(soup):
        if isinstance(child, NavigableString) and not child.strip():
            continue
        section.append(child)
    section_soup.append(section)
    return section_soup


def wrap_combined_html(sections: list[BeautifulSoup]) -> BeautifulSoup:
    soup = BeautifulSoup("<!DOCTYPE html><html><head></head><body></body></html>", "lxml")
    head = soup.head
    meta = soup.new_tag("meta")
    meta["charset"] = "utf-8"
    head.append(meta)
    title_tag = soup.new_tag("title")
    title_tag.string = UNIT_TITLE
    head.append(title_tag)
    style = soup.new_tag("style")
    style.string = word_native_css()
    head.append(style)
    main = soup.new_tag("main")
    main["class"] = "docx-content-root"
    for section_soup in sections:
        for child in list(section_soup.contents):
            main.append(child)
    soup.body.append(main)
    return soup


def copy_support_file(zip_file: zipfile.ZipFile, href: str, lesson_title: str, audit: dict[str, Any]) -> None:
    digest = hashlib.sha1(href.encode("utf-8")).hexdigest()[:8]
    ext = Path(href).suffix or ".resource"
    basename = f"{safe_name(lesson_title, 58)}-{digest}{ext}"
    destination = SUPPORT_DIR / basename
    destination.write_bytes(zip_file.read(href))
    audit["supportFiles"].append({"sourceHref": href, "outputPath": str(destination), "bytes": destination.stat().st_size})


def write_word_import_script(html_path: Path, docx_path: Path) -> Path:
    script = OUTPUT_ROOT / "word-import-unit1.ps1"
    script.write_text(
        f"""
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {{
  $doc = $word.Documents.Open('{html_path}', $false, $false)
  $doc.SaveAs2('{docx_path}', 16)
  $doc.Close($false)
}} finally {{
  $word.Quit()
}}
""".strip(),
        encoding="utf-8",
    )
    return script


def convert_html_to_docx_with_word(html_path: Path) -> Path:
    docx_path = DOCX_DIR / f"01 - {safe_name(OUTPUT_TITLE)}.docx"
    script_path = write_word_import_script(html_path.resolve(), docx_path.resolve())
    result = subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(script_path)],
        cwd=REPO_ROOT,
        text=True,
        encoding="utf-8",
        errors="replace",
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise SystemExit(f"Word HTML import failed.\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}")
    return docx_path


def main() -> None:
    if not browser_builder.ZIP_PATH.exists():
        raise SystemExit(f"Source ZIP not found: {browser_builder.ZIP_PATH}")
    reset_dirs()
    audit: dict[str, Any] = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "sourceZip": str(browser_builder.ZIP_PATH),
        "unitTitle": UNIT_TITLE,
        "mode": "word-native-unit-editable",
        "items": [],
        "imagesCopied": [],
        "unresolvedImages": [],
        "mediaReferences": [],
        "videoThumbnailsCopied": [],
        "videoThumbnailFallbacks": [],
        "thumbnailFailures": [],
        "supportFiles": [],
        "coverageFailures": [],
    }
    sections: list[BeautifulSoup] = []
    with zipfile.ZipFile(browser_builder.ZIP_PATH) as zip_file:
        manifest_root = ET.fromstring(zip_file.read("imsmanifest.xml"))
        resources = read_resources(manifest_root)
        unit = find_top_level(manifest_root, UNIT_TITLE)
        for item in walk_items(unit):
            if item is unit:
                continue
            ref = item.attrib.get("identifierref")
            if not ref:
                continue
            lesson_title = item_title(item) or "Untitled item"
            resource = resources.get(ref)
            item_record: dict[str, Any] = {
                "title": lesson_title,
                "identifier": item.attrib.get("identifier"),
                "identifierref": ref,
                "htmlHrefs": [],
                "supportHrefs": [],
                "status": "pending",
            }
            if not resource:
                item_record["status"] = "missing-resource"
                audit["coverageFailures"].append(item_record)
                audit["items"].append(item_record)
                continue
            files = list(resource.get("files") or [])
            missing = [href for href in files if not browser_builder.package_path_exists(zip_file, href)]
            if missing:
                item_record["status"] = "missing-files"
                item_record["missingHrefs"] = missing
                audit["coverageFailures"].append(item_record)
                audit["items"].append(item_record)
                continue
            for href in files:
                ext = Path(href).suffix.lower()
                if ext in [".html", ".htm"]:
                    item_record["htmlHrefs"].append(href)
                    sections.append(prepare_lesson_section(zip_file, href, lesson_title, audit))
                else:
                    item_record["supportHrefs"].append(href)
                    copy_support_file(zip_file, href, lesson_title, audit)
            item_record["status"] = "rendered" if item_record["htmlHrefs"] else "support-file-only"
            audit["items"].append(item_record)
    if audit["coverageFailures"]:
        audit_path = META_DIR / "word-native-unit1-audit.json"
        audit_path.write_text(json.dumps(audit, indent=2), encoding="utf-8")
        raise SystemExit(f"Coverage failures detected. See {audit_path}")
    combined = wrap_combined_html(sections)
    html_path = WORK_DIR / "unit1-word-native.html"
    html_path.write_text(str(combined), encoding="utf-8")
    docx_path = convert_html_to_docx_with_word(html_path)
    audit["preparedHtml"] = str(html_path)
    audit["outputDocx"] = str(docx_path)
    audit["outputBytes"] = docx_path.stat().st_size
    audit["passed"] = True
    audit_path = META_DIR / "word-native-unit1-audit.json"
    audit_path.write_text(json.dumps(audit, indent=2), encoding="utf-8")
    with (META_DIR / "word-native-unit1-supporting-files-index.csv").open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["sourceHref", "outputPath", "bytes"])
        writer.writeheader()
        writer.writerows(audit["supportFiles"])
    print(f"Word-native Unit 1 DOCX: {docx_path}")
    print(f"Prepared HTML: {html_path}")
    print(f"Items accounted for: {len(audit['items'])}")
    print(f"HTML sections rendered: {len(sections)}")
    print(f"Media references: {len(audit['mediaReferences'])}")
    print(f"Images copied: {len(audit['imagesCopied'])}")
    print(f"Support files: {len(audit['supportFiles'])}")
    print(f"Audit: {audit_path}")


if __name__ == "__main__":
    main()
