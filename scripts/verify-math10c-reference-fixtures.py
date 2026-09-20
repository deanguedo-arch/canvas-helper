#!/usr/bin/env python3
"""Validate the Math 10C reference fixture pack (narrow schema only).

Boundary: this verifier validates this narrow fixture schema only. It does
not certify arbitrary learner algebra, notation, reasoning, or curriculum
alignment. It proves that each declared factoring reconstructs its source
polynomial, that each supported quadratic prime claim has a correct
discriminant argument, and that each trig expected value matches an
independent recomputation within its stated tolerance.
"""

import argparse
import json
import math
import sys
from pathlib import Path

BOUNDARY_STATEMENT = (
    "Boundary: this verifier validates this narrow fixture schema only "
    "(this pack's factoring and right-triangle trig cases). It does not "
    "certify arbitrary learner algebra, notation, reasoning, or curriculum "
    "alignment."
)

FACTORING_CATEGORIES = {
    "gcf",
    "difference-of-squares",
    "monic-trinomial",
    "non-monic-trinomial",
    "perfect-square-trinomial",
    "multi-step",
    "prime-over-integers",
    "repeated-factor",
}

REQUIRED_FACTORING_CATEGORIES = {
    "gcf",
    "difference-of-squares",
    "monic-trinomial",
    "non-monic-trinomial",
    "perfect-square-trinomial",
    "multi-step",
    "prime-over-integers",
    "repeated-factor",
}

TRIG_CATEGORIES = {"missing-side", "missing-angle"}
TRIG_RATIOS = {"sine", "cosine", "tangent"}
TRIG_SOLVE_FIELDS = {"opposite", "adjacent", "hypotenuse", "angle_deg"}

MIN_FACTORING_CASES = 12
MIN_TRIG_CASES = 6
MAX_ABS_COEFFICIENT = 10000
MAX_ABS_CONTENT = 1000
MAX_POLY_DEGREE = 6
MAX_ABS_TOLERANCE = 1.0
RECOMPUTE_SLACK = 1e-9


def _is_int(value):
    return isinstance(value, int) and not isinstance(value, bool)


def _is_num(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def poly_mul(a, b):
    """Multiply two polynomials in descending-degree coefficient lists."""
    result = [0] * (len(a) + len(b) - 1)
    for i, ca in enumerate(a):
        for j, cb in enumerate(b):
            result[i + j] += ca * cb
    return result


def is_perfect_square(n):
    if n < 0:
        return False
    root = math.isqrt(n)
    return root * root == n


def load_pack(path):
    raw = Path(path).read_bytes()
    text = raw.decode("utf-8")
    if not text.endswith("\n"):
        raise ValueError(f"{path}: file must end in a newline")
    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError(f"{path}: top level must be a JSON object")
    if not isinstance(data.get("cases"), list):
        raise ValueError(f"{path}: top level must contain a 'cases' list")
    return data


def validate_factoring_case(case):
    errors = []
    cid = case.get("id", "<missing-id>")

    for field in (
        "id",
        "category",
        "prompt",
        "variable",
        "polynomial",
        "expected",
        "equivalent_forms",
        "misconception",
        "derivation",
        "domain",
    ):
        if field not in case:
            errors.append(f"{cid}: missing required field '{field}'")
    if errors:
        return errors

    if not isinstance(case["id"], str) or not case["id"]:
        errors.append(f"{cid}: id must be a non-empty string")
    if case["category"] not in FACTORING_CATEGORIES:
        errors.append(f"{cid}: unknown category '{case['category']}'")
    for field in ("prompt", "misconception", "derivation"):
        if not isinstance(case[field], str) or not case[field].strip():
            errors.append(f"{cid}: '{field}' must be a non-empty string")
    if case["variable"] != "x":
        errors.append(f"{cid}: variable must be 'x'")
    if not isinstance(case["equivalent_forms"], list) or not case["equivalent_forms"]:
        errors.append(f"{cid}: equivalent_forms must be a non-empty list")
    domain = case["domain"]
    if (
        not isinstance(domain, dict)
        or domain.get("coefficients") != "integers"
        or domain.get("factor_over") != "integers"
    ):
        errors.append(f"{cid}: domain must declare integer coefficients factored over integers")

    poly = case["polynomial"]
    if (
        not isinstance(poly, list)
        or len(poly) < 2
        or not all(_is_int(c) for c in poly)
        or poly[0] == 0
    ):
        errors.append(f"{cid}: polynomial must be an integer array (descending degree) with nonzero leading term")
        return errors
    if len(poly) - 1 > MAX_POLY_DEGREE:
        errors.append(f"{cid}: polynomial degree exceeds bound {MAX_POLY_DEGREE}")
    if any(abs(c) > MAX_ABS_COEFFICIENT for c in poly):
        errors.append(f"{cid}: polynomial coefficient exceeds bound {MAX_ABS_COEFFICIENT}")
    if any(isinstance(c, bool) for c in poly):
        errors.append(f"{cid}: polynomial coefficients must be integers")

    expected = case["expected"]
    if not isinstance(expected, dict):
        errors.append(f"{cid}: expected must be an object")
        return errors

    if expected.get("prime_over_integers") is True:
        if "factors" in expected and expected["factors"]:
            errors.append(f"{cid}: prime case must not declare factors")
        argument = expected.get("prime_argument")
        if not isinstance(argument, dict):
            errors.append(f"{cid}: prime case must declare a prime_argument object")
            return errors
        if argument.get("kind") != "quadratic-discriminant":
            errors.append(
                f"{cid}: unsupported prime claim kind '{argument.get('kind')}' "
                "(only 'quadratic-discriminant' is supported)"
            )
            return errors
        if len(poly) != 3:
            errors.append(
                f"{cid}: unsupported prime claim: quadratic-discriminant argument "
                "requires a degree-2 polynomial"
            )
            return errors
        coefficient_gcd = math.gcd(*(abs(coefficient) for coefficient in poly))
        if coefficient_gcd != 1:
            errors.append(
                f"{cid}: prime-over-integers claim requires a primitive polynomial "
                f"(coefficient gcd is {coefficient_gcd})"
            )
            return errors
        a, b, c = poly
        discriminant = b * b - 4 * a * c
        if argument.get("discriminant") != discriminant:
            errors.append(
                f"{cid}: declared discriminant {argument.get('discriminant')} does not "
                f"match recomputed discriminant {discriminant}"
            )
            return errors
        if discriminant >= 0 and is_perfect_square(discriminant):
            errors.append(
                f"{cid}: discriminant {discriminant} is a perfect square, so the "
                "quadratic is not prime over the integers"
            )
        return errors

    factors = expected.get("factors")
    if not isinstance(factors, list) or not factors:
        errors.append(f"{cid}: expected must declare a non-empty factors list or a prime claim")
        return errors
    content = expected.get("content", 1)
    if not _is_int(content) or content == 0:
        errors.append(f"{cid}: content must be a nonzero integer")
        return errors
    if abs(content) > MAX_ABS_CONTENT:
        errors.append(f"{cid}: content {content} exceeds bound {MAX_ABS_CONTENT}")
    for factor in factors:
        if (
            not isinstance(factor, list)
            or len(factor) < 2
            or not all(_is_int(c) for c in factor)
            or factor[0] == 0
        ):
            errors.append(f"{cid}: each factor must be an integer array of degree >= 1 with nonzero leading term")
            return errors
        if any(abs(c) > MAX_ABS_COEFFICIENT for c in factor):
            errors.append(f"{cid}: factor coefficient exceeds bound {MAX_ABS_COEFFICIENT}")

    product = [content]
    for factor in factors:
        product = poly_mul(product, factor)
    if product != poly:
        errors.append(
            f"{cid}: declared factors do not reconstruct the source polynomial "
            f"(recomputed {product}, expected {poly})"
        )
    return errors


def recompute_trig(case):
    """Independently recompute the expected trig value. Returns (value, error)."""
    cid = case.get("id", "<missing-id>")
    known = case["known"]
    ratio = case["ratio"]
    solve_for = case["solve_for"]

    def angle_rad():
        return math.radians(known["angle_deg"])

    if solve_for == "opposite":
        if ratio == "sine" and "hypotenuse" in known and "angle_deg" in known:
            return known["hypotenuse"] * math.sin(angle_rad()), None
        if ratio == "tangent" and "adjacent" in known and "angle_deg" in known:
            return known["adjacent"] * math.tan(angle_rad()), None
    elif solve_for == "adjacent":
        if ratio == "cosine" and "hypotenuse" in known and "angle_deg" in known:
            return known["hypotenuse"] * math.cos(angle_rad()), None
        if ratio == "tangent" and "opposite" in known and "angle_deg" in known:
            return known["opposite"] / math.tan(angle_rad()), None
    elif solve_for == "hypotenuse":
        if ratio == "sine" and "opposite" in known and "angle_deg" in known:
            return known["opposite"] / math.sin(angle_rad()), None
        if ratio == "cosine" and "adjacent" in known and "angle_deg" in known:
            return known["adjacent"] / math.cos(angle_rad()), None
    elif solve_for == "angle_deg":
        if ratio == "sine" and "opposite" in known and "hypotenuse" in known:
            return math.degrees(math.asin(known["opposite"] / known["hypotenuse"])), None
        if ratio == "cosine" and "adjacent" in known and "hypotenuse" in known:
            return math.degrees(math.acos(known["adjacent"] / known["hypotenuse"])), None
        if ratio == "tangent" and "opposite" in known and "adjacent" in known:
            return math.degrees(math.atan(known["opposite"] / known["adjacent"])), None
    return None, (
        f"{cid}: unsupported ratio/solve_for/known combination "
        f"(ratio={ratio}, solve_for={solve_for}, known={sorted(known)})"
    )


def validate_trig_case(case):
    errors = []
    cid = case.get("id", "<missing-id>")

    for field in (
        "id",
        "category",
        "ratio",
        "prompt",
        "known",
        "solve_for",
        "expected",
        "abs_tolerance",
        "units",
        "rounding",
        "equivalent_forms",
        "misconception",
        "derivation",
        "domain",
    ):
        if field not in case:
            errors.append(f"{cid}: missing required field '{field}'")
    if errors:
        return errors

    if not isinstance(case["id"], str) or not case["id"]:
        errors.append(f"{cid}: id must be a non-empty string")
    if case["category"] not in TRIG_CATEGORIES:
        errors.append(f"{cid}: unknown category '{case['category']}'")
    if case["ratio"] not in TRIG_RATIOS:
        errors.append(f"{cid}: unknown ratio '{case['ratio']}'")
    if case["solve_for"] not in TRIG_SOLVE_FIELDS:
        errors.append(f"{cid}: unknown solve_for '{case['solve_for']}'")
    for field in ("prompt", "units", "rounding", "misconception", "derivation"):
        if not isinstance(case[field], str) or not case[field].strip():
            errors.append(f"{cid}: '{field}' must be a non-empty string")
    if not isinstance(case["equivalent_forms"], list) or not case["equivalent_forms"]:
        errors.append(f"{cid}: equivalent_forms must be a non-empty list")

    known = case["known"]
    if not isinstance(known, dict) or not known:
        errors.append(f"{cid}: known must be a non-empty object of numeric inputs")
        return errors
    for key, value in known.items():
        if key not in TRIG_SOLVE_FIELDS or key == case["solve_for"]:
            errors.append(f"{cid}: unexpected known field '{key}'")
        if not _is_num(value) or not math.isfinite(value):
            errors.append(f"{cid}: known field '{key}' must be a finite number")

    expected = case["expected"]
    tolerance = case["abs_tolerance"]
    if not _is_num(expected) or not math.isfinite(expected):
        errors.append(f"{cid}: expected must be a finite number")
    if not _is_num(tolerance) or not math.isfinite(tolerance) or tolerance <= 0:
        errors.append(f"{cid}: abs_tolerance must be a positive finite number")
    elif tolerance > MAX_ABS_TOLERANCE:
        errors.append(f"{cid}: abs_tolerance {tolerance} exceeds bound {MAX_ABS_TOLERANCE}")

    domain = case["domain"]
    if (
        not isinstance(domain, dict)
        or domain.get("triangle") != "right"
        or domain.get("angle_unit") != "degrees"
        or domain.get("positive_side_lengths") is not True
        or domain.get("nonzero_denominators") is not True
        or domain.get("acute_target_angle") is not True
    ):
        errors.append(
            f"{cid}: domain must declare right triangle, degrees, acute_target_angle, "
            "positive side lengths, and nonzero denominators"
        )

    if errors:
        return errors

    for side in ("opposite", "adjacent", "hypotenuse"):
        if side in known and known[side] <= 0:
            errors.append(f"{cid}: side length '{side}' must be positive")
    if "angle_deg" in known and not 0 < known["angle_deg"] < 90:
        errors.append(f"{cid}: given angle_deg must be acute (0, 90)")
    if "hypotenuse" in known:
        for leg in ("opposite", "adjacent"):
            if leg in known and known[leg] >= known["hypotenuse"]:
                errors.append(
                    f"{cid}: known hypotenuse must be longer than known {leg}"
                )
    if errors:
        return errors

    try:
        recomputed, combo_error = recompute_trig(case)
    except (ValueError, ZeroDivisionError, OverflowError) as exc:
        errors.append(f"{cid}: trig recomputation failed: {exc}")
        return errors
    if combo_error:
        errors.append(combo_error)
        return errors
    if not math.isfinite(recomputed):
        errors.append(f"{cid}: recomputation produced a non-finite value")
        return errors
    if case["solve_for"] == "angle_deg" and not 0 < recomputed < 90:
        errors.append(f"{cid}: recomputed angle {recomputed} is not acute")
    if abs(recomputed - expected) > tolerance + RECOMPUTE_SLACK:
        errors.append(
            f"{cid}: expected {expected} differs from recomputed {recomputed} "
            f"by more than tolerance {tolerance}"
        )
    return errors


def check_unique_ids(factoring_cases, trig_cases):
    errors = []
    seen = {}
    for pack_name, cases in (("factoring", factoring_cases), ("trig", trig_cases)):
        for case in cases:
            cid = case.get("id")
            if not isinstance(cid, str):
                errors.append(f"<missing-id>: every fixture must have a string ID")
                continue
            if cid in seen:
                errors.append(f"{cid}: duplicate ID (also in {seen[cid]})")
            else:
                seen[cid] = pack_name
    return errors


def validate_packs(factoring_path, trig_path):
    errors = []
    try:
        factoring = load_pack(factoring_path)
    except (ValueError, json.JSONDecodeError, OSError) as exc:
        return [f"factoring pack: {exc}"], [], []
    try:
        trig = load_pack(trig_path)
    except (ValueError, json.JSONDecodeError, OSError) as exc:
        return [f"trig pack: {exc}"], [], []

    factoring_cases = factoring["cases"]
    trig_cases = trig["cases"]
    if not isinstance(factoring_cases, list) or any(
        not isinstance(c, dict) for c in factoring_cases
    ):
        errors.append("factoring pack: every case must be an object")
        return errors, [], []
    if not isinstance(trig_cases, list) or any(
        not isinstance(c, dict) for c in trig_cases
    ):
        errors.append("trig pack: every case must be an object")
        return errors, [], []
    if len(factoring_cases) < MIN_FACTORING_CASES:
        errors.append(
            f"factoring pack: only {len(factoring_cases)} cases, "
            f"minimum is {MIN_FACTORING_CASES}"
        )
    if len(trig_cases) < MIN_TRIG_CASES:
        errors.append(
            f"trig pack: only {len(trig_cases)} cases, minimum is {MIN_TRIG_CASES}"
        )

    errors.extend(check_unique_ids(factoring_cases, trig_cases))

    for case in factoring_cases:
        errors.extend(validate_factoring_case(case))
    found_categories = {
        c.get("category") for c in factoring_cases if isinstance(c, dict)
    }
    missing = REQUIRED_FACTORING_CATEGORIES - found_categories
    if missing:
        errors.append(
            f"factoring pack: missing required categories {sorted(missing)}"
        )

    for case in trig_cases:
        errors.extend(validate_trig_case(case))
    trig_ratios = {c.get("ratio") for c in trig_cases if isinstance(c, dict)}
    if TRIG_RATIOS - trig_ratios:
        errors.append(
            f"trig pack: missing ratios {sorted(TRIG_RATIOS - trig_ratios)} "
            "(sine, cosine, and tangent coverage is required)"
        )
    trig_cats = {c.get("category") for c in trig_cases if isinstance(c, dict)}
    if TRIG_CATEGORIES - trig_cats:
        errors.append(
            f"trig pack: missing categories {sorted(TRIG_CATEGORIES - trig_cats)}"
        )

    return errors, factoring_cases, trig_cases


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--factoring", required=True, help="Path to FACTORIZATION_CASES.json")
    parser.add_argument("--trig", required=True, help="Path to TRIG_CASES.json")
    args = parser.parse_args(argv)

    errors, factoring_cases, trig_cases = validate_packs(args.factoring, args.trig)
    if errors:
        print("FAIL: math10c reference fixtures invalid")
        for error in errors:
            print(f"  - {error}")
        print(BOUNDARY_STATEMENT)
        return 1
    print(
        f"PASS: {len(factoring_cases)} factoring cases and {len(trig_cases)} "
        "trig cases verified "
        "(reconstruction, discriminant arguments, and trig recomputation all hold)."
    )
    print(BOUNDARY_STATEMENT)
    return 0


if __name__ == "__main__":
    sys.exit(main())
