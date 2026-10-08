// Historical authoring operation. Writes only this pilot's lesson-b.html.
// The complete static lesson fragment is the proposal owner after authoring.
const fs=require('fs'),path=require('path'),c=require('cheerio');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'baseline/ce1-03.html'),'utf8');
const $=c.load(source,{sourceCodeLocationInfo:true}),edits=[];
const raw=e=>{const l=e.sourceCodeLocation;return source.slice(l.startOffset,l.endOffset);};
const one=s=>{const e=$(s);if(e.length!==1)throw Error('Expected one '+s+'; got '+e.length);return e[0];};
const replace=(s,text)=>{const l=one(s).sourceCodeLocation;edits.push({start:l.startOffset,end:l.endOffset,text});};
const insertBefore=(s,text)=>{const l=one(s).sourceCodeLocation;edits.push({start:l.startOffset,end:l.startOffset,text});};
const insertAfter=(s,text)=>{const l=one(s).sourceCodeLocation;edits.push({start:l.endOffset,end:l.endOffset,text});};
const term=(id,text)=>`<button type="button" class="vocab-term" data-vocab-term="${id}" aria-haspopup="dialog">${text}</button>`;
const p=(key,text)=>`<p data-canvas-helper-edit-key="ce1-03-${key}">${text}</p>`;
const h=(key,text)=>`<h3 data-canvas-helper-edit-key="ce1-03-${key}">${text}</h3>`;

replace('#ce1-03 .lesson-roadmap-body',`<div class="lesson-roadmap-body"><ol>
<li data-canvas-helper-edit-key="ce1-03-foundations-roadmap"><a href="#ce1-03-foundations" data-section-target="ce1-03-foundations">Start with the question</a>: see why two relevant routes can still fit a person differently, and what you will learn to do.</li>
<li><a href="#ce1-03-opening">Meet Leah</a>: understand the choice she is making before reading her records.</li>
<li><a href="#ce1-03-documents">Read the employer and training notices</a>: learn what each document tells you, then try the first reading check.</li>
<li><a href="#ce1-03-method">Understand the training outcomes</a> and watch the decision-making clip or read its transcript. Then <a href="#ce1-03-worked">follow my Route A demonstration</a>; there is no writing task in that example.</li>
<li><a href="#ce1-03-practice">Investigate Route B with support</a>: use the four practice fields, check the calculations and revise using the model if needed.</li>
<li><a href="#ce1-03-checks">Try six short checks</a>: use the feedback to check the reasoning behind your answers.</li>
<li><a href="#ce1-03-apply">Make Owen’s recommendation</a>: use his new facts, enter both totals and write your recommendation. Review the four sign-off statements, then select Complete lesson.</li>
</ol></div>`);

const vocab=one('#ce1-03 > details:last-of-type');
replace('#ce1-03 > details:last-of-type',`<details class="lesson-vocabulary-help"><summary>Core vocabulary</summary>
${raw($(vocab).find('.vocabulary-use-note')[0])}
<dl><dt>${term('lesson-route','Route')}</dt><dd>The learning and work steps toward a possible role.</dd>
<dt>${term('prerequisite','Prerequisite')}</dt><dd>Preparation needed before the next step.</dd>
<dt>${term('lesson-credential','Credential')}</dt><dd>A record of a qualification.</dd>
<dt>${term('lesson-trade-off','Trade-off')}</dt><dd>What you gain and give up with a choice.</dd></dl></details>`);

replace('#ce1-03-foundations',`<section class="authored-stage lesson-foundations" id="ce1-03-foundations" data-canvas-helper-edit-key="ce1-03-foundations">
<p class="section-label">Start here</p>
<h2 data-canvas-helper-edit-key="ce1-03-foundations-title">Two routes, one goal: how do you choose?</h2>
${p('foundations-purpose','Two training options can lead toward the same kind of work, yet one may fit your situation much better. A lower fee can hide months of travel costs, and a shorter program may require a course you have not finished. How do you make a fair comparison?')}
${h('foundation-heading-1','Start with the work you want to do')}
${p('foundation-copy-2','In the last lesson, you learned to separate an occupation’s duties, working conditions and preparation. Now we will use that distinction to investigate how someone could prepare for a particular role. A '+term('lesson-route','route')+' is the sequence of learning and work steps toward that role. The destination gives those steps a purpose.')}
${p('foundation-copy-3','Think about two ways of getting somewhere. Before comparing how long each takes, you need to know whether both actually reach your destination. Training works the same way: two programs can mention similar subjects without preparing people for the same work. We will first check that connection, then compare what each route asks of the learner.')}
${h('foundation-heading-4','Here is how we will work through the choice')}
${p('foundation-copy-5','You will meet Leah, who is considering event-support work. I will show you how to read her documents and investigate her first training option, Route A. You will then use the same questions to investigate Route B, with calculation feedback and a model to help you revise.')}
${p('foundation-copy-6','Once you have practised with Leah, you will help a different learner, Owen. His work goal, courses, budget and timing are different. Your final product will be two cost totals and a written recommendation: which route he should investigate first, what could become a backup, and what he still needs to check.')}
${p('foundation-copy-7','The point is to make a choice you can explain. A confident-sounding recommendation is useful only when the requirements and calculations support it. You can choose a sensible next step while still being honest about what is uncertain.')}
${p('foundations-reading','<strong>As you begin:</strong> read the explanation and Leah’s documents before answering the first question. Everything needed for this lesson is supplied here. You do not need to find a real program or contact an employer.')}
${p('foundations-next','<strong>Next:</strong> <a href="#ce1-03-opening" data-section-target="ce1-03-opening">Meet Leah and identify her decision</a>. We will use her situation to make the comparison questions concrete.')}
</section>`);

replace('#ce1-03-opening',`<section class="finlit-stage finlit-stage--lead" id="ce1-03-opening"><span id="ce1-03-stage-1" class="finlit-anchor" aria-hidden="true"></span>
<p class="section-label">Meet Leah</p><h2>What would help Leah take her next step?</h2>
${p('leah-introduction','Leah likes organizing equipment and explaining how to use it. She is interested in becoming an <strong>Event Support Assistant</strong> at community events. That is the work she wants to explore; she has not been offered a job.')}
${p('leah-decision','She has <strong>one year</strong> to enter the field and <strong>$1,400</strong> for the training fees, supplies and travel listed in this case. She has found two options: an employer’s trainee route and a college certificate. Her question is, <em>which should I investigate first, and what could I keep as a backup?</em>')}
${p('leah-why','We need more than a program name to answer that. First, does the employer consider this training relevant? Next, can Leah enter it, complete it in a suitable time and cover the listed costs? Finally, will it help her develop the skills she wants to improve? These are our <strong>comparison criteria</strong>: the same questions we will ask of both options.')}
${p('leah-reading-purpose','Keep Leah’s goal and limits in mind as you read. The next documents are the information behind the decision. We will explain the unfamiliar terms as they become useful, and you will not be asked to make the final recommendation yet.')}
<p class="finlit-boundary">All people, employers, programs, dates and prices in this case are fictional. They provide the facts for this lesson; they are not real admission rules or employment offers.</p></section>`);

replace('#ce1-03-documents > h2','<h2>Read each document for the question it can answer</h2>');
replace('#ce1-03-documents > p:not(.section-label):first',p('employer-reading','An <strong>employer role notice</strong> describes work the organization wants someone to do and the preparation it will consider. Start with <strong>Work in this role</strong> below so you know the destination. Then read <strong>Routes considered</strong>: that line tells us whether Leah’s two options connect to this particular role.'));
insertAfter('#ce1-03-documents > .finlit-document--employer',p('employer-interpretation','Notice the limit of that connection. The employer is willing to consider either route; it has not promised to select every person who completes one. <strong>Relevant training</strong> means the option can be considered for the role. <strong>Selection</strong> is the later decision about who gets a place or is chosen. Keeping those separate prevents us from turning a training plan into a job guarantee.'));
replace('#ce1-03-documents > h3','<h3>Now compare what the training notices ask of Leah</h3>');
const docIntro=$('#ce1-03-documents > h3').next('p')[0];
const li=docIntro.sourceCodeLocation;
edits.push({start:li.startOffset,end:li.endOffset,text:
p('training-reading','A <strong>training notice</strong> tells us how a particular route works. Read <strong>Entry</strong> first. A '+term('prerequisite','prerequisite')+' is preparation that must be completed before a later step. Leah’s record names the courses she has finished; each notice names the courses it requires. Comparing those lines tells us whether she has the preparation to begin.')+
p('completion-reading','Then look at <strong>Learning</strong> and <strong>Completion</strong>. Learning describes what she will practise. Completion tells us what record or qualification she receives at the end. A '+term('lesson-credential','credential')+' is a record of a qualification, such as a certificate. An employer’s training record and a college certificate describe different outcomes; we will examine that difference shortly.')+
p('cost-reading','Finally, read the duration, costs and unresolved conditions. <strong>Once</strong> means include the charge once. <strong>Each month</strong> means repeat it for every month stated. You do not need to calculate both totals yet. First notice which lines repeat and which questions the notices leave open.')});
insertBefore('#ce1-03-documents > fieldset',p('document-check-purpose','Before we compare prices, check the connection to the work. In the question below, choose the statement supported by the employer’s <strong>Routes considered</strong> line. This checks whether you are comparing two relevant options; it does not ask you to choose the better option yet.'));

const method=$('#ce1-03-method'),terms=method.children('.finlit-route-terms');
const table=raw(terms.find('.document-table')[0]);
const dated=raw(terms.children('p').filter((i,e)=>$(e).text().startsWith('Dated source record'))[0]);
replace('#ce1-03-method',`<section class="finlit-stage" id="ce1-03-method"><span id="ce1-03-video-example" class="finlit-anchor" aria-hidden="true"></span><span id="ce1-03-finlit" class="finlit-anchor" aria-hidden="true"></span><span id="ce1-03-stage-3" class="finlit-anchor" aria-hidden="true"></span>
<p class="section-label">Understand the comparison</p><h2>What does each route help Leah learn?</h2>
${p('credential-comparison','Both routes are relevant to the assistant role, but that does not make their learning identical. Route A teaches the employer’s venue procedures and gives an <strong>employer training record</strong>. Route B leads to the provider’s <strong>Event Support certificate</strong> and includes venue planning and group projects. These differences matter when Leah asks what she wants to learn, and what record she will have afterwards.')}
${p('credential-no-ranking','A longer or more impressive-sounding title cannot settle the choice. Check what the particular route teaches and what its completion record is recognized for. In this case, Harbour Events explicitly considers both. That statement covers its assistant role; it does not say either route authorizes electrical installation, independent repair or every related occupation.')}
<section class="finlit-route-terms" data-canvas-helper-edit-key="ce1-03-training-types">
<h3>Read training names as descriptions, not rankings</h3>
${p('table-reading','You will meet these names when investigating real options. Read across each row: the left side names a type of learning or qualification; the right side explains what that name tells you and what still needs checking. For Leah’s case, pay particular attention to <strong>Certificate</strong> and <strong>Apprenticeship</strong>. Her college option is a certificate, while ordinary employer training is not automatically a registered apprenticeship.')}
${table}
${p('table-interpretation','The distinction to carry forward is between the <em>kind of learning</em>, the <em>qualification or credit earned</em>, and the <em>requirements of the intended work</em>. A microcredential may recognize a specific assessed skill without replacing the broader preparation a role requires. Dual credit connects high-school learning with another pathway; it does not mean a student has completed an entire post-secondary program.')}
${dated}
</section>
<h3>Use a decision process to organize those facts</h3>
${p('video-purpose','You now have a destination, two options and a set of comparison questions. The FINLIT clip gives a way to organize those pieces. <strong>As you watch or read, listen for when to set your criteria.</strong> They come before evaluating the options, so both options are judged against the same needs.')}
${raw(method.children('figure')[0])}
${raw(method.children('.finlit-transcript')[0])}
${p('video-connection','For Leah, “define the decision” means deciding which route to investigate first. Her criteria come from her situation: current courses, one-year aim, $1,400 for listed costs and the skill she wants to develop. We then compare each notice against those criteria. That is why we started with her goal and records rather than choosing whichever program sounded best.')}
${p('prerequisite-chain','Preparation also has an order. Leah has Practical Mathematics 1. If a route requires Mathematics 2, she needs to find out when she could complete that next course before entry. The chain is <strong>current preparation → any missing preparation → entry decision → training → possible work</strong>. A broad career cluster can suggest related work, but the actual route notice supplies the course requirement.')}
${p('method-next','Next I will demonstrate that process with Route A. Watch how each fact changes the recommendation. Later, you will use the same process for Route B, where the entry and cost conditions are different.')}
</section>`);

replace('#ce1-03-worked > h2','<h2>Let’s investigate Route A together</h2>');
const workedIntro=$('#ce1-03-worked > p').filter((i,e)=>$(e).text().startsWith('Watch how'))[0];
edits.push({start:workedIntro.sourceCodeLocation.startOffset,end:workedIntro.sourceCodeLocation.endOffset,text:p('worked-purpose','Here is how I would reason through Leah’s first option. Read this as a demonstration: follow the facts back to the notices and notice why each step matters. You will use the same questions yourself when you reach Route B.')});
replace('#ce1-03-worked > .finlit-worked-list',`
${h('worked-entry-heading','First, check whether the option is relevant and accessible')}
${p('worked-entry-reason','I start with the employer’s notice because cost is useful only after we know the route connects to Leah’s goal. Harbour Events considers its trainee route for the Event Support Assistant role. That establishes relevance. It does not yet tell us that Leah will be selected.')}
${p('worked-entry-match','Now I compare the <strong>Entry</strong> line with Leah’s course record. Route A requires Communication 1 and Practical Mathematics 1; Leah has completed both. She therefore has the stated school prerequisites. The employer still has to select her, and places are unconfirmed. Those are separate conditions, so I keep them visible in the recommendation.')}
${h('worked-time-heading','Then, check the time and the learning')}
${p('worked-time-reason','Route A runs for <strong>four months after selection</strong>. Its training duration fits within Leah’s one-year aim. However, duration is not the same as a confirmed start date: she still needs to check the March 15 selection round and when an available place would begin.')}
${p('worked-learning-fit','The learning line gives us another reason to investigate it. Leah wants more practice explaining unfamiliar instructions, and this route includes supervised visitor instructions. That connects the training to a specific growth area. We can explain the fit without pretending she already has every skill needed for the role.')}
${h('worked-cost-heading','Now count every listed cost')}
${p('worked-cost-reason','The fees and supplies are charged once. Travel is charged each month for four months. If I add only one travel charge, I leave out three months of a cost Leah would still need to cover. I work out travel first, then add the one-time charges:')}
<p class="finlit-continue" data-canvas-helper-edit-key="ce1-03-worked-calculation">Travel: $120 × 4 months = $480<br>Full listed cost: $300 fees + $200 supplies + $480 travel = <strong>$980</strong><br>Amount remaining: $1,400 − $980 = <strong>$420</strong></p>
${p('worked-cost-meaning','The $980 total is below her $1,400 limit, leaving $420 within the categories we are comparing. That result supports investigating Route A. It is not a complete living-cost budget: the case keeps living costs unchanged and supplies no pay amount. I therefore do not add assumed wages or call the remainder disposable income.')}
${h('worked-choice-heading','Turn the comparison into a next step')}
${p('worked-choice-reason','A <strong>primary route</strong> is the option to investigate first. For Leah, Route A has a relevant outcome, school prerequisites she has completed, a suitable training duration, listed costs within her limit and useful practice. Together, those facts support a provisional choice—a choice she can revise if the missing information changes.')}
${p('worked-tradeoff','A '+term('lesson-trade-off','trade-off')+' is what you gain and give up with a choice. Route A offers a shorter, employer-focused route; choosing it means accepting a different learning and completion record from the college certificate’s broader projects. The employer considers both for this role, so the comparison is about Leah’s needs as well as the title she would receive.')}
${p('worked-backup','A <strong>backup route</strong> is an alternative that could become workable if its conditions are met. I can keep Route B under investigation, but I cannot yet call it ready to use. In the practice section you will check its missing course, full costs and timing. First, here is a short recommendation that puts the Route A reasoning into words:')}`);
// The existing quoted Route A recommendation and optional Riley video remain intact.

replace('#ce1-03-practice > h2','<h2>Could Route B become Leah’s backup?</h2>');
replace('#ce1-03-practice > p:not(.section-label):first',
p('practice-transition','We have reasons to investigate Route A first. Now test the alternative instead of simply calling it “Plan B.” Route B may offer learning Leah values, but it has its own entry, time and cost conditions. A useful backup is one she could actually prepare to use.')+
p('practice-thinking','Use the Route B notice and Leah’s record above. The method stays the same: connect the route to her goal, compare required preparation, account for every month and interpret the result against her limits. This time you will supply the calculations and explanation in the four fields below.')+
p('practice-support-purpose','Start with the travel subtotal, then the full listed total. Next explain the missing course and what would have to change to make this route workable. The calculation check will help with arithmetic; the comparison model will help you review the reasoning in your writing. You can revise either part after using the feedback.'));
insertBefore('#ce1-03-practice > .learning-next',p('practice-wrap','After trying the fields, use your comparison to explain why “relevant to the role” and “workable for Leah now” are different judgments. The next checks let you test that distinction, the cost calculation and the conditions a backup would need.'));
insertAfter('#ce1-03-checks > h2',p('checks-purpose','These six questions revisit the decisions we have just made. Try each one using Leah’s notices, then read the feedback. If you miss a question, return to the named line or calculation before changing your answer. An incorrect answer is a chance to locate a break in the reasoning before you use the method on your own.'));

replace('#ce1-03-apply > h2','<h2>Your turn: recommend a route for Owen</h2>');
replace('#ce1-03-apply > p:not(.section-label):first',
p('owen-transfer','You have followed the reasoning for Route A and tested Route B with support. Now use that same method in a new situation. The comparison questions stay the same, but the person, work, courses, budget and dates change. Read Owen’s information before starting; his recommendation must come from his own records.')+
p('owen-introduction','Owen wants to explain places and activities to visitors. He has practised giving directions and wants to get better at checking unfamiliar information before answering. He completed fictional <strong>Communication 1</strong> and <strong>Local Studies 1</strong>. He has <strong>$1,700</strong> for listed training and travel, can live at home, and prefers a route of <strong>eight months or less</strong>.')+
p('owen-reading-purpose','Start with the employer’s information to establish the destination. Then read the two route notices across the same dimensions: entry, duration, learning and all listed costs. Decide which route is worth investigating first and what conditions would have to change for the other to become a backup.'));
// Correct a model description, without changing Owen's task, facts or saved version.
const model=$('#ce1-03-apply > .finlit-model')[0];
const oldModel=raw(model);
if(!oldModel.includes('six-month preference'))throw Error('Expected known model correction');
replace('#ce1-03-apply > .finlit-model',oldModel.replace('six-month preference','preference of eight months or less'));
insertAfter('#ce1-03-apply > .finlit-completion',`
${h('closing-heading','Return to the question we started with')}
${p('closing-answer','How do you make a fair comparison? Establish that each route connects to the work, use the same questions about entry, time, learning and full listed costs, then explain your choice and its conditions. A sound recommendation can include uncertainty: it tells the learner what to investigate next and what would make the plan change.')}
${p('closing-next','Training information is only part of career planning. In the next lesson, you will examine labour-market claims: what an employment count or forecast can tell you, and why it may answer a different question from a local job search. That will help you judge the work information you use alongside a route comparison.')}`);

edits.sort((a,b)=>b.start-a.start||b.end-a.end);let previous=source.length+1,out=source;
for(const e of edits){if(e.end>previous)throw Error('Overlapping edit');out=out.slice(0,e.start)+e.text+out.slice(e.end);previous=e.start;}
const candidate=c.load(out);
const oldKeys=$('[data-canvas-helper-edit-key]').map((i,e)=>$(e).attr('data-canvas-helper-edit-key')).get();
const newKeys=candidate('[data-canvas-helper-edit-key]').map((i,e)=>candidate(e).attr('data-canvas-helper-edit-key')).get();
for(const key of oldKeys)if(!newKeys.includes(key))throw Error('Lost editable key '+key);
if(new Set(newKeys).size!==newKeys.length)throw Error('Repeated editable key');
fs.writeFileSync(path.join(dir,'lesson-b.html'),out,{flag:'wx'});
console.log('Complete proposal authored:',out.length,'bytes;',edits.length,'bounded replacements. Canonical course unchanged.');
