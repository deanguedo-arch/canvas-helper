#!/usr/bin/env python3
"""Deterministic private review-pack generator for Math 10C evidence review.

Reads validated private Math 10C archives plus the metadata-only registry
indexes, selects factoring / right-triangle-trigonometry evidence, and emits
a local human-review pack (plain-text question queue, raster-image copies,
decision templates, static index.html, summary). Standard library only.

This is pre-generation tooling: it grants no permission to reuse questions
or images and approves nothing for learner use. All decisions stay blank
for human reviewers.

Usage:
    python3 scripts/build-math-source-review-pack.py \
        --source-root <private-dir> \
        --inputs tasks/math-source-registry/SOURCE_INPUTS.json \
        --registry-dir <ignored-registry-dir> \
        --output-dir <ignored-output-dir>

Exit codes: 0 = pack built and self-audit passed; 1 = source/registry
validation or matching failure; 2 = output-directory policy refusal;
3 = output privacy self-audit failure.
"""

import argparse
import hashlib
import html
import json
import os
import re
import struct
import sys
import zipfile
from html.parser import HTMLParser
from xml.etree import ElementTree as ET

SCHEMA_VERSION = 1
TOOL_NAME = "build-math-source-review-pack"

DEFAULT_MAX_QUESTIONS = 200
DEFAULT_MAX_IMAGES = 200
DEFAULT_MAX_IMAGE_BYTES = 2_000_000
DEFAULT_MAX_MEMBER_BYTES = 8_000_000

AUTHORITATIVE_ROLE = "authoritative_source_export"
PILOT_COURSE = "Math 10C"

ALLOWED_TOPICS = ("factoring", "right-triangle-trigonometry")

QUESTION_DECISIONS = (
    "formative_candidate",
    "formal_or_restricted",
    "adaptable",
    "unsuitable",
)

PERMITTED_IMAGE_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
}

MAX_PROMPT_CHARS = 8000
MAX_CHOICE_CHARS = 2000
MAX_CHOICES = 100

# Subtrees that must never contribute review text. Pruned wholesale before
# any text collection, so answers, scoring, solutions, and feedback cannot
# leak into the plain-text queue.
BLOCKED_TEXT_TAGS = frozenset({
    "resprocessing",
    "respcondition",
    "responsekey",
    "answerkey",
    "correctresponse",
    "correctanswer",
    "varequal",
    "varlt",
    "vargt",
    "varsubset",
    "varinside",
    "decvar",
    "responsedeclaration",
    "outcomedeclaration",
    "responseprocessing",
    "mapping",
    "areamapping",
    "feedback",
    "itemfeedback",
    "solution",
    "hints",
    "hint",
    "rationale",
    # D2L presentation-extension metadata is configuration, not learner text.
    "display_style",
    "enumeration",
    "grading_type",
    "has_signed_comments",
    "has_htmleditor",
    "has_fileupload",
})

# Elements whose text is a visible response choice (kept, as plain text).
CHOICE_TAGS = frozenset({
    "response_label",
    "responselabel",
    "choice",
    "simplechoice",
})

ITEM_TAGS = ("item", "assessmentitem", "question")

# JSON keys that must never appear in serialized outputs (exact quoted key
# names, matched case-insensitively). Keys the pack itself emits (such as
# "hasImage" style booleans) are deliberately absent from this list.
FORBIDDEN_OUTPUT_KEYS = (
    "correctanswer",
    "correctresponse",
    "answerkey",
    "responsevalue",
    "resprocessing",
    "respcondition",
    "responsekey",
    "varequal",
    "decvar",
    "itemfeedback",
    "feedbacktext",
    "feedbackbody",
    "solution",
    "scoring",
    "password",
    "credential",
    "querystring",
)

# Raw source-markup indicators that must never appear literally in JSON/NDJSON
# outputs (the generated index.html is audited structurally instead).
RAW_TAG_NAMES = (
    "resprocessing",
    "respcondition",
    "responsekey",
    "answerkey",
    "correctresponse",
    "correctanswer",
    "varequal",
    "decvar",
    "itemfeedback",
    "response_label",
    "presentation",
    "material",
    "flow",
    "html",
    "body",
    "script",
    "style",
    "iframe",
    "img",
    "math",
    "mrow",
    "mi",
    "mn",
    "mo",
    "msup",
    "mfrac",
    "msqrt",
    "semantics",
    "annotation",
)

OUTPUT_QUEUE = "question-review-queue.ndjson"
OUTPUT_QDECISIONS = "question-decisions.json"
OUTPUT_IMAGE_QUEUE = "image-review-queue.ndjson"
OUTPUT_IDECISIONS = "image-decisions.json"
OUTPUT_SUMMARY = "review-pack-summary.json"
OUTPUT_INDEX = "index.html"
IMAGES_SUBDIR = "images"

CSP_CONTENT = (
    "default-src 'none'; img-src 'self' data:; "
    "style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"
)

PRIVATE_RUNTIME_WARNING = (
    "Private-runtime evidence pack for human review only. It grants no "
    "permission to reuse questions or images, and approves nothing for "
    "learner, Studio, LMS, or teacher use. Keep the output directory out "
    "of version control."
)


def _localname(tag):
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


def _sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


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


def _atomic_write_json(path, obj):
    tmp = path + ".tmp"
    _write_json(tmp, obj)
    os.replace(tmp, path)


def _atomic_write_ndjson(path, rows):
    tmp = path + ".tmp"
    _write_ndjson(tmp, rows)
    os.replace(tmp, path)


def _atomic_write_text(path, text):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(text)
    os.replace(tmp, path)


def _atomic_copy_bytes(path, data):
    tmp = path + ".tmp"
    with open(tmp, "wb") as handle:
        handle.write(data)
    os.replace(tmp, path)


def _strip_query_fragment(ref):
    ref = (ref or "").strip()
    if not ref:
        return ""
    for cut in ("#", "?"):
        if cut in ref:
            ref = ref.split(cut, 1)[0]
    return ref.strip()


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


def _find_repo_root():
    """Repository root inferred from this script's location (scripts/)."""
    here = os.path.abspath(os.path.dirname(__file__))
    if os.path.basename(here) == "scripts":
        return os.path.dirname(here)
    return here


def _is_within(child, parent):
    try:
        return os.path.commonpath([child]) == parent or child.startswith(
            parent + os.sep)
    except ValueError:
        return False


def refuse_output_dir(output_abs, source_abs, registry_abs):
    """Return a refusal reason if the output directory is not permitted."""
    repo_root = os.path.realpath(_find_repo_root())
    out = os.path.realpath(output_abs)
    if out == os.path.realpath(source_abs):
        return "output-dir must differ from source-root"
    if _is_within(out, os.path.realpath(source_abs)):
        return "output-dir must not be inside source-root"
    if _is_within(os.path.realpath(source_abs), out):
        return "output-dir must not contain source-root"
    if out == os.path.realpath(registry_abs) or _is_within(
            out, os.path.realpath(registry_abs)):
        return "output-dir must not be inside registry-dir"
    if _is_within(out, repo_root) or out == repo_root:
        runtime_dir = os.path.join(repo_root, ".runtime")
        if not _is_within(out, runtime_dir):
            return ("output-dir inside the tracked repository must be under "
                    ".runtime/ (temporary directories outside the repo are "
                    "permitted)")
    return ""


def load_inputs(inputs_path):
    with open(inputs_path, "r", encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict):
        raise ValueError("inputs file must be a JSON object")
    if data.get("schemaVersion") != SCHEMA_VERSION:
        raise ValueError(
            "unsupported inputs schemaVersion %r (expected %d)"
            % (data.get("schemaVersion"), SCHEMA_VERSION))
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
                "record %d has non filename-only 'filename': %r" % (index,
                                                                    filename))
        if filename in seen:
            raise ValueError("duplicate record filename: %r" % filename)
        seen.add(filename)
        expected_bytes = record.get("expectedBytes")
        expected_sha = record.get("expectedSha256")
        role = record.get("artifactRole")
        if not isinstance(expected_bytes, int) or expected_bytes < 0:
            raise ValueError("record %r needs a non-negative integer "
                             "expectedBytes" % filename)
        if (not isinstance(expected_sha, str)
                or not re.fullmatch(r"[0-9a-f]{64}", expected_sha)):
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
    """Check existence, size, and SHA-256 for every expected file."""
    results = []
    for record in records:
        path = os.path.join(source_root, record["filename"])
        entry = dict(record)
        entry["found"] = False
        entry["actualBytes"] = None
        entry["actualSha256"] = None
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


def select_math10_archives(validated):
    """Validated Math 10C authoritative exports, deduplicated by hash.

    Math 20/30 archives are validated but never scanned for this pilot.
    Per hash group only the first sorted filename is scanned.
    """
    by_hash = {}
    for entry in validated:
        if (entry["artifactRole"] == AUTHORITATIVE_ROLE
                and entry["status"] == "ok"
                and entry.get("courseCode") == PILOT_COURSE
                and not entry.get("duplicateOf")):
            by_hash.setdefault(entry["actualSha256"], []).append(entry)
    scan = []
    skipped = []
    for sha in sorted(by_hash):
        ordered = sorted(by_hash[sha], key=lambda e: e["filename"])
        scan.append(ordered[0])
        skipped.extend(ordered[1:])
    return scan, skipped


def _read_ndjson(path):
    rows = []
    with open(path, "r", encoding="utf-8") as handle:
        for lineno, line in enumerate(handle, start=1):
            if line.strip() == "":
                continue
            try:
                value = json.loads(line)
            except ValueError as exc:
                raise ValueError("%s line %d: invalid JSON (%s)"
                                 % (os.path.basename(path), lineno, exc))
            if not isinstance(value, dict):
                raise ValueError("%s line %d: expected a JSON object"
                                 % (os.path.basename(path), lineno))
            rows.append(value)
    return rows


def _first_attr(element, names, cap=200):
    for name in names:
        value = element.get(name)
        if value:
            return " ".join(value.split())[:cap]
    for attr_key, value in element.attrib.items():
        if _localname(attr_key) in names and value:
            return " ".join(str(value).split())[:cap]
    return None


def _safe_identifier(value):
    if value is None:
        return None, None
    if re.fullmatch(r"[A-Za-z0-9_.:@-]{1,200}", value):
        return value, None
    return None, _sha256_bytes(value.encode("utf-8"))


def _opaque_identifier(value):
    safe, digest = _safe_identifier(value)
    if safe is not None:
        return safe
    return ("sha256:" + digest) if digest is not None else None


def _find_presentation(item_element):
    for descendant in item_element.iter():
        if descendant is item_element:
            continue
        if _localname(descendant.tag) == "presentation":
            return descendant
    return None


def _presentation_hash(item_element):
    target = _find_presentation(item_element)
    if target is None:
        target = item_element
    return _sha256_bytes(ET.tostring(target, encoding="utf-8"))


def parse_member_items(raw):
    """Parse question/item elements; mirrors the source-registry derivation.

    Returns metadata plus element handles for presentation extraction.
    Raises ET.ParseError on malformed XML.
    """
    root = ET.fromstring(raw)
    items = []
    for element in root.iter():
        if _localname(element.tag) not in ITEM_TAGS:
            continue
        raw_ident = _first_attr(element, ("ident", "id"))
        item_label, _ = _safe_identifier(
            _first_attr(element, ("label", "title")))
        global_id, _ = _safe_identifier(
            _first_attr(element, ("guid", "globalid", "global_id", "uuid")))
        question_type = _first_attr(
            element,
            ("qmd_questiontype", "qtype", "questiontype", "type"), cap=100)
        if question_type is None:
            for descendant in element.iter():
                if _localname(descendant.tag) == "qmd_questiontype":
                    text = "".join(descendant.itertext())
                    question_type = " ".join(text.split())[:100] or None
                    break
        presentation_el = _find_presentation(element)
        items.append({
            "element": element,
            "item_ident": _opaque_identifier(raw_ident),
            "item_label": item_label,
            "global_id": global_id,
            "question_type": question_type,
            "presentation_sha256": _presentation_hash(element),
            "presentation_found": presentation_el is not None,
        })
    return items


class _EmbeddedMarkupTextParser(HTMLParser):
    """Reduce HTML/MathML encoded inside QTI text nodes to plain text."""

    BLOCKED = frozenset({"script", "style", "noscript", "annotation"})
    BREAKS = frozenset({"br", "p", "div", "li", "tr", "td", "th"})

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.blocked_depth = 0

    def handle_starttag(self, tag, attrs):
        lowered = tag.lower()
        if lowered in self.BLOCKED:
            self.blocked_depth += 1
            return
        if self.blocked_depth:
            return
        if lowered in self.BREAKS:
            self.parts.append(" ")
        if lowered == "img":
            alt = dict(attrs).get("alt")
            if alt:
                self.parts.extend((" ", alt, " "))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag.lower() in self.BLOCKED:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        lowered = tag.lower()
        if lowered in self.BLOCKED:
            if self.blocked_depth:
                self.blocked_depth -= 1
            return
        if not self.blocked_depth and lowered in self.BREAKS:
            self.parts.append(" ")

    def handle_data(self, data):
        if not self.blocked_depth:
            self.parts.append(data)


def _clean_text(text):
    parser = _EmbeddedMarkupTextParser()
    try:
        parser.feed(text or "")
        parser.close()
        text = " ".join(parser.parts)
    except Exception:  # fail closed to plain text without executable markup
        text = re.sub(r"<[^<>]*>", " ", text or "")
    text = html.unescape(text)
    return " ".join(text.split())


def _subtree_text(element):
    """Plain text under an element, excluding blocked subtrees."""
    parts = []
    if element.tag is ET.Comment:
        return ""
    if _localname(element.tag) in BLOCKED_TEXT_TAGS:
        return ""
    if element.text:
        parts.append(element.text)
    for child in element:
        if child.tag is ET.Comment:
            if child.tail:
                parts.append(child.tail)
            continue
        if _localname(child.tag) in BLOCKED_TEXT_TAGS:
            if child.tail:
                parts.append(child.tail)
            continue
        parts.append(_subtree_text(child))
        if child.tail:
            parts.append(child.tail)
    return " ".join("".join(parts).split())


def extract_review_text(item_element):
    """Extract prompt + visible choices as sanitized plain text.

    Only the QTI <presentation> subtree is read (falling back to the item
    element when no presentation exists, with blocked subtrees pruned
    either way). Returns (prompt, choices, truncated).
    """
    target = _find_presentation(item_element)
    if target is None:
        target = item_element
    prompt_parts = []
    choices = []
    truncated = False

    def visit(element, in_choice):
        if element.tag is ET.Comment:
            return
        local = _localname(element.tag)
        if local in BLOCKED_TEXT_TAGS:
            return
        if local in CHOICE_TAGS and not in_choice:
            ident = _first_attr(element, ("ident", "id"), cap=100)
            text = _clean_text(_subtree_text(element))
            if text or ident:
                choices.append({"ident": ident, "text": text[:MAX_CHOICE_CHARS]})
            return
        if element.text and not in_choice:
            prompt_parts.append(element.text)
        for child in element:
            visit(child, in_choice or local in CHOICE_TAGS)
            if child.tag is ET.Comment:
                if child.tail and not in_choice:
                    prompt_parts.append(child.tail)
                continue
            if _localname(child.tag) in BLOCKED_TEXT_TAGS:
                if child.tail and not in_choice:
                    prompt_parts.append(child.tail)
                continue
            if child.tail and not in_choice:
                prompt_parts.append(child.tail)

    if target.text:
        prompt_parts.append(target.text)
    for child in target:
        visit(child, False)
        if child.tag is ET.Comment:
            if child.tail:
                prompt_parts.append(child.tail)
            continue
        if _localname(child.tag) in BLOCKED_TEXT_TAGS:
            if child.tail:
                prompt_parts.append(child.tail)
            continue
        if child.tail:
            prompt_parts.append(child.tail)

    prompt = _clean_text(" ".join(prompt_parts))
    cleaned_choices = []
    for choice in choices[:MAX_CHOICES]:
        cleaned_choices.append({
            "ident": choice["ident"],
            "text": _clean_text(choice["text"])[:MAX_CHOICE_CHARS],
        })
    if len(choices) > MAX_CHOICES:
        truncated = True
    if len(prompt) > MAX_PROMPT_CHARS:
        prompt = prompt[:MAX_PROMPT_CHARS]
        truncated = True
    prompt = prompt.strip()
    return prompt, cleaned_choices, truncated


def make_question_id(source_key, member, item_ident, item_label, global_id,
                     presentation_sha256):
    basis = "\n".join((
        source_key or "",
        member or "",
        item_ident or "",
        item_label or "",
        global_id or "",
        presentation_sha256 or "",
    ))
    return "q" + _sha256_text(basis)[:16]


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
        seg_len = struct.unpack(">H", data[pos:pos + 2])[0]
        if seg_len < 2 or pos + seg_len > size:
            return None, None
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
                      0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            if seg_len < 7:
                return None, None
            height = struct.unpack(">H", data[pos + 3:pos + 5])[0]
            width = struct.unpack(">H", data[pos + 5:pos + 7])[0]
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


def magic_matches(data, extension):
    if extension == ".png":
        return data[:8] == b"\x89PNG\r\n\x1a\n"
    if extension in (".jpg", ".jpeg"):
        return len(data) >= 3 and data[:2] == b"\xff\xd8" and data[2] == 0xFF
    if extension == ".gif":
        return data[:6] in (b"GIF87a", b"GIF89a")
    return False


def normalize_image_extension(extension):
    if extension == ".jpeg":
        return ".jpg"
    return extension


def select_questions(question_rows, course_by_source_key, max_questions):
    """Select Math 10C pilot-topic records in deterministic order."""
    selected = []
    skipped = []
    ordered = sorted(
        question_rows,
        key=lambda r: (r.get("sourceKey") or "", r.get("member") or "",
                       r.get("itemIdent") or "",
                       r.get("presentationSha256") or ""))
    for row in ordered:
        source_key = row.get("sourceKey") or ""
        tags = row.get("topicTags") or []
        if course_by_source_key.get(source_key) != PILOT_COURSE:
            skipped.append({"record": _record_label(row),
                            "reason": "non-math10c-source"})
            continue
        if not isinstance(tags, list) or not (
                set(tags) & set(ALLOWED_TOPICS)):
            skipped.append({"record": _record_label(row),
                            "reason": "topic-out-of-scope"})
            continue
        if len(selected) >= max_questions:
            skipped.append({"record": _record_label(row),
                            "reason": "question-cap"})
            continue
        selected.append(row)
    return selected, skipped


def _record_label(row):
    return "%s | %s | %s" % (
        row.get("sourceKey") or "",
        row.get("member") or "",
        row.get("itemIdent") or row.get("globalId")
        or row.get("itemLabel") or row.get("presentationSha256") or "")


class _ArchiveCache:
    """Read-only per-archive ZIP access with bounded member reads."""

    def __init__(self, source_root, scan_entries, max_member_bytes):
        self.paths = {e["filename"]: os.path.join(source_root, e["filename"])
                      for e in scan_entries}
        self.max_member_bytes = max_member_bytes
        self._members = {}

    def read_member(self, source_key, member):
        """Return member bytes, or (None, reason) without extracting."""
        key = (source_key, member)
        if key in self._members:
            return self._members[key]
        path = self.paths.get(source_key)
        if path is None:
            result = (None, "unknown-source-key")
            self._members[key] = result
            return result
        if member_unsafe_reason(member):
            result = (None, "unsafe-member-name")
            self._members[key] = result
            return result
        try:
            with zipfile.ZipFile(path, mode="r") as zf:
                try:
                    info = zf.getinfo(member)
                except KeyError:
                    result = (None, "member-not-found")
                    self._members[key] = result
                    return result
                if info.is_dir():
                    result = (None, "member-is-directory")
                    self._members[key] = result
                    return result
                if info.file_size > self.max_member_bytes:
                    result = (None, "member-too-large")
                    self._members[key] = result
                    return result
                with zf.open(info, mode="r") as handle:
                    data = handle.read()
        except zipfile.BadZipFile:
            result = (None, "unreadable-zip")
            self._members[key] = result
            return result
        result = (data, "")
        self._members[key] = result
        return result


def identity_matches_record(record, parsed):
    """True when the parsed item carries the record's safest identity."""
    if record.get("itemIdent"):
        return parsed["item_ident"] == record.get("itemIdent")
    if record.get("globalId"):
        return parsed["global_id"] == record.get("globalId")
    if record.get("itemLabel"):
        return parsed["item_label"] == record.get("itemLabel")
    return True


def match_question(record, parsed_items):
    """Match one registry record to exactly one parsed item, else a reason."""
    if (not record.get("itemIdent") and not record.get("globalId")
            and not record.get("itemLabel")):
        candidates = [p for p in parsed_items
                      if p["presentation_sha256"]
                      == record.get("presentationSha256")]
    else:
        candidates = [p for p in parsed_items
                      if identity_matches_record(record, p)
                      and p["presentation_sha256"]
                      == record.get("presentationSha256")]
    if len(candidates) == 1:
        return candidates[0], ""
    if not candidates:
        return None, "no-match-or-hash-mismatch"
    return None, "ambiguous-match"


def _normalize_decision_entry(entry, kind):
    if not isinstance(entry, dict):
        raise ValueError("existing %s decision entry must be an object" % kind)
    ident = entry.get("id")
    if (not isinstance(ident, str) or not ident or len(ident) > 200
            or any(ord(char) < 32 for char in ident)):
        raise ValueError("existing %s decision entry has an invalid id" % kind)
    if kind == "question":
        if set(entry) != {"id", "decision", "notes"}:
            raise ValueError("existing question decision entry has unexpected fields")
        decision = entry.get("decision")
        notes = entry.get("notes")
        if decision is not None and decision not in QUESTION_DECISIONS:
            raise ValueError("existing question decision has an invalid value")
        if not isinstance(notes, str) or len(notes) > 20000:
            raise ValueError("existing question decision notes are invalid")
        return {"id": ident, "decision": decision, "notes": notes}
    expected = {"id", "rightsDecision", "learnerUseDecision",
                "accessibilityDecision", "altText"}
    if set(entry) != expected:
        raise ValueError("existing image decision entry has unexpected fields")
    result = {"id": ident}
    for field in ("rightsDecision", "learnerUseDecision",
                  "accessibilityDecision"):
        value = entry.get(field)
        if value is not None and (not isinstance(value, str)
                                  or not value or len(value) > 200):
            raise ValueError("existing image %s is invalid" % field)
        result[field] = value
    alt_text = entry.get("altText")
    if not isinstance(alt_text, str) or len(alt_text) > 20000:
        raise ValueError("existing image altText is invalid")
    result["altText"] = alt_text
    return result


def load_decision_file(path, kind):
    if not os.path.exists(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
    except (ValueError, OSError) as exc:
        raise ValueError("existing %s decisions unreadable: %s" % (kind, exc))
    if (not isinstance(data, dict) or data.get("schemaVersion") != SCHEMA_VERSION
            or data.get("tool") != TOOL_NAME
            or not isinstance(data.get("decisions"), list)
            or not isinstance(data.get("staleDecisions", []), list)):
        raise ValueError("existing %s decisions have an unexpected shape"
                         % kind)
    entries = data["decisions"] + data.get("staleDecisions", [])
    normalized = []
    seen = set()
    for entry in entries:
        clean = _normalize_decision_entry(entry, kind)
        if clean["id"] in seen:
            raise ValueError("existing %s decisions contain duplicate id %r"
                             % (kind, clean["id"]))
        seen.add(clean["id"])
        normalized.append(clean)
    return {"decisions": normalized}


def merge_decisions(existing, current_ids, blank_entry):
    """Preserve human decisions across reruns; never erase them.

    Returns (merged_list, stale_list, preserved_count, new_count).
    """
    prior = {}
    if existing:
        for entry in existing.get("decisions", []):
            if isinstance(entry, dict) and entry.get("id") in current_ids:
                prior[entry["id"]] = entry
    merged = []
    preserved = 0
    created = 0
    for ident in sorted(current_ids):
        old = prior.get(ident)
        if old is not None:
            merged.append(old)
            if _decision_is_set(old):
                preserved += 1
        else:
            merged.append(blank_entry(ident))
            created += 1
    stale = []
    if existing:
        for entry in existing.get("decisions", []):
            if (isinstance(entry, dict) and entry.get("id") is not None
                    and entry["id"] not in current_ids):
                stale.append(entry)
    stale.sort(key=lambda e: (str(e.get("id"))))
    return merged, stale, preserved, created


def _decision_is_set(entry):
    for key, value in entry.items():
        if key == "id":
            continue
        if value not in (None, "", []):
            return True
    return False


def blank_question_entry(ident):
    return {"id": ident, "decision": None, "notes": ""}


def blank_image_entry(ident):
    return {"id": ident, "rightsDecision": None, "learnerUseDecision": None,
            "accessibilityDecision": None, "altText": ""}


def prune_stale_generated_images(output_images_dir, current_filenames):
    """Remove only obsolete content-addressed files generated by this tool."""
    removed = 0
    for name in sorted(os.listdir(output_images_dir)):
        if (re.fullmatch(r"[0-9a-f]{64}\.(png|jpg|gif)", name)
                and name not in current_filenames):
            os.unlink(os.path.join(output_images_dir, name))
            removed += 1
    return removed


def resolve_images(emitted_questions, asset_rows, cache, output_images_dir,
                   max_images, max_image_bytes):
    """Copy validated raster images referenced by emitted questions."""
    assets_by_source = {}
    for row in asset_rows:
        if not isinstance(row, dict):
            continue
        assets_by_source.setdefault(row.get("sourceKey") or "",
                                    []).append(row)
    copied = {}  # sha256 -> {"file":..., "members": set(), ...}
    image_records = {}  # sha256 -> queue row
    skipped = []
    emitted_count = 0

    def note(reason, detail):
        skipped.append({"record": detail, "reason": reason})

    for question in emitted_questions:
        for ref in question.get("_refs") or []:
            cleaned = _strip_query_fragment(str(ref))
            if not cleaned:
                note("asset-empty-ref", question["questionId"])
                continue
            base = os.path.basename(cleaned.replace("\\", "/")).lower()
            if not base:
                note("asset-empty-ref", question["questionId"])
                continue
            candidates = []
            for row in assets_by_source.get(question["sourceKey"], []):
                member = row.get("member") or ""
                if member_unsafe_reason(member):
                    continue
                if os.path.basename(member).lower() != base:
                    continue
                candidates.append(row)
            if not candidates:
                note("asset-unresolved", "%s | %s"
                     % (question["questionId"], cleaned))
                continue
            if len(candidates) > 1:
                note("asset-ambiguous", "%s | %s"
                     % (question["questionId"], cleaned))
                continue
            asset = candidates[0]
            ext = (asset.get("extension") or "").lower()
            if ext not in PERMITTED_IMAGE_TYPES:
                note("unapproved-media-type", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            if asset.get("inspectionStatus") != "inspected":
                note("asset-not-inspected", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            if not asset.get("sha256"):
                note("asset-hash-missing", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            data, error = cache.read_member(question["sourceKey"],
                                            asset.get("member"))
            if error:
                note("asset-unreadable:" + error, "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            if len(data) > max_image_bytes:
                note("image-too-large", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            if not magic_matches(data, ext):
                note("magic-mismatch", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            actual_sha = _sha256_bytes(data)
            if actual_sha != (asset.get("sha256") or "").lower():
                note("hash-mismatch", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            out_ext = normalize_image_extension(ext)
            if actual_sha in copied:
                copied[actual_sha]["referrers"].add(question["questionId"])
                image_records[actual_sha]["referringQuestionIds"] = sorted(
                    copied[actual_sha]["referrers"])
                question["_images"].append(copied[actual_sha]["file"])
                continue
            if emitted_count >= max_images:
                note("image-cap", "%s | %s"
                     % (question["questionId"], asset.get("member")))
                continue
            filename = actual_sha + out_ext
            width, height = image_dimensions(data, ext)
            _atomic_copy_bytes(os.path.join(output_images_dir, filename),
                               data)
            copied[actual_sha] = {"file": filename,
                                  "referrers": {question["questionId"]}}
            tags = set(asset.get("topicTags") or []) | set(
                question.get("topicTags") or [])
            tags = sorted(t for t in tags if isinstance(t, str))
            image_records[actual_sha] = {
                "imageId": actual_sha,
                "file": filename,
                "sourceKey": question["sourceKey"],
                "sourceMember": asset.get("member"),
                "extension": out_ext,
                "mime": PERMITTED_IMAGE_TYPES[ext],
                "byteSize": len(data),
                "sha256": actual_sha,
                "width": width,
                "height": height,
                "topicTags": tags,
                "referringQuestionIds": [question["questionId"]],
                "rightsDecision": None,
                "learnerUseDecision": None,
                "accessibilityDecision": None,
                "altText": "",
            }
            question["_images"].append(filename)
            emitted_count += 1
    ordered = sorted(image_records.values(), key=lambda r: r["imageId"])
    return ordered, copied, skipped


def build_index_html(questions, images, counts):
    """Static review page: escaped plain text, no scripts, no externals."""
    esc = html.escape
    parts = []
    parts.append("<!DOCTYPE html>")
    parts.append('<html lang="en">')
    parts.append("<head>")
    parts.append('<meta charset="utf-8">')
    parts.append('<meta name="viewport" content="width=device-width, '
                 'initial-scale=1">')
    # CSP_CONTENT is a static trusted constant (no markup characters
    # outside single quotes), so it is embedded raw: escaping it would
    # rewrite its quotes as entities and break exact-match auditing.
    parts.append('<meta http-equiv="Content-Security-Policy" content="'
                 + CSP_CONTENT + '">')
    parts.append("<title>Math 10C Private Review Pack</title>")
    parts.append("<style>")
    parts.append("body{font-family:sans-serif;line-height:1.5;margin:2em;"
                 "max-width:70em;color:#111;background:#fff;}")
    parts.append("img.review-image{max-width:40em;max-height:30em;height:auto;"
                 "width:auto;border:1px solid #999;display:block;"
                 "margin:0.5em 0;}")
    parts.append(".provenance{font-size:0.85em;color:#333;}")
    parts.append(".notice{border:2px solid #900;padding:1em;margin:1em 0;}")
    parts.append("</style>")
    parts.append("</head>")
    parts.append("<body>")
    parts.append("<h1>Math 10C Private Review Pack</h1>")
    parts.append('<div class="notice"><p><strong>Human review evidence only. '
                 "This pack grants no permission to reuse questions or "
                 "images and approves nothing for learner use.</strong></p>"
                 "<p>Allowed question decisions: "
                 "formative_candidate, formal_or_restricted, adaptable, "
                 "unsuitable. Record decisions in "
                 "question-decisions.json and image-decisions.json.</p></div>")
    parts.append("<p>Questions: %d. Images: %d. Skipped questions: %d. "
                 "Skipped images: %d.</p>" % (
                     counts.get("emittedQuestions", 0),
                     counts.get("emittedImages", 0),
                     counts.get("skippedQuestions", 0),
                     counts.get("skippedImages", 0)))
    images_by_file = {img["file"]: img for img in images}
    for question in questions:
        parts.append("<article>")
        parts.append("<h2>Question %s</h2>" % esc(question["questionId"]))
        parts.append('<dl class="provenance">')
        for label, key in (("Source archive", "sourceKey"),
                           ("XML member", "member"),
                           ("Source kind", "sourceKind"),
                           ("Question type", "questionType"),
                           ("Presentation hash", "presentationSha256")):
            value = question.get(key)
            parts.append("<dt>%s</dt><dd>%s</dd>"
                         % (esc(label), esc(str(value) if value is not None
                                            else "unknown")))
        for label, key in (("Item identifier", "itemIdent"),
                           ("Item label", "itemLabel"),
                           ("Global identifier", "globalId")):
            value = question.get(key)
            if value:
                parts.append("<dt>%s</dt><dd>%s</dd>"
                             % (esc(label), esc(str(value))))
        parts.append("<dt>Topic tags</dt><dd>%s</dd>"
                     % esc(", ".join(question.get("topicTags") or [])))
        parts.append("</dl>")
        parts.append("<h3>Prompt</h3>")
        parts.append("<p>%s</p>" % esc(question.get("promptText") or ""))
        choices = question.get("choices") or []
        if choices:
            parts.append("<h3>Visible response choices</h3>")
            parts.append("<ol>")
            for choice in choices:
                label = choice.get("ident")
                text = choice.get("text") or ""
                if label:
                    parts.append("<li><strong>%s.</strong> %s</li>"
                                 % (esc(str(label)), esc(text)))
                else:
                    parts.append("<li>%s</li>" % esc(text))
            parts.append("</ol>")
        for filename in question.get("imageFiles") or []:
            img = images_by_file.get(filename)
            if img is None:
                continue
            parts.append("<figure>")
            parts.append('<img class="review-image" src="%s" alt="%s">'
                         % (esc("images/" + filename),
                            esc("Review image %s; describe it in "
                                "image-decisions.json."
                                % img["imageId"][:12])))
            parts.append("<figcaption>%s (%s, %s bytes)</figcaption>"
                         % (esc(filename), esc(img.get("mime") or ""),
                            esc(str(img.get("byteSize")))))
            parts.append("</figure>")
        parts.append("</article>")
    if images:
        parts.append("<h2>Image rights and accessibility queue</h2>")
        parts.append("<ul>")
        for img in images:
            parts.append("<li>%s (%s) referred by %s</li>"
                         % (esc(img["file"]), esc(img["imageId"][:12]),
                            esc(", ".join(img.get("referringQuestionIds")
                                          or []))))
        parts.append("</ul>")
    parts.append("</body>")
    parts.append("</html>")
    return "\n".join(parts) + "\n"


class _IndexAuditParser(HTMLParser):
    ALLOWED_TAGS = frozenset({
        "html", "head", "meta", "title", "style", "body", "h1", "h2", "h3",
        "p", "ul", "ol", "li", "dl", "dt", "dd", "article", "figure",
        "figcaption", "div", "span", "strong", "em",
    })
    SINGLETON_OK = frozenset({"img"})

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.attr_hits = []
        self.url_hits = []
        self.style_text = []

    def handle_starttag(self, tag, attrs):
        lowered = tag.lower()
        self.tags.append(lowered)
        for name, value in attrs:
            lname = name.lower()
            if lname.startswith("on"):
                self.attr_hits.append("event-handler:%s" % lname)
            value_text = (value or "")
            if re.match(r"(?i)^\s*javascript\s*:", value_text):
                self.attr_hits.append("javascript-uri:%s" % lname)
            if lname in ("src", "href"):
                if re.match(r"(?i)^\s*https?://", value_text):
                    self.url_hits.append("external-url:%s" % lowered)
                if lowered != "img" and value_text.strip().lower().startswith(
                        "data:"):
                    self.url_hits.append("data-uri:%s" % lowered)

    def handle_data(self, data):
        self.style_text.append(data)


def audit_outputs(output_dir, source_abs, registry_abs, output_abs):
    """Privacy/security self-audit. Returns (passed, checked, hits)."""
    checked = []
    hits = []
    key_patterns = [
        (token, re.compile(r'"%s"\s*:' % re.escape(token), re.IGNORECASE))
        for token in FORBIDDEN_OUTPUT_KEYS
    ]
    raw_tag_pattern = re.compile(
        r"<\s*/?\s*(%s)[\s>/]" % "|".join(RAW_TAG_NAMES), re.IGNORECASE)
    abs_markers = [source_abs, registry_abs, output_abs]
    abs_host_pattern = re.compile(
        r"(/(Users|home|private|tmp|var|data|mnt|media)/|[A-Za-z]:\\)")
    for name in sorted(os.listdir(output_dir)):
        if name in (IMAGES_SUBDIR,) or name.endswith(".tmp"):
            continue
        path = os.path.join(output_dir, name)
        if os.path.isdir(path) or not os.path.isfile(path):
            continue
        if not name.endswith((".json", ".ndjson", ".html")):
            continue
        checked.append(name)
        with open(path, "r", encoding="utf-8") as handle:
            text = handle.read()
        if name != OUTPUT_INDEX:
            for token, pattern in key_patterns:
                if pattern.search(text):
                    hits.append({"file": name, "issue": "forbidden-key",
                                 "token": token})
            for match in raw_tag_pattern.finditer(text):
                hits.append({"file": name, "issue": "raw-source-markup",
                             "token": match.group(1).lower()})
            for marker in abs_markers:
                if marker and marker in text:
                    hits.append({"file": name, "issue": "absolute-path",
                                 "token": marker[-40:]})
                    break
            if abs_host_pattern.search(text):
                hits.append({"file": name, "issue": "absolute-path",
                             "token": "host-path-pattern"})
    for name in sorted(os.listdir(os.path.join(output_dir, IMAGES_SUBDIR))):
        checked.append(IMAGES_SUBDIR + "/" + name)
        if not re.fullmatch(r"[0-9a-f]{64}\.(png|jpg|gif)", name):
            hits.append({"file": IMAGES_SUBDIR + "/" + name,
                         "issue": "unsafe-filename", "token": name})
    index_path = os.path.join(output_dir, OUTPUT_INDEX)
    with open(index_path, "r", encoding="utf-8") as handle:
        index_text = handle.read()
    parser = _IndexAuditParser()
    try:
        parser.feed(index_text)
        parser.close()
    except Exception as exc:  # noqa: BLE001 - audit must fail closed
        hits.append({"file": OUTPUT_INDEX, "issue": "html-unparseable",
                     "token": str(exc)[:100]})
        parser = None
    if parser is not None:
        for tag in parser.tags:
            if tag not in parser.ALLOWED_TAGS and tag != "img":
                hits.append({"file": OUTPUT_INDEX, "issue": "forbidden-tag",
                             "token": tag})
        for token in parser.attr_hits:
            hits.append({"file": OUTPUT_INDEX, "issue": "executable-attr",
                         "token": token})
        for token in parser.url_hits:
            hits.append({"file": OUTPUT_INDEX, "issue": "external-resource",
                         "token": token})
        csp = re.search(
            r'<meta[^>]+http-equiv=["\']Content-Security-Policy["\'][^>]*>',
            index_text, re.IGNORECASE)
        if not csp or "default-src 'none'" not in csp.group(0):
            hits.append({"file": OUTPUT_INDEX, "issue": "csp-missing",
                         "token": "Content-Security-Policy"})
        style_match = re.search(r"<style>(.*?)</style>", index_text,
                                re.IGNORECASE | re.DOTALL)
        if style_match and re.search(
                r"(?i)@import|url\s*\(|expression|javascript\s*:",
                style_match.group(1)):
            hits.append({"file": OUTPUT_INDEX, "issue": "unsafe-style",
                         "token": "style"})
    hits.sort(key=lambda h: (h["file"], h["issue"], h.get("token", "")))
    return len(hits) == 0, sorted(checked), hits


def _count_reasons(entries):
    counts = {}
    for entry in entries:
        reason = entry.get("reason", "")
        counts[reason] = counts.get(reason, 0) + 1
    return dict(sorted(counts.items()))


def run(source_root, inputs_path, registry_dir, output_dir,
        max_questions=DEFAULT_MAX_QUESTIONS,
        max_images=DEFAULT_MAX_IMAGES,
        max_image_bytes=DEFAULT_MAX_IMAGE_BYTES,
        max_member_bytes=DEFAULT_MAX_MEMBER_BYTES,
        overwrite_decisions=False):
    source_abs = os.path.abspath(source_root)
    registry_abs = os.path.abspath(registry_dir)
    output_abs = os.path.abspath(output_dir)
    if not os.path.isdir(source_abs):
        print("error: source-root is not a directory", file=sys.stderr)
        return 1
    if not os.path.isdir(registry_abs):
        print("error: registry-dir is not a directory", file=sys.stderr)
        return 1
    refusal = refuse_output_dir(output_abs, source_abs, registry_abs)
    if refusal:
        print("error: %s" % refusal, file=sys.stderr)
        return 2
    try:
        records = load_inputs(inputs_path)
    except (ValueError, OSError) as exc:
        print("error: invalid inputs file: %s" % exc, file=sys.stderr)
        return 1
    validated = validate_records(records, source_abs)
    failed = [e for e in validated if e["status"] != "ok"]
    if failed:
        print("error: %d of %d source records failed validation"
              % (len(failed), len(validated)), file=sys.stderr)
        for entry in failed:
            print("  %s: %s" % (entry["filename"], entry["status"]),
                  file=sys.stderr)
        return 1
    scan_entries, _ = select_math10_archives(validated)
    if not scan_entries:
        print("error: no validated Math 10C authoritative archive to scan",
              file=sys.stderr)
        return 1
    course_by_key = {e["filename"]: e.get("courseCode", "") for e in validated}
    try:
        question_rows = _read_ndjson(
            os.path.join(registry_abs, "question-reference-index.ndjson"))
        asset_rows = _read_ndjson(
            os.path.join(registry_abs, "asset-index.ndjson"))
        content_rows = _read_ndjson(
            os.path.join(registry_abs, "content-index.ndjson"))
    except (ValueError, OSError) as exc:
        print("error: cannot read registry indexes: %s" % exc,
              file=sys.stderr)
        return 1

    selected, selection_skipped = select_questions(
        question_rows, course_by_key, max_questions)

    cache = _ArchiveCache(source_abs, scan_entries, max_member_bytes)
    parsed_cache = {}
    emitted = []
    match_skipped = []
    for record in selected:
        key = (record.get("sourceKey") or "", record.get("member") or "")
        if key not in parsed_cache:
            data, error = cache.read_member(key[0], key[1])
            if error:
                parsed_cache[key] = (None, error)
            else:
                try:
                    parsed_cache[key] = (parse_member_items(data), "")
                except ET.ParseError:
                    parsed_cache[key] = (None, "xml-unparseable")
        parsed, error = parsed_cache[key]
        if error:
            match_skipped.append({"record": _record_label(record),
                                  "reason": "member-unreadable:" + error})
            continue
        item, reason = match_question(record, parsed)
        if reason:
            match_skipped.append({"record": _record_label(record),
                                  "reason": reason})
            continue
        if not item["presentation_found"]:
            match_skipped.append({"record": _record_label(record),
                                  "reason": "presentation-missing"})
            continue
        prompt, choices, truncated = extract_review_text(item["element"])
        question_id = make_question_id(
            record.get("sourceKey"), record.get("member"),
            record.get("itemIdent"), record.get("itemLabel"),
            record.get("globalId"), record.get("presentationSha256"))
        emitted.append({
            "questionId": question_id,
            "sourceKey": record.get("sourceKey"),
            "member": record.get("member"),
            "sourceKind": record.get("sourceKind"),
            "itemIdent": record.get("itemIdent"),
            "itemLabel": record.get("itemLabel"),
            "globalId": record.get("globalId"),
            "presentationSha256": record.get("presentationSha256"),
            "presentationFound": item["presentation_found"],
            "questionType": (record.get("questionType")
                             or item["question_type"]),
            "topicTags": sorted(record.get("topicTags") or []),
            "promptText": prompt,
            "choices": choices,
            "truncated": truncated,
            "_refs": list(record.get("referencedAssets") or []),
            "_images": [],
        })
    emitted.sort(key=lambda q: q["questionId"])

    os.makedirs(os.path.join(output_abs, IMAGES_SUBDIR), exist_ok=True)
    image_queue, copied, image_skipped = resolve_images(
        emitted, asset_rows, cache, os.path.join(output_abs, IMAGES_SUBDIR),
        max_images, max_image_bytes)
    stale_generated_images_removed = prune_stale_generated_images(
        os.path.join(output_abs, IMAGES_SUBDIR),
        {row["file"] for row in image_queue})
    duplicate_image_refs = sum(len(v["referrers"]) - 1
                               for v in copied.values())

    queue_rows = []
    for question in emitted:
        queue_rows.append({
            "questionId": question["questionId"],
            "sourceKey": question["sourceKey"],
            "member": question["member"],
            "sourceKind": question["sourceKind"],
            "itemIdent": question["itemIdent"],
            "itemLabel": question["itemLabel"],
            "globalId": question["globalId"],
            "presentationSha256": question["presentationSha256"],
            "presentationFound": question["presentationFound"],
            "questionType": question["questionType"],
            "topicTags": question["topicTags"],
            "promptText": question["promptText"],
            "choices": question["choices"],
            "truncated": question["truncated"],
            "referencedAssets": sorted(question["_refs"]),
            "imageFiles": sorted(question["_images"]),
        })

    try:
        existing_q = None if overwrite_decisions else load_decision_file(
            os.path.join(output_abs, OUTPUT_QDECISIONS), "question")
        existing_i = None if overwrite_decisions else load_decision_file(
            os.path.join(output_abs, OUTPUT_IDECISIONS), "image")
    except ValueError as exc:
        print("error: %s" % exc, file=sys.stderr)
        return 1
    q_ids = {q["questionId"] for q in emitted}
    i_ids = {i["imageId"] for i in image_queue}
    q_merged, q_stale, q_preserved, q_new = merge_decisions(
        existing_q, q_ids, blank_question_entry)
    i_merged, i_stale, i_preserved, i_new = merge_decisions(
        existing_i, i_ids, blank_image_entry)

    counts = {
        "registryQuestionRecords": len(question_rows),
        "registryAssetRecords": len(asset_rows),
        "registryContentRecords": len(content_rows),
        "selectedTopicRecords": len(selected),
        "emittedQuestions": len(emitted),
        "skippedQuestions": len(selection_skipped) + len(match_skipped),
        "emittedImages": len(image_queue),
        "duplicateImageReferences": duplicate_image_refs,
        "skippedImages": len(image_skipped),
        "staleGeneratedImagesRemoved": stale_generated_images_removed,
        "preservedQuestionDecisions": q_preserved,
        "newQuestionDecisions": q_new,
        "staleQuestionDecisions": len(q_stale),
        "preservedImageDecisions": i_preserved,
        "newImageDecisions": i_new,
        "staleImageDecisions": len(i_stale),
    }
    _atomic_write_ndjson(os.path.join(output_abs, OUTPUT_QUEUE), queue_rows)
    _atomic_write_json(os.path.join(output_abs, OUTPUT_QDECISIONS), {
        "schemaVersion": SCHEMA_VERSION,
        "tool": TOOL_NAME,
        "decisions": q_merged,
        "staleDecisions": q_stale,
        "allowedDecisions": list(QUESTION_DECISIONS),
    })
    _atomic_write_ndjson(os.path.join(output_abs, OUTPUT_IMAGE_QUEUE),
                         image_queue)
    _atomic_write_json(os.path.join(output_abs, OUTPUT_IDECISIONS), {
        "schemaVersion": SCHEMA_VERSION,
        "tool": TOOL_NAME,
        "decisions": i_merged,
        "staleDecisions": i_stale,
    })
    _atomic_write_text(os.path.join(output_abs, OUTPUT_INDEX),
                       build_index_html(queue_rows, image_queue, counts))

    output_hashes = {}
    for name in (OUTPUT_QUEUE, OUTPUT_QDECISIONS, OUTPUT_IMAGE_QUEUE,
                 OUTPUT_IDECISIONS, OUTPUT_INDEX):
        output_hashes[name] = _sha256_file(os.path.join(output_abs, name))
    for filename in sorted(os.listdir(os.path.join(output_abs,
                                                   IMAGES_SUBDIR))):
        if filename.endswith(".tmp"):
            continue
        output_hashes[IMAGES_SUBDIR + "/" + filename] = _sha256_file(
            os.path.join(output_abs, IMAGES_SUBDIR, filename))

    summary_inputs = []
    for entry in validated:
        summary_inputs.append({
            "filename": entry["filename"],
            "artifactRole": entry["artifactRole"],
            "courseCode": entry.get("courseCode"),
            "sourceVariant": entry.get("sourceVariant"),
            "expectedBytes": entry["expectedBytes"],
            "expectedSha256": entry["expectedSha256"],
            "actualBytes": entry["actualBytes"],
            "actualSha256": entry["actualSha256"],
            "status": entry["status"],
        })
    summary = {
        "schemaVersion": SCHEMA_VERSION,
        "tool": TOOL_NAME,
        "inputsFile": os.path.basename(inputs_path),
        "inputs": summary_inputs,
        "caps": {
            "maxQuestions": max_questions,
            "maxImages": max_images,
            "maxImageBytes": max_image_bytes,
            "maxMemberBytes": max_member_bytes,
        },
        "counts": counts,
        "skippedQuestionReasons": _count_reasons(selection_skipped
                                                + match_skipped),
        "skippedImageReasons": _count_reasons(image_skipped),
        "outputFileHashes": dict(sorted(output_hashes.items())),
        "limitations": [
            "Math 10C pilot only: Math 20/30 archives are validated but "
            "never scanned, and off-topic records are excluded.",
            "Question matches require exact source key/member, the safest "
            "available item identity, and an exact presentation hash; "
            "ambiguous or hash-mismatched records are rejected, never "
            "guessed.",
            "Review text is sanitized plain text from the QTI presentation "
            "subtree only; answers, scoring, solutions, and feedback are "
            "excluded and must never be reconstructed from this pack.",
            "Only inspected PNG/JPEG/GIF members whose bytes match the "
            "registry hash are copied; all other media are excluded.",
            "Decisions are human blanks until reviewers set them; reruns "
            "preserve existing decisions unless --overwrite-decisions is "
            "passed explicitly.",
        ],
        "privateRuntimeWarning": PRIVATE_RUNTIME_WARNING,
    }
    _atomic_write_json(os.path.join(output_abs, OUTPUT_SUMMARY), summary)

    passed, checked_files, forbidden_hits = audit_outputs(
        output_abs, source_abs, registry_abs, output_abs)
    summary["selfAudit"] = {"passed": passed,
                            "checkedFiles": sorted(checked_files),
                            "forbiddenHits": forbidden_hits}
    _atomic_write_json(os.path.join(output_abs, OUTPUT_SUMMARY), summary)
    if not passed:
        print("error: output privacy self-audit failed: %s"
              % json.dumps(forbidden_hits, sort_keys=True), file=sys.stderr)
        return 3
    print("review pack complete: %d questions, %d images "
          "(%d skipped questions, %d skipped images)"
          % (len(emitted), len(image_queue), counts["skippedQuestions"],
             counts["skippedImages"]))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Build a deterministic private Math 10C review pack "
                    "(standard library only; Math 10C pilot topics only).")
    parser.add_argument("--source-root", required=True,
                        help="private directory holding the files named in "
                             "--inputs (read-only, never modified)")
    parser.add_argument("--inputs", required=True,
                        help="inputs manifest (e.g. "
                             "tasks/math-source-registry/SOURCE_INPUTS.json)")
    parser.add_argument("--registry-dir", required=True,
                        help="directory holding the registry NDJSON indexes "
                             "(read-only, never modified)")
    parser.add_argument("--output-dir", required=True,
                        help="ignored runtime directory for review-pack "
                             "outputs (refused inside tracked repo paths "
                             "unless under .runtime/)")
    parser.add_argument("--max-questions", type=int,
                        default=DEFAULT_MAX_QUESTIONS,
                        help="maximum selected questions "
                             "(default %d)" % DEFAULT_MAX_QUESTIONS)
    parser.add_argument("--max-images", type=int, default=DEFAULT_MAX_IMAGES,
                        help="maximum copied images (default %d)"
                             % DEFAULT_MAX_IMAGES)
    parser.add_argument("--max-image-bytes", type=int,
                        default=DEFAULT_MAX_IMAGE_BYTES,
                        help="maximum individual image bytes (default %d)"
                             % DEFAULT_MAX_IMAGE_BYTES)
    parser.add_argument("--max-member-bytes", type=int,
                        default=DEFAULT_MAX_MEMBER_BYTES,
                        help="per-member ZIP read bound (default %d)"
                             % DEFAULT_MAX_MEMBER_BYTES)
    parser.add_argument("--overwrite-decisions", action="store_true",
                        help="intentionally reset existing decision "
                             "templates to blanks")
    args = parser.parse_args(argv)
    if args.max_questions < 0 or args.max_images < 0 \
            or args.max_image_bytes < 0 or args.max_member_bytes < 0:
        print("error: bounds must be non-negative", file=sys.stderr)
        return 2
    return run(args.source_root, args.inputs, args.registry_dir,
               args.output_dir, args.max_questions, args.max_images,
               args.max_image_bytes, args.max_member_bytes,
               args.overwrite_decisions)


if __name__ == "__main__":
    sys.exit(main())
