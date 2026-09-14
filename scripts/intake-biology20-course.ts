import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {intakeBiology20} from './lib/biology20-course/intake.js';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--bundle')throw Error('Usage: npx tsx scripts/intake-biology20-course.ts --bundle /absolute/path/allthefileszip.zip');
intakeBiology20(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),path.resolve(args[1])).then(result=>console.log(JSON.stringify(result,null,2))).catch(error=>{console.error(error);process.exitCode=1;});
