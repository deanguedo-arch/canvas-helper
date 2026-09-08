import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {inspectTopicInputs} from '../lib/biology30-course/v1/pilot2-inputs.js';
import {renderTopicCourse} from '../lib/biology30-course/v1/pilot2-render-course.js';
const root=process.cwd();
test('all actual B/C/D pages preserve A organization, lesson sequence and complete activity identities',async()=>{
 const a=load(await readFile('projects/biology30-unit-a-pilot-2/workspace/index.html','utf8'));
 const groups=a('.nav-group>summary span').map((_,n)=>a(n).text()).get();
 assert.deepEqual(groups,['Start','Learn','Practice & Review','Process Collection','Resources']);
 for(const unit of ['B','C','D'] as const){const input=await inspectTopicInputs(root,unit),rendered=renderTopicCourse(input,input.legacySchema),$=load(rendered.html);
  assert.deepEqual($('.nav-group>summary span').map((_,n)=>$(n).text()).get(),groups);
  for(const selector of ['.overview-hero','.overview-intro','.chapter-roadmap','.sidebar-exit','.vocabulary-tools','.vocabulary-index','.vocabulary-reader'])assert.equal($(selector).length,1,unit+selector);
  const prefix=unit.toLowerCase();
  assert.deepEqual($('.nav-group').eq(3).find('.nav-link').map((_,n)=>$(n).text()).get(),a('.nav-group').eq(3).find('.nav-link').map((_,n)=>a(n).text()).get());
  assert.deepEqual($('.nav-group').eq(4).find('.nav-link').map((_,n)=>$(n).text()).get(),a('.nav-group').eq(4).find('.nav-link').map((_,n)=>a(n).text()).get());
  assert.equal($(`#${prefix}-final-practice .final-challenge #${prefix}-diploma-challenge`).length,1);
  assert.equal($(`#${prefix}-all-my-work #${prefix}-notes [data-pilot2-response]`).length,1);
  assert.equal($(`#${prefix}-all-my-work #${prefix}-investigations`).length,1);
  for(const selector of ['.collection-shortcuts','.collection-heading','[data-p2-work-chapter]','.advanced-index','.advanced-progress','.library-tabs','.library-select','.glossary-list','.data-reference','.review-orientation','.seminar-sessions'])assert.ok($(selector).length,prefix+selector);
  assert.equal($(`#${prefix}-sources-and-credits .page-header h1`).text(),'Sources and Credits');
  assert.equal($(`#${prefix}-textbook #${prefix}-sources`).length,0);
  for(const group of input.textbookGroups.filter(g=>g.textbookUnit)){assert.equal($(`#${prefix}-textbook [data-p2-panel-target="${group.id}"]`).text(),`Unit ${group.textbookUnit} Review`);assert.ok($(`#${group.id} iframe`).attr('src')!.endsWith(`#page=${group.items[0].physicalPage}`));}
  assert.equal($('.nav-chapter').length,new Set(input.topic.contract.topics.map(t=>t.chapter)).size);
  for(const topic of input.topic.contract.topics){const page=$(`#${topic.id}`),html=page.html()!;
   assert.equal(page.find('.lesson-words>dl>div').length,4,topic.id);
   assert.equal(page.find('.lesson-term-inventory').length,1);assert.equal(page.find('.goal-strip>div').length,2);assert.equal(page.find('.textbook-band a').length,1);
   assert.ok(html.lastIndexOf('-teaching"')<html.indexOf(`id="${topic.id}-retrieval"`),'teach before retrieval '+topic.id);
   assert.equal(page.find('[data-pilot2-practice]').length,2);assert.equal(page.find('details.p2-advanced[open]').length,0);
   for(const part of topic.parts){const original=input.topic.core.parts.find(p=>p.id===part.id)!;assert.deepEqual(page.find(`#${part.id}-teaching>p`).map((_,n)=>$(n).text()).get(),original.paragraphs);}
  }
  for(const entry of rendered.index)assert.equal($(`#${entry.routeId}`).find(`[id="${entry.focusId}"]`).length,1,entry.id);
  assert.equal($('[data-p2-family-target]').length,input.topic.vocabulary.conceptFamilies.length);
  assert.equal($('[data-p2-family-panel]').length,input.topic.vocabulary.conceptFamilies.length);
  for(const group of input.textbookGroups){const route=group.chapter?`${unit.toLowerCase()}-chapter-${group.chapter}-practice`:`${unit.toLowerCase()}-final-practice`,html=$(`#${route}`).html()!;assert.ok(html.indexOf('textbook-review-support')<html.indexOf('data-pilot2-practice='),'textbook before questions');}
  assert.deepEqual($('[data-pilot2-response]').map((_,n)=>$(n).attr('data-pilot2-response')).get().sort(),Object.keys(input.topic.state.responses).filter(id=>!input.topic.graphs?.some(g=>g.responseId===id)).sort());
 }
});
