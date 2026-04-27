import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import test from "node:test";

import { buildSingleHtmlOutput } from "../lib/exports/shared.js";

async function writeFixtureFile(rootDir: string, relativePath: string, content: string | Buffer) {
  const absolutePath = path.join(rootDir, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
}

function decodeDataUri(value: string) {
  const [meta, payload] = value.split(",", 2);
  if (!meta || payload == null) {
    throw new Error("Invalid data URI.");
  }

  if (meta.includes(";base64")) {
    return Buffer.from(payload, "base64").toString("utf8");
  }

  return decodeURIComponent(payload);
}

test("single html export recursively inlines local iframe pages and JS-held workspace assets", async () => {
  const workspaceDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-single-html-"));

  try {
    await writeFixtureFile(
      workspaceDir,
      "index.html",
      `<!doctype html>
      <html>
        <head>
          <link rel="stylesheet" href="./styles.css" />
        </head>
        <body>
          <img src="./poster.png" alt="poster" />
          <iframe src="./child.html" title="child"></iframe>
          <script src="./main.js"></script>
        </body>
      </html>`
    );

    await writeFixtureFile(workspaceDir, "styles.css", `body { background-image: url("./bg.png"); }`);
    await writeFixtureFile(
      workspaceDir,
      "main.js",
      `const runtimeHtml = './runtime/runtime.html';
const runtimeScript = "./runtime/runtime.js";
const guidePdf = './docs/guide.pdf';
const coverImage = "./images/cover.png";
window.fixture = { runtimeHtml, runtimeScript, guidePdf, coverImage };
fetch(runtimeHtml);
const runtimeLoader = document.createElement('script');
runtimeLoader.src = runtimeScript;
document.body.append(runtimeLoader);`
    );

    await writeFixtureFile(
      workspaceDir,
      "child.html",
      `<!doctype html>
      <html>
        <body>
          <img src="./images/child-image.png" alt="child" />
          <script src="./child.js"></script>
        </body>
      </html>`
    );

    await writeFixtureFile(workspaceDir, "child.js", `window.childLoaded = "./images/child-script-image.png";`);
    await writeFixtureFile(
      workspaceDir,
      "runtime/runtime.html",
      `<!doctype html>
      <html><body><img src="../images/runtime-image.png" alt="runtime" /></body></html>`
    );
    await writeFixtureFile(
      workspaceDir,
      "runtime/runtime.js",
      `window.runtimeAsset = "../docs/runtime-guide.pdf";`
    );

    await writeFixtureFile(workspaceDir, "poster.png", "poster-binary");
    await writeFixtureFile(workspaceDir, "bg.png", "bg-binary");
    await writeFixtureFile(workspaceDir, "images/cover.png", "cover-binary");
    await writeFixtureFile(workspaceDir, "images/child-image.png", "child-image-binary");
    await writeFixtureFile(workspaceDir, "images/child-script-image.png", "child-script-binary");
    await writeFixtureFile(workspaceDir, "images/runtime-image.png", "runtime-image-binary");
    await writeFixtureFile(workspaceDir, "docs/guide.pdf", "guide-pdf-binary");
    await writeFixtureFile(workspaceDir, "docs/runtime-guide.pdf", "runtime-guide-binary");

    const entrypointPath = path.join(workspaceDir, "index.html");
    const { html } = await buildSingleHtmlOutput(workspaceDir, entrypointPath);

    assert.doesNotMatch(html, /\.\/child\.html/);
    assert.doesNotMatch(html, /\.\/runtime\/runtime\.html/);
    assert.doesNotMatch(html, /\.\/runtime\/runtime\.js/);
    assert.doesNotMatch(html, /\.\/docs\/guide\.pdf/);
    assert.match(html, /data:text\/html/);
    assert.match(html, /data:image\/png/);
    assert.match(html, /window\.__CH_ASSET__/);
    assert.match(html, /const guidePdf = window\.__CH_ASSET__\(/);

    const guidePdfBase64 = Buffer.from("guide-pdf-binary").toString("base64");
    assert.equal(
      html.split(guidePdfBase64).length - 1,
      1,
      "expected JS-held assets to be bundled once in the embedded asset registry"
    );

    const iframeMatch = html.match(/<iframe[^>]+src="(data:text\/html[^"]+)"/i);
    assert.ok(iframeMatch, "expected the local iframe HTML to be embedded as a data URI");

    const decodedChildHtml = decodeDataUri(iframeMatch[1]);
    assert.match(decodedChildHtml, /data:image\/png/);
    assert.doesNotMatch(decodedChildHtml, /\.\/images\/child-image\.png/);
    assert.doesNotMatch(decodedChildHtml, /<script[^>]+src="\.\/*child\.js"/i);
  } finally {
    await rm(workspaceDir, { recursive: true, force: true });
  }
});
