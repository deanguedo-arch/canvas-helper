import test from'node:test';import assert from'node:assert/strict';import{momentumChange,averageForce,stoppingTest,lockedCartVelocity}from'../engine.js';
test('worked delta p',()=>assert.equal(momentumChange(60,20,0),-1200));
test('worked forces',()=>{assert.equal(averageForce(-1200,.06),-20000);assert.equal(averageForce(-1200,.15),-8000)});
test('cart locks at +2',()=>assert.deepEqual(lockedCartVelocity([{m:2,v:3},{m:1,v:0}]),{initialMomentum:6,combinedMass:3,finalVelocity:2}));
test('transfer force',()=>assert.deepEqual(stoppingTest({mass:55,vi:18,dt:.2}),{deltaP:-990,averageForce:-4950}));
