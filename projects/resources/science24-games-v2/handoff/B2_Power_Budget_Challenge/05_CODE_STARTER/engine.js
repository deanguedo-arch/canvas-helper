export function deviceEnergyKWh({count=1,watts,hours}){return Number(count)*Number(watts)*Number(hours)/1000}
export function planTotalKWh(devices){return devices.reduce((sum,d)=>sum+deviceEnergyKWh(d),0)}
export function evaluatePlan({devices,cap_kwh,servicesMet=true}){const total=planTotalKWh(devices);return {total_kwh:total,underCap:total<=Number(cap_kwh)+1e-9,servicesMet:Boolean(servicesMet),valid:Boolean(servicesMet)&&total<=Number(cap_kwh)+1e-9}}
export function efficiencyPercent(useful,input){if(Number(input)<=0)throw new Error('Input must be positive');return Number(useful)/Number(input)*100}
