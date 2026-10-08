import fs from 'node:fs';
// Reuse the existing localhost-only, path-safe preview server without changing it.
let source=fs.readFileSync('scripts/serve-biology30-ch17-batch1-comparison.mjs','utf8');
source=source.replace('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-batch-01-03-04-v0.1.0/evaluation','projects/biology30-chapter-15/meta/teaching-overhaul/2026-10-08-teacher-led/complete-teaching-v0.1.0/evaluation');
source=source.replace("path.join(root,'preservation-report.json')","path.join(root,'../BUILD_RECEIPT.json')");
source=source.replace("[[57230,root],[57231,path.join(root,'baseline')],[57232,path.join(root,'new')],[57233,path.join(root,'new')]]","[[57640,root],[57643,path.join(root,'baseline')],[57641,path.join(root,'new')],[57642,path.join(root,'new')]]");
source=source.replaceAll('57230','57640').replaceAll('57232','57641');
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
