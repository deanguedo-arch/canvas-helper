#!/usr/bin/env node
'use strict';
// One-time placement refinement of the frozen visual-refresh candidate.
const fs=require('node:fs'),path=require('node:path'),{load}=require('cheerio');
const {dirs,visuals,sha}=require('./science24-visual-refresh.cjs');
const notes={
 'a-energy-levels':[['Exothermic','Products have lower chemical energy; net energy leaves the reacting system.'],['Endothermic','Products have higher chemical energy; net energy enters the reacting system.']],
 'a-word-equation':[['Reactants','Magnesium and oxygen are the starting substances.'],['Arrow','Read the arrow as “produces.”'],['Product','Magnesium oxide is the substance formed.']],
 'a-summary':[['Choose a material','Connect its properties with the job.'],['Explain a reaction','Use evidence of new substances; account for atoms and energy transfer.'],['Support a claim','Explain the pathway and the limits of the evidence.']],
 'b-energy-account':[['Input','100 J enters the stated device boundary.'],['Outputs','35 J useful + 65 J other outputs = 100 J. Energy is conserved.']],
 'b-power':[['Convert the time','Half a minute = 30 s.'],['Calculate the rate','120 J ÷ 30 s = 4 W, or four joules each second.']],
 'b-respiration':[['Matter','Glucose + oxygen → carbon dioxide + water.'],['Energy','Chemical energy is transferred to cell processes and thermal energy.']],
 'b-temperature':[['Detect and coordinate','Receptors detect cooling; the brain coordinates a response.'],['Oppose the change','Shivering and heat conservation oppose cooling.'],['Adjust the response','Feedback changes the response as temperature moves toward its usual range.']],
 'b-summary':[['Store energy','Photosynthesis stores energy from sunlight in organic matter.'],['Use food','Cellular respiration transfers energy to cell processes and thermal energy.'],['Follow ancient organic matter','Fossil-fuel formation takes geological time; combustion transfers stored chemical energy.']],
 'c-food-safety':[['Clean','Clean hands, surfaces and tools.'],['Separate','Keep raw food apart from ready-to-eat food.'],['Cook','Use an appropriate safe temperature.'],['Chill','Slow microbial growth; chilling does not sterilize food.']],
 'c-methods':[['Cleaning','Remove material from the item or surface.'],['Disinfection','Reduce specified microorganisms on suitable non-living surfaces.'],['Antisepsis','Reduce microorganisms on living tissue with an appropriate product.'],['Sterilization','Use a validated process to eliminate viable microorganisms on equipment.'],['Aseptic practice','Prevent contamination during a task.']],
 'c-baseline':[['Expected baseline','Approximately two reported cases per week in this authored example.'],['This week','25 reported cases. Compare the same place and time period; investigate the increase.']],
 'c-abo':[['O red cells','ABO-compatible with O, A, B and AB recipients.'],['A red cells','ABO-compatible with A and AB recipients.'],['B red cells','ABO-compatible with B and AB recipients.'],['AB red cells','ABO-compatible with AB recipients. Rh and cross-matching are not represented.']],
 'c-resistance':[['Before treatment','Some bacteria are already resistant.'],['Selection','Susceptible bacteria are removed; resistant bacteria can survive.'],['Later population','Survivors reproduce. Treatment selects survivors rather than purposefully changing every bacterium.']],
 'c-mutations':[['Reference','ACTGAC, a schematic single-strand sequence.'],['Substitution','ACAGAC: replace the third base.'],['Insertion','ACGTGAC: add G after the second base.'],['Deletion','ACGAC: remove the third base.']],
 'd-distance':[['Path distance','800 m out + 800 m back = 1600 m.'],['Displacement','Start and finish are at A, so displacement is 0 m.']],
 'd-momentum':[['Shared velocity','Both model systems travel at +5 m/s.'],['70 kg system','70 kg × 5 m/s = +350 kg·m/s.'],['750 kg system','750 kg × 5 m/s = +3750 kg·m/s.']],
 'd-impulse':[['Lower force, longer time','100 N × 2 s = 200 N·s.'],['Higher force, shorter time','400 N × 0.5 s = 200 N·s.'],['Read the graph','Each rectangle has the same area. Force magnitudes are plotted; also state the direction.']],
 'd-stopping-force':[['Same momentum change','A 1000 kg vehicle goes from +10 m/s to rest: Δp = −10,000 kg·m/s.'],['Shorter stop','0.5 s gives a mean force of −20,000 N.'],['Longer stop','2.0 s gives a mean force of −5000 N.'],['Read the graph','Average-force rectangles have equal area: impulse magnitude 10,000 N·s.']],
 'd-summary':[['Before a collision','Thinking distance = speed × reaction time. Add braking distance to find total stopping distance.'],['During an impact','Impulse equals momentum change. For the same change, a longer time can reduce mean force.']]
};
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function parse(html){return load(html,{sourceCodeLocationInfo:true});}
function splice(html,edits){for(const e of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,e.start)+e.text+html.slice(e.end);return html;}
const prepared=[];
for(const u of 'abcd'){
 const {ws,meta}=dirs(u),p=path.join(ws,'index.html');let html=fs.readFileSync(p,'utf8');
 const expected=JSON.parse(fs.readFileSync(path.join(meta,'implementation.json'))).candidateHTML;
 if(sha(Buffer.from(html))!==expected)throw Error('HTML has changed since integration: '+u);
 for(const v of visuals.filter(v=>v.unit===u&&['opening','evidence'].includes(v.pattern))){
  const $=parse(html),f=$(`[data-s24x-visual="${v.id}"]`)[0],l=f.sourceCodeLocation,s=f.parent;
  const h=$(s).children('h2,h3').last()[0];if(!h)throw Error('Missing heading: '+v.id);
  html=splice(html,[{start:l.startOffset,end:l.endOffset,text:''},{start:h.sourceCodeLocation.endOffset,end:h.sourceCodeLocation.endOffset,text:'\n'+html.slice(l.startOffset,l.endOffset)+'\n'}]);
 }
 for(const [id,rows]of Object.entries(notes)){
  if(!visuals.some(v=>v.unit===u&&v.id===id))continue;
  const $=parse(html),f=$(`[data-s24x-visual="${id}"]`),cap=f.children('figcaption')[0].sourceCodeLocation;
  const text=`<dl class="s24x-diagram-notes">${rows.map(([term,meaning],i)=>`<div><dt data-canvas-helper-edit-key="s24x-${id}-small-term-${i}">${esc(term)}</dt><dd data-canvas-helper-edit-key="s24x-${id}-small-meaning-${i}">${esc(meaning)}</dd></div>`).join('')}</dl>`;
  html=splice(html,[{start:cap.startTag.endOffset,end:cap.startTag.endOffset,text}]);
 }
 // Keep the original figure + reading guide contiguous. Videos have their own row.
 const escapes=u==='c'?[['09','.visual-reading-pair','after']]:u==='d'?[['11','.source-figure-layout','before'],['10','section.content-section','after'],['12','section.content-section','after'],['07','section.content-section','after']]:[];
 for(const [n,selector,at]of escapes){
  let $=parse(html),v=$(`#lesson-${n} .s24x-video-beat`)[0],l=v.sourceCodeLocation,target=$(v).parents(selector).first()[0];
  if(!target)throw Error('Missing video parent '+u+n);
  const raw=html.slice(l.startOffset,l.endOffset),point=at==='before'?target.sourceCodeLocation.startOffset:target.sourceCodeLocation.endOffset;
  html=splice(html,[{start:l.startOffset,end:l.endOffset,text:''},{start:point,end:point,text:'\n'+raw+'\n'}]);
 }
 prepared.push({u,ws,meta,html});
}
for(const {u,ws,meta,html}of prepared){
 fs.writeFileSync(path.join(ws,'index.html'),html);
 const cssPath=path.join(ws,'assets/visual-refresh.css');let css=fs.readFileSync(cssPath,'utf8');
 css=css.replace('.s24x-figure{','.s24x-figure{container-type:inline-size;container-name:s24x-figure;');
 css=css.replace('.s24x-video-support{','.s24x-video-support{grid-column:1/-1;');
 css+=`\n.s24x-diagram-notes{display:none;margin:0 0 18px;gap:12px}.s24x-diagram-notes dt{font-weight:800}.s24x-diagram-notes dd{margin:4px 0 0;line-height:1.6}\n@container s24x-figure (max-width:500px){.s24x-diagram-notes{display:grid}.s24x-legend{grid-template-columns:1fr}}\n`;
 fs.writeFileSync(cssPath,css);
 const imp=JSON.parse(fs.readFileSync(path.join(meta,'implementation.json')));imp.candidateHTML=sha(Buffer.from(html));imp.placementRefinement='Diagrams before explanations; videos clear of figure/guide grids; native narrow-layout explanations';fs.writeFileSync(path.join(meta,'implementation.json'),JSON.stringify(imp,null,2)+'\n');
 console.log(u+': placement and narrow-layout text refined');
}
