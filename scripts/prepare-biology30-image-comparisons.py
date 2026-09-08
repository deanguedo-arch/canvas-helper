#!/usr/bin/env python3
"""Prepare local authoring-only comparisons from reviewed image queue entries."""
import hashlib
import html
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'projects/resources/biology30-production/v1/pilot2/source-review'

def main():
    queue = json.loads((BASE / 'image-queue.json').read_text())
    sections = []
    inputs = {}
    def local_asset(file, expected=None):
        source = (ROOT / file).resolve()
        source.relative_to(ROOT / 'projects/resources/biology30-production/v1/pilot2')
        digest = hashlib.sha256(source.read_bytes()).hexdigest()
        if expected and digest != expected:
            raise ValueError(f'Image candidate bytes changed: {file}')
        inputs[file] = digest
        return html.escape(os.path.relpath(source, BASE), quote=True)
    for entry in queue['entries']:
        if not entry['candidates']:
            continue
        title = html.escape(entry['purpose'])
        source = entry['sourceReview']
        reference = source.get('fullResolutionAsset')
        if not reference:
            raise ValueError(f'Missing explicit comparison reference: {entry["id"]}')
        src = local_asset(reference)
        reference_panel = f'<figure><h3>Supplied source reference</h3><a href="{src}"><img src="{src}" alt="Supplied source diagram for authoring comparison; see the source limitations below"></a><figcaption>{html.escape(source["finding"])}</figcaption></figure>'
        candidates = []
        for candidate in entry['candidates']:
            url = local_asset(candidate['path'], candidate['sha256'])
            candidates.append(f'<figure><h3>Original candidate {html.escape(candidate["id"])}</h3><a href="{url}"><img src="{url}" width="{candidate["width"]}" height="{candidate["height"]}" alt="{title}; open the original full-resolution candidate"></a><figcaption>{html.escape(candidate["scientificReview"])}</figcaption><ul>'+''.join(f'<li>{html.escape(item)}</li>' for item in candidate['limitations'])+'</ul></figure>')
        recommendation = entry['provisionalRecommendation'] or 'No usable candidate selected'
        rationale = f'<p>{html.escape(entry["codeNativeDecision"])}</p>' if entry.get('codeNativeDecision') else ''
        sections.append(f'<section id="{html.escape(entry["id"],quote=True)}"><h2>{title}</h2><p><strong>Existing course:</strong> {html.escape(entry["existingFigureReview"])}</p>{rationale}<div class="comparison">{reference_panel}{"".join(candidates)}</div><p><strong>Provisional caption:</strong> {html.escape(entry["caption"])}</p><p><strong>Recommendation:</strong> {html.escape(str(recommendation))}. Teacher choice and course acceptance remain undecided. Learner placement and enlargement still require verification.</p></section>')
    document = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Biology 30 — authoring image comparisons</title><style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#171b1b;font:16px/1.55 -apple-system,BlinkMacSystemFont,sans-serif}main{max-width:1400px;margin:auto;padding:24px}h1{font-size:1.8rem}h2{font-size:1.35rem}h3{font-size:1.05rem}section{border-top:1px solid #b8c6c1;margin-top:32px;padding-top:16px}.comparison{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}figure{margin:0;min-width:0}img{width:100%;height:auto;object-fit:contain;display:block;max-height:540px;background:#f8faf9}a{color:#146c60}a:focus-visible{outline:3px solid #146c60;outline-offset:4px}figcaption{margin-top:12px}li{margin-bottom:8px}p,li{overflow-wrap:anywhere}@media(max-width:700px){main{padding:16px}.comparison{grid-template-columns:1fr;gap:16px}img{max-height:none}}@media print{section{break-before:page}a{color:inherit}}
</style><main><h1>Biology 30 image comparisons</h1><p>Local authoring reference. Supplied artwork is retained for comparison and is not cleared for learner redistribution. Candidate recommendations are provisional scientific judgments, not teacher acceptance.</p><p>Open any image to inspect its original resolution. Use the browser Back action to return to this comparison.</p>'''+''.join(sections)+'</main></html>\n'
    (BASE / 'image-comparisons.html').write_text(document)
    inputs[str((BASE / 'image-queue.json').relative_to(ROOT))] = hashlib.sha256((BASE / 'image-queue.json').read_bytes()).hexdigest()
    (BASE / 'image-comparison-receipt.json').write_text(json.dumps({'status':'authoring-only; learner-placement-pending','comparisons':len(sections),'inputs':inputs,'outputSha256':hashlib.sha256(document.encode()).hexdigest(),'teacherDecision':None},indent=2)+'\n')
    print(json.dumps({'comparisons':len(sections),'path':str((BASE / 'image-comparisons.html').relative_to(ROOT))}))

if __name__ == '__main__':
    main()
