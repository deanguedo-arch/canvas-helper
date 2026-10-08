export function sumOutputs(outputs){return Object.values(outputs).reduce((a,b)=>a+Number(b),0)}
export function validateStep(step){const total=sumOutputs(step.outputs);return {valid:total===Number(step.in),input:Number(step.in),outputTotal:total,difference:Number(step.in)-total}}
export function validateChain(steps){const checks=steps.map(validateStep);const continuity=steps.slice(1).every((s,i)=>Number(s.in)===sumOutputs(steps[i].outputs)-sumExcluded(steps[i].outputs,s.receives||Object.keys(steps[i].outputs)));return {valid:checks.every(c=>c.valid),checks,continuity}}
function sumExcluded(outputs,receives){return Object.entries(outputs).filter(([k])=>!receives.includes(k)).reduce((a,[,v])=>a+Number(v),0)}
export function usefulFraction(useful,input){return Number(useful)/Number(input)}
