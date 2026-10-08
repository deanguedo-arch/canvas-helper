import test from'node:test';import assert from'node:assert/strict';import{deviceEnergyKWh,planTotalKWh,evaluatePlan,efficiencyPercent}from'../engine.js';
test('lamp energy',()=>assert.equal(deviceEnergyKWh({count:4,watts:10,hours:5}),0.2));
test('worked total',()=>assert.ok(Math.abs(planTotalKWh([{count:4,watts:10,hours:5},{count:1,watts:60,hours:4}])-0.44)<1e-12));
test('service floor required',()=>assert.equal(evaluatePlan({devices:[],cap_kwh:.5,servicesMet:false}).valid,false));
test('efficiency',()=>assert.equal(efficiencyPercent(900,1500),60));
