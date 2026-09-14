import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareBiology20Curriculum} from './lib/biology20-course/curriculum.js';
if(process.argv.length>2)throw Error('No arguments supported');
prepareBiology20Curriculum(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')).then(r=>console.log(JSON.stringify({outcomes:r.outcomes.length,modules:Object.fromEntries(['a','b','c','d-part-1','d-part-2'].map(id=>[id,r.outcomes.filter(o=>o.moduleId===id).length])),status:r.status},null,2))).catch(e=>{console.error(e);process.exitCode=1;});
