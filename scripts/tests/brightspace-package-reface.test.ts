import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

import JSZip from "jszip";

async function runPowerShellScript(args: string[]) {
  const scriptPath = path.resolve("scripts/reface-brightspace-package.ps1");

  return new Promise<{ code: number; stdout: string; stderr: string }>((resolve) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, ...args],
      {
        cwd: path.resolve("."),
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

test("reface-brightspace-package rewrites only content HTML and preserves package structure", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "brightspace-reface-"));
  const cyrillicContentRoot = "\u0441ontent";
  const manifest = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<manifest xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1">',
    "  <organizations>",
    "    <organization>",
    '      <item identifier="topic-1" identifierref="topic-resource">',
    "        <title>Clean Lesson Title</title>",
    "      </item>",
    "    </organization>",
    "  </organizations>",
    "  <resources>",
    '    <resource identifier="topic-resource" type="webcontent">',
    `      <file href="${cyrillicContentRoot}/topic/page.html" />`,
    "    </resource>",
    "  </resources>",
    "</manifest>",
    ""
  ].join("\n");

  try {
    const inputZipPath = path.join(tempDir, "input.zip");
    const outputZipPath = path.join(tempDir, "output.zip");
    const reportJsonPath = path.join(tempDir, "report.json");
    const reportMarkdownPath = path.join(tempDir, "report.md");
    const zip = new JSZip();
    zip.file("imsmanifest.xml", manifest);
    zip.file(
      `${cyrillicContentRoot}/topic/page.html`,
      [
        "<!doctype html>",
        "<html><head><title>Old</title></head>",
        '<body style="font-family: Verdana; font-size: 12pt;">',
        '<p style="color: red;"><font face="Verdana">Read <a href="asset.pdf">this</a>.</font></p>',
        '<p><img src="hero%20image.png" style="max-width:100%;" alt="Hero"></p>',
        "</body></html>"
      ].join("")
    );
    zip.file(`${cyrillicContentRoot}/topic/asset.pdf`, "pdf-content");
    zip.file(`${cyrillicContentRoot}/topic/hero image.png`, "image-content");
    zip.file("assignments/instructions.html", '<html><body style="color:red">Do not touch</body></html>');
    await zip.generateAsync({ type: "nodebuffer" }).then((buffer) => import("node:fs/promises").then(({ writeFile }) => writeFile(inputZipPath, buffer)));

    const result = await runPowerShellScript([
      "-InputZip",
      inputZipPath,
      "-OutputZip",
      outputZipPath,
      "-ReportJson",
      reportJsonPath,
      "-ReportMarkdown",
      reportMarkdownPath
    ]);

    assert.equal(result.code, 0, result.stderr || result.stdout);

    const outputZip = await JSZip.loadAsync(await readFile(outputZipPath));
    assert.deepEqual(Object.keys(outputZip.files).sort(), Object.keys(zip.files).sort());
    assert.equal(await outputZip.file("imsmanifest.xml")?.async("string"), manifest);
    assert.equal(await outputZip.file(`${cyrillicContentRoot}/topic/asset.pdf`)?.async("string"), "pdf-content");
    assert.equal(await outputZip.file(`${cyrillicContentRoot}/topic/hero image.png`)?.async("string"), "image-content");
    assert.equal(
      await outputZip.file("assignments/instructions.html")?.async("string"),
      '<html><body style="color:red">Do not touch</body></html>'
    );

    const transformed = await outputZip.file(`${cyrillicContentRoot}/topic/page.html`)?.async("string");
    assert.ok(transformed);
    assert.match(transformed, /data-canvas-helper-reface="true"/);
    assert.match(transformed, /course-reface-page/);
    assert.match(transformed, /Clean Lesson Title/);
    assert.match(transformed, /href="asset\.pdf"/);
    assert.match(transformed, /src="hero%20image\.png"/);
    assert.doesNotMatch(transformed, /\sstyle=/i);
    assert.doesNotMatch(transformed, /<font\b/i);

    const report = JSON.parse(await readFile(reportJsonPath, "utf8")) as {
      transformedHtmlCount: number;
      skippedHtmlCount: number;
      manifestUnchanged: boolean;
      missingLocalReferenceCount: number;
    };
    assert.equal(report.transformedHtmlCount, 1);
    assert.equal(report.skippedHtmlCount, 1);
    assert.equal(report.manifestUnchanged, true);
    assert.equal(report.missingLocalReferenceCount, 0);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("reface-brightspace-package can prune oversized content-service videos into a separate media folder", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "brightspace-reface-lean-"));
  const cyrillicContentRoot = "\u0441ontent";
  const contentServicePath = "contentservice_objects/video-object_latest/source.mp4";
  const manifest = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<manifest xmlns="http://www.imsglobal.org/xsd/imsccv1p3/imscp_v1p1">',
    "  <organizations>",
    "    <organization>",
    '      <item identifier="topic-1" identifierref="topic-resource">',
    "        <title>Lean Lesson Title</title>",
    "      </item>",
    "    </organization>",
    "  </organizations>",
    "  <resources>",
    '    <resource identifier="topic-resource" type="webcontent">',
    `      <file href="${cyrillicContentRoot}/topic/page.html" />`,
    "    </resource>",
    '    <resource identifier="video-resource" type="webcontent">',
    `      <file href="${contentServicePath}" />`,
    "    </resource>",
    "  </resources>",
    "</manifest>",
    ""
  ].join("\n");

  try {
    const inputZipPath = path.join(tempDir, "input.zip");
    const outputZipPath = path.join(tempDir, "output.zip");
    const reportJsonPath = path.join(tempDir, "report.json");
    const mediaExportDir = path.join(tempDir, "media");
    const zip = new JSZip();
    zip.file("imsmanifest.xml", manifest);
    zip.file(
      `${cyrillicContentRoot}/topic/page.html`,
      '<html><head></head><body><p style="color:red">Keep this page.</p></body></html>'
    );
    zip.file(contentServicePath, "video-content");
    await zip
      .generateAsync({ type: "nodebuffer" })
      .then((buffer) => import("node:fs/promises").then(({ writeFile }) => writeFile(inputZipPath, buffer)));

    const result = await runPowerShellScript([
      "-InputZip",
      inputZipPath,
      "-OutputZip",
      outputZipPath,
      "-ReportJson",
      reportJsonPath,
      "-PruneContentServiceObjects",
      "-MediaExportDirectory",
      mediaExportDir
    ]);

    assert.equal(result.code, 0, result.stderr || result.stdout);

    const outputZip = await JSZip.loadAsync(await readFile(outputZipPath));
    assert.ok(outputZip.file(`${cyrillicContentRoot}/topic/page.html`));
    assert.equal(outputZip.file(contentServicePath), null);
    assert.ok(outputZip.file("contentservice_placeholders/video-resource.html"));

    const outputManifest = await outputZip.file("imsmanifest.xml")?.async("string");
    assert.ok(outputManifest);
    assert.match(outputManifest, /topic-resource/);
    assert.match(outputManifest, /video-resource/);
    assert.match(outputManifest, /contentservice_placeholders\/video-resource\.html/);
    assert.doesNotMatch(outputManifest, /contentservice_objects/);

    const placeholder = await outputZip.file("contentservice_placeholders/video-resource.html")?.async("string");
    assert.ok(placeholder);
    assert.match(placeholder, /Lean Lesson Title|video-content|source\.mp4/);

    const transformed = await outputZip.file(`${cyrillicContentRoot}/topic/page.html`)?.async("string");
    assert.ok(transformed);
    assert.match(transformed, /data-canvas-helper-reface="true"/);
    assert.doesNotMatch(transformed, /\sstyle=/i);

    assert.equal(
      await readFile(path.join(mediaExportDir, contentServicePath), "utf8"),
      "video-content"
    );

    const report = JSON.parse(await readFile(reportJsonPath, "utf8")) as {
      manifestUnchanged: boolean;
      prunedContentServiceObjectCount: number;
      rewrittenContentServiceResourceCount: number;
      mediaExportDirectory: string;
    };
    assert.equal(report.manifestUnchanged, false);
    assert.equal(report.prunedContentServiceObjectCount, 1);
    assert.equal(report.rewrittenContentServiceResourceCount, 1);
    assert.match(report.mediaExportDirectory, /brightspace-reface-lean-.+[\\/]media$/);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
