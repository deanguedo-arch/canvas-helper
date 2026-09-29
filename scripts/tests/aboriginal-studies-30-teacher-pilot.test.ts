import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root='projects/aboriginal-studies-30/';
type RecordValue = Record<string, any>;
const context: {window: RecordValue}={window:{}};
vm.createContext(context);
for(const file of ['course-data.js','lesson-components.js','practice-data.js'])vm.runInContext(fs.readFileSync(root+'workspace/'+file,'utf8'),context);
const api=context.window.AB30LessonBlocks;
const lessons: RecordValue[]=context.window.ABORIGINAL_STUDIES_30_DATA.units.flatMap((u: RecordValue)=>u.lessons);
const baseline=JSON.parse(fs.readFileSync(root+'meta/ab30-v2/teacher-voice-pilot/before/source-records.json','utf8')).lessons;
const ids=Object.keys(baseline);
const normalized=(x: unknown)=>JSON.parse(JSON.stringify(x));

test('Pilot readings retain every original quotation, locator, author and context record',()=>{
  for(const id of ids){
    const lesson=lessons.find(l=>l.id===id);
    assert(lesson, id);
    assert.deepEqual(normalized(api.validateLessonBlocks(lesson.blocks)),[]);
    const passages=lesson.blocks.filter((b: RecordValue)=>b.type==='source').flatMap((b: RecordValue)=>b.passages||[b]);
    assert.equal(passages.length,baseline[id].length);
    for(const original of baseline[id]){
      const passage=passages.find((p: RecordValue)=>p.extract===original.extract);
      assert(passage,`${id}: original quotation retained`);
      for(const field of ['creator','speaker','date','locator','attribution','sourceType','contextLimits'])assert.equal(passage[field],original[field],`${id}: ${field}`);
      assert.match(passage.sourceId,/^L\d+-[A-F]\d?$/);
    }
    const html=api.renderBlocks(lesson.blocks,{teacherVoice:true,assignmentHref:(id: string)=>'?section=assignment&assignment='+id});
    assert.doesNotMatch(html,/\bSources?\s+[A-F]\d?\b/,'no unexplained source letters in rendered teaching or criteria');
    assert.doesNotMatch(html,/How this differs:/,'authoring rationale stays out of the learner view');
    assert.doesNotMatch(html,/About this reading/,'provenance disclosures stay out of the student lesson');
  }
});

test('All 50 lessons use recognizable reading names while preserving every source record',()=>{
  assert.equal(lessons.length,50);
  let sourceCount=0;
  for(const lesson of lessons){
    const original=normalized(lesson.blocks);
    const sources=lesson.blocks.filter((b: RecordValue)=>b.type==='source');
    sourceCount+=sources.length;
    const presented=api.presentTeacherBlocks(lesson.blocks);
    assert.deepEqual(normalized(lesson.blocks),original,`${lesson.id}: presentation does not mutate canonical blocks`);
    assert.equal(presented.filter((b: RecordValue)=>b.type==='source').length,sources.length,`${lesson.id}: every source remains represented`);
    for(let index=0;index<sources.length;index+=1){
      const before=sources[index], after=presented.filter((b: RecordValue)=>b.type==='source')[index];
      for(const field of ['extract','creator','speaker','nation','date','sourceType','locator','attribution','sourceId']){
        assert.equal(after[field],before[field],`${lesson.id}: ${field} remains canonical`);
      }
      assert.doesNotMatch(after.title,/^Source\s+[A-Z]/,`${lesson.id}: reading has a recognizable display name`);
    }
    const html=api.renderBlocks(lesson.blocks,{teacherVoice:true,lessonTitle:lesson.title,assignmentHref:(id: string)=>'?section=assignment&assignment='+id});
    assert.doesNotMatch(html,/\bSources?\s+[A-Z]{1,2}\d?\b/,`${lesson.id}: no unexplained source labels`);
    assert.doesNotMatch(html,/>Textbook reading(?:, page \d+)?</,`${lesson.id}: page locators are not headings`);
    assert.doesNotMatch(html,/published document extract<\//,`${lesson.id}: source types are not headings`);
    assert.doesNotMatch(html,/<section class="reading-group"[^>]*><h2>Reading:/,`${lesson.id}: topic headings read as lesson language, not a generic content label`);
    assert.doesNotMatch(html,/<section class="reading-group"[^>]*><h2>[^<]*(?:as reproduced|as quoted|as excerpted|Contemporary Issues textbook authors)[^<]*<\/h2>/i,`${lesson.id}: citations and provenance stay out of student headings`);
    assert.doesNotMatch(html,/<section class="reading-group"[^>]*><h2>[^<]*(?:the source|fresh dossier|doors into the machine|six blanks|biggest first|superior lens)[^<]*<\/h2>/i,`${lesson.id}: editorial shorthand is replaced with a topic students can identify`);
    assert.doesNotMatch(html,/About this reading/,`${lesson.id}: no provenance disclosure in student view`);
    assert.doesNotMatch(html,/block-incomplete/,`${lesson.id}: every block renders`);
  }
  assert.equal(sourceCount,581);
});

test('All practice items keep their saved-work identities while teacher presentation clarifies reading names',()=>{
  const items: RecordValue[]=context.window.AB30PracticeData.ITEMS;
  assert.equal(items.length,400);
  const lessonById=new Map(lessons.map((lesson: RecordValue)=>[lesson.id,lesson]));
  for(const item of items){
    const lesson=lessonById.get(item.lessonId);
    assert(lesson,`${item.itemId}: lesson exists`);
    const original=normalized(item);
    const shown=api.presentPracticeItem(item,lesson.blocks);
    assert.deepEqual(normalized(item),original,`${item.itemId}: canonical practice item is unchanged`);
    for(const field of ['itemId','contentVersion','lessonId','type','key','sourceId','stimulusId']){
      assert.equal(shown[field],item[field],`${item.itemId}: ${field} stays stable`);
    }
    if(item.options) assert.deepEqual(normalized(shown.options.map((option: RecordValue)=>option.id)),normalized(item.options.map((option: RecordValue)=>option.id)),`${item.itemId}: option identities stay stable`);
    const visible=JSON.stringify(shown);
    assert.doesNotMatch(visible,/\bSources?\s+[A-Z]{1,2}\d?\b/,`${item.itemId}: prompt and feedback name the reading`);
  }
});

test('Pilot retains response keys, assigned question homes and choice identities',()=>{
  const expected={
    't1-l01-oral-tradition':{keys:['supported-repair','independent-purpose'],questions:[],assignments:['oral-tradition'],item:'ab30-v2-l01-purpose-1'},
    't1-l02-nations-peoples':{keys:['supported-repair','independent-assertion'],questions:['q1','q2','q3','q4','q5','q6','q7','q8'],assignments:[],item:'ab30-v2-l02-match-1'},
    't2-l01-why-land-matters':{keys:['supported-repair','independent-treaty'],questions:['q1'],assignments:[],item:'ab30-v2-l24-emphasis-1'}
  };
  for(const [id,want] of Object.entries(expected)){
    const lesson=lessons.find(l=>l.id===id);
    assert(lesson, id);
    assert.deepEqual(normalized(lesson.bookletQuestionIds),want.questions);
    assert.deepEqual(normalized(lesson.assignmentIds),want.assignments);
    assert.deepEqual(normalized(lesson.blocks.filter((b: RecordValue)=>b.responseKey).map((b: RecordValue)=>b.responseKey)),want.keys.map(k=>id+'::'+k));
    const selection=lesson.blocks.find((b: RecordValue)=>b.type==='supportedSelection'),item=context.window.AB30PracticeData.itemById(want.item);
    assert.equal(selection.itemId,want.item);assert.equal(selection.key,'b');
    assert.deepEqual(normalized(selection.options.map((o: RecordValue)=>o.id)),['a','b','c']);
    assert.deepEqual(normalized(selection.options),normalized(item.options));
    assert.equal(selection.prompt,item.prompt);assert.deepEqual(normalized(selection.feedbackByOption),normalized(item.feedbackByOption));
  }
});

test('Annotated and grouped readings escape content; unsafe timeline links cannot render',()=>{
  const source={type:'source',readingStyle:'compact',title:'<script>bad</script>',extract:'A <img onerror=bad> B',locator:'Chapter 1, printed p. 2',annotations:[{phrase:'<img onerror=bad>',note:'<svg onload=bad>'}]};
  const html=api.renderBlock(source,0,{});
  assert(!html.includes('<script>'));assert(!html.includes('<img'));assert(!html.includes('<svg'));assert(!html.includes('<mark>'));assert.match(html,/A &lt;img onerror=bad&gt; B/);
  assert.match(html,/data-source-locator="Chapter 1, printed p. 2"/);
  const timeline=api.renderBlock({type:'timeline',title:'Dates',events:[{date:'2000',text:'<img onerror=bad>'}],sourceLinks:[{label:'bad',href:'javascript:alert(1)'}]},0,{});
  assert(!timeline.includes('href="javascript:'));assert(!timeline.includes('<img'));assert.match(timeline,/invalid-links/);
  assert.doesNotThrow(()=>api.renderBlock({type:'timeline',events:{},sourceLinks:{}},0,{}));
});

test('A direct lesson launch saves its route before any interaction, including after reload',async()=>{
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    for (const id of ids) {
      const url = pathToFileURL(path.resolve(root,'workspace/index.html'));
      url.search = new URLSearchParams({section:'lesson',unit:id.startsWith('t1')?'theme-1':'theme-2',lesson:id}).toString();
      await page.goto(url.href);
      await page.locator('[data-testid="lesson-heading"]').waitFor();
      assert.equal(await page.locator('[data-activity-save-status]').first().getAttribute('data-save-state'),'saved');
      const saved = await page.evaluate(()=>JSON.parse(localStorage.getItem('aboriginal-studies-30.ui') || '{}'));
      assert.equal(saved.activeLessonId,id);
      await page.reload();
      await page.locator('[data-testid="lesson-heading"]').waitFor();
      assert.equal(await page.locator('[data-activity-save-status]').first().getAttribute('data-save-state'),'saved');
    }
  } finally { await browser.close(); }
});
