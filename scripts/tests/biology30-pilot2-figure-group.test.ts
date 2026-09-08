import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {createServer} from 'node:http';
import path from 'node:path';
import {chromium,firefox,webkit,expect} from '@playwright/test';
import {build} from 'esbuild';
import {renderTopicFigure,TOPIC_COMPONENT_CSS,type TopicFigure} from '../lib/biology30-course/v1/pilot2-render-topic.js';
import {TOPIC_FIGURE_VIEWER_CSS} from '../lib/biology30-course/v1/pilot2-figure-viewer.js';
import {rendererFixture} from './fixtures/biology30-pilot2/renderer.js';
const group=():TopicFigure=>{const source=rendererFixture().figures[0];return{...source,caption:'Two synthetic observation panels',equivalentExplanation:'Read each symbol before comparing.',comparisonGuide:'The first panel shows A; the second shows B.',panels:[{...source,src:'assets/a.svg',caption:'Panel A'},{...source,src:'assets/b.svg',caption:'Panel B'}]};};
test('figure groups retain separate originals, unique repeated IDs and initially closed comparison',()=>{
 const g=group(),$=load(renderTopicFigure(g)+renderTopicFigure(g,'-walkthrough'));
 const ids=$('[id]').map((_i,node)=>$(node).attr('id')).get();assert.equal(new Set(ids).size,ids.length);assert.equal($('img').length,4);assert.equal($('[data-pilot2-enlarge]').length,4);assert.equal($('details[open]').length,0);assert.equal($('img[src="assets/b.svg"]').length,2);
 assert.throws(()=>renderTopicFigure({...g,panels:[g.panels![0],g.panels![0]]}),/Invalid/);assert.throws(()=>renderTopicFigure({...g,panels:[{...g.panels![0],src:'https://unreviewed.invalid/x.png'},g.panels![1]]}),/unsafe/);
});
for(const type of [chromium,firefox,webkit])test(`individual group enlargement and comparison in ${type.name()}`,async()=>{
 const script=(await build({stdin:{contents:`import {mountTopicFigureViewer} from ${JSON.stringify(path.resolve('scripts/lib/biology30-course/v1/pilot2-figure-viewer.ts'))};mountTopicFigureViewer(document.body);`,loader:'ts',resolveDir:process.cwd()},bundle:true,write:false,format:'iife',platform:'browser'})).outputFiles[0].text;
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial;margin:16px}${TOPIC_COMPONENT_CSS}${TOPIC_FIGURE_VIEWER_CSS}</style><body>${renderTopicFigure(group())}<script src="/entry.js"></script></body></html>`;
 const server=createServer((req,res)=>{if(req.url?.endsWith('.svg')){res.setHeader('Content-Type','image/svg+xml');res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="200"><text x="90" y="110" font-size="70">${req.url.includes('/a.')?'A':'B'}</text></svg>`);}else{res.setHeader('Content-Type',req.url==='/entry.js'?'text/javascript':'text/html');res.end(req.url==='/entry.js'?script:html);}});await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');const browser=await type.launch();
 try{const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto(`http://127.0.0.1:${address.port}`);await expect(page.locator('.p2-figure-comparison p')).toBeHidden();for(const [index,letter]of ['a','b'].entries()){const button=page.locator('[data-pilot2-enlarge]').nth(index);await button.click();await expect(page.locator('dialog img')).toHaveAttribute('src',new RegExp(`/assets/${letter}\\.svg$`));await page.getByLabel('Show original size').check();await expect(page.locator('.p2-figure-viewport')).toHaveClass(/p2-figure-original/);await page.keyboard.press('Escape');await expect(button).toBeFocused();}await page.locator('.p2-figure-comparison summary').click();await expect(page.locator('.p2-figure-comparison p')).toBeVisible();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}finally{await browser.close();await new Promise<void>((r,j)=>server.close(error=>error?j(error):r()));}
});
