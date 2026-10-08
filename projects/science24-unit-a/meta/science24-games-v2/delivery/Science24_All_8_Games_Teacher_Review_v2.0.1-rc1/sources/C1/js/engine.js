export function evaluateRoutes(routes,measureMap,chosenMeasures,budget=2){
 if(!Array.isArray(routes)||!routes.length||routes.some(r=>!Array.isArray(r)||r.length<2))throw new Error('Supply explicit routes.');
 if(!Array.isArray(chosenMeasures)||!Number.isSafeInteger(budget)||budget<1)throw new Error('Supply a valid intervention budget.');
 const chosen=[...new Set(chosenMeasures)];if(chosen.length!==chosenMeasures.length)throw new Error('Use each measure once.');
 if(chosen.length>budget)throw new Error('The selected measures exceed the token budget.');
 if(chosen.some(k=>!Object.hasOwn(measureMap,k)))throw new Error('Unknown intervention.');
 const blocked=routes.map(()=>false);
 for(const m of chosen)for(const i of measureMap[m]){if(!Number.isSafeInteger(i)||i<0||i>=routes.length)throw new Error('Intervention references an unknown route.');blocked[i]=true;}
 return{blocked,openRouteIndexes:blocked.flatMap((v,i)=>v?[]:[i]),allBlocked:blocked.every(Boolean),relevant:chosen.every(k=>measureMap[k].length>0),chosen};
}
export function measureAddressesRoute(map,measure,index){return Object.hasOwn(map,measure)&&map[measure].includes(index);}
export function validate(s,a){try{
 if(s.sequence){if(s.sequence.some((v,i)=>a['defence'+i]!==v))return{valid:false,message:'Match the defence layers: barriers, broad innate response, specific adaptive response and retained immune memory. They can overlap.'};return{valid:true,message:'The defence layers are correctly distinguished. Vaccination prepares an adaptive response; it is not an instant cure.'};}
 if(s.classificationRequired&&a.cause!=='communicable')return{valid:false,message:'The supplied case has a pathogen transmission route. Distinguish this communicable process from a noncommunicable condition.'};
 const r=evaluateRoutes(s.routes,s.measures,a.measures||[],s.budget);
 if(!r.relevant)return{valid:false,message:'One selected measure does not act on a supplied route. Cleaning a container does not repair a contaminated source; antibiotics are not a universal route blocker.',details:r};
 if(!r.allBlocked)return{valid:false,message:'At least one supplied route remains open. Add a relevant layer within the token budget.',details:r};
 return{valid:true,message:'Your measures address every supplied route within the budget. This model does not predict real infection probability.',details:r};
}catch(e){return{valid:false,message:e.message};}}
