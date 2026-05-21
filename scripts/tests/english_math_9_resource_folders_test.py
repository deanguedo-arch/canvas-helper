import json
import shutil
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


COURSES = {
    "english-9-resource-folder": {
        "counts": [2, 13, 5, 8, 3, 6, 5, 6, 4, 3, 2, 2, 8],
        "titles": [
            "All About Me Assignment",
            "Short Story 1",
            "Essay Writing",
            "Poetry",
            "Sentence and Paragraph Structure",
            "The Catcher in the Rye",
            "Film Studies",
            "Letter Writing 101",
            "Canadian Gothic (Play)",
            "A Christmas Carol",
            "Gothic Fiction and Scary Stories",
            "Of Mice and Men Novel Study",
            "Small Things Like These Novel Study",
        ],
        "hidden_indexes": [8, 9, 10, 11, 12],
        "resource_count": 67,
        "missing_count": 0,
        "unreferenced_count": 45,
        "expected_paths": [
            "01_All_About_Me_Assignment/01_Grade 9- All About Me.docx",
            "02_Short_Story_1/13_Tell-Tale_Heart by Edgar Allen Poe - Copy.pdf",
            "13_Small_Things_Like_These_Novel_Study_HIDDEN/08_Small Things Like These Final Project Rubrics.docx",
            "unreferenced-source-files/The Veldt - Ray Bradbury.pdf",
        ],
    },
    "mathematics-9-resource-folder": {
        "counts": [1, 18, 10, 6, 4, 5, 2, 1, 0, 0, 2],
        "titles": [
            "Textbook",
            "Unit 1 - Powers and Exponents",
            "Unit 2 - Rational Numbers",
            "Unit 3 - Polynomials",
            "Unit 4 - Linear Relations",
            "Unit 5 - Linear Equations and Inequalities",
            "Unit 6 - Square Numbers and Surface Area",
            "Unit 7: Similarity and Transformations",
            "Unit 8: Circle Geometry",
            "Unit 9: Probability and Statistics",
            "PAT Review",
        ],
        "hidden_indexes": [],
        "resource_count": 49,
        "missing_count": 0,
        "unreferenced_count": 36,
        "expected_paths": [
            "01_Textbook/01_9 Math Student Textbook.pdf",
            "02_Unit_1_-_Powers_and_Exponents/18_Math 9 - Unit 1 Practice Test KEY.pdf",
            "03_Unit_2_-_Rational_Numbers/08_Adding Fractions with Unlike Denominators.pdf",
            "11_PAT_Review/02_Grade 9 Part B Co-Taught Review Lesson 2022-2023 without vids.pptx",
            "unreferenced-source-files/Math 9 - Polynomials.pptx",
        ],
    },
}


class Grade9ResourceFoldersTest(unittest.TestCase):
    def test_resources_are_grouped_by_manifest_units(self):
        for slug, expected in COURSES.items():
            with self.subTest(slug=slug):
                project = ROOT / "projects" / slug
                export_root = project / "exports" / "resource-folder"
                if export_root.exists():
                    shutil.rmtree(export_root)

                result = subprocess.run(
                    ["python", str(project / "meta" / "build_resource_folder.py")],
                    cwd=ROOT,
                    text=True,
                    capture_output=True,
                )

                self.assertEqual(result.returncode, 0, result.stderr)
                audit = json.loads((project / "meta" / "resource-folder-audit.json").read_text(encoding="utf-8"))

                self.assertEqual([unit["title"] for unit in audit["units"]], expected["titles"])
                self.assertEqual([unit["resourceCount"] for unit in audit["units"]], expected["counts"])
                self.assertEqual(audit["resourceCount"], expected["resource_count"])
                self.assertEqual(audit["missingManifestResourceCount"], expected["missing_count"])
                self.assertEqual(audit["unreferencedResourceCount"], expected["unreferenced_count"])
                for index, unit in enumerate(audit["units"]):
                    self.assertEqual(unit["hidden"], index in expected["hidden_indexes"])

                for relative_path in expected["expected_paths"]:
                    self.assertTrue((export_root / relative_path).exists(), str(export_root / relative_path))

                self.assertTrue((project / "exports" / f"{slug}.zip").exists())


if __name__ == "__main__":
    unittest.main()
