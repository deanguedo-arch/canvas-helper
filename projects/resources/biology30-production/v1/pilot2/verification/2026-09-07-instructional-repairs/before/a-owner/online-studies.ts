/** Compact, non-graded identification work. Tokens have immutable meanings. */
export type OnlineStudy = {
  id:string; modelId:string; lessonId:string; title:string; prompt:string;
  columns:string[]; options:string[][]; rows:Array<{clue:string; answers:number[]; explanation:string}>;
  sourcePages:string; behaviourIds:string[];
};
const row=(clue:string,answers:number[],explanation:string)=>({clue,answers,explanation});
export const ONLINE_STUDIES:OnlineStudy[]=[
  {
    id:"eye-structure-function",modelId:"eye",lessonId:"lesson-07",title:"Identify eye structures and their functions",
    prompt:"Use the position clues and the eye figure in Lesson 7. Choose the structure and its function for every row. Then compare with the complete explanation. Your selections save with the eye model; this is practice, not a new graded quiz.",
    columns:["Structure","Function"],
    options:[
      ["Sclera","Cornea","Iris","Pupil","Lens","Choroid","Retina","Rods","Cones","Fovea","Optic nerve","Aqueous humour","Vitreous humour","Optic disc"],
      ["Support and protect the eye","Refract incoming light strongly","Adjust the size of the opening","Let light enter through an opening","Change curvature for accommodation","Supply blood and absorb stray light","Contain photoreceptors and neural circuits","Support dim-light sensitivity","Support colour and fine detail","Provide cone-rich central high acuity","Carry retinal neural output","Fill the front fluid compartments","Fill the large space behind the lens","Mark the receptor-free exit of axons"]
    ],
    rows:[
      row("Tough outer coat, continuous with the clear front",[0,0],"The sclera supports the eye. Its opaque tissue is not the transparent focusing surface."),
      row("Transparent curved front surface",[1,1],"The cornea provides much of the eye's refraction before light reaches the lens."),
      row("Coloured muscular ring",[2,2],"The iris changes pupil diameter. It does not change lens curvature."),
      row("Opening in that muscular ring",[3,3],"The pupil is an opening rather than a separate lens or muscle."),
      row("Clear flexible structure behind the pupil",[4,4],"The lens changes shape during accommodation. Cornea and lens work together to focus light."),
      row("Pigmented, blood-vessel-rich layer between outer coat and retina",[5,5],"The choroid helps nourish the outer retina and absorbs stray light."),
      row("Light-sensitive inner lining",[6,6],"The retina contains rods, cones and circuits that process the receptor signals."),
      row("Photoreceptors especially useful in low light",[7,7],"Rods support dim-light sensitivity, not fine colour discrimination."),
      row("Photoreceptors used for colour vision",[8,8],"Cones support colour and high acuity in suitable light."),
      row("Small central retinal region used for sharp detail",[9,9],"The fovea has densely packed cones. It is not the blind spot."),
      row("Bundle leaving the back of the eye",[10,10],"The optic nerve carries neural signals, not a beam of light."),
      row("Watery fluid in front of the lens",[11,11],"Aqueous humour fills the front compartments and contributes to the eye's internal conditions."),
      row("Gel filling most of the space behind the lens",[12,12],"Vitreous humour helps maintain the internal form of the eye."),
      row("Retinal location where the nerve exits",[13,13],"The optic disc lacks rods and cones and produces a blind spot.")
    ],sourcePages:"Chapter 12 printed 410–416",behaviourIds:["A1.4k-01","A1.4k-03"]
  },
  {
    id:"ear-structure-function",modelId:"hearing",lessonId:"lesson-08",title:"Identify ear structures and their functions",
    prompt:"Follow sound from outside to inside, then distinguish the balance and pressure pathways. Choose a structure and its job for every location. Use the Lesson 8 ear figure as a spatial reference. No listening or volume test is needed.",
    columns:["Structure","Function"],options:[
      ["Pinna","Auditory canal","Tympanum","Malleus","Incus","Stapes","Oval window","Cochlea","Organ of Corti","Hair cells","Auditory nerve","Vestibule","Semicircular canals","Eustachian tube"],
      ["Collect and direct sound","Carry sound toward the eardrum","Vibrate with incoming pressure waves","Receive eardrum vibration as the first ossicle","Pass vibration between the other ossicles","Move at the oval window","Transfer movement into inner-ear fluid","Separate sound-frequency responses along its length","House the hearing hair cells on the basilar membrane","Convert mechanical bending into signalling changes","Carry hearing information toward the brain","Detect linear acceleration and head tilt","Detect head rotation","Help equalize middle-ear pressure"]
    ],rows:[
      row("Outer visible ear",[0,0],"The pinna collects sound; it is not the transduction site."),
      row("Passage leading to the eardrum",[1,1],"The auditory canal carries sound to the tympanum."),
      row("Membrane separating outer and middle ear",[2,2],"The tympanum or tympanic membrane vibrates with pressure changes."),
      row("First middle-ear bone, attached to the eardrum",[3,3],"The malleus receives eardrum movement."),
      row("Middle bone of the three-ossicle chain",[4,4],"The incus transfers vibration between malleus and stapes."),
      row("Final ossicle at the inner-ear boundary",[5,5],"The stapes moves at the oval window."),
      row("Membrane boundary pushed by the final ossicle",[6,6],"Oval-window movement sets inner-ear fluid in motion."),
      row("Coiled inner-ear structure for hearing",[7,7],"The cochlea contains the basilar membrane and organ of Corti; regions differ in frequency response."),
      row("Sensory structure on the basilar membrane",[8,8],"The organ of Corti contains the hearing hair cells."),
      row("Receptor cells whose bundles bend",[9,9],"Hair-cell bending changes electrical activity and transmitter release to sensory fibres."),
      row("Neural pathway from the cochlea",[10,10],"Auditory nerve fibres carry a neural pattern, not sound waves."),
      row("Inner-ear region with utricle and saccule",[11,11],"The vestibule contributes information about tilt and linear acceleration."),
      row("Three looped structures in different planes",[12,12],"Semicircular canals detect rotation; they are not the main hearing structure."),
      row("Connection between middle ear and throat",[13,13],"The Eustachian tube helps equalize pressure. It is not the neural or cochlear sound pathway.")
    ],sourcePages:"Chapter 12 printed 420–425",behaviourIds:["A1.5k-01","A1.5k-03"]
  },
  {
    id:"gland-locations",modelId:"homeostasis",lessonId:"lesson-09",title:"Locate the Unit A endocrine structures",
    prompt:"Use the body map in Lesson 9. Match every location to the gland or region. A source location is the start of a hormone explanation, not its target. The two adrenal regions belong to the same gland.",
    columns:["Gland or region"],options:[["Hypothalamus","Pituitary","Thyroid","Parathyroids","Pancreatic islets","Adrenal cortex","Adrenal medulla"]],rows:[
      row("Brain region just above the stalk leading to the pituitary",[0],"The hypothalamus links neural information with endocrine regulation."),
      row("Small gland attached below the hypothalamus",[1],"The anterior pituitary makes several hormones; the posterior pituitary releases hypothalamic ADH."),
      row("Butterfly-shaped gland at the front of the neck",[2],"The thyroid produces thyroxine; its C cells produce calcitonin."),
      row("Small glands usually on the back of the thyroid",[3],"Parathyroid glands produce PTH, not thyroxine."),
      row("Hormone-producing cell groups in the pancreas",[4],"Islet alpha and beta cells produce glucagon and insulin."),
      row("Outer region of each gland above the kidneys",[5],"The adrenal cortex produces cortisol and aldosterone."),
      row("Inner region of each gland above the kidneys",[6],"The adrenal medulla releases epinephrine and norepinephrine.")
    ],sourcePages:"Chapter 13 printed 438–439, 444, 449–453, 456",behaviourIds:["A2.1k-01"]
  },
  {
    id:"hormone-source-target-effect",modelId:"glucose",lessonId:"lesson-13",title:"Connect the Unit A hormones with sources, targets and effects",
    prompt:"Complete all rows using the Unit A hormone pathways. A target must have compatible receptors. Use short source, target and effect choices, then compare each row with the explanation. This table includes norepinephrine in its adrenal hormone role, distinct from its synaptic role.",
    columns:["Source / release","Target","Effect"],options:[
      ["Anterior pituitary","Hypothalamus; posterior-pituitary release","Thyroid follicle cells","Thyroid C cells","Parathyroid glands","Pancreatic beta cells","Pancreatic alpha cells","Adrenal cortex","Adrenal medulla"],
      ["Many tissues, including liver, bone and muscle","Thyroid gland","Adrenal cortex","Kidney collecting ducts","Receptor-bearing metabolic tissues","Bone and kidney","Bone, kidney; indirect intestine","Liver, muscle and fat","Mainly liver","Receptor-bearing fuel-regulation tissues","Kidney tubules","Heart, vessels and other responsive tissues"],
      ["Support growth and metabolism","Stimulate thyroxine release","Stimulate cortisol release","Increase water reabsorption","Increase metabolic activity","Can reduce blood calcium","Raise blood calcium","Promote uptake/storage; reduce liver glucose output","Increase liver glucose output","Support sustained fuel availability","Increase sodium reabsorption and potassium secretion","Support rapid sympathetic responses"]
    ],rows:[
      row("Human growth hormone (hGH)",[0,0,0],"Anterior-pituitary hGH acts directly and through growth factors. Effects depend on age and target tissue."),
      row("Thyroid-stimulating hormone (TSH)",[0,1,1],"TSH is a tropic hormone: it stimulates the thyroid, which releases thyroxine."),
      row("Adrenocorticotropic hormone (ACTH)",[0,2,2],"ACTH stimulates cortisol release from the cortex, not epinephrine release from the medulla."),
      row("Antidiuretic hormone (ADH)",[1,3,3],"ADH is made in hypothalamic neurons and released through the posterior pituitary. Collecting ducts conserve water."),
      row("Thyroxine",[2,4,4],"Thyroxine acts through receptors to change metabolic activity and feeds back on central stimulation."),
      row("Calcitonin",[3,5,5],"Thyroid C cells release calcitonin. It can oppose a calcium rise but is not as important as PTH in normal adult calcium regulation."),
      row("Parathyroid hormone (PTH)",[4,6,6],"PTH coordinates calcium movement in bone and kidney and intestinal uptake indirectly through active vitamin D."),
      row("Insulin",[5,7,7],"Insulin has tissue-specific effects. It does not make all cells equally permeable to glucose."),
      row("Glucagon",[6,8,8],"Glucagon acts mainly on the liver; glycogen breakdown and new glucose production support blood glucose."),
      row("Cortisol",[7,9,9],"Cortisol supports longer metabolic responses. Feedback normally reduces upstream ACTH stimulation."),
      row("Aldosterone",[7,10,10],"Aldosterone promotes renal sodium reabsorption and potassium secretion. It is not controlled solely by ACTH."),
      row("Epinephrine and norepinephrine",[8,11,11],"This row covers two catecholamines from the adrenal medulla. They support rapid, receptor-dependent sympathetic effects.")
    ],sourcePages:"Chapter 13 printed 441–460",behaviourIds:["A2.1k-02","A2.2k-01","A2.3k-01"]
  },
  {
    id:"hormone-patterns",modelId:"glucose",lessonId:"lesson-13",title:"Explain hormone imbalance patterns without diagnosing",
    prompt:"Each row states a controlled teaching case, not a person's test result. Choose the immediate effect most consistent with the stated change. Cases do not provide a diagnosis or treatment. Hormone deficiency, excess and target resistance are different mechanisms.",
    columns:["Predicted effect"],options:[["Reduced growth signalling before growth plates close","Increased growth-related effects; age matters","Less thyroid stimulation","Less cortisol stimulation","Greater volume of dilute urine","Reduced urine volume; possible water retention","Reduced metabolic activity","Increased metabolic activity","Less calcium-raising response","More calcium-raising response","Weaker calcium-lowering influence, often a small adult effect","Higher blood glucose from reduced effective insulin","Lower glucose from excess effective insulin","Greater liver glucose output","Reduced renal sodium retention","More sodium retention and potassium loss","More sustained fuel-mobilizing effects","Reduced support for a prolonged stress response","Stronger rapid sympathetic effects","Reduced adrenal contribution to rapid stress response"]],
    rows:[
      row("Too little effective hGH during childhood",[0],"Reduced growth signalling may reduce growth rate; other causes of slow growth must be considered."),
      row("Persistently high effective hGH",[1],"Effects differ before and after growth plates close; it does not always make an adult taller."),
      row("Reduced TSH supply with a responsive thyroid",[2],"Less tropic stimulation tends to lower thyroid output; compare TSH and thyroxine together."),
      row("Reduced ACTH supply with a responsive adrenal cortex",[3],"Less ACTH tends to reduce cortisol output. ACTH is not the main controller of aldosterone."),
      row("Too little effective ADH",[4],"Less water reabsorption can produce large volumes of dilute urine. Target resistance can produce a similar pattern."),
      row("Too much effective ADH",[5],"More water can be retained; blood sodium may become diluted. This is a model, not a reason to change fluid intake."),
      row("Too little effective thyroxine",[6],"Metabolic activity may decline. A paired TSH value helps locate a possible pathway level."),
      row("Too much effective thyroxine",[7],"Metabolic activity may rise and normal feedback tends to reduce TSH."),
      row("Reduced PTH response when calcium falls",[8],"The normal calcium-raising response is weakened."),
      row("Persistently excessive PTH action",[9],"Blood calcium may rise as bone, kidney and intestinal responses change."),
      row("Reduced calcitonin action in an adult",[10],"A simple equal-and-opposite-to-PTH disease claim is not justified; calcitonin normally has a smaller adult regulatory role."),
      row("Low insulin or reduced insulin responsiveness",[11],"Effective glucose regulation is reduced. Low supply and resistance require different evidence."),
      row("Excess effective insulin in the stated model",[12],"Blood glucose may fall too far. Do not use this model to change medication."),
      row("Excess glucagon with responsive liver cells",[13],"Increased liver output can raise blood glucose."),
      row("Too little effective aldosterone",[14],"Sodium retention falls and potassium regulation may also change."),
      row("Excess effective aldosterone",[15],"More sodium retention and potassium secretion can alter water/salt balance."),
      row("Persistently high effective cortisol",[16],"Fuel metabolism and other target responses can remain altered; the pattern is not a diagnosis."),
      row("Too little effective cortisol during a sustained demand",[17],"Metabolic support for a prolonged stress response may be reduced."),
      row("High adrenal epinephrine/norepinephrine action",[18],"Circulatory and fuel responses may increase, depending on receptors."),
      row("Reduced adrenal epinephrine/norepinephrine release",[19],"The adrenal contribution may fall, but sympathetic nerves can still act directly on organs.")
    ],sourcePages:"Chapter 13 printed 446–460; corrected local hormone pathways",behaviourIds:["A2.6k-02"]
  }
];
export const onlineStudyResponseId=(id:string)=>`biology30-unit-a-pilot-2:online-study:${id}:v1`;
export const ONLINE_MICROSCOPY={id:"microscopy-observation",modelId:"myelin",lessonId:"lesson-01",title:"Observe actual nervous tissue",responseId:onlineStudyResponseId("microscopy-observation"),maxLength:260,
  sourceUrl:"https://phil.cdc.gov/Details.aspx?pid=2756",assetUrl:"https://phil.cdc.gov//PHIL_Images/2756/2756_lores.jpg",asset:"assets/online-science/cdc-2756.jpg",sha256:"742ee51f9ee2cecae29b34c1d472e25336e668e9885025113c503d6f290ede3f",width:700,height:466,
  credit:"CDC / Dr. Karp, Emory University, PHIL 2756 (1964); public domain.",
  prompt:"Enlarge the real spinal-cord micrograph. Find two larger stained cell-body profiles and compare them with the small dark profiles. Describe location, shape and relative size. State one feature you cannot reliably identify. This is digital observation, not operating a microscope.",
  description:"A pale blue field of stained cervical spinal-cord tissue contains scattered larger dark blue cell profiles, including profiles toward the left edge and lower middle, and many smaller dark profiles. The image is a tissue section: branches are incomplete and not every cell boundary is clear.",
  guide:"Larger stained profiles can be compared by their shape and position. Small dark profiles are present between them, but stain and size alone do not establish every cell type. This field does not show one complete neuron from dendrites to terminals or allow reliable myelin identification. There is no scale bar for measuring actual cell size. These limits distinguish an observation from an anatomical inference."};

export const ONLINE_STUDY_STYLE=`.online-study{border-top:1px solid #ccd5ce;padding:1rem 0;min-width:0}.online-study>summary{cursor:pointer}.online-study>summary h3{display:inline;font-size:1.08rem}.online-study-body{padding-top:1rem}.online-study-rows{list-style:none;margin:0;padding:0}.online-study-rows>li{border-top:1px solid #d9ded8;padding:1rem 0}.online-study-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr));gap:.8rem}.online-study-fields label{min-width:0;display:grid;gap:.35rem}.online-study-fields select{width:100%;min-width:0;max-width:100%;white-space:normal}.online-selection{font-size:.9rem;font-weight:400;overflow-wrap:anywhere}.online-study-answer{margin-top:.5rem}.online-study-body img{max-width:100%;height:auto}.online-study-body textarea{width:100%;box-sizing:border-box}`;

// The encoded response is an ordered sequence of one-letter option tokens, '_' = unanswered.
// It lives in the existing responses map, not a duplicate grade or completion record.
export const ONLINE_STUDY_RUNTIME=String.raw`
  function onlineStudyFields(root){return Array.from(root.querySelectorAll('[data-online-pick]'))}
  function showOnlineSelection(pick){var label=pick.parentElement.querySelector('[data-online-selection]');if(!label)return;label.hidden=pick.value==='_'||!pick.value;label.textContent=label.hidden?'':'Selected: '+pick.options[pick.selectedIndex].textContent}
  function normalizeOnlineStudyValue(id,value){var field=document.querySelector('[data-online-response][data-response-id="'+CSS.escape(id)+'"]');if(!field||typeof value!=='string')return '';var picks=onlineStudyFields(field.closest('[data-online-study]'));var out=picks.map(function(pick,i){var token=value.charAt(i);return token&&Array.from(pick.options).some(function(option){return option.value===token})?token:'_'}).join('');return /[^_]/.test(out)?out:''}
  function restoreOnlineStudies(){document.querySelectorAll('[data-online-study]').forEach(function(root){var field=root.querySelector('[data-online-response]');if(!field)return;var value=normalizeOnlineStudyValue(field.getAttribute('data-response-id'),field.value);onlineStudyFields(root).forEach(function(pick,i){pick.value=value.charAt(i)||'_';showOnlineSelection(pick)});root.querySelector('[data-online-compare]').disabled=onlineStudyFields(root).some(function(pick){return pick.value==='_'});root.querySelectorAll('[data-online-answer],[data-online-comparison-heading]').forEach(function(answer){answer.hidden=true})})}
  function onlineStudySummary(task,value){if(!task.cells)return task.title+': '+value;var lines=[];task.cells.forEach(function(cell,i){var token=value.charAt(i);var choice=cell.options[token];if(choice)lines.push(cell.label+': '+choice)});return lines.length?task.title+' — '+lines.join('; '):''}
  document.addEventListener('change',function(event){var pick=event.target.closest('[data-online-pick]');if(!pick)return;showOnlineSelection(pick);var root=pick.closest('[data-online-study]');var field=root.querySelector('[data-online-response]');field.value=onlineStudyFields(root).map(function(node){return node.value}).join('');if(!/[^_]/.test(field.value))field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));root.querySelector('[data-online-compare]').disabled=onlineStudyFields(root).some(function(node){return node.value==='_'});root.querySelectorAll('[data-online-answer],[data-online-comparison-heading]').forEach(function(answer){answer.hidden=true})});
  document.addEventListener('click',function(event){var button=event.target.closest('[data-online-compare]');if(!button||button.disabled)return;var root=button.closest('[data-online-study]');root.querySelectorAll('[data-online-answer]').forEach(function(answer){answer.hidden=false});var heading=root.querySelector('[data-online-comparison-heading]');heading.hidden=false;heading.focus();announce('Explanations shown. Compare each row and revise any selection. This work is not graded.')});
`;
