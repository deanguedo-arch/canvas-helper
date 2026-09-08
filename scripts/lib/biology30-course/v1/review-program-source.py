"""Preserve exact B/C/D curriculum wording separately from illustrative examples.

Authoring-only extraction of the pinned official source. It does not certify
learner coverage or infer performance-standard levels from example wording.
"""
import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[4]
AUTHORITY = ROOT / 'projects/resources/biology30-production/v1/pilot2/authority'
EXPECTED_SHA = '07864cbe1e95b135ce87a8d6aa3339b38a9b8f414d2a4d10802e3d702922cb0f'
PAGES = [*range(58, 65), *range(66, 73), *range(75, 81)]
OUTCOME = re.compile(r'30[–−-]([BCD][123]\.\d+(?:sts|k|s))\s+')
STOP = re.compile(r'\n\s*(?:Specific Outcomes|Performing and Recording|Analyzing and Interpreting|Communication and Teamwork|Note:|Concept Mathematics)')


def extract_program(source: Path):
    if hashlib.sha256(source.read_bytes()).hexdigest() != EXPECTED_SHA:
        raise ValueError('Official Program source drift')
    reader = PdfReader(source)
    records = []
    for number in PAGES:
        text = reader.pages[number - 1].extract_text()
        matches = list(OUTCOME.finditer(text))
        for index, match in enumerate(matches):
            body = text[match.end():matches[index + 1].start() if index + 1 < len(matches) else len(text)]
            body = STOP.split(body)[0].strip()
            outcome = match.group(1)
            category = 'knowledge' if outcome.endswith('k') else 'sts' if outcome.endswith('sts') else 'skills'
            pieces = body.split('•')
            main = body if category == 'knowledge' else pieces[0]
            records.append({
                'outcomeId': outcome, 'unit': outcome[0], 'category': category,
                'physicalPage': number, 'printedPage': number,
                'requiredOutcomeText': re.sub(r'\s+', ' ', main).strip(),
                'illustrativeExamples': [] if category == 'knowledge' else [re.sub(r'\s+', ' ', p).strip() for p in pieces[1:]],
                'exampleStatus': 'Illustrations of the required outcome; the source footnote says italic examples do not form part of the required program.',
                'layoutCaution': 'PDF mathematical fractions need visual review; raw text order is not a valid equation.' if outcome == 'D3.2k' else None,
            })
    if len(records) != 92 or len({r['outcomeId'] for r in records}) != 92:
        raise ValueError('Curriculum extraction has missing or duplicate outcomes')
    return {'sourceSha256': EXPECTED_SHA, 'sourceUrl': 'https://education.alberta.ca/media/159727/bio203007.pdf',
            'scope': 'Exact source wording, not rendered coverage or certification.', 'records': records}


if __name__ == '__main__':
    result = extract_program(AUTHORITY / 'program.pdf')
    (AUTHORITY / 'program-outcome-register.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'outcomes': len(result['records']), 'illustrativeExamples': sum(len(r['illustrativeExamples']) for r in result['records'])}))
