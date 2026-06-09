#!/usr/bin/env python3
import argparse
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
PACKAGES = ROOT / "packages"


def package_module(module_dir):
    module_dir = Path(module_dir).resolve()
    PACKAGES.mkdir(parents=True, exist_ok=True)
    zip_path = PACKAGES / f"{module_dir.name}.zip"
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for file_path in sorted(module_dir.rglob("*")):
            if not file_path.is_file():
                continue
            arcname = f"{module_dir.name}/{file_path.relative_to(module_dir).as_posix()}"
            if "\\" in arcname:
                raise RuntimeError(f"Backslash in zip path: {arcname}")
            archive.write(file_path, arcname)
    print(zip_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--module", type=int, action="append")
    args = parser.parse_args()
    modules = [DIST / f"module-{number}-static" for number in args.module] if args.module else sorted(DIST.glob("module-*-static"))
    for module_dir in modules:
        if module_dir.is_dir():
            package_module(module_dir)


if __name__ == "__main__":
    main()
