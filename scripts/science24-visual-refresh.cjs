#!/usr/bin/env node
'use strict';

// One-time, hash-guarded integration of the approved A-D visual refresh.
// Canonical HTML/CSS/assets remain the owners after integration. Never use
// this file as a routine rebuild over subsequent teacher edits.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {load}=require('cheerio');
const {diagrams}=require('./lib/science24-visual-refresh-diagrams.cjs');
const ROOT=path.resolve(__dirname,'..'),STAMP='visual-refresh-2026-10-02';
const PACKAGE=path.join(ROOT,'projects/resources/science24-visual-refresh/package');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const normal=s=>s.replace(/\s+/g,' ').trim();
const writeJSON=(p,d)=>fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const dirs=u=>({ws:path.join(ROOT,`projects/science24-unit-${u}/workspace`),meta:path.join(ROOT,`projects/science24-unit-${u}/meta/${STAMP}`)});

const visuals=[
 ['a','05','a-energy-levels','Compare the net energy change','Interpret the energy pathway','evidence','Chemical energy is lower after an exothermic reaction and higher after an endothermic reaction. The arrows represent net transfer, not a particular molecular equation.'],
 ['a','06','a-word-equation','Read names, roles and direction','Keep names, roles and direction straight','evidence','Magnesium and oxygen are reactants; magnesium oxide is the product. The word equation names substances without specifying particle ratios.'],
 ['a','15','a-summary','Connect the explanations','How to complete this section','evidence','Use the same reasoning from the lessons: identify the material, interpret chemical change, account for atoms, trace energy and support a claim with evidence.'],
 ['b','01','b-energy-forms','Recognize energy in familiar systems','A bicycle at the top of a hill','opening','A system can involve more than one energy form. Use the visible situation to identify a form and explain the evidence.'],
 ['b','03','b-energy-account','Keep the whole energy account','Apply the relationship without a model','reference','For this stated boundary, 100 J in equals 35 J useful output plus 65 J in other outputs. “Wasted” energy is transferred, not destroyed.'],
 ['b','06','b-power','Read power as a rate','P = E ÷ t','evidence','Convert half a minute to 30 seconds first. Then 120 J ÷ 30 s = 4 W: four joules transferred each second.'],
 ['b','07','b-meter','What the meter records','Why bills use kilowatt-hours','support','An electricity meter records energy use over time in kWh. kWh is an energy unit; kW is a power unit. This photograph is an original textbook example.'],
 ['b','10','b-respiration','Separate the matter and energy accounts','Read the respiration equation','evidence','Glucose and oxygen become carbon dioxide and water in the simplified matter account. Chemical energy is transferred to cell processes and thermal energy.'],
 ['b','12','b-temperature','Trace a response to cooling','Stability through response','evidence','Detection, coordination and a response oppose cooling. As temperature changes, feedback adjusts the response; a usual range is not a perfectly fixed number.'],
 ['b','13','b-energy-needs','Compare activity for the same person','Food supports more than movement','opening','For the same person, greater physical activity usually increases daily energy needs. Rest days still require energy for ongoing body processes.'],
 ['b','16','b-pollution','Separate pollution evidence from climate claims','Explain distinct impacts','support','The textbook photograph shows an urban air-pollution context in Vancouver. A photograph cannot measure carbon dioxide or establish the contribution of a particular gas.'],
 ['b','17','b-summary','Follow stored energy through different pathways','Use four questions to organize your explanation','evidence','Sunlight, organic matter, respiration, fossil-fuel formation and combustion connect through energy pathways. This summary simplifies processes discussed in the lessons.'],
 ['c','01','c-germ-theory','Compare infection-control conditions','The lunch left on the counter','opening','This is an illustrative comparison, not a historical record. Evidence about pathogens changed infection-control practices; modern care still needs several prevention measures.'],
 ['c','03','c-transmission','Identify a route before choosing a control','Classify the disease, then explain the pathway','evidence','Air, water, direct or indirect contact, and vectors are different transmission pathways. Some diseases use more than one route.'],
 ['c','04','c-food-safety','Use complementary food-safety controls','Read each method as a change in conditions','evidence','Clean, separate, cook and chill reduce different risks. Chilling slows microbial growth; it does not sterilize food or undo every hazard.'],
 ['c','05','c-methods','Match the control to its target','Match the method to the target','evidence','Cleaning, disinfection, antisepsis and sterilization differ in their targets and intended outcomes. Aseptic practice prevents contamination during a task. Follow training and product directions.'],
 ['c','06','c-baseline','Compare reports with an expected baseline','Compare scale with a dated record','evidence','Existing authored scenario: a town usually reports about two cases per week but reports 25 this week. Verify cases, links and reporting before interpreting the increase. These are not surveillance observations.'],
 ['c','08','c-water-plant','A comparison facility for thinking about water systems','When a warning sign is missed','support','Dalecarlia Water Treatment Plant in Washington, D.C., illustrates a drinking-water facility. It is not the Walkerton system, and the photograph cannot establish what happened in that case.'],
 ['c','11','c-abo','Read the donor row and recipient column','Explain the matching, then state the limits','evidence','This matrix describes ABO red-cell compatibility only. Plasma compatibility differs; Rh, other antigens and laboratory cross-matching are outside this simplified diagram.'],
 ['c','12','c-resistance','See selection across a bacterial population','Match the agent, purpose and instructions','evidence','Some bacteria may be resistant before treatment. Susceptible bacteria are removed while resistant survivors can reproduce. Antibiotics do not treat viruses.'],
 ['c','16','c-mutations','Compare changes to the same reference sequence','Trace change → cell → possible consequence','evidence','These short single-strand sequences illustrate substitution, insertion and deletion. A change alone does not determine whether an organism is harmed; its context matters.'],
 ['c','18','c-defence-memory','Connect barriers, response and memory','Four questions organize the unit','evidence','Skin and mucous membranes help prevent entry. Inflammation is an innate response. Specific recognition and immune memory belong to adaptive immunity; memory is not a separate fourth defence line.'],
 ['d','01','d-reaction-zones','Separate thinking distance from braking distance','The pedestrian steps off the curb','opening','The vehicle travels forward through the thinking interval, then through the braking interval. Total stopping distance includes both. This road illustration is not to scale.'],
 ['d','02','d-distraction','Compare attention in the same road situation','The long drive home','opening','Reaction times in this illustration are examples, not observed data or limits that permit driving. Fatigue, distraction and impairment can delay or disrupt a response.'],
 ['d','04','d-distance','Account for the whole round trip','Rate, units and rearrangement','evidence','In this simplified 1600 m round trip, 800 m out and 800 m back return the traveller to the starting position. Distance is 1600 m; displacement is zero.'],
 ['d','07','d-momentum','Compare mass at the same velocity','Calculate p = mv','evidence','Two simplified systems move at +5 m/s. Momentum is +350 kg·m/s for 70 kg and +3750 kg·m/s for 750 kg. The mass is what the model includes; momentum alone does not give collision force.'],
 ['d','08','d-impulse','Compare the area under the force–time graph','Work independently','reference','The existing 100 N × 2 s and 400 N × 0.5 s cases both give an impulse magnitude of 200 N·s. These simplified constant-force plots show magnitudes; the direction of impulse must also be stated.'],
 ['d','09','d-stopping-force','Keep the impulse; change the stopping time','Calculate force from Δp','evidence','For the same 1000 kg vehicle changing from +10 m/s to rest, Δp = −10,000 kg·m/s. A 0.5 s stop has mean force −20,000 N; a 2.0 s stop has mean force −5000 N. The plotted magnitudes have equal area.'],
 ['d','13','d-summary','Connect prevention and impact protection','Four questions organize the unit','evidence','Reaction and braking determine stopping distance. During an impact, a longer stopping interval can reduce mean force for the same momentum change. Use the relevant model for each question.']
].map(([unit,lesson,id,title,anchor,pattern,caption])=>({unit,lesson,id,title,anchor,pattern,caption}));

const legends={
 'b-energy-forms':[['Chemical potential','A battery stores chemical energy.'],['Radiant','Sunlight transfers energy by radiation.'],['Kinetic','The moving cyclist has kinetic energy.'],['Elastic potential','A drawn bow stores elastic energy.'],['Thermal','A fire transfers energy to its surroundings.']],
 'b-energy-needs':[['Less-active day','Body processes still require energy.'],['More-active game day','Activity usually adds to daily energy needs.']],
 'c-germ-theory':[['Historical comparison','An illustrative ward before germ theory was widely accepted.'],['Modern prevention','Clean hands, prepared equipment and other controls reduce exposure.']],
 'c-transmission':[['Air','Droplets and aerosols can carry infectious agents.'],['Water','Contaminated water can transmit pathogens.'],['Contact','Direct contact or contaminated surfaces can transfer agents.'],['Vectors','Animals such as mosquitoes and ticks can transmit particular pathogens.']],
 'c-defence-memory':[['Physical barriers','Skin and mucous membranes limit entry.'],['Innate inflammation','Blood flow and immune-cell activity change in affected tissue.'],['Adaptive response','Activated B cells can produce antibodies that bind specific antigens.'],['Adaptive memory','Memory cells can support a faster later response. Vaccination can prepare memory; protection varies.']],
 'd-reaction-zones':[['Thinking distance','Distance travelled while the driver reacts.'],['Braking distance','Distance travelled while braking to stop.']],
 'd-distraction':[['Attentive example','Approximately one second in the illustration.'],['Distracted example','Approximately two to three seconds in the illustration. These are examples, not measured limits.']]
};

const raster={
 'b-energy-forms':'gen-b-l01-energy-forms.png','b-energy-needs':'gen-b-l13-energy-needs.png',
 'c-germ-theory':'gen-c-l01-germ-theory.png','c-transmission':'gen-c-l03-transmission.png',
 'c-water-plant':'photo-c-l08-water-treatment.jpg','d-distraction':'gen-d-l02-distraction.png'
};
const corrected={
 'c-defence-memory':'/Users/deanguedo/.codex/generated_images/01a0d455-5aff-7f30-a5dd-c5b497204b9c/exec-2c3688ab-dbf7-4ae3-b95d-0399a370685a.png',
 'd-reaction-zones':'/Users/deanguedo/.codex/generated_images/01a0d455-5aff-7f30-a5dd-c5b497204b9c/exec-3d52b97c-54d9-49d3-845d-f6bb7b837383.png'
};
const sourceURLs={
 'c-food-safety':'https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling',
 'c-methods':'https://www.cdc.gov/infection-control/hcp/disinfection-sterilization/introduction-methods-definition-of-terms.html',
 'c-abo':'https://www.redcrossblood.org/donate-blood/blood-types.html',
 'c-resistance':'https://www.cdc.gov/antimicrobial-resistance/about/index.html',
 'c-defence-memory':'https://pubweb-prod.niaid.nih.gov/research/immune-system-overview'
};
const videoMoves={
 a:{'04':{heading:'What counts as useful evidence?',at:'after'},'05':{figure:'.energy-direction-figure',at:'after'},'09':{worked:true,at:'after'}},
 b:{'01':{heading:'Name the form and the evidence',at:'after'},'03':{worked:true,at:'after'},'08':{worked:true,at:'after'},'09':{figure:'[data-enlarge-figure="plant-energy"]',at:'before'},'11':{figure:'[data-enlarge-figure="food-pyramid"]',at:'before'}},
 c:{'09':{figure:'[data-enlarge-figure="inflammation-source"]',at:'after'},'10':{figure:'[data-enlarge-figure="immune"]',at:'before',reference:true},'13':{figure:'[data-enlarge-figure="dna-scale"]',at:'before'},'14':{worked:true,at:'after'},'15':{heading:'Apply the relationship without a model',at:'before'}},
 d:{'04':{worked:true,at:'after'},'05':{heading:'Work independently',at:'before'},'07':{figure:'[data-enlarge-figure="s24x-d-momentum"]',at:'after'},'08':{worked:true,at:'after'},'10':{figure:'[data-enlarge-figure="collision-momentum"]',at:'after'},'11':{figure:'[data-enlarge-figure="barriers"]',at:'before'},'12':{figure:'[data-enlarge-figure="retractor"]',at:'after'}}
};

const css=`/* Scoped presentation for the 2026-10-02 local review candidate. */
.s24x-topic{container-type:inline-size;container-name:s24x-topic}
.s24x-figure{max-width:100%;margin:24px 0!important;min-width:0;background:#fff}
.s24x-figure .figure-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;background:#f7f9f5;border-bottom:1px solid var(--border)}
.s24x-figure .figure-toolbar strong{font:750 17px/1.4 'Work Sans',Arial,sans-serif}
.s24x-figure .figure-toolbar button{flex:0 0 auto;font:750 14px/1.4 'Work Sans',Arial,sans-serif}
.s24x-figure>img{display:block;width:100%;height:auto;object-fit:contain}
.s24x-figure>img[src$=".svg"]{max-width:600px;margin-inline:auto}
.s24x-evidence>img{max-width:800px;margin-inline:auto}
.s24x-figure figcaption{padding:16px;line-height:1.6;font-size:16px;color:var(--ink);overflow-wrap:anywhere}
.s24x-figure .s24x-credit{display:block;margin-top:10px;font-size:14px;line-height:1.6;color:var(--muted)}
.s24x-legend{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 24px;margin:0 0 16px}
.s24x-legend>div{min-width:0;padding-bottom:10px;border-bottom:1px solid var(--border)}
.s24x-legend dt{font-weight:800}.s24x-legend dd{margin:5px 0 0;font-size:16px}
.s24x-opening>img{max-width:900px;margin-inline:auto}
.s24x-support-layout,.s24x-reference-layout{display:block;min-width:0}
.s24x-support-layout .s24x-figure{max-width:700px}
.s24x-practice-body,.s24x-narrative{min-width:0}
.s24x-decision{padding:18px 22px;border-left:3px solid var(--teal);background:#f3f8f3;max-width:72ch}
.s24x-video-support{display:block!important;grid-template-columns:none!important}
.s24x-video-support>h2{display:block;max-width:none!important;margin:0 0 20px!important}
.s24x-video-support>[data-video-card]{display:block;width:100%;min-width:0}
.s24x-video-support .video-card{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)!important;gap:20px 24px;max-width:100%;width:100%;min-width:0;padding:24px}
.s24x-video-support .video-copy{grid-column:1;grid-row:1;min-width:0}
.s24x-video-support .video-stage{grid-column:2;grid-row:1;min-width:0;width:100%;height:auto;min-height:0;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;align-self:start}
.s24x-video-support .video-stage iframe,.s24x-video-support .video-stage video{width:100%;height:100%;border:0}
.s24x-video-support .video-footer,.s24x-video-support .concept-summary{grid-column:1/-1;grid-row:auto;min-width:0}
.s24x-video-support .video-footer{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.s24x-video-support .video-copy h3{font:750 24px/1.25 'Hanken Grotesk',Arial,sans-serif;margin:10px 0 12px}
.s24x-video-support .video-copy p{max-width:none!important}
.s24x-video-beat{margin:24px 0;padding:24px!important;border:1px solid var(--border);border-left:4px solid var(--teal);background:#f5f9f4}
.s24x-topic>.s24x-video-beat{margin:24px 54px}
.s24x-coal .coal-panel-crop{display:none!important}
.s24x-coal .coal-overview-image{display:block!important}
.s24x-coal .coal-panel-guide ol{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0}
@container s24x-topic (min-width:1028px){
 .s24x-support-layout,.s24x-reference-layout{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:24px;align-items:start}
 .s24x-support-layout .s24x-figure,.s24x-reference-layout .s24x-figure{grid-column:2;grid-row:1;margin:0!important}
 .s24x-support-layout .s24x-narrative,.s24x-reference-layout .s24x-practice-body{grid-column:1;grid-row:1}
 .s24x-reference-layout .s24x-sticky-figure{position:sticky;top:calc(var(--top,64px) + 20px);align-self:start}
 .s24x-reference-layout .s24x-figure figcaption{font-size:14px}
}
@container s24x-topic (max-width:850px){
 .s24x-video-support .video-card{grid-template-columns:1fr!important}
 .s24x-video-support .video-copy,.s24x-video-support .video-stage,.s24x-video-support .video-footer,.s24x-video-support .concept-summary{grid-column:1;grid-row:auto}
 .s24x-video-support .video-footer{grid-template-columns:1fr;gap:12px}
}
@media(max-width:760px){
 .s24x-topic>.s24x-video-beat{margin:20px 22px;padding:16px!important}
 .s24x-video-support .video-card{padding:16px;gap:18px;grid-template-columns:1fr!important}
 .s24x-video-support .video-copy,.s24x-video-support .video-stage,.s24x-video-support .video-footer,.s24x-video-support .concept-summary{grid-column:1;grid-row:auto}
 .s24x-video-support .video-footer,.s24x-legend{grid-template-columns:1fr}
 .s24x-figure .figure-toolbar{padding:12px;align-items:start}
 .s24x-figure figcaption{padding:12px;font-size:16px}
 .s24x-coal .coal-overview-image{display:none!important}
 .s24x-coal .coal-panel-guide ol{grid-template-columns:1fr;gap:16px;border:0}
 .s24x-coal .coal-panel-guide li{border:1px solid var(--border);padding:0 0 14px;background:#fff}
 .s24x-coal .coal-panel-crop{display:block!important;aspect-ratio:auto!important;height:auto!important;overflow:visible!important;margin-bottom:12px}
 .s24x-coal .coal-panel-crop img{position:static!important;transform:none!important;width:100%!important;height:auto!important;max-width:100%!important}
 .s24x-coal .coal-panel-guide li strong,.s24x-coal .coal-panel-guide li span{margin-inline:14px}
}
@media print{.s24x-topic{container-type:normal}.s24x-reference-layout .s24x-sticky-figure{position:static}.s24x-support-layout,.s24x-reference-layout{display:block}.s24x-video-support{break-inside:auto}}
`;

function readData(ws){const p=path.join(ws,'course-data.json');if(fs.existsSync(p))return JSON.parse(fs.readFileSync(p));return JSON.parse(fs.readFileSync(path.join(ws,'course-data.js'),'utf8').replace(/^window\.S24_DATA\s*=\s*/,'').replace(/;\s*$/,''));}
function doc(html){const $=load(html,{sourceCodeLocationInfo:true});const raw=e=>{const l=e?.sourceCodeLocation;if(!l)throw Error('No source location');return html.slice(l.startOffset,l.endOffset);};return {$,raw};}
function patch(html,edits){let end=Infinity;for(const e of edits.sort((a,b)=>b.start-a.start)){if(e.end>end)throw Error('Overlapping source edits');html=html.slice(0,e.start)+e.text+html.slice(e.end);end=e.start;}return html;}
function sectionFor($,page,heading){const s=page.find('h2,h3').filter((_,e)=>normal($(e).text())===heading).first().closest('section');if(!s.length)throw Error('Missing section: '+heading);return s[0];}
function insertInSection(html,unit,lesson,heading,insert){const {$}=doc(html),n=sectionFor($,$(`#lesson-${lesson}`),heading);return patch(html,[{start:n.sourceCodeLocation.endTag.startOffset,end:n.sourceCodeLocation.endTag.startOffset,text:'\n'+insert+'\n'}]);}
function assetInfo(v){let file,kind='authored-native-diagram',credit='Original course diagram authored for Science 24.';
 if(diagrams[v.id])file=v.id+'.svg';
 else if(raster[v.id]){file=v.id+path.extname(raster[v.id]);kind=v.id==='c-water-plant'?'licensed-photograph':'supplied-generated-illustration';credit=kind==='licensed-photograph'?'<a href="https://commons.wikimedia.org/wiki/File:Dalecarlia_Water_Treatment_Plant.jpg" target="_blank" rel="noopener noreferrer">AgnosticPreachersKid, Dalecarlia Water Treatment Plant</a> · <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>. Supplied resized version; no additional image changes.':'Original course illustration generated for Science 24.';}
 else if(corrected[v.id]){file=v.id+'.png';kind='corrected-generated-illustration';credit='Original course illustration generated for Science 24; corrected for this review.';}
 else if(v.id==='b-meter'){file='b-meter-p110.jpg';kind='textbook-crop';credit='Science 24 textbook, printed p. 110 · physical PDF p. 23 · Figure 6.11. Figure crop; source PDF unchanged.';}
 else if(v.id==='b-pollution'){file='b-pollution-p147.jpg';kind='textbook-crop';credit='Science 24 textbook, printed p. 147 · physical PDF p. 50 · Figure 8.12. Photograph crop; source PDF unchanged.';}
 else throw Error('Unknown asset '+v.id);
 return {file,kind,credit,image:'assets/visual-refresh/'+file,sourceUrl:sourceURLs[v.id]||null}; }
function figure(v){const a=assetInfo(v),key='s24x-'+v.id;const legend=legends[v.id]?`<dl class="s24x-legend">${legends[v.id].map(([k,t],i)=>`<div><dt data-canvas-helper-edit-key="${key}-term-${i}">${esc(k)}</dt><dd data-canvas-helper-edit-key="${key}-meaning-${i}">${esc(t)}</dd></div>`).join('')}</dl>`:'';
 return `<figure class="science-figure s24x-figure s24x-${v.pattern}" data-s24x-visual="${v.id}"><div class="figure-toolbar"><strong data-canvas-helper-edit-key="${key}-title">${esc(v.title)}</strong><button class="text-link" type="button" data-enlarge-figure="${key}" aria-label="Enlarge: ${esc(v.title)}">View larger</button></div><img src="${a.image}" alt="${esc(v.caption)}" data-canvas-helper-edit-key="${key}-image"><figcaption>${legend}<span data-canvas-helper-edit-key="${key}-caption">${esc(v.caption)}</span><small class="s24x-credit" data-canvas-helper-edit-key="${key}-credit">${a.credit}</small></figcaption></figure>`; }
function wrapSectionContent(html,unit,lesson,heading,fig,type){const {$}=doc(html),n=sectionFor($,$(`#lesson-${lesson}`),heading),loc=n.sourceCodeLocation;
 // Retain the original heading/label followed by the unchanged narrative or controls.
 const headings=$(n).children('h2,h3,.section-label');let cut=loc.startTag.endOffset;headings.each((_,e)=>{if(e.sourceCodeLocation&&e.sourceCodeLocation.endOffset>cut)cut=e.sourceCodeLocation.endOffset;});
 const body=html.slice(cut,loc.endTag.startOffset);return patch(html,[{start:cut,end:loc.endTag.startOffset,text:`\n<div class="s24x-${type}-layout">${fig}<div class="s24x-${type==='reference'?'practice-body':'narrative'}">${body}</div></div>\n`}]); }
function moveExistingImmuneFigure(html){const {$,raw}=doc(html),f=$('#lesson-10 [data-enlarge-figure="immune"]').closest('figure').first();if(!f.length)throw Error('Missing immune figure');const n=f[0],value=raw(n).replace('class="science-figure"','class="science-figure s24x-figure s24x-sticky-figure"');html=patch(html,[{start:n.sourceCodeLocation.startOffset,end:n.sourceCodeLocation.endOffset,text:''}]);return wrapSectionContent(html,'c','10','Apply the relationship without a model',value,'reference');}
function moveVideo(html,u,n,rule){let {$,raw}=doc(html);const p=$(`#lesson-${n}`),card=p.find('[data-video-card]').first(),v=card.closest('section');if(v.length!==1)throw Error('Missing lesson video '+u+n);const node=v[0],old=raw(node);let value=old.replace(/class="([^"]*)"/,(_,c)=>`class="${c} s24x-video-beat"`);html=patch(html,[{start:node.sourceCodeLocation.startOffset,end:node.sourceCodeLocation.endOffset,text:''}]);
 ({$,raw}=doc(html));const page=$(`#lesson-${n}`);let target;
 if(rule.heading)target=sectionFor($,page,rule.heading);
 else if(rule.worked)target=page.find('.worked-example').first()[0];
 else{let el=page.find(rule.figure).first();if(!el.is('figure'))el=el.closest('figure');if(rule.reference)el=el.closest('.s24x-reference-layout');target=el[0];}
 if(!target?.sourceCodeLocation)throw Error('Missing video destination '+u+n+JSON.stringify(rule));const point=rule.at==='before'?target.sourceCodeLocation.startOffset:target.sourceCodeLocation.endOffset;return patch(html,[{start:point,end:point,text:'\n'+value+'\n'}]); }
function addScopedClasses(html){const {$}=doc(html),edits=[];$('[id^="lesson-"]>.p2-topic').each((_,e)=>{const l=e.sourceCodeLocation?.attrs?.class;if(l)edits.push({start:l.startOffset,end:l.endOffset,text:html.slice(l.startOffset,l.endOffset).replace(/"$/,' s24x-topic"')});});
 $('[id^="lesson-"] [data-video-card]').each((_,e)=>{const n=$(e).closest('.content-section')[0],l=n?.sourceCodeLocation?.attrs?.class;if(l)edits.push({start:l.startOffset,end:l.endOffset,text:html.slice(l.startOffset,l.endOffset).replace(/"$/,' s24x-video-support"')});});
 return patch(html,edits); }
function fixCoal(html){const {$}=doc(html),layout=$('#lesson-14 .coal-figure-layout')[0];if(!layout)throw Error('Missing coal layout');const l=layout.sourceCodeLocation.attrs.class,edits=[{start:l.startOffset,end:l.endOffset,text:html.slice(l.startOffset,l.endOffset).replace(/"$/,' s24x-coal"')}];
 $('#lesson-14 .coal-panel-crop img').each((i,e)=>{const src=e.sourceCodeLocation.attrs.src;edits.push({start:src.startOffset,end:src.endOffset,text:`src="assets/visual-refresh/coal-panel-${'abcd'[i]}-p136.jpg"`});});if(edits.length!==5)throw Error('Expected four coal panel images');return patch(html,edits); }
function emphasiseDecision(html){const {$}=doc(html),section=sectionFor($,$('#lesson-17'),'Judge research by evidence, consent and alternatives');const e=$(section).children('p').first()[0];if(!e)throw Error('Missing ethical-decision prose');const a=e.sourceCodeLocation.attrs.class;if(a)return patch(html,[{start:a.startOffset,end:a.endOffset,text:html.slice(a.startOffset,a.endOffset).replace(/"$/,' s24x-decision"')}]);const point=e.sourceCodeLocation.startTag.startOffset+2;return patch(html,[{start:point,end:point,text:' class="s24x-decision"'}]);}

function apply(){
 for(const u of 'abcd'){const {ws,meta}=dirs(u),baseline=JSON.parse(fs.readFileSync(path.join(meta,'baseline.json')));if(sha(fs.readFileSync(path.join(ws,'index.html')))!==baseline.files['index.html'])throw Error('Current HTML differs from frozen baseline: '+u);}
 const prepared=[];
 for(const u of 'abcd'){
  const {ws,meta}=dirs(u);fs.mkdirSync(path.join(ws,'assets/visual-refresh'),{recursive:true});const data=readData(ws);let html=fs.readFileSync(path.join(ws,'index.html'),'utf8');
  for(const v of visuals.filter(x=>x.unit===u)){const a=assetInfo(v),dest=path.join(ws,a.image);
   if(diagrams[v.id])fs.writeFileSync(dest,diagrams[v.id]);else if(raster[v.id])fs.copyFileSync(path.join(PACKAGE,'assets',raster[v.id]),dest);else if(corrected[v.id])fs.copyFileSync(corrected[v.id],dest);else if(!fs.existsSync(dest))throw Error('Source crop must be prepared: '+dest);
   data.figures['s24x-'+v.id]={title:v.title,image:a.image,alt:v.caption};let f=figure(v);if(v.pattern==='reference'){f=f.replace('s24x-reference"','s24x-reference s24x-sticky-figure"');html=wrapSectionContent(html,u,v.lesson,v.anchor,f,'reference');}else if(v.pattern==='support')html=wrapSectionContent(html,u,v.lesson,v.anchor,f,'support');else html=insertInSection(html,u,v.lesson,v.anchor,f);
  }
  if(u==='b')html=fixCoal(html);if(u==='c'){html=moveExistingImmuneFigure(html);html=emphasiseDecision(html);}
  for(const [n,rule]of Object.entries(videoMoves[u]))html=moveVideo(html,u,n,rule);
  html=addScopedClasses(html);html=html.replace('</head>','<link rel="stylesheet" href="assets/visual-refresh.css">\n</head>');prepared.push({u,ws,meta,html,data});
 }
 for(const {u,ws,meta,html,data}of prepared){
  fs.writeFileSync(path.join(ws,'index.html'),html);fs.writeFileSync(path.join(ws,'assets/visual-refresh.css'),css);
  if(u==='a')fs.writeFileSync(path.join(ws,'course-data.js'),'window.S24_DATA = '+JSON.stringify(data)+';\n');else{writeJSON(path.join(ws,'course-data.json'),data);execFileSync(process.execPath,[path.join(ROOT,'scripts/compile-science24-bcd-data.cjs'),'--project',`science24-unit-${u}`],{stdio:'pipe'});}
  const projectPath=path.join(ROOT,`projects/science24-unit-${u}/meta/project.json`),project=JSON.parse(fs.readFileSync(projectPath));const assets=fs.readdirSync(path.join(ws,'assets/visual-refresh')).map(n=>`projects/science24-unit-${u}/workspace/assets/visual-refresh/${n}`);for(const p of [...assets,`projects/science24-unit-${u}/workspace/assets/visual-refresh.css`])if(!project.canonicalSources.includes(p))project.canonicalSources.push(p);writeJSON(projectPath,project);
  const $=load(html),count=$('[id^="lesson-"]').filter((_,e)=>/^lesson-\d\d$/.test(e.attribs.id)).length;const rows=[];
  for(let i=1;i<=count;i++){const n=String(i).padStart(2,'0'),vs=visuals.filter(v=>v.unit===u&&v.lesson===n);const extras=u==='b'&&n==='14'?['Replace repeated whole-image thumbnails with focused phone panels']:u==='c'&&n==='10'?['Keep the existing immune figure beside practice']:u==='c'&&n==='17'?['Emphasise the existing ethical-decision prose']:[];rows.push({unit:u,lesson:n,title:normal($(`#lesson-${n} h1`).first().text()),disposition:vs.length||videoMoves[u][n]||extras.length?'refreshed':'keep',visuals:vs.map(v=>({...v,...assetInfo(v),assetSha256:sha(fs.readFileSync(path.join(ws,assetInfo(v).image))),sourceRole:assetInfo(v).kind,reviewStatus:'awaiting completed candidate review'})),videoMoved:!!videoMoves[u][n],videoDestination:videoMoves[u][n]||null,otherChanges:extras,reviewStatus:'pending'});}
  writeJSON(path.join(meta,'lesson-matrix.json'),rows);writeJSON(path.join(meta,'implementation.json'),{schemaVersion:1,role:'historical integration; canonical workspace owns future edits',newVisuals:visuals.filter(v=>v.unit===u).length,videoMoves:Object.keys(videoMoves[u]).length,originalRuntime:'unchanged',authoringStatus:'blocked',candidateHTML:sha(Buffer.from(html)),allLessons:count});
  console.log(`${u.toUpperCase()}: ${count} lessons; ${visuals.filter(v=>v.unit===u).length} new visual placements; ${Object.keys(videoMoves[u]).length} video moves`);
 }
}
if(require.main===module){if(process.argv[2]!=='apply')throw Error('Usage: node scripts/science24-visual-refresh.cjs apply (one time only, before teacher edits)');apply();}
module.exports={visuals,videoMoves,dirs,readData,assetInfo,sha,STAMP,ROOT};
