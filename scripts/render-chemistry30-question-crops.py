"""Render reviewed Chemistry question crop boxes without altering their PDF source."""
import base64
import json
import math
import shutil
import subprocess
import tempfile
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1] / 'projects/chemistry30-unit-a-pilot'
lines = (root / 'workspace/main.js').read_text().splitlines()
pdfs = json.loads(next(line for line in lines if line.startswith('window.UNIT_PDFS=')).split('=', 1)[1].removesuffix(';'))
manifest = json.loads((root / 'meta/textbook-question-crops.json').read_text())
output = root / 'workspace/assets/textbook-question-crops'
output.mkdir(parents=True, exist_ok=True)
renderer = shutil.which('pdftoppm') or str(Path.home() / '.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm')
scale = 220 / 72
images = {}
with tempfile.TemporaryDirectory(prefix='chemistry-question-crops-') as temp:
    temp = Path(temp)
    for chapter, data in pdfs.items():
        (temp / f'{chapter}.pdf').write_bytes(base64.b64decode(data))
    pages = sorted({crop['page'] for question in manifest['questions'].values() for crop in question['crops']})
    for printed in pages:
        chapter = 9 if printed < 368 else 10 if printed < 402 else 11
        first = {9: 332, 10: 368, 11: 402}[chapter]
        page = printed - first + 1
        subprocess.run([renderer, '-f', str(page), '-l', str(page), '-singlefile', '-r', '220', '-png', str(temp / f'{chapter}.pdf'), str(temp / str(printed))], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        images[printed] = Image.open(temp / f'{printed}.png').convert('RGB')
    for question_id, question in manifest['questions'].items():
        for index, crop in enumerate(question['crops'], 1):
            x0, y0, x1, y1 = crop['box']
            if x1 <= x0 or y1 <= y0:
                raise ValueError(f'Invalid crop: {question_id}: {crop}')
            region = images[crop['page']].crop((math.floor(x0 * scale), math.floor(y0 * scale), math.ceil(x1 * scale), math.ceil(y1 * scale)))
            region.save(output / f'{question_id}-{index}.jpg', quality=92)
expected = {f'{key}-{index}.jpg' for key, question in manifest['questions'].items() for index in range(1, len(question['crops']) + 1)}
for asset in output.glob('*.jpg'):
    if asset.name not in expected:
        asset.unlink()
print(f'Rendered {len(manifest["questions"])} questions ({sum(len(q["crops"]) for q in manifest["questions"].values())} crops).')
