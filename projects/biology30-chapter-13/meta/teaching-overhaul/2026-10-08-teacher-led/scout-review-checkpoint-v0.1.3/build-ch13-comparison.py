import hashlib, json, pathlib, re, shutil
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent
REPO = pathlib.Path('/Users/deanguedo/Documents/GitHub/canvas-helper')
RETURN = ROOT / 'returned/ch13-batch01-03-v0.1.0'
SOURCE = REPO / 'projects/biology30-chapter-13/meta/teaching-overhaul/2026-10-08-teacher-led/batch-01-03-v0.1.0/source-handoff'
OUT = ROOT / 'comparison/ch13-batch01-03-v0.1.2'
OWNER = REPO / 'projects/biology30-chapter-13/workspace'
sha = lambda value: hashlib.sha256(value).hexdigest()
manifest = json.loads((RETURN / 'MANIFEST.json').read_text())
mapping = json.loads((RETURN / 'INTEGRATION_MAP.json').read_text())
boundaries = json.loads((SOURCE / 'contracts/REPLACEMENT_BOUNDARIES.json').read_text())
for row in manifest['files']:
    data = (RETURN / row['path']).read_bytes()
    assert len(data) == row['bytes'] and sha(data) == row['sha256'], row['path']
original = (OWNER / 'index.html').read_text()
assert sha(original.encode()) == mapping['ownerSha256'], 'Canonical owner drifted'
if OUT.exists() and not any(OUT.iterdir()):
    OUT.rmdir()  # Remove only the empty directory left by a rejected assembly.
assert not OUT.exists(), 'Refuse to overwrite an existing comparison'
OUT.mkdir(parents=True)
candidate = original
receipt = {'schemaVersion': 1, 'role': 'isolated review candidate', 'teacherAccepted': False,
           'canonicalIntegrated': False, 'originalSha256': sha(original.encode()), 'lessons': []}
for entry in sorted(mapping['lessons'], key=lambda row: row['currentOwnerStartCharacter'], reverse=True):
    lesson = entry['lessonId']
    before = original[entry['currentOwnerStartCharacter']:entry['currentOwnerEndCharacterExclusive']]
    assert sha(before.encode()) == entry['currentIntervalBeforeSha256'], lesson
    fragment = (RETURN / entry['proposalFile']).read_text()
    assert sha(fragment.encode()) == entry['proposalSha256']
    edits = fragment.count('locked figure')
    fragment = fragment.replace('locked figure', 'figure')
    restored_term = False
    if lesson == 'lesson-02':
        needle = 'A hormone passes both.'
        assert fragment.count(needle) == 1
        fragment = fragment.replace(needle, 'A <button type="button" class="bio-term" data-term-id="ch13-word-hormone"><strong>hormone</strong></button> passes both.', 1)
        restored_term = True
    for tag in entry['exactOpeningTags']:
        assert fragment.count(tag) == 1, tag
    original_figures = re.findall(r'<figure\b[\s\S]*?</figure>', before)
    new_figures = re.findall(r'<figure\b[\s\S]*?</figure>', fragment)
    assert original_figures == new_figures, 'Locked figure changed'
    assert [sha(f.encode()) for f in new_figures] == entry['lockedFigureSha256']
    assert not re.search(r'<(?:script|style|iframe|input|textarea|select)\b|\son\w+\s*=', fragment, re.I)
    native_vocab = json.loads((SOURCE / 'contracts/VOCABULARY_IDS.json').read_text())
    # Valid identity set derived from the source DOM, including definitions.
    vocab = set(re.findall(r'data-term-id="([^"]+)"', original))
    assert set(re.findall(r'data-term-id="([^"]+)"', fragment)) <= vocab
    assert set(entry['preserveNativeVocabularyIds']) <= set(re.findall(r'data-term-id="([^"]+)"', fragment))
    p = OUT / entry['proposalFile']; p.write_text(fragment)
    manuscript = (RETURN / 'manuscripts' / (lesson + '.md')).read_text().replace('locked figure', 'figure')
    (OUT / 'manuscripts').mkdir(exist_ok=True)
    (OUT / 'manuscripts' / (lesson + '.md')).write_text(manuscript)
    receipt['lessons'].append({'lessonId': lesson, 'beforeSha256': sha(before.encode()),
        'fragmentSha256': sha(fragment.encode()), 'lockedFigureExact': True,
        'wordingRepairCount': edits, 'restoredHormoneVocabularyLink': restored_term,
        'preservedOuterTags': len(entry['exactOpeningTags'])})
    candidate = candidate[:entry['currentOwnerStartCharacter']] + fragment + candidate[entry['currentOwnerEndCharacterExclusive']:]
# Prove outside-interval bytes by reversing only our known replacement spans.
recovered = candidate
for entry in sorted(mapping['lessons'], key=lambda row: row['currentOwnerStartCharacter'], reverse=True):
    fragment = (OUT / entry['proposalFile']).read_text()
    assert recovered.count(fragment) == 1
    before = original[entry['currentOwnerStartCharacter']:entry['currentOwnerEndCharacterExclusive']]
    recovered = recovered.replace(fragment, before, 1)
assert recovered == original
receipt['outsideIntervalsExact'] = True
receipt['candidateSha256'] = sha(candidate.encode())
receipt['runtimeHashes'] = {}
for kind, text in [('old', original), ('new', candidate)]:
    folder = OUT / kind; folder.mkdir()
    (folder / 'index.html').write_text(text)
    for name in ['styles.css', 'main.js', 'assets']:
        (folder / name).symlink_to(OWNER / name, target_is_directory=(name == 'assets'))
        if name != 'assets': receipt['runtimeHashes'][name] = sha((OWNER / name).read_bytes())
receipt['lessons'].sort(key=lambda row: row['lessonId'])
(OUT / 'ASSEMBLY_RECEIPT.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt, indent=2))
