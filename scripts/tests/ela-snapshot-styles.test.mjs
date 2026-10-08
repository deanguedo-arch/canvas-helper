import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { projects, prepareLocalTheme, replaceRemoteTheme } from '../repair-ela-snapshot-styles.mjs';

for (const slug of projects) {
  test(`${slug}: local styling preserves the complete learner runtime`, async () => {
    const root = `projects/${slug}`;
    const original = await fs.readFile(`${root}/meta/studio-population-sweep/index.before-local-theme.html`, 'utf8');
    const current = await fs.readFile(`${root}/workspace/index.html`, 'utf8');
    assert.equal(current.slice(current.indexOf('<body')), original.slice(original.indexOf('<body')));
    assert.equal(current, replaceRemoteTheme(original));
    assert.doesNotMatch(current, /<script[^>]*src=["']https:\/\/cdn\.tailwindcss\.com/);
    assert.deepEqual(JSON.parse(await fs.readFile(`${root}/workspace/assets/studio-local-theme/theme.json`, 'utf8')), JSON.parse(JSON.stringify(prepareLocalTheme(original))));
    const manifest = JSON.parse(await fs.readFile(`${root}/meta/project.json`, 'utf8'));
    assert.equal(manifest.authoring.driverId, 'legacy-snapshot-v1');
    assert.equal(manifest.regenerateCommand, `node scripts/repair-ela-snapshot-styles.mjs --project ${slug}`);
    const css = await fs.readFile(`${root}/workspace/assets/studio-local-theme/utilities.css`, 'utf8');
    assert.match(css, /\.fixed\{position:fixed\}/);
    assert.match(css, /\.flex\{display:flex\}/);
  });
}

test('refuses input without a preserved theme', () => {
  assert.throws(() => prepareLocalTheme('<html><body>Source content</body></html>'), /theme not found/);
});
