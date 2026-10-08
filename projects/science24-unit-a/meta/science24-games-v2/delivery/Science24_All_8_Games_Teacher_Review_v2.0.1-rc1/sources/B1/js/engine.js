export function finite(value,name,positive=false){if(value===''||value==null||!Number.isFinite(Number(value))||Number(value)<0||(positive&&Number(value)===0))throw new Error(name+' must be a finite '+(positive?'positive':'non-negative')+' amount.');return Number(value);}
export function sumOutputs(outputs){if(!Object.keys(outputs).length)throw new Error('Complete the output account.');return Object.values(outputs).reduce((a,b)=>a+finite(b,'Output'),0);}
export function validateStep(step){const input=finite(step.in,'Input',true),total=sumOutputs(step.outputs);return{valid:Math.abs(input-total)<1e-6,input,outputTotal:total,difference:input-total};}
export function validateChain(steps){if(!steps.length)throw new Error('Supply a converter.');const checks=steps.map(validateStep);const continuity=steps.slice(1).every((s,i)=>{if(!s.receives?.length)return false;const outputs=steps[i].outputs;return s.receives.every(k=>Object.hasOwn(outputs,k))&&Math.abs(finite(s.in,'Next input',true)-s.receives.reduce((sum,k)=>sum+finite(outputs[k],'Transferred output'),0))<1e-6;});return{valid:checks.every(c=>c.valid)&&continuity,checks,continuity};}
export function usefulFraction(useful,input){const u=finite(useful,'Useful output'),i=finite(input,'Input',true);if(u>i)throw new Error('Useful output cannot exceed input.');return u/i;}
export function validate(s,a){try{
 const keys=Object.keys(s.whole_system),outputs=Object.fromEntries(keys.map(k=>[k,finite(a['out_'+k],k)]));
 const sum=sumOutputs(outputs);if(Math.abs(sum-s.input)>1e-6)return{valid:false,message:'The whole-system outputs do not account for the input. Include the less-useful outputs.'};
 if(keys.some(k=>Math.abs(outputs[k]-s.whole_system[k])>1e-6))return{valid:false,message:'The total is conserved, but one output conflicts with the supplied record. Check each form, not only the grand total.'};
 if(s.stage!=='transfer'&&s.path.some((v,i)=>a['path'+i]!==v))return{valid:false,message:'Repair the ordered source/converter/output pathway. Energy does not vanish, and matter does not become energy.'};
 if(s.stage==='transfer'&&Math.abs(finite(a.fraction,'Useful percentage')-usefulFraction(s.whole_system[s.useful],s.input)*100)>1e-6)return{valid:false,message:'Divide useful output by the whole-system input, then multiply by 100.'};
 return{valid:true,message:'Your pathway and complete energy account agree with the supplied records.',details:{input:s.input,outputs}};
}catch(e){return{valid:false,message:e.message};}}
