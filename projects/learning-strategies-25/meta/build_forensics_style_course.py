from __future__ import annotations

import hashlib
import json
import os
import posixpath
import re
import shutil
import sys
import zipfile
from datetime import datetime
from html import escape
from pathlib import Path
from typing import Any
from urllib.parse import unquote, urlparse
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "scripts"))

from brightspace_zip_to_docx_upload_package import (  # noqa: E402
    COURSES,
    decode_html,
    first_existing_source,
    is_external_url,
    item_children,
    item_title,
    lxml_html,
    normalize_key,
    normalize_text,
    rel_posix,
    resolve_package_href,
    safe_name,
)


PROJECT_SLUG = "learning-strategies-25"
DATA_GLOBAL = "LEARNING_STRATEGIES_25_DATA"
SOURCE_REF_ROOT = "learning-strategies-25"
CONFIG = COURSES["learning-strategies25"]
REFERENCE_PROJECT = REPO_ROOT / "projects" / "forensicstudiesoption2"
PROJECT_ROOT = REPO_ROOT / "projects" / PROJECT_SLUG
WORKSPACE_DIR = PROJECT_ROOT / "workspace"
RAW_DIR = PROJECT_ROOT / "raw"
META_DIR = PROJECT_ROOT / "meta"
CONTENT_DIR = WORKSPACE_DIR / "content"
REFERENCES_DIR = WORKSPACE_DIR / "references" / SOURCE_REF_ROOT
SOURCE_ZIP = Path(os.environ.get(CONFIG.source_zip_env) or r"c:\Users\dean.guedo\Documents\ONLINE COURSES\Learning Strategies\Learning Strategies 25 (3 credit)\Learning Strategies 25 packages\00_SOURCE_ZIP\D2LCCExport_149442_24-25 _ Learning Strategies 25 (2018) _ Per 1(A-B)_202651901.zip")
ASSET_ZIP = Path(
    os.environ.get("LEARNING_STRATEGIES_25_ASSET_ZIP")
    or r"c:\Users\dean.guedo\Downloads\D2LExport_149442_24-25 _ Learning Strategies 25 (2018) _ Per 1(A-B)_202652130.zip"
)

ACCENTS = [
    "#2f8f6b",
    "#4b7f93",
    "#9a6c2f",
    "#7a6e9f",
    "#5f8f3f",
    "#8d5f62",
    "#4f7c52",
]

NOISE_TEXT = {
    "image source",
    "image sources",
    "iframe preserved from brightspace",
    "youtube video player",
    "embedded media",
    "template javascript",
    "back to top",
}

NEW_WINDOW_HELPER_RE = re.compile(
    r"\(?\s*(?:t?his\s+)?link\s+opens\s+in\s+(?:a\s+)?new\s+window(?:/tab)?\s*\)?",
    re.IGNORECASE,
)
BRIGHTSPACE_EDITOR_HELP_HOST = "documentation.brightspace.com/en/le/html_editor"
D2L_QUICKLINK_PATH = "/d2l/common/dialogs/quicklink/quicklink.d2l"

ASSESSMENT_TITLE_PATTERNS = (
    "assignment",
    "quiz",
    "exam",
    "course pre-requisite",
    "course prerequisite",
)


def local_name(tag: str) -> str:
    return tag.rsplit("}", 1)[-1]


def slugify(value: str, fallback: str = "item") -> str:
    text = safe_name(value, 90).lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or fallback


def read_resources(root: ET.Element) -> dict[str, list[str]]:
    resources: dict[str, list[str]] = {}
    for resource in root.iter():
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


def top_modules(root: ET.Element) -> list[ET.Element]:
    organization = next(node for node in root.iter() if local_name(node.tag) == "organization")
    roots = item_children(organization)
    if len(roots) == 1 and not item_title(roots[0]):
        roots = item_children(roots[0])

    modules: list[ET.Element] = []
    for item in roots:
        title = normalize_key(item_title(item))
        if any(pattern in title for pattern in CONFIG.unwrap_title_patterns):
            modules.extend(item_children(item))
        else:
            modules.append(item)
    return modules


def primary_file(files: list[str]) -> str | None:
    for extension in (".html", ".htm", ".pdf"):
        match = next((file for file in files if file.lower().endswith(extension)), None)
        if match:
            return match
    return files[0] if files else None


def should_skip_top_module(item: ET.Element) -> str | None:
    title = normalize_key(item_title(item))
    if not title:
        return "blank-title"
    for pattern in CONFIG.skip_title_patterns:
        if pattern in title:
            return f"title-matches-{pattern}"
    return None


def is_assessment_item(title: str) -> str | None:
    key = normalize_key(title)
    for pattern in ASSESSMENT_TITLE_PATTERNS:
        if pattern in key:
            return f"content-only-excluded-{pattern}"
    return None


def clean_href(value: str) -> str:
    href = (value or "").replace("\xa0", " ").strip()
    return re.sub(r"^(?:%c2%a0|%a0)+", "", href, flags=re.IGNORECASE).strip()


def strip_new_window_helper(value: str | None) -> str:
    if not value:
        return ""
    cleaned = NEW_WINDOW_HELPER_RE.sub("", value)
    if cleaned == value:
        return value
    return cleaned.strip()


def is_new_window_helper_text(value: str) -> bool:
    text = normalize_text(value)
    if not text:
        return False
    return not normalize_text(NEW_WINDOW_HELPER_RE.sub("", value))


def is_brightspace_editor_help_href(href: str) -> bool:
    return BRIGHTSPACE_EDITOR_HELP_HOST in href.casefold()


def is_d2l_quicklink_href(href: str) -> bool:
    return D2L_QUICKLINK_PATH in href.casefold()


def safe_rmtree(path: Path, allowed_root: Path) -> None:
    if not path.exists():
        return
    resolved = path.resolve()
    allowed = allowed_root.resolve()
    if not str(resolved).lower().startswith(str(allowed).lower()):
        raise SystemExit(f"Refusing to remove path outside {allowed}: {resolved}")
    shutil.rmtree(resolved)


def json_dump(data: Any) -> str:
    return json.dumps(data, ensure_ascii=False, indent=2) + "\n"


class LearningStrategiesShellBuilder:
    def __init__(self) -> None:
        self.zip_file: zipfile.ZipFile
        self.asset_zip_file: zipfile.ZipFile | None = None
        self.asset_entries: dict[str, str] = {}
        self.manifest_root: ET.Element
        self.resources: dict[str, list[str]] = {}
        self.asset_cache: dict[str, str] = {}
        self.source_cache: dict[str, str] = {}
        self.audit: dict[str, Any] = {
            "schemaVersion": 1,
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "projectSlug": PROJECT_SLUG,
            "sourceZip": str(SOURCE_ZIP),
            "assetZip": str(ASSET_ZIP),
            "shellSource": rel_posix(REFERENCE_PROJECT / "workspace", REPO_ROOT),
            "includedChapters": [],
            "skippedTopLevelModules": [],
            "skippedAssessmentItems": [],
            "emptyManifestPlaceholders": [],
            "htmlSectionsRendered": [],
            "supportFiles": [],
            "imagesCopied": [],
            "sourceHtmlCopied": [],
            "unresolvedAssets": [],
            "localHtmlLinks": [],
        }

    def prepare(self) -> None:
        if not SOURCE_ZIP.exists():
            raise SystemExit(f"Source ZIP not found: {SOURCE_ZIP}")

        PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
        META_DIR.mkdir(parents=True, exist_ok=True)
        safe_rmtree(WORKSPACE_DIR, PROJECT_ROOT)
        safe_rmtree(RAW_DIR, PROJECT_ROOT)

        CONTENT_DIR.mkdir(parents=True, exist_ok=True)
        REFERENCES_DIR.mkdir(parents=True, exist_ok=True)
        RAW_DIR.mkdir(parents=True, exist_ok=True)

        styles = (REFERENCE_PROJECT / "workspace" / "styles.css").read_text(encoding="utf-8")
        styles = styles.replace("Forensics 25", "Learning Strategies 25")
        (WORKSPACE_DIR / "styles.css").write_text(styles, encoding="utf-8")

        module_css = (REFERENCE_PROJECT / "workspace" / "content" / "module-index.css").read_text(encoding="utf-8")
        module_css += """

.support-file-card,
.missing-source-note {
  margin-top: 14px;
  padding: 12px 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--paper-muted);
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.5;
}

.support-file-card a {
  color: var(--primary-strong);
  font-weight: 700;
  text-decoration: underline;
}

.lesson-body a:not(:has(img)) {
  color: #1d4ed8 !important;
  font-weight: 700;
  text-decoration-line: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
  border-radius: 4px;
  transition: background-color 140ms ease, color 140ms ease, outline-color 140ms ease;
}

.lesson-body a:not(:has(img)):hover,
.lesson-body a:not(:has(img)):focus-visible {
  color: #1e40af !important;
  background: rgba(37, 99, 235, 0.1);
  outline: 2px solid rgba(37, 99, 235, 0.22);
  outline-offset: 2px;
}

.lesson-body a:has(img) {
  display: inline-block;
}

.missing-resource-link {
  color: #1d4ed8 !important;
  font-weight: 700;
  border-bottom: 2px dashed rgba(37, 99, 235, 0.5);
}

.missing-source-note {
  border-color: rgba(37, 99, 235, 0.36);
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 700;
}

.lesson-body {
  font-size: 0.98rem;
  line-height: 1.62;
}

.lesson-body :where(p, li) {
  max-width: 78ch;
  line-height: 1.62;
}

.lesson-body :where(h1) {
  margin: 0 0 10px;
  color: var(--text);
  font-size: 1.55rem;
  line-height: 1.18;
}

.lesson-body :where(h2) {
  margin: 18px 0 8px;
  color: var(--text);
  font-size: 1.22rem;
  line-height: 1.22;
}

.lesson-body :where(h3, h4, h5, h6) {
  margin: 16px 0 6px;
  color: var(--text);
  font-size: 1.05rem;
  line-height: 1.25;
}

.lesson-body :where(p, ul, ol, blockquote, table, figure) + :where(p, ul, ol, blockquote, table, figure, h1, h2, h3, h4, h5, h6) {
  margin-top: 12px;
}

.lesson-body :where(ul, ol) {
  padding-left: 1.35rem;
}

.lesson-body :where(blockquote) {
  margin: 14px 0;
  padding: 2px 0 2px 16px;
  border-left: 3px solid rgba(37, 99, 235, 0.28);
  color: var(--muted);
}

.lesson-body :where(hr) {
  margin: 18px 0;
  border: 0;
  border-top: 1px solid var(--line);
}

.lesson-card[data-progress-state="active"],
.lesson-card[data-progress-state="locked"] {
  border-color: rgba(37, 99, 235, 0.4);
  background: #f8fbff;
}

.lesson-card[data-progress-state="active"] .sequence-number,
.lesson-card[data-progress-state="locked"] .sequence-number {
  background: rgba(37, 99, 235, 0.14);
  color: #1d4ed8;
}

.lesson-card[data-progress-state="active"] .sequence-kind,
.lesson-card[data-progress-state="locked"] .sequence-kind,
.lesson-card[data-progress-state="active"] .lesson-progress-label,
.lesson-card[data-progress-state="locked"] .lesson-progress-label {
  color: #1d4ed8;
}

.lesson-card[data-progress-state="locked"] .lesson-body,
.lesson-card[data-progress-state="locked"] .sequence-top {
  opacity: 0.42;
  filter: blur(2px);
  pointer-events: none;
  user-select: none;
}

.lesson-card[data-progress-state="locked"] .lesson-progress-actions {
  opacity: 0.55;
}

.lesson-card[data-progress-state="complete"] {
  background: #ffffff;
}

.lesson-body iframe,
.lesson-body video,
.lesson-body audio {
  max-width: 100%;
}
"""
        (CONTENT_DIR / "module-index.css").write_text(module_css, encoding="utf-8")

    def build(self) -> None:
        self.prepare()
        with zipfile.ZipFile(SOURCE_ZIP) as zip_file:
            self.zip_file = zip_file
            if ASSET_ZIP.exists():
                with zipfile.ZipFile(ASSET_ZIP) as asset_zip_file:
                    self.asset_zip_file = asset_zip_file
                    self.asset_entries = {name.casefold(): name for name in asset_zip_file.namelist()}
                    self.build_from_open_zips()
            else:
                self.audit["unresolvedAssets"].append({"sourceHtml": "", "src": str(ASSET_ZIP), "kind": "asset-zip-missing"})
                self.build_from_open_zips()

    def build_from_open_zips(self) -> None:
        self.manifest_root = ET.fromstring(self.zip_file.read("imsmanifest.xml"))
        self.resources = read_resources(self.manifest_root)
        chapters = self.collect_chapters()
        self.write_raw_baseline(chapters)
        self.write_index(len(chapters))
        self.write_main_js()
        self.write_course_data(chapters)
        self.write_project_json()
        self.write_audit()

    def collect_chapters(self) -> list[dict[str, Any]]:
        chapters: list[dict[str, Any]] = []
        for item in top_modules(self.manifest_root):
            skip_reason = should_skip_top_module(item)
            title = item_title(item)
            if normalize_key(title) in {"course information", "keys"}:
                skip_reason = "content-shell-excluded-admin-module"
            if skip_reason:
                self.audit["skippedTopLevelModules"].append(
                    {
                        "title": title,
                        "reason": skip_reason,
                        "children": len(item_children(item)),
                    }
                )
                continue

            chapter_index = len(chapters) + 1
            components: list[dict[str, Any]] = []
            self.collect_components(
                item=item,
                unit_title=title,
                chapter_index=chapter_index,
                components=components,
                trail=[],
            )
            chapter_id = f"chapter-{chapter_index}"
            component_ids = [component["id"] for component in components]
            chapter = {
                "id": chapter_id,
                "code": f"Unit {chapter_index}",
                "number": chapter_index,
                "title": title,
                "accent": ACCENTS[(chapter_index - 1) % len(ACCENTS)],
                "summary": self.chapter_summary(title, components),
                "contentPath": f"./content/{chapter_id}/index.html",
                "componentIds": component_ids,
                "componentCount": len(component_ids),
                "components": components,
            }
            self.write_chapter_page(chapter)
            chapters.append(chapter)
            self.audit["includedChapters"].append(
                {
                    "number": chapter_index,
                    "title": title,
                    "componentCount": len(component_ids),
                    "contentPath": chapter["contentPath"],
                }
            )
        return chapters

    def chapter_summary(self, title: str, components: list[dict[str, Any]]) -> str:
        if not components:
            return "Source content is ready for this unit."
        sample_titles = [component["title"] for component in components[:3]]
        return f"Includes {len(components)} content items, starting with {', '.join(sample_titles)}."

    def resource_files(self, item: ET.Element) -> list[str]:
        ref = item.get("identifierref")
        return self.resources.get(ref, []) if ref else []

    def collect_components(
        self,
        item: ET.Element,
        unit_title: str,
        chapter_index: int,
        components: list[dict[str, Any]],
        trail: list[str],
    ) -> None:
        title = item_title(item)
        skip_reason = is_assessment_item(title)
        if skip_reason:
            self.audit["skippedAssessmentItems"].append(
                {
                    "unitTitle": unit_title,
                    "title": title,
                    "reason": skip_reason,
                    "children": len(item_children(item)),
                }
            )
            return

        files = self.resource_files(item)
        children = item_children(item)
        if files:
            primary = primary_file(files)
            if primary:
                component_number = len(components) + 1
                components.append(self.render_component(unit_title, chapter_index, component_number, title, primary, trail))
            return

        if title and not children:
            self.audit["emptyManifestPlaceholders"].append(
                {
                    "unitTitle": unit_title,
                    "title": title,
                    "reason": "manifest-item-has-no-resource-or-children",
                }
            )
            return

        next_trail = trail + [title] if title and title != unit_title else trail
        for child in children:
            self.collect_components(child, unit_title, chapter_index, components, next_trail)

    def render_component(
        self,
        unit_title: str,
        chapter_index: int,
        component_number: int,
        title: str,
        package_href: str,
        trail: list[str],
    ) -> dict[str, Any]:
        component_id = f"component-{component_number}-{slugify(title)}"
        suffix = Path(package_href).suffix.lower()
        if suffix in {".html", ".htm"}:
            kind = "Reading"
            body_html = self.render_html_body(package_href, title)
        else:
            kind = "Reference"
            body_html = self.render_support_body(package_href, title)

        self.audit["htmlSectionsRendered"].append(
            {
                "unitTitle": unit_title,
                "title": title,
                "href": package_href,
                "kind": kind,
            }
        )
        return {
            "id": component_id,
            "number": component_number,
            "title": title or Path(package_href).stem,
            "kind": kind,
            "trail": " / ".join(part for part in trail if part),
            "sourceHref": package_href,
            "bodyHtml": body_html,
        }

    def render_html_body(self, package_href: str, title: str) -> str:
        raw = decode_html(self.zip_file.read(package_href))
        doc = lxml_html.fromstring(raw)
        self.clean_document(doc)
        self.localize_images(doc, package_href)
        self.normalize_media(doc, package_href, title)
        self.normalize_links(doc, package_href, title)
        body = doc.find(".//body")
        source = body if body is not None else doc
        return "".join(lxml_html.tostring(child, encoding="unicode", method="html") for child in list(source)).strip()

    def clean_document(self, doc: Any) -> None:
        for node in list(doc.xpath("//script|//noscript|//style|//link")):
            node.drop_tree()
        for node in list(doc.xpath("//comment()")):
            node.drop_tree()
        for node in list(doc.xpath("//*[@class or @id]")):
            class_id = f"{node.get('class') or ''} {node.get('id') or ''}".casefold()
            if "d2l" in class_id or "navigation" in class_id:
                node.drop_tree()
        for node in list(doc.xpath("//*")):
            if node.text:
                node.text = strip_new_window_helper(node.text)
            if node.tail:
                node.tail = strip_new_window_helper(node.tail)
        for anchor in list(doc.xpath("//a")):
            text = normalize_key(anchor.text_content())
            href = clean_href(anchor.get("href") or "").casefold()
            anchor.attrib.pop("style", None)
            if (
                text in NOISE_TEXT
                or href == "#top"
                or is_new_window_helper_text(text)
                or is_brightspace_editor_help_href(href)
                or (not normalize_text(anchor.text_content()) and not anchor.xpath(".//img"))
            ):
                anchor.drop_tree()
        for node in list(doc.xpath("//*")):
            for attr in list(node.attrib):
                attr_key = attr.casefold()
                if attr_key.startswith(("data-d2l", "onclick", "onload", "onerror")):
                    node.attrib.pop(attr, None)
            text = normalize_key(node.text_content())
            if text in NOISE_TEXT or is_new_window_helper_text(text):
                node.drop_tree()
                continue
            if re.search(r"\b(assignment booklet|dropbox|contact assignment|course pre-?requisite)\b", text) and len(node.xpath(".//*")) <= 4:
                node.drop_tree()
                continue
            if re.search(r"\bunit\s+\d+\s+assignment\b", text) and len(node.xpath(".//*")) <= 1:
                node.drop_tree()
        self.remove_next_steps_sections(doc)
        self.strip_presentational_markup(doc)
        self.remove_empty_layout_nodes(doc)

    def remove_next_steps_sections(self, doc: Any) -> None:
        for node in list(doc.xpath("//*[self::h1 or self::h2 or self::h3 or self::h4 or self::p or self::strong]")):
            if normalize_key(node.text_content()) != "next steps":
                continue
            removable = node
            for ancestor in node.iterancestors():
                class_names = f" {ancestor.get('class') or ''} ".casefold()
                if " stacked-panels " in class_names:
                    removable = ancestor
                    break
                if " card " in class_names or " card-body " in class_names:
                    removable = ancestor
            parent = removable.getparent()
            if parent is not None:
                removable.drop_tree()

    def strip_presentational_markup(self, doc: Any) -> None:
        for node in list(doc.xpath("//*")):
            for attr in list(node.attrib):
                attr_key = attr.casefold()
                if attr_key in {
                    "class",
                    "id",
                    "role",
                    "tabindex",
                    "aria-controls",
                    "aria-selected",
                    "data-toggle",
                }:
                    node.attrib.pop(attr, None)
                    continue
                if attr_key.startswith("data-"):
                    node.attrib.pop(attr, None)
                    continue
                if attr_key == "style" and node.tag.lower() != "img":
                    node.attrib.pop(attr, None)

    def remove_empty_layout_nodes(self, doc: Any) -> None:
        removable_tags = {"div", "p", "span", "footer", "section", "article"}
        content_xpath = ".//a|.//img|.//iframe|.//video|.//audio|.//object|.//embed|.//table|.//source"
        for node in reversed(list(doc.xpath("//*"))):
            if node.tag.lower() not in removable_tags:
                continue
            if normalize_text(node.text_content()):
                continue
            if node.xpath(content_xpath):
                continue
            parent = node.getparent()
            if parent is not None:
                node.drop_tree()

    def localize_images(self, doc: Any, base_href: str) -> None:
        for image in list(doc.xpath("//img[@src]")):
            src = image.get("src") or ""
            if is_external_url(src):
                image.set("loading", "lazy")
                image.set("decoding", "async")
                continue
            package_href = resolve_package_href(base_href, src, self.zip_file)
            source_zip = self.zip_file
            if not package_href:
                package_href = self.resolve_asset_href(src)
                source_zip = self.asset_zip_file or self.zip_file
            if not package_href:
                self.audit["unresolvedAssets"].append({"sourceHtml": base_href, "src": src, "kind": "image"})
                fallback = lxml_html.Element("div")
                fallback.set("class", "missing-source-note")
                fallback.text = "Image not available yet."
                parent = image.getparent()
                if parent is not None:
                    parent.replace(image, fallback)
                continue
            image.set("src", self.copy_support(package_href, "assets", source_zip))
            image.set("loading", "lazy")
            image.set("decoding", "async")
            if not image.get("alt"):
                image.set("alt", Path(package_href).name)

    def resolve_asset_href(self, src: str) -> str | None:
        if not self.asset_entries:
            return None
        normalized = unquote(clean_href(src)).replace("\\", "/")
        candidates: list[str] = []
        marker = "LS25_2019/"
        if marker.casefold() in normalized.casefold():
            start = normalized.casefold().index(marker.casefold())
            candidates.append(posixpath.normpath(normalized[start:]))
        if "/images/" in normalized:
            candidates.append("LS25_2019/images/" + normalized.split("/images/", 1)[1])
        if "/commonImages/" in normalized:
            candidates.append("LS25_2019/commonImages/" + normalized.split("/commonImages/", 1)[1])
        if normalized.startswith("../../images/"):
            candidates.append("LS25_2019/" + posixpath.normpath(normalized[6:]))
        if normalized.startswith("../../commonImages/"):
            candidates.append("LS25_2019/" + posixpath.normpath(normalized[6:]))
        basename = posixpath.basename(normalized).casefold()
        for candidate in candidates:
            hit = self.asset_entries.get(candidate.casefold())
            if hit:
                return hit
        if basename:
            matches = [actual for key, actual in self.asset_entries.items() if posixpath.basename(key) == basename]
            if len(matches) == 1:
                return matches[0]
        return None

    def normalize_media(self, doc: Any, base_href: str, title: str) -> None:
        for node in list(doc.xpath("//iframe|//video|//audio|//embed|//object")):
            src = node.get("src") or node.get("data") or ""
            if not src:
                source = node.xpath(".//source[@src]")
                src = source[0].get("src") if source else ""
            if not src:
                node.drop_tree()
                continue
            if is_external_url(src):
                node.set("loading", "lazy")
                node.set("title", node.get("title") or title)
                continue
            package_href = resolve_package_href(base_href, src, self.zip_file)
            if package_href:
                localized = self.copy_support(package_href, "media")
                if node.tag.lower() in {"embed", "object"}:
                    link = lxml_html.Element("a")
                    link.set("href", localized)
                    link.set("class", "support-file-link")
                    link.text = normalize_text(title) or Path(package_href).name
                    parent = node.getparent()
                    if parent is not None:
                        parent.replace(node, link)
                else:
                    node.set("src", localized)
            else:
                self.audit["unresolvedAssets"].append({"sourceHtml": base_href, "src": src, "kind": "media"})
                node.drop_tree()

    def normalize_links(self, doc: Any, base_href: str, title: str) -> None:
        for anchor in list(doc.xpath("//a[@href]")):
            href = clean_href(anchor.get("href") or "")
            anchor.attrib.pop("style", None)
            if href.startswith("www."):
                href = f"https://{href}"
                anchor.set("href", href)
            if is_external_url(href):
                parsed = urlparse(href)
                if parsed.scheme in {"http", "https"}:
                    anchor.set("target", "_blank")
                    anchor.set("rel", "noopener")
                continue
            package_href = resolve_package_href(base_href, href, self.zip_file)
            if not package_href:
                self.audit["unresolvedAssets"].append({"sourceHtml": base_href, "src": href, "kind": "link"})
                if is_d2l_quicklink_href(href):
                    replacement = lxml_html.Element("span")
                    replacement.set("class", "missing-resource-link")
                    replacement.set("data-missing-resource", "true")
                    replacement.text = normalize_text(anchor.text_content()) or title or "Resource not available yet"
                    parent = anchor.getparent()
                    if parent is not None:
                        parent.replace(anchor, replacement)
                continue
            if package_href.lower().endswith((".html", ".htm")):
                anchor.set("href", self.copy_source_html(package_href))
                self.audit["localHtmlLinks"].append({"sourceHtml": base_href, "href": href, "packageHref": package_href})
            else:
                anchor.set("href", self.copy_support(package_href, "linked-resources"))
            if not normalize_text(anchor.text_content()):
                anchor.text = title or Path(package_href).name

    def render_support_body(self, package_href: str, title: str) -> str:
        link = self.copy_support(package_href, "support")
        label = escape(title or Path(package_href).name)
        return (
            '<div class="support-file-card">'
            f'<strong>Supporting file:</strong> <a href="{escape(link)}">{label}</a>'
            "</div>"
        )

    def copy_source_html(self, package_href: str) -> str:
        if package_href in self.source_cache:
            return self.source_cache[package_href]
        destination = self.localized_destination(package_href, "source-html")
        title = safe_name(Path(unquote(package_href)).stem, 90)
        trace_html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{escape(title)}</title>
</head>
<body>
<main>
<h1>{escape(title)}</h1>
<p>This reference is included with the course.</p>
</main>
</body>
</html>
"""
        destination.write_text(trace_html, encoding="utf-8")
        rel = self.chapter_relative(destination)
        self.source_cache[package_href] = rel
        self.audit["sourceHtmlCopied"].append(
            {"sourceHref": package_href, "outputPath": rel_posix(destination, WORKSPACE_DIR), "bytes": destination.stat().st_size}
        )
        return rel

    def copy_support(self, package_href: str, category: str, source_zip: zipfile.ZipFile | None = None) -> str:
        source_zip = source_zip or self.zip_file
        cache_key = f"{category}:{id(source_zip)}:{package_href}"
        if cache_key in self.asset_cache:
            return self.asset_cache[cache_key]
        destination = self.localized_destination(package_href, category)
        destination.write_bytes(source_zip.read(package_href))
        rel = self.chapter_relative(destination)
        self.asset_cache[cache_key] = rel
        record = {"sourceHref": package_href, "outputPath": rel_posix(destination, WORKSPACE_DIR), "bytes": destination.stat().st_size}
        if category == "assets":
            self.audit["imagesCopied"].append(record)
        else:
            self.audit["supportFiles"].append(record)
        return rel

    def localized_destination(self, package_href: str, category: str) -> Path:
        suffix = Path(package_href).suffix or ".bin"
        digest = hashlib.sha1(package_href.encode("utf-8")).hexdigest()[:10]
        stem = safe_name(Path(unquote(package_href)).stem, 58)
        destination = REFERENCES_DIR / category / f"{stem}-{digest}{suffix}"
        destination.parent.mkdir(parents=True, exist_ok=True)
        return destination

    def chapter_relative(self, destination: Path) -> str:
        return "../../" + rel_posix(destination, WORKSPACE_DIR)

    def write_chapter_page(self, chapter: dict[str, Any]) -> None:
        chapter_dir = CONTENT_DIR / chapter["id"]
        chapter_dir.mkdir(parents=True, exist_ok=True)
        components_html = "\n".join(self.render_component_card(component) for component in chapter["components"])
        page = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{escape(chapter["title"])} | Learning Strategies 25</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700;800&family=Rubik:wght@500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../module-index.css" />
</head>
<body data-project-slug="{PROJECT_SLUG}" data-chapter-id="{escape(chapter["id"])}">
  <main class="module-page" style="--gold:{escape(chapter["accent"])}; --line-strong:{escape(chapter["accent"])};">
    <section class="module-hero">
      <span class="eyebrow">{escape(chapter["code"])}</span>
      <h1 class="module-title">{escape(chapter["title"])}</h1>
      <p class="module-summary">{escape(chapter["summary"])}</p>
    </section>

    <section class="module-section">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Module Content</span>
          <h2 class="section-title">Lesson sequence</h2>
        </div>
      </div>
      <div class="sequence-list">
        {components_html}
      </div>
    </section>
  </main>
  <script>
{self.module_progress_script()}
  </script>
</body>
</html>
"""
        (chapter_dir / "index.html").write_text(page, encoding="utf-8")

    def render_component_card(self, component: dict[str, Any]) -> str:
        return f"""
        <article class="sequence-card lesson-card" data-module-component-id="{escape(component["id"])}" data-progress-state="locked">
          <div class="sequence-top">
            <span class="sequence-number">{escape(str(component["number"]))}</span>
            <div>
              <span class="sequence-kind">{escape(component["kind"])}</span>
            </div>
          </div>
          <div class="lesson-body">{component["bodyHtml"]}</div>
          <div class="lesson-progress-footer" data-progress-footer>
            <div class="lesson-progress-copy" data-progress-copy>
              <span class="lesson-progress-label">Module progression</span>
              <p class="lesson-progress-note">Mark complete when you finish reviewing this card.</p>
            </div>
            <div class="lesson-progress-actions" data-progress-actions>
              <button class="action-link secondary" type="button" data-mark-complete="{escape(component["id"])}">Mark Complete</button>
              <button class="action-link" type="button" data-mark-complete-next="{escape(component["id"])}">Mark Complete + Next</button>
            </div>
            <span class="lesson-progress-complete" data-progress-complete hidden>Complete</span>
          </div>
        </article>
"""

    def module_progress_script(self) -> str:
        return """(() => {
  const chapterId = document.body.dataset.chapterId || "";
  const readyType = "learning-strategies-25-module-progress-ready";
  const updateType = "learning-strategies-25-module-progress-update";
  const syncType = "learning-strategies-25-module-progress-sync";
  const cards = Array.from(document.querySelectorAll("[data-module-component-id]"));
  const reviewUnlockAll = false;
  let completion = {};

  function postReady() {
    window.parent?.postMessage({ type: readyType, chapterId }, "*");
  }

  function postUpdate(componentId, complete, focusNext = false) {
    window.parent?.postMessage({ type: updateType, chapterId, componentId, complete, focusNext }, "*");
  }

  function nextIncompleteId() {
    const nextCard = cards.find((card) => !completion[card.dataset.moduleComponentId]);
    return nextCard?.dataset.moduleComponentId || "";
  }

  function syncCards(focusComponentId = "") {
    let unlocked = true;
    cards.forEach((card) => {
      const componentId = card.dataset.moduleComponentId || "";
      const complete = !!completion[componentId];
      const cardUnlocked = reviewUnlockAll || unlocked;
      card.dataset.progressState = complete ? "complete" : cardUnlocked ? "active" : "locked";
      card.querySelectorAll("[data-mark-complete], [data-mark-complete-next]").forEach((button) => {
        button.disabled = !cardUnlocked || complete;
      });
      const completeLabel = card.querySelector("[data-progress-complete]");
      if (completeLabel) completeLabel.hidden = !complete;
      const actions = card.querySelector("[data-progress-actions]");
      if (actions) actions.hidden = complete;
      if (!complete && !reviewUnlockAll) unlocked = false;
    });
    if (focusComponentId) {
      document.querySelector(`[data-module-component-id="${CSS.escape(focusComponentId)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-mark-complete], [data-mark-complete-next]");
    if (!button) return;
    const componentId = button.dataset.markComplete || button.dataset.markCompleteNext || "";
    completion[componentId] = true;
    const focusNext = !!button.dataset.markCompleteNext;
    syncCards(focusNext ? nextIncompleteId() : "");
    postUpdate(componentId, true, focusNext);
  });

  window.addEventListener("message", (event) => {
    const payload = event.data;
    if (!payload || typeof payload !== "object") return;
    if (payload.type !== syncType || payload.chapterId !== chapterId) return;
    completion = payload.completion && typeof payload.completion === "object" ? payload.completion : {};
    syncCards(payload.focusComponentId || "");
  });

  syncCards();
  postReady();
})();"""

    def write_index(self, chapter_count: int) -> None:
        index = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Learning Strategies 25</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
  <link rel="stylesheet" href="./styles.css?rev=20260520a" />
</head>
<body data-project-slug="{PROJECT_SLUG}" data-shell-variant="option-2">
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-lockup">
          <div class="brand-text">
            <h1>Learning Strategies 25</h1>
          </div>
          <div class="sidebar-progress" aria-label="Course progress">
            <div id="sidebar-progress-track" class="sidebar-progress-track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
              <div id="sidebar-progress-fill" class="sidebar-progress-fill"></div>
            </div>
          </div>
        </div>
        <button id="menu-toggle" class="menu-toggle" type="button" aria-expanded="false" title="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav class="sidebar-nav" aria-label="Primary navigation">
        <div class="nav-group primary-nav">
          <button id="nav-home" class="nav-item" type="button">
            <i class="fa-solid fa-house"></i>
            <span>Home</span>
          </button>
        </div>

        <div class="nav-group home-tabs" aria-label="Home sections">
          <button id="tab-chapters" class="home-tab active" type="button">
            <i class="fa-solid fa-scroll"></i>
            <span>Chapters</span>
          </button>
          <button id="tab-quizzes" class="home-tab" type="button" hidden>
            <i class="fa-solid fa-circle-question"></i>
            <span>Quizzes</span>
          </button>
          <button id="tab-assignments" class="home-tab" type="button" hidden>
            <i class="fa-solid fa-pen"></i>
            <span>Assignments</span>
          </button>
        </div>
      </nav>
    </aside>

    <main class="content">
      <div class="content-inner">
        <section class="progress-shell is-hero" aria-label="Course progress">
          <div class="progress-panel">
            <div class="progress-copy">
              <div class="progress-hero-top">
                <div class="progress-inline">
                  <span class="metric-label">Overall progress</span>
                  <strong id="progress-percent">0%</strong>
                </div>
                <div class="progress-inline-status">
                  <div>
                    <span class="metric-label">Open chapters</span>
                    <strong id="chapter-progress">{chapter_count}/{chapter_count}</strong>
                  </div>
                  <div>
                    <span class="metric-label">Completed content</span>
                    <strong id="quiz-progress">0/0</strong>
                  </div>
                </div>
              </div>
              <div id="progress-track" class="progress-track" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                <div id="progress-fill" class="progress-fill"></div>
              </div>
              <h2 id="course-title">Learning Strategies 25</h2>
              <p id="course-subtitle">Complete each unit in order and track your progress.</p>
            </div>
          </div>
        </section>

        <section class="content-shell">
          <div class="section-header">
            <h3 id="section-title">Chapters</h3>
            <p id="section-intro">Open each unit and complete lesson cards in sequence to unlock what comes next.</p>
          </div>
          <div id="content-body" class="content-body"></div>
        </section>
      </div>
    </main>
  </div>

  <script src="./course-data.js?rev=20260520a"></script>
  <script src="./main.js?rev=20260520a"></script>
</body>
</html>
"""
        (WORKSPACE_DIR / "index.html").write_text(index, encoding="utf-8")

    def write_main_js(self) -> None:
        main_js = r'''(function () {
  const data = window.LEARNING_STRATEGIES_25_DATA || { course: {}, chapters: [], quizzes: [], assignments: [], library: [] };
  const PROJECT_SLUG = document.body?.dataset.projectSlug || "learning-strategies-25";
  const STORAGE_KEY = "learning-strategies-25.progress";
  const UI_KEY = "learning-strategies-25.ui";
  const COMPACT_NAV_QUERY = "(max-width: 1023px)";

  const refs = {
    body: document.body,
    menuToggle: document.getElementById("menu-toggle"),
    navHome: document.getElementById("nav-home"),
    tabChapters: document.getElementById("tab-chapters"),
    tabQuizzes: document.getElementById("tab-quizzes"),
    tabAssignments: document.getElementById("tab-assignments"),
    courseTitle: document.getElementById("course-title"),
    courseSubtitle: document.getElementById("course-subtitle"),
    sidebarProgressTrack: document.getElementById("sidebar-progress-track"),
    sidebarProgressFill: document.getElementById("sidebar-progress-fill"),
    progressPercent: document.getElementById("progress-percent"),
    progressTrack: document.getElementById("progress-track"),
    progressFill: document.getElementById("progress-fill"),
    chapterProgress: document.getElementById("chapter-progress"),
    quizProgress: document.getElementById("quiz-progress"),
    sectionHeader: document.querySelector(".section-header"),
    sectionTitle: document.getElementById("section-title"),
    sectionIntro: document.getElementById("section-intro"),
    contentBody: document.getElementById("content-body")
  };

  const state = {
    section: "home",
    tab: "chapters",
    activeId: null,
    mobileNavOpen: false,
    sidebarCollapsed: loadUiState().sidebarCollapsed,
    progress: loadProgress()
  };
  let chapterProgressCleanup = null;

  function loadProgress() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        quizComplete: parsed.quizComplete || {},
        moduleComponents: parsed.moduleComponents || {},
        assignmentComplete: parsed.assignmentComplete || {}
      };
    } catch (_error) {
      return { quizComplete: {}, moduleComponents: {}, assignmentComplete: {} };
    }
  }

  function saveProgress() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress));
  }

  function loadUiState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(UI_KEY) || "{}");
      return { sidebarCollapsed: !!parsed.sidebarCollapsed };
    } catch (_error) {
      return { sidebarCollapsed: false };
    }
  }

  function saveUiState() {
    window.localStorage.setItem(UI_KEY, JSON.stringify({ sidebarCollapsed: state.sidebarCollapsed }));
  }

  function isMobile() {
    if (typeof window.matchMedia === "function") {
      return window.matchMedia(COMPACT_NAV_QUERY).matches;
    }
    return window.innerWidth <= 1023;
  }

  function setMobileNav(open) {
    state.mobileNavOpen = open;
    refs.body.classList.toggle("mobile-nav-open", open);
    refs.menuToggle?.setAttribute("aria-expanded", String(open));
  }

  function setSidebarCollapsed(collapsed) {
    state.sidebarCollapsed = collapsed;
    refs.body.classList.toggle("sidebar-collapsed", collapsed);
    saveUiState();
  }

  function toggleNavMode() {
    if (isMobile()) {
      setMobileNav(!state.mobileNavOpen);
      return;
    }
    setSidebarCollapsed(!state.sidebarCollapsed);
  }

  function closeMobileNav() {
    if (isMobile()) {
      setMobileNav(false);
    }
  }

  function cleanText(value) {
    return String(value ?? "").replace(/[\uFFFD]/g, "-").replace(/[â€“â€”]/g, "-");
  }

  function escapeHtml(value) {
    return cleanText(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function findChapter(id) {
    return (data.chapters || []).find((item) => item.id === id) || null;
  }

  function hasQuizzes() {
    return (data.quizzes || []).length > 0;
  }

  function hasAssignments() {
    return (data.assignments || []).length > 0;
  }

  function getAssignments() {
    return data.assignments || [];
  }

  function getVisibleChapters() {
    return data.chapters || [];
  }

  function getChapterComponentIds(chapterId) {
    const chapter = findChapter(chapterId);
    return Array.isArray(chapter?.componentIds) ? chapter.componentIds.filter(Boolean) : [];
  }

  function getChapterComponentState(chapterId) {
    const existing = state.progress.moduleComponents?.[chapterId];
    if (existing && typeof existing === "object") {
      return existing;
    }
    state.progress.moduleComponents[chapterId] = {};
    saveProgress();
    return state.progress.moduleComponents[chapterId];
  }

  function getCompletedComponentCount(chapterId) {
    const componentIds = getChapterComponentIds(chapterId);
    const completion = getChapterComponentState(chapterId);
    return componentIds.filter((componentId) => !!completion[componentId]).length;
  }

  function getNextIncompleteComponentId(chapterId) {
    return getChapterComponentIds(chapterId).find((componentId) => !getChapterComponentState(chapterId)[componentId]) || "";
  }

  function setModuleComponentComplete(chapterId, componentId, complete = true) {
    if (!chapterId || !componentId) return;
    const completion = getChapterComponentState(chapterId);
    completion[componentId] = !!complete;
    saveProgress();
  }

  function isChapterUnlocked() {
    return true;
  }

  function getCompletedQuizCount() {
    return Object.values(state.progress.quizComplete).filter(Boolean).length;
  }

  function getCompletedContentCount() {
    return getVisibleChapters().reduce((sum, chapter) => sum + getCompletedComponentCount(chapter.id), 0);
  }

  function getTotalContentCount() {
    return getVisibleChapters().reduce((sum, chapter) => {
      if (Array.isArray(chapter.componentIds)) return sum + chapter.componentIds.length;
      return sum + (chapter.contentPath ? 1 : 0);
    }, 0);
  }

  function getProgressSummary() {
    const totalQuizzes = (data.quizzes || []).length;
    const totalChapters = getVisibleChapters().length;
    const totalAssignments = getAssignments().length;
    const totalContent = getTotalContentCount();
    const completedContent = getCompletedContentCount();
    const completedQuizzes = getCompletedQuizCount();
    const contentPercent = totalContent ? Math.round((completedContent / totalContent) * 100) : 0;
    return {
      totalQuizzes,
      totalChapters,
      totalAssignments,
      totalContent,
      completedContent,
      completedQuizzes,
      unlockedChapters: totalChapters,
      percent: totalQuizzes ? Math.round((completedQuizzes / totalQuizzes) * 100) : contentPercent
    };
  }

  function syncChapterProgressFrame(chapterId, focusComponentId = "") {
    const frame = refs.contentBody.querySelector(".chapter-content-frame");
    if (!frame || frame.dataset.chapterId !== chapterId || !frame.contentWindow) return;
    frame.contentWindow.postMessage({
      type: "learning-strategies-25-module-progress-sync",
      chapterId,
      completion: getChapterComponentState(chapterId),
      focusComponentId
    }, "*");
  }

  function setupChapterProgressBridge() {
    if (chapterProgressCleanup) {
      chapterProgressCleanup();
      chapterProgressCleanup = null;
    }
    const frame = refs.contentBody.querySelector(".chapter-content-frame");
    if (!frame) return;
    const chapterId = frame.dataset.chapterId || "";
    const handleLoad = () => syncChapterProgressFrame(chapterId);
    frame.addEventListener("load", handleLoad);
    if (frame.contentDocument?.readyState === "interactive" || frame.contentDocument?.readyState === "complete") {
      syncChapterProgressFrame(chapterId);
    }
    chapterProgressCleanup = () => frame.removeEventListener("load", handleLoad);
  }

  function renderNav() {
    if (state.tab === "quizzes" && !hasQuizzes()) state.tab = "chapters";
    if (state.tab === "assignments" && !hasAssignments()) state.tab = "chapters";
    refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
    refs.body.dataset.section = state.section;
    refs.body.dataset.tab = state.tab;
    refs.body.dataset.view = state.activeId ? "detail" : "overview";
    const hasActiveHomeTab = state.section === "home" && ["chapters", "quizzes", "assignments"].includes(state.tab);
    refs.navHome?.classList.toggle("active", state.section === "home" && !hasActiveHomeTab);
    refs.tabChapters?.classList.toggle("active", state.tab === "chapters");
    if (refs.tabQuizzes) refs.tabQuizzes.hidden = !hasQuizzes();
    if (refs.tabAssignments) refs.tabAssignments.hidden = !hasAssignments();
    refs.tabQuizzes?.classList.toggle("active", state.tab === "quizzes");
    refs.tabAssignments?.classList.toggle("active", state.tab === "assignments");
  }

  function renderProgress() {
    const summary = getProgressSummary();
    refs.courseTitle.textContent = data.course?.title || "Course Shell";
    refs.courseSubtitle.textContent = data.course?.subtitle || "Complete each unit in order and track your progress.";
    refs.sidebarProgressTrack?.setAttribute("aria-valuenow", String(summary.percent));
    if (refs.sidebarProgressFill) refs.sidebarProgressFill.style.width = `${summary.percent}%`;
    refs.progressPercent.textContent = `${summary.percent}%`;
    refs.progressTrack?.setAttribute("aria-valuenow", String(summary.percent));
    if (refs.progressFill) refs.progressFill.style.width = `${summary.percent}%`;
    refs.chapterProgress.textContent = `${summary.unlockedChapters}/${summary.totalChapters}`;
    refs.quizProgress.textContent = `${summary.completedContent}/${summary.totalContent}`;
  }

  function setSection(section) {
    state.section = section;
    if (section === "home") state.tab = "chapters";
    state.activeId = null;
    closeMobileNav();
    render();
  }

  function setTab(tab) {
    if (tab === "quizzes" && !hasQuizzes()) tab = "chapters";
    if (tab === "assignments" && !hasAssignments()) tab = "chapters";
    state.section = "home";
    state.tab = tab;
    state.activeId = null;
    closeMobileNav();
    render();
  }

  function openChapter(id) {
    const chapter = findChapter(id);
    if (!chapter || !isChapterUnlocked(chapter)) return;
    state.section = "home";
    state.tab = "chapters";
    state.activeId = id;
    closeMobileNav();
    render();
  }

  function renderSectionHeader() {
    refs.sectionHeader.hidden = false;
    refs.sectionTitle.textContent = state.activeId ? "Chapter Content" : "Chapters";
    refs.sectionIntro.textContent = state.activeId
      ? "Complete lesson cards in sequence. Your progress is saved in this shell."
      : "Open each unit and complete the lesson cards in order.";
  }

  function renderHomeCards() {
    if (state.tab === "chapters" && state.activeId) return renderChapterDetail(findChapter(state.activeId));
    return `
      <div class="card-grid">
        ${getVisibleChapters().map((chapter) => {
          const componentCount = Array.isArray(chapter.componentIds) ? chapter.componentIds.length : 0;
          const completedCount = getCompletedComponentCount(chapter.id);
          return `
            <article class="course-card chapter-card editorial-overview-card" style="--accent:${escapeHtml(chapter.accent || "#2f8f6b")}">
              <p class="card-code">${escapeHtml(chapter.code)}</p>
              <h4 class="card-title">${escapeHtml(chapter.title)}</h4>
              <p class="card-summary">${escapeHtml(chapter.summary)}</p>
              <div class="card-actions">
                <button class="btn btn-primary" type="button" data-open-chapter="${escapeHtml(chapter.id)}">Open content</button>
              </div>
              <div class="status-chip">${escapeHtml(`${completedCount}/${componentCount} components complete`)}</div>
            </article>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderChapterDetail(chapter) {
    if (!chapter) {
      return `<div class="empty-state">This chapter could not be loaded.</div>`;
    }
    const componentCount = Array.isArray(chapter.componentIds) ? chapter.componentIds.length : 0;
    const completedCount = getCompletedComponentCount(chapter.id);
    return `
      <article class="detail-card chapter-detail-card chapter-detail-surface" style="--accent:${escapeHtml(chapter.accent || "#2f8f6b")}">
        <div class="detail-stack chapter-detail-layout">
          <div>
            <p class="detail-eyebrow">${escapeHtml(chapter.code)}</p>
            <h4 class="detail-title">${escapeHtml(chapter.title)}</h4>
            <p class="detail-summary">${escapeHtml(chapter.summary)}</p>
            ${componentCount ? `<div class="status-chip">${escapeHtml(`${completedCount}/${componentCount} components complete`)}</div>` : ""}
          </div>
          <div class="detail-actions">
            <button class="btn btn-muted" type="button" data-back-home="chapters">Back to chapters</button>
          </div>
          <div class="chapter-content-shell">
            <iframe
              class="chapter-content-frame"
              src="${escapeHtml(chapter.contentPath)}"
              title="${escapeHtml(`${chapter.code} content`)}"
              loading="lazy"
              data-chapter-id="${escapeHtml(chapter.id)}"
            ></iframe>
          </div>
        </div>
      </article>
    `;
  }

  function renderContent() {
    if (chapterProgressCleanup) {
      chapterProgressCleanup();
      chapterProgressCleanup = null;
    }
    renderSectionHeader();
    refs.contentBody.innerHTML = renderHomeCards();
    bindContentEvents();
    setupChapterProgressBridge();
  }

  function bindContentEvents() {
    refs.contentBody.onclick = (event) => {
      const chapterButton = event.target.closest("[data-open-chapter]");
      if (chapterButton) return void openChapter(chapterButton.dataset.openChapter);
      const backButton = event.target.closest("[data-back-home]");
      if (backButton) return void setTab(backButton.dataset.backHome);
    };
  }

  function render() {
    renderNav();
    renderProgress();
    renderContent();
  }

  refs.menuToggle?.addEventListener("click", toggleNavMode);
  refs.navHome?.addEventListener("click", () => setSection("home"));
  refs.tabChapters?.addEventListener("click", () => setTab("chapters"));
  refs.tabQuizzes?.addEventListener("click", () => setTab("quizzes"));
  refs.tabAssignments?.addEventListener("click", () => setTab("assignments"));

  window.addEventListener("resize", () => {
    setMobileNav(false);
    renderNav();
  });

  window.addEventListener("message", (event) => {
    const payload = event.data;
    if (!payload || typeof payload !== "object") return;
    if (payload.type === "learning-strategies-25-module-progress-ready" && typeof payload.chapterId === "string") {
      syncChapterProgressFrame(payload.chapterId);
      return;
    }
    if (
      payload.type === "learning-strategies-25-module-progress-update"
      && typeof payload.chapterId === "string"
      && typeof payload.componentId === "string"
    ) {
      setModuleComponentComplete(payload.chapterId, payload.componentId, payload.complete !== false);
      syncChapterProgressFrame(payload.chapterId, payload.focusNext ? getNextIncompleteComponentId(payload.chapterId) : "");
      renderNav();
      renderProgress();
      if (state.activeId === payload.chapterId) renderSectionHeader();
    }
  });

  refs.body.classList.toggle("sidebar-collapsed", state.sidebarCollapsed && !isMobile());
  render();
})();'''
        (WORKSPACE_DIR / "main.js").write_text(main_js, encoding="utf-8")

    def write_course_data(self, chapters: list[dict[str, Any]]) -> None:
        data_chapters = []
        for chapter in chapters:
            data_chapters.append(
                {
                    key: chapter[key]
                    for key in (
                        "id",
                        "code",
                        "number",
                        "title",
                        "accent",
                        "summary",
                        "contentPath",
                        "componentIds",
                        "componentCount",
                    )
                }
            )
        data = {
            "course": {
                "title": "Learning Strategies 25",
                "subtitle": "Complete each unit in order and track your progress.",
                "enableLibrary": False,
            },
            "chapters": data_chapters,
            "quizzes": [],
            "assignments": [],
            "library": [],
        }
        (WORKSPACE_DIR / "course-data.js").write_text(
            f"window.{DATA_GLOBAL} = {json_dump(data).rstrip()};\n",
            encoding="utf-8",
        )

    def write_project_json(self) -> None:
        canonical_files = [
            WORKSPACE_DIR / "index.html",
            WORKSPACE_DIR / "main.js",
            WORKSPACE_DIR / "styles.css",
            WORKSPACE_DIR / "course-data.js",
            CONTENT_DIR / "module-index.css",
        ]
        project = {
            "id": PROJECT_SLUG,
            "slug": PROJECT_SLUG,
            "sourcePath": str(SOURCE_ZIP),
            "inputKind": "brightspace-zip",
            "brightspaceTarget": "course-page",
            "previewModes": ["workspace"],
            "workspaceEntrypoint": str((WORKSPACE_DIR / "index.html").resolve()),
            "rawEntrypoint": str((RAW_DIR / "original.html").resolve()),
            "migrationState": "migrated",
            "projectType": "conversion",
            "preferredWorkflows": ["conversion"],
            "canonicalEntry": str((WORKSPACE_DIR / "index.html").resolve()),
            "canonicalSources": [str(path.resolve()) for path in canonical_files],
            "importedFirstPassOrigin": {
                "sourceSystem": "brightspace",
                "sourcePath": str(SOURCE_ZIP),
                "importedAt": self.audit["generatedAt"],
                "notes": "Content-only first shell build; assignments, quizzes, and hidden teacher material are intentionally excluded for later passes.",
            },
            "exportTargets": [
                {
                    "target": "brightspace",
                    "enabled": True,
                    "notes": "Workspace can be exported after manual review.",
                },
                {
                    "target": "google-hosted",
                    "enabled": False,
                    "notes": "Hosting/deploy metadata has not been configured for this new course.",
                },
            ],
            "authoringStatus": "active",
            "generatedOutputs": [],
            "regenerateCommand": "python projects/learning-strategies-25/meta/build_forensics_style_course.py",
            "injectedComponents": [],
            "referenceOnly": [str((WORKSPACE_DIR / "references").resolve()), str((RAW_DIR / "original.html").resolve())],
            "sourceOfTruthNotes": "Edit workspace files for course shell changes. Regenerate from the source Brightspace ZIP with the project-local builder if the import mapping changes. Quiz and assignment arrays are intentionally empty until those passes are requested.",
            "googleHosted": {
                "trackedStorageKeys": [
                    "learning-strategies-25.progress",
                    "learning-strategies-25.ui",
                ],
                "authMode": "google",
            },
            "learningSource": "other",
            "learningTrust": "auto",
            "learningUpdatedAt": self.audit["generatedAt"],
            "updatedAt": self.audit["generatedAt"],
        }
        (META_DIR / "project.json").write_text(json_dump(project), encoding="utf-8")

    def write_raw_baseline(self, chapters: list[dict[str, Any]]) -> None:
        list_items = "\n".join(f"<li>{escape(chapter['title'])}: {chapter['componentCount']} content items</li>" for chapter in chapters)
        raw = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Learning Strategies 25 Brightspace Import Baseline</title>
</head>
<body>
<h1>Learning Strategies 25 Brightspace Import Baseline</h1>
<p>This baseline records the source ZIP used to generate the active workspace shell.</p>
<p><strong>Source ZIP:</strong> {escape(str(SOURCE_ZIP))}</p>
<h2>Included content chapters</h2>
<ol>
{list_items}
</ol>
</body>
</html>
"""
        (RAW_DIR / "original.html").write_text(raw, encoding="utf-8")

    def write_audit(self) -> None:
        (META_DIR / "source-zip-audit.json").write_text(json_dump(self.audit), encoding="utf-8")


def main() -> None:
    LearningStrategiesShellBuilder().build()
    print(f"Built {PROJECT_SLUG} from {SOURCE_ZIP}")


if __name__ == "__main__":
    main()

