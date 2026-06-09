import json
import shutil
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MODULE_DIR = ROOT / "dist" / "module-2-static"
EXPECTED_KEY = "A A C A A A A C C A A D C C A A D A D A C B C B B A C"

class ModuleGeneratorContract(unittest.TestCase):
    def test_module_2_generation_and_audit_contract(self):
        if MODULE_DIR.exists():
            shutil.rmtree(MODULE_DIR)
        subprocess.run([sys.executable, str(ROOT / "tools" / "generate-module.py"), "--module", "2"], cwd=ROOT, check=True)
        audit = subprocess.run([sys.executable, str(ROOT / "tools" / "audit-module.py"), str(MODULE_DIR)], cwd=ROOT, text=True, capture_output=True, check=True)
        summary = json.loads(audit.stdout)
        self.assertEqual(summary["module"], 2)
        self.assertEqual(summary["quizAnswerKey"], EXPECTED_KEY)
        self.assertEqual(summary["assignmentFiles"], [
            "forensic-assignment-print.js",
            "forensic-assignment-theme.css",
            "module2assignment-app.jsx",
            "module2assignment-entry.jsx",
            "module2assignment.bundle.js",
            "module2assignment.html",
        ])
        self.assertIn("assignmentAssetFiles", summary)
        self.assertEqual(summary["assignmentAssetFiles"], [
            "module2/Loop.png",
            "module2/PlainArch.png",
            "module2/Whorl.png",
            "module2/suspect-atkins.svg",
            "module2/suspect-banes.svg",
            "module2/suspect-chapman.svg",
            "module2/suspect-lyons.svg",
        ])
        self.assertGreater(summary["imageCount"], 0)
        self.assertEqual(summary["issues"], [])

    def test_all_supported_modules_generate_and_audit_clean(self):
        for module in range(2, 9):
            with self.subTest(module=module):
                module_dir = ROOT / "dist" / f"module-{module}-static"
                if module_dir.exists():
                    shutil.rmtree(module_dir)
                subprocess.run([sys.executable, str(ROOT / "tools" / "generate-module.py"), "--module", str(module)], cwd=ROOT, check=True)
                audit = subprocess.run([sys.executable, str(ROOT / "tools" / "audit-module.py"), str(module_dir)], cwd=ROOT, text=True, capture_output=True)
                summary = json.loads(audit.stdout)
                self.assertEqual(audit.returncode, 0, summary)
                self.assertEqual(summary["issues"], [])

if __name__ == "__main__":
    unittest.main()

