"""Read-only verification of final delivery. No installation or code execution."""
from pathlib import Path
import json,hashlib,sys,re
ROOT=Path(__file__).resolve().parents[2]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
manifest=json.loads((ROOT/'PACKAGE_MANIFEST.json').read_text());bad=[]
for f in manifest['files']:
 p=(ROOT/f['path']).resolve()
 if not p.is_relative_to(ROOT)or not p.is_file():bad.append(f['path']+': missing/unsafe');continue
 if p.stat().st_size!=f['bytes']or sha(p)!=f['sha256']:bad.append(f['path']+': size/hash mismatch')
if sha(ROOT/'tests/original_M01_M30.json')!='b59def072b94e8a208cb2fef5418b0898620d96a1966fba3c89fbbfcf4431cb5':bad.append('Original M01-M30 changed')
# Reproduce deterministic assembly without writing.
sys.path.insert(0,str(ROOT/'tests'));from assemble import assemble
if (ROOT/'Math10C_Chapter3_Reconciled.html').read_text()!=assemble():bad.append('Standalone differs from canonical source assembly')
for p in ROOT.rglob('*'):
 if p.is_file()and p.suffix.lower()in ['.ttf','.otf','.woff','.woff2']:bad.append('Unexpected font file: '+str(p))
print(json.dumps({'filesVerified':len(manifest['files']),'errors':bad,'originalFixturesUnchanged':True if not any('M01' in x for x in bad)else False,'standaloneExact':not any('Standalone' in x for x in bad)},indent=2));sys.exit(bool(bad))
