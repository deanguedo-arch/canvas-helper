import test from 'node:test';import assert from 'node:assert/strict';import{validateBalance,simplest}from'../engine.js';
test('water batch balances',()=>assert.equal(validateBalance(['H2','O2'],['H2O'],[4,2,4]).balanced,true));
test('ammonia transfer balances',()=>assert.deepEqual(validateBalance(['N2','H2'],['NH3'],[1,3,2]).differences,{N:0,H:0}));
test('invalid grand total is rejected elementwise',()=>assert.equal(validateBalance(['H2','O2'],['H2O'],[1,1,1]).balanced,false));
test('balanced multiple simplifies',()=>assert.deepEqual(simplest([4,2,4]),[2,1,2]));
