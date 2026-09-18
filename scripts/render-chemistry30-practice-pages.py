"""Render the assigned textbook pages from the pilot's preserved embedded PDFs."""
import base64
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

project = Path(__file__).resolve().parents[1] / 'projects/chemistry30-unit-a-pilot/workspace'
lines = (project / 'main.js').read_text().splitlines()
def record(name):
    line = next(line for line in lines if line.startswith('window.' + name + '=' ) or line.startswith('window.' + name + ' = '))
    return json.loads(line.split('=', 1)[1].strip().removesuffix(';'))
questions, pdfs = record('BOOK_QUESTIONS'), record('UNIT_PDFS')
output = project / 'assets/textbook-practice-pages'
output.mkdir(parents=True, exist_ok=True)
renderer = shutil.which('pdftoppm')
if not renderer:
    raise SystemExit('pdftoppm is required to render textbook pages')
with tempfile.TemporaryDirectory(prefix='chemistry-textbook-') as temp:
    temp = Path(temp)
    for chapter, data in pdfs.items():
        (temp / f'{chapter}.pdf').write_bytes(base64.b64decode(data))
    for printed in sorted({q['page'] for q in questions}):
        chapter = 9 if printed < 368 else 10 if printed < 402 else 11
        first = {9: 332, 10: 368, 11: 402}[chapter]
        page = printed - first + 1
        subprocess.run([renderer, '-f', str(page), '-l', str(page), '-singlefile', '-r', '140', '-jpeg', '-jpegopt', 'quality=85', str(temp / f'{chapter}.pdf'), str(output / f'page-{printed}')], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
print(f'Rendered {len({q["page"] for q in questions})} assigned pages to {output}')
