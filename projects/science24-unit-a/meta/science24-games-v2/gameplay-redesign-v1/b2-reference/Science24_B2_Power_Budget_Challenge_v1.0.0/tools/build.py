#!/usr/bin/env python3
"""Rebuild the self-contained game from source; no network or dependencies."""
from pathlib import Path
import base64,json,re
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'game'
assets={p.stem:'data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode('ascii') for p in sorted((GAME/'assets').glob('*.webp'))}
(GAME/'assets.js').write_text('window.B2Assets = Object.freeze('+json.dumps(assets,separators=(',',':'))+');\n',encoding='utf-8')
html=(GAME/'index.html').read_text(encoding='utf-8')
html=html.replace('<link rel="stylesheet" href="styles.css">','<style>\n'+(GAME/'styles.css').read_text(encoding='utf-8')+'\n</style>')
for name in ['data.js','assets.js','engine.js','app.js']:
 source=(GAME/name).read_text(encoding='utf-8')
 # Protect inline-script parsing if a later source edit adds a closing-script literal.
 source=re.sub(r'</script',r'<\\/script',source,flags=re.I)
 html=html.replace(f'<script src="{name}"></script>','<script>\n'+source+'\n</script>')
(ROOT/'PLAY.html').write_text(html,encoding='utf-8')
print(f'Built PLAY.html: {len(html.encode("utf-8")):,} bytes; {len(assets)} embedded assets.')
