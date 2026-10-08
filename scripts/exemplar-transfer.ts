import { getStringFlag, parseArgs } from './lib/cli.js';
import { exemplarTransferContext } from './lib/exemplar-transfer.js';
const args=parseArgs(process.argv.slice(2));
const project=getStringFlag(args,'project'); const intent=getStringFlag(args,'intent')??'continue';
if(!project || !['sample','continue'].includes(intent) || args.positionals.length || Object.keys(args.flags).some(f=>!['project','intent'].includes(f)))throw new Error('Usage: node --import tsx scripts/exemplar-transfer.ts --project <slug> [--intent sample|continue]');
// Proposal-only source preparation is allowed; this does not enable Studio edits or alter lifecycle.
console.log(await exemplarTransferContext(project,undefined,intent as 'sample'|'continue'));
