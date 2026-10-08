export function finite(v,name,positive=false){if(v===''||v==null||!Number.isFinite(Number(v))||(positive&&Number(v)<=0))throw new Error(name+' must be a finite '+(positive?'positive ':'')+'number.');return Number(v);}
export function momentum(mass,velocity){return finite(mass,'Mass',true)*finite(velocity,'Signed velocity');}
export function momentumChange(mass,vi,vf){return momentum(mass,vf)-momentum(mass,vi);}
export function averageForce(dp,dt){return finite(dp,'Momentum change')/finite(dt,'Duration',true);}
export function stoppingTest({mass,vi,vf=0,dt}){const deltaP=momentumChange(mass,vi,vf);return{deltaP,averageForce:averageForce(deltaP,dt)};}
export function lockedCartVelocity(carts){if(!Array.isArray(carts)||carts.length!==2)throw new Error('Supply two cart systems.');const p=carts.reduce((s,c)=>s+momentum(c.m,c.v),0),mass=carts.reduce((s,c)=>s+finite(c.m,'Cart mass',true),0);return{initialMomentum:p,combinedMass:mass,finalVelocity:p/mass};}
export function validate(s,a){try{
 if(s.kind==='boundary'){if(a.system!=='occupant'||finite(a.mass,'Ledger mass',true)!==s.occupant_mass)return{valid:false,message:'Use the mass of the stated occupant system. Do not substitute whole-vehicle mass.'};return{valid:true,message:'The occupant ledger correctly uses 60 kg; the vehicle ledger is a separate system.'};}
 if(s.kind==='carts'){const r=lockedCartVelocity(s.carts);if(Math.abs(finite(a.initialMomentum,'Initial momentum')-r.initialMomentum)>1e-6||Math.abs(finite(a.combinedMass,'Combined mass',true)-r.combinedMass)>1e-6||Math.abs(finite(a.finalVelocity,'Final velocity')-r.finalVelocity)>1e-6||a.energy!=='not-guaranteed')return{valid:false,message:'Add signed momenta, divide by combined mass after locking, and do not claim kinetic energy conservation.',details:r};return{valid:true,message:'Combined momentum is conserved in the negligible-external-impulse cart model; kinetic energy is not claimed conserved.',details:r};}
 const dp=momentumChange(s.mass,s.vi,s.vf),forces=s.times.map(t=>averageForce(dp,t));
 if(Math.abs(finite(a.deltaP,'Signed momentum change')-dp)>1e-6||forces.some((v,i)=>Math.abs(finite(a['force'+i],'Signed average force')-v)>1e-6))return{valid:false,message:'Use the stated mass and signed velocity change. Divide the same signed Δp by each duration.',details:{deltaP:dp,forces}};
 return{valid:true,message:'Both fixtures have the same impulse. The longer duration lowers average-force magnitude; direction opposes the initial motion.',details:{deltaP:dp,forces}};
}catch(e){return{valid:false,message:e.message};}}
