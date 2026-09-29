#!/usr/bin/env node
'use strict';

// Rebuild clean reader copies from the unchanged textbook page renders.
// The source JPGs and original PDF stay intact for source comparison.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const project = process.argv[process.argv.indexOf('--project') + 1];
if (!['science24-unit-b', 'science24-unit-c'].includes(project)) {
  throw new Error('Use --project science24-unit-b or science24-unit-c');
}

const workspace = path.join(__dirname, '..', 'projects', project, 'workspace');
const data = JSON.parse(fs.readFileSync(path.join(workspace, 'course-data.json'), 'utf8'));
const pages = data.resources[0].pages;

(async () => {
  for (const page of pages) {
    const match = /^assets\/textbook-page-(\d{2})\.jpg$/.exec(page.originalImage || page.image);
    if (!match) throw new Error(`Unexpected original textbook page path: ${page.originalImage || page.image}`);
    const source = path.join(workspace, 'assets', `textbook-page-${match[1]}.jpg`);
    const destination = path.join(workspace, 'assets', 'reader-pages', `textbook-page-${match[1]}.jpg`);
    const meta = await sharp(source).metadata();
    const side = match[1] === '01' ? 50 : 65;
    const top = 40;
    const bottom = 40;
    if (meta.width < 2 * side + 500 || meta.height < top + bottom + 500) {
      throw new Error(`Unexpected textbook page dimensions: ${source}`);
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    await sharp(source)
      .extract({ left: side, top, width: meta.width - 2 * side, height: meta.height - top - bottom })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(destination);
  }
  console.log(`Prepared ${pages.length} clean reader pages for ${project}. Original scans unchanged.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
