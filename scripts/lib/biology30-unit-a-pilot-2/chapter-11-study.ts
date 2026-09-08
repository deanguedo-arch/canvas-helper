/** Authored, non-scored diagram work. Responses join the existing model records. */
export const CHAPTER_11_BASELINE = "b669aaadd6d4f08626f0476778e53a46e3cde8fd5f2a48cb3a979edb82d72652";
export interface Chapter11StudyTask {
  id: string;
  modelId: string;
  lessonId: string;
  title: string;
  prompt: string;
  frame: string;
  maxLength: number;
  visual: "neuron" | "reflex" | "voltage" | "transport" | "matter" | "brain";
  description: string;
  guide: string[];
  behaviourIds: string[];
  teacherPlanRow: string;
  slides: string;
  printedPages: string;
}

export const CHAPTER_11_STUDY_TASKS: Chapter11StudyTask[] = [
  {
    id: "neuron-labels", modelId: "myelin", lessonId: "lesson-01", title: "Identify the neuron parts and explain their jobs",
    prompt: "Name A–G on the diagram. For each letter, add the part’s job in a few words. Distinguish the glial cell from the insulating layers it makes. This is a peripheral neuron model, not a microscope image.",
    frame: "A = …; its job is … . Continue through G. Short notes are enough.", maxLength: 600, visual: "neuron",
    description: "A marks short branches entering a rounded region B. C marks the long fibre leaving B. D marks the insulating layers on that fibre. E encloses one whole supporting cell, including its outer nucleus. F marks the gap between two insulated segments. G marks the branches at the far end.",
    guide: ["A: dendrites receive input. B: cell body maintains the cell and integrates inputs. C: axon carries action potentials toward terminals.", "D: myelin sheath reduces current loss across the membrane. E: a Schwann cell makes one myelin segment in the PNS. An oligodendrocyte instead makes myelin segments in the CNS.", "F: node of Ranvier is a gap where an action potential is regenerated. G: axon terminals communicate with the next cell, usually by releasing a neurotransmitter. The drawing shows one common form, not the shape of every neuron."],
    behaviourIds: ["A1.1k-01", "A1.1k-02"], teacherPlanRow: "ch11-day-1", slides: "1–20", printedPages: "367–372"
  },
  {
    id: "reflex-labels", modelId: "myelin", lessonId: "lesson-01", title: "Label a withdrawal-reflex pathway",
    prompt: "Name A–E and state the job of each. Which three letters are neurons? Which carries information into the CNS, which connects cells inside it, and which carries information out? Explain why direction and connections identify a role more reliably than cell shape.",
    frame: "A = … . B carries … . C … . D … . E … . Shape alone cannot … .", maxLength: 400, visual: "reflex",
    description: "A detects a change at the skin. An arrow follows B into the spinal cord, passes through C within the cord, and follows D out to E in a skeletal muscle. A branch carries information toward the brain. The arrows show information flow, not neuron morphology.",
    guide: ["A is a sensory receptor: it detects the stimulus. B is a sensory (afferent) neuron: it carries information toward the CNS. C is an interneuron: it links neurons within the CNS.", "D is a motor (efferent) neuron: it carries output to E, the muscle effector that contracts. B, C and D are neurons. Their roles depend on connections and signal direction; a single cell shape does not define each class.", "This simplified withdrawal arc contains an interneuron; not every reflex has the same circuit. Information also travels to the brain. No painful stimulus or classroom reflex test is required."],
    behaviourIds: ["A1.1k-04", "A1.3k-02"], teacherPlanRow: "ch11-day-1", slides: "1–20", printedPages: "367–372 and 384"
  },
  {
    id: "voltage-labels", modelId: "action-potential", lessonId: "lesson-02", title: "Label and read an action-potential graph",
    prompt: "Name the phases at A–F and the line T. Identify the refractory intervals X and Y and explain why a second impulse is harder or impossible during each. Use the voltage scale to calculate the change from A to C. The table supplies the same evidence as the graph.",
    frame: "A = …; B = …; C = …; D = …; E = …; F = …; T = … . X … . Y … . Change = … mV.", maxLength: 650, visual: "voltage",
    description: "Use the lettered voltage graph and its data table. Times and refractory boundaries are approximate teaching values, not measurements from a person.",
    guide: ["A: resting potential (−70 mV). B: depolarization. C: peak (+35 mV). D: repolarization. E: hyperpolarization. F: return to rest. T: threshold (about −55 mV). The rise from A to C is 35 − (−70) = 105 mV.", "X: absolute refractory interval, beginning during the upstroke and continuing through much of repolarization. Sodium channels are already activated or inactivated; they cannot support a new action potential until they recover.", "Y: relative refractory interval. Some sodium channels have recovered, but remaining potassium conductance and the more negative voltage mean a stronger stimulus is needed. Refractory boundaries depend on channel recovery, not a universal time or voltage."],
    behaviourIds: ["A1.1k-07"], teacherPlanRow: "ch11-day-2", slides: "21–30", printedPages: "374–377"
  },
  {
    id: "transport-reasoning", modelId: "action-potential", lessonId: "lesson-02", title: "Explain the pump, channels, and forward signal",
    prompt: "Explain how the pump and leak channels support resting voltage. Then explain how a spike can reach the next membrane region without sodium ions travelling the whole axon. Why is the recently active region harder to excite again? Do not credit the pump with rapidly causing repolarization.",
    frame: "The pump … . Leak channels … . Local current … . Behind the signal … .", maxLength: 400, visual: "transport",
    description: "Three processes operate together but do different jobs. Use the comparison before explaining the sequence in your own words.",
    guide: ["The ATP-powered pump maintains sodium and potassium gradients over time (three Na⁺ out, two K⁺ in). Selective permeability, especially potassium leak, helps make the inside negative at rest.", "Sodium entry through voltage-gated channels produces the upstroke. Local current brings the next membrane region to threshold; a new spike is regenerated there. Sodium-channel inactivation and potassium exit drive repolarization, not an instantaneous pump reset.", "Recently active channels need to recover. This refractory region limits immediate backward re-excitation during normal propagation. Myelin reduces current loss between nodes; ions do not jump the full axon."],
    behaviourIds: ["A1.1k-08", "A1.1k-09"], teacherPlanRow: "ch11-day-2", slides: "21–30", printedPages: "374–377"
  },
  {
    id: "matter-comparison", modelId: "nervous-system", lessonId: "lesson-04", title: "Compare grey and white matter in two locations",
    prompt: "Identify A–D as grey or white matter. Explain the tissue contents and main role of each type. How does their arrangement differ in the cerebral cortex and spinal cord? Include one reason why white does not mean inactive and grey does not mean unmyelinated neurons only.",
    frame: "A/C = …; B/D = … . Grey matter … . White matter … . Their arrangement … .", maxLength: 400, visual: "matter",
    description: "In the cerebral section, A is the outer cortical layer and B is the underlying tissue. In the spinal-cord section, C is the central butterfly-shaped tissue and D surrounds it. These are simplified sections, not a complete map of every brain nucleus.",
    guide: ["A and C are grey matter; B and D are white matter. Grey matter contains many cell bodies, dendrites and synapses, supporting local processing. White matter contains many myelinated axons, supporting communication between regions.", "Cerebral cortex is outer grey matter with white matter beneath it; deep grey nuclei also exist. Spinal grey matter is central, surrounded by white matter. Both tissue types contain glia and axons; neither colour means that an area is inactive or contains only one kind of cell."],
    behaviourIds: ["A1.2k-02"], teacherPlanRow: "ch11-day-4", slides: "43–53", printedPages: "389 and 396–399"
  },
  {
    id: "brain-labels", modelId: "brain", lessonId: "lesson-05", title: "Identify brain structures before interpreting a case",
    prompt: "Name A–J on the diagram and add one function for each. Which larger region contains lobes A–D? Which two labelled structures are parts of the brainstem? End with one reason why a symptom alone cannot diagnose damage to a single region.",
    frame: "A = …, helps … . Continue through J. A–D belong to … . Brainstem: … . A symptom alone … .", maxLength: 700, visual: "brain",
    description: "A–D mark the frontal, upper rear, lower side and back regions of the cerebrum without supplying their names. E is the folded structure behind the brainstem. F and G are deep central regions, G below F. H is the upper labelled bulge of the brainstem, I is below it, and J continues down into the vertebral canal. Deep structures are shown through the surface as a schematic cutaway.",
    guide: ["A: frontal lobe—planning and voluntary movement. B: parietal lobe—body sensation and spatial processing. C: temporal lobe—hearing and memory. D: occipital lobe—visual processing. These lobes belong to the cerebrum; its two hemispheres work through connected networks.", "E: cerebellum—movement coordination, posture and balance. F: thalamus—relay and organization of much sensory information toward cortex. G: hypothalamus—internal regulation linking autonomic and endocrine responses.", "H: pons—relay pathways and contribution to breathing regulation. I: medulla oblongata—vital automatic functions, including cardiovascular and breathing control. H and I are parts of the brainstem. J: spinal cord—ascending/descending pathways and some reflex circuits.", "A symptom is evidence to investigate, not a diagnosis. Several connected structures can contribute to the same function, and different causes can produce similar changes."],
    behaviourIds: ["A1.2k-07"], teacherPlanRow: "ch11-day-5", slides: "54–65", printedPages: "389–395"
  }
];

export const studyResponseId = (id: string) => `biology30-unit-a-pilot-2:chapter-11-study:${id}:v1`;
export const CHAPTER_11_SCIENCE_SOURCES = [
  { url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/12-2-nervous-tissue", supports: "neuron and glial structure, function and morphology limits" },
  { url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/12-4-the-action-potential", supports: "ion gradients, channel states, propagation and refractory recovery" },
  { url: "https://openstax.org/books/anatomy-and-physiology-2e/pages/13-2-the-central-nervous-system", supports: "cortex/spinal tissue arrangement and brain functions" }
];

const svg = (id: string, title: string, content: string, viewBox = "0 0 840 340") => `<svg viewBox="${viewBox}" role="img" aria-labelledby="${id}-svg-title ${id}-svg-desc"><title id="${id}-svg-title">${title}</title><desc id="${id}-svg-desc">${CHAPTER_11_STUDY_TASKS.find(task => task.id === id)?.description ?? title}</desc><g fill="none" stroke="#146c60" stroke-width="4">${content}</g></svg>`;

export function studyDiagram(task: Chapter11StudyTask): string {
  if (task.visual === "neuron") return svg(task.id, task.title, `<path d="M145 145 100 95 60 85M115 113 75 140M143 175 83 220 45 218M108 202 105 248M150 198 158 259"/><ellipse cx="187" cy="172" rx="51" ry="54" fill="#edf4f1"/><path d="M237 172H695M695 172 741 125 780 125M741 125 752 97M695 172 741 219 786 235M741 219 773 202"/><rect x="296" y="149" width="130" height="46" rx="16" fill="#f7ead6"/><rect x="453" y="149" width="130" height="46" rx="16" fill="#f7ead6"/><rect x="285" y="125" width="151" height="77" rx="20" stroke-dasharray="7 5"/><ellipse cx="350" cy="136" rx="12" ry="6"/><path d="M45 50 101 105M203 64 197 117M631 65 620 172M518 84 518 149M332 270 345 203M442 66V170M785 283 772 230" stroke="#171b1b" stroke-width="2"/><g fill="#171b1b" stroke="none" font-size="26" font-family="sans-serif"><text x="28" y="44">A</text><text x="198" y="51">B</text><text x="628" y="53">C</text><text x="510" y="76">D</text><text x="315" y="300">E</text><text x="433" y="54">F</text><text x="785" y="307">G</text></g>`);
  if (task.visual === "reflex") return `<ol class="model-path" aria-label="Lettered withdrawal-reflex pathway">${["A · at skin", "B · toward spinal cord", "C · inside spinal cord", "D · away from spinal cord", "E · in skeletal muscle"].map(label => `<li><div class="model-step-copy"><strong>${label}</strong><span>Information flows to the next step →</span></div></li>`).join("")}</ol><p>The signal can also travel from the spinal cord toward the brain. Identify roles from these connections, not from a guessed cell shape.</p>`;
  if (task.visual === "matter") return svg(task.id, task.title, `<ellipse cx="218" cy="183" rx="130" ry="102" fill="#e7f1ee"/><ellipse cx="218" cy="183" rx="93" ry="68" fill="#fff"/><ellipse cx="616" cy="183" rx="123" ry="102" fill="#fff"/><path d="M616 172c-55-105-96-60-48 10-48 70-7 108 48 14 55 94 96 56 48-14 48-70 7-115-48-10Z" fill="#e7f1ee"/><g fill="#171b1b" stroke="none" font-family="sans-serif" font-size="25"><text x="119" y="43">Cerebral section</text><text x="512" y="43">Spinal-cord section</text><text x="205" y="109">A</text><text x="210" y="186">B</text><text x="604" y="196">C</text><text x="694" y="190">D</text></g>`);
  if (task.visual === "transport") return `<div class="comparison-table"><table><caption>Three different membrane jobs</caption><thead><tr><th scope="col">Structure</th><th scope="col">Evidence to use</th></tr></thead><tbody><tr><th scope="row">Sodium–potassium pump</th><td>Uses ATP; maintains concentration differences over time.</td></tr><tr><th scope="row">Leak channels</th><td>Allow passive ion movement at rest; permeability differs among ions.</td></tr><tr><th scope="row">Voltage-gated channels</th><td>Change state with voltage; their opening and recovery shape a spike.</td></tr></tbody></table></div>`;
  return ""; // Graph and the existing brain cutaway are rendered by their shared authored functions.
}

export function actionPotentialFigure(id: string, study = false): string {
  const values = [[0, -70], [1, -70], [1.5, -55], [1.8, 0], [2, 35], [2.4, 0], [2.7, -55], [3, -80], [4, -70]];
  const x = (time: number) => 115 + time * 160;
  const y = (voltage: number) => 95 + (40 - voltage) * 2.6;
  const ticks = [-80, -70, -55, 0, 35];
  const title = study ? "Lettered action-potential graph" : "Membrane voltage against time";
  const labels = [[0.4, -70, "A", "Rest"], [1.77, 0, "B", "Rising"], [2, 35, "C", "Peak"], [2.43, 0, "D", "Falling"], [3, -80, "E", "Undershoot"], [4, -70, "F", "Recovery"]] as const;
  return `<figure class="diagram-card semantic-figure science-figure--svg" data-figure-id="${id}"><div class="figure-toolbar"><p>${title}</p><button type="button" class="button button--quiet" data-enlarge-figure>View larger</button></div><svg viewBox="0 0 900 550" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${title}</title><desc id="${id}-desc">A voltage curve rises from −70 through −55 to +35 mV, falls to −80 and returns to −70. X spans the rising phase and much of the fall; Y follows through the undershoot. The adjacent table gives all plotted points.</desc><rect data-refractory="absolute" x="355" y="95" width="192" height="322" fill="#f7ead6"/><rect data-refractory="relative" x="547" y="95" width="208" height="322" fill="#e7f1ee"/><g fill="none" stroke="#d9ded8">${ticks.map(v => `<path d="M115 ${y(v)}H790"/>`).join("")}</g><path d="M115 88V435H800" stroke="#171b1b" fill="none" stroke-width="3"/><path d="M115 ${y(-55)}H790" stroke="#8b4f00" stroke-width="2" stroke-dasharray="8 6"/><polyline points="${values.map(([t,v]) => `${x(t)},${y(v)}`).join(" ")}" stroke="#146c60" stroke-width="6" fill="none" stroke-linejoin="round"/><g font-family="sans-serif" font-size="19" fill="#171b1b">${ticks.map(v => `<text x="99" y="${y(v)+6}" text-anchor="end">${v > 0 ? "+" : ""}${v}</text>`).join("")}${[0,1,2,3,4].map(t => `<text x="${x(t)}" y="463" text-anchor="middle">${t}</text>`).join("")}<text x="450" y="510" text-anchor="middle">Time (milliseconds)</text><text transform="translate(27 275) rotate(-90)" text-anchor="middle">Membrane voltage (mV)</text><text x="785" y="${y(-55)-12}" text-anchor="end">${study ? "T" : "Threshold"}</text><text x="451" y="55" text-anchor="middle">${study ? "X" : "Absolute refractory"}</text><text x="651" y="78" text-anchor="middle">${study ? "Y" : "Relative refractory"}</text>${labels.map(([t,v,letter,label]) => `<text x="${x(t)}" y="${y(v)+(letter === "E" ? 24 : -17)}" text-anchor="middle">${study ? letter : label}</text>`).join("")}</g></svg><div class="comparison-table" role="region" aria-label="${title} data" tabindex="0"><table><caption>Approximate teaching data; X: 1.5–2.7 ms, Y: 2.7–4 ms</caption><thead><tr><th scope="col">Time (ms)</th><th scope="col">Voltage (mV)</th></tr></thead><tbody>${values.map(([t,v]) => `<tr><th scope="row">${t}</th><td>${v > 0 ? "+" : ""}${v}</td></tr>`).join("")}</tbody></table></div><figcaption>${study ? "A and F lie at −70 mV; B is on the rise, C at the peak, D on the fall and E at the minimum. T crosses −55 mV." : "Sodium entry drives depolarization. Sodium-channel inactivation and potassium exit drive repolarization; delayed potassium-channel closure contributes to hyperpolarization."} Refractory shading is approximate: recovery of channels, not a fixed voltage, sets the boundaries. This is a single membrane location, not distance along an axon.</figcaption></figure>`;
}
