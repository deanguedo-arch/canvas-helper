/* Narrow instruction-only pass over canonical HTML; never regenerate lessons. */
import fs from 'node:fs';
import {load} from 'cheerio';
const file='projects/biology30-unit-a-pilot-3/workspace/index.html',$=load(fs.readFileSync(file));
const dataSnapshot=()=>$('script[type="application/json"]').map((i,e)=>$(e).text()).get();
const before=JSON.stringify(dataSnapshot());
for(const lesson of $('[id^="lesson-"]').toArray()){
 const node=$(lesson),guide=node.find('.page-guide').first();
 if(!guide.find('summary').text().includes('How to complete this lesson'))continue;
 guide.find('summary').html('<strong>How to complete this lesson</strong> — Learn → practise → required check → finish');
 guide.find('li').first().html('<strong>Start with the lesson.</strong> Read the learning goal and “Before you begin,” then work through the explanation, diagrams and examples below. The embedded textbook is optional support: open it when you want another explanation or a closer look at a figure.');
 guide.find('p').filter((i,e)=>$(e).text().startsWith('Expected work:')).html('<strong>Expected work:</strong> complete the lesson and submit the required chapter check. Use optional reading, videos and practice when they help. Drafts save automatically as you work in this browser.');
 node.find('.textbook-band .section-label').text('Optional embedded reading');
}
const intro=$('#overview .overview-intro li').first();intro.find('strong').text('Start with the lesson.');intro.find('span').text('Learn from the online explanations, figures and examples. The embedded textbook is optional support, not a prerequisite for starting.');
$('#textbook-library .page-header > p').last().text('Use this optional embedded library for another explanation or a closer look at a diagram. You can learn the ideas and complete the required checks using the lessons without reading the chapter first.');
if(JSON.stringify(dataSnapshot())!==before)throw Error('Instruction pass changed activity data');
fs.writeFileSync(file,$.html());console.log('Chapter 11 instruction-only alignment applied; check/state data unchanged.');
