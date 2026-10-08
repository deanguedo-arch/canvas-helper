#!/usr/bin/env python3
"""Assemble exactly the shipped runtime into one offline HTML file; no third-party packages."""
from pathlib import Path
import base64, hashlib, re
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
html=(GAME/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(GAME/'styles.css').read_text()+'\n</style>')
for name in ['scenarios.js','engine.js','game.js']:
    js=(GAME/name).read_text()
    for image in (GAME/'assets/scenes').glob('*.webp'):
        relative=image.relative_to(GAME).as_posix()
        uri='data:image/webp;base64,'+base64.b64encode(image.read_bytes()).decode('ascii')
        js=js.replace(relative,uri)
    html=html.replace(f'<script src="{name}"></script>','<script>\n'+js+'\n</script>')
assert not re.search(r'<script\s+src=', html), 'A script was left external'
assert 'href="styles.css"' not in html
(ROOT/'PLAY.html').write_text(html)
print('PLAY.html:',len(html.encode()),'bytes; SHA256',hashlib.sha256(html.encode()).hexdigest())
