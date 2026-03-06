import test from "node:test";
import assert from "node:assert/strict";

import { getReferenceResourceRenderMode } from "../../app/studio/src/reference-resource-preview";

test("renders raw pdf resources with the dedicated pdf viewer", () => {
  assert.equal(getReferenceResourceRenderMode("projects/resources/sample-project/sample.pdf", "raw"), "inline-pdf");
});

test("renders extracted resources in the inline frame", () => {
  assert.equal(
    getReferenceResourceRenderMode("projects/resources/sample-project/_extracted/sample.txt", "extracted"),
    "inline-frame"
  );
});

test("keeps docx resources on the fallback path", () => {
  assert.equal(getReferenceResourceRenderMode("projects/resources/sample-project/sample.docx", "raw"), "fallback");
});
