import {prepareBiology20AcademicMap} from './lib/biology20-course/academic-map.js';
const result=await prepareBiology20AcademicMap(process.cwd());
console.log(JSON.stringify({status:result.status,operations:result.operations.length,verifiedOperations:0},null,2));
