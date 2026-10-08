import test from'node:test';import assert from'node:assert/strict';import{cross,phenotypeProbabilities}from'../engine.js';
test('Aa x Aa',()=>assert.deepEqual(cross('Aa','Aa'),{AA:.25,Aa:.5,aa:.25}));
test('aa x Aa',()=>assert.deepEqual(cross('aa','Aa'),{Aa:.5,aa:.5}));
test('phenotypes',()=>assert.deepEqual(phenotypeProbabilities(cross('Aa','Aa')),{dominant:.75,recessive:.25}));
