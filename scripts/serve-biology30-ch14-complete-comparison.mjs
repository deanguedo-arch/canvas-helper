import fs from 'node:fs';
// Reuse the checked-in path-safe, localhost-only GET/HEAD preview server.
let source=fs.readFileSync('scripts/serve-biology30-ch17-batch1-comparison.mjs','utf8');
source=source.replace('projects/biology30-chapter-17/meta/teaching-overhaul/2026-10-04-exemplar-transfer/teacher-led-batch-01-03-04-v0.1.0/evaluation','projects/biology30-chapter-14/meta/teaching-overhaul/2026-10-08-teacher-led/complete-teaching-v0.1.0/evaluation');
source=source.replace("path.join(root,'preservation-report.json')","path.join(root,'../BUILD_RECEIPT.json')");
source=source.replace('[[57230,root],[57231,path.join(root,\'baseline\')],[57232,path.join(root,\'new\')],[57233,path.join(root,\'new\')]]',"[[57630,root],[57633,path.join(root,'baseline')],[57631,path.join(root,'new')],[57632,path.join(root,'new')]]");
source=source.replaceAll('57230','57630').replaceAll('57232','57631');
source=source.replaceAll('?lesson=01','?lesson=11').replaceAll('#lesson-01','#lesson-11');
await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
