import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calmmodule2/workspace/main.jsx");

test("money section includes new income and budget reflection prompts", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "incomeCurrent: \"\"",
    "incomeFuture: \"\"",
    "purchaseDecision: \"\"",
    "purchaseFactors: \"\"",
    "budgetWhereFrom: \"\"",
    "budgetWhereGo: \"\"",
    "budgetEndMonth: \"\"",
    "budgetChange: \"\"",
    "fd.incomeCurrent",
    "fd.incomeFuture",
    "fd.purchaseDecision",
    "fd.purchaseFactors",
    "fd.budgetWhereFrom",
    "fd.budgetWhereGo",
    "fd.budgetEndMonth",
    "fd.budgetChange",
    "Income and Purchasing Reflection",
    "Budget Reflection",
    "Where does your money come from?",
    "Where does most of your money come from?"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
