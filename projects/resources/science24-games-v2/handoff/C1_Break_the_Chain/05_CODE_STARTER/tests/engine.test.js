import test from'node:test';import assert from'node:assert/strict';import{evaluateRoutes}from'../engine.js';
const routes=[['raw','board','salad'],['hands','salad']];const map={'clean equipment':[0],'hand hygiene':[1]};
test('two route-specific measures block both',()=>assert.equal(evaluateRoutes(routes,map,['clean equipment','hand hygiene']).allBlocked,true));
test('one route remains open',()=>assert.deepEqual(evaluateRoutes(routes,map,['clean equipment']).openRouteIndexes,[1]));
