# Kainaeng Brightspace Reface Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Produce rebuilt Brightspace ZIPs with refaced content HTML pages, including a lean under-2 GB package for Brightspace upload limits.

**Architecture:** Use a PowerShell streaming ZIP transformer because the source package is about 4 GB and should not be loaded wholesale into Node memory. Default mode preserves the package structure; lean mode externalizes oversized `contentservice_objects/` media, rewrites those manifest resources to lightweight placeholder HTML topics, and exports the original media files separately.

**Tech Stack:** PowerShell/.NET `System.IO.Compression.ZipArchive`, Node `node:test`, JSZip fixture inspection, existing Canvas Helper project folders.

---

### Task 1: Contract Tests

**Files:**
- Test: `scripts/tests/brightspace-package-reface.test.ts`

**Steps:**
1. Build a fixture ZIP with `imsmanifest.xml`, a content HTML page, a non-content HTML page, and binary-like assets.
2. Run `scripts/reface-brightspace-package.ps1`.
3. Assert content HTML is refaced, non-content HTML is untouched, manifest is unchanged, and assets are unchanged.
4. Build a second fixture with a standalone `contentservice_objects/` MP4 resource.
5. Run the transformer with `-PruneContentServiceObjects -MediaExportDirectory`.
6. Assert the content-service entry is excluded from the output ZIP, its manifest resource is rewritten to a placeholder HTML topic, the media file is exported, and content HTML is still refaced.

### Task 2: Streaming Transformer

**Files:**
- Modify: `scripts/reface-brightspace-package.ps1`

**Steps:**
1. Open input and output ZIP streams with .NET.
2. Parse `imsmanifest.xml` for reporting/title lookup.
3. Copy every entry unchanged except content-root HTML pages.
4. Reface content HTML by removing inline styles, injecting a consistent embedded stylesheet, preserving paths, and adding a body class.
5. Add optional lean-mode switches:
   - `-PruneContentServiceObjects`
   - `-MediaExportDirectory`
6. In lean mode, skip ZIP entries under `contentservice_objects/`, rewrite matching manifest `<resource>` file hrefs to generated placeholder pages, and export skipped files to the media directory.
7. Emit placeholder HTML entries for every rewritten content-service resource so module item references still resolve after import.
8. Emit JSON and markdown reports.

### Task 3: Run Real Packages

**Files:**
- Output: `projects/kainaeng-brightspace-reface/exports/kainaeng-brightspace-refaced.zip`
- Output: `projects/kainaeng-brightspace-reface/exports/kainaeng-brightspace-refaced-lean-under-2gb.zip`
- Output: `projects/kainaeng-brightspace-reface/exports/kainaeng-brightspace-externalized-media/`
- Output: report JSON/markdown files beside each package

**Steps:**
1. Run default mode against `Unconfirmed 160903.zip`.
2. Confirm entry count, manifest hash, transformed HTML count, and missing local references.
3. Run lean mode against the same input.
4. Confirm lean output size is under 2 GB.
5. Confirm lean output has no `contentservice_objects/` entries or manifest references.
6. Confirm lean output has no dangling manifest item identifier references.
7. Confirm lean output contains one placeholder HTML page for each externalized video resource.
8. Confirm exported media hashes match the original ZIP entries.
