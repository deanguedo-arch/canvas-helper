from __future__ import annotations

import importlib.util
import sys
import unittest
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

    def test_learning_strategies_15_uses_next_step_docx_style_profile(self) -> None:
        exporter = self.exporter_for("learning-strategies15")

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


if __name__ == "__main__":
    unittest.main()
