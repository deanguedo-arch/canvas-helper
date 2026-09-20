const {chromium}=require('playwright');
const assert=require('node:assert/strict'), path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch();
 try {
 for(const width of [1302,390]) for(const phase of [1,2,3,4]) {
  const page=await browser.newPage({viewport:{width,height:907}});
  await page.goto(pathToFileURL(path.resolve(`projects/sportswellness-phase-${phase}/workspace/index.html`)).href+'#performance-game');
  const iframe=page.locator('#performance-game iframe');
  await iframe.waitFor();
  const frame=await iframe.elementHandle().then(h=>h.contentFrame());
  await frame.locator('#root').waitFor();
  await page.waitForTimeout(500);
  const start=phase===1?frame.getByRole('button',{name:/Start round/i}):frame.locator('#game-start');
  const intro=await frame.evaluate(()=>({height:innerHeight,body:document.body.getBoundingClientRect().height}));
  assert(intro.body<=intro.height+1,'Intro must fit the iframe');
  await start.click();
  await page.waitForTimeout(350);
  const bounds=await frame.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,bodyHeight:document.body.getBoundingClientRect().height,rootHeight:document.querySelector('#root').getBoundingClientRect().height}));
  assert(bounds.bodyHeight<=bounds.height+1,JSON.stringify({phase,width,...bounds}));
  assert(bounds.scrollWidth<=bounds.width+1,JSON.stringify({phase,width,...bounds}));
  assert(bounds.rootHeight>360,'Arena must retain playable height');
  await iframe.scrollIntoViewIfNeeded();
  if(width===1302) await page.screenshot({path:`projects/sportswellness-phase-${phase}/meta/game-sizing.png`});
  console.log(JSON.stringify({phase,width,...bounds}));
  if(phase>1) {
   await frame.locator('#game-pause').click();
   await page.waitForTimeout(150);
   await frame.locator('#game-resume').click();
   await page.waitForTimeout(150);
   await frame.locator('#game-end').click();
   await page.waitForTimeout(150);
   const ended=await frame.evaluate(()=>({height:innerHeight,body:document.body.getBoundingClientRect().height}));
   assert(ended.body<=ended.height+1,'End summary must fit the iframe');
  }
  await page.close();
 }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
