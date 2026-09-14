/** Explicit identity at the reused runtime boundary. Existing Biology30 schemas
 * omit courseId and retain their exact historical keys and payload format. */
export type BiologyRuntimeIdentity = {unit:string;courseId?:'biology20'};
export const BIOLOGY20_MODULE_UNITS=['A','B','C','D-PART-1','D-PART-2'] as const;
export function validateBiologyRuntimeIdentity(identity:BiologyRuntimeIdentity){
 if(identity.courseId===undefined){if(!['B','C','D'].includes(identity.unit))throw Error('Unsupported legacy Biology30 runtime identity');}
 else if(identity.courseId!=='biology20'||!BIOLOGY20_MODULE_UNITS.includes(identity.unit as typeof BIOLOGY20_MODULE_UNITS[number]))throw Error('Unsupported Biology course/module identity');
 return identity;
}
export function biologyRuntimeStorageBase(identity:BiologyRuntimeIdentity){
 validateBiologyRuntimeIdentity(identity);
 return `${identity.courseId??'biology30'}-unit-${identity.unit.toLowerCase()}`;
}
export function biologyRuntimeStorageKey(identity:BiologyRuntimeIdentity){
 const base=biologyRuntimeStorageBase(identity);
 return `${base}:${identity.courseId?'state:v1':'pilot2-v3'}`;
}
