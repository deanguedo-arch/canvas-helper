import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location("bio_resources", Path(__file__).parents[1] / "prepare-biology30-course-resources.py")
prep = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prep)


class ResourcePreparationTests(unittest.TestCase):
    def test_unsafe_archives_fail_before_extraction(self):
        for name in ["../escape", "/absolute", "a\\escape"]:
            data = io.BytesIO()
            with zipfile.ZipFile(data, "w") as z:
                z.writestr(name, b"untouched")
            with self.assertRaisesRegex(ValueError, "Unsafe"):
                prep.safe_zip(data.getvalue())

    def test_duplicate_and_symlink_archive_entries_fail(self):
        for symlink in [False, True]:
            data = io.BytesIO()
            with zipfile.ZipFile(data, "w") as z:
                if symlink:
                    info = zipfile.ZipInfo("link")
                    info.create_system = 3
                    info.external_attr = 0o120777 << 16
                    z.writestr(info, b"../outside")
                else:
                    z.writestr("same", b"first")
                    z.writestr("same", b"second")
            with self.assertRaises(ValueError):
                prep.safe_zip(data.getvalue())

    def test_failed_stage_leaves_prior_files_and_no_candidate(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            original = root / "original"
            original.write_text("retained")
            def fail(stage):
                (stage / "half-done").write_text("not ready")
                raise RuntimeError("injected failure")
            with self.assertRaisesRegex(RuntimeError, "injected failure"):
                prep.publish_packet(root / "candidate", fail)
            self.assertEqual(list(root.iterdir()), [original])
            self.assertEqual(original.read_text(), "retained")

    def test_idempotence_and_tamper_refusal(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / "packet"
            self.assertTrue(prep.publish_packet(target, lambda p: (p / "record").write_text("source")))
            before = prep.tree_inventory(target)
            self.assertFalse(prep.publish_packet(target, lambda p: self.fail("must not rewrite")))
            self.assertEqual(prep.tree_inventory(target), before)
            (target / "record").write_text("changed")
            with self.assertRaisesRegex(ValueError, "Immutable packet changed"):
                prep.publish_packet(target, lambda p: None)

    def test_source_drift_and_symlinks_are_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            source = Path(tmp) / "source"
            source.write_bytes(b"original")
            sha = prep.digest(source.read_bytes())
            source.write_bytes(b"edited")
            with self.assertRaisesRegex(ValueError, "Source drift"):
                prep.checked_bytes(source, sha)
            link = Path(tmp) / "link"
            link.symlink_to(source)
            with self.assertRaisesRegex(ValueError, "Symlink"):
                prep.tree_inventory(Path(tmp))

    def test_video_parsing_does_not_confuse_external_hosts(self):
        self.assertEqual(prep.youtube_id("https://youtu.be/abcdefghijk?t=6"), "abcdefghijk")
        self.assertEqual(prep.youtube_id("https://www.youtube.com/watch?v=abcdefghijk&list=one"), "abcdefghijk")
        self.assertIsNone(prep.youtube_id("https://youtube.com.example.org/watch?v=abcdefghijk"))

    def test_relationship_inventory_includes_speaker_notes(self):
        data = io.BytesIO()
        with zipfile.ZipFile(data, "w") as z:
            z.writestr("ppt/notesSlides/_rels/notesSlide37.xml.rels", '<Relationships><Relationship Id="rId2" TargetMode="External" Target="https://example.org/sampling" /></Relationships>')
        with prep.safe_zip(data.getvalue()) as z:
            rows = prep.package_relationships(z)
        self.assertEqual(len(rows), 1)
        self.assertIn("notesSlide37", rows[0]["part"])
        self.assertEqual(rows[0]["Target"], "https://example.org/sampling")


if __name__ == "__main__":
    unittest.main()
