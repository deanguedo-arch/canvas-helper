import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {ROOT, sha} from './intake.js';

/** Authored operation map. Topic destinations are design decisions, NEVER proof
 * that an operation is taught or independently attempted in generated content. */
export type OperationDesign = {id:string; moduleId:string; topicNumbers:number[]; operation:string};
type Row = [string, number[], string];
const groups: Record<string, {moduleId:string; rows:Row[]}> = {
 A1:{moduleId:'a',rows:[
  ['1k',[1,2],'Trace radiant or chemical energy through production, respiration and thermal transfer; distinguish energy conservation from decreasing availability.'],
  ['2k',[1,2],'Compare photosynthetic and chemosynthetic production with respiration, including an ecosystem without sunlight.'],
  ['3k',[2],'Construct and annotate a food web with arrows toward consumers; explain decomposer connections and changing trophic roles.'],
  ['4k',[2,3],'Calculate transfer efficiency and compare numbers, biomass and energy pyramids with appropriate area and time units.'],
  ['1sts',[1,2],'Evaluate an energy-flow explanation against supplied evidence and identify an assumption or alternative explanation.'],
  ['1s',[1,3],'Formulate a testable light-versus-production question, predict a relationship and identify variables and controls.'],
  ['2s',[2,3],'Organize supplied production observations and construct an annotated ecosystem representation; distinguish data analysis from physically conducting an experiment.'],
  ['3s',[2,3],'Analyze production data, choose a suitable pyramid representation and assess a prediction with limitations.'],
  ['4s',[3],'Communicate quantitative ecosystem results with units, appropriate precision and a reasoned comparison; do not claim observed teamwork.'],
 ]},
 A2:{moduleId:'a',rows:[
  ['1k',[5,6],'Trace carbon, oxygen, nitrogen and phosphorus through reservoirs and processes without treating matter as newly created.'],
  ['2k',[4],'Connect polarity and hydrogen bonding to dissolution, transport, temperature buffering and water movement in cycles.'],
  ['1sts',[3,4,5,6],'Evaluate intended and unintended effects of a human intervention on linked nutrient or water cycles, including environmental evidence and a trade-off.'],
  ['1s',[5,6],'Predict a disruption in a nutrient cycle and design a controlled comparison capable of testing the mechanism.'],
  ['2s',[4,6],'Read and record supplied water-quality measurements with units and method limitations; do not claim hands-on chemical testing.'],
  ['3s',[4],'Calculate water gain/loss from supplied observations and explain uncertainty and biological consequences.'],
  ['4s',[5,6],'Synthesize source-separated evidence about human influence on cycles and communicate a justified conclusion; mark collaborative performance as unobserved.'],
 ]},
 A3:{moduleId:'a',rows:[
  ['1k',[3,4,6],'Explain productivity using both available energy and matter; compare environments without equating standing biomass with production rate.'],
  ['2k',[5,6],'Use photosynthesis and respiration gas exchanges to explain atmospheric balance and effects of unequal rates.'],
  ['3k',[6],'Interpret stromatolite and iron-oxidation evidence for changing atmospheric oxygen; separate observation, inference and schematic timeline.'],
  ['1sts',[1,6],'Evaluate a closed biological life-support system by tracing energy input, matter cycling and its practical limits.'],
  ['2sts',[5,6],'Explain how a human activity changes photosynthetic/respiratory balance and evaluate environmental consequences.'],
  ['1s',[5,6],'Predict oxygen and carbon dioxide changes after a specified reduction in producers, stating system boundaries.'],
  ['2s',[5,6],'Select and compare supplied sources on a human disruption of biosphere gas exchange, distinguishing evidence from assertion.'],
  ['3s',[6],'Design and test a closed-system model of water, oxygen and carbon dioxide exchange; account for its external energy supply and limitations.'],
  ['4s',[6],'Communicate a source-based environmental explanation for an audience, compare perspectives and identify further evidence; do not certify teamwork.'],
 ]},
 B1:{moduleId:'b',rows:[
  ['1k',[1],'Distinguish species, population, community and ecosystem and explain their nested relationships in a supplied case.'],
  ['2k',[2],'Explain how habitats and niches support terrestrial and aquatic diversity, including vertical zones.'],
  ['3k',[1,2],'Identify biotic and abiotic features of local terrestrial and aquatic cases and explain interactions.'],
  ['4k',[2],'Predict distribution changes from a specified biotic or abiotic limiting factor and justify the mechanism.'],
  ['5k',[3],'Apply taxonomic hierarchy and binomial naming using nutritional and morphological evidence and acknowledge classification limits.'],
  ['1sts',[2],'Evaluate a land-use or introduced-species decision using biodiversity evidence, consequences and responsibilities.'],
  ['2sts',[3],'Compare purposes and conventions of classification systems using attributed sources rather than inventing cultural knowledge.'],
  ['1s',[2],'Plan a virtual field comparison with a hypothesis, sampling strategy, variables and confounders.'],
  ['2s',[2],'Organize supplied field observations and use them to propose a reclamation strategy; identify unperformed field techniques.'],
  ['3s',[2,3],'Analyze biotic/abiotic measurements, classify sampled organisms and evaluate measurement reliability.'],
  ['4s',[2],'Present and defend a habitat strategy with evidence and an alternative perspective; real collaborative performance remains unobserved.'],
 ]},
 B2:{moduleId:'b',rows:[
  ['1k',[4],'Explain how heritable mutation introduces variation and how its selective effect depends on conditions.'],
  ['2k',[4],'Explain how sexual reproduction recombines variation on which selection can act, without purposeful mutation.'],
  ['3k',[6],'Compare Lamarckian and Darwinian predictions for the same inherited-trait case.'],
  ['4k',[5],'Integrate fossil, geological, biogeographic, anatomical, embryological and molecular evidence for common ancestry.'],
  ['5k',[4,6],'Explain reproductive isolation and conditions for speciation without equating every evolutionary change with speciation.'],
  ['6k',[6],'Compare gradualism and punctuated equilibrium as patterns of evolutionary change, not intentional progress.'],
  ['1sts',[5,6],'Evaluate how new evidence changes an evolutionary explanation and distinguish scientific theory from unsupported speculation.'],
  ['1s',[4],'Design an investigation of inherited variation and predict a possible adaptive significance.'],
  ['2s',[4],'Record actual or explicitly simulated inherited-trait frequencies across generations with a consistent sampling method.'],
  ['3s',[4,5],'Analyze trait or sequence data, infer relationships, test an explanation and identify a new question or limitation.'],
  ['4s',[5,6],'Communicate evolutionary evidence using numerical, graphical and written representations with a qualified conclusion.'],
 ]},
 C1:{moduleId:'c',rows:[
  ['1k',[2],'Trace absorbed light, electrons, NADPH and proton gradients through light-dependent reactions at the correct chloroplast locations.'],
  ['2k',[3],'Explain how ATP and NADPH support carbon reduction in the stroma and relate those reactions to light-dependent products.'],
  ['1sts',[2,3],'Explain how a photosynthesis measurement technology enables a discovery and how that knowledge informs technology.'],
  ['2sts',[2,3],'Assess a photosynthesis-related application from multiple perspectives, including sustainability and limitations.'],
  ['1s',[2],'Plan a controlled investigation of a factor affecting photosynthesis and predict the measured response.'],
  ['2s',[2,3],'Read and organize supplied pigment or photosynthesis observations, identifying methods and unperformed laboratory skills.'],
  ['3s',[2,3],'Interpret photosynthesis data, evaluate controls and sources of error, and distinguish correlation from mechanism.'],
  ['4s',[2,3],'Communicate a labelled photosynthesis model and evidence-based conclusion with units and source attribution.'],
 ]},
 C2:{moduleId:'c',rows:[
  ['1k',[4],'Trace glucose oxidation, carbon dioxide and reduced carriers through glycolysis and the Krebs cycle at their cellular locations.'],
  ['2k',[4],'Explain electron transport, oxygen, a proton gradient and ATP synthesis across the inner mitochondrial membrane.'],
  ['3k',[5],'Distinguish aerobic respiration, anaerobic respiration and fermentation, including electron acceptors and NAD regeneration.'],
  ['4k',[1,4,5],'Explain ATP coupling in cellular work and distinguish ATP recycling from creating energy.'],
  ['1sts',[5],'Evaluate a fermentation or cellular-respiration application against a societal need and its limitations.'],
  ['2sts',[4],'Explain a supplied metabolic-toxin mechanism and evaluate intended versus unintended industrial consequences without a hazardous procedure.'],
  ['1s',[4,5],'Plan a controlled respiration comparison and predict the effect of oxygen availability or another defined variable.'],
  ['2s',[4],'Record supplied oxygen-consumption or temperature measurements with controls and appropriate units; do not claim a physical experiment.'],
  ['3s',[4,5],'Interpret respiration-rate data and evaluate the reliability of a mechanism/source under oxic and anoxic conditions.'],
  ['4s',[4,5],'Construct an atom-tracing flow chart from glucose to carbon dioxide and water and communicate its limits.'],
 ]},
 D1:{moduleId:'d-part-1',rows:[
  ['1k',[3,5],'Identify all required digestive and respiratory structures and locate them along the correct pathways.'],
  ['2k',[1,2],'Relate carbohydrate, lipid and protein structure to digestion by the corresponding enzyme classes.'],
  ['3k',[2],'Explain enzyme action and predict effects of temperature, pH, substrate concentration and inhibition.'],
  ['4k',[3,4],'Trace mechanical and chemical digestion and absorption into blood or lymph, separating accessory organs from the food pathway.'],
  ['5k',[5,6,7,8],'Explain ventilation, gas diffusion, particle removal and thermal exchange with the environment.'],
  ['1sts',[3,4,5],'Evaluate a supplied food-treatment or health-technology case using biological mechanisms, benefits and limits.'],
  ['2sts',[5,8],'Assess smoking/second-hand exposure consequences and limitations of interventions using supplied sources, not personal disclosures.'],
  ['1s',[2,7],'Design a controlled enzyme or breathing-model investigation with measurable variables and safety limits.'],
  ['2s',[2,3,5,7],'Identify structures from virtual observations and record supplied digestion/respiration measurements; list hands-on techniques not demonstrated.'],
  ['3s',[2,7],'Analyze supplied calorimetry/enzyme or breathing data, draw a conclusion and assess validity.'],
  ['4s',[3,7],'Communicate investigation results with units and attributed sources; distinguish individual communication from observed collaboration.'],
 ]},
 D2:{moduleId:'d-part-1',rows:[
  ['1k',[10,11],'Identify heart chambers, valves, vessels and conducting structures with correct blood-flow directions.'],
  ['2k',[10,11],'Explain cardiac action, pressure and coronary/pulmonary/systemic circulation through a complete route.'],
  ['3k',[9],'Relate artery, vein and capillary structure to pressure, transport and exchange.'],
  ['4k',[12],'Explain plasma, erythrocyte, platelet and leucocyte functions in transport, clotting and defence.'],
  ['5k',[9,12],'Trace capillary exchange linking digestive, excretory, respiratory and muscular systems.'],
  ['6k',[9,12],'Explain how changes in blood flow redistribute heat and affect heat exchange.'],
  ['7k',[13],'Explain lymph formation, return to circulation and immune functions without confusing lymph nodes with all cell maturation sites.'],
  ['8k',[13,14],'Distinguish barrier, innate and adaptive defence and the roles of required immune-cell types.'],
  ['9k',[14],'Predict ABO/Rh red-cell compatibility from antigens and antibodies with component-specific limitations.'],
  ['1sts',[11,13,14],'Evaluate how societal needs and support influence circulatory/immune research, using a source-based case.'],
  ['2sts',[11,14],'Compare perspectives on a transplant or immune/cardiac technology, including benefits, constraints and ethics.'],
  ['1s',[11],'Plan a supplied-data heart-rate/pressure investigation with controls, a prediction and potential confounders.'],
  ['2s',[10,12,13,14],'Identify virtual heart/blood observations and organize cardiovascular or immune-model data; distinguish observation from physical dissection.'],
  ['3s',[11,14],'Analyze exercise/recovery data or predict blood compatibility and assess data/device limitations.'],
  ['4s',[11],'Communicate a cardiovascular investigation with clear units, comparisons and uncertainty; do not claim teamwork.'],
 ]},
 D3:{moduleId:'d-part-2',rows:[
  ['1k',[1],'Identify kidneys, ureters, bladder and urethra along the urine pathway.'],
  ['2k',[1,2],'Locate nephron and vascular structures and explain filtration, reabsorption and secretion in maintaining plasma composition.'],
  ['3k',[1,2],'Trace metabolic waste from production through blood to kidney excretion and environmental release.'],
  ['4k',[2],'Compare ADH and aldosterone source/target/effect pathways in water, sodium and blood-pressure regulation.'],
  ['1sts',[3],'Use nephron function to evaluate a kidney-treatment explanation and distinguish risk factors from diagnosis.'],
  ['1s',[2],'Predict the effect of a specified pressure change on filtration and urine, stating compensatory limits.'],
  ['2s',[1,2],'Construct a water/ion homeostasis flow chart and identify structures in virtual observations; no physical dissection claim.'],
  ['3s',[3],'Interpret simulated urine results against reference values, identify uncertainty and compare kidney-treatment mechanisms.'],
  ['4s',[3],'Communicate simulated urine findings with units, limits and a non-diagnostic conclusion; collaboration remains unobserved.'],
 ]},
 D4:{moduleId:'d-part-2',rows:[
  ['1k',[4,7],'Explain how smooth, cardiac and skeletal muscle support digestion, circulation, respiration, excretion and movement.'],
  ['2k',[5,6],'Explain actin/myosin sliding, ATP use and heat production without shortening the filaments themselves.'],
  ['1sts',[7],'Use a muscle model and supplied exercise evidence to evaluate a performance claim and its limits.'],
  ['2sts',[7],'Evaluate a muscle-condition technology by its biological action, benefit and limitation without prescribing treatment.'],
  ['1s',[7],'Design a comparison of muscle activity, energy use and fatigue with a hypothesis and controlled variables.'],
  ['2s',[4,5,6],'Identify authentic magnified muscle tissues and construct an annotated fibre model; distinguish a model from empirical imagery.'],
  ['3s',[7],'Interpret supplied energy-use and heat-production data, calculate a relationship and qualify a causal claim.'],
  ['4s',[7],'Communicate muscle investigation results using SI units and appropriate precision; do not certify physical measurement or teamwork.'],
 ]},
};
export const BIOLOGY20_OPERATION_DESIGNS:OperationDesign[]=Object.entries(groups).flatMap(([group,{moduleId,rows}])=>rows.map(([suffix,topicNumbers,operation])=>({id:`20-${group}.${suffix}`,moduleId,topicNumbers,operation})));

export function assembleAcademicMap(topicMap:any, outcomeRegister:any, designs=BIOLOGY20_OPERATION_DESIGNS){
 const expected=new Map<string,any>(outcomeRegister.outcomes.map((o:any)=>[o.id,o]));
 if(expected.size!==outcomeRegister.outcomes.length)throw Error('Duplicate official outcomes');
 const seen=new Set<string>();
 const operations=designs.map(design=>{
  const outcome=expected.get(design.id),module=topicMap.modules.find((m:any)=>m.module===design.moduleId);
  if(seen.has(design.id)||!outcome||outcome.moduleId!==design.moduleId||!module||!design.operation.trim())throw Error(`Invalid academic design ${design.id}`);
  seen.add(design.id);
  if(!design.topicNumbers.length||new Set(design.topicNumbers).size!==design.topicNumbers.length)throw Error(`Invalid topic list ${design.id}`);
  const targets=design.topicNumbers.map(n=>{const topic=module.topics[n-1];if(!Number.isInteger(n)||!topic)throw Error(`Unknown topic ${design.id}:${n}`);return {topicId:topic.id,chapter:topic.chapter,sourceSlideNumbers:topic.slideNumbers,sourceReview:'candidate range only; exact supporting passage and component review required'};});
  return {id:design.id,moduleId:design.moduleId,category:outcome.category,operation:design.operation,authority:{sourceSha256:outcomeRegister.sourceSha256,startLine:outcome.sourceStartLine,endLine:outcome.sourceEndLine},plannedTargets:targets,teachingEvidence:[],workedExampleEvidence:[],independentAttemptEvidence:[],feedbackEvidence:[],status:'planned-not-verified',workloadPolicy:'Operation slots are not extra activities; combine compatible operations into appropriately sized existing tasks.',limits:outcome.category==='skills'?'Independently online adaptation does not certify hands-on technique or actual collaboration.':null};
 });
 if(seen.size!==expected.size)throw Error(`Unmapped outcome designs: ${[...expected.keys()].filter(k=>!seen.has(k)).join(', ')}`);
 return {schemaVersion:1,status:'all-outcome-destinations-designed; source-and-learner-proof-pending',teacherAcceptance:null,topicOrderPolicy:'Teacher order retained. Detailed parts may expose material hidden by a broad source topic label.',attitudes:outcomeRegister.attitudeOutcomes,operations};
}
export async function prepareBiology20AcademicMap(repo:string){
 const root=path.join(repo,ROOT),topicBytes=await readFile(path.join(root,'topic-map.json'),'utf8'),outcomeBytes=await readFile(path.join(root,'authority/outcome-register.json'),'utf8');
 const result={...assembleAcademicMap(JSON.parse(topicBytes),JSON.parse(outcomeBytes)),inputHashes:{topicMap:sha(topicBytes),outcomeRegister:sha(outcomeBytes)}};
 const file=path.join(root,'academic-map.json');
 // Once actual evidence has been attached, this mechanical preparation cannot
 // discard it. An explicit reviewed migration must reconcile design changes.
 try{const previous=JSON.parse(await readFile(file,'utf8'));if(previous.operations?.some((o:any)=>o.status!=='planned-not-verified'||[o.teachingEvidence,o.workedExampleEvidence,o.independentAttemptEvidence,o.feedbackEvidence].some(x=>Array.isArray(x)&&x.length)))throw Error('Academic map contains reviewed evidence; refusing overwrite');}catch(error:any){if(error.code!=='ENOENT')throw error;}
 await writeFile(file,JSON.stringify(result,null,2)+'\n');return result;
}
