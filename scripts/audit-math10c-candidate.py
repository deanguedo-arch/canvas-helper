#!/usr/bin/env python3
"""Pre-generation Math 10C candidate-audit harness (Phase A assistance).

Read-only static triage scanner. It never modifies the candidate, never
certifies mathematical correctness, accessibility conformance, live
Brightspace behaviour, or production readiness.

Usage:
    python3 scripts/audit-math10c-candidate.py <candidate-zip-or-directory> \
      --requirements tasks/math10c-preflight/ASTRA_REQUIREMENTS.json \
      --output <report.json>
"""

import argparse
import hashlib
import json
import os
import posixpath
import re
import sys
import zipfile
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree as ET

SCANNER_VERSION = "1.0.0"
MAX_CANDIDATE_BYTES = 512 * 1024 * 1024
MAX_MEMBER_BYTES = 256 * 1024 * 1024

APPROVED_EXTERNAL_SCHEMES = ("http://", "https://")
IGNORED_REF_SCHEMES = ("#", "data:", "mailto:", "tel:", "javascript:", "blob:")
ESSENTIAL_MEDIA_EXTS = (".mp4", ".webm", ".ogv", ".mov", ".mp3", ".wav",
                        ".ogg", ".oga", ".pdf", ".swf")

PLACEHOLDER_PATTERNS = [
    r"lorem\s+ipsum", r"\bTODO\b", r"\bFIXME\b", r"\bXXX\b", r"\bTBD\b",
    r"coming\s+soon", r"placeholder\s+(text|image|content|page|section)",
    r"under\s+construction", r"insert\s+.*\s+here", r"\[insert",
    r"replace\s+me\b", r"dummy\s+(text|content|image)",
]
DEV_ONLY_PATTERNS = [
    r"console\.log\s*\(", r"\bdebugger\s*;", r"\balert\s*\(",
    r"HACK\b", r"do\s+not\s+ship", r"internal\s+repair\s+note",
    r"teacher\s+note\s*:\s*fix", r"remove\s+before\s+(ship|release|export)",
]

FLOW_STAGES = {
    "instruction": [r"\blearn\b", r"\blesson\b", r"instruction", r"\bread\b",
                    r"\bwatch\b", r"introduction", r"worked\s+example"],
    "attempted_work": [r"\battempt\b", r"\btry\b", r"your\s+turn",
                       r"practice", r"exercise"],
    "feedback_repair": [r"feedback", r"\bhint\b", r"feedback",
                        r"try\s+again", r"solution", r"review",
                        r"common\s+(error|mistake)"],
    "fresh_attempt": [r"\bretry\b", r"new\s+attempt", r"fresh\s+attempt",
                      r"another\s+(try|attempt|question)", r"again"],
    "independent_evidence": [r"\bcheck\b", r"\bquiz\b",
                             r"show\s+what\s+you\s+know", r"assessment",
                             r"exit\s+ticket", r"self-?check"],
}

FACTOR_PATTERNS = [r"\bfactor", r"\bGCF\b", r"greatest\s+common",
                   r"\btrinomial", r"difference\s+of\s+squares",
                   r"\bgrouping\b", r"common\s+factor",
                   r"x\^2|²|\bsquared\b"]
TRIG_PATTERNS = [r"trigonometr", r"\bsine?\b", r"\bcosine?\b",
                 r"\btangent?\b", r"\bSOH\b", r"hypotenuse",
                 r"opposite\s*/\s*(adjacent|hypotenuse)",
                 r"right[\s-]?triangle"]

SCORM_MARKER_PATTERNS = [r"SCORM", r"LMSInitialize", r"\bInitialize\b",
                         r"\bTerminate\b", r"\bSetValue\b", r"\bcmi\.",
                         r"suspend_data", r"completion_status",
                         r"scorm-?tracking\.json"]
STATE_KEY_PATTERNS = [r"localStorage", r"sessionStorage",
                      r"suspend_data", r"storageKey"]
SECRET_PATTERNS = [r"answer[\s_-]?key", r"answerkey", r"test[\s_-]?bank",
                   r"exam\s+key", r"final[\s_-]?exam",
                   r"solutions?\s+key", r"gradebook", r"teacher\s+only",
                   r"secret"]


class AssetRefParser(HTMLParser):
    """Collect local asset references and accessibility signals."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs = []  # (tag, attr, value, line)
        self.html_lang = None
        self.has_title = False
        self._in_title = False
        self._title_text = ""
        self.images_missing_alt = []  # (line, src)
        self.controls = []  # (tag, line, labelled)
        self._labels_for = set()
        self._label_stack = 0
        self.ids = []  # (value, line)
        self.data_ids = []  # (attr, value, line)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        line, _ = self.getpos()
        if tag == "html":
            self.html_lang = attrs.get("lang")
        if tag == "title":
            self._in_title = True
        if tag == "label":
            if attrs.get("for"):
                self._labels_for.add(attrs["for"])
            self._label_stack += 1
        for attr in ("src", "href"):
            if attrs.get(attr):
                self.refs.append((tag, attr, attrs[attr], line))
        if tag == "img" and "alt" not in attrs:
            self.images_missing_alt.append((line, attrs.get("src", "")))
        if tag in ("input", "select", "textarea"):
            labelled = bool(
                attrs.get("aria-label") or attrs.get("aria-labelledby")
                or self._label_stack > 0
                or (tag == "input" and attrs.get("type") in
                    ("hidden", "submit", "button", "reset", "image")))
            self.controls.append((tag, line, labelled,
                                  attrs.get("id", ""), attrs.get("type", "")))
        if attrs.get("id"):
            self.ids.append((attrs["id"], line))
        for key, value in attrs.items():
            if key.startswith("data-") and any(
                    stem in key for stem in
                    ("question", "activity", "item", "save", "state",
                     "attempt", "seed", "version")):
                self.data_ids.append((key, value, line))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
            if self._title_text.strip():
                self.has_title = True
        if tag == "label" and self._label_stack > 0:
            self._label_stack -= 1

    def handle_data(self, data):
        if self._in_title:
            self._title_text += data


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def load_candidate(path):
    """Return kind, label, files, error, digest, and original member names."""
    if os.path.isfile(path) and zipfile.is_zipfile(path):
        with open(path, "rb") as handle:
            raw = handle.read()
        digest = sha256_bytes(raw)
        files = {}
        member_names = []
        try:
            with zipfile.ZipFile(path) as archive:
                members = [info for info in archive.infolist()
                           if not info.is_dir()]
                member_names = [info.filename for info in members]
                if any(info.file_size > MAX_MEMBER_BYTES for info in members):
                    return ("zip", path, None,
                            "candidate contains a member above the 256 MiB safety limit",
                            digest, member_names)
                if sum(info.file_size for info in members) > MAX_CANDIDATE_BYTES:
                    return ("zip", path, None,
                            "candidate exceeds the 512 MiB inspection safety limit",
                            digest, member_names)
                for info in members:
                    if info.is_dir():
                        continue
                    with archive.open(info) as member:
                        files[info.filename] = member.read()
        except zipfile.BadZipFile as exc:
            return ("zip", path, None, str(exc), digest, member_names)
        return ("zip", path, files, None, digest, member_names)
    if os.path.isdir(path):
        files = {}
        bytes_total = 0
        for root, _dirs, names in os.walk(path):
            for name in sorted(names):
                full = os.path.join(root, name)
                rel = os.path.relpath(full, path).replace(os.sep, "/")
                size = os.path.getsize(full)
                if size > MAX_MEMBER_BYTES:
                    return ("directory", path, None,
                            "candidate contains a file above the 256 MiB safety limit",
                            "", sorted(files))
                bytes_total += size
                if bytes_total > MAX_CANDIDATE_BYTES:
                    return ("directory", path, None,
                            "candidate exceeds the 512 MiB inspection safety limit",
                            "", sorted(files))
                with open(full, "rb") as handle:
                    files[rel] = handle.read()
        digest = sha256_bytes(
            "".join(f"{k}:{sha256_bytes(v)}\n"
                    for k, v in sorted(files.items())).encode("utf-8"))
        return ("directory", path, files, None, digest, sorted(files))
    return ("unknown", path, None, "not a ZIP file or directory", "", [])


def is_html_name(name):
    return name.lower().endswith((".html", ".htm", ".xhtml"))


def decode_html(data):
    """Return (text, encoding, error). Tries UTF-8 then UTF-16."""
    try:
        return (data.decode("utf-8"), "utf-8", None)
    except UnicodeDecodeError:
        pass
    try:
        return (data.decode("utf-16"), "utf-16", None)
    except (UnicodeDecodeError, LookupError) as exc:
        return (None, None, str(exc))


def make_check(check_id, severity, status, detail, evidence, limitation):
    return {"id": check_id, "severity": severity, "status": status,
            "detail": detail, "evidence": sorted(evidence)[:50],
            "evidenceTruncated": len(evidence) > 50,
            "limitation": limitation}


def external_url(value):
    lowered = value.strip().lower()
    return lowered.startswith(APPROVED_EXTERNAL_SCHEMES) or \
        lowered.startswith("//")


def ignored_ref(value):
    lowered = value.strip().lower()
    return any(lowered.startswith(s) for s in IGNORED_REF_SCHEMES)


def resolve_local(base_dir, value):
    """Resolve a local ref against base_dir. None if not resolvable."""
    cleaned = unquote(value.split("#")[0].split("?")[0].strip())
    if not cleaned or ignored_ref(cleaned) or external_url(cleaned):
        return None
    if os.path.isabs(cleaned):
        return None
    target = posixpath.normpath(posixpath.join(
        base_dir, cleaned.replace("\\", "/")))
    if target == ".." or target.startswith("../"):
        return None
    return target.lstrip("./")


def safe_external_url(value):
    """Return an evidence-safe URL without query, fragment, or credentials."""
    supplied = value.strip()
    parsed = urlsplit("https:" + supplied if supplied.startswith("//") else supplied)
    host = parsed.hostname or ""
    if parsed.port:
        host = f"{host}:{parsed.port}"
    return f"{parsed.scheme}://{host}{parsed.path}"


def run_checks(files, requirements, source_names=None):
    checks = []
    names = list(files.keys())
    original_names = list(source_names or names)
    lowered = {}
    dupes, collisions = set(), set()
    seen = set()
    for name in original_names:
        if name in seen:
            dupes.add(name)
        seen.add(name)
        key = name.lower()
        if key in lowered and lowered[key] != name:
            collisions.add(f"{lowered[key]} <-> {name}")
        lowered.setdefault(key, name)

    bad_members = [n for n in original_names
                   if n.startswith("/") or n.startswith("\\")
                   or re.match(r"^[A-Za-z]:", n) or "/../" in n
                   or n.startswith("../") or "\\..\\" in n
                   or n.startswith("..\\")]
    if bad_members:
        checks.append(make_check(
            "ZIP_PATHS", "major", "fail",
            f"{len(bad_members)} member(s) use absolute or traversal paths.",
            bad_members, "Member-name inspection only; does not test extraction behaviour."))
    else:
        checks.append(make_check(
            "ZIP_PATHS", "major", "pass",
            "No absolute or traversal member paths found.",
            [], "Member-name inspection only; does not test extraction behaviour."))
    if dupes or collisions:
        checks.append(make_check(
            "ZIP_DUPLICATES", "major", "fail",
            "Duplicate or case-colliding names present.",
            sorted(dupes) + sorted(collisions),
            "Name-level integrity only; does not validate content."))
    else:
        checks.append(make_check(
            "ZIP_DUPLICATES", "major", "pass",
            "No duplicate or case-colliding names.",
            [], "Name-level integrity only; does not validate content."))
    checks.append(make_check(
        "INPUT_INTEGRITY", "info", "pass",
        f"Candidate loaded successfully ({len(original_names)} entries; {len(files)} unique paths).",
        [], "Successful static loading is not package, runtime, or LMS validation."))

    # HTML decoding + parsing (single pass, shared by later checks).
    decoded = {}
    undecodable = []
    for name in sorted(names):
        if is_html_name(name):
            text, encoding, error = decode_html(files[name])
            if text is None:
                undecodable.append(f"{name}: {error}")
            else:
                decoded[name] = (text, encoding)
    if undecodable:
        checks.append(make_check(
            "HTML_DECODING", "major", "fail",
            f"{len(undecodable)} HTML file(s) undecodable as UTF-8 or UTF-16.",
            undecodable, "Decodability is not correctness of the encoded text or mathematics."))
    elif decoded:
        encodings = sorted({enc for _, enc in decoded.values()})
        checks.append(make_check(
            "HTML_DECODING", "info", "pass",
            f"{len(decoded)} HTML file(s) decoded ({', '.join(encodings)}).",
            [f"{n} [{enc}]" for n, (_, enc) in sorted(decoded.items())],
            "Decodability is not correctness of the encoded text or mathematics."))
    else:
        checks.append(make_check(
            "HTML_DECODING", "info", "not_applicable",
            "Candidate contains no HTML files.",
            [], "Nothing to decode."))

    parsed = {}
    for name, (text, _enc) in decoded.items():
        parser = AssetRefParser()
        try:
            parser.feed(text)
        except Exception:
            pass
        parsed[name] = parser

    # Manifest.
    manifests = [n for n in names
                 if n.lower().endswith("imsmanifest.xml")]
    if manifests:
        missing, parse_errors = [], []
        for manifest in manifests:
            try:
                root = ET.fromstring(files[manifest])
            except (ET.ParseError, UnicodeError) as exc:
                parse_errors.append(f"{manifest}: {exc}")
                continue
            refs = set()
            for elem in root.iter():
                href = elem.get("href")
                if href:
                    refs.add(href)
                if elem.tag.endswith("file"):
                    href_attr = elem.get("href")
                    if href_attr:
                        refs.add(href_attr)
            base = manifest.rpartition("/")[0]
            for ref in sorted(refs):
                target = resolve_local(base, ref)
                if target is not None and target not in files:
                    missing.append(f"{manifest} -> {ref}")
        if parse_errors:
            checks.append(make_check(
                "MANIFEST_PARSE", "major", "fail",
                "imsmanifest.xml failed to parse.",
                parse_errors, "Parseability is not packaging validity and not LMS proof."))
        else:
            checks.append(make_check(
                "MANIFEST_PARSE", "major", "pass",
                f"{len(manifests)} manifest(s) parsed as XML.",
                manifests, "Parseability is not packaging validity and not LMS proof."))
        if missing:
            checks.append(make_check(
                "MANIFEST_REFS", "major", "fail",
                f"{len(missing)} manifest-referenced file(s) missing.",
                missing, "Static reference resolution only; does not prove LMS-served correctness."))
        elif not parse_errors:
            checks.append(make_check(
                "MANIFEST_REFS", "major", "pass",
                "All manifest-referenced files present.",
                manifests, "Static reference resolution only; does not prove LMS-served correctness."))
        else:
            checks.append(make_check(
                "MANIFEST_REFS", "major", "error",
                "Manifest references not checked because parsing failed.",
                manifests, "Blocked by MANIFEST_PARSE failure."))
    else:
        for check_id, detail in (
                ("MANIFEST_PARSE", "No imsmanifest.xml present; parse check not applicable."),
                ("MANIFEST_REFS", "No imsmanifest.xml present; reference check not applicable.")):
            checks.append(make_check(
                check_id, "info", "not_applicable", detail, [],
                "A missing manifest is itself review information, not a pass."))

    # Local references in HTML + CSS url(...).
    broken, css_checked = [], 0
    for name, (text, _enc) in decoded.items():
        base = name.rpartition("/")[0]
        for _tag, _attr, value, line in parsed[name].refs:
            target = resolve_local(base, value)
            if target is None:
                continue
            if target not in files and f"{target}/" not in {
                    n[:len(target) + 1] for n in names}:
                broken.append(f"{name}:{line} -> {value}")
    css_url_re = re.compile(r"url\(\s*['\"]?([^'\"\)]+)['\"]?\s*\)",
                            re.IGNORECASE)
    for name in sorted(names):
        if name.lower().endswith(".css"):
            try:
                text = files[name].decode("utf-8-sig")
            except UnicodeDecodeError:
                continue
            css_checked += 1
            base = name.rpartition("/")[0]
            for match in css_url_re.finditer(text):
                target = resolve_local(base, match.group(1))
                if target is None:
                    continue
                if target not in files:
                    broken.append(f"{name} -> {match.group(1)}")
    if broken:
        checks.append(make_check(
            "LOCAL_REFS", "major", "fail",
            f"{len(broken)} broken local reference(s).",
            broken, "Static resolution only; anchors, data URLs, mailto/tel, and approved external schemes are ignored."))
    else:
        checks.append(make_check(
            "LOCAL_REFS", "major", "pass",
            f"All local HTML/CSS references resolve ({len(decoded)} HTML, {css_checked} CSS checked).",
            [], "Static resolution only; anchors, data URLs, mailto/tel, and approved external schemes are ignored."))

    # Placeholders / developer-only language (low confidence, heuristic).
    ph_hits = []
    for name, (text, _enc) in decoded.items():
        for pattern in PLACEHOLDER_PATTERNS + DEV_ONLY_PATTERNS:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                start = max(0, match.start() - 30)
                snippet = re.sub(r"\s+", " ",
                                 text[start:match.end() + 30]).strip()
                ph_hits.append(f"{name}: ...{snippet}...")
                break
    if ph_hits:
        checks.append(make_check(
            "PLACEHOLDERS", "minor", "manual_review",
            f"{len(ph_hits)} possible placeholder or developer-only language hit(s); low confidence, heuristic wordlist.",
            ph_hits, "Heuristic wording match only; reviewer confirms each hit."))
    else:
        checks.append(make_check(
            "PLACEHOLDERS", "minor", "pass",
            "No placeholder or developer-only language patterns matched.",
            [], "Heuristic wordlist only; absence of matches is not proof of completeness."))

    # External dependencies + essential media.
    externals = set()
    url_re = re.compile(r"""(?:src|href)\s*=\s*['"]([^'"]+)['"]|"""
                        r"""url\(\s*['"]?([^'\"\)]+)['"]?\s*\)""",
                        re.IGNORECASE)
    for name, (text, _enc) in decoded.items():
        for match in url_re.finditer(text):
            for group in match.groups():
                if group and external_url(group):
                    externals.add(f"{name} -> {safe_external_url(group)}")
    for name in sorted(names):
        if name.lower().endswith((".css", ".js")):
            try:
                text = files[name].decode("utf-8-sig")
            except UnicodeDecodeError:
                continue
            for match in url_re.finditer(text):
                for group in match.groups():
                    if group and external_url(group):
                        externals.add(f"{name} -> {safe_external_url(group)}")
    if externals:
        checks.append(make_check(
            "EXTERNAL_DEPS", "major", "manual_review",
            f"{len(externals)} external URL reference(s) need vendoring review.",
            sorted(externals), "Static URL extraction only; cannot tell whether a URL is fetched at runtime or reachable from the LMS."))
    else:
        checks.append(make_check(
            "EXTERNAL_DEPS", "info", "pass",
            "No external http(s)/protocol-relative URL references found.",
            [], "Static URL extraction only."))

    missing_media = []
    for name, (text, _enc) in decoded.items():
        base = name.rpartition("/")[0]
        for _tag, _attr, value, line in parsed[name].refs:
            cleaned = value.split("#")[0].split("?")[0]
            if cleaned.lower().endswith(ESSENTIAL_MEDIA_EXTS):
                target = resolve_local(base, value)
                if target is not None and target not in files:
                    missing_media.append(f"{name}:{line} -> {value}")
    if missing_media:
        checks.append(make_check(
            "MEDIA_RISK", "major", "fail",
            f"{len(missing_media)} referenced essential media file(s) missing.",
            missing_media, "Presence is not playability; codec, size, and LMS serving need live proof."))
    else:
        checks.append(make_check(
            "MEDIA_RISK", "info", "pass",
            "No missing referenced essential media files.",
            [], "Presence is not playability; codec, size, and LMS serving need live proof."))

    # Accessibility indicators (never certification).
    no_lang = [n for n, p in sorted(parsed.items()) if not p.html_lang]
    no_title = [n for n, p in sorted(parsed.items()) if not p.has_title]
    if no_lang or no_title:
        checks.append(make_check(
            "A11Y_LANG_TITLE", "minor", "fail",
            "Some documents lack a language declaration or non-empty title.",
            [f"missing lang: {n}" for n in no_lang]
            + [f"missing title: {n}" for n in no_title],
            "Presence indicator only, not accessibility certification."))
    elif parsed:
        checks.append(make_check(
            "A11Y_LANG_TITLE", "minor", "pass",
            f"All {len(parsed)} parsed document(s) declare lang and title.",
            [], "Presence indicator only, not accessibility certification."))
    else:
        checks.append(make_check(
            "A11Y_LANG_TITLE", "minor", "not_applicable",
            "No HTML documents to assess.", [],
            "Nothing to assess."))

    img_hits = [f"{n}:{line} src={src}"
                for n, p in sorted(parsed.items())
                for line, src in p.images_missing_alt]
    if img_hits:
        checks.append(make_check(
            "A11Y_IMG_ALT", "minor", "manual_review",
            f"{len(img_hits)} image(s) without an alt attribute need review.",
            img_hits, "Indicator only; meaningfulness of alternatives, especially graphs, needs human review."))
    elif parsed:
        checks.append(make_check(
            "A11Y_IMG_ALT", "minor", "pass",
            "All parsed images carry an alt attribute.",
            [], "Indicator only; meaningfulness of alternatives needs human review."))
    else:
        checks.append(make_check(
            "A11Y_IMG_ALT", "minor", "not_applicable",
            "No HTML documents to assess.", [],
            "Nothing to assess."))

    unlabeled = []
    for name, parser in sorted(parsed.items()):
        for tag, line, labelled, cid, _ctype in parser.controls:
            if not labelled and not (cid and cid in parser._labels_for):
                unlabeled.append(f"{name}:{line} <{tag}>")
    if unlabeled:
        checks.append(make_check(
            "A11Y_FORM_LABELS", "major", "fail",
            f"{len(unlabeled)} form control(s) without an evident label.",
            unlabeled, "Heuristic label association; dynamic or ARIA-complex labelling needs human assistive-technology review."))
    elif parsed:
        checks.append(make_check(
            "A11Y_FORM_LABELS", "major", "pass",
            "All parsed form controls show an evident label.",
            [], "Heuristic label association; human verification still required."))
    else:
        checks.append(make_check(
            "A11Y_FORM_LABELS", "major", "not_applicable",
            "No HTML documents to assess.", [],
            "Nothing to assess."))

    # Stable IDs.
    duplicate_ids = []
    for name, parser in parsed.items():
        id_counts = {}
        for value, line in parser.ids:
            id_counts.setdefault(value, []).append(line)
        duplicate_ids.extend(
            f"{name}: id={value!r} ({len(lines)}x at lines {', '.join(map(str, lines[:5]))})"
            for value, lines in sorted(id_counts.items()) if len(lines) > 1)
    data_id_count = sum(len(p.data_ids) for p in parsed.values())
    if duplicate_ids:
        checks.append(make_check(
            "STABLE_IDS", "major", "fail",
            f"{len(duplicate_ids)} within-document duplicate id value(s).",
            duplicate_ids, "IDs need be unique within a document; semantic stability across versions needs human versioning discipline."))
    else:
        checks.append(make_check(
            "STABLE_IDS", "info",
            "pass" if data_id_count else "manual_review",
            f"No duplicate ids; {data_id_count} interaction/save data-kan identifier(s) found."
            if data_id_count else
            "No duplicate ids, but no interaction/save data-kan identifiers detected; confirm save identity design.",
            [f"{n}: {a}={v!r}"[:120]
             for n, p in sorted(parsed.items())
             for a, v, _ln in p.data_ids][:20],
            "Uniqueness of id attributes is checkable; semantic stability across versions needs human versioning discipline."))

    # SCORM / save / completion markers + state budget (inspection only).
    corpus = {n: t for n, (t, _e) in decoded.items()}
    for n in sorted(names):
        if n.lower().endswith(".js"):
            try:
                corpus[n] = files[n].decode("utf-8-sig")
            except UnicodeDecodeError:
                continue
    scorm_hits = []
    for name, text in sorted(corpus.items()):
        for pattern in SCORM_MARKER_PATTERNS:
            if re.search(pattern, text):
                scorm_hits.append(f"{name}: {pattern}")
                break
    tracking = [n for n in names
                if n.lower().endswith("scorm-tracking.json")]
    if scorm_hits or tracking:
        checks.append(make_check(
            "SCORM_MARKERS", "info", "pass",
            "SCORM/save/completion markers present (inspection only).",
            sorted(set(scorm_hits + tracking)),
            "Marker presence is not proof of working save, commit, or reported completion."))
    else:
        checks.append(make_check(
            "SCORM_MARKERS", "info", "manual_review",
            "No SCORM/save/completion markers detected; confirm save design.",
            [], "Marker presence is not proof of working save, commit, or reported completion."))

    state_hits = []
    for name, text in sorted(corpus.items()):
        for pattern in STATE_KEY_PATTERNS:
            for match in re.finditer(pattern, text):
                start = max(0, match.start() - 40)
                snippet = re.sub(r"\s+", " ",
                                 text[start:match.end() + 40]).strip()
                state_hits.append(f"{name}: ...{snippet}..."[:140])
                break
    checks.append(make_check(
        "STATE_BUDGET", "info",
        "pass" if state_hits else "manual_review",
        f"{len(state_hits)} state-key/storage reference(s) inventoried."
        if state_hits else "No state-key/storage references detected; confirm state design.",
        sorted(set(state_hits)),
        "Static evidence only; byte budget against suspend_data limits needs runtime measurement."))

    # Learner-flow evidence (label-agnostic keyword triage).
    full_text = "\n".join(corpus.values())
    flow_evidence, flow_missing = [], []
    for stage, patterns in FLOW_STAGES.items():
        hits = [p for p in patterns
                if re.search(p, full_text, re.IGNORECASE)]
        if hits:
            flow_evidence.append(f"{stage}: {', '.join(hits[:3])}")
        else:
            flow_missing.append(stage)
    if not corpus:
        checks.append(make_check(
            "LEARNER_FLOW", "info", "not_applicable",
            "No readable text documents to scan.", [],
            "Nothing to scan."))
    elif not flow_missing:
        checks.append(make_check(
            "LEARNER_FLOW", "info", "pass",
            "Keyword evidence found for all five flow stages.",
            flow_evidence, "Keyword presence is not proof of a working sequence; the exact labels Learn/Practise/Show what you know are not required."))
    else:
        checks.append(make_check(
            "LEARNER_FLOW", "info", "manual_review",
            f"Keyword evidence missing for: {', '.join(flow_missing)}; may be vocabulary mismatch.",
            flow_evidence, "Keyword presence is not proof of a working sequence; absence may be vocabulary mismatch."))

    # Pilot content indicators (never mathematical validation).
    factoring = sorted({p for p in FACTOR_PATTERNS
                        if re.search(p, full_text, re.IGNORECASE)})
    trig = sorted({p for p in TRIG_PATTERNS
                   if re.search(p, full_text, re.IGNORECASE)})
    checks.append(make_check(
        "PILOT_FACTORING", "info",
        "pass" if factoring else "manual_review",
        f"Factoring indicators: {', '.join(factoring)}."
        if factoring else "No factoring keyword indicators found.",
        [f"pattern: {p}" for p in factoring],
        "Content keyword indicator only, never mathematical validation or completeness proof."))
    checks.append(make_check(
        "PILOT_TRIG", "info",
        "pass" if trig else "manual_review",
        f"Trigonometry indicators: {', '.join(trig)}."
        if trig else "No trigonometry keyword indicators found; confirm the smaller trig contrast is present.",
        [f"pattern: {p}" for p in trig],
        "Content keyword indicator only; scope judgment (smaller contrast, not a second course) needs a human."))

    # Formal-assessment secrets: review flag, never print contents.
    secret_hits = []
    for name in sorted(names):
        lowered_name = name.lower()
        if any(s in lowered_name for s in
               ("answer_key", "answerkey", "test_bank", "testbank",
                "exam_key", "solutions_key", "gradebook")):
            secret_hits.append(f"{name} [filename indicator]")
    for name, text in sorted(corpus.items()):
        for pattern in SECRET_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                secret_hits.append(f"{name} [text indicator: {pattern}]")
                break
    checks.append(make_check(
        "SECRET_EXPOSURE", "major",
        "manual_review" if secret_hits else "pass",
        f"{len(secret_hits)} possible formal-assessment secret indicator(s) flagged for review; contents withheld."
        if secret_hits else "No formal-assessment secret indicators matched.",
        sorted(set(secret_hits)),
        "Keyword and filename heuristics only; cannot detect obfuscated secrets. Matched contents are never printed."))

    # Requirement coverage: denominator is every requirement.
    status_by_id = {c["id"]: c["status"] for c in checks}
    unresolved, verified = [], 0
    automated_total = 0
    for req in requirements:
        check_id = req.get("automatedCheck")
        if not check_id:
            unresolved.append(f"{req['id']} [human review]")
            continue
        automated_total += 1
        if status_by_id.get(check_id) == "pass":
            verified += 1
        else:
            unresolved.append(
                f"{req['id']} [{check_id}: {status_by_id.get(check_id)}]")
    coverage = {"requirementTotal": len(requirements),
                "automatedTotal": automated_total,
                "verifiedCount": verified,
                "verifiedFraction": f"{verified}/{len(requirements)}",
                "unresolved": sorted(unresolved)}
    return checks, coverage


def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Static pre-generation Math 10C candidate audit (Phase A). Read-only.")
    parser.add_argument("candidate", help="candidate ZIP file or directory")
    parser.add_argument("--requirements", required=True,
                        help="path to ASTRA_REQUIREMENTS.json")
    parser.add_argument("--output", required=True,
                        help="path for the deterministic JSON report")
    args = parser.parse_args(argv)

    with open(args.requirements, "r", encoding="utf-8-sig") as handle:
        req_doc = json.load(handle)
    requirements = req_doc.get("requirements", [])

    kind, label, files, load_error, digest, source_names = load_candidate(args.candidate)

    report = {
        "scanner": {
            "name": "audit-math10c-candidate",
            "version": SCANNER_VERSION,
            "role": "Phase A static triage only; not a substitute for "
                    "independent mathematical derivation, rendered browser "
                    "inspection, teacher review, or Phase B claim verification.",
        },
        "candidate": {"label": os.path.basename(label), "kind": kind,
                      "sha256": digest,
                      "fileCount": len(files) if files is not None else 0,
                      "entryCount": len(source_names),
                      "bytesTotal": sum(len(v) for v in files.values())
                      if files is not None else 0},
        "inventory": {},
        "checks": [],
        "requirementCoverage": {},
        "counts": {"byStatus": {}, "bySeverity": {}},
        "limitations": [
            "Static analysis only: no rendering, no execution, no LMS contact.",
            "Keyword checks are triage indicators, never proof of pedagogy, "
            "mathematics, accessibility, or readiness.",
            "The scanner must not attempt to certify mathematical correctness.",
            "Passing checks or matching filenames are not LMS proof, teacher "
            "acceptance, or release readiness.",
        ],
    }

    if files is None:
        report["checks"] = [make_check(
            "ZIP_INTEGRITY", "major", "error",
            f"Could not load candidate: {load_error}", [label],
            "Unreadable input cannot be audited.")]
        report["requirementCoverage"] = {
            "requirementTotal": len(requirements),
            "automatedTotal": 0, "verifiedCount": 0,
            "verifiedFraction": f"0/{len(requirements)}",
            "unresolved": sorted(r["id"] for r in requirements)}
    else:
        inventory_files = [
            {"path": name, "size": len(data),
             "sha256": sha256_bytes(data)} for name, data in files.items()]
        inventory_files.sort(key=lambda row: row["path"])
        report["inventory"] = {
            "files": inventory_files,
            "htmlFiles": sorted(n for n in files if is_html_name(n)),
            "manifestPresent": any(n.lower().endswith("imsmanifest.xml")
                                   for n in files),
        }
        checks, coverage = run_checks(files, requirements, source_names)
        report["checks"] = checks
        report["requirementCoverage"] = coverage

    for check in report["checks"]:
        report["counts"]["byStatus"][check["status"]] = \
            report["counts"]["byStatus"].get(check["status"], 0) + 1
        report["counts"]["bySeverity"][check["severity"]] = \
            report["counts"]["bySeverity"].get(check["severity"], 0) + 1

    with open(args.output, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2, sort_keys=True)
        handle.write("\n")
    print(f"wrote {args.output}: {len(report['checks'])} checks, "
          f"coverage {report['requirementCoverage'].get('verifiedFraction')}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
