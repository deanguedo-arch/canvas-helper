/** Read-only Gate B preflight. --apply is explicitly disabled; no writes occur. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const bundle=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const INSPECTED='d0b4cf731dd180cebee908915772e90687d40215';
const slug='math10c-unit3-pilot',mod='scripts/lib/math-engine/unit3-reconciled';
const args=process.argv.slice(2);let repo,apply=false,accepted;
for(let i=0;i<args.length;i++){if(args[i]==='--repo')repo=args[++i];else if(args[i]==='--apply')apply=true;else if(args[i]==='--accept-head')accepted=args[++i];else throw Error('Unknown argument: '+args[i]);}
if(apply)throw Error('Apply is disabled in this repair candidate. This installer is not a transactional integration mechanism. Use Gate B review and the repository-owned scaffold; do not overlay this bundle into a live checkout.');
if(!repo){console.log('Usage: node integration/install-into-canvas-helper.mjs --repo /path/to/canvas-helper [--apply] [--accept-head EXACT_SHA]\nDefault: read-only preflight. Apply is disabled. Gate B requires separately authorized repository integration.');process.exit(0);}
repo=fs.realpathSync(repo);
function run(cmd,argv){const r=spawnSync(cmd,argv,{cwd:repo,encoding:'utf8'});if(r.error)throw r.error;if(r.status!==0)throw Error(cmd+' failed: '+r.stderr+'\n'+r.stdout);return r.stdout.trim();}
const top=fs.realpathSync(run('git',['rev-parse','--show-toplevel']));if(repo!==top)throw Error('--repo must be the actual repository root.');
const pkg=JSON.parse(fs.readFileSync(path.join(repo,'package.json'),'utf8'));if(pkg.name!=='canvas-helper'||!pkg.scripts?.['course:create'])throw Error('The supported Canvas Helper scaffold was not found.');
const head=run('git',['rev-parse','HEAD']),status=run('git',['status','--porcelain=v1']);
const targets=[`projects/${slug}`,mod,'scripts/build-math10c-unit3.cjs'];
for(const rel of targets){const full=path.resolve(repo,rel);if(fs.existsSync(full))throw Error('Refusing to overwrite '+rel);let parent=path.dirname(full);while(parent!==repo){if(fs.existsSync(parent)&&fs.lstatSync(parent).isSymbolicLink())throw Error('Symlink in target path '+parent);parent=path.dirname(parent);}}
console.log(JSON.stringify({mode:apply?'apply':'read-only-preflight',inspectedHead:INSPECTED,currentHead:head,unrelatedWorkingTreeStatus:status,createOnly:targets,scormRelease:false},null,2));
process.exit(0);
// Gate B integration is intentionally not implemented by this read-only preflight.
