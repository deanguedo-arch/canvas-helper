from __future__ import annotations

import argparse
import hashlib
from dataclasses import dataclass
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


REPO_ROOT = Path(__file__).resolve().parents[1]
WORD_SAFE_IMAGE_WIDTH_PX = 620
WORD_SAFE_VIDEO_HEIGHT_PX = 349
WORD_SAFE_IMAGE_WIDTH_EMU = round(6.45 * 914400)

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

VIDEO_FILE_EXTENSIONS = (
    ".mp4",
    ".mov",
    ".m4v",
    ".webm",
    ".mp3",
    ".m4a",
    ".wav",
)


def source_native_docx_css() -> str:
    return """
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


def next_step_docx_css() -> str:
    return """
@page { size: 8.5in 11in; margin: 0.6in; }
body { background: #ffffff; color: #191C1C; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; font-size: 11.5pt; line-height: 1.48; }
.docx-root { width: 7.2in; margin: 0 auto; }
.docx-lesson { page-break-before: always; margin: 0 0 22pt 0; }
.docx-lesson.first { page-break-before: auto; }
.docx-group-heading { page-break-before: always; margin: 22pt 0 14pt; padding: 11pt 13pt; background: #EAF7E6; border-left: 5pt solid #59A844; }
.docx-group-heading h1 { color: #155608; font-size: 18pt; border-bottom: 1px solid #DDE2DD; padding-bottom: 7pt; margin: 0; line-height: 1.2; }
#border { border: 1px solid #DDE2DD; padding: 10pt; margin: 0 0 16pt 0; background: #FFFFFF; }
#container, .container { width: 100%; margin: 0 auto; }
#header { background: #155608; color: #FFFFFF; padding: 15pt 18pt; margin: 0 0 18pt 0; border-bottom: 4pt solid #59A844; }
#header h1, #header h2, #header h3, #header h4 { color: #FFFFFF; font-size: 18pt; font-weight: bold; margin: 0; line-height: 1.2; }
#content h1, #content h2, h1, h2 { color: #155608; line-height: 1.25; page-break-after: avoid; }
#content h2, h2 { font-size: 17pt; margin: 14pt 0 10pt; }
#content h3, #content h4, #content h5, h3, h4, h5 { color: #155608; font-size: 13pt; margin: 12pt 0 7pt; page-break-after: avoid; }
p { margin: 0 0 9pt 0; }
ul, ol { margin-top: 4pt; margin-bottom: 10pt; padding-left: 20pt; }
li { margin-bottom: 4pt; }
strong { color: #191C1C; }
em { color: #40493B; }
img { max-width: 100%; height: auto; }
img[align="left"] { margin: 0 12pt 8pt 0; }
img[align="right"] { margin: 0 0 8pt 12pt; }
table { border-collapse: collapse; width: 100%; margin: 10pt 0 14pt; }
th { background: #155608; color: #FFFFFF; border: 1px solid #155608; padding: 6pt; font-weight: bold; }
td { border: 1px solid #DDE2DD; padding: 6pt; color: #191C1C; }
tr:nth-child(even) td { background: #F9F9F8; }
.jumbotron, #feature, .feature, #readingassignment, #internet, #email, #vocabulary, #bonus { background: #EAF7E6; border-left: 5pt solid #59A844; padding: 11pt 13pt; margin: 12pt 0; }
#media, #portfolio, #multipleperspectives, #trackyourprogress, #help, #tools, #skills { background: #F9F9F8; border-left: 5pt solid #1E6D0D; padding: 11pt 13pt; margin: 12pt 0; }
#assignmentdrop, #quiz, .media { background: #FFF0CF; border-left: 5pt solid #FDBF3F; padding: 11pt 13pt; margin: 12pt 0; color: #191C1C; }
.docx-video-card { background: #EAF7E6; border: 1px solid #1E6D0D; border-left: 5pt solid #59A844; padding: 10pt; margin: 12pt 0 16pt; max-width: 6.7in; box-sizing: border-box; }
.docx-video-card a { display: block; }
.docx-video-card p { margin: 7pt 0 0 0; color: #191C1C; }
.docx-video-thumbnail { display: block; width: 6.45in; max-width: 100%; height: auto; }
a { color: #155608; text-decoration: underline; font-weight: bold; }
hr { border: none; border-top: 1px solid #DDE2DD; margin: 16pt 0; }
"""


DOCX_STYLE_PROFILES = {
    "source-native": source_native_docx_css,
    "next-step": next_step_docx_css,
}


def docx_css_for_profile(profile: str) -> str:
    try:
        return DOCX_STYLE_PROFILES[profile]()
    except KeyError as exc:
        raise ValueError(f"Unknown DOCX style profile: {profile}") from exc


@dataclass(frozen=True)
class CourseConfig:
    key: str
    project_slug: str
    course_title: str
    source_zip_name: str
    source_zip_env: str
    skip_title_patterns: tuple[str, ...]
    include_title_patterns: tuple[str, ...] = ()
    unwrap_title_patterns: tuple[str, ...] = ()
    docx_style_profile: str = "source-native"


COURSES: dict[str, CourseConfig] = {
    "social10": CourseConfig(
        key="social10",
        project_slug="social-studies-10-1-docx-export",
        course_title="Social Studies 10-1",
        source_zip_name="D2LCCExport_149634_25-26 _ S2 _ Social Studies 10-1 _ Per 1(A) _ Sec _202651213.ZIP",
        source_zip_env="SOCIAL10_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "social30-1": CourseConfig(
        key="social30-1",
        project_slug="social-studies-30-1-docx-export",
        course_title="Social Studies 30-1",
        source_zip_name="D2LCCExport_151146_25-26 _ S2 _ Social Studies 30-1 _ Per 1(A) _ Sec _202652002.zip",
        source_zip_env="SOCIAL30_1_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "english10-2": CourseConfig(
        key="english10-2",
        project_slug="english-lang-arts-10-2-docx-export",
        course_title="English Language Arts 10-2",
        source_zip_name="D2LCCExport_149674_25-26 _ S2 _ English Lang. Arts 10-2 _ Per 1(A) _ _202651230.zip",
        source_zip_env="ENGLISH10_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden"),
    ),
    "english10-1": CourseConfig(
        key="english10-1",
        project_slug="english-lang-arts-10-1-docx-export",
        course_title="English Language Arts 10-1",
        source_zip_name="D2LCCExport_151066_25-26 _ S2 _ English Lang. Arts 10-1 _ Per 1(A) _ _202651527.zip",
        source_zip_env="ENGLISH10_1_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden"),
    ),
    "biology20": CourseConfig(
        key="biology20",
        project_slug="biology-20-docx-export",
        course_title="Biology 20",
        source_zip_name="D2LCCExport_149612_25-26 _ S2 _ Biology 20 _ Per 1(A) _ Sec 2_202651349.zip",
        source_zip_env="BIOLOGY20_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "english10-4": CourseConfig(
        key="english10-4",
        project_slug="english-10-4-docx-export",
        course_title="English 10-4",
        source_zip_name="D2LCCExport_149688_25-26 _ S2 _ English 10-4 _ Per 1(A) _ Sec 2_202651435.zip",
        source_zip_env="ENGLISH10_4_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "english20-4": CourseConfig(
        key="english20-4",
        project_slug="english-20-4-docx-export",
        course_title="English 20-4",
        source_zip_name="D2LCCExport_149691_25-26 _ S2 _ English 20-4 _ Per 1(A) _ Sec 2_202651410.zip",
        source_zip_env="ENGLISH20_4_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "english20-1": CourseConfig(
        key="english20-1",
        project_slug="english-lang-arts-20-1-docx-export",
        course_title="English Language Arts 20-1",
        source_zip_name="D2LCCExport_151068_25-26 _ S2 _ English Lang. Arts 20-1 _ Per 1(A) _ _202651521.zip",
        source_zip_env="ENGLISH20_1_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden"),
    ),
    "english30-4": CourseConfig(
        key="english30-4",
        project_slug="english-30-4-docx-export",
        course_title="English 30-4",
        source_zip_name="D2LCCExport_149653_25-26 _ S2 _ English 30-4 _ Per 1(A) _ Sec 2_202651417.zip",
        source_zip_env="ENGLISH30_4_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "learning-strategies15": CourseConfig(
        key="learning-strategies15",
        project_slug="learning-strategies-15-docx-export",
        course_title="Learning Strategies 15",
        source_zip_name="D2LCCExport_149766_25-26 _ S1 _ Learning Strategies 15 (2018) _ Per 1_202651252.zip",
        source_zip_env="LEARNING_STRATEGIES15_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        docx_style_profile="next-step",
    ),
    "learning-strategies25": CourseConfig(
        key="learning-strategies25",
        project_slug="learning-strategies-25-docx-export",
        course_title="Learning Strategies 25",
        source_zip_name="D2LCCExport_149442_24-25 _ Learning Strategies 25 (2018) _ Per 1(A-B)_202651901.zip",
        source_zip_env="LEARNING_STRATEGIES25_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "learning-strategies35": CourseConfig(
        key="learning-strategies35",
        project_slug="learning-strategies-35-docx-export",
        course_title="Learning Strategies 35",
        source_zip_name="D2LCCExport_149441_24-25 _ Learning Strategies 35 (2018) _ Per 1(A-B)_202651917.zip",
        source_zip_env="LEARNING_STRATEGIES35_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "mental-health-wellness": CourseConfig(
        key="mental-health-wellness",
        project_slug="mental-health-wellness-docx-export",
        course_title="Mental Health & Wellness",
        source_zip_name="D2LCCExport_60408_21-22 _ S2 _ Mental Health _ Wellness _ Per 1(A) __202652043.zip",
        source_zip_env="MENTAL_HEALTH_WELLNESS_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old", "assignment submission"),
        unwrap_title_patterns=("units of study",),
    ),
    "math7": CourseConfig(
        key="math7",
        project_slug="mathematics-7-docx-export",
        course_title="Mathematics 7",
        source_zip_name="D2LExport_16531_20-21 _ Mathematics 7 _ Per 1(A) _ Sec 1_202652610.zip",
        source_zip_env="MATH7_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "math8": CourseConfig(
        key="math8",
        project_slug="mathematics-8-docx-export",
        course_title="Mathematics 8",
        source_zip_name="D2LExport_16533_20-21 _ Mathematics 8 _ Per 1(A) _ Sec 1_202652637.zip",
        source_zip_env="MATH8_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "math9": CourseConfig(
        key="math9",
        project_slug="mathematics-9-docx-export",
        course_title="Mathematics 9",
        source_zip_name="D2LExport_16534_20-21 _ Mathematics 9 _ Per 1(A) _ Sec 1_202652651.zip",
        source_zip_env="MATH9_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "science9": CourseConfig(
        key="science9",
        project_slug="science-9-docx-export",
        course_title="Science 9",
        source_zip_name="D2LExport_16514_20-21 _ Science 9 _ Per 1(A) _ Sec 1_202652623.zip",
        source_zip_env="SCIENCE9_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
    ),
    "science14": CourseConfig(
        key="science14",
        project_slug="science-14-docx-export",
        course_title="Science 14",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("science 14:",),
    ),
    "science10": CourseConfig(
        key="science10",
        project_slug="science-10-docx-export",
        course_title="Science 10",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("science 10:",),
    ),
    "cfl-art": CourseConfig(
        key="cfl-art",
        project_slug="cfl-art-docx-export",
        course_title="CFL Art",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("cfl art:",),
    ),
    "rec2050": CourseConfig(
        key="rec2050",
        project_slug="rec2050-sport-psychology-2-docx-export",
        course_title="REC2050 Sport Psychology 2",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("rec2050 sport psychology 2:",),
    ),
    "ent1020": CourseConfig(
        key="ent1020",
        project_slug="ent1020-elements-of-a-venture-plan-docx-export",
        course_title="ENT1020 Elements of a Venture Plan",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("enterprise and innovation", "ent 1020"),
    ),
    "rec1050": CourseConfig(
        key="rec1050",
        project_slug="rec1050-sport-psychology-1-docx-export",
        course_title="REC1050 Sport Psychology 1",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("rec1050 sport psychology 1:",),
    ),
    "science10-4": CourseConfig(
        key="science10-4",
        project_slug="science-10-4-docx-export",
        course_title="Science 10-4",
        source_zip_name="science-10.zip",
        source_zip_env="SCIENCE10_BUNDLE_SOURCE_ZIP",
        skip_title_patterns=("teacher", "keep hidden", "old"),
        include_title_patterns=("science 10-4:",),
    ),
}


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


def safe_name(value: str, max_len: int = 96) -> str:
    normalized = unicodedata.normalize("NFKD", value or "")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_value = re.sub(r"[^\w\s().,&+-]+", "", ascii_value)
    ascii_value = re.sub(r"\s+", " ", ascii_value).strip()
    ascii_value = ascii_value.replace("&", "and").strip(" .")
    return (ascii_value or "untitled")[:max_len].strip(" .")


def int_attr(value: str | None) -> int | None:
    if not value:
        return None
    match = re.search(r"\d+", value)
    return int(match.group(0)) if match else None


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
    return any(marker in host for marker in VIDEO_HOST_MARKERS) or is_video_file_href(href)


def is_video_file_href(href: str) -> bool:
    parsed = urlparse(href or "")
    return Path(unquote(parsed.path or href or "")).suffix.casefold() in VIDEO_FILE_EXTENSIONS


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


def first_existing_source(config: CourseConfig) -> Path:
    override = os.environ.get(config.source_zip_env)
    candidates = [
        Path(override) if override else None,
        Path.home() / "Downloads" / config.source_zip_name,
        Path(r"C:\Users\dean.guedo\Downloads") / config.source_zip_name,
    ]
    for candidate in candidates:
        if candidate and candidate.exists():
            return candidate
    return next(candidate for candidate in candidates if candidate is not None)


class BrightspaceCourseDocxExporter:
    def __init__(self, config: CourseConfig) -> None:
        self.config = config
        self.project_root = REPO_ROOT / "projects" / config.project_slug
        self.meta_dir = self.project_root / "meta"
        self.upload_root = self.project_root / "exports" / "upload-package"
        self.source_dir = self.upload_root / "00_SOURCE_ZIP"
        self.docx_dir = self.upload_root / "01_DOCX_BY_UNIT"
        self.support_dir = self.upload_root / "02_SUPPORTING_FILES_BY_UNIT"
        self.audit_dir = self.upload_root / "03_AUDITS"
        self.html_dir = self.upload_root / "04_HTML_SOURCE_USED_FOR_IMPORT"
        self.assets_dir = self.html_dir / "assets"
        self.source_zip = first_existing_source(config)
        self.zip_file: zipfile.ZipFile
        self.manifest_root: ET.Element
        self.resources: dict[str, list[str]] = {}
        self.asset_cache: dict[str, str] = {}
        self.support_cache: dict[str, str] = {}
        self.css_cache: dict[str, str] = {}
        self.media_cache: dict[str, dict[str, Any] | None] = {}
        self.generated_units: list[dict[str, Any]] = []
        self.skipped_modules: list[dict[str, Any]] = []
        self.audit: dict[str, Any] = {
            "schemaVersion": 1,
            "generatedAt": datetime.now().isoformat(timespec="seconds"),
            "courseKey": config.key,
            "courseTitle": config.course_title,
            "docxStyleProfile": config.docx_style_profile,
            "sourceZip": str(self.source_zip),
            "outputRoot": rel_posix(self.upload_root, self.project_root),
            "includedUnits": [],
            "skippedTopLevelModules": [],
            "itemsAccountedFor": [],
            "htmlSectionsRendered": [],
            "supportFiles": [],
            "imagesCopied": [],
            "imagesConstrained": [],
            "docxImageExtentsClamped": [],
            "mediaReferences": [],
            "cssFilesInlined": [],
            "localHtmlLinks": [],
            "emptyManifestPlaceholders": [],
            "coverageFailures": [],
            "unresolvedAssets": [],
        }

    def prepare_outputs(self) -> None:
        if not self.source_zip.exists():
            raise SystemExit(f"Source ZIP not found: {self.source_zip}")
        if self.upload_root.exists():
            resolved = self.upload_root.resolve()
            if not str(resolved).lower().startswith(str(self.project_root.resolve()).lower()):
                raise SystemExit(f"Refusing to remove output outside project: {resolved}")
            shutil.rmtree(resolved)
        for target in (self.source_dir, self.docx_dir, self.support_dir, self.audit_dir, self.assets_dir):
            target.mkdir(parents=True, exist_ok=True)
        shutil.copy2(self.source_zip, self.source_dir / self.source_zip.name)
        self.meta_dir.mkdir(parents=True, exist_ok=True)

    def read_resources(self) -> dict[str, list[str]]:
        resources: dict[str, list[str]] = {}
        for resource in self.manifest_root.iter():
            if local_name(resource.tag) != "resource":
                continue
            identifier = resource.get("identifier")
            if not identifier:
                continue
            hrefs: list[str] = []
            resource_href = (resource.get("href") or "").strip()
            if resource_href:
                hrefs.append(resource_href.replace("\\", "/"))
            for file_node in resource:
                if local_name(file_node.tag) != "file":
                    continue
                file_href = (file_node.get("href") or "").strip()
                if file_href:
                    hrefs.append(file_href.replace("\\", "/"))
            resources[identifier] = list(dict.fromkeys(hrefs))
        return resources

    def top_modules(self) -> list[ET.Element]:
        organization = next(node for node in self.manifest_root.iter() if local_name(node.tag) == "organization")
        roots = item_children(organization)
        if len(roots) == 1 and not item_title(roots[0]):
            roots = item_children(roots[0])
        if self.config.include_title_patterns:
            selected_roots = [
                item
                for item in roots
                if any(pattern in normalize_key(item_title(item)) for pattern in self.config.include_title_patterns)
            ]
            if not selected_roots:
                patterns = ", ".join(self.config.include_title_patterns)
                raise SystemExit(f"No top-level modules matched {self.config.key} include patterns: {patterns}")
            roots = []
            for item in selected_roots:
                roots.extend(item_children(item) or [item])
        modules: list[ET.Element] = []
        for item in roots:
            title = normalize_key(item_title(item))
            if any(pattern in title for pattern in self.config.unwrap_title_patterns):
                modules.extend(item_children(item))
            else:
                modules.append(item)
        return modules

    def should_skip_top_module(self, item: ET.Element) -> str | None:
        title = normalize_key(item_title(item))
        if not title:
            return "blank-title"
        for pattern in self.config.skip_title_patterns:
            if pattern in title:
                return f"title-matches-{pattern}"
        return None

    def resource_files(self, item: ET.Element) -> list[str]:
        ref = item.get("identifierref")
        return self.resources.get(ref, []) if ref else []

    def primary_file(self, files: list[str]) -> str | None:
        for ext in (".html", ".htm", ".pdf"):
            match = next((file for file in files if file.lower().endswith(ext)), None)
            if match:
                return match
        return files[0] if files else None

    def build(self) -> Path:
        self.prepare_outputs()
        with zipfile.ZipFile(self.source_zip) as zip_file:
            self.zip_file = zip_file
            self.manifest_root = ET.fromstring(zip_file.read("imsmanifest.xml"))
            self.resources = self.read_resources()
            units = []
            for item in self.top_modules():
                skip_reason = self.should_skip_top_module(item)
                if skip_reason:
                    skipped = {
                        "title": item_title(item),
                        "reason": skip_reason,
                        "children": len(item_children(item)),
                    }
                    self.skipped_modules.append(skipped)
                    self.audit["skippedTopLevelModules"].append(skipped)
                    continue
                units.append(item)
            html_jobs: list[tuple[Path, Path]] = []
            for index, unit in enumerate(units, 1):
                html_path, docx_path = self.build_unit_html(unit, index)
                html_jobs.append((html_path, docx_path))
            if self.audit["coverageFailures"]:
                self.write_audits()
                raise SystemExit(f"Coverage failures found. See {self.audit_dir / 'course-docx-audit.json'}")
            self.import_all_with_word(html_jobs)
            for _, docx_path in html_jobs:
                matching = next((unit for unit in self.generated_units if unit["docxPath"] == rel_posix(docx_path, self.upload_root)), None)
                if matching and docx_path.exists():
                    matching["docxBytes"] = docx_path.stat().st_size
            self.write_readme()
            self.write_audits()
        return self.upload_root

    def build_unit_html(self, unit: ET.Element, unit_index: int) -> tuple[Path, Path]:
        title = item_title(unit)
        unit_folder = f"{unit_index:02d} - {safe_name(title, 80)}"
        unit_support_dir = self.support_dir / unit_folder
        unit_support_dir.mkdir(parents=True, exist_ok=True)
        body_parts: list[str] = []
        for child_index, child in enumerate(item_children(unit), 1):
            body_parts.extend(self.render_item(child, unit_title=title, unit_folder=unit_folder, first=not body_parts))
        if not body_parts:
            files = self.resource_files(unit)
            if files:
                body_parts.extend(self.render_item(unit, unit_title=title, unit_folder=unit_folder, first=True))
        html_path = self.html_dir / f"{unit_index:02d}-{safe_name(title, 80)}.html"
        docx_path = self.docx_dir / f"{unit_index:02d} - {safe_name(title, 100)}.docx"
        html_path.write_text(self.combined_html(title, body_parts), encoding="utf-8")
        unit_record = {
            "index": unit_index,
            "title": title,
            "htmlPath": rel_posix(html_path, self.upload_root),
            "docxPath": rel_posix(docx_path, self.upload_root),
            "supportFolder": rel_posix(unit_support_dir, self.upload_root),
            "children": len(item_children(unit)),
        }
        self.generated_units.append(unit_record)
        self.audit["includedUnits"].append(unit_record)
        return html_path, docx_path

    def render_item(self, item: ET.Element, unit_title: str, unit_folder: str, first: bool, depth: int = 1) -> list[str]:
        title = item_title(item)
        files = self.resource_files(item)
        children = item_children(item)
        self.audit["itemsAccountedFor"].append(
            {
                "unitTitle": unit_title,
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
                parts.append(self.render_html_section(unit_title, title, primary, first=first and not parts))
            elif primary:
                parts.append(self.render_support_section(unit_title, title, primary, unit_folder, first=first and not parts))
            else:
                self.audit["coverageFailures"].append({"unitTitle": unit_title, "title": title, "reason": "resource-has-no-primary-file", "files": files})
        elif title and children and depth > 1:
            parts.append(f'<section class="docx-group-heading"><h1>{escape(title)}</h1></section>')
        elif title and not children:
            self.audit["emptyManifestPlaceholders"].append(
                {
                    "unitTitle": unit_title,
                    "title": title,
                    "reason": "manifest-item-has-no-resource-or-children",
                }
            )
        for child in children:
            parts.extend(self.render_item(child, unit_title=unit_title, unit_folder=unit_folder, first=first and not parts, depth=depth + 1))
        return parts

    def render_html_section(self, unit_title: str, title: str, href: str, first: bool) -> str:
        raw = decode_html(self.zip_file.read(href))
        doc = lxml_html.fromstring(raw)
        self.inline_css_from_source(doc, href)
        self.clean_document(doc)
        self.localize_images(doc, href)
        self.normalize_media(doc, href, title or unit_title)
        self.normalize_links(doc, href, title or unit_title)
        body = doc.find(".//body")
        source = body if body is not None else doc
        body_html = "".join(lxml_html.tostring(child, encoding="unicode", method="html") for child in list(source))
        self.audit["htmlSectionsRendered"].append({"unitTitle": unit_title, "title": title, "href": href})
        first_class = " first" if first else ""
        return f'<section class="docx-lesson{first_class}" data-source-href="{escape(href)}">{body_html}</section>'

    def render_support_section(self, unit_title: str, title: str, href: str, unit_folder: str, first: bool) -> str:
        archive_href = href
        if href.startswith("/") and package_path_exists(self.zip_file, href.lstrip("/")):
            archive_href = href.lstrip("/")
        looks_external = is_external_url(href) or (
            href.startswith("/") and not package_path_exists(self.zip_file, href) and not package_path_exists(self.zip_file, href.lstrip("/"))
        )
        if looks_external:
            first_class = " first" if first else ""
            escaped_title = escape(title or href)
            escaped_href = escape(href)
            return (
                f'<section class="docx-lesson support-section{first_class}">'
                f'<div id="border"><div id="container"><div id="header"><h1>{escaped_title}</h1></div>'
                f'<div id="content"><p><strong>External supporting link:</strong> '
                f'<a href="{escaped_href}">{escaped_href}</a></p></div></div></div></section>'
            )
        support_rel = self.copy_support(archive_href, title or Path(archive_href).name, unit_folder)
        first_class = " first" if first else ""
        escaped_title = escape(title or Path(href).name)
        escaped_rel = escape(support_rel)
        if is_video_file_href(href):
            card = self.video_card("../" + support_rel, title or Path(href).name, href)
            card_html = lxml_html.tostring(card, encoding="unicode", method="html")
            return (
                f'<section class="docx-lesson support-section{first_class}">'
                f'<div id="border"><div id="container"><div id="header"><h1>{escaped_title}</h1></div>'
                f'<div id="content">{card_html}</div></div></div>'
                f'</section>'
            )
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
            constrained_height = max(1, round(height * ratio)) if height else None
            image.set("width", str(WORD_SAFE_IMAGE_WIDTH_PX))
            if constrained_height:
                image.set("height", str(constrained_height))
            self.audit["imagesConstrained"].append(
                {
                    "sourceHref": package_href,
                    "originalWidth": width,
                    "originalHeight": height,
                    "constrainedWidth": WORD_SAFE_IMAGE_WIDTH_PX,
                    "constrainedHeight": constrained_height,
                }
            )
        elif width:
            image.set("width", str(min(width, WORD_SAFE_IMAGE_WIDTH_PX)))
        image.set("style", "max-width:6.45in;height:auto;")

    def normalize_media(self, doc: HtmlElement, base_href: str, title: str) -> None:
        for node in list(doc.xpath("//iframe|//video|//audio|//embed|//object")):
            src = node.get("src") or node.get("data") or ""
            if not src:
                source = node.xpath(".//source[@src]")
                src = source[0].get("src") if source else ""
            if not src:
                node.drop_tree()
                continue
            card_src = src
            if not is_external_url(src):
                package_href = resolve_package_href(base_href, src, self.zip_file)
                if package_href and is_video_file_href(package_href):
                    support_rel = self.copy_support(package_href, node.get("title") or title, "Linked Media")
                    card_src = "../" + support_rel
            card = self.video_card(card_src, node.get("title") or title, base_href)
            card.tail = node.tail
            parent = node.getparent()
            if parent is not None:
                parent.replace(node, card)

    def normalize_links(self, doc: HtmlElement, base_href: str, source_title: str) -> None:
        for anchor in list(doc.xpath("//a[@href]")):
            if anchor.get("data-docx-video-generated") == "1":
                continue
            href = anchor.get("href") or ""
            if is_external_url(href) and is_video_url(href):
                card = self.video_card(href, normalize_text(anchor.text_content()) or source_title, base_href)
                card.tail = anchor.tail
                parent = anchor.getparent()
                if parent is not None:
                    parent.replace(anchor, card)
                continue
            if not is_external_url(href):
                package_href = resolve_package_href(base_href, href, self.zip_file)
                if package_href and is_video_file_href(package_href):
                    support_rel = self.copy_support(package_href, normalize_text(anchor.text_content()) or source_title, "Linked Media")
                    card = self.video_card("../" + support_rel, normalize_text(anchor.text_content()) or source_title, base_href)
                    card.tail = anchor.tail
                    parent = anchor.getparent()
                    if parent is not None:
                        parent.replace(anchor, card)
                elif package_href and not package_href.lower().endswith((".html", ".htm")):
                    support_rel = self.copy_support(package_href, normalize_text(anchor.text_content()) or source_title, "Linked Resources")
                    anchor.set("href", "../" + support_rel)
                elif package_href and package_href.lower().endswith((".html", ".htm")):
                    self.audit["localHtmlLinks"].append({"sourceHtml": base_href, "href": href, "packageHref": package_href})

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
        dest = self.assets_dir / f"video-{key}.png"
        if not dest.exists():
            image_bytes = self.remote_thumbnail_bytes(url)
            if image_bytes:
                try:
                    dest.write_bytes(self.fitted_thumbnail_bytes(image_bytes))
                except Exception:
                    dest.write_bytes(self.fallback_video_thumbnail(title, url))
            else:
                dest.write_bytes(self.fallback_video_thumbnail(title, url))
        return rel_posix(dest, self.html_dir)

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
        host = urlparse(url).netloc.casefold()
        if "ted.com" in host:
            label = "TED"
        elif "youtube" in host or "youtu.be" in host:
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
        draw.ellipse((center_x - radius, center_y - radius, center_x + radius, center_y + radius), fill=(255, 255, 255, 235))
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
        dest = self.assets_dir / f"{safe_name(Path(package_href).stem, 58)}-{digest}{ext}"
        dest.write_bytes(self.zip_file.read(package_href))
        rel = rel_posix(dest, self.html_dir)
        self.asset_cache[package_href] = rel
        self.audit["imagesCopied"].append({"sourceHref": package_href, "outputPath": rel, "bytes": dest.stat().st_size})
        return rel

    def copy_support(self, package_href: str, label: str, unit_folder: str) -> str:
        cache_key = f"{unit_folder}:{package_href}"
        if cache_key in self.support_cache:
            return self.support_cache[cache_key]
        ext = Path(package_href).suffix or ".resource"
        digest = hashlib.sha1(package_href.encode("utf-8")).hexdigest()[:10]
        destination_dir = self.support_dir / safe_name(unit_folder, 48)
        destination_dir.mkdir(parents=True, exist_ok=True)
        dest = destination_dir / f"{safe_name(label, 30)}-{digest}{ext}"
        dest.write_bytes(self.zip_file.read(package_href))
        rel = rel_posix(dest, self.upload_root)
        self.support_cache[cache_key] = rel
        self.audit["supportFiles"].append({"sourceHref": package_href, "outputPath": rel, "bytes": dest.stat().st_size})
        return rel

    def combined_html(self, unit_title: str, body_parts: list[str]) -> str:
        inlined_css = "\n\n".join(self.css_cache.values())
        generated_css = docx_css_for_profile(self.config.docx_style_profile)
        return f"""<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>{escape(self.config.course_title)} - {escape(unit_title)}</title>
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

    def import_all_with_word(self, html_jobs: list[tuple[Path, Path]]) -> None:
        job_json = self.html_dir / "word-import-jobs.json"
        ps1 = self.html_dir / "word-import-course.ps1"
        job_json.write_text(
            json.dumps(
                [{"html": str(html.resolve()), "docx": str(docx.resolve())} for html, docx in html_jobs],
                indent=2,
            ),
            encoding="utf-8",
        )
        ps1.write_text(
            f"""
$ErrorActionPreference = 'Stop'
$jobs = Get-Content -LiteralPath '{str(job_json.resolve()).replace("'", "''")}' -Raw | ConvertFrom-Json
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {{
  foreach ($job in $jobs) {{
    $doc = $null
    for ($attempt = 1; $attempt -le 10 -and $null -eq $doc; $attempt++) {{
      try {{
        $doc = $word.Documents.Open($job.html, $false, $true)
      }} catch {{
        if ($attempt -eq 10) {{ throw }}
        Start-Sleep -Milliseconds (200 * $attempt)
      }}
    }}
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
    $saved = $false
    for ($attempt = 1; $attempt -le 10 -and -not $saved; $attempt++) {{
      try {{
        $doc.SaveAs([ref]$job.docx, [ref]16)
        $saved = $true
      }} catch {{
        if ($attempt -eq 10) {{ throw }}
        Start-Sleep -Milliseconds (250 * $attempt)
      }}
    }}
    try {{
      $doc.Close($false)
    }} catch {{
    }}
  }}
}} finally {{
  try {{
    $word.Quit()
  }} catch {{
  }}
}}
""".strip(),
            encoding="utf-8",
        )
        subprocess.run(
            ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(ps1)],
            check=True,
        )
        for _, docx_path in html_jobs:
            self.clamp_docx_image_extents(docx_path)

    def clamp_docx_image_extents(self, docx_path: Path) -> None:
        if not docx_path.exists():
            return
        temp_path = docx_path.with_name(docx_path.stem + ".tmp.docx")
        changed_entries: list[dict[str, Any]] = []

        def clamp_extent(match: re.Match[str], entry_name: str) -> str:
            cx = int(match.group("cx"))
            cy = int(match.group("cy"))
            if cx <= WORD_SAFE_IMAGE_WIDTH_EMU:
                return match.group(0)
            ratio = WORD_SAFE_IMAGE_WIDTH_EMU / cx
            new_cy = max(1, round(cy * ratio))
            changed_entries.append(
                {
                    "docxPath": rel_posix(docx_path, self.upload_root),
                    "entry": entry_name,
                    "originalCx": cx,
                    "originalCy": cy,
                    "clampedCx": WORD_SAFE_IMAGE_WIDTH_EMU,
                    "clampedCy": new_cy,
                }
            )
            return f'{match.group("prefix")}cx="{WORD_SAFE_IMAGE_WIDTH_EMU}" cy="{new_cy}"'

        with zipfile.ZipFile(docx_path, "r") as source_zip, zipfile.ZipFile(temp_path, "w", zipfile.ZIP_DEFLATED) as target_zip:
            for info in source_zip.infolist():
                data = source_zip.read(info.filename)
                if info.filename.startswith("word/") and info.filename.endswith(".xml"):
                    text = data.decode("utf-8", errors="ignore")
                    text = re.sub(
                        r'(?P<prefix><(?:wp:extent|a:ext)\s+)cx="(?P<cx>\d+)" cy="(?P<cy>\d+)"',
                        lambda match, entry=info.filename: clamp_extent(match, entry),
                        text,
                    )
                    data = text.encode("utf-8")
                target_zip.writestr(info, data)
        temp_path.replace(docx_path)
        self.audit["docxImageExtentsClamped"].extend(changed_entries)

    def write_readme(self) -> None:
        lines = [
            f"# {self.config.course_title} Brightspace ZIP to DOCX Upload Package",
            "",
            f"Generated: {self.audit['generatedAt']}",
            f"DOCX style profile: `{self.config.docx_style_profile}`",
            "",
            "## Folder contents",
            "",
            "- `00_SOURCE_ZIP/`: untouched Brightspace export ZIP.",
            "- `01_DOCX_BY_UNIT/`: editable Word documents, one per included top-level unit/module.",
            "- `02_SUPPORTING_FILES_BY_UNIT/`: copied PDFs, slides, docs, and other linked files.",
            "- `03_AUDITS/`: conversion reports and manifest coverage.",
            "- `04_HTML_SOURCE_USED_FOR_IMPORT/`: cleaned HTML that Word imported to create the DOCX files.",
            "",
            "## Included DOCX files",
            "",
        ]
        for unit in self.generated_units:
            lines.append(f"- `{unit['docxPath']}`")
        if self.skipped_modules:
            lines.extend(["", "## Skipped top-level modules", ""])
            for item in self.skipped_modules:
                lines.append(f"- `{item['title']}`: {item['reason']}")
        lines.extend(
            [
                "",
                "## Conversion behavior",
                "",
                "- Videos are represented as clickable thumbnails plus raw HTTPS links.",
                "- Images are copied from the ZIP and constrained to fit the Word page when needed.",
                "- LMS noise such as image-source labels, iframe-preservation notes, and template JavaScript is removed.",
                "- Non-HTML resources are copied into supporting files and linked from the DOCX.",
            ]
        )
        (self.upload_root / "00_README.md").write_text("\n".join(lines), encoding="utf-8")

    def write_audits(self) -> None:
        structure = {
            "courseTitle": self.config.course_title,
            "sourceZip": str(self.source_zip),
            "topLevelModules": [
                self.structure_record(item)
                for item in self.top_modules()
            ],
        }
        reports = {
            "course-docx-audit.json": self.audit,
            "course-structure-map.json": structure,
            "manifest-coverage-report.json": {
                "includedUnits": self.audit["includedUnits"],
                "skippedTopLevelModules": self.audit["skippedTopLevelModules"],
                "itemsAccountedFor": self.audit["itemsAccountedFor"],
                "emptyManifestPlaceholders": self.audit["emptyManifestPlaceholders"],
                "coverageFailures": self.audit["coverageFailures"],
            },
            "media-conversion-report.json": {
                "mediaReferences": self.audit["mediaReferences"],
            },
            "missing-assets-report.json": {
                "unresolvedAssets": self.audit["unresolvedAssets"],
                "localHtmlLinks": self.audit["localHtmlLinks"],
            },
        }
        for filename, payload in reports.items():
            (self.audit_dir / filename).write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
            (self.meta_dir / filename).write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    def structure_record(self, item: ET.Element) -> dict[str, Any]:
        ref = item.get("identifierref")
        return {
            "title": item_title(item),
            "identifier": item.get("identifier"),
            "identifierref": ref,
            "files": self.resources.get(ref, []) if ref else [],
            "children": [self.structure_record(child) for child in item_children(item)],
        }


def run_course(course_key: str) -> Path:
    config = COURSES[course_key]
    exporter = BrightspaceCourseDocxExporter(config)
    output = exporter.build()
    print(f"Wrote upload package: {output}")
    print(f"Included units: {len(exporter.generated_units)}")
    print(f"Skipped top-level modules: {len(exporter.skipped_modules)}")
    print(f"HTML sections rendered: {len(exporter.audit['htmlSectionsRendered'])}")
    print(f"Images copied: {len(exporter.audit['imagesCopied'])}")
    print(f"Media references: {len(exporter.audit['mediaReferences'])}")
    print(f"Support files: {len(exporter.audit['supportFiles'])}")
    return output


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Build clean Brightspace ZIP to DOCX upload packages.")
    parser.add_argument("--course", choices=sorted(COURSES), action="append", required=True)
    args = parser.parse_args(argv)
    for course_key in args.course:
        run_course(course_key)


if __name__ == "__main__":
    main()
