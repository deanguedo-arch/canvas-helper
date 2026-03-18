import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  parseAssignmentXmlSummary,
  parseEmbeddedMediaFromHtml,
  parseQuizXmlQuestions
} from "../lib/course-shell-content-parsers.js";
import { fileExists } from "../lib/fs.js";
import type { D2LCourseMap, D2LCourseMapNode } from "../lib/types.js";

const PROJECT_SLUG = "forensics35";
const courseMapPath = path.resolve(`projects/${PROJECT_SLUG}/meta/d2l-course-map.json`);
const resourcesRoot = path.resolve(`projects/resources/${PROJECT_SLUG}`);

function flattenNodes(nodes: D2LCourseMapNode[]) {
  const results: D2LCourseMapNode[] = [];
  for (const node of nodes) {
    if (node.resource?.hrefs?.length) {
      results.push(node);
    }
    if (node.children.length > 0) {
      results.push(...flattenNodes(node.children));
    }
  }
  return results;
}

function toResourcePath(href: string) {
  return path.join(resourcesRoot, ...href.split("/"));
}

test("parseAssignmentXmlSummary extracts assignment text from real forensics35 source", async () => {
  const map = JSON.parse(await readFile(courseMapPath, "utf8")) as D2LCourseMap;
  const nodes = flattenNodes(map.modules);
  const assignmentNode = nodes.find(
    (node) =>
      node.resource?.hrefs?.[0] &&
      node.resource.hrefs[0].includes("assignment/") &&
      node.resource.hrefs[0].toLowerCase().endsWith(".xml")
  );

  assert.ok(assignmentNode?.resource?.hrefs?.[0], "expected at least one assignment XML in course map");

  const href = assignmentNode.resource.hrefs[0]!;
  const xml = await readFile(toResourcePath(href), "utf8");
  const parsed = parseAssignmentXmlSummary(xml);

  assert.equal(parsed.summary.length > 0, true);
});

test("parseQuizXmlQuestions parses at least one question from real forensics35 quiz XML", async () => {
  const map = JSON.parse(await readFile(courseMapPath, "utf8")) as D2LCourseMap;
  const nodes = flattenNodes(map.modules);
  const quizNode = nodes.find(
    (node) =>
      node.resource?.hrefs?.[0] &&
      node.resource.hrefs[0].includes("quiz/") &&
      node.resource.hrefs[0].toLowerCase().endsWith(".xml")
  );

  assert.ok(quizNode?.resource?.hrefs?.[0], "expected at least one quiz XML in course map");

  const href = quizNode.resource.hrefs[0]!;
  const xml = await readFile(toResourcePath(href), "utf8");
  const questions = parseQuizXmlQuestions(xml);

  assert.equal(questions.length > 0, true);
  assert.equal((questions[0]?.choices?.length || 0) > 1, true);
});

test("parseEmbeddedMediaFromHtml extracts iframe/video URLs from real forensics35 HTML sources", async () => {
  const map = JSON.parse(await readFile(courseMapPath, "utf8")) as D2LCourseMap;
  const nodes = flattenNodes(map.modules);

  let selectedHref = "";
  let selectedHtml = "";
  for (const node of nodes) {
    const href = node.resource?.hrefs?.[0];
    if (!href || !href.toLowerCase().endsWith(".html")) {
      continue;
    }
    const resourcePath = toResourcePath(href);
    if (!(await fileExists(resourcePath))) {
      continue;
    }
    const html = await readFile(resourcePath, "utf8");
    selectedHref = href;
    selectedHtml = html;
    break;
  }

  assert.equal(selectedHref.length > 0, true, "expected at least one HTML source");

  const noMedia = parseEmbeddedMediaFromHtml(selectedHtml, selectedHref);
  assert.equal(noMedia, null);

  const injectedHtml = `${selectedHtml}\n<iframe src=\"Content/media/video-player.html\"></iframe>`;
  const extractedMedia = parseEmbeddedMediaFromHtml(injectedHtml, selectedHref);
  assert.ok(extractedMedia?.embedUrl);
  assert.equal(extractedMedia?.embedUrl.includes("Content/media/video-player.html"), true);
});
