from __future__ import annotations

import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT))

from scripts.lib.grade9_resource_folder_builder import build_resource_folder


SLUG = "social-studies-8-resource-folder"
PROJECT = ROOT / "projects" / SLUG
SOURCE_ZIP = Path(
    os.environ.get("SOCIAL_STUDIES_8_SOURCE_ZIP")
    or "/Users/deanguedo/Downloads/D2LExport_151051_25-26 _ Social Studies 8 _ Per 1(A) _ Sec 1_202652229.zip"
)


if __name__ == "__main__":
    result = build_resource_folder(PROJECT, SLUG, "Social Studies 8", SOURCE_ZIP)
    print(
        f"Built {result['resourceCount']} manifest resources into {len(result['units'])} unit folders; "
        f"preserved {result['unreferencedResourceCount']} unreferenced source files."
    )
