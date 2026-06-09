#!/usr/bin/env python3
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE_DATA = ROOT / "workspace" / "source-package" / "workspace-source" / "course-data.js"
RUNTIME_EXTS = {".html", ".js", ".css"}
FORBIDDEN = [
    "Firebase",
    "firebase",
    "hosted-runtime-content",
    "D2LCCExport",
    "quickLink",
    "localStorage",
    "sessionStorage",
    "Course progress",
    "Mark Complete",
    "Mark this lesson complete",
    "FORCE_UNLOCK",
]


def read(path):
    return path.read_text(encoding="utf-8", errors="replace")


def parse_object(path, marker):
    text = read(path)
    match = re.search(re.escape(marker) + r"\s*=\s*(\{.*?\})\s*;\s*(?:window\.|$)", text, re.S)
    if not match:
        match = re.search(r"=\s*(\{.*\})\s*;", text, re.S)
    if not match:
        raise RuntimeError(f"Could not parse object from {path}")
    return json.loads(match.group(1))


def module_number(module_dir):
    match = re.search(r"module-(\d+)-static", module_dir.name)
    if not match:
        raise RuntimeError("module directory must be named module-N-static")
    return int(match.group(1))


def local_ref_exists(file_path, ref):
    if not ref or re.match(r"^(?:https?:|mailto:|data:|#|javascript:)", ref, re.I):
        return True
    clean = ref.split("#", 1)[0].split("?", 1)[0]
    return not clean or (file_path.parent / clean).resolve().exists()


def assignment_asset_refs(assignment_dir):
    roots = set()
    required_files = set()
    if not assignment_dir.is_dir():
        return [], []
    for path in assignment_dir.iterdir():
        if path.is_dir() and re.fullmatch(r"module\d+", path.name):
            roots.add(path.name)
    for path in assignment_dir.glob("*.js"):
        text = read(path)
        constants = {}
        for name, root in re.findall(r"\b(MODULE\d+_ASSET_ROOT)\s*=\s*['\"]\./([^'\"]+)['\"]", text):
            constants[name] = root
            roots.add(root)
        for name, file_name in re.findall(r"\$\{(MODULE\d+_ASSET_ROOT)\}/([^`\"']+)", text):
            root = constants.get(name)
            if root:
                required_files.add(f"{root}/{file_name}")
    return sorted(roots), sorted(required_files)


def audit(module_dir):
    module_dir = Path(module_dir).resolve()
    number = module_number(module_dir)
    issues = []
    required = ["index.html", "styles.css", "module.js", "module-data.js", "lesson.html", "README.md", "MIGRATION_REPORT.md", "ACCEPTANCE_CHECKLIST.md"]
    for name in required:
        if not (module_dir / name).exists():
            issues.append(f"missing required file: {name}")
    if not (module_dir / "assets" / "images").is_dir():
        issues.append("missing assets/images folder")
    if not (module_dir / "assignment").is_dir():
        issues.append("missing assignment folder")

    data = parse_object(module_dir / "module-data.js", "const MODULE_DATA")
    source = parse_object(SOURCE_DATA, "window.FORENSIC_STUDIES_OPTION2_DATA")
    source_quiz = next((item for item in source.get("quizzes", []) if item.get("id") == f"quiz-{number}" or item.get("chapterId") == f"chapter-{number}"), None)
    generated_key = "" if not data.get("quiz") else " ".join(item.get("answer", "") for item in data["quiz"].get("multipleChoice", []))
    source_key = "" if not source_quiz else " ".join(item.get("answer", "") for item in source_quiz.get("multipleChoice", []))
    if generated_key != source_key:
        issues.append(f"quiz answer key mismatch: source={source_key} generated={generated_key}")

    assignment_files = sorted(item.name for item in (module_dir / "assignment").iterdir() if item.is_file()) if (module_dir / "assignment").is_dir() else []
    expected_assignment = f"module{number}assignment.html"
    if expected_assignment not in assignment_files:
        issues.append(f"missing assignment html: {expected_assignment}")
    assignment_asset_roots, required_assignment_assets = assignment_asset_refs(module_dir / "assignment")
    assignment_asset_files = []
    for root in assignment_asset_roots:
        root_dir = module_dir / "assignment" / root
        if not root_dir.is_dir():
            issues.append(f"missing assignment asset folder: assignment/{root}")
            continue
        assignment_asset_files.extend(f"{root}/{path.relative_to(root_dir).as_posix()}" for path in root_dir.rglob("*") if path.is_file())
    assignment_asset_files = sorted(assignment_asset_files)
    for ref in required_assignment_assets:
        if not (module_dir / "assignment" / ref).is_file():
            issues.append(f"missing assignment asset: assignment/{ref}")

    for path in module_dir.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in RUNTIME_EXTS:
            continue
        text = read(path)
        for token in FORBIDDEN:
            if token in text:
                issues.append(f"forbidden token {token!r} in {path.relative_to(module_dir)}")
        for other in range(2, 9):
            if other != number and f"Module {other}" in text:
                issues.append(f"cross-module reference Module {other} in {path.relative_to(module_dir)}")
        if path.suffix.lower() == ".html":
            for attr, ref in re.findall(r"\b(src|href)=['\"]([^'\"]+)['\"]", text, flags=re.I):
                if not local_ref_exists(path, ref):
                    issues.append(f"missing local {attr}: {path.relative_to(module_dir)} -> {ref}")

    lesson_text = read(module_dir / "lesson.html") if (module_dir / "lesson.html").exists() else ""
    image_refs = sorted(set(ref for ref in re.findall(r"<img\b[^>]*\bsrc=['\"]([^'\"]+)['\"]", lesson_text, flags=re.I) if ref.startswith("assets/images/")))
    image_files = sorted((module_dir / "assets" / "images").glob("*")) if (module_dir / "assets" / "images").is_dir() else []
    if len(image_refs) != len(image_files):
        issues.append(f"image count mismatch: refs={len(image_refs)} files={len(image_files)}")

    summary = {
        "module": number,
        "title": data.get("chapter", {}).get("title", ""),
        "componentCount": data.get("chapter", {}).get("componentCount", 0),
        "imageCount": len(image_files),
        "quizId": None if not data.get("quiz") else data["quiz"].get("id"),
        "quizAnswerKey": generated_key or None,
        "assignmentFiles": assignment_files,
        "assignmentAssetFiles": assignment_asset_files,
        "issues": sorted(set(issues)),
    }
    print(json.dumps(summary, indent=2))
    return 1 if issues else 0


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("module_dir")
    args = parser.parse_args()
    raise SystemExit(audit(args.module_dir))


if __name__ == "__main__":
    main()
