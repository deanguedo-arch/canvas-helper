import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

// These declared legacy snapshots are canonical. Their old builders are quarantined.
export const projects = ['ela30-1-modern-drama','ela30-1-shakespeare-othello','ela30-1-short-stories'];
const sha = text => createHash('sha256').update(text).digest('hex');
export function prepareLocalTheme(html) {
  const match = html.match(/<script\b[^>]*id=["']tailwind-config["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw Error('Expected original Tailwind theme not found');
  const holder = {};
  vm.runInNewContext(match[1], { tailwind:holder }, { timeout:1000 });
  if (!holder.config?.theme) throw Error('Original theme is unavailable');
  return holder.config;
}
export function replaceRemoteTheme(html) {
  return html.replace(/<script\b[^>]*src=["']https:\/\/cdn\.tailwindcss\.com[^"']*["'][^>]*>\s*<\/script>/gi,
    '<link rel="stylesheet" href="./assets/studio-local-theme/utilities.css" data-ela-local-utilities="tailwind-3.4.17">')
    .replace(/<script\b[^>]*id=["']tailwind-config["'][^>]*>[\s\S]*?<\/script>/i,
      '<!-- Original theme is preserved in assets/studio-local-theme/theme.json; no CDN runtime is required. -->');
}
async function main() {
  const args=process.argv.slice(2);
  if(args.length!==2||args[0]!=='--project'||!projects.includes(args[1]))throw Error('Use --project with one of the three declared ELA 30-1 legacy snapshots.');
  const slug=args[1], root=path.resolve('projects',slug), entry=path.join(root,'workspace/index.html'), metaPath=path.join(root,'meta/project.json');
  const metadataText=await fs.readFile(metaPath,'utf8');
  const meta=JSON.parse(metadataText);
  if(meta.authoring?.driverId!=='legacy-snapshot-v1')throw Error('Refusing to rewrite a factory or undeclared source');
  const html=await fs.readFile(entry,'utf8');
  const assets=path.join(root,'workspace/assets/studio-local-theme'), reportRoot=path.join(root,'meta/studio-population-sweep');
  const alreadyLocal=html.includes('data-ela-local-utilities=');
  const theme=alreadyLocal?JSON.parse(await fs.readFile(path.join(assets,'theme.json'),'utf8')):prepareLocalTheme(html);
  const patched=alreadyLocal?html:replaceRemoteTheme(html);
  const body=html.slice(html.indexOf('<body'));
  if(patched.slice(patched.indexOf('<body'))!==body)throw Error('Learner content or runtime changed');
  const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'ela-local-theme-'));
  try {
    const input=path.join(temporary,'input.css'), config=path.join(temporary,'config.cjs'), output=path.join(temporary,'utilities.css');
    await fs.writeFile(input,'@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
    await fs.writeFile(config,'module.exports = '+JSON.stringify({...theme,content:[entry]})+';\n');
    execFileSync('npm',['exec','--yes','--package=tailwindcss@3.4.17','--','tailwindcss','-i',input,'-c',config,'-o',output,'--minify'],{stdio:['ignore','pipe','pipe'],timeout:120000});
    const css=await fs.readFile(output,'utf8');
    if(!css.includes('.fixed{position:fixed}')||!css.includes('.flex{display:flex}'))throw Error('Required layout classes absent');
    if(sha(await fs.readFile(entry,'utf8'))!==sha(html))throw Error('Source changed during compilation; no HTML was applied');
    if(sha(await fs.readFile(metaPath,'utf8'))!==sha(metadataText))throw Error('Metadata changed during compilation; no repair was applied');
    await fs.mkdir(assets,{recursive:true});await fs.mkdir(reportRoot,{recursive:true});
    const backup=path.join(reportRoot,'index.before-local-theme.html');
    if(!alreadyLocal)try{await fs.writeFile(backup,html,{flag:'wx'});}catch(e){if(e.code!=='EEXIST')throw e; if(sha(await fs.readFile(backup,'utf8'))!==sha(html))throw Error('Existing backup belongs to a different source');}
    await fs.writeFile(path.join(assets,'theme.json'),JSON.stringify(theme,null,2)+'\n');
    await fs.writeFile(path.join(assets,'utilities.css'),css);
    await fs.writeFile(entry,patched);
    const sourcePrefix=`projects/${slug}/workspace/assets/studio-local-theme/`;
    meta.canonicalSources=[...new Set([...(meta.canonicalSources||[]),sourcePrefix+'theme.json'])];
    meta.generatedOutputs=[...new Set([...(meta.generatedOutputs||[]),sourcePrefix+'utilities.css'])];
    meta.regenerateCommand=`node scripts/repair-ela-snapshot-styles.mjs --project ${slug}`;
    if(!(meta.sourceOfTruthNotes||'').includes('Studio layout repair:'))meta.sourceOfTruthNotes=(meta.sourceOfTruthNotes||'')+' Studio layout repair: utility CSS is compiled locally from the preserved theme with scripts/repair-ela-snapshot-styles.mjs; the snapshot remains canonical and the old English builder remains quarantined.';
    await fs.writeFile(metaPath,JSON.stringify(meta,null,2)+'\n');
    await fs.writeFile(path.join(reportRoot,'local-theme-repair.json'),JSON.stringify({slug,compiler:'tailwindcss@3.4.17',beforeSha256:sha(html),afterSha256:sha(patched),bodySha256:sha(body),learnerBodyUnchanged:true,utilitiesSha256:sha(css),remoteRuntimeRemoved:true,backup:path.relative(process.cwd(),backup)},null,2)+'\n');
    console.log(`${slug}: local CSS ${Buffer.byteLength(css)} bytes; learner body and saved-state code unchanged`);
  }finally{await fs.rm(temporary,{recursive:true,force:true});}
}
if(import.meta.url===new URL(process.argv[1],'file://').href)await main();
