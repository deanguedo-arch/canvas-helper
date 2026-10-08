#!/usr/bin/env python3
"""Verify source links, embedded build, supplied assets, tests and package integrity.
Standard-library only. Run after build/test changes and before making an archive.
"""
from pathlib import Path
import json,re,hashlib,sys,base64
R=Path(__file__).resolve().parents[1]
checks=[]
def h(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(name,ok,detail=''):
 checks.append({'test':name,'status':'PASS' if ok else 'FAIL','detail':detail})
# Entry points and all local runtime references.
source=(R/'game/index.html').read_text();play=(R/'PLAY.html').read_text()
refs=re.findall(r'(?:src|href)="([^"]+)"',source)
local=[x for x in refs if not x.startswith(('data:','#'))]
check('Multi-file entry local references exist',all((R/'game'/p).is_file() for p in local),str(local))
check('Script dependency order',re.findall(r'<script src="([^"]+)"',source)==['scenarios.js','engine.js','game.js'])
check('Standalone has no external script/style references',not re.search(r'<script[^>]*\bsrc=|<link[^>]*rel="stylesheet"',play))
def embedded_script(name):
 text=(R/'game'/name).read_text()
 for image in (R/'game/assets/scenes').glob('*.webp'):
  text=text.replace(image.relative_to(R/'game').as_posix(),'data:image/webp;base64,'+base64.b64encode(image.read_bytes()).decode('ascii'))
 return text
check('Standalone preserves current JS after declared image embedding',all(embedded_script(x) in play for x in ['scenarios.js','engine.js','game.js']))
check('Standalone embeds current CSS verbatim',(R/'game/styles.css').read_text() in play)
imgs=json.loads((R/'docs/ASSET_PROVENANCE.json').read_text())
check('All recorded asset hashes match',all((R/'game'/a['file']).is_file() and h(R/'game'/a['file'])==a['sha256'] for a in imgs))
check('Every active scene path embedded',not re.search(r'assets/scenes/[^\s"\']+\.webp',play))
runtime='\n'.join((R/'game'/p).read_text() for p in ['index.html','game.js','engine.js','scenarios.js','styles.css'])
check('No external runtime http URLs',not re.search(r'https?://',runtime.replace('http://www.w3.org/2000/svg','')))
check('No persistence/network API calls',not re.search(r'\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|indexedDB|sendBeacon)\b',runtime))
check('No bundled font files',not any(p.suffix.lower() in ['.ttf','.otf','.woff','.woff2'] for p in R.rglob('*')))
reference=json.loads((R/'provenance/REFERENCE_SHA256.json').read_text())
check('Canonical references match recorded input hashes',all(h(R/'reference'/p)==digest for p,digest in reference.items()))
reports=[R/'qa/browser-tests.json',R/'qa/keyboard-stress.json']+[R/f'qa/responsive-{w}.json' for w in [360,390,430,768,1024,1440,1648]]
check('Browser test receipts bound to current PLAY bytes',all(p.is_file() and json.loads(p.read_text()).get('artifact_sha256')==h(R/'PLAY.html') for p in reports))
check('All browser receipts report zero failures',all(json.loads(p.read_text())['failed']==0 for p in reports))
check('Engine receipt has 842 tests and zero failures','# tests 842' in (R/'qa/engine-tests.tap').read_text() and '# fail 0' in (R/'qa/engine-tests.tap').read_text())
check('Actual preview screenshots present',all((R/'qa/screenshots'/x).is_file() for x in ['20_actual_game_desktop.png','21_actual_game_mobile.png']))
if (R/'SHA256SUMS.txt').exists():
 entries=[line.split('  ',1) for line in (R/'SHA256SUMS.txt').read_text().splitlines() if line]
 check('Manifest payload hashes match',all((R/p).is_file() and h(R/p)==digest for digest,p in entries))
# Always exclude this changing receipt and checksum file from any self-reference.
report={'checks':checks,'passed':sum(x['status']=='PASS' for x in checks),'failed':sum(x['status']=='FAIL' for x in checks),'play_sha256':h(R/'PLAY.html')}
print(json.dumps(report,indent=2));sys.exit(1 if report['failed'] else 0)
