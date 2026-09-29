/* One-time integration record. Canonical learner content is workspace/index.html.
   Do not rerun the earlier baseline migration over the integrated course. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const cheerio = require('cheerio');
const root = path.resolve(__dirname, '../../workspace');
const file = path.join(root, 'index.html');
const before = fs.readFileSync(file, 'utf8');
if (before.includes('data-finlit-integration="2026-09-28"')) throw Error('One-time integration is already applied. Edit canonical HTML; do not rerun this migration.');
const backup = path.join(__dirname, 'before-finlit-integration.html');
if (!fs.existsSync(backup)) fs.writeFileSync(backup, before);
const $ = cheerio.load(before);
const esc = x => String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const media = JSON.parse(fs.readFileSync(path.join(__dirname, '../finlit-media-candidates.json'))).media;
// Each item has a viewing purpose, a case check with option-specific feedback,
// and a concrete connection at the example, guided practice and independent task.
const plans = {
 'ce1-01': {
  title:'Factors Affecting Your Values',
  before:'You have read Jordan’s notebook. Watch or read how family, friends and other influences can shape what matters to a person. Listen for the difference between a preference and something a person can demonstrate.',
  question:'Jordan wants a reasonably predictable work schedule. How should that note be used?',
  choices:['As proof that Jordan can organize any workplace.','As a work value to investigate alongside evidence of skills.','As a promise that design-related work has predictable hours.'],
  feedback:['A preferred schedule is not evidence of an action. The poster revision and shared checklist supply actions.','Yes. The schedule preference helps Jordan decide what to investigate; it does not establish a skill or an employer’s hours.','The notebook supplies Jordan’s preference, not the schedules of real employers. That is a question to investigate.'], correct:'B',
  model:'Use the video’s distinction as you read: Jordan’s poster action supports a skill claim; the predictable-schedule preference helps frame a question about work.',
  guided:'Keep the two kinds of evidence separate in your practice response: what the person did, and what the person wants work to support.',
  final:'For Amina, use her own action records and goal note. Movement during the day and a predictable finish are preferences to investigate, not qualifications.'
 },
 'ce1-03': {
  title:'Career Planning: decision steps',
  before:'Leah has two route records and a $1,400 limit. Watch or read the decision steps: define the decision, set criteria, compare options, decide and reassess. Use cost, preparation and timing as Leah’s criteria.',
  question:'Which action follows the decision method for Leah?',
  choices:['Compare both routes against Leah’s preparation, listed costs and one-year aim.','Choose the route with the most impressive name.','Treat completion of either route as a guaranteed job.'],
  feedback:['Yes. These criteria come from Leah’s supplied record. A recommendation must also keep selection and admission uncertainties visible.','A title does not show whether the route fits Leah’s budget, preparation or timeline.','The employer record explicitly says selection is not guaranteed. A decision method does not remove that uncertainty.'],correct:'A',
  model:'Follow the FINLIT sequence in Leah’s example: identify the destination, total each route’s listed costs, check entry preparation and timing, then name the next check.',
  guided:'When a condition changes in the practice case, reassess the affected criterion. Do not restart the comparison from a route’s name or reputation.',
  final:'Apply the same decision steps to Owen’s new records. His budget, preparation and preferred duration replace Leah’s; future earnings are not supplied.'
 },
 'ce1-06': {
  title:'The Entrepreneur’s Dozen',
  before:'Kai’s records describe one employment offer and one small venture trial. Watch or read the advice about researching an opportunity, anticipating problems and revising an idea. Look for reasons to test a venture rather than assume enthusiasm is enough.',
  question:'What still needs investigation before Kai treats the five-sale trial as a dependable income?',
  choices:['Nothing: five customers establish every future week.','Only whether Kai enjoys repairs.','Future demand and costs the trial has not priced.'],
  feedback:['Five supplied sales describe one trial. They do not establish repeat customers or later demand.','Interest matters, but the trial also omits costs and evidence of future customers.','Yes. This applies the video’s research step to the limits of Kai’s actual record.'],correct:'C',
  model:'As the example separates sales from money remaining, connect it to FINLIT’s advice to test resources and risks. Missing costs remain missing after the arithmetic.',
  guided:'Use the reduced-sales practice to test how the venture changes. A lower amount remaining is evidence to examine, not a reason to invent more customers.',
  final:'For Samir, use the supplied craft-display action, shop offer and four-sale trial. Identify an unanswered business question before recommending a next learning step.'
 },
 'co1-01': {
  title:'Employment Income: skills you can show',
  before:'You have met Rowan and read the experience notes. Watch or read how communication, teamwork and initiative can be used at work. For each skill label, look back at an action in Rowan’s notebook that could support it.',
  question:'Which application line supports a communication skill with Rowan’s actual evidence?',
  choices:['“I am an expert library employee.”','“I explained the sign-in roles to two helpers at our school welcome evening.”','“I have every skill the employer wants.”'],
  feedback:['Rowan has not worked at a library. The video’s skill labels do not establish that experience.','Yes. It names an observable action and its school setting. The complete example will also show the supplied result.','A list or broad claim cannot replace an example. Choose one duty and show an action that fits it.'],correct:'B',
  model:'Notice how the example turns a skill label from the FINLIT clip into context, action and result. The reader can see what Rowan actually did.',
  guided:'For careful record keeping, return to the club attendance entry. Choose the checking action and its verified result; a communication label alone will not answer this duty.',
  final:'Use the fundraiser notes for this new application. Select a festival duty, then demonstrate it with Rowan’s action and the result supplied here.'
 },
 'co1-03': {
  title:'Tips for Your Résumé',
  before:'This excerpt discusses written applications: a résumé summarizes facts, while a cover letter explains relevance. You will transfer that idea to an interview answer. Listen for why specific accomplishments matter, then look back at Rowan’s school and community records.',
  question:'Which idea from the résumé excerpt also helps Rowan answer an interview question?',
  choices:['Choose a relevant action and explain the supported result.','Read a list of positive adjectives without an example.','Describe school activities as paid employment.'],
  feedback:['Yes. Written and spoken applications both benefit from a specific, relevant example. This lesson adds the spoken context–action–result–reflection structure.','Adjectives do not show what happened. Use the event record to give the interviewer evidence.','The original setting must stay accurate. A school or volunteer action can be useful without becoming paid employment.'],correct:'A',
  model:'The FINLIT excerpt concerns written applications. This example shows the transfer to speaking: choose a relevant accomplishment and explain it in a truthful event sequence.',
  guided:'In the mixed-card practice, select the action that answers the interview question. Keep the lead’s confirmation and the second helper’s contribution visible.',
  final:'Use Record C for the disagreement answer. The earlier cancellation and card mix-up are examples of the method, not events to substitute for this new question.'
 },
 'fl1-01': {
  title:'Paycheque Deductions',
  before:'Keep Mika’s September statement in view. Watch or read the distinction between gross pay and net pay. Find those two lines on the statement, then identify the deductions that explain the difference.',
  question:'Which amount represents Mika’s current payment after the listed deductions?',
  choices:['$225.00, the current gross pay.','$973.00, the year-to-date net.','$194.60, the current net deposit.'],
  feedback:['Gross is before deductions. Subtract the current $30.40 from the current $225.00.','Year-to-date combines several payments. The question asks for this payment only.','Yes. $225.00 − $30.40 = $194.60. These supplied deductions are practice figures, not rates or benefit-eligibility rules.'],correct:'C',
  model:'Use FINLIT’s gross-to-net distinction, then take the additional step in this example: check the paid hours against Mika’s time record.',
  guided:'Use the current-pay column in the practice task. Agreement between a stub and a deposit does not by itself prove that all hours were paid.',
  final:'For Ellis, check the time record and current stub separately. Report the gross mismatch and the listed net; revised deductions have not been supplied.'
 },
 'fl1-02': {
  title:'Factors Influencing Money Decisions',
  before:'Ari has seen a friend’s message, a family preference and a deadline banner. Watch or read how peers, advertising and values can influence a purchase. Identify an influence without treating it as proof that the purchase is affordable.',
  question:'What should Ari do with the “one night only” message?',
  choices:['Treat urgency as evidence that $48 is affordable.','Recognize the pressure, then protect the $54 already committed.','Assume club membership requires buying the hoodie.'],
  feedback:['A deadline changes the decision window, not the available money. Ari has $60 and $54 of commitments.','Yes. The video helps identify the influence; the case figures show only $6 is uncommitted.','The notice says regular club activities are available with or without the hoodie.'],correct:'B',
  model:'Watch how the example separates social influence from the calculation. Belonging matters to Ari, but the hoodie is not required for club participation.',
  guided:'When extra money is introduced in practice, recalculate affordability. Then check which pressure, deadline and choice still remain.',
  final:'Identify the influences in Ren’s new decision, then use Ren’s needs, dates and available money. Do not carry Ari’s amounts into this recommendation.'
 },
 'fl1-03': {
  title:'Tracking Your Spending',
  before:'This short excerpt introduces tracking income and expenses. Sam’s ledger adds dates so you can see when money is available. As you watch or read, distinguish a monthly total from a balance on a particular day.',
  question:'A plan finishes the month above zero. What else must you check in Sam’s dated ledger?',
  choices:['Whether the balance falls too low before the next income arrives.','Nothing: a positive month-end total settles every payment date.','Whether future income can be counted as cash already received.'],
  feedback:['Yes. Tracking dates reveals a shortfall that a month-end total can hide.','A bill can be due before the income that makes the final total positive. Follow the dated balance.','Future income belongs on its stated arrival date. Counting it early would hide a cash shortage.'],correct:'A',
  model:'FINLIT introduces the income-and-expense record. The example extends it by calculating the balance after each dated event.',
  guided:'As you adjust flexible amounts, check both the available total and the required buffer. A choice must also work on the dates shown.',
  final:'Use the new case’s ledger dates and stated constraints. Explain both the revised allocations and why the plan can make payments when due.'
 },
 'fl1-05': {
  title:'Smartphones and Plans',
  before:'Marin’s two offers include features, promotional prices and device payments. Watch or read the three questions in this excerpt: what features are needed, how the phone will be used and what can be spent. Then apply all three to the offers.',
  question:'Which comparison answers Marin’s decision?',
  choices:['The lowest introductory monthly price alone.','The newest phone model alone.','Required features, full-period cost, later monthly payments and exit terms.'],
  feedback:['The introductory price lasts only part of the year. Later charges and device payments still have to be paid.','A model name does not establish fit with Marin’s needs or $45 monthly limit.','Yes. This turns the video’s needs-and-budget questions into a comparison of the supplied contracts.'],correct:'C',
  model:'Keep Marin’s needs and spending limit beside the calculation. The complete example tests both the twelve-month total and the monthly payment after the promotion.',
  guided:'Use the changed end date in practice to check remaining device obligations. Ending service does not automatically erase an amount still owed.',
  final:'Start again with the new person’s required use and supplied offers. Explain the full cost and the contract condition that could change your recommendation.'
 },
 'fl2-01': {
  title:'Why Borrow Money?',
  before:'The excerpt names reasons people borrow and emphasizes affordability. Alex’s two quotations let you test that idea with actual terms. Look for the difference between a smaller payment and a smaller total cost.',
  question:'Offer B has a smaller monthly payment than Offer A. What can Alex conclude from that fact alone?',
  choices:['B costs less overall.','B asks for less each month; total cost still needs calculating.','B must fit every future budget.'],
  feedback:['The number of payments and any fee also affect the total. Smaller payments can continue for longer.','Yes. Compare the monthly commitment separately from payments × number of payments plus fees.','The quotation does not promise Alex’s future income or expenses. Affordability must be checked against the case budget.'],correct:'B',
  model:'Use the FINLIT affordability question twice: can Alex manage each payment, and is the total extra cost justified by the benefit?',
  guided:'When Alex’s monthly limit changes, recheck the payments and alternatives. The arithmetic for total repayment still matters.',
  final:'Bea’s coat case has both borrowing quotations and a confirmed non-borrowing option. Compare access, cash needed today and total repayment before recommending.'
 },
 'fl2-05': {
  title:'Why Borrow Money? Repayment and alternatives',
  before:'This excerpt contrasts paying a card balance in full with carrying debt and asks whether borrowing provides a worthwhile advantage. Nico’s financing is a fixed-payment offer, not a credit-card example. Apply the question about advantage to the confirmed loaner and saving alternative.',
  question:'What allows Nico to compare financing with saving first?',
  choices:['A suitable loaner is confirmed through the fourth saving deposit, and the cash price remains valid.','Any mention of a loaner guarantees indefinite access.','Future earnings can be assumed to cover the financing.'],
  feedback:['Yes. The confirmation bridges access while Nico saves. Its end date is essential to the comparison.','The record confirms a specific return date. A shorter or unsuitable loaner could change the conclusion.','No later income is promised. Use the confirmed amounts and dates only.'],correct:'A',
  model:'Apply the video’s question about the advantage of borrowing: does paying extra solve a problem that the confirmed loaner and cash plan cannot solve?',
  guided:'In the shorter-loaner practice, identify the access gap before recommending. An alternative is useful only if it covers the actual need and dates.',
  final:'For Taylor, compare the boots deadline with the confirmed payment date. The unverified five-day borrowed pair cannot silently become a fourteen-day solution.'
 },
 'fl3-01': {
  title:'Saving Tips',
  before:'Sam’s board gives two goals and $35 per week after other costs. Watch or read the ideas for noticing spending and making room for saving. The clip’s examples are possibilities, not expenses Sam is known to have.',
  question:'Which money can you allocate in Sam’s supplied plan?',
  choices:['The $35 weekly plus an invented cancelled subscription.','The emergency reserve because it appears on the record.','The stated $35 weekly, shared between the two goals.'],
  feedback:['The clip suggests places someone might investigate, but Sam’s record does not supply a subscription or extra saving from cancelling one.','The reserve is explicitly separate and unavailable for these goals.','Yes. Use the confirmed weekly pool once. The video’s saving suggestions do not add money to the case.'],correct:'C',
  model:'Turn the saving idea into an allocation: the example protects the fixed jacket date and assigns the remaining weekly money without counting it twice.',
  guided:'When only $25 per week is available in practice, revise the plan using that amount. Identify which deadline is flexible instead of assuming another expense can be cut.',
  final:'For Lena, the fee and hobby compete for the same $18 weekly. Explain the allocation using the supplied fixed deadline and flexible hobby goal.'
 },
 'fl3-04': {
  title:'Investing Money: purchasing power',
  before:'You have a $100 basket that later costs $103 and a $100 balance that grows to $101. Watch or read why rising dollar balances can still buy less when prices rise faster. Treat the clip as the explanation and the supplied basket as the calculation.',
  question:'What happened to the ability of the $101 balance to buy the original basket?',
  choices:['It improved because 101 is greater than 100.','It fell because the same basket now costs $103.','It stayed exactly the same.'],
  feedback:['The dollar balance rose, but prices rose more. Compare both changes.','Yes. The balance is $2 short of the same basket. Dividing $101 by 1.03 expresses its purchasing power in starting-year dollars.','Equal purchasing power would require the balance to keep pace with the basket’s price change.'],correct:'B',
  model:'Follow the two measures separately: the dollar balance and what it can buy. This is the distinction illustrated in FINLIT’s explanation.',
  guided:'In the fee comparison, hold the growth and inflation assumptions constant while testing the fee. Do not treat a calculator’s chosen return as a promise.',
  final:'Riley’s task uses a confirmed new quotation, not a forecast of general inflation. Recalculate that specific price and choose a feasible way to cover it.'
 },
 'fl3-05': {
  title:'Planning for Financial Independence',
  before:'This brief excerpt explains why a plan can help even when the future is uncertain. Its example uses adult retirement ages. In this lesson, apply the planning habit to Fei’s laptop and training goals, using the amounts and dates already supplied.',
  question:'Which use of the excerpt fits Fei’s case?',
  choices:['Write phases for the two goals and a time to review the assumptions.','Adopt the speaker’s retirement age as Fei’s deadline.','Assume a plan guarantees future income.'],
  feedback:['Yes. A useful plan states what to do next and when to check whether the assumptions still hold.','The speaker’s example is a different situation. Fei’s record supplies the relevant deadlines.','A plan organizes decisions; it does not create income or remove uncertainty.'],correct:'A',
  model:'Notice the phases in Fei’s plan: contributions serve the nearer goal, then money is redirected. The review point makes the plan usable when circumstances change.',
  guided:'With a different monthly amount, recalculate the phases. Explain what can change and which assumptions still need checking.',
  final:'Mina has $35 monthly and flexible dates. Show a feasible sequence and a useful support question; do not import retirement assumptions from the clip.'
 },
 'fl3-06': {
  title:'The Magic of Compounding',
  before:'You have read Ari’s saving record and the unexpected repair. Watch or read how interest can earn further interest. Then make an important distinction: this lesson’s Ari and Devon cases supply no interest. Their balances change through deposits and expenses.',
  question:'Can you use an assumed investment return to close Ari’s remaining gap?',
  choices:['Yes: the rising curve guarantees enough growth.','Yes: all saving plans automatically earn the rate in an illustration.','No: calculate from the actual balance and the confirmed future deposits.'],
  feedback:['The curve illustrates compounding; it does not forecast Ari’s account. No return is supplied in this case.','A model rate is an assumption. It cannot be added to Ari’s record as if it were confirmed money.','Yes. Compounding explains one possible source of growth. Here, the revision must work using the actual balance and feasible contributions.'],correct:'C',
  model:'Separate the causes of change as you follow Ari’s revision: the repair reduced the balance; the future deposits rebuild it. No interest term belongs in this calculation.',
  guided:'For the flexible-deadline practice, count the deposits required at $30 monthly. The compounding illustration cannot replace the missing contributions.',
  final:'Use Devon’s recorded deposits and expense, then the confirmed temporary contribution. Do not add a return, gift or refund that the new record does not supply.'
 },
 'fl4-01': {
  title:'Avoiding Scams: protect your information',
  before:'Casey’s record shows public clues, a reused password and location access. Watch or read why personal information and credentials matter. Identify a particular exposure and a control that addresses it, rather than writing only “be careful.”',
  question:'Which action addresses Casey’s reused-password risk?',
  choices:['Only remove the community-centre photo.','Use a separate strong credential for each affected account and add available MFA.','Assume the account is already compromised.'],
  feedback:['Removing a revealing photo addresses public information; it does not replace reused credentials.','Yes. Match the control to the exposure. The supplied guide explains that changing one account does not change the other.','The record reports no unexpected sign-in. It shows a risk to reduce, not proof of a compromise.'],correct:'B',
  model:'The video explains why information can matter. The example makes the response specific by pairing each visible clue or account habit with a relevant control.',
  guided:'Use the practice record to distinguish public information, account access and app permissions. One setting does not solve all three.',
  final:'For Morgan, keep the purpose of sharing art while removing unnecessary private detail. Explain separate account and permission changes, with their limits.'
 },
 'fl4-02': {
  title:'Avoiding Scams: pause and verify',
  before:'Leah’s two contacts look different, but neither sender is verified. Watch or read the advice to slow down and double-check a request. In this lesson, “double-check” means reaching the organization through a separate, independently obtained route—not calling a number just because the message supplies it.',
  question:'Which action independently checks the bank-looking request?',
  choices:['Use the known bank app or the number on the existing bank card.','Reply to ask the sender whether the text is genuine.','Trust the displayed name and urgent tone.'],
  feedback:['Yes. Those routes are supplied separately from the suspicious text. Do not send the sign-in code or transfer to the claimed protected account.','The same unverified sender can repeat the claim. That is not independent confirmation.','Names and urgency do not authenticate a sender. Use the supplied separate bank route.'],correct:'A',
  model:'Apply FINLIT’s pause-and-check advice separately to both contacts. A dangerous instruction and a potentially genuine call still require different explanations and independent checks.',
  guided:'When details change in practice, identify the exact request and available separate route again. CRA can call; an uncertain caller still needs verification.',
  final:'For Devon, write a plan for each new contact. A real company name does not authenticate a recruiter, and an expected appointment does not by itself authenticate the caller.'
 }
};

function check(id,p){
 const key=`media:${id}:notice`;
 const feedback=Object.fromEntries(p.feedback.map((v,i)=>[String.fromCharCode(65+i),v]));
 return `<fieldset class="authored-question finlit-check" data-question="${key}" data-correct="${p.correct}"><legend>${esc(p.question)}</legend>${p.choices.map((v,i)=>{const k=String.fromCharCode(65+i);return `<label><input type="radio" name="${key}" data-save-key="${key}" data-task-version="2026-09-28.finlit.1" value="${k}"><span>${esc(v)}</span></label>`}).join('')}<button type="button" data-check-choice>Check my understanding</button><p data-choice-result role="status"></p><template data-authored-feedback>${JSON.stringify(feedback).replace(/</g,'\\u003c')}</template></fieldset>`;
}
function transcript(vtt){return vtt.split(/\r?\n/).filter(x=>x.trim()&&!x.startsWith('WEBVTT')&&!x.includes('-->')&&!/^\d+$/.test(x.trim())).join(' ');}
function insertCue(selector,text){const target=$(selector);if(!target.length)throw Error('Missing '+selector);target.children('.section-label').first().next().after(`<p class="finlit-connection"><strong>Connect the video to this task.</strong> ${esc(text)}</p>`);}

for(const item of media){
 const id=item.lessonId,p=plans[id],article=$('#'+id);
 let block=article.find('video').filter((i,e)=>$(e).find('source').attr('src')===item.assetPath).closest('.lesson-media');
 if(!block.length){
  block=$(`<section class="lesson-media"><p class="section-label"></p><h2></h2><p class="finlit-purpose"></p><video controls preload="metadata" playsinline><source src="${item.assetPath}" type="video/mp4"><track kind="captions" srclang="en" label="English (automatic)" src="${item.captionPath}">Read the transcript for this excerpt.</video><details class="media-transcript"><summary>Read the video transcript</summary><p>${esc(transcript(fs.readFileSync(path.join(root,item.captionPath),'utf8')))}</p></details><p class="media-credit"></p></section>`);
  article.find(id==='co1-01'?'#co1-01-learn':`#${id}-stage-3`).after(block);
 }
 const sectionId=id+'-finlit';
 block.attr('id',sectionId).attr('data-finlit-integration','2026-09-28').attr('aria-labelledby',sectionId+'-title');
 block.children('.section-label').text('Watch or read · FINLIT 101');
 block.children('h2').attr('id',sectionId+'-title').text(p.title);
 const intro=block.children('h2').next('p');intro.addClass('finlit-purpose').text(p.before);
 block.find('.media-transcript>summary').text('Read the video transcript');
 block.find('track').attr('label','English (automatic)');
 block.children('.media-credit').text(`FINLIT 101 · ${p.title} · selected excerpt, used with permission.`);
 block.append(check(id,p));
 block.append('<p class="save-note">This short practice check saves with your lesson work. You can change your answer after reading the feedback.</p>');
 const roadmap=article.children('.lesson-roadmap').find('ol');
 const teachLink=roadmap.find(`[data-section-target="${id==='co1-01'?'co1-01-learn':id+'-stage-3'}"]`).closest('li');
 const link=`<li><a href="#${sectionId}" data-section-target="${sectionId}">Watch or read ${esc(p.title)}; try the short case check</a></li>`;
 if(teachLink.length)teachLink.after(link);else roadmap.append(link);
 insertCue(id==='co1-01'?'#co1-01-example':`#${id}-stage-4`,p.model);
 insertCue(id==='co1-01'?'#co1-01-practice':`#${id}-stage-5`,p.guided);
 // Independent case comes first; the connection follows the supplied facts/instructions.
 const final=article.find(id==='co1-01'?'#co1-01-apply':`#${id}-stage-7`);
 const finalFields=final.find('.authored-response-group').first();
 const cue=`<p class="finlit-connection"><strong>Use the idea in this new case.</strong> ${esc(p.final)}</p>`;
 if(finalFields.length)finalFields.before(cue);else final.find('label[for="co1-01-review-final-match"]').before(cue);
}

// Preserve other complete demonstrations and name differences before playback.
const demonstrations={
 'ce1-03-pathways-pilot.mp4':'This illustrated video uses Riley and a different pair of training routes. Follow how it compares entry, time, cost and uncertainty. When you return to Leah’s example, use Leah’s route records and figures; Riley’s costs are not additional charges in Leah’s case.',
 'ce1-04-labour-market-demo.mp4':'This illustrated video uses Sam and a wage headline as a separate example. Follow how date, region and the meaning of a wage figure change a conclusion. Use the Noor and Ellis records in this lesson for your written responses.',
 'co2-02-workplace-hazard-demo.mp4':'Follow Devin’s first-shift decision: identify the hazard, pause, ask for instructions and training, then reassess. Compare those steps with the exact hazards and controls in the lesson record before writing your response.',
 'fl1-01-paystub-demo.mp4':'This demonstration uses Mika’s May 1–14 statement. The current lesson uses September 1–14. Both examples deliberately use $225.00 gross, $30.40 deductions and $194.60 net. Follow the calculation here; use the September dates and time record in the lesson task.',
 'fl2-03-amortization-demo.mp4':'This demonstration shows another interest convention: 12% quoted with semi-annual compounding, converted to a monthly rate of about 0.975879%. It keeps full precision internally. The lesson’s Alex schedule instead uses exactly 1% per month and rounds each month to cents. Follow the balance → interest → principal → new balance sequence; use Alex’s stated convention for Alex’s answers.',
 'fl4-02-scam-verification-demo.mp4':'This demonstration includes a bank-looking message and a CRA web notice. The lesson record uses a bank-looking text and a caller claiming to be CRA. Follow the independent-verification method, then respond to the exact contact channel and request in the lesson cards.'
};
for(const [basename,copy] of Object.entries(demonstrations)){
 const block=$(`video source[src$="${basename}"]`).closest('.lesson-media');
 if(block.length!==1)throw Error('Demonstration missing '+basename);
 block.children('h2').next('p').text(copy);
 const id=block.closest('article').attr('id'),sectionId=id+'-video-example';block.attr('id',sectionId);
 const finlit=$('#'+id+'-finlit');if(finlit.length)finlit.after(block);
 const roadmap=$('#'+id).children('.lesson-roadmap').find('ol');
 const prior=roadmap.find(`[data-section-target="${finlit.length?id+'-finlit':id+'-stage-3'}"]`).closest('li');
 prior.after(`<li><a href="#${sectionId}" data-section-target="${sectionId}">Follow the video example or its written explanation</a></li>`);
}

const handouts=[
 {id:'ce1-01',slug:'career-planning',title:'Career Planning Assignment',heading:'Use a career suggestion as a question',
  original:'The original questions ask you to try self-assessment tools, list suggested careers and apply decision steps to a personal career choice.',
  task:'For this course, use Jordan’s notebook instead of a personal survey. Identify an action suggesting an interest or skill, then a question that would help investigate a possible direction. A suggestion is a starting point, not proof of fit.',
  next:'Use this distinction in the supported practice, then make Amina’s own strengths-and-goals card.',target:'ce1-01-stage-5'},
 {id:'ce1-03',slug:'decision-steps',title:'Decision Making — Key Steps Assignment',heading:'Use the decision questions with Leah’s records',
  original:'Questions 1–2 apply decision steps to education/training and career choices. Questions 3–4 use a trip and an event as further examples.',
  task:'Use questions 1–2 with Leah: what is the decision, what criteria matter, and how does each route compare? The worked example supplies the cost, preparation and timing evidence. The trip and concert tasks are optional extensions and are not part of this lesson’s required work.',
  next:'In the practice fields, explain how the changed condition affects the recommendation.',target:'ce1-03-stage-5'},
 {id:'co1-01',slug:'resume-tips',title:'Tips for Preparing a Resume Assignment',heading:'Apply the résumé task to one truthful statement',
  original:'The original assignment asks for a résumé for a hypothetical job and ten résumé principles from linked resources.',
  task:'This lesson concentrates on the evidence inside an application. Use the supplied welcome-helper posting and Rowan’s notes to choose a relevant duty and write a supported statement. You do not need personal contact details or a complete résumé for this task.',
  next:'Use the club attendance record in the supported practice. The final festival application uses the new fundraiser notes.',target:'co1-01-practice'},
 {id:'fl1-01',slug:'paycheque-deductions',title:'Paycheque Deductions Assignment',heading:'Separate a deduction from a benefit question',
  original:'Question 1 asks about EI eligibility and parental leave; questions 2–3 ask for CPP research, including a survey and CPP Investments.',
  task:'Mika’s statement can show that an EI amount was deducted. That line cannot answer the handout’s eligibility question. Here, use the supplied amounts to check hours, gross and net, and keep a separate note of what the statement cannot establish. The original research and survey are optional extensions.',
  next:'In the practice note, explain what the pay records support and what still needs payroll clarification. Do not invent revised deduction rates.',target:'fl1-01-stage-5'},
 {id:'fl1-05',slug:'smartphone-plans',title:'Smartphones and Plans Assignment',heading:'Compare what the phone must do and what it costs',
  original:'Questions 1–2 ask for phone features, costs and comparisons of models. Question 3 asks for rules from a parent’s perspective.',
  task:'Use the comparison idea with Marin’s supplied offers: identify the required use, then include the service price after the promotion, device payments and exit obligations. A live product search and the parent-rules task are not needed for this case.',
  next:'Use the changed contract situation in the practice fields; explain which charges remain.',target:'fl1-05-stage-5'},
 {id:'fl2-05',slug:'why-borrow',title:'Why Borrow Money Assignment',heading:'Ask what the borrowing would solve',
  original:'The original questions ask learners to research payday loans and lines of credit, including rates, access, uses and limits.',
  task:'Use that product-research habit with Nico’s actual financing quotation. Name the need, list the full repayment and fee, and compare it with the confirmed loaner and cash plan. This quotation supplies no payday-loan or line-of-credit terms; those are separate optional inquiries.',
  next:'In supported practice, test whether the shorter loaner still bridges the time needed to save.',target:'fl2-05-stage-5'},
 {id:'fl3-06',slug:'compounding',title:'The Magic of Compounding Assignment',heading:'Try the original contribution comparison',
  original:'Question 3 compares $40 and $60 monthly over 40 years at an assumed 5% return, then changes contributions in stages. Questions 1–2 use a $300,000 target and retirement assumptions.',
  task:'Try the first comparison as an optional calculator experiment: start at $0, use 40 years, an annual effective return of 5%, and 0% fees and inflation. Run $40 monthly, note the contributions and growth separately, then run $60. Our calculator deposits at month-end. The return is an illustration, not a prediction.',
  next:'Return to Ari’s revision afterwards. Ari’s and Devon’s required tasks have no supplied interest, so use the actual balance and deposits only.',target:'fl3-06-stage-5',experiment:true},
 {id:'fl4-02',slug:'frauds-scams',title:'Avoiding Frauds and Scams Assignment',heading:'Turn warning signs into a verification plan',
  original:'Question 1 asks about action after CRA impersonation; question 2 asks about fraud and examples; question 3 asks for a list of 20 methods used by scammers.',
  task:'Use the example-finding idea from questions 2–3 with the supplied contact cards. Name the request, point to a specific warning cue, and choose an independent verification route. A list of twenty is not required. For a CRA claim, use the current in-course CRA record: CRA can call, and an uncertain caller still needs checking.',
  next:'Apply that process in the supported practice. Action after someone has shared information is taught in the next lesson.',target:'fl4-02-stage-5'}
];
for(const h of handouts){
 const target=h.id==='co1-01'?'#co1-01-example':`#${h.id}-stage-4`;
 const alt=`${h.original} Adapted task in this lesson: ${h.task} ${h.next} Respond in the course fields; the captured PDF controls are not active.`;
 const buttons=h.experiment?[40,60].map(monthly=>`<button type="button" data-tool="tool-saving" data-load-calculation='${JSON.stringify({start:0,monthly,years:40,return:5,fee:0,inflation:0})}'>Try $${monthly} monthly in the saving calculator</button>`).join(''):'';
 $(target).append(`<details class="finlit-handout" id="${h.id}-finlit-activity"><summary>FINLIT activity · ${esc(h.heading)}</summary><div><p><strong>From ${esc(h.title)}, page 1.</strong> ${esc(h.original)}</p><p>${esc(h.task)}</p>${buttons}<p>${esc(h.next)} <a href="#${h.target}" data-section-target="${h.target}">Go to the practice fields</a>.</p><button type="button" data-open-resource-reader data-resource-path="assets/resources/finlit-${h.slug}.pdf" data-resource-page="1" data-resource-title="${esc(h.title)}" data-resource-alternative="${esc(alt)}">Read the original FINLIT activity</button><p class="save-note">The original opens in the course reader. Write in this lesson’s fields; buttons pictured in the original page are not active here.</p></div></details>`);
}
fs.writeFileSync(file,$.html());
const hashes=media.map(m=>({lessonId:m.lessonId,assetPath:m.assetPath,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,m.assetPath))).digest('hex')}));
fs.writeFileSync(path.join(__dirname,'finlit-integration.json'),JSON.stringify({date:'2026-09-28',mode:'build',canonical:'workspace/index.html',sourceBasis:'Existing FINLIT selected clips and transcripts; all eight original PDFs and supplied page images inspected. This is not full audio/caption certification.',media:hashes,plans,handouts,demonstrations,videoCount:$('video').length,newSavedKeys:media.map(m=>`media:${m.lessonId}:notice`),preservedFinalKeys:true,deferred:['Full media and synchronized-caption review','Accumulated accessibility, Studio, course readiness, learner E2E and separately authorized packaging']},null,2));
console.log(JSON.stringify({videos:$('video').length,finlit:$('[data-finlit-integration]').length,handouts:$('.finlit-handout').length}));
