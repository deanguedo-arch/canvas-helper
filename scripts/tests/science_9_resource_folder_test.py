import json
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PROJECT = ROOT / "projects" / "science-9-resource-folder"
EXPORT_ROOT = PROJECT / "exports" / "resource-folder"


class Science9ResourceFolderTest(unittest.TestCase):
    def test_resources_are_grouped_by_manifest_units(self):
        if EXPORT_ROOT.exists():
            shutil.rmtree(EXPORT_ROOT)

        result = subprocess.run(
            ["python", str(PROJECT / "meta" / "build_resource_folder.py")],
            cwd=ROOT,
            text=True,
            capture_output=True,
        )

        self.assertEqual(result.returncode, 0, result.stderr)

        audit_path = PROJECT / "meta" / "resource-folder-audit.json"
        self.assertTrue(audit_path.exists())
        audit = json.loads(audit_path.read_text(encoding="utf-8"))

        self.assertEqual(audit["resourceCount"], 44)
        self.assertEqual(audit["unreferencedResourceCount"], 75)
        self.assertEqual(
            [unit["title"] for unit in audit["units"]],
            [
                "Unit A | Biological Diversity",
                "Unit E | Space Exploration",
                "Unit B | Matter and Chemical Change",
                "Unit D | Electrical Principles and Technologies",
                "Unit C | Environmental Chemistry",
            ],
        )
        self.assertEqual([unit["resourceCount"] for unit in audit["units"]], [13, 15, 10, 6, 0])
        self.assertFalse(audit["units"][0]["hidden"])
        self.assertTrue(audit["units"][3]["hidden"])
        self.assertTrue(audit["units"][4]["hidden"])

        expected_files = [
            EXPORT_ROOT / "01_Unit_A_Biological_Diversity" / "01_science-in-action-9-1-192.pdf",
            EXPORT_ROOT / "01_Unit_A_Biological_Diversity" / "13_Science 9 - Biological Diversity Unit Review - Copy (1).docx",
            EXPORT_ROOT / "02_Unit_E_Space_Exploration" / "15_Science 9 - Section 4 Ethics and Space Paragraphs.docx",
            EXPORT_ROOT / "03_Unit_B_Matter_and_Chemical_Change" / "10_Science 9 - Chemistry - Unit Review.docx",
            EXPORT_ROOT / "04_Unit_D_Electrical_Principles_and_Technologies_HIDDEN" / "06_Science 9 - Elecrticity Bio Assignment.docx",
            EXPORT_ROOT / "05_Unit_C_Environmental_Chemistry_HIDDEN",
            EXPORT_ROOT / "unreferenced-source-files" / "Content" / "spacesuit.pdf",
            EXPORT_ROOT / "unreferenced-source-files" / "Science 9 Unit 1 - Copy (11).pptx",
        ]
        for path in expected_files:
            self.assertTrue(path.exists(), str(path))

        self.assertTrue((PROJECT / "exports" / "science-9-resource-folder.zip").exists())


if __name__ == "__main__":
    unittest.main()
