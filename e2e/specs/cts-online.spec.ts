import {expect,test} from '@playwright/test';
import {readFile,mkdir} from 'node:fs/promises';
import {openProjectInStudio} from '../lib/project-open';
const slugs=['marketing-10-20-online','marketing-30-online','legal-studies-30-online','tourism-10-20-online','tourism-30-online'];
for(const slug of slugs)test('@cts-online '+slug+' complete routes, independent work and persistence',async({page})=>{
 test.setTimeout(180000);
 const failures:string[]=[];page.on('pageerror',e=>failures.push(e.message));
 await page.setViewportSize({width:1440,height:1000});await openProjectInStudio(page,slug);
 const dir=`projects/${slug}/meta/visual-review`;await mkdir(dir,{recursive:true});
 await page.screenshot({path:dir+'/studio.png'});
 const studioFrame=page.frameLocator('[data-testid="workspace-preview-frame"]');
 for(const r of ['overview','how-it-works','modules','practice','projects','portfolio','resources']){
  await studioFrame.locator('[data-nav="'+r+'"]').click();
  await expect(studioFrame.locator('#'+r+' h1')).toBeVisible();
  await page.screenshot({path:dir+'/studio-'+r+'.png'});
  expect(await studioFrame.locator('#'+r+' h1').evaluate(n=>n.getBoundingClientRect().top)).toBeGreaterThan(50);
 }
 const src=await page.getByTestId('workspace-preview-frame').getAttribute('src');expect(src).toBeTruthy();
 await page.goto(new URL(src!,page.url()).href);
 await page.evaluate(()=>{const w=window as any;localStorage.removeItem(w.CTSCourse.storageKey);});await page.reload();
 const config=await page.evaluate(()=>(window as any).CTSCourse.config);
 await page.goto(page.url().split('#')[0]+'#portfolio');await expect(page.locator('[data-empty-portfolio]')).toBeVisible();
 for(const route of config.routes){
  await page.goto(page.url().split('#')[0]+'#'+route);await expect(page.locator(`[data-route-panel]:visible`)).toHaveCount(1);
  await expect(page.locator('#'+route+' h1')).toBeVisible();
  expect(await page.locator('img').evaluateAll(nodes=>nodes.every(n=>(n as HTMLImageElement).complete&&(n as HTMLImageElement).naturalWidth>0))).toBeTruthy();
  await page.screenshot({path:dir+'/'+route+'.png'});
 }
 const id=config.ids[0],route='module-'+id;
 await page.goto(page.url().split('#')[0]+'#'+route);
 await page.locator('.lesson-nav a').nth(1).click();await expect(page.locator('#lesson-'+id+'-2')).toBeInViewport();
 const form=page.locator(`[data-draft="${id}"]`),save=page.locator(`[data-save-portfolio="${id}"]`);
 await expect(save).toBeDisabled();
 const fields=form.locator('textarea');for(let i=0;i<await fields.count();i++)await fields.nth(i).fill('Fictional review response '+i+': a clear decision with evidence and an explained revision.');
 await expect(save).toBeEnabled();await save.click();await expect(save).toHaveText('Saved to Portfolio');
 await page.reload();await expect(save).toHaveAttribute('aria-pressed','true');
 await fields.first().fill('');await expect(page.locator(`[data-draft-status="${id}"]`)).toContainText('in progress');
 await page.goto(page.url().split('#')[0]+'#portfolio');await expect(page.locator('[data-saved-item]')).toHaveCount(1);await expect(page.locator('[data-saved-item]')).toContainText('Draft in progress');
 await page.screenshot({path:dir+'/saved-incomplete.png',fullPage:true});
 const before=await page.evaluate(()=>(window as any).CTSCourse.serialize());
 await page.locator('#restore').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from(before.replace(slug,'another-course'))});
 await expect(page.locator('#restore-message')).toContainText('not restored');expect(await page.evaluate(()=>(window as any).CTSCourse.serialize())).toBe(before);
 await page.locator('#restore').setInputFiles({name:'good.json',mimeType:'application/json',buffer:Buffer.from(before)});await expect(page.locator('#restore-message')).toContainText('successfully');
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-backup]').click();const dl=await downloadPromise;const backup=await readFile((await dl.path())!,'utf8');expect(JSON.parse(backup).portfolioIds).toEqual([id]);
 await page.evaluate(()=>{(window as any).print=()=>{(window as any).__printed=document.getElementById('print-root')!.textContent;};});
 await page.locator('[data-print="portfolio"]').click();const printed=await page.evaluate(()=>(window as any).__printed);expect(printed).toContain('Evidence summary');expect(printed).toContain('No response yet.');expect(printed).not.toContain('Restore a course backup');expect(await page.locator('#print-root [data-saved-item]').count()).toBe(1);
 await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 // Every module and project has its own gated, live-linked Portfolio record.
 for(const key of config.ids){
  const target=(config.projects.includes(key)?'project-':'module-')+key;
  await page.goto(page.url().split('#')[0]+'#'+target);
  const draft=page.locator('[data-draft="'+key+'"]'),controls=draft.locator('textarea');
  for(let i=0;i<await controls.count();i++)await controls.nth(i).fill(key+' response '+i+': original evidence file; eligibility confirmation pending where required.');
  const button=page.locator('[data-save-portfolio="'+key+'"]');
  if(await button.isEnabled()){await button.focus();await page.keyboard.press('Enter');}
  await expect(button).toHaveAttribute('aria-pressed','true');
 }
 await page.goto(page.url().split('#')[0]+'#portfolio');await expect(page.locator('[data-saved-item]')).toHaveCount(config.ids.length);
 await page.screenshot({path:dir+'/all-saved.png',fullPage:true});
 const complete=await page.evaluate(()=>(window as any).CTSCourse.serialize());
 await page.reload();await expect(page.locator('[data-saved-item]')).toHaveCount(config.ids.length);
 await page.locator('#restore').setInputFiles({name:'complete.json',mimeType:'application/json',buffer:Buffer.from(complete)});
 await expect(page.locator('#restore-message')).toContainText('successfully');
 await page.goto(page.url().split('#')[0]+'#'+route);await fields.first().fill('Updated after saving — current draft remains linked.');
 await page.evaluate(()=>{(window as any).print=()=>{(window as any).__printed=document.getElementById('print-root')!.textContent;};});
 await page.locator('[data-print="'+route+'"]').click();expect(await page.locator('#print-root').textContent()).toContain('Updated after saving');expect(await page.locator('#print-root').textContent()).not.toContain('Practise the decision');await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
 await page.goto(page.url().split('#')[0]+'#portfolio');await expect(page.locator('[data-saved-item="'+id+'"]')).toContainText('Updated after saving');
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async(text:string)=>{(window as any).__copied=text;}}});});
 await page.locator('[data-copy]').click();expect(await page.evaluate(()=>(window as any).__copied)).toContain(config.ids.at(-1));
 await page.goto(page.url().split('#')[0]+'#'+route);
 const q=page.locator(`[data-module="${id}"][data-question="decision"]`);await q.locator('button').click();await expect(q.locator('output')).toContainText('Choose');
 const correct=Number(await q.getAttribute('data-correct'));await q.locator('input').nth((correct+1)%3).check();await q.locator('button').click();await expect(q.locator('output')).toContainText('Try again');await q.locator('input').nth(correct).check();await q.locator('button').click();await expect(q.locator('output')).toContainText('Reasoning check');
 await page.goto(page.url().split('#')[0]+'#practice');await page.getByLabel('Percentage part',{exact:true}).fill('10');await page.getByLabel('Percentage total',{exact:true}).fill('40');await page.getByRole('button',{name:'Calculate percentage',exact:true}).click();await expect(page.locator('[data-calculator="percentage"] output')).toContainText('25.00');
 await page.getByLabel('Percentage total',{exact:true}).fill('0');await page.getByRole('button',{name:'Calculate percentage',exact:true}).click();await expect(page.locator('[data-calculator="percentage"] output')).toContainText('greater than zero');
 await page.setViewportSize({width:390,height:844});
 for(const r of config.routes){await page.goto(page.url().split('#')[0]+'#'+r);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),r+' fits mobile').toBeTruthy();await page.screenshot({path:dir+'/mobile-'+r+'.png'});}
 await page.locator('#menu-toggle').click();await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Escape');await expect(page.locator('#menu-toggle')).toBeFocused();await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded','false');
 await page.evaluate(()=>localStorage.setItem((window as any).CTSCourse.storageKey,'{broken'));await page.reload();await expect(page.locator('#recovery-message')).toContainText('stored value is unchanged');
 await expect(page.locator('#recovery-message')).toBeInViewport();
 await expect.poll(()=>page.locator('#recovery-message').evaluate(n=>n.getBoundingClientRect().top)).toBeGreaterThan(72);
 await page.screenshot({path:dir+'/corrupt-state.png'});expect(failures).toEqual([]);
 await page.goto('file://'+process.cwd()+'/projects/'+slug+'/workspace/index.html#overview');
 await expect(page.locator('#overview h1')).toBeVisible();
 await page.locator('#menu-toggle').click();await page.locator('[data-nav="overview"]').click();
 expect(await page.locator('#overview h1').evaluate(n=>n.getBoundingClientRect().top)).toBeGreaterThan(50);
 await page.screenshot({path:dir+'/direct-file-mobile.png'});
 expect(failures).toEqual([]);
});
