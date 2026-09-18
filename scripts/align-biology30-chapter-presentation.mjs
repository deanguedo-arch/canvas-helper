import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {load} from 'cheerio';

// Presentation-only normalization of the two externally authored chapter imports.
// Preserve source data, runtime, routes and answer identities verbatim.
const root=process.cwd();
const reference=path.join(root,'projects/biology30-unit-a-pilot-3/workspace');
const base=fs.readFileSync(path.join(reference,'styles.css'),'utf8');
const presentationBase=base.replace(/@font-face\s*\{[^}]*\}/g,'');
const referenceHtml=load(fs.readFileSync(path.join(reference,'index.html'),'utf8'));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const fontCss=['HankenGrotesk-Variable.ttf','WorkSans-Variable.ttf'].map((file,i)=>
  `@font-face{font-family:"${i?'Work Sans':'Hanken Grotesk'}";src:url("data:font/ttf;base64,${fs.readFileSync(path.join(reference,'assets/fonts',file)).toString('base64')}") format("truetype");font-weight:100 900;font-display:swap}`
).join('\n');
const parity=fs.readFileSync(path.join(root,'scripts/lib/biology30-chapters/presentation-parity.css'),'utf8');
for(const chapter of [12,13]){
  const slug=`biology30-chapter-${chapter}`;
  const project=path.join(root,'projects',slug);
  const source=fs.readFileSync(`/Users/deanguedo/Downloads/Biology30_Chapter${chapter}.html`,'utf8');
  const $=load(source);
  const originalCss=$('style').text();
  const marker='/* Standalone HTML adaptations;';
  if(!originalCss.includes(marker))throw Error('Missing standalone presentation boundary');
  const compatibility=originalCss.slice(originalCss.indexOf(marker));
  const runtime=$('script').filter((i,e)=>!$(e).attr('type')).text();
  $('style').remove();
  $('head').append('<link rel="stylesheet" href="./styles.css">');
  $('script').filter((i,e)=>!$(e).attr('type')).remove();
  $('body').append('<script src="./main.js"></script>');
  // Match the canonical guide markup without changing its instructions.
  $('.page-guide > summary').each((i,e)=>{
    if(!$(e).children('strong').length)$(e).wrapInner('<strong></strong>');
  });
  $('[data-canvas-edit-key]').each((i,e)=>{
    $(e).attr('data-canvas-helper-edit-key',$(e).attr('data-canvas-edit-key'));
  });
  $('.sidebar-title').attr('data-canvas-helper-course-title','');
  $('.sidebar-title').text(`Biology 30 - Chapter ${chapter}`);
  $('.sidebar-code').text('BIO 30');
  $('.sidebar-toggle').html(referenceHtml('.sidebar-toggle').html());
  $('.progress-meta').prepend('<span>Course progress</span>');
  const css=`${presentationBase}\n${compatibility}\n/* Canonical Chapter 11 presentation takes precedence. */\n${presentationBase}\n${parity}\n${fontCss}\n`;
  fs.writeFileSync(path.join(project,'workspace/index.html'),$.html());
  fs.writeFileSync(path.join(project,'workspace/styles.css'),css);
  fs.writeFileSync(path.join(project,'workspace/main.js'),runtime);
  // Also provide the requested chapters as portable, single-file previews.
  $('link[rel="stylesheet"]').remove();
  $('head').append(`<style>${css}</style>`);
  $('script[src="./main.js"]').remove();
  $('body').append(`<script>${runtime}</script>`);
  const portable=path.join(project,'workspace',`Biology30_Chapter${chapter}.html`);
  fs.writeFileSync(portable,$.html());
  const metadataPath=path.join(project,'meta/project.json');
  const meta=JSON.parse(fs.readFileSync(metadataPath,'utf8'));
  meta.title=`Biology 30 - Chapter ${chapter}`;
  meta.canonicalEntry=`projects/${slug}/workspace/index.html`;
  meta.canonicalSources=['index.html','styles.css','main.js'].map(n=>`projects/${slug}/workspace/${n}`);
  meta.generatedOutputs=[`projects/${slug}/workspace/Biology30_Chapter${chapter}.html`];
  meta.exportTargets=meta.exportTargets.map(t=>({...t,enabled:false,notes:'Imported local presentation candidate; rollout deferred.'}));
  meta.sourceOfTruthNotes+=' Presentation aligned to Chapter 11; portable HTML is derived. Preserve inline non-executable course-data/textbook-data blocks; generic reimport merges these incorrectly.';
  fs.writeFileSync(metadataPath,JSON.stringify(meta,null,2)+'\n');
  const before=load(source),after=load(fs.readFileSync(path.join(project,'workspace/index.html'),'utf8'));
  for(const id of ['course-data','textbook-data'])if(before(`#${id}`).text()!==after(`#${id}`).text())throw Error(`Changed ${id}`);
  fs.writeFileSync(path.join(project,'meta/presentation-alignment.json'),JSON.stringify({schemaVersion:1,reference:'biology30-unit-a-pilot-3',sourceSha256:hash(source),referenceStylesSha256:hash(base),runtimeSha256:hash(runtime),courseDataPreserved:true,textbookDataPreserved:true,fonts:'Exact reference font bytes embedded locally',status:'local-build-candidate',deferred:['Full content/science review','Project E2E','Studio readiness','SCORM and Brightspace','Deployment']},null,2)+'\n');
  console.log(`${slug}: reference styling applied; source data/runtime preserved; portable preview ready.`);
}
