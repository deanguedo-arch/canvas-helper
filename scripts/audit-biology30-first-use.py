#!/usr/bin/env python3
"""Produce a review queue, never a semantic or rendered first-use pass."""
import argparse
import hashlib
import json
import re
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--write', action='store_true', help='Refresh derived first-use review queues in the owning resource tree')
args = parser.parse_args()
root = Path(__file__).resolve().parent.parent
reports = []
for unit in 'BCD':
    base = root / f'projects/resources/biology30-production/v1/units/unit-{unit.lower()}'
    names = ['pilot2-vocabulary.json', 'pilot2-content.json', 'pilot2-instruction.json']
    vocabulary, core, instruction = [json.loads((base / name).read_text()) for name in names]
    if core['unit'] != unit or vocabulary['unit'] != unit or instruction['unit'] != unit:
        raise ValueError('Cross-unit first-use inputs')
    if [p['id'] for p in core['parts']] != [p['partId'] for p in instruction['parts']]:
        raise ValueError('Core/companion order differs')
    order = {part['id']: index for index, part in enumerate(core['parts'])}
    texts = []
    for part, companion in zip(core['parts'], instruction['parts']):
        worked = companion['workedExample']
        texts.append(' '.join(part['paragraphs'] + [worked['prompt'], *worked['steps'], worked['conclusion'], companion['stopCheck']['prompt'], companion['stopCheck']['guide']]))
    findings = []
    for term in vocabulary['introducedTerms']:
        pattern = re.compile(r'(?<![A-Za-z])' + re.escape(term['term']) + r'(?![A-Za-z])', re.I)
        hits = [part['id'] for part, text in zip(core['parts'], texts) if pattern.search(text)]
        earlier = [hit for hit in hits if order[hit] < order[term['firstTeachingPartId']]]
        if not earlier and hits:
            continue
        first = earlier[0] if earlier else None
        match = pattern.search(texts[order[first]]) if first else None
        findings.append({'termId': term['id'], 'term': term['term'], 'declaredFirstPartId': term['firstTeachingPartId'], 'earliestMatchedPartId': first,
                         'earlierRequiredUse': bool(earlier), 'matchingRequiredParts': hits,
                         'excerpt': texts[order[first]][max(0, match.start() - 80):match.end() + 140] if first else '',
                         'status': 'review-required; exact phrase matching does not establish semantic first use'})
    report = {'unit': unit, 'status': 'non-gating-review-queue',
              'scope': 'Case-insensitive whole-phrase core, worked and stop text; excludes optional Advanced, figures, media and term inventory. Alias/plural/implicit prerequisites need manual review.',
              'sources': [{'path': str((base / name).relative_to(root)), 'sha256': hashlib.sha256((base / name).read_bytes()).hexdigest()} for name in names],
              'findings': findings}
    if args.write:
        (base / 'pilot2-first-use-review.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    reports.append({'unit': unit, 'earlierExactPhraseMatches': sum(row['earlierRequiredUse'] for row in findings),
                    'noExactRequiredPhrase': sum(not row['matchingRequiredParts'] for row in findings), 'semanticOrRenderedPass': False})
print(json.dumps(reports, indent=2))
