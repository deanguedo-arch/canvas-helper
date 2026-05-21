from __future__ import annotations

import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from scripts.lib.grade9_resource_folder_builder import build_resource_folder


SLUG = "mathematics-9-resource-folder"
PROJECT = ROOT / "projects" / SLUG
SOURCE_ZIP = Path(
    os.environ.get("MATHEMATICS_9_SOURCE_ZIP")
    or r"c:\Users\dean.guedo\Downloads\D2LExport_151046_25-26 _ Mathematics 9 _ Per 1(A) _ Sec 1_202652157.zip"
)


if __name__ == "__main__":
    result = build_resource_folder(PROJECT, SLUG, "Mathematics 9", SOURCE_ZIP)
    print(
        f"Built {result['resourceCount']} manifest resources into {len(result['units'])} unit folders; "
        f"preserved {result['unreferencedResourceCount']} unreferenced source files."
    )
