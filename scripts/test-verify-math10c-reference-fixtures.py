#!/usr/bin/env python3
"""Tests for the Math 10C reference-fixture verifier.

Uses temporary copies of the canonical fixtures; the canonical files are
never mutated.
"""

import copy
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPTS_DIR.parent
FACTORING_CANONICAL = (
    REPO_ROOT / "tasks" / "math10c-reference-fixtures" / "FACTORIZATION_CASES.json"
)
TRIG_CANONICAL = (
    REPO_ROOT / "tasks" / "math10c-reference-fixtures" / "TRIG_CASES.json"
)


def load_verifier():
    spec = importlib.util.spec_from_file_location(
        "verify_math10c_reference_fixtures",
        SCRIPTS_DIR / "verify-math10c-reference-fixtures.py",
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


VERIFIER = load_verifier()


def write_copy(directory, name, data):
    path = Path(directory) / name
    path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    return str(path)


class VerifierTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.factoring = json.loads(FACTORING_CANONICAL.read_text(encoding="utf-8"))
        self.trig = json.loads(TRIG_CANONICAL.read_text(encoding="utf-8"))

    def tearDown(self):
        self.tmp.cleanup()

    def run_packs(self, factoring=None, trig=None):
        factoring = self.factoring if factoring is None else factoring
        trig = self.trig if trig is None else trig
        factoring_path = write_copy(self.tmp.name, "factoring.json", factoring)
        trig_path = write_copy(self.tmp.name, "trig.json", trig)
        return VERIFIER.validate_packs(factoring_path, trig_path)[0]

    def test_valid_fixtures_pass(self):
        self.assertEqual(self.run_packs(), [])

    def test_corrupted_factorization_fails(self):
        broken = copy.deepcopy(self.factoring)
        broken["cases"][0]["expected"]["factors"][1][1] += 1
        errors = self.run_packs(factoring=broken)
        case_id = broken["cases"][0]["id"]
        self.assertTrue(
            any(case_id in e and "reconstruct" in e for e in errors),
            f"expected reconstruction failure for {case_id}, got: {errors}",
        )

    def test_duplicate_id_fails(self):
        broken = copy.deepcopy(self.factoring)
        duplicate = copy.deepcopy(broken["cases"][0])
        broken["cases"].append(duplicate)
        errors = self.run_packs(factoring=broken)
        self.assertTrue(
            any(duplicate["id"] in e and "duplicate" in e for e in errors),
            f"expected duplicate-ID failure, got: {errors}",
        )

    def test_bad_trig_expected_value_fails(self):
        broken = copy.deepcopy(self.trig)
        broken["cases"][0]["expected"] += 5.0
        errors = self.run_packs(trig=broken)
        case_id = broken["cases"][0]["id"]
        self.assertTrue(
            any(case_id in e and "tolerance" in e for e in errors),
            f"expected tolerance failure for {case_id}, got: {errors}",
        )

    def test_malformed_schema_fails(self):
        broken = copy.deepcopy(self.factoring)
        del broken["cases"][1]["polynomial"]
        errors = self.run_packs(factoring=broken)
        case_id = broken["cases"][1]["id"]
        self.assertTrue(
            any(case_id in e and "polynomial" in e for e in errors),
            f"expected schema failure for {case_id}, got: {errors}",
        )

    def test_non_list_cases_fails_cleanly(self):
        broken = copy.deepcopy(self.factoring)
        broken["cases"] = 42
        errors = self.run_packs(factoring=broken)
        self.assertTrue(
            any("cases" in error and "list" in error for error in errors),
            f"expected top-level cases-list failure, got: {errors}",
        )

    def test_impossible_hypotenuse_relationship_fails(self):
        broken = copy.deepcopy(self.trig)
        case = next(c for c in broken["cases"] if c["solve_for"] == "angle_deg")
        case["known"]["opposite"] = case["known"]["hypotenuse"] + 1
        errors = self.run_packs(trig=broken)
        self.assertTrue(
            any(case["id"] in error and "hypotenuse" in error for error in errors),
            f"expected impossible-triangle failure, got: {errors}",
        )

    def test_nonprimitive_prime_claim_fails(self):
        broken = copy.deepcopy(self.factoring)
        case = next(
            c for c in broken["cases"] if c["expected"].get("prime_over_integers")
        )
        case["polynomial"] = [2, 2, 2]
        case["expected"]["prime_argument"]["discriminant"] = -12
        errors = self.run_packs(factoring=broken)
        self.assertTrue(
            any(case["id"] in error and "primitive" in error for error in errors),
            f"expected nonprimitive-prime failure, got: {errors}",
        )

    def test_unsupported_prime_claim_fails(self):
        broken = copy.deepcopy(self.factoring)
        prime_case = next(
            c for c in broken["cases"] if c["expected"].get("prime_over_integers")
        )
        prime_case["expected"]["prime_argument"] = {
            "kind": "rational-root-theorem-sweep",
            "discriminant": -3,
        }
        errors = self.run_packs(factoring=broken)
        self.assertTrue(
            any(
                prime_case["id"] in e and "unsupported prime claim" in e
                for e in errors
            ),
            f"expected unsupported-prime-claim failure, got: {errors}",
        )


if __name__ == "__main__":
    result = unittest.main(
        argv=[sys.argv[0], "-v"], exit=False
    ).result
    sys.exit(0 if result.wasSuccessful() else 1)
