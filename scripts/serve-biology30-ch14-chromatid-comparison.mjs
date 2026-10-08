import fs from 'node:fs';
import assert from 'node:assert/strict';
let source=fs.readFileSync('scripts/serve-biology30-ch14-complete-comparison.mjs','utf8');
assert(source.includes('complete-teaching-v0.1.0/evaluation'));
source=source.replace('complete-teaching-v0.1.0/evaluation','complete-teaching-v0.1.1/evaluation').replaceAll('57630','57670').replaceAll('57631','57671').replaceAll('57632','57672').replaceAll('57633','57673').replaceAll('?lesson=11','?lesson=03').replaceAll('#lesson-11','#lesson-03');
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
