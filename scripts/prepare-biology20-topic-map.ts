import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareBiology20TopicMap} from './lib/biology20-course/topic-map.js';
if(process.argv.length>2)throw Error('No arguments supported');
prepareBiology20TopicMap(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')).then(r=>console.log(JSON.stringify(r.modules.map(m=>({module:m.module,topics:m.topics.length,unassignedSlides:m.unassignedSlides.length})),null,2))).catch(e=>{console.error(e);process.exitCode=1;});
