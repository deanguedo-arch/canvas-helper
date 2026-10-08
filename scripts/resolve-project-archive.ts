import { resolveProjectArchiveSource } from './lib/project-archive.js';
const args = process.argv.slice(2);
const sourceIndex = args.indexOf('--source');
if (sourceIndex < 0 || !args[sourceIndex + 1]) throw new Error('Usage: npx --no-install tsx scripts/resolve-project-archive.ts --source <original repo-relative path> [--path-only]');
const resolved = await resolveProjectArchiveSource(args[sourceIndex + 1]);
console.log(args.includes('--path-only') ? resolved : JSON.stringify({source:args[sourceIndex+1],resolved}, null, 2));
