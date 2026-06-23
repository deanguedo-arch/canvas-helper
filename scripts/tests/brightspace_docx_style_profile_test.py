from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


REPO_ROOT = Path(__file__).resolve().parents[2]
BUILDER_PATH = REPO_ROOT / "scripts" / "brightspace_zip_to_docx_upload_package.py"

spec = importlib.util.spec_from_file_location("brightspace_docx_builder", BUILDER_PATH)
builder = importlib.util.module_from_spec(spec)
assert spec and spec.loader
sys.modules[spec.name] = builder
spec.loader.exec_module(builder)


class BrightspaceDocxStyleProfileTests(unittest.TestCase):
    def exporter_for(self, course_key: str):
        exporter = builder.BrightspaceCourseDocxExporter.__new__(builder.BrightspaceCourseDocxExporter)
        exporter.config = builder.COURSES[course_key]
        exporter.css_cache = {}
        return exporter

    def test_learning_strategies_courses_use_next_step_docx_style_profile(self) -> None:
        for course_key in ("learning-strategies15", "learning-strategies25", "learning-strategies35"):
            with self.subTest(course=course_key):
                exporter = self.exporter_for(course_key)

                html = exporter.combined_html("Module 1", ["<section><div id='header'><h1>Lesson</h1></div></section>"])

                self.assertIn("background: #155608", html)
                self.assertIn("border-bottom: 4pt solid #59A844", html)
                self.assertIn("background: #FFF0CF", html)
                self.assertIn("color: #191C1C", html)
                self.assertNotIn("rgba", html.casefold())

    def test_other_courses_keep_source_native_docx_style_profile(self) -> None:
        exporter = self.exporter_for("social10")

        html = exporter.combined_html("Unit 1", ["<p>Body</p>"])

        self.assertIn("background: #6096bf", html)
        self.assertIn("color: #4b4665", html)
        self.assertNotIn("border-bottom: 4pt solid #59A844", html)

    def test_unknown_docx_style_profile_fails_fast(self) -> None:
        with self.assertRaisesRegex(ValueError, "Unknown DOCX style profile"):
            builder.docx_css_for_profile("missing-profile")

    def test_include_title_patterns_select_one_course_section_and_export_its_children(self) -> None:
        config = builder.CourseConfig(
            key="science10",
            project_slug="science-10-docx-export",
            course_title="Science 10",
            source_zip_name="science-10.zip",
            source_zip_env="SCIENCE10_SOURCE_ZIP",
            skip_title_patterns=("teacher",),
            include_title_patterns=("science 10:",),
        )
        exporter = builder.BrightspaceCourseDocxExporter.__new__(builder.BrightspaceCourseDocxExporter)
        exporter.config = config
        exporter.manifest_root = ET.fromstring(
            """
            <manifest>
              <organizations>
                <organization>
                  <item identifier="root">
                    <item identifier="science14">
                      <title>Science 14: Section SGOVL</title>
                      <item identifier="matter14"><title>Unit 1 - Matter</title></item>
                    </item>
                    <item identifier="science10">
                      <title>Science 10: Section SGOVL</title>
                      <item identifier="biology"><title>Biology</title></item>
                      <item identifier="chemistry"><title>Chemistry</title></item>
                    </item>
                    <item identifier="science104">
                      <title>Science 10-4: Section SGOVL</title>
                      <item identifier="matter104"><title>Unit 1: Properties of Matter</title></item>
                    </item>
                  </item>
                </organization>
              </organizations>
            </manifest>
            """
        )

        modules = exporter.top_modules()

        self.assertEqual([builder.item_title(item) for item in modules], ["Biology", "Chemistry"])

    def test_docx_external_image_relationships_are_detected(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            docx_path = Path(temp_dir) / "linked-image.docx"
            with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as docx:
                docx.writestr(
                    "word/_rels/document.xml.rels",
                    """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                      <Relationship Id="rId1"
                        Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
                        Target="file:///C:/temp/assets/image.png"
                        TargetMode="External"/>
                    </Relationships>""",
                )

            relationships = builder.docx_external_image_relationships(docx_path)

            self.assertEqual(
                relationships,
                [
                    {
                        "relationshipPart": "word/_rels/document.xml.rels",
                        "relationshipId": "rId1",
                        "target": "file:///C:/temp/assets/image.png",
                    }
                ],
            )

    def test_docx_external_image_relationships_are_embedded(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            image_path = temp_path / "image.png"
            image_path.write_bytes(
                b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR"
                b"\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00"
                b"\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\xff\xff?\x00\x05\xfe\x02\xfeA\xe2%\xb5"
                b"\x00\x00\x00\x00IEND\xaeB`\x82"
            )
            docx_path = temp_path / "linked-image.docx"
            with zipfile.ZipFile(docx_path, "w", zipfile.ZIP_DEFLATED) as docx:
                docx.writestr(
                    "word/_rels/document.xml.rels",
                    f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                      <Relationship Id="rId1"
                        Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
                        Target="{image_path.as_uri()}"
                        TargetMode="External"/>
                    </Relationships>""",
                )

            embedded = builder.embed_external_image_relationships(docx_path)

            self.assertEqual(len(embedded), 1)
            self.assertEqual(builder.docx_external_image_relationships(docx_path), [])
            with zipfile.ZipFile(docx_path) as docx:
                self.assertIn("word/media/embedded-external-rId1.png", docx.namelist())
                rels = docx.read("word/_rels/document.xml.rels").decode("utf-8")
            self.assertIn('Target="media/embedded-external-rId1.png"', rels)
            self.assertNotIn("TargetMode", rels)


if __name__ == "__main__":
    unittest.main()
