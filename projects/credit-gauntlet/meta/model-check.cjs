const assert = require('node:assert/strict');
const M = require('../workspace/model.js');
const loans = {
  fixed_36:[36779,825630,36779,124036], fixed_60:[23479,990072,23479,208768], fixed_84:[17819,1060052,17819,296834],
  variable_36:[35965,819784,36518,108019], variable_60:[22645,983339,23320,191092], variable_84:[16961,1053132,17703,278155]
};
const results = {
  fixed_60:{avalanche:[29,123975,259653,11],snowball:[29,128436,264114,3]},
  fixed_84:{avalanche:[30,131385,269123,9],snowball:[30,135291,273029,3]},
  variable_60:{avalanche:[29,122669,241606,11],snowball:[29,127123,246060,3]},
  variable_84:{avalanche:[30,130090,250612,9],snowball:[30,133987,254509,3]}
};
let checks = 0;
for (const [route, expected] of Object.entries(loans)) {
  const r=M.routeInfo(route), s=M.loanSchedule(route), c=M.checkpoint(route);
  assert.deepEqual([r.initialPayment,s.rows[11].closing,c.vehiclePayment,s.interest],expected); checks++;
  assert.equal(s.balance,0); assert.equal(s.rows.length,r.months); checks++;
  for (const row of s.rows) { assert.equal(row.opening+row.interest-row.payment,row.closing); assert.equal(row.payment-row.interest,row.principal); }
}
for (const [route,strategies] of Object.entries(results)) for (const [strategy,expected] of Object.entries(strategies)) {
  const p=M.portfolio(route,strategy);
  assert.deepEqual([p.months,p.phaseInterest,p.totalInterest,p.firstClearMonth],expected); checks++;
  assert.equal(p.reserve,20000); assert(p.debts.every(d=>d.balance===0));
  assert.deepEqual(p.start,M.checkpoint(route));
  for (const m of p.rows) {
    assert.equal(m.paid+m.unused,49000);
    for (const d of m.rows) {assert.equal(d.opening+d.interest-d.payment,d.closing);assert.equal(d.principal,d.payment-d.interest);assert(d.closing>=0);if(d.opening===0)assert.equal(d.payment+d.interest,0);}
  }
  assert.deepEqual(p,M.portfolio(route,strategy)); checks++;
}
assert.equal(M.interest(100,600),1); // Exactly half a cent rounds UP.
assert.equal(M.payment(120000,0,12),10000);
assert.equal(M.interest(0,2400),0);
assert.throws(()=>M.payment(-1,500,60)); assert.throws(()=>M.payment(12000,500,0));
assert.throws(()=>M.routeInfo('variable_0')); assert.throws(()=>M.portfolio('fixed_36','snowball'));
assert.throws(()=>M.month(M.checkpoint('variable_60').debts,33819,'avalanche',13,60));
const ties=[{id:'b',balance:100,rateBps:100},{id:'a',balance:100,rateBps:100}];
assert.equal(M.ordered(ties,'avalanche')[0].id,'a');assert.equal(M.ordered(ties,'snowball')[0].id,'a');
const c=M.checkpoint('variable_60');assert.deepEqual(c.debts.map(d=>d.balance),[51387,216471,983339]);
assert.equal(c.required,33820);assert.equal(c.eventIncrease,675);
checks+=13;
console.log(JSON.stringify({status:'passed',checks,loanSchedules:6,portfolioOutcomes:8,policy:'Exact integer cents; rational HALF_UP',reference:'v0.2 figures retained from inspected preproduction packet'},null,2));
