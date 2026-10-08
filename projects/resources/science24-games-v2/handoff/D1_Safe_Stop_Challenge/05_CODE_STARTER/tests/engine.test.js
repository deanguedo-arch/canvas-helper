import test from'node:test';import assert from'node:assert/strict';import{reactionDistance,totalStop,distanceTimePoints}from'../engine.js';
test('worked reaction distance',()=>assert.equal(reactionDistance(20,1.5),30));
test('worked total',()=>assert.deepEqual(totalStop({speed:20,reactionTime:1.5,brakingDistance:40,gap:80}),{reactionDistance:30,totalStoppingDistance:70,margin:10,stopsBefore:true}));
test('transfer exceeds',()=>assert.equal(totalStop({speed:25,reactionTime:1.2,brakingDistance:62.5,gap:85}).margin,-7.5));
test('graph endpoint',()=>assert.deepEqual(distanceTimePoints({speed:20,reactionTime:1.5,brakingTime:4}),[[0,0],[1.5,30],[5.5,70]]));
