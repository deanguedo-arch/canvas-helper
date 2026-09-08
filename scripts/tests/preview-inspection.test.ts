import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getProjectPaths } from "../lib/paths.js";

import { decoratePreviewHtml, resolvePreviewInspection } from "../../app/server/lib/preview-inspection.ts";
import type { InspectionResolveRequest } from "../../app/shared/inspection.ts";

test("single-pass decoration preserves exact legacy bytes, marker order and source offsets", () => {
  const source = '<!doctype html>\n<html><head><style>x{color:red}</style></head><body>\n<main data-note="a > b"><h1>Résumé 🧠</h1><img src="x.png"/><input value=">" />\n<template><p>not marked</p></template><script>const x="<div>";</script></main></body></html>';
  const document = decoratePreviewHtml(source)!;
  assert.ok(document);
  let legacy = source;
  const locations = [...document.nodeLocations];
  assert.deepEqual(locations.map(([,entry])=>entry.tagName), ["input","img","h1","main","body","html"]);
  for (const [nodeId, entry] of locations) {
    const at = source[entry.sourceEnd - 1] === "/" ? entry.sourceEnd - 1 : entry.sourceEnd;
    legacy = `${legacy.slice(0, at)} data-canvas-helper-inspect-node="${nodeId}"${legacy.slice(at)}`;
    assert.equal(source.slice(entry.sourceStart,entry.sourceEnd+1).startsWith(`<${entry.tagName}`),true);
  }
  assert.equal(document.html,legacy);
  assert.deepEqual([...document.nodeIds],locations.map(([id])=>id));
  assert.equal(decoratePreviewHtml('<p data-canvas-helper-inspect-node="forged">x</p>'),null);
});

test("large static course decoration stays within the preview readiness budget", () => {
  const source = `<main>${'<section><h2>Observe and explain</h2><p>Use the labelled figure and compare the evidence.</p><select><option>Structure</option><option>Function</option></select></section>'.repeat(12000)}</main>`;
  const started=performance.now();
  const document=decoratePreviewHtml(source)!;
  assert.equal(document.nodeIds.size,72001);
  assert.equal(document.html.replace(/ data-canvas-helper-inspect-node="ch1:[a-f0-9]{24}:\d+"/g,""),source);
  assert.ok(performance.now()-started<5000,"Annotation decoration must not consume the ten-second preview readiness window");
});

function requestFor(slug: string, nodeId: string): InspectionResolveRequest {
  return {
    projectSlug: slug,
    root: "workspace",
    htmlPath: "index.html",
    selection: {
      nodeId,
      visibleText: "Inspectable heading",
      tagName: "h1",
      role: "",
      testId: "",
      geometry: { x: 0, y: 0, width: 120, height: 24 },
      viewport: { width: 1280, height: 720 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: `http://127.0.0.1:61234/preview/workspace/${slug}/index.html`
    }
  };
}

async function firstSourceNode(slug: string) {
  const paths = getProjectPaths(slug);
  const source = await readFile(paths.workspaceEntrypoint, "utf8");
  const document = decoratePreviewHtml(source);
  assert.ok(document, `Expected ${slug} workspace HTML to be inspectable.`);
  const nodeId = document.nodeIds.values().next().value;
  if (typeof nodeId !== "string") {
    throw new Error(`Expected ${slug} workspace HTML to expose an inspectable source node.`);
  }
  return { nodeId, previewFilePath: paths.workspaceEntrypoint };
}

test("direct workspace provenance resolves an exact declared source only for a current opaque node", async () => {
  const { nodeId, previewFilePath } = await firstSourceNode("forensics35");
  const resolution = await resolvePreviewInspection(requestFor("forensics35", nodeId), previewFilePath);

  assert.equal(resolution.resolution, "exact");
  assert.equal(resolution.freshness, "current");
  assert.equal(resolution.primaryEditTarget, "projects/forensics35/workspace/index.html");
  assert.ok((resolution.primaryEditLine ?? 0) > 0);
  assert.equal(resolution.generated, false);
  assert.ok(resolution.sourceExcerpt);
  assert.match(resolution.sourceExcerpt.text, /^\d+ \| /m);
  assert.ok(Buffer.byteLength(resolution.sourceExcerpt.text, "utf8") <= 1_600);
});

test("Social provenance never recommends its generated workspace HTML as an edit target", async () => {
  const slug = "social30-1-related-issue-1-option-2";
  const { nodeId, previewFilePath } = await firstSourceNode(slug);
  const resolution = await resolvePreviewInspection(requestFor(slug, nodeId), previewFilePath);

  assert.equal(resolution.resolution, "bounded");
  assert.equal(resolution.generated, true);
  assert.equal(resolution.primaryEditTarget, "scripts/build-social30-related-issues.ts");
  assert.equal(resolution.primaryEditLine, null);
  assert.notEqual(resolution.primaryEditTarget, `projects/${slug}/workspace/index.html`);
  assert.match(resolution.rebuildCommand ?? "", /build-social30-related-issues/);
  assert.equal(resolution.sourceExcerpt, null);
});

test("English provenance routes generated workspace selections to the recipe and rebuild flow", async () => {
  const slug = "ela20-1-modern-play-crucible";
  const { nodeId, previewFilePath } = await firstSourceNode(slug);
  const resolution = await resolvePreviewInspection(requestFor(slug, nodeId), previewFilePath);

  assert.equal(resolution.resolution, "bounded");
  assert.equal(resolution.generated, true);
  assert.equal(resolution.primaryEditTarget, `projects/${slug}/meta/english-unit.json`);
  assert.equal(resolution.primaryEditLine, null);
  assert.notEqual(resolution.primaryEditTarget, `projects/${slug}/workspace/index.html`);
  assert.equal(resolution.rebuildCommand, `npm run build:english-unit -- --project ${slug}`);
  assert.equal(resolution.sourceExcerpt, null);
});

test("a stale or forged opaque node fails closed", async () => {
  const { nodeId, previewFilePath } = await firstSourceNode("forensics35");
  const staleNodeId = nodeId.replace(/:[a-f0-9]{24}:/, ":000000000000000000000000:");
  const resolution = await resolvePreviewInspection(requestFor("forensics35", staleNodeId), previewFilePath);

  assert.equal(resolution.resolution, "unknown");
  assert.equal(resolution.primaryEditTarget, null);
  assert.equal(resolution.freshness, "stale");
  assert.equal(resolution.sourceExcerpt, null);
});
