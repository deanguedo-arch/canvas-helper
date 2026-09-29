#!/usr/bin/env node
/**
 * AS30 asset manifest + media ledger generator (T21).
 *
 * Walks projects/aboriginal-studies-30/workspace and emits:
 * - meta/ab30-parity/asset-manifest.json: the student deliverable allowlist
 *   (every shipped file with bytes+sha256; backups explicitly excluded).
 * - meta/ab30-parity/media-ledger.json: per-media-asset source/permission
 *   record. Permission statuses are HONEST, not approved: most read
 *   "unverified" until a human confirms them.
 *
 * Regenerate: `node scripts/as30-asset-manifest.js` from the repo root.
 * Never hand-edit the emitted JSON; change the rules/tables below instead.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const WORKSPACE = join(ROOT, "projects", "aboriginal-studies-30", "workspace");
const META = join(ROOT, "projects", "aboriginal-studies-30", "meta", "ab30-parity");

const EXCLUDE_RULES = [
  { match: /(^|\/)Archive\.zip$/i, reason: "source backup outside the deliverable; kept on disk, never shipped" },
  { match: /(^|\/)\.DS_Store$/i, reason: "macOS metadata; never shipped" },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

function sha256(full) {
  return createHash("sha256").update(readFileSync(full)).digest("hex");
}

function classify(rel) {
  if (/\.(js|html|css)$/i.test(rel)) return "code-shell";
  if (/^assets\/brand\//i.test(rel)) return "brand";
  if (/^assets\/library\//i.test(rel)) return "library-reader";
  if (/^assets\/assignments\//i.test(rel)) return "assignment-record";
  if (/^assets\//i.test(rel)) return "media-image";
  return "other";
}

// Permission/source table. Statuses are claims of RECORD, not approval:
// "unverified" means no human has confirmed reuse rights. Anything not
// listed here defaults to unverified + unknown source (fail-closed).
function ledgerEntry(rel, bytes) {
  if (/^assets\/brand\//i.test(rel)) {
    return { path: rel, bytes, kind: "brand", source: "Supplied with the course shell.", permission: "supplied-with-course", fallback: "Alt text names the provider; nav works without it." };
  }
  if (/^assets\/library\//i.test(rel)) {
    return { path: rel, bytes, kind: "library-reader", source: "D2L course content export (textbook chapters, readers, rubrics).", permission: "unverified", fallback: "Library rows name title/pages; download requires the file." };
  }
  if (/^assets\/assignments\//i.test(rel)) {
    return { path: rel, bytes, kind: "assignment-record", source: "Converted from the supplied assignment documents.", permission: "supplied-with-course", fallback: "Assignment summaries render from course data." };
  }
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(rel)) {
    return { path: rel, bytes, kind: "media-image", source: "Extracted D2L theme stills.", permission: "unverified", fallback: "Lessons teach fully without images; none is a sole teaching requirement." };
  }
  if (/\.(pdf|docx|html|rtf)$/i.test(rel)) {
    return { path: rel, bytes, kind: "media-document", source: "Supplied course documents.", permission: "unverified", fallback: "Linked by name; absence must badge, never blank a requirement." };
  }
  return { path: rel, bytes, kind: "other-asset", source: "Unknown.", permission: "unverified", fallback: "None recorded." };
}

function main() {
  const files = walk(WORKSPACE).map((full) => relative(WORKSPACE, full).split(sep).join("/")).sort();
  const shipped = [];
  const excluded = [];
  for (const rel of files) {
    const rule = EXCLUDE_RULES.find((entry) => entry.match.test(rel));
    const full = join(WORKSPACE, rel);
    if (rule) {
      excluded.push({ path: rel, bytes: statSync(full).size, reason: rule.reason });
    } else {
      shipped.push({ path: rel, bytes: statSync(full).size, sha256: sha256(full), class: classify(rel) });
    }
  }
  const manifest = {
    schemaVersion: 1,
    ticket: "T21",
    generatedBy: "node scripts/as30-asset-manifest.js",
    shipped,
    excluded,
    counts: { shipped: shipped.length, excluded: excluded.length },
  };
  writeFileSync(join(META, "asset-manifest.json"), `${JSON.stringify(manifest, null, 1)}\n`);
  const ledger = {
    schemaVersion: 1,
    ticket: "T21",
    note: "Permission statuses are recorded facts, not approvals. 'unverified' needs a human decision before release.",
    entries: shipped
      .filter((entry) => entry.class !== "code-shell")
      .map((entry) => ledgerEntry(entry.path, entry.bytes)),
  };
  writeFileSync(join(META, "media-ledger.json"), `${JSON.stringify(ledger, null, 1)}\n`);
  console.log(`shipped=${shipped.length} excluded=${excluded.length} ledger=${ledger.entries.length}`);
  for (const entry of excluded) console.log(`excluded: ${entry.path} (${entry.reason})`);
}

main();
