import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const workspacePath = path.resolve("projects/calm3new/workspace/main.js");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("calm3new intro poem block keeps clean punctuation and lesson quotes", async () => {
  const source = await readFile(workspacePath, "utf8");
  const introStart = source.indexOf("Full Poem");
  const introEnd = source.indexOf("<!-- Quote Analysis Table -->");

  assert.notEqual(introStart, -1, "expected intro poem heading");
  assert.notEqual(introEnd, -1, "expected intro quote analysis marker");

  const poemBlock = source.slice(introStart, introEnd);

  const requiredSnippets = [
    "Full Poem — By Dr. Seuss",
    "You’re off to Great Places! You’re off and away!",
    "You’ll look up and down streets.",
    "The Waiting Place…for people just waiting.",
    "That’s not for you!",
    "Life’s a Great Balancing Act.",
    "Kid, you’ll move mountains!",
    "So…get on your way!"
  ];

  for (const snippet of requiredSnippets) {
    assert.match(poemBlock, new RegExp(escapeRegex(snippet)));
  }

  assert.equal(poemBlock.includes("??"), false, "expected no mojibake markers in poem block");
});
