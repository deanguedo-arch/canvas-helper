import test from 'node:test';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {courseFixture} from './fixtures/biology30-pilot2/renderer.js';
import {renderTopicCourse} from '../lib/biology30-course/v1/pilot2-render-course.js';
test('synthetic whole-course shell preserves exact routes, field ownership and required sequence',()=>{
 const input=courseFixture(),rendered=renderTopicCourse(input),$=load(rendered.html);
 assert.equal($('.course-page').not('[data-p2-presentation-route]').length,input.topic.state.routes.length);assert.equal($('[data-pilot2-response]').length,Object.keys(input.topic.state.responses).length-1); // graph response uses its construction controls
 assert.equal($('[data-response-id],[data-complete-id],[data-progress-count]').length,0);
 assert.equal($('#b-topic-fixture .p2-required-nav a[data-page-target="b-chapter-14-practice"]').length,1);assert.equal($('#b-chapter-14-practice .p2-required-nav a[data-page-target="b-review-seminar"]').length,1);
 assert.equal($('#fixture-textbook').closest('.course-page').attr('id'),'b-chapter-14-practice');assert.equal($('#b-textbook [data-pilot2-textbook-attempt]').length,0);
 assert.equal($('#pilot2-recovery').parents('#pilot2-course-surface').length,0);assert.equal($('script[src="assets/pilot2-course.js"]').length,1);assert.equal($('link[href^="https://fonts"]').length,0);
 assert.equal(rendered.topicCount,1);assert.equal(rendered.requiredRouteCount,3);
 const payload=JSON.parse($('#pilot2-course-data').text());assert.equal(payload.schemaVersion,1);assert.equal(payload.activities.state.unit,'B');assert.equal($('script[src="assets/pilot2-course.js"]').attr('type'),undefined);assert.ok($('script[src="assets/pilot2-course.js"]').is('[defer]'));
 assert.ok(!$('#pilot2-course-data').text().includes('<script>'));assert.equal(payload.activities.practice.items[0].options[1],input.topic.practice[0].options![1]);
 const draft=structuredClone(input);draft.topic.contract.status='draft';assert.throws(()=>renderTopicCourse(draft),/frozen/);
});
