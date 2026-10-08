import test from'node:test';import assert from'node:assert/strict';import{evidenceSufficiency,invalidateOnEdit}from'../engine.js';
test('identity is strong evidence',()=>assert.equal(evidenceSufficiency([{kind:'identity',changed:true,relevant:true}]).hasNewSubstanceIdentity,true));
test('edit invalidates success',()=>assert.equal(invalidateOnEdit({submittedValid:true}).submittedValid,false));
