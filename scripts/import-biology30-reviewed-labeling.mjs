import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {load} from 'cheerio';
const input=process.argv[2];
if(!input)throw Error('Provide extracted Biology30_Labeling_Package directory');
const resource='projects/resources/biology30-labeling-package';
fs.mkdirSync(resource,{recursive:true});
if(path.resolve(input)!==path.resolve(resource))fs.cpSync(input,resource,{recursive:true});
const review=[
 {number:1,status:'needs-correction',reason:'C lands at the pupil/iris boundary rather than distinctly on iris; K points to a retinal depression away from the optic nerve exit but the key calls it optic disc. Retarget C onto iris and K onto the actual nerve exit, or name the depicted depression fovea and add a separate optic-disc target.'},
 {number:2,status:'cleared-limited-scope',reason:'Retinal layers and opposing light/neural directions agree with p.415. Right panel is a simplified route, not a diagram for grading optic chiasm or partial crossing.'},
 {number:3,status:'needs-correction',reason:'S targets the lower wall of the enlarged cochlear cross-section, not a round window at the basal cochlea. Move S to the basal round window in the main view; distinguish cochlea from vestibular canal structure.'},
 {number:4,status:'cleared-with-key-cleanup',reason:'Cupula and otolith apparatus kept separate. H specifically targets stereocilia, not the hair-cell body; use stereocilia in the ampulla as its key.'},
 {number:5,status:'needs-correction',reason:'In the thyroid inset, D points to a yellow parathyroid nodule while its answer is thyroid. Move D to pink thyroid tissue, keeping E on a parathyroid nodule.'},
 {number:6,status:'cleared-with-key-cleanup',reason:'Separate anterior hormone secretion and hypothalamic axons to posterior release agree with Fig.13.12. Use adrenal cortex for ACTH target P, and explicit gland/tissue keys.'},
 {number:7,status:'needs-correction',reason:'Blue arrows point into collecting-duct lumen, reversing reabsorption. Reverse arrows to lumen-to-interstitium/blood and label the two empty upper boxes. Avoid equating whole nephron with collecting duct.'},
 {number:8,status:'needs-clarification',reason:'Physiological feedback order agrees with p.448, but C points at the small yellow pituitary lobe. Clearly identify/redraw it as anterior pituitary rather than requiring students to infer a nonstandard lobe depiction.'},
 {number:9,status:'needs-correction',reason:'ACTH branch produces both aldosterone and cortisol in this image. Remove aldosterone from the HPA branch, or show its separate angiotensin II/potassium regulation. Include cortisol effects and negative feedback if testing the full loop.'},
 {number:10,status:'cleared-limited-scope',reason:'Beta insulin and alpha glucagon pathways match taught content. Keys identify tissues/pathway; add teaching note about glucose uptake/storage versus liver glucose release and return toward a workable range.'}
];
const suppliedAsIs=process.argv.includes('--all-supplied');
const approved=suppliedAsIs?{12:[1,2,3,4],13:[5,6,7,8,9,10]}:{12:[2,4],13:[6,10]};
const titles={2:'Retinal layers and visual signaling',4:'Vestibular apparatus and equilibrium',6:'Hypothalamus and pituitary pathways',10:'Insulin and glucagon feedback'};
const lessons={1:2,2:4,3:5,4:7,5:1,6:4,7:6,8:7,9:10,10:12};
const notes={2:'This diagram shows retinal layers and a simplified route to the visual cortex. It does not show optic-chiasm crossing. Incoming light and retinal neural signaling travel in opposite directions.',4:'Distinguish rotation sensing in the semicircular canals from gravity and linear-motion sensing in the utricle and saccule. H identifies the stereocilia projecting from hair cells.',6:'ADH and oxytocin are produced in hypothalamic neurons and released from the posterior pituitary. ACTH targets the adrenal cortex. The anterior pituitary produces its own hormones.',10:'Insulin promotes glucose uptake in muscle and adipose tissue and storage in the liver; glucagon promotes liver glucose release. Both pathways move blood glucose back toward a workable range.'};
for(const chapter of [12,13]){
 const dir=`projects/biology30-chapter-${chapter}`;
 const $=load(fs.readFileSync(`${dir}/workspace/index.html`,'utf8'));
 const data=JSON.parse($('#course-data').text());
 fs.mkdirSync(`${dir}/workspace/assets/labeling`,{recursive:true});
 for(const number of approved[chapter]){
  const prefix=String(number).padStart(2,'0')+'_';
  const image=fs.readdirSync(`${input}/images`).find(n=>n.startsWith(prefix));
  const key=fs.readdirSync(`${input}/answer_keys`).find(n=>n.startsWith(prefix));
  const answers=Object.fromEntries([...fs.readFileSync(`${input}/answer_keys/${key}`,'utf8').matchAll(/^- ([A-Z]) — (.+)$/gm)].map(m=>[m[1],m[2]]));
  if(number===4)answers.H='Stereocilia in the ampulla';
  if(number===6)answers.P='Adrenal cortex';
  if(number===10)answers.M='Blood glucose returns toward a workable range';
  const id=`ch${chapter}-reviewed-package-${number}`;
  const bytes=fs.readFileSync(`${input}/images/${image}`);
  fs.writeFileSync(`${dir}/workspace/assets/labeling/${image}`,bytes);
  const title=titles[number]||fs.readFileSync(`${input}/answer_keys/${key}`,'utf8').split('\n')[0].replace(/^# /,'').replace(/ — Answer Key$/,'');
  const spec={id,title,lesson:lessons[number],src:`./assets/labeling/${image}`,alt:`Lettered schematic: ${title}`,answers,options:[...new Set(Object.values(answers))],reviewNote:notes[number],source:'Supplied Biology30_Labeling_Package_with_Answers.zip; textbook comparison documented in metadata',sha256:createHash('sha256').update(bytes).digest('hex')};
  const index=data.labelDiagrams.findIndex(d=>d.id===id);if(index<0)data.labelDiagrams.push(spec);else data.labelDiagrams[index]=spec;
  const select=$('[data-diagram-select]');if(!select.find(`option[value="${id}"]`).length)select.append($('<option>').attr('value',id).text(spec.title));
 }
 data.labelDiagrams.sort((a,b)=>Number(a.id.split('-').at(-1))-Number(b.id.split('-').at(-1)));
 const selector=$('[data-diagram-select]');selector.empty();
 for(const diagram of data.labelDiagrams)selector.append($('<option>').attr('value',diagram.id).text(diagram.title));
 $('#course-data').text(JSON.stringify(data));fs.writeFileSync(`${dir}/workspace/index.html`,$.html());
 let js=fs.readFileSync(`${dir}/workspace/main.js`,'utf8');
 js=js.replace('This is a schematic, not a measured anatomical specimen.</figcaption>','This is a schematic, not a measured anatomical specimen.${d.reviewNote?`<p>${esc(d.reviewNote)}</p>`:\'\'}</figcaption>');
 fs.writeFileSync(`${dir}/workspace/main.js`,js);
 fs.writeFileSync(`${dir}/meta/labeling-package-review.json`,JSON.stringify({sourceZip:'/Users/deanguedo/Downloads/Biology30_Labeling_Package_with_Answers.zip',referenceOnly:resource,review,added:approved[chapter],existingDiagramIdsPreserved:true,userRequestedAllSupplied:suppliedAsIs,status:suppliedAsIs?'All supplied images installed unchanged at explicit user request; recorded science concerns remain unresolved.':'Local visual/science review candidate; not teacher approval or LMS release'},null,2)+'\n');
 console.log(`Chapter ${chapter}: added ${approved[chapter].length} reviewed diagrams; total ${data.labelDiagrams.length}.`);
}
