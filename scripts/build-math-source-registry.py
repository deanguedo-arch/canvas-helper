#!/usr/bin/env python3
"""Deterministic, privacy-conscious source registry for the Math course family.

Inspects private D2L/Brightspace export ZIPs named in an inputs manifest and
emits metadata-only outputs (no lesson text, prompts, choices, answers,
feedback bodies, or binaries). ZIP members are read into bounded memory only;
nothing is ever extracted to disk.

Usage:
    python3 scripts/build-math-source-registry.py \
        --source-root <private-directory> \
        --inputs tasks/math-source-registry/SOURCE_INPUTS.json \
        --output-dir <ignored-runtime-directory>

Exit codes: 0 = all validated, audit passed; 1 = source validation failure;
3 = output privacy self-audit failure.
"""

import argparse
import hashlib
import json
import os
import re
import struct
import sys
import urllib.parse
import zipfile
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

SCHEMA_VERSION = 1
TOOL_NAME = "build-math-source-registry"

DEFAULT_MAX_MEMBER_BYTES = 8_000_000
DEFAULT_MAX_TOTAL_BYTES = 134_217_728
MAX_TITLE_CHARS = 300
MAX_TEXT_CHARS = 200_000
MAX_REF_CHARS = 500

AUTHORITATIVE_ROLE = "authoritative_source_export"
DUPLICATE_ROLE = "duplicate_local_copy"

ALLOWED_TOPIC_TAGS = (
    "factoring",
    "right-triangle-trigonometry",
    "math20-fixture",
    "math30-fixture",
    "unclassified",
)

HTML_EXTS = (".html", ".htm")
TEXT_LIKE_EXTS = (
    ".html", ".htm", ".xhtml", ".xml", ".txt", ".csv",
    ".json", ".css", ".js",
)
IMAGE_EXTS = {
    ".png": "image", ".jpg": "image", ".jpeg": "image",
    ".gif": "image", ".bmp": "image", ".svg": "image",
    ".webp": "image", ".tif": "image", ".tiff": "image",
}
PDF_EXTS = {".pdf": "pdf"}
AUDIO_EXTS = {
    ".mp3": "audio", ".wav": "audio", ".ogg": "audio",
    ".m4a": "audio", ".mid": "audio", ".midi": "audio",
}
VIDEO_EXTS = {
    ".mp4": "video", ".webm": "video", ".mov": "video",
    ".m4v": "video", ".avi": "video",
}
ASSET_EXTS = {}
for _group in (IMAGE_EXTS, PDF_EXTS, AUDIO_EXTS, VIDEO_EXTS):
    ASSET_EXTS.update(_group)

# Tokens that must never appear as JSON keys in serialized outputs. Checked
# case-insensitively as exact quoted key names ("token":). Deliberately
# excludes emitted boolean keys such as "hasResponseKey".
FORBIDDEN_OUTPUT_TOKENS = (
    "prompt",
    "prompttext",
    "questiontext",
    "choicetext",
    "choices",
    "options",
    "correctanswer",
    "answerkey",
    "responsevalue",
    "feedbacktext",
    "feedbackbody",
    "lessontext",
    "visibletext",
    "bodytext",
    "fulltext",
    "password",
    "credential",
    "querystring",
)

OUTPUT_FILES = (
    "registry-summary.json",
    "course-archives.json",
    "content-index.ndjson",
    "question-reference-index.ndjson",
    "assessment-relations.ndjson",
    "asset-index.ndjson",
)


def _localname(tag):
    """Strip namespace and fold case for XML/HTML tag comparison."""
    if not isinstance(tag, str):
        return ""
    if "}" in tag:
        tag = tag.rsplit("}", 1)[1]
    return tag.strip().lower()


def _sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def _sha256_file(path, chunk_size=1 << 20):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        while True:
            chunk = handle.read(chunk_size)
            if not chunk:
                break
            digest.update(chunk)
    return digest.hexdigest()


def _write_json(path, obj):
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        json.dump(obj, handle, sort_keys=True, ensure_ascii=False, indent=2)
        handle.write("\n")


def _write_ndjson(path, rows):
    with open(path, "w", encoding="utf-8", newline="\n") as handle:
        for row in rows:
            handle.write(
                json.dumps(row, sort_keys=True, ensure_ascii=False) + "\n"
            )


def _strip_query_fragment(ref):
    """Remove URL query strings and fragments; they must never reach outputs."""
    ref = ref.strip()
    if not ref:
        return ""
    for cut in ("#", "?"):
        if cut in ref:
            ref = ref.split(cut, 1)[0]
    return ref.strip()


def _external_host(value):
    """Return the lowercase hostname for absolute http(s) URLs, else ''."""
    text = value.strip()
    if not text:
        return ""
    lowered = text.lower()
    if lowered.startswith(("http://", "https://")):
        try:
            host = urllib.parse.urlsplit(text).hostname or ""
        except ValueError:
            return ""
        return host.lower()
    return ""


def infer_topic_tags(course_code, member_path, title="", visible_text=""):
    """Conservative evidence-label tagging; never implies curriculum approval."""
    blob = "\n".join((member_path or "", title or "", visible_text or "")).lower()
    tags = set()
    if "factor" in blob:
        tags.add("factoring")
    if (
        "trigonometr" in blob
        or "right triangle" in blob
        or "right-triangle" in blob
        or "right_triangle" in blob
        or "sohcahtoa" in blob
        or "soh-cah-toa" in blob
    ):
        tags.add("right-triangle-trigonometry")
    if course_code == "Math 20-1":
        tags.add("math20-fixture")
    elif course_code == "Math 30-1":
        tags.add("math30-fixture")
    if not tags:
        tags.add("unclassified")
    return sorted(tags)


def is_question_member(name):
    lowered = name.lower()
    return lowered.endswith(".xml") and (
        "questiondb" in lowered
        or "question_bank" in lowered
        or "questionbank" in lowered
        or "/questions/" in lowered
        or lowered.startswith("questions/")
    )


def is_quiz_member(name):
    lowered = name.lower()
    return (
        lowered.endswith(".xml")
        and ("quiz" in lowered or "assessment" in lowered)
        and not is_question_member(name)
    )


def is_html_member(name):
    return name.lower().endswith(HTML_EXTS)


def is_asset_member(name):
    return os.path.splitext(name.lower())[1] in ASSET_EXTS


def member_unsafe_reason(name):
    """Return a reason string for rejected ZIP member names, else ''."""
    if name == "":
        return "empty-name"
    if name.startswith("/") or name.startswith("\\"):
        return "absolute-path"
    if re.match(r"^[A-Za-z]:", name):
        return "drive-absolute-path"
    segments = name.replace("\\", "/").split("/")
    if any(seg == ".." for seg in segments):
        return "path-traversal"
    if "\x00" in name:
        return "nul-byte"
    return ""


def find_case_collisions(names):
    """Group member names that collide under case-insensitive comparison."""
    buckets = {}
    for name in names:
        buckets.setdefault(name.lower(), []).append(name)
    groups = []
    for lowered in sorted(buckets):
        originals = sorted(set(buckets[lowered]))
        if len(originals) > 1:
            groups.append(originals)
    return groups


def decode_html_bytes(raw):
    """Decode HTML bytes, reporting the encoding used. Bounded by caller."""
    if raw.startswith(b"\xef\xbb\xbf"):
        return raw[3:].decode("utf-8", errors="strict"), "utf-8-sig"
    if raw.startswith(b"\xff\xfe") or raw.startswith(b"\xfe\xff"):
        return raw.decode("utf-16", errors="strict"), "utf-16"
    try:
        return raw.decode("utf-8", errors="strict"), "utf-8"
    except UnicodeDecodeError:
        pass
    if b"\x00" in raw:
        try:
            return raw.decode("utf-16", errors="strict"), "utf-16"
        except UnicodeDecodeError:
            pass
    return raw.decode("windows-1252", errors="strict"), "windows-1252"


class _HtmlMetadataParser(HTMLParser):
    """Collect structural metadata only; visible text is counted, not kept."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_parts = []
        self.in_title = False
        self.title_done = False
        self.skip_depth = 0
        self.text_chars = 0
        self.text_samples = []
        self.word_count = 0
        self.has_mathml = False
        self.has_input = False
        self.has_iframe = False
        self.image_refs = []
        self.external_hosts = set()
        self.link_urls = []

    def handle_starttag(self, tag, attrs):
        lowered = tag.lower()
        if lowered == "title" and not self.title_done:
            self.in_title = True
        if lowered in ("script", "style"):
            self.skip_depth += 1
        if lowered == "math":
            self.has_mathml = True
        if lowered == "input":
            self.has_input = True
        if lowered == "iframe":
            self.has_iframe = True
        attr_map = {k.lower(): (v or "") for k, v in attrs}
        for key in ("src", "href", "data-src"):
            if key in attr_map:
                value = attr_map[key].strip()
                if value:
                    self.link_urls.append(value[:MAX_REF_CHARS])
                    host = _external_host(value)
                    if host:
                        self.external_hosts.add(host)
        if lowered == "img" and "src" in attr_map:
            cleaned = _strip_query_fragment(attr_map["src"])
            if cleaned and not cleaned.lower().startswith("data:"):
                if len(cleaned) <= MAX_REF_CHARS:
                    self.image_refs.append(cleaned)

    def handle_endtag(self, tag):
        lowered = tag.lower()
        if lowered == "title" and self.in_title:
            self.in_title = False
            self.title_done = True
        if lowered in ("script", "style") and self.skip_depth > 0:
            self.skip_depth -= 1

    def handle_data(self, data):
        if self.in_title and len("".join(self.title_parts)) < MAX_TITLE_CHARS:
            self.title_parts.append(data)
        if self.skip_depth > 0 or self.in_title:
            return
        if self.text_chars >= MAX_TEXT_CHARS:
            return
        keep = data[: MAX_TEXT_CHARS - self.text_chars]
        self.text_chars += len(keep)
        self.text_samples.append(keep)
        self.word_count += len(keep.split())

    def title(self):
        return " ".join("".join(self.title_parts).split())[:MAX_TITLE_CHARS]


def parse_html_metadata(raw):
    """Return metadata dict for HTML bytes; raises UnicodeDecodeError."""
    text, encoding = decode_html_bytes(raw)
    parser = _HtmlMetadataParser()
    parser.feed(text[: MAX_TEXT_CHARS + 65536])
    parser.close()
    return {
        "encoding": encoding,
        "word_count": parser.word_count,
        "title": parser.title() or None,
        "has_mathml": parser.has_mathml,
        "has_input": parser.has_input,
        "has_iframe": parser.has_iframe,
        "image_refs": sorted(set(parser.image_refs)),
        "external_hosts": sorted(parser.external_hosts),
        "visible_sample": "".join(parser.text_samples),
    }


def _element_text_capped(element, cap=MAX_TITLE_CHARS):
    text = "".join(element.itertext()) if element is not None else ""
    return " ".join(text.split())[:cap]


def parse_manifest_metadata(raw):
    """Extract organization/item/resource metadata from imsmanifest.xml."""
    root = ET.fromstring(raw)
    organizations = []
    top_level_titles = []
    item_count = 0
    resource_count = 0
    for element in root.iter():
        local = _localname(element.tag)
        if local == "organization":
            title_el = None
            for child in element:
                if _localname(child.tag) == "title":
                    title_el = child
                    break
            organizations.append(
                {
                    "identifier": (element.get("identifier") or "")[:200],
                    "title": _element_text_capped(title_el),
                }
            )
            for child in element:
                if _localname(child.tag) != "item":
                    continue
                item_title = None
                for item_child in child:
                    if _localname(item_child.tag) == "title":
                        item_title = item_child
                        break
                title = _element_text_capped(item_title)
                if title:
                    top_level_titles.append(title)
        elif local == "item":
            item_count += 1
        elif local == "resource":
            resource_count += 1
    organizations.sort(key=lambda o: (o["identifier"], o["title"]))
    return {
        "organizations": organizations,
        "organization_titles": [o["title"] for o in organizations if o["title"]],
        "top_level_titles": sorted(set(top_level_titles)),
        "item_count": item_count,
        "resource_count": resource_count,
    }


QUESTION_TYPE_ATTRS = ("qmd_questiontype", "qtype", "questiontype", "type")
ITEM_ID_ATTRS = ("ident", "id")
ITEM_LABEL_ATTRS = ("label", "title")
GLOBAL_ID_ATTRS = ("guid", "globalid", "global_id", "uuid")
FEEDBACK_TAGS = {"feedback", "itemfeedback"}
IMAGE_TAGS = {"img", "image", "matimage"}
RESPONSE_KEY_TAGS = {
    "resprocessing",
    "respcondition",
    "responsekey",
    "answerkey",
    "correctresponse",
    "correctanswer",
    "varequal",
    "decvar",
}


def _first_attr(element, names, cap=200):
    for name in names:
        value = element.get(name)
        if value:
            return " ".join(value.split())[:cap]
    for attr_key, value in element.attrib.items():
        if _localname(attr_key) in names and value:
            return " ".join(str(value).split())[:cap]
    return None


def _qti_metadata(element):
    """Return D2L/QTI fieldlabel -> fieldentry metadata for one item."""
    metadata = {}
    for field in element.iter():
        if _localname(field.tag) != "qti_metadatafield":
            continue
        label = None
        entry = None
        for child in field:
            local = _localname(child.tag)
            if local == "fieldlabel":
                label = _element_text_capped(child, cap=100).lower()
            elif local == "fieldentry":
                entry = _element_text_capped(child, cap=200)
        if label and entry:
            metadata[label] = entry
    return metadata


def _safe_identifier(value):
    """Keep ID-like metadata; hash free-text labels rather than emitting it."""
    if value is None:
        return None, None
    if re.fullmatch(r"[A-Za-z0-9_.:@-]{1,200}", value):
        return value, None
    return None, _sha256_bytes(value.encode("utf-8"))


def _opaque_identifier(value):
    """Return an ID-like value, or a deterministic hash token for free text."""
    safe, digest = _safe_identifier(value)
    if safe is not None:
        return safe
    return ("sha256:" + digest) if digest is not None else None


def parse_question_items(raw):
    """Parse question/item records; returns metadata only, never content."""
    root = ET.fromstring(raw)
    items = []
    for element in root.iter():
        if _localname(element.tag) not in ("item", "assessmentitem", "question"):
            continue
        presentation_el = None
        has_feedback = False
        has_image = False
        has_response_key = False
        asset_refs = set()
        for descendant in element.iter():
            local = _localname(descendant.tag)
            if local == "presentation" and presentation_el is None:
                presentation_el = descendant
            if local in FEEDBACK_TAGS:
                has_feedback = True
            if local in IMAGE_TAGS:
                has_image = True
                src = (
                    descendant.get("src") or descendant.get("href")
                    or descendant.get("imageref") or ""
                )
                cleaned = _strip_query_fragment(str(src))
                if cleaned and len(cleaned) <= MAX_REF_CHARS:
                    asset_refs.add(cleaned)
            if local in RESPONSE_KEY_TAGS:
                has_response_key = True
        target = presentation_el if presentation_el is not None else element
        topic_text = " ".join("".join(target.itertext()).split())[:MAX_TEXT_CHARS]
        html_parser = _HtmlMetadataParser()
        try:
            html_parser.feed(topic_text)
            html_parser.close()
            asset_refs.update(html_parser.image_refs)
            has_image = has_image or bool(html_parser.image_refs)
            topic_text = " ".join(html_parser.text_samples)
        except (ValueError, TypeError):
            pass
        presentation_hash = _sha256_bytes(
            ET.tostring(target, encoding="utf-8")
        )
        metadata = _qti_metadata(element)
        question_type = (
            _first_attr(element, QUESTION_TYPE_ATTRS, cap=100)
            or metadata.get("qmd_questiontype")
        )
        if question_type is None:
            for descendant in element.iter():
                if _localname(descendant.tag) == "qmd_questiontype":
                    question_type = _element_text_capped(
                        descendant, cap=100
                    ) or None
                    break
        item_label, item_label_sha = _safe_identifier(
            _first_attr(element, ITEM_LABEL_ATTRS)
        )
        global_id, global_id_sha = _safe_identifier(
            _first_attr(element, GLOBAL_ID_ATTRS)
            or metadata.get("qmd_globalid")
        )
        raw_item_ident = _first_attr(element, ITEM_ID_ATTRS)
        items.append(
            {
                "item_ident": _opaque_identifier(raw_item_ident),
                "item_ident_was_hashed": (
                    raw_item_ident is not None
                    and _safe_identifier(raw_item_ident)[0] is None
                ),
                "item_label": item_label,
                "item_label_sha256": item_label_sha,
                "global_id": global_id,
                "global_id_sha256": global_id_sha,
                "question_type": question_type,
                "presentation_sha256": presentation_hash,
                "has_feedback": has_feedback,
                "has_image": has_image,
                "referenced_assets": sorted(asset_refs),
                "has_response_key": has_response_key,
                "topic_text": topic_text,
            }
        )
    return items


def parse_quiz_relations(raw):
    """Extract quiz/section/itemref identifiers without assessment contents."""
    root = ET.fromstring(raw)
    quiz_id = root.get("ident") or root.get("id") or root.get("identifier")
    quiz_id = _opaque_identifier(
        " ".join(str(quiz_id).split())[:200] if quiz_id else None
    )
    section_ids = []
    item_refs = []
    inline_item_ids = []
    for element in root.iter():
        local = _localname(element.tag)
        if local == "section":
            ident = element.get("ident") or element.get("id")
            if ident:
                section_ids.append(
                    _opaque_identifier(" ".join(str(ident).split())[:200])
                )
        elif local in ("itemref", "item_ref", "questionref", "itemrefid"):
            ref = (
                element.get("identref")
                or element.get("refid")
                or element.get("idref")
                or element.get("linkrefid")
                or element.get("ident")
                or element.get("id")
            )
            if ref:
                item_refs.append(
                    _opaque_identifier(" ".join(str(ref).split())[:200])
                )
        elif local in ("item", "assessmentitem", "question"):
            ident = element.get("ident") or element.get("id")
            if ident:
                inline_item_ids.append(
                    _opaque_identifier(" ".join(str(ident).split())[:200])
                )
    return {
        "quiz_id": quiz_id,
        "section_ids": sorted(set(section_ids)),
        "item_ref_ids": sorted(set(item_refs)),
        "inline_item_ids": sorted(set(inline_item_ids)),
    }


def png_dimensions(data):
    if len(data) < 33:
        return None, None
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None, None
    if data[12:16] != b"IHDR":
        return None, None
    width, height = struct.unpack(">II", data[16:24])
    if width == 0 or height == 0 or width > 100000 or height > 100000:
        return None, None
    return width, height


def gif_dimensions(data):
    if len(data) < 10:
        return None, None
    if data[:6] not in (b"GIF87a", b"GIF89a"):
        return None, None
    width, height = struct.unpack("<HH", data[6:10])
    if width == 0 or height == 0:
        return None, None
    return width, height


def jpeg_dimensions(data):
    if len(data) < 4 or data[:2] != b"\xff\xd8":
        return None, None
    pos = 2
    size = len(data)
    while pos + 4 <= size:
        if data[pos] != 0xFF:
            pos += 1
            continue
        marker = data[pos + 1]
        pos += 2
        if marker in (0xD8, 0xD9) or (0xD0 <= marker <= 0xD7) or marker == 0x01:
            continue
        if pos + 2 > size:
            return None, None
        seg_len = struct.unpack(">H", data[pos : pos + 2])[0]
        if seg_len < 2 or pos + seg_len > size:
            return None, None
        if marker in (
            0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
            0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
        ):
            if seg_len < 7:
                return None, None
            height = struct.unpack(">H", data[pos + 3 : pos + 5])[0]
            width = struct.unpack(">H", data[pos + 5 : pos + 7])[0]
            if width == 0 or height == 0:
                return None, None
            return width, height
        if marker == 0xDA:
            return None, None
        pos += seg_len
    return None, None


def image_dimensions(data, extension):
    if extension == ".png":
        return png_dimensions(data)
    if extension == ".gif":
        return gif_dimensions(data)
    if extension in (".jpg", ".jpeg"):
        return jpeg_dimensions(data)
    return None, None

def _is_basename(value):
    if not isinstance(value, str) or value == "":
        return False
    if "/" in value or "\\" in value:
        return False
    if re.match(r"^[A-Za-z]:", value):
        return False
    if value in (".", ".."):
        return False
    return True


def load_inputs(inputs_path):
    with open(inputs_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("inputs file must be a JSON object")
    if data.get("schemaVersion") != SCHEMA_VERSION:
        raise ValueError(
            "unsupported inputs schemaVersion %r (expected %d)"
            % (data.get("schemaVersion"), SCHEMA_VERSION)
        )
    records = data.get("records")
    if not isinstance(records, list) or not records:
        raise ValueError("inputs file must define a non-empty 'records' list")
    seen = set()
    cleaned = []
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise ValueError("record %d must be an object" % index)
        filename = record.get("filename")
        if not _is_basename(filename):
            raise ValueError(
                "record %d has non filename-only 'filename': %r" % (index, filename)
            )
        if filename in seen:
            raise ValueError("duplicate record filename: %r" % filename)
        seen.add(filename)
        expected_bytes = record.get("expectedBytes")
        expected_sha = record.get("expectedSha256")
        role = record.get("artifactRole")
        if not isinstance(expected_bytes, int) or expected_bytes < 0:
            raise ValueError("record %r needs a non-negative integer expectedBytes"
                             % filename)
        if (
            not isinstance(expected_sha, str)
            or not re.fullmatch(r"[0-9a-f]{64}", expected_sha)
        ):
            raise ValueError("record %r needs a 64-char hex expectedSha256"
                             % filename)
        if not isinstance(role, str) or role == "":
            raise ValueError("record %r needs an artifactRole" % filename)
        entry = {
            "filename": filename,
            "expectedBytes": expected_bytes,
            "expectedSha256": expected_sha,
            "artifactRole": role,
        }
        for optional in ("courseCode", "sourceVariant", "duplicateOf"):
            if record.get(optional) is not None:
                if not isinstance(record.get(optional), str):
                    raise ValueError("record %r field %s must be a string"
                                     % (filename, optional))
                entry[optional] = record.get(optional)
        cleaned.append(entry)
    cleaned.sort(key=lambda r: r["filename"])
    return cleaned


def validate_records(records, source_root):
    """Check existence, size, and SHA-256 for every expected file (read-only)."""
    results = []
    for record in records:
        path = os.path.join(source_root, record["filename"])
        entry = dict(record)
        entry["found"] = False
        entry["actualBytes"] = None
        entry["actualSha256"] = None
        entry["scannedAsSourceTruth"] = False
        if not os.path.isfile(path):
            entry["status"] = "missing"
            results.append(entry)
            continue
        entry["found"] = True
        actual_bytes = os.path.getsize(path)
        entry["actualBytes"] = actual_bytes
        if actual_bytes != record["expectedBytes"]:
            entry["status"] = "size-mismatch"
            results.append(entry)
            continue
        actual_sha = _sha256_file(path)
        entry["actualSha256"] = actual_sha
        if actual_sha != record["expectedSha256"].lower():
            entry["status"] = "hash-mismatch"
        else:
            entry["status"] = "ok"
        results.append(entry)
    return results


def duplicate_groups(validated):
    groups = {}
    for entry in validated:
        if entry["status"] == "ok":
            groups.setdefault(entry["actualSha256"], []).append(entry["filename"])
    return [
        {"sha256": sha, "filenames": sorted(names)}
        for sha, names in sorted(groups.items())
        if len(names) > 1
    ]


def select_scan_set(validated):
    """Authoritative exports to parse, deduplicated by validated hash.

    Duplicate local copies are never scanned twice: per hash group only the
    first sorted filename is scanned; the rest are marked skipped-duplicate.
    """
    by_hash = {}
    for entry in validated:
        if entry["artifactRole"] == AUTHORITATIVE_ROLE and entry["status"] == "ok":
            by_hash.setdefault(entry["actualSha256"], []).append(entry)
    scan = []
    skipped = []
    for sha in sorted(by_hash):
        ordered = sorted(by_hash[sha], key=lambda e: e["filename"])
        scan.append(ordered[0])
        skipped.extend(ordered[1:])
    return scan, skipped


class _Budget:
    def __init__(self, max_member_bytes, max_total_bytes):
        self.max_member_bytes = max_member_bytes
        self.max_total_bytes = max_total_bytes
        self.total_read = 0
        self.total_budget_exceeded = False


def _read_member_bounded(zf, info, budget):
    """Read one member into memory within per-member/total bounds, else None."""
    if info.file_size > budget.max_member_bytes:
        return None, "per-member-bound"
    if budget.total_budget_exceeded:
        return None, "total-budget-exceeded"
    if budget.total_read + info.file_size > budget.max_total_bytes:
        budget.total_budget_exceeded = True
        return None, "total-budget-exceeded"
    with zf.open(info, mode="r") as handle:
        data = handle.read()
    budget.total_read += len(data)
    return data, ""


def scan_archive(path, record, budget):
    """Inspect one authoritative ZIP using in-memory reads only."""
    course_code = record.get("courseCode", "")
    source_key = record["filename"]
    archive = {
        "sourceKey": source_key,
        "courseCode": course_code,
        "sourceVariant": record.get("sourceVariant", ""),
        "archiveBytes": os.path.getsize(path),
        "archiveSha256": _sha256_file(path),
        "memberCount": 0,
        "fileCount": 0,
        "dirCount": 0,
        "totalCompressedBytes": 0,
        "totalUncompressedBytes": 0,
        "manifestPresent": False,
        "manifestMember": None,
        "organizationTitles": [],
        "manifestTopLevelTitles": [],
        "manifestItemCount": 0,
        "manifestResourceCount": 0,
        "topLevelNames": [],
        "questionDbMembers": [],
        "quizMembers": [],
        "questionRecordCount": 0,
        "questionDbRecordCount": 0,
        "quizInlineQuestionRecordCount": 0,
        "htmlEncodingCounts": {},
        "textLikeCount": 0,
        "imageCount": 0,
        "pdfCount": 0,
        "audioCount": 0,
        "videoCount": 0,
        "unsafeMembers": [],
        "duplicateMembers": [],
        "caseCollisions": [],
        "skippedMembers": [],
        "limitations": [],
        "archiveError": None,
        "memberFingerprints": [],
    }
    content_rows = []
    question_rows = []
    relation_rows = []
    asset_rows = []
    item_lookup_keys = set()

    try:
        zf = zipfile.ZipFile(path, mode="r")
    except zipfile.BadZipFile as exc:
        archive["archiveError"] = "unreadable-zip: %s" % str(exc)[:200]
        archive["limitations"].append("archive could not be opened as a ZIP")
        return archive, content_rows, question_rows, relation_rows, asset_rows

    with zf:
        infos = sorted(zf.infolist(), key=lambda i: i.filename)
        names = [i.filename for i in infos]
        archive["memberCount"] = len(infos)
        name_counts = {}
        for name in names:
            name_counts[name] = name_counts.get(name, 0) + 1
        archive["duplicateMembers"] = sorted(
            name for name, count in name_counts.items() if count > 1
        )
        archive["caseCollisions"] = find_case_collisions(
            [n for n in names if n != ""]
        )
        top_levels = set()
        for info in infos:
            name = info.filename
            reason = member_unsafe_reason(name)
            if reason:
                archive["unsafeMembers"].append(
                    {"member": name, "reason": reason}
                )
                archive["skippedMembers"].append(
                    {"member": name, "reason": "unsafe-name:" + reason}
                )
                continue
            is_dir = name.endswith("/")
            if is_dir:
                archive["dirCount"] += 1
            else:
                archive["fileCount"] += 1
            archive["totalCompressedBytes"] += info.compress_size
            archive["totalUncompressedBytes"] += info.file_size
            top = name.split("/")[0] if "/" in name else name
            if top not in ("", "/"):
                top_levels.add(top[:200])
            lowered = name.lower()
            if not is_dir and os.path.splitext(lowered)[1] in TEXT_LIKE_EXTS:
                archive["textLikeCount"] += 1
            ext = os.path.splitext(lowered)[1]
            if not is_dir and ext in IMAGE_EXTS:
                archive["imageCount"] += 1
            elif not is_dir and ext in PDF_EXTS:
                archive["pdfCount"] += 1
            elif not is_dir and ext in AUDIO_EXTS:
                archive["audioCount"] += 1
            elif not is_dir and ext in VIDEO_EXTS:
                archive["videoCount"] += 1
            if not is_dir and is_question_member(name):
                archive["questionDbMembers"].append(name)
            if not is_dir and is_quiz_member(name):
                archive["quizMembers"].append(name)
        archive["questionDbMembers"].sort()
        archive["quizMembers"].sort()
        archive["topLevelNames"] = sorted(top_levels)
        archive["unsafeMembers"].sort(key=lambda r: r["member"])
        archive["skippedMembers"].sort(key=lambda r: r["member"])

        manifest_name = None
        for name in names:
            if member_unsafe_reason(name):
                continue
            base = name.lower()
            if base == "imsmanifest.xml" or base.endswith("/imsmanifest.xml"):
                manifest_name = name
                break

        safe_names = [
            n for n in names
            if not member_unsafe_reason(n) and not n.endswith("/")
        ]
        payloads = {}

        def inspection_priority(name):
            if name == manifest_name:
                return (0, name)
            if is_question_member(name):
                return (1, name)
            if is_quiz_member(name):
                return (2, name)
            if is_html_member(name):
                return (3, name)
            if is_asset_member(name):
                return (4, name)
            return (5, name)

        for name in sorted(safe_names, key=inspection_priority):
            info = zf.getinfo(name)
            selected = (
                name == manifest_name or is_question_member(name)
                or is_quiz_member(name) or is_html_member(name)
                or is_asset_member(name)
            )
            if not selected:
                archive["memberFingerprints"].append(
                    {
                        "member": name,
                        "byteSize": info.file_size,
                        "crc32": "%08x" % (info.CRC & 0xFFFFFFFF),
                        "sha256": None,
                        "inspectionStatus": "metadata-only-not-selected",
                    }
                )
                continue
            data, skip_reason = _read_member_bounded(zf, info, budget)
            fingerprint = {
                "member": name,
                "byteSize": info.file_size,
                "crc32": "%08x" % (info.CRC & 0xFFFFFFFF),
                "sha256": _sha256_bytes(data) if data is not None else None,
                "inspectionStatus": "inspected" if data is not None else skip_reason,
            }
            archive["memberFingerprints"].append(fingerprint)
            if data is None:
                archive["skippedMembers"].append(
                    {"member": name, "reason": skip_reason}
                )
                continue
            payloads[name] = data
        archive["memberFingerprints"].sort(key=lambda f: f["member"])
        archive["skippedMembers"].sort(key=lambda r: r["member"])

        if manifest_name is not None and manifest_name in payloads:
            archive["manifestPresent"] = True
            archive["manifestMember"] = manifest_name
            try:
                manifest = parse_manifest_metadata(payloads[manifest_name])
                archive["organizationTitles"] = manifest["organization_titles"]
                archive["manifestTopLevelTitles"] = manifest["top_level_titles"]
                archive["manifestItemCount"] = manifest["item_count"]
                archive["manifestResourceCount"] = manifest["resource_count"]
            except ET.ParseError:
                archive["limitations"].append(
                    "imsmanifest.xml present but not parseable as XML"
                )

        # HTML/HTM content metadata (visible text stays in memory only).
        asset_ref_map = {}
        referrer_topics = {}
        for name in sorted(payloads):
            if not is_html_member(name):
                continue
            raw = payloads[name]
            try:
                meta = parse_html_metadata(raw)
            except (UnicodeDecodeError, ValueError):
                archive["skippedMembers"].append(
                    {"member": name, "reason": "html-decode-failed"}
                )
                continue
            encoding = meta["encoding"]
            counts = archive["htmlEncodingCounts"]
            counts[encoding] = counts.get(encoding, 0) + 1
            tags = infer_topic_tags(
                course_code, name, meta["title"] or "", meta["visible_sample"]
            )
            content_rows.append(
                {
                    "sourceKey": source_key,
                    "member": name,
                    "encoding": encoding,
                    "byteSize": len(raw),
                    "sha256": _sha256_bytes(raw),
                    "wordCount": meta["word_count"],
                    "title": meta["title"],
                    "hasMathml": meta["has_mathml"],
                    "hasInput": meta["has_input"],
                    "hasIframe": meta["has_iframe"],
                    "imageRefs": meta["image_refs"],
                    "externalHosts": meta["external_hosts"],
                    "topicTags": tags,
                }
            )
            referrer_topics[name] = tags
            for ref in meta["image_refs"]:
                asset_ref_map.setdefault(ref.lower(), []).append(name)

        # Question/item metadata (IDs and hashes only, never prompt content).
        question_sources = [
            (name, "question-db") for name in archive["questionDbMembers"]
        ] + [
            (name, "quiz-inline") for name in archive["quizMembers"]
        ]
        for name, source_kind in sorted(question_sources):
            if name not in payloads:
                continue
            try:
                items = parse_question_items(payloads[name])
            except ET.ParseError:
                archive["limitations"].append(
                    "question member not parseable as XML: %s" % name
                )
                continue
            for item in items:
                for lookup_value in (
                    item["item_ident"], item["item_label"], item["global_id"]
                ):
                    if lookup_value:
                        item_lookup_keys.add(lookup_value)
                tags = infer_topic_tags(
                    course_code, name, visible_text=item["topic_text"]
                )
                question_rows.append(
                    {
                        "sourceKey": source_key,
                        "member": name,
                        "sourceKind": source_kind,
                        "itemIdent": item["item_ident"],
                        "itemIdentWasHashed": item["item_ident_was_hashed"],
                        "itemLabel": item["item_label"],
                        "itemLabelSha256": item["item_label_sha256"],
                        "globalId": item["global_id"],
                        "globalIdSha256": item["global_id_sha256"],
                        "questionType": item["question_type"],
                        "presentationSha256": item["presentation_sha256"],
                        "hasFeedback": item["has_feedback"],
                        "hasImage": item["has_image"],
                        "referencedAssets": item["referenced_assets"],
                        "hasResponseKey": item["has_response_key"],
                        "topicTags": tags,
                        "assessmentRole": "unclassified",
                    }
                )
                referrer_topics[name] = sorted(
                    set(referrer_topics.get(name, [])) | set(tags)
                )
                for ref in item["referenced_assets"]:
                    asset_ref_map.setdefault(ref.lower(), []).append(name)
                if source_kind == "question-db":
                    archive["questionDbRecordCount"] += 1
                else:
                    archive["quizInlineQuestionRecordCount"] += 1
        archive["questionRecordCount"] = len(question_rows)

        # Quiz/section/itemref relationships with unresolved-reference counts.
        for name in sorted(archive["quizMembers"]):
            if name not in payloads:
                continue
            try:
                relations = parse_quiz_relations(payloads[name])
            except ET.ParseError:
                archive["limitations"].append(
                    "quiz member not parseable as XML: %s" % name
                )
                continue
            unresolved = sorted(
                [
                    r for r in relations["item_ref_ids"]
                    if r not in item_lookup_keys
                ]
            )
            relation_rows.append(
                {
                    "sourceKey": source_key,
                    "quizMember": name,
                    "quizId": relations["quiz_id"],
                    "sectionIds": relations["section_ids"],
                    "itemRefIds": relations["item_ref_ids"],
                    "inlineItemIds": relations["inline_item_ids"],
                    "referencedItemCount": len(relations["item_ref_ids"]),
                    "resolvedCount": len(relations["item_ref_ids"])
                    - len(unresolved),
                    "unresolvedCount": len(unresolved),
                    "unresolvedRefIds": unresolved,
                }
            )

        # Asset metadata (hashes/dimensions/linkage only, binaries never copied).
        fingerprint_by_name = {
            item["member"]: item for item in archive["memberFingerprints"]
        }
        for name in sorted(n for n in safe_names if is_asset_member(n)):
            raw = payloads.get(name)
            ext = os.path.splitext(name.lower())[1]
            width, height = image_dimensions(raw, ext) if raw is not None else (None, None)
            base = os.path.basename(name).lower()
            referenced_by = set()
            for ref_lower, referrers in asset_ref_map.items():
                if os.path.basename(ref_lower) == base:
                    referenced_by.update(referrers)
            asset_tags = set(infer_topic_tags(course_code, name))
            for referrer in referenced_by:
                asset_tags.update(referrer_topics.get(referrer, []))
            if len(asset_tags) > 1:
                asset_tags.discard("unclassified")
            asset_rows.append(
                {
                    "sourceKey": source_key,
                    "member": name,
                    "extension": ext,
                    "mediaClass": ASSET_EXTS[ext],
                    "byteSize": zf.getinfo(name).file_size,
                    "crc32": "%08x" % (zf.getinfo(name).CRC & 0xFFFFFFFF),
                    "sha256": _sha256_bytes(raw) if raw is not None else None,
                    "inspectionStatus": fingerprint_by_name[name]["inspectionStatus"],
                    "width": width,
                    "height": height,
                    "referencedBy": sorted(referenced_by),
                    "topicTags": sorted(asset_tags),
                    "rightsStatus": "unreviewed",
                    "learnerUseStatus": "not-approved",
                }
            )

    if budget.total_budget_exceeded:
        archive["limitations"].append(
            "total inspection byte budget exceeded; "
            "remaining selected members retain CRC/size metadata but no SHA-256"
        )
    content_rows.sort(key=lambda r: (r["sourceKey"], r["member"]))
    question_rows.sort(
        key=lambda r: (
            r["sourceKey"], r["member"], r["itemIdent"] or "",
            r["presentationSha256"],
        )
    )
    relation_rows.sort(key=lambda r: (r["sourceKey"], r["quizMember"]))
    asset_rows.sort(key=lambda r: (r["sourceKey"], r["member"]))
    return archive, content_rows, question_rows, relation_rows, asset_rows


def audit_outputs(output_dir):
    """Self-audit serialized outputs for forbidden payload-indicating keys."""
    key_patterns = [
        (token, re.compile(r'"%s"\s*:' % re.escape(token), re.IGNORECASE))
        for token in FORBIDDEN_OUTPUT_TOKENS
    ]
    url_query_pattern = re.compile(r'https?://[^\s"\\]*\?')
    checked = []
    hits = []
    for filename in OUTPUT_FILES:
        path = os.path.join(output_dir, filename)
        if not os.path.isfile(path):
            continue
        checked.append(filename)
        with open(path, "r", encoding="utf-8") as handle:
            text = handle.read()
        for token, pattern in key_patterns:
            if pattern.search(text):
                hits.append({"file": filename, "token": token})
        if url_query_pattern.search(text):
            hits.append({"file": filename, "token": "url-query-string"})
    hits.sort(key=lambda h: (h["file"], h["token"]))
    return len(hits) == 0, checked, hits


def build_course_variant_matrix(validated):
    matrix = {}
    for entry in validated:
        if entry["artifactRole"] != AUTHORITATIVE_ROLE:
            continue
        if entry.get("duplicateOf"):
            continue
        course = entry.get("courseCode", "")
        variant = entry.get("sourceVariant", "")
        if course and variant:
            matrix.setdefault(course, {})[variant] = entry["filename"]
    return {course: dict(sorted(variants.items()))
            for course, variants in sorted(matrix.items())}


def run(source_root, inputs_path, output_dir,
        max_member_bytes=DEFAULT_MAX_MEMBER_BYTES,
        max_total_bytes=DEFAULT_MAX_TOTAL_BYTES):
    source_root = os.path.abspath(source_root)
    output_dir = os.path.abspath(output_dir)
    if not os.path.isdir(source_root):
        print("error: source-root is not a directory: %s" % source_root,
              file=sys.stderr)
        return 1
    if os.path.realpath(output_dir) == os.path.realpath(source_root):
        print("error: output-dir must differ from source-root", file=sys.stderr)
        return 1
    records = load_inputs(inputs_path)
    validated = validate_records(records, source_root)
    groups = duplicate_groups(validated)
    scan_set, skipped_dupes = select_scan_set(validated)
    skipped_dupe_names = {e["filename"] for e in skipped_dupes}
    for entry in validated:
        if entry["filename"] not in skipped_dupe_names and (
            entry["artifactRole"] == AUTHORITATIVE_ROLE
            and entry["status"] == "ok"
        ):
            entry["scannedAsSourceTruth"] = True

    os.makedirs(output_dir, exist_ok=True)
    archives = []
    all_content = []
    all_questions = []
    all_relations = []
    all_assets = []
    for entry in sorted(scan_set, key=lambda e: e["filename"]):
        budget = _Budget(max_member_bytes, max_total_bytes)
        archive, content, questions, relations, assets = scan_archive(
            os.path.join(source_root, entry["filename"]), entry, budget
        )
        archives.append(archive)
        all_content.extend(content)
        all_questions.extend(questions)
        all_relations.extend(relations)
        all_assets.extend(assets)
    archives.sort(key=lambda a: a["sourceKey"])
    all_content.sort(key=lambda r: (r["sourceKey"], r["member"]))
    all_questions.sort(key=lambda r: (
        r["sourceKey"], r["member"], r["itemIdent"] or "",
        r["presentationSha256"]))
    all_relations.sort(key=lambda r: (r["sourceKey"], r["quizMember"]))
    all_assets.sort(key=lambda r: (r["sourceKey"], r["member"]))

    failed = [e for e in validated if e["status"] != "ok"]
    unsafe_total = sum(len(a["unsafeMembers"]) for a in archives)
    duplicate_member_total = sum(len(a["duplicateMembers"]) for a in archives)
    collision_total = sum(len(a["caseCollisions"]) for a in archives)
    archive_errors = [
        a["sourceKey"] for a in archives if a["archiveError"] is not None
    ]
    counts = {
        "recordsTotal": len(validated),
        "recordsOk": len(validated) - len(failed),
        "recordsFailed": len(failed),
        "archivesScanned": len(archives),
        "archivesSkippedDuplicate": len(skipped_dupes),
        "htmlEntries": len(all_content),
        "questionRecords": len(all_questions),
        "assessmentRelations": len(all_relations),
        "assetRecords": len(all_assets),
        "unsafeMemberCount": unsafe_total,
        "duplicateMemberCount": duplicate_member_total,
        "caseCollisionGroupCount": collision_total,
        "archiveErrorCount": len(archive_errors),
    }
    limitations = [
        "ZIP members are read into bounded memory only; archives are never "
        "extracted to disk.",
        "Per-member inspection bound: %d bytes; per-archive inspection bound: %d "
        "bytes. Members beyond bounds keep CRC/size metadata only." % (
            max_member_bytes, max_total_bytes),
        "Outputs are metadata only: no lesson text, prompts, choices, "
        "answers, response values, feedback bodies, binaries, credentials, "
        "or query strings.",
        "Formal/practice classification is always 'unclassified' until human "
        "review; hasResponseKey is a boolean only.",
        "Topic tags are evidence labels only and never imply curriculum "
        "approval. Math 20-1/30-1 entries are architecture fixtures until "
        "the Math 10C pilot passes.",
        "Counts describe inventory, not quality or coverage.",
        "Duplicate local copies are validated but never scanned twice.",
    ]

    _write_ndjson(os.path.join(output_dir, "content-index.ndjson"), all_content)
    _write_ndjson(os.path.join(output_dir, "question-reference-index.ndjson"),
                  all_questions)
    _write_ndjson(os.path.join(output_dir, "assessment-relations.ndjson"),
                  all_relations)
    _write_ndjson(os.path.join(output_dir, "asset-index.ndjson"), all_assets)
    _write_json(os.path.join(output_dir, "course-archives.json"),
                {"schemaVersion": SCHEMA_VERSION, "archives": archives})

    audit_passed, checked_files, forbidden_hits = audit_outputs(output_dir)
    summary = {
        "schemaVersion": SCHEMA_VERSION,
        "tool": TOOL_NAME,
        "inputsFile": os.path.basename(inputs_path),
        "courseVariantMatrix": build_course_variant_matrix(validated),
        "records": validated,
        "duplicateGroups": groups,
        "counts": counts,
        "limitations": limitations,
        "privateSourceBoundary": (
            "Private source files under --source-root are read-only inputs "
            "and are never copied into the repository. Outputs in "
            "--output-dir are metadata-only and intended for an ignored "
            "runtime directory until reviewed."
        ),
        "selfAudit": {
            "passed": audit_passed,
            "checkedFiles": sorted(checked_files),
            "forbiddenHits": forbidden_hits,
        },
    }
    _write_json(os.path.join(output_dir, "registry-summary.json"), summary)

    # Re-audit after the summary itself is written (it is a serialized output).
    audit_passed, checked_files, forbidden_hits = audit_outputs(output_dir)
    summary["selfAudit"] = {
        "passed": audit_passed,
        "checkedFiles": sorted(checked_files),
        "forbiddenHits": forbidden_hits,
    }
    _write_json(os.path.join(output_dir, "registry-summary.json"), summary)

    if not audit_passed:
        print("error: output privacy self-audit failed: %s" % json.dumps(
            forbidden_hits, sort_keys=True), file=sys.stderr)
        return 3
    archive_safety_failed = bool(
        unsafe_total or duplicate_member_total or collision_total or archive_errors
    )
    if failed or archive_safety_failed:
        print("error: %d of %d source records failed validation" % (
            len(failed), len(validated)), file=sys.stderr)
        for entry in failed:
            print("  %s: %s" % (entry["filename"], entry["status"]),
                  file=sys.stderr)
        if archive_safety_failed:
            print(
                "error: archive safety failed (%d unsafe names, %d duplicate "
                "names, %d case-collision groups, %d unreadable archives)" % (
                    unsafe_total, duplicate_member_total, collision_total,
                    len(archive_errors),
                ),
                file=sys.stderr,
            )
        return 1
    print("registry complete: %d archives scanned, %d html / %d questions / "
          "%d relations / %d assets" % (
              len(archives), len(all_content), len(all_questions),
              len(all_relations), len(all_assets)))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Build a metadata-only source registry for the Math "
                    "course family (standard library only, read-only).")
    parser.add_argument("--source-root", required=True,
                        help="private directory holding the files named in "
                             "--inputs (read-only, never modified)")
    parser.add_argument("--inputs", required=True,
                        help="inputs manifest (e.g. "
                             "tasks/math-source-registry/SOURCE_INPUTS.json)")
    parser.add_argument("--output-dir", required=True,
                        help="ignored runtime directory for metadata outputs")
    parser.add_argument("--max-member-bytes", type=int,
                        default=DEFAULT_MAX_MEMBER_BYTES,
                        help="per-member in-memory inspection bound")
    parser.add_argument("--max-total-bytes", type=int,
                        default=DEFAULT_MAX_TOTAL_BYTES,
                        help="per-archive in-memory inspection bound")
    args = parser.parse_args(argv)
    return run(args.source_root, args.inputs, args.output_dir,
               args.max_member_bytes, args.max_total_bytes)


if __name__ == "__main__":
    sys.exit(main())
