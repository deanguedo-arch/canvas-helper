export function finite(value,name,positive=false){if(value===''||value==null||!Number.isFinite(Number(value))||Number(value)<0||(positive&&Number(value)===0))throw new Error(name+' must be a finite '+(positive?'positive':'non-negative')+' number.');return Number(value);}
export function deviceEnergyKWh({count=1,watts,hours}){const c=finite(count,'Quantity');if(!Number.isSafeInteger(c))throw new Error('Equipment quantity must be a whole number.');return c*finite(watts,'Power')*finite(hours,'Run-time')/1000;}
export function planTotalKWh(devices){return devices.reduce((sum,d)=>sum+deviceEnergyKWh(d),0);}
export function evaluatePlan({devices,cap_kwh,requirements}){const cap=finite(cap_kwh,'Cap',true),total=planTotalKWh(devices);if(!Array.isArray(requirements)||!requirements.length)throw new Error('An explicit service requirement is needed.');const servicesMet=requirements.every(r=>{const matches=devices.filter(d=>d.id===r.id);return matches.length===1&&r.powers.includes(Number(matches[0].watts))&&Number(matches[0].count)>=r.requiredCount&&Number(matches[0].hours)>=r.requiredHours;});return{total_kwh:total,underCap:total<=cap+1e-9,servicesMet,valid:servicesMet&&total<=cap+1e-9};}
export function efficiencyPercent(useful,input){const u=finite(useful,'Useful output'),i=finite(input,'Input',true);if(u>i)throw new Error('Useful output cannot exceed input.');return u/i*100;}
export function devicesFrom(s,a){return s.serviceRequirements.map(r=>({id:r.id,count:a[r.id+'_count'],watts:a[r.id+'_power'],hours:a[r.id+'_hours']}));}
export function validate(s,a){try{
 if(s.input_j!=null){const expected=efficiencyPercent(s.useful_j,s.input_j);if(Math.abs(finite(a.efficiency,'Efficiency')-expected)>1e-6)return{valid:false,message:'Divide useful output by total input, then multiply by 100. Lower power alone is not an efficiency calculation.'};return{valid:true,message:'Your useful-output/input calculation is correct.'};}
 const r=evaluatePlan({devices:devicesFrom(s,a),cap_kwh:s.cap_kwh,requirements:s.serviceRequirements});
 if(!r.servicesMet)return{valid:false,message:'This plan removes or changes a mandatory service. Restore the required quantities, run-times and supported equipment.',details:r};
 if(!r.underCap)return{valid:false,message:'Your services are met, but the plan exceeds the energy cap. Use a supplied equal-service equipment option.',details:r};
 const entered=finite(s.stage==='transfer'?a.repairedTotal:a.total,'Energy total');
 if(Math.abs(entered-r.total_kwh)>1e-6)return{valid:false,message:'Your stated energy total does not match your selected equipment. Add count × watts × hours / 1000 for every device.',details:r};
 if(s.stage==='transfer'&&Math.abs(finite(a.initialTotal,'Initial total')-s.initial_total)>1e-6)return{valid:false,message:'Recalculate the original equipment table before explaining the repair.',details:r};
 return{valid:true,message:'Your plan meets every service and the cap, with a correct unit-aware energy account.',details:r};
}catch(e){return{valid:false,message:e.message};}}
