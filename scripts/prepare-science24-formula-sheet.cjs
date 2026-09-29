#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const { mkdtempSync, rmSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
  const assets = path.resolve(__dirname, '../projects/science24-unit-a/workspace/assets');
  const source = path.join(assets, 'science24-formula-sheet.pdf');
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'science24-formula-'));
  try {
    const rendered = spawnSync('pdftoppm', ['-f', '1', '-l', '2', '-r', '144', '-png', source, path.join(temporary, 'page')], { encoding: 'utf8' });
    if (rendered.status !== 0) throw new Error(rendered.stderr || 'pdftoppm failed');
    await sharp(path.join(temporary, 'page-1.png')).toFile(path.join(assets, 'science24-formula-page-1.png'));
    // The supplied second PDF page has a landscape table rotated onto a portrait page.
    // Turn and trim the outer printer marks without touching the table itself.
    await sharp(path.join(temporary, 'page-2.png'))
      .rotate(90)
      .extract({ left: 170, top: 300, width: 1450, height: 900 })
      .toFile(path.join(assets, 'science24-formula-page-2.png'));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
  process.stdout.write('Prepared two Science 24 formula sheet reading pages.\n');
}

main().catch(error => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
