import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {rendererFixture,textbookFixture,investigationFixture,seminarFixture,studyFixture} from './fixtures/biology30-pilot2/renderer.js';
import {renderTopicInvestigation} from '../lib/biology30-course/v1/pilot2-render-investigation.js';
import {renderTopicSeminar,renderTopicPracticePage} from '../lib/biology30-course/v1/pilot2-render-review.js';
import {renderTopicGlossary,renderTopicAdvancedIndex,renderTopicTextbookPage,renderTopicNotes} from '../lib/biology30-course/v1/pilot2-render-reference.js';
import {currentTopicWork,collectedWorkText} from '../lib/biology30-course/v1/pilot2-collection-view.js';
import {emptyTopicState,encodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';

test('investigation keeps sources distinct and rejects unbound images or premature guide access',()=>{
 const input=rendererFixture(),item=investigationFixture(input.state),html=renderTopicInvestigation(item,input.contract,input.state,[],[]),$=load(html);
 assert.equal($('[data-pilot2-response]').length,4);assert.equal($('[data-pilot2-group-compare][disabled]').length,2);assert.equal($('#b-investigation-fixture-overall-guide[hidden]').length,1);
 assert.equal($('#b-investigation-fixture-observations-overall-guide[hidden] table').length,2);
 assert.ok(html.indexOf('data-pilot2-response')<html.indexOf('<table'));
 assert.throws(()=>renderTopicInvestigation({...item,materialFiles:[{path:'missing.png',sha256:'0'.repeat(64),role:'observations'}]},input.contract,input.state,[],[]),/Missing exact investigation material/);
 assert.throws(()=>renderTopicInvestigation({...item,investigationExtensionRequired:true},input.contract,input.state,[],[]),/contract drift/);
});
test('review and optional reference pages preserve exact targets and existing response identities',()=>{
 const input=rendererFixture(),seminar=seminarFixture(input.state);input.state.responses['b-process-note']={token:'nt',limit:600};input.state.routes.push('b-textbook','b-chapter-14-practice');
 const book=textbookFixture(),glossary=renderTopicGlossary({...input.vocabulary,preservedGlossaryEntries:[{term:'Archived term',definition:'A preserved definition.'}]},input.contract);
 const html=renderTopicSeminar(seminar,input.state)+renderTopicAdvancedIndex(input.contract,input.instruction)+renderTopicTextbookPage([{id:'fixture-book-group',chapter:14,textbookUnit:null,items:[book]}],input.contract,input.state)+glossary+renderTopicNotes(input.state),$=load(html),ids=$('[id]').map((_i,node)=>$(node).attr('id')).get();
 assert.equal(new Set(ids).size,ids.length);assert.equal($('[data-pilot2-response]').length,4);assert.equal($('[data-pilot2-response="b-process-note"]').length,1);assert.equal($('[data-pilot2-return-focus="b-topic-fixture-comparison-advanced"]').length,1);assert.equal($('[data-pilot2-glossary-term]').length,2);assert.equal($('details[open]').length,0);assert.equal($('[data-pilot2-textbook-attempt]').length,0);assert.equal($('[data-pilot2-return-route="b-chapter-14-practice"][data-pilot2-return-focus="fixture-textbook"]').length,1);
 assert.equal($('[data-pilot2-collect="b-review-seminar-saved"]').attr('data-pilot2-requires'),seminar.activities.map(item=>item.id).join(' '));
 assert.throws(()=>renderTopicPracticePage('Wrong route','b-models',input.practice,input.state),/route inventory drift/);
});
test('copy display preserves oversized writing without loosening the save schema',()=>{
 const {schema,index}=studyFixture(),state=emptyTopicState(schema),before=structuredClone(schema);state.responses['model-explanation']='Oversized draft '+ 'x'.repeat(300);
 const text=collectedWorkText(currentTopicWork(index,state,schema));assert.ok(text.includes(state.responses['model-explanation']));assert.deepEqual(schema,before);assert.throws(()=>encodeTopicState(state,schema));
 state.responses['unknown-field']='Do not silently drop me';assert.throws(()=>currentTopicWork(index,state,schema));
});
