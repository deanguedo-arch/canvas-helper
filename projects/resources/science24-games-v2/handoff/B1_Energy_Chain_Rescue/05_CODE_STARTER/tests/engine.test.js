import test from'node:test';import assert from'node:assert/strict';import{validateStep,usefulFraction}from'../engine.js';
test('generator account',()=>assert.equal(validateStep({in:200,outputs:{electrical:150,thermal:50}}).valid,true));
test('missing energy rejected',()=>assert.equal(validateStep({in:200,outputs:{light:45,thermal:100}}).valid,false));
test('motor useful fraction',()=>assert.equal(usefulFraction(450,1200),0.375));
