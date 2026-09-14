import type {BiologyPresentationProfile} from '../biology30-course/v1/pilot2-presentation-shell.js';
import {BIOLOGY20_MODULE_UNITS,biologyRuntimeStorageKey} from '../biology30-course/v1/course-identity.js';

const modules={
 a:{title:'Energy and Matter Exchange in the Biosphere',chapters:[1,2],opening:['How do energy and matter move through the biosphere?','Trace energy transfers and matter cycles. Use system boundaries, food webs and supplied data to explain ecological relationships and the limits of your conclusions.']},
 b:{title:'Ecosystems and Population Change',chapters:[3,4],opening:['How do environments and populations change together?','Use field observations, classification and evidence of evolution to explain diversity. Distinguish changes within individuals from changes in populations across generations.']},
 c:{title:'Photosynthesis and Cellular Respiration',chapters:[5],opening:['How do cells transform matter and transfer energy?','Follow carbon, electrons and energy through photosynthesis and cellular respiration. Use controlled comparisons and models to explain how conditions affect these processes.']},
 'd-part-1':{title:'Digestion, Respiration and Circulation',chapters:[6,7,8],opening:['How do body systems supply cells and maintain internal conditions?','Connect digestion, gas exchange, circulation and defence. Use supplied evidence to explain how structures and coordinated responses support cell function.']},
 'd-part-2':{title:'Excretion and Muscular Systems',chapters:[9,10],opening:['How do kidneys and muscles support homeostasis?','Follow filtration and selective transport in the kidney, then connect muscle structure to contraction and energy supply. Explain feedback and interpret supplied physiological data.']},
} as const;
export type Biology20ModuleId=keyof typeof modules;
/** Only identity and presentation live here. Teaching counts, minutes and
 * response inventories must come from the module's authored contract. */
export function biology20Profile(moduleId:Biology20ModuleId){
 if(!Object.hasOwn(modules,moduleId))throw Error('Unknown Biology20 module');
 const source=modules[moduleId],unit=moduleId.toUpperCase() as typeof BIOLOGY20_MODULE_UNITS[number];
 const moduleLabel=moduleId.startsWith('d-part-')?`Unit D · Part ${moduleId.at(-1)}`:`Unit ${unit}`;
 const identity={courseId:'biology20' as const,unit};
 const presentation:BiologyPresentationProfile={courseId:'biology20',courseLabel:'Biology 20',courseCode:'BIO 20',moduleLabel,opening:source.opening,challengeLabel:'Challenge Practice'};
 return {identity,moduleId,slug:`biology20-unit-${moduleId}`,title:`Biology 20 — ${moduleLabel}: ${source.title}`,chapters:[...source.chapters],storageKey:biologyRuntimeStorageKey(identity),presentation};
}
