import assert from "node:assert/strict";
import test from "node:test";

import { detectPdfTextIssue, getExecutableNameCandidates } from "../lib/pdf-text.js";

test("detectPdfTextIssue flags empty extraction", () => {
  assert.equal(
    detectPdfTextIssue(""),
    "No selectable text detected. Add an OCR-readable PDF or a matching .txt/.docx source."
  );
});

test("detectPdfTextIssue flags private-use glyph garbage", () => {
  const garbage = "\uE001\uE002\uE003\uE004 ".repeat(200);
  assert.equal(detectPdfTextIssue(garbage), "Extracted text appears garbled (likely font-encoded PDF text).");
});

test("detectPdfTextIssue flags long unbroken alphabetic runs from broken native PDF text", () => {
  const garbled = `
    nextstepfortsaskatchewansherwoodparkvegrevillenextstepfortsaskatchewan
    sherwoodparkvegrevillenextstepfortsaskatchewansherwoodparkvegreville
    nextstepfortsaskatchewansherwoodparkvegrevillenextstepfortsaskatchewan
    STUDENT NAME Personal Psychology 20 Unit 1
  `;

  assert.equal(detectPdfTextIssue(garbled), "Extracted text appears garbled (likely font-encoded PDF text).");
});

test("detectPdfTextIssue accepts readable textbook text", () => {
  const readableText = `
    Psychology is the scientific study of behaviour and mental processes.
    Students should be able to explain structuralism, functionalism, behaviourism,
    humanism, and the early laboratory tradition after reading this section.
  `;

  assert.equal(detectPdfTextIssue(readableText), null);
});

test("getExecutableNameCandidates prefers bare binary names on unix-like platforms", () => {
  assert.deepEqual(getExecutableNameCandidates("tesseract", "darwin"), ["tesseract", "tesseract.exe"]);
  assert.deepEqual(getExecutableNameCandidates("pdftoppm", "linux"), ["pdftoppm", "pdftoppm.exe"]);
});

test("getExecutableNameCandidates prefers .exe names on Windows", () => {
  assert.deepEqual(getExecutableNameCandidates("tesseract", "win32"), ["tesseract.exe", "tesseract"]);
});
