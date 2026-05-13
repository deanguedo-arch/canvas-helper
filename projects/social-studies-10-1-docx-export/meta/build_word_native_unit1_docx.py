from __future__ import annotations

import hashlib
from html import escape
import json
import os
import posixpath
import re
import shutil
import subprocess
import unicodedata
import zipfile
from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, quote, unquote, urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

from lxml import html as lxml_html
from lxml.html import HtmlElement
from PIL import Image, ImageDraw, ImageFont


REPO_ROOT = Path(__file__).resolve().parents[3]
PROJECT_ROOT = REPO_ROOT / "projects" / "social-studies-10-1-docx-export"
META_DIR = PROJECT_ROOT / "meta"
EXPORT_ROOT = PROJECT_ROOT / "exports" / "word-native-unit1"
HTML_DIR = EXPORT_ROOT / "html"
ASSETS_DIR = HTML_DIR / "assets"
DOCX_DIR = EXPORT_ROOT / "docx"
SUPPORT_DIR = EXPORT_ROOT / "supporting-files"
SOURCE_ZIP_NAME = "D2LCCExport_149634_25-26 _ S2 _ Social Studies 10-1 _ Per 1(A) _ Sec _202651213.ZIP"
UNIT_TITLE = "1. Globalization and Identity"
WORD_SAFE_IMAGE_WIDTH_PX = 620
WORD_SAFE_VIDEO_HEIGHT_PX = 349


def first_existing_path(env_var: str, candidates: list[Path]) -> Path:
    override = os.environ.get(env_var)
    paths = ([Path(override)] if override else []) + candidates
    for path in paths:
        if path.exists():
            return path
    return paths[0]


ZIP_PATH = first_existing_path(
    "SOCIAL10_SOURCE_ZIP",
    [
        Path.home() / "Downloads" / SOURCE_ZIP_NAME,
        Path(r"C:\Users\dean.guedo\Downloads") / SOURCE_ZIP_NAME,
    ],
)

NOISE_TEXT = {
    "image source",
    "image sources",
    "iframe preserved from brightspace",
    "youtube video player",
    "embedded media",
    "template javascript",
    "back to top",
}

VIDEO_HOST_MARKERS = (
    "youtube.com",
    "youtu.be",
    "youtube-nocookie.com",
    "ted.com",
    "embed.ted.com",
    "vimeo.com",
)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def item_title(item: ET.Element) -> str:
    for child in item:
        if local_name(child.tag) == "title":
            return "".join(child.itertext()).strip()
    return ""


def item_children(item: ET.Element) -> list[ET.Element]:
    return [child for child in item if local_name(child.tag) == "item"]


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").replace("\xa0", " ")).strip()


def normalize_key(value: str) -> str:
    return normalize_text(value).casefold()


def int_attr(value: str | None) -> int | None:
    if not value:
        return None
    match = re.search(r"\d+", value)
    return int(match.group(0)) if match else None


def safe_name(value: str, max_len: int = 96) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_value = re.sub(r"[^\w\s().,&+-]+", "", ascii_value)
    ascii_value = re.sub(r"\s+", " ", ascii_value).strip()
    ascii_value = ascii_value.replace("&", "and").strip(" .")
    return (ascii_value or "untitled")[:max_len].strip(" .")


def decode_html(data: bytes) -> str:
    for encoding in ("utf-8-sig", "utf-8", "windows-1252", "latin-1"):
        try:
            return data.decode(encoding)
        except UnicodeDecodeError:
            pass
    return data.decode("utf-8", errors="replace")


def rel_posix(path: Path, start: Path) -> str:
    return Path(os.path.relpath(path, start)).as_posix()


def is_external_url(href: str) -> bool:
    return bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", href or ""))


def is_video_url(href: str) -> bool:
    parsed = urlparse(href or "")
    host = parsed.netloc.casefold()
    return any(marker in host for marker in VIDEO_HOST_MARKERS)


def youtube_video_id(src: str) -> str | None:
    parsed = urlparse(src or "")
    host = parsed.netloc.casefold()
    parts = [part for part in parsed.path.split("/") if part]
    if "youtu.be" in host and parts:
        return parts[0]
    if "youtube" in host:
        if len(parts) >= 2 and parts[0] in {"embed", "shorts", "v"}:
            return parts[1]
        return parse_qs(parsed.query).get("v", [None])[0]
    return None


def media_handoff_url(src: str) -> str:
    video_id = youtube_video_id(src)
    if video_id:
        return f"https://www.youtube.com/watch?v={video_id}"
    parsed = urlparse(src or "")
    if parsed.netloc.casefold() == "embed.ted.com":
        return src.replace("//embed.ted.com/", "//www.ted.com/", 1)
    return src


def package_path_exists(zip_file: zipfile.ZipFile, href: str) -> bool:
    try:
        zip_file.getinfo(href)
        return True
    except KeyError:
        return False


def package_match_score(base_href: str, name: str, suffix: str) -> tuple[int, int, int, int]:
    base_segments = [segment.casefold() for segment in posixpath.dirname(base_href).split("/") if segment]
    name_segments = [segment.casefold() for segment in posixpath.dirname(name).split("/") if segment]
    common = 0
    for left, right in zip(base_segments, name_segments):
        if left != right:
            break
        common += 1
    suffix_depth = len([segment for segment in suffix.split("/") if segment])
    distance = abs(len(name_segments) - len(base_segments))
    return (common, suffix_depth, -distance, -len(name))


def resolve_package_href(base_href: str, relative_href: str, zip_file: zipfile.ZipFile) -> str | None:
    if not relative_href or is_external_url(relative_href):
        return None
    href = relative_href.split("#", 1)[0].split("?", 1)[0].strip()
    if not href:
        return None
    href = unquote(href.replace("\\", "/"))
    candidate = posixpath.normpath(posixpath.join(posixpath.dirname(base_href), href))
    for possible in (candidate, href):
        if package_path_exists(zip_file, possible):
            return possible
    suffixes: list[str] = []
    stripped = re.sub(r"^(\.\./)+", "", href)
    if stripped and stripped != href:
        suffixes.append(stripped)
    basename = posixpath.basename(href)
    if basename and "." in basename:
        suffixes.append(basename)
    names = zip_file.namelist()
    for suffix in suffixes:
        suffix_key = suffix.casefold()
        matches = [
            name
            for name in names
            if not name.endswith("/") and unquote(name).casefold().endswith(suffix_key)
        ]
        if len(matches) == 1:
            return matches[0]
        if len(matches) > 1:
            ranked = sorted(
                ((package_match_score(base_href, name, suffix), name) for name in matches),
                reverse=True,
            )
            if ranked[0][0] != ranked[1][0]:
                return ranked[0][1]
    return None


class SocialWordNativeUnitExporter:
    def __init__(self, zip_file: zipfile.ZipFile, manifest_root: ET.Element) -> None:
        self.zip_file = zip_file
        self.manifest_root = manifest_root
        self.resources = self.read_resources()
        self.asset_cache: dict[str, str] = {}
        self.support_cache: dict[str, str] = {}
        self.css_cache: dict[str, str] = {}
        self.media_cache: dict[str, dict[str, Any] | None] = {}
        self.audit: dict[str, Any] = {
            "schemaVersion": 1,
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "sourceZip": str(ZIP_PATH),
            "unitTitle": UNIT_TITLE,
            "format": "word-native-editable-html-import",
            "itemsAccountedFor": [],
            "htmlSectionsRendered": [],
            "supportFiles": [],
            "imagesCopied": [],
            "mediaReferences": [],
            "cssFilesInlined": [],
            "coverageFailures": [],
            "unresolvedAssets": [],
            "output": {},
        }

    def read_resources(self) -> dict[str, list[str]]:
        resources: dict[str, list[str]] = {}
        for resource in self.manifest_root.iter():
            if local_name(resource.tag) != "resource":
                continue
            identifier = resource.get("identifier")
            if not identifier:
                continue
            resources[identifier] = [
                file_node.get("href") or ""
                for file_node in resource
                if local_name(file_node.tag) == "file" and file_node.get("href")
            ]
        return resources

    def top_modules(self) -> list[ET.Element]:
        organization = next(node for node in self.manifest_root.iter() if local_name(node.tag) == "organization")
        roots = item_children(organization)
        if len(roots) == 1 and not item_title(roots[0]):
            return item_children(roots[0])
        return roots

    def find_unit(self) -> ET.Element:
        for item in self.top_modules():
            if normalize_key(item_title(item)) == normalize_key(UNIT_TITLE):
                return item
        raise SystemExit(f"Unit not found in manifest: {UNIT_TITLE}")

    def prepare_outputs(self) -> None:
        for target in (HTML_DIR, SUPPORT_DIR):
            if target.exists():
                shutil.rmtree(target)
            target.mkdir(parents=True, exist_ok=True)
        ASSETS_DIR.mkdir(parents=True, exist_ok=True)
        DOCX_DIR.mkdir(parents=True, exist_ok=True)
        META_DIR.mkdir(parents=True, exist_ok=True)

    def resource_files(self, item: ET.Element) -> list[str]:
        ref = item.get("identifierref")
        return self.resources.get(ref, []) if ref else []

    def build(self) -> Path:
        self.prepare_outputs()
        unit = self.find_unit()
        body_parts: list[str] = []
        for index, child in enumerate(item_children(unit), 1):
            body_parts.extend(self.render_item(child, index=index, parent_title=UNIT_TITLE))

        if self.audit["coverageFailures"]:
            raise SystemExit(f"Coverage failures found. See audit: {self.audit['coverageFailures'][:3]}")

        html_path = HTML_DIR / "01-social-10-1-unit-1-word-native.html"
        html_path.write_text(self.combined_html(body_parts), encoding="utf-8")
        docx_path = self.available_docx_path(
            DOCX_DIR / "01 - Unit 1 Globalization and Identity - word native editable.docx"
        )
        self.import_html_with_word(html_path, docx_path)
        self.audit["output"] = {
            "html": rel_posix(html_path, PROJECT_ROOT),
            "docx": rel_posix(docx_path, PROJECT_ROOT),
            "docxBytes": docx_path.stat().st_size,
        }
        audit_path = META_DIR / "word-native-unit1-audit.json"
        audit_path.write_text(json.dumps(self.audit, indent=2, ensure_ascii=False), encoding="utf-8")
        return docx_path

    def render_item(self, item: ET.Element, index: int, parent_title: str, depth: int = 1) -> list[str]:
        title = item_title(item)
        files = self.resource_files(item)
        children = item_children(item)
        self.audit["itemsAccountedFor"].append(
            {
                "title": title,
                "identifier": item.get("identifier"),
                "identifierref": item.get("identifierref"),
                "files": files,
                "children": len(children),
            }
        )

        parts: list[str] = []
        if files:
            primary = self.primary_file(files)
            if primary and primary.lower().endswith((".html", ".htm")):
                parts.append(self.render_html_section(title, primary, first=(len(self.audit["htmlSectionsRendered"]) == 0)))
            elif primary:
                parts.append(self.render_support_section(title, primary, first=(len(self.audit["htmlSectionsRendered"]) == 0 and not parts)))
            else:
                self.audit["coverageFailures"].append({"title": title, "reason": "resource-has-no-primary-file", "files": files})
        elif title and children:
            parts.append(
                f'<section class="docx-group-heading"><h1>{escape(title)}</h1></section>'
            )
        elif title:
            self.audit["coverageFailures"].append({"title": title, "reason": "manifest-item-has-no-resource-or-children"})

        for child_index, child in enumerate(children, 1):
            parts.extend(self.render_item(child, index=child_index, parent_title=title, depth=depth + 1))
        return parts

    def primary_file(self, files: list[str]) -> str | None:
        for ext in (".html", ".htm", ".pdf"):
            match = next((file for file in files if file.lower().endswith(ext)), None)
            if match:
                return match
        return files[0] if files else None

    def render_html_section(self, title: str, href: str, first: bool) -> str:
        raw = decode_html(self.zip_file.read(href))
        doc = lxml_html.fromstring(raw)
        self.inline_css_from_source(doc, href)
        self.clean_document(doc)
        self.localize_images(doc, href)
        self.normalize_media(doc, href, title)
        self.normalize_links(doc, href, title)
        body = doc.find(".//body")
        body_html = "".join(lxml_html.tostring(child, encoding="unicode", method="html") for child in list(body or doc))
        self.audit["htmlSectionsRendered"].append({"title": title, "href": href})
        first_class = " first" if first else ""
        return f'<section class="docx-lesson{first_class}" data-source-href="{escape(href)}">{body_html}</section>'

    def render_support_section(self, title: str, href: str, first: bool) -> str:
        support_rel = self.copy_support(href, title)
        first_class = " first" if first else ""
        escaped_title = escape(title or Path(href).name)
        escaped_rel = escape(support_rel)
        return (
            f'<section class="docx-lesson support-section{first_class}">'
            f'<div id="border"><div id="container"><div id="header"><h1>{escaped_title}</h1></div>'
            f'<div id="content"><p><strong>Supporting file:</strong> '
            f'<a href="../{escaped_rel}">{escaped_rel}</a></p>'
            f'<p>Original package path: {escape(href)}</p></div></div></div></section>'
        )

    def inline_css_from_source(self, doc: HtmlElement, base_href: str) -> None:
        for link in list(doc.xpath("//link[@href]")):
            css_href = resolve_package_href(base_href, link.get("href") or "", self.zip_file)
            if css_href and css_href not in self.css_cache:
                self.css_cache[css_href] = decode_html(self.zip_file.read(css_href))
                self.audit["cssFilesInlined"].append(css_href)
            link.drop_tree()

    def clean_document(self, doc: HtmlElement) -> None:
        for node in list(doc.xpath("//script|//noscript|//style")):
            node.drop_tree()
        for node in list(doc.xpath("//*[@class or @id]")):
            class_id = f"{node.get('class') or ''} {node.get('id') or ''}".casefold()
            if "d2l" in class_id or "navigation" in class_id:
                node.drop_tree()
        for anchor in list(doc.xpath("//a")):
            text = normalize_key(anchor.text_content())
            href = (anchor.get("href") or "").strip().casefold()
            if text in NOISE_TEXT or href == "#top":
                anchor.drop_tree()
        for node in list(doc.xpath("//*")):
            for attr in list(node.attrib):
                if attr.casefold().startswith(("data-d2l", "aria-", "onclick", "onload")):
                    node.attrib.pop(attr, None)
            text = normalize_key(node.text_content())
            if text in NOISE_TEXT:
                node.drop_tree()

    def localize_images(self, doc: HtmlElement, base_href: str) -> None:
        for image in list(doc.xpath("//img[@src]")):
            src = image.get("src") or ""
            if is_external_url(src):
                continue
            package_href = resolve_package_href(base_href, src, self.zip_file)
            if not package_href:
                self.audit["unresolvedAssets"].append({"sourceHtml": base_href, "src": src, "kind": "image"})
                image.drop_tree()
                continue
            image.set("src", self.copy_asset(package_href))
            self.constrain_image_node(image, package_href)
            if not image.get("alt"):
                image.set("alt", Path(package_href).name)

    def constrain_image_node(self, image: HtmlElement, package_href: str) -> None:
        width = int_attr(image.get("width"))
        height = int_attr(image.get("height"))
        if not width or not height:
            try:
                with Image.open(BytesIO(self.zip_file.read(package_href))) as source_image:
                    source_image.load()
                    width = width or source_image.width
                    height = height or source_image.height
            except Exception:
                pass
        if width and width > WORD_SAFE_IMAGE_WIDTH_PX:
            ratio = WORD_SAFE_IMAGE_WIDTH_PX / width
            image.set("width", str(WORD_SAFE_IMAGE_WIDTH_PX))
            if height:
                image.set("height", str(max(1, round(height * ratio))))
            self.audit.setdefault("imagesConstrained", []).append(
                {
                    "sourceHref": package_href,
                    "originalWidth": width,
                    "originalHeight": height,
                    "constrainedWidth": WORD_SAFE_IMAGE_WIDTH_PX,
                    "constrainedHeight": max(1, round(height * ratio)) if height else None,
                }
            )

    def normalize_media(self, doc: HtmlElement, base_href: str, title: str) -> None:
        for node in list(doc.xpath("//iframe|//video|//audio|//embed|//object")):
            src = node.get("src") or node.get("data") or ""
            if not src:
                source = node.xpath(".//source[@src]")
                src = source[0].get("src") if source else ""
            if not src:
                node.drop_tree()
                continue
            card = self.video_card(src, node.get("title") or title, base_href)
            card.tail = node.tail
            parent = node.getparent()
            if parent is not None:
                parent.replace(node, card)

    def normalize_links(self, doc: HtmlElement, base_href: str, source_title: str) -> None:
        for anchor in list(doc.xpath("//a[@href]")):
            if anchor.get("data-docx-video-generated") == "1":
                continue
            href = anchor.get("href") or ""
            if is_video_url(href):
                card = self.video_card(href, normalize_text(anchor.text_content()) or source_title, base_href)
                card.tail = anchor.tail
                parent = anchor.getparent()
                if parent is not None:
                    parent.replace(anchor, card)
                continue
            if not is_external_url(href):
                package_href = resolve_package_href(base_href, href, self.zip_file)
                if package_href and not package_href.lower().endswith((".html", ".htm")):
                    support_rel = self.copy_support(package_href, normalize_text(anchor.text_content()) or source_title)
                    anchor.set("href", "../" + support_rel)

    def video_card(self, src: str, title: str, base_href: str) -> HtmlElement:
        handoff = media_handoff_url(src)
        thumb_rel = self.create_video_thumbnail(handoff, title)
        card = lxml_html.Element("div")
        card.set("class", "docx-video-card")
        image_link = lxml_html.Element("a")
        image_link.set("href", handoff)
        image_link.set("data-docx-video-generated", "1")
        image = lxml_html.Element("img")
        image.set("src", thumb_rel)
        image.set("alt", title or "Video thumbnail")
        image.set("class", "docx-video-thumbnail")
        image.set("width", str(WORD_SAFE_IMAGE_WIDTH_PX))
        image.set("height", str(WORD_SAFE_VIDEO_HEIGHT_PX))
        image.set("style", "width:6.45in;height:auto;max-width:100%;")
        image_link.append(image)
        url_para = lxml_html.Element("p")
        url_link = lxml_html.Element("a")
        url_link.set("href", handoff)
        url_link.set("data-docx-video-generated", "1")
        url_link.text = handoff
        url_para.append(url_link)
        card.append(image_link)
        card.append(url_para)
        self.audit["mediaReferences"].append(
            {
                "sourceHtml": base_href,
                "title": title,
                "embedSrc": src,
                "handoffUrl": handoff,
                "thumbnail": thumb_rel,
            }
        )
        return card

    def create_video_thumbnail(self, url: str, title: str) -> str:
        key = hashlib.sha1((url or title).encode("utf-8")).hexdigest()[:12]
        dest = ASSETS_DIR / f"video-{key}.png"
        if not dest.exists():
            image_bytes = self.remote_thumbnail_bytes(url)
            if image_bytes:
                try:
                    dest.write_bytes(self.fitted_thumbnail_bytes(image_bytes))
                except Exception:
                    dest.write_bytes(self.fallback_video_thumbnail(title, url))
            else:
                dest.write_bytes(self.fallback_video_thumbnail(title, url))
        return rel_posix(dest, HTML_DIR)

    def remote_thumbnail_bytes(self, url: str) -> bytes | None:
        video_id = youtube_video_id(url)
        thumbnail_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else ""
        if not thumbnail_url and "ted.com" in urlparse(url).netloc.casefold():
            metadata = self.fetch_json(f"https://www.ted.com/services/v1/oembed.json?url={quote(url, safe='')}")
            thumbnail_url = metadata.get("thumbnail_url", "") if metadata else ""
        if not thumbnail_url:
            return None
        try:
            request = Request(thumbnail_url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(request, timeout=12) as response:
                data = response.read(8 * 1024 * 1024)
                content_type = (response.headers.get("content-type") or "").casefold()
            return data if "image" in content_type else None
        except Exception:
            return None

    def fetch_json(self, url: str) -> dict[str, Any] | None:
        if url in self.media_cache:
            return self.media_cache[url]
        try:
            request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(request, timeout=12) as response:
                data = response.read(512 * 1024)
            parsed = json.loads(data.decode("utf-8"))
            result = parsed if isinstance(parsed, dict) else None
        except Exception:
            result = None
        self.media_cache[url] = result
        return result

    def fitted_thumbnail_bytes(self, image_bytes: bytes) -> bytes:
        image = Image.open(BytesIO(image_bytes))
        image.load()
        image = image.convert("RGB")
        target_w, target_h = WORD_SAFE_IMAGE_WIDTH_PX, WORD_SAFE_VIDEO_HEIGHT_PX
        scale = max(target_w / image.width, target_h / image.height)
        resample = getattr(getattr(Image, "Resampling", Image), "LANCZOS")
        image = image.resize((max(1, int(image.width * scale)), max(1, int(image.height * scale))), resample)
        left = max(0, (image.width - target_w) // 2)
        top = max(0, (image.height - target_h) // 2)
        image = image.crop((left, top, left + target_w, top + target_h))
        draw = ImageDraw.Draw(image, "RGBA")
        self.draw_play_button(draw, target_w, target_h)
        out = BytesIO()
        image.save(out, format="PNG", dpi=(144, 144))
        return out.getvalue()

    def fallback_video_thumbnail(self, title: str, url: str) -> bytes:
        width, height = WORD_SAFE_IMAGE_WIDTH_PX, WORD_SAFE_VIDEO_HEIGHT_PX
        image = Image.new("RGB", (width, height), "#1f3440")
        draw = ImageDraw.Draw(image)
        for y in range(height):
            blend = y / max(height - 1, 1)
            draw.line([(0, y), (width, y)], fill=(int(31 + blend * 28), int(52 + blend * 56), int(64 + blend * 62)))
        font = ImageFont.load_default()
        label = "VIDEO"
        if "ted.com" in urlparse(url).netloc.casefold():
            label = "TED"
        elif "youtube" in urlparse(url).netloc.casefold() or "youtu.be" in urlparse(url).netloc.casefold():
            label = "YOUTUBE"
        draw.text((34, 30), label, fill="#d7eef0", font=font)
        draw.text((34, 72), normalize_text(title)[:90] or "Embedded media", fill="#ffffff", font=font)
        self.draw_play_button(draw, width, height)
        out = BytesIO()
        image.save(out, format="PNG", dpi=(144, 144))
        return out.getvalue()

    def draw_play_button(self, draw: ImageDraw.ImageDraw, width: int, height: int) -> None:
        center_x, center_y = width // 2, height // 2
        radius = max(34, round(min(width, height) * 0.115))
        triangle_w = max(30, round(radius * 0.88))
        triangle_h = max(42, round(radius * 1.02))
        draw.ellipse(
            (center_x - radius, center_y - radius, center_x + radius, center_y + radius),
            fill=(255, 255, 255, 235),
        )
        draw.polygon(
            [
                (center_x - round(triangle_w * 0.33), center_y - triangle_h),
                (center_x - round(triangle_w * 0.33), center_y + triangle_h),
                (center_x + triangle_w, center_y),
            ],
            fill=(31, 52, 64, 255),
        )

    def copy_asset(self, package_href: str) -> str:
        if package_href in self.asset_cache:
            return self.asset_cache[package_href]
        ext = Path(package_href).suffix or ".bin"
        digest = hashlib.sha1(package_href.encode("utf-8")).hexdigest()[:10]
        dest = ASSETS_DIR / f"{safe_name(Path(package_href).stem, 58)}-{digest}{ext}"
        dest.write_bytes(self.zip_file.read(package_href))
        rel = rel_posix(dest, HTML_DIR)
        self.asset_cache[package_href] = rel
        self.audit["imagesCopied"].append({"sourceHref": package_href, "outputPath": rel, "bytes": dest.stat().st_size})
        return rel

    def copy_support(self, package_href: str, label: str) -> str:
        if package_href in self.support_cache:
            return self.support_cache[package_href]
        ext = Path(package_href).suffix or ".resource"
        digest = hashlib.sha1(package_href.encode("utf-8")).hexdigest()[:10]
        dest = SUPPORT_DIR / f"{safe_name(label, 70)}-{digest}{ext}"
        dest.write_bytes(self.zip_file.read(package_href))
        rel = rel_posix(dest, EXPORT_ROOT)
        self.support_cache[package_href] = rel
        self.audit["supportFiles"].append({"sourceHref": package_href, "outputPath": rel, "bytes": dest.stat().st_size})
        return rel

    def combined_html(self, body_parts: list[str]) -> str:
        inlined_css = "\n\n".join(self.css_cache.values())
        generated_css = """
@page { size: 8.5in 11in; margin: 0.55in; }
body { background: #ffffff; color: #333333; font-family: "Trebuchet MS", Calibri, Arial, sans-serif; font-size: 12pt; line-height: 1.42; }
.docx-root { width: 7.35in; margin: 0 auto; }
.docx-lesson { page-break-before: always; margin: 0 0 22pt 0; }
.docx-lesson.first { page-break-before: auto; }
.docx-group-heading { page-break-before: always; margin: 22pt 0 14pt; }
.docx-group-heading h1 { color: #4b4665; font-size: 18pt; border-bottom: 1px solid #cccccc; padding-bottom: 8pt; }
#border { border: 1px solid #a7a7a7; padding: 8px; margin: 0 0 16pt 0; }
#container { width: 100%; margin: 0 auto; }
#header { background: #6096bf; color: #ffffff; padding: 14px 18px; margin: 0 0 18px 0; }
#header h1 { color: #ffffff; font-size: 18pt; font-weight: normal; margin: 0; line-height: 1.2; }
#content h1, #content h2 { color: #4b4665; line-height: 1.25; }
#content h2 { font-size: 17pt; margin: 12pt 0 10pt; }
#content h3 { color: #666666; font-size: 12.5pt; margin: 11pt 0 6pt; }
p { margin: 0 0 9pt 0; }
ul, ol { margin-top: 4pt; margin-bottom: 9pt; }
li { margin-bottom: 4pt; }
img { max-width: 100%; height: auto; }
img[align="left"] { margin: 0 12pt 8pt 0; }
img[align="right"] { margin: 0 0 8pt 12pt; }
#feature, .feature, #readingassignment, #internet, #email, #vocabulary, #bonus { background: #ebf5eb; padding: 10pt; margin: 12pt 0; }
#media, #portfolio, #multipleperspectives, #trackyourprogress, #help { background: #e2e1ee; padding: 10pt; margin: 12pt 0; }
#tools, #skills { background: #d6e1ed; padding: 10pt; margin: 12pt 0; }
#assignmentdrop, #quiz { background: #fff1c9; padding: 10pt; margin: 12pt 0; }
.docx-video-card { background: #ebf5eb; border: 1px solid #222222; padding: 9pt; margin: 12pt 0 16pt; max-width: 6.7in; box-sizing: border-box; }
.docx-video-card a { display: block; }
.docx-video-card p { margin: 7pt 0 0 0; }
.docx-video-thumbnail { display: block; width: 6.45in; max-width: 100%; height: auto; }
a { color: #0563c1; text-decoration: underline; }
hr { border: none; border-top: 1px solid #cccccc; margin: 16pt 0; }
"""
        return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Social Studies 10-1 - Unit 1</title>
<style>
{inlined_css}
{generated_css}
</style>
</head>
<body>
<main class="docx-root">
{''.join(body_parts)}
</main>
</body>
</html>
"""

    def available_docx_path(self, canonical_path: Path) -> Path:
        if not canonical_path.exists():
            return canonical_path
        try:
            with canonical_path.open("ab"):
                return canonical_path
        except PermissionError:
            pass
        for counter in range(2, 100):
            candidate = canonical_path.with_name(f"{canonical_path.stem} - refreshed {counter}{canonical_path.suffix}")
            if not candidate.exists():
                return candidate
            try:
                with candidate.open("ab"):
                    return candidate
            except PermissionError:
                pass
        raise SystemExit("Could not find an unlocked DOCX output path.")

    def import_html_with_word(self, html_path: Path, docx_path: Path) -> None:
        ps1 = HTML_DIR / "word-import-unit1.ps1"
        ps1.write_text(
            f"""
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
$htmlPath = '{str(html_path.resolve()).replace("'", "''")}'
$docxPath = '{str(docx_path.resolve()).replace("'", "''")}'
$doc = $word.Documents.Open($htmlPath, $false, $true)
$doc.SaveAs([ref]$docxPath, [ref]16)
$doc.Close($false)
$word.Quit()
""".strip(),
            encoding="utf-8",
        )
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps1)],
            check=True,
        )


def main() -> None:
    if not ZIP_PATH.exists():
        raise SystemExit(f"Source ZIP not found: {ZIP_PATH}")
    with zipfile.ZipFile(ZIP_PATH) as zip_file:
        manifest_root = ET.fromstring(zip_file.read("imsmanifest.xml"))
        exporter = SocialWordNativeUnitExporter(zip_file, manifest_root)
        output = exporter.build()
        print(f"Wrote {output}")
        print(f"Items accounted for: {len(exporter.audit['itemsAccountedFor'])}")
        print(f"HTML sections rendered: {len(exporter.audit['htmlSectionsRendered'])}")
        print(f"Images copied: {len(exporter.audit['imagesCopied'])}")
        print(f"Media references: {len(exporter.audit['mediaReferences'])}")
        print(f"Support files: {len(exporter.audit['supportFiles'])}")


if __name__ == "__main__":
    main()
