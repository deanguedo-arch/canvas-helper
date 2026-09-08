import {LESSON_VIDEO_PLACEMENTS} from '../lib/biology30-course/v1/pilot2-video-placement.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {inspectTopicInputs} from '../lib/biology30-course/v1/pilot2-inputs.js';
import {renderTopicCourse} from '../lib/biology30-course/v1/pilot2-render-course.js';
import {emptyTopicState,encodeTopicState,decodeTopicState} from '../lib/biology30-course/v1/pilot2-state.js';
test('PowerPoint source video inventory is complete without claiming reviewed clip acceptance',async()=>{
 const source=JSON.parse(await readFile('projects/resources/biology30-production/v1/pilot2/intake/7783e714077e56dcb6c423d61903d577a7decc4756cb38ace124679b279fbf13/videos.json','utf8'));
 for(const unit of ['B','C','D'] as const){const input=await inspectTopicInputs(process.cwd(),unit),$=load(renderTopicCourse(input,input.legacySchema).html);const expected=source.filter((v:any)=>v.occurrences.some((o:any)=>o.unit===unit)).map((v:any)=>v.id).sort();assert.deepEqual(input.sourceVideos!.map(v=>v.videoId).sort(),expected);assert.deepEqual([...new Set(input.sourceVideos!.map(v=>v.chapter))].sort(),unit==='B'?[14,15]:unit==='C'?[16,17,18]:[19,20]);if(unit==='C')assert.equal(input.sourceVideos!.find(v=>v.videoId==='IePMXxQ-KWY')!.topics[0].id,'c-topic-chromosomes-and-dna');assert.equal(input.videos.length,0,'source resources must not silently become reviewed equivalent clips');assert.equal($('.video-playlist [data-p2-panel-target]').length,expected.length);for(const v of input.sourceVideos!){assert.equal($(`.video-library-layout [data-p2-source-video="${v.videoId}"] a[href="https://www.youtube.com/watch?v=${v.videoId}"]`).length,1);for(const t of v.topics){const placement=LESSON_VIDEO_PLACEMENTS[t.id],chosen=placement?.videoId===v.videoId;assert.equal($(`#${t.id} .lesson-source-videos [data-p2-source-video="${v.videoId}"]`).length,chosen?1:0);if(chosen){const part=input.topic.contract.topics.find(x=>x.id===t.id)!.parts[placement.part],block=$(`[id="${t.id}-source-video-${v.videoId}"]`);assert.equal(block.parent().attr('id'),part.id);assert.equal(block.prev().hasClass('lesson-block'),true);assert.equal(block.next().hasClass('worked-example'),true);assert.ok(block.text().includes(placement.watchFor));assert.ok(block.find(`[data-pilot2-return-focus="${t.id}-walkthrough"]`).length);}}}

 const state=emptyTopicState(input.topic.state),first=Object.keys(input.topic.state.families.responseIds)[0];const old=encodeTopicState(state,input.topic.state);assert.equal(encodeTopicState(decodeTopicState(old,input.topic.state),input.topic.state),old);state.vocabularyActiveId=first;const restored=decodeTopicState(encodeTopicState(state,input.topic.state),input.topic.state);assert.equal(restored.vocabularyActiveId,first);state.vocabularyActiveId='wrong-family';assert.throws(()=>encodeTopicState(state,input.topic.state),/active vocabulary/);
 }
});
