import fs from 'node:fs';
import assert from 'node:assert/strict';
let source=fs.readFileSync('scripts/serve-biology30-ch16-first-four-comparison.mjs','utf8');
assert(source.includes('first-four-v0.1.0/evaluation'));
source=source.replace('first-four-v0.1.0/evaluation','first-six-v0.1.0/evaluation').replaceAll('57650','57660').replaceAll('57651','57661').replaceAll('57652','57662').replaceAll('57653','57663');
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
