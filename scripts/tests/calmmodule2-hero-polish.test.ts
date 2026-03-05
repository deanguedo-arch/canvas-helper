import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calmmodule2/workspace/main.jsx");
const stylesPath = path.resolve("projects/calmmodule2/workspace/styles.css");
const knowledgeDropPath = path.resolve("projects/calmmodule2/workspace/components/KnowledgeDrop.jsx");
const hintTogglePath = path.resolve("projects/calmmodule2/workspace/components/HintToggle.jsx");

test("hero polish hooks exist across main surfaces and shared helpers", async () => {
  const [mainSource, stylesSource, knowledgeSource, hintSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8"),
    readFile(knowledgeDropPath, "utf8"),
    readFile(hintTogglePath, "utf8")
  ]);

  const mainSnippets = [
    "const SectionHeader =",
    "section-shell",
    "section-kicker",
    "section-copy"
  ];

  for (const snippet of mainSnippets) {
    assert.match(mainSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const styleSnippets = [
    ".module-stage",
    ".section-shell",
    ".section-hero",
    ".section-kicker",
    ".section-copy",
    ".clay-card-soft"
  ];

  for (const snippet of styleSnippets) {
    assert.match(stylesSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(knowledgeSource, /knowledge-drop/);
  assert.match(knowledgeSource, /knowledge-drop__body/);
  assert.match(hintSource, /hint-toggle/);
  assert.match(hintSource, /hint-toggle__panel/);
});
