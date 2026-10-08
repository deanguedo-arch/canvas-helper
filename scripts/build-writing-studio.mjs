import { build } from 'esbuild';
import { resolve } from 'node:path';

const root = resolve('projects/nextstep-writing-studio/workspace');
await build({
  entryPoints: [resolve(root, 'app/main.js')],
  outfile: resolve(root, 'writing-studio.bundle.js'),
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2022'],
  minify: true,
  legalComments: 'none',
  sourcemap: false,
  logLevel: 'warning'
});
console.log('Built Writing Studio browser bundle.');
