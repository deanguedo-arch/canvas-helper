import json
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
PROJECT = ROOT / "projects" / "social-studies-9-resource-folder"
EXPORT_ROOT = PROJECT / "exports" / "resource-folder"


class SocialStudies9ResourceFolderTest(unittest.TestCase):
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

        self.assertEqual(audit["resourceCount"], 18)
        self.assertEqual(audit["unreferencedResourceCount"], 8)
        self.assertEqual(
            [unit["title"] for unit in audit["units"]],
            [
                "Unit 1 - The Charter of Rights and Freedoms",
                "Unit 2: Collective Rights",
                "Unit 3 - Economic Systems",
                "Unit 4: Government Structure",
            ],
        )
        self.assertTrue(audit["units"][3]["hidden"])
        self.assertEqual([unit["resourceCount"] for unit in audit["units"]], [4, 2, 9, 3])

        expected_files = [
            EXPORT_ROOT / "01_Unit_1_-_The_Charter_of_Rights_and_Freedoms" / "01_Social Studies 9 (11) - Copy (1).pptx",
            EXPORT_ROOT / "01_Unit_1_-_The_Charter_of_Rights_and_Freedoms" / "02_Social Studies 9 - Pre-Charter Assignment.docx",
            EXPORT_ROOT / "02_Unit_2_Collective_Rights" / "01_Social Studies 9 - Collective Rights.pptx",
            EXPORT_ROOT / "03_Unit_3_-_Economic_Systems" / "09_Social Studies 9  Unit 2 Study Guide.docx",
            EXPORT_ROOT / "04_Unit_4_Government_Structure_HIDDEN" / "03_Social Studies 9  Alberta Political Parties and the Economic Spectrum.docx",
            EXPORT_ROOT / "unreferenced-source-files" / "Social Studies 9 - Collective Rights Paragraphs 2024.docx",
        ]
        for path in expected_files:
            self.assertTrue(path.exists(), str(path))

        self.assertTrue((PROJECT / "exports" / "social-studies-9-resource-folder.zip").exists())


if __name__ == "__main__":
    unittest.main()
