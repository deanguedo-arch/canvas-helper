export function momentum(mass,velocity){return Number(mass)*Number(velocity)}
export function momentumChange(mass,vi,vf){return momentum(mass,vf)-momentum(mass,vi)}
export function averageForce(deltaP,deltaT){if(Number(deltaT)<=0)throw new Error('Stopping time must be positive');return Number(deltaP)/Number(deltaT)}
export function stoppingTest({mass,vi,vf=0,dt}){const dp=momentumChange(mass,vi,vf);return {deltaP:dp,averageForce:averageForce(dp,dt)}}
export function lockedCartVelocity(carts){const p=carts.reduce((s,c)=>s+momentum(c.m,c.v),0);const m=carts.reduce((s,c)=>s+Number(c.m),0);if(m<=0)throw new Error('Combined mass must be positive');return {initialMomentum:p,combinedMass:m,finalVelocity:p/m}}
