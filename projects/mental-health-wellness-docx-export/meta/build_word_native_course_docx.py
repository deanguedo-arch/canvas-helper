from __future__ import annotations

import runpy
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
SHARED_SCRIPT = REPO_ROOT / "scripts" / "brightspace_zip_to_docx_upload_package.py"

sys.argv = [str(SHARED_SCRIPT), "--course", "mental-health-wellness"]
runpy.run_path(str(SHARED_SCRIPT), run_name="__main__")
