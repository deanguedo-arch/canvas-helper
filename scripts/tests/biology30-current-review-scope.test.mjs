import test from 'node:test';
import assert from 'node:assert/strict';
import {currentReviewRefreshAuthorized as authorized} from '../lib/review-deployment-scope.mjs';

const science=['science24-unit-a','science24-unit-b','science24-unit-c','science24-unit-d'];
const others=['biology30-a','biology30-ch12','biology30-ch20','math10c-ch3','chemistry30-a-pilot','social30-1-issue1'];
test('default deployment preserves every existing course',()=>{
 for(const id of [...science,...others])assert.equal(authorized(id),false,id);
});
test('Science refresh permits only the four requested units',()=>{
 for(const id of science)assert.equal(authorized(id,{refreshScience24:true}),true,id);
 for(const id of [...others,'science24-unit-e','science24-unit-a-extra','science24-unit-a/asset.png'])assert.equal(authorized(id,{refreshScience24:true}),false,id);
});
test('Biology refresh does not publish Science or other course work',()=>{
 for(const id of ['biology30-a','biology30-ch12','biology30-ch20'])assert.equal(authorized(id,{refreshBiology:true}),true,id);
 for(const id of [...science,'math10c-ch3','chemistry30-a-pilot','social30-1-issue1'])assert.equal(authorized(id,{refreshBiology:true}),false,id);
});
test('combined explicit family refresh still preserves Math Chemistry and Social',()=>{
 const flags={refreshBiology:true,refreshScience24:true};
 for(const id of [...science,'biology30-a','biology30-ch20'])assert.equal(authorized(id,flags),true,id);
 for(const id of ['math10c-ch3','chemistry30-a-pilot','social30-1-issue1'])assert.equal(authorized(id,flags),false,id);
});
