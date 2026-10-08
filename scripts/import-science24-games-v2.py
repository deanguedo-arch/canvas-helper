"""One-time, create-only intake. Never regenerate an authored game workspace."""
import hashlib
import json
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZIP = Path('/Users/deanguedo/Downloads/Science24_All_8_Games_Production_Handoff_v2.0.zip')
RESOURCE = ROOT / 'projects/resources/science24-games-v2'
META = ROOT / 'projects/science24-unit-a/meta/science24-games-v2'
GAMES = [
    ('A1', 'Reaction_Detective', 'reaction-detective'),
    ('A2', 'Atom_Factory', 'atom-factory'),
    ('B1', 'Energy_Chain_Rescue', 'energy-chain-rescue'),
    ('B2', 'Power_Budget_Challenge', 'power-budget-challenge'),
    ('C1', 'Break_the_Chain', 'break-the-chain'),
    ('C2', 'Inheritance_Detective', 'inheritance-detective'),
    ('D1', 'Safe_Stop_Challenge', 'safe-stop-challenge'),
    ('D2', 'Crash_Test_Studio', 'crash-test-studio'),
]

def digest(data):
    return hashlib.sha256(data).hexdigest()

def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + '\n')

def main():
    if (META / 'suite.json').exists():
        raise SystemExit('Intake already exists. Edit canonical workspace; do not reimport.')
    META.mkdir(parents=True, exist_ok=True)
    RESOURCE.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ZIP, RESOURCE / ZIP.name)
    before = {}
    for p in [ROOT / 'package.json', *[ROOT / f'projects/science24-unit-{u}/meta/project.json' for u in 'abcd']]:
        before[str(p.relative_to(ROOT))] = digest(p.read_bytes())
        target = META / 'pre-task' / p.relative_to(ROOT)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, target)
    suite = {'schemaVersion': 1, 'version': '2.0.1-rc1', 'sourceArchiveSHA256': digest(ZIP.read_bytes()),
             'status': 'building', 'scope': 'Standalone supplemental practice and teacher review', 'games': []}
    with zipfile.ZipFile(ZIP) as z:
        prefix = z.namelist()[0].split('/')[0] + '/'
        checked = 0
        for line in z.read(prefix + 'SHA256SUMS.txt').decode().splitlines():
            if not line.strip():
                continue
            sha, name = line.split(None, 1)
            name = name.strip().lstrip('*')
            assert digest(z.read(prefix + name)) == sha, name
            checked += 1
        for n in z.namelist():
            rel = n[len(prefix):]
            if n.endswith('/') or not rel or '00_PRIOR_' in rel or '/08_PLAYABLE_REFERENCE_' in rel:
                continue
            dest = RESOURCE / 'handoff' / rel
            assert dest.resolve().is_relative_to(RESOURCE.resolve())
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(z.read(n))
        for game_id, folder, slug in GAMES:
            project = ROOT / f'projects/science24-unit-{game_id[0].lower()}'
            target = project / 'workspace/games' / slug
            origin = RESOURCE / 'handoff' / f'{game_id}_{folder}'
            entry = {'id': game_id, 'title': folder.replace('_', ' '), 'slug': slug,
                     'canonical': str(target.relative_to(ROOT)), 'reference': str(origin.relative_to(ROOT)),
                     'version': '1.2.0' if game_id == 'A1' else '2.0.1-rc1', 'teacherDecision': 'pending'}
            suite['games'].append(entry)
            if game_id == 'A1':
                hashes = {}
                for n in z.namelist():
                    marker = prefix + 'A1_Reaction_Detective/08_PLAYABLE_REFERENCE_v1.2/game/'
                    if n.startswith(marker) and not n.endswith('/'):
                        rel = n[len(marker):]
                        assert (target / rel).read_bytes() == z.read(n), rel
                        hashes[rel] = digest(z.read(n))
                write_json(META / 'a1-frozen-files.json', hashes)
                continue
            assert not target.exists(), f'Existing authoring boundary: {target}'
            (target / 'css').mkdir(parents=True)
            (target / 'js').mkdir()
            (target / 'data').mkdir()
            (target / 'tests').mkdir()
            shutil.copytree(origin / '03_ASSETS', target / 'assets')
            for f in ['scenarios.json', 'answer_feedback_rules.json', 'state_schema.json']:
                shutil.copy2(origin / '02_DATA' / f, target / 'data' / f)
            screens = {}
            css = None
            for f in sorted((origin / '04_MOCKUPS/html').glob('[0-9]*.html')):
                html = f.read_text()
                css = css or re.search(r'<style>([\s\S]*?)</style>', html)[1]
                body = re.search(r'<body>([\s\S]*?)</body>', html)[1]
                screens[f.stem] = body.replace('../../03_ASSETS/', 'assets/')
            (target / 'css/shell.css').write_text(css)
            (target / 'js/screens.js').write_text('export const screens = ' + json.dumps(screens, ensure_ascii=False) + ';\n')
            title = screens['01_title']
            (target / 'index.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8">'
                '<meta name="viewport" content="width=device-width,initial-scale=1">'
                f'<title>{entry["title"]} | Science 24</title><link rel="stylesheet" href="css/shell.css">'
                '<link rel="stylesheet" href="css/game.css"></head><body><div id="app">' + title +
                '</div><noscript>This activity needs JavaScript. Use the teacher text guide for an equivalent task.</noscript>'
                '<script type="module" src="js/app.js"></script></body></html>\n')
            (target / 'README.md').write_text(f'# {game_id} {entry["title"]}\n\nCanonical editable source. '
                'Imported mockup DOM/CSS and supplied assets are retained. Data is authored JSON; engine/state/rendering are separate. '
                'Offline PLAY.html is generated only in the review export. Anonymous in-memory practice; teacher approval pending.\n')
    write_json(META / 'suite.json', suite)
    write_json(META / 'intake.json', {'archiveSHA256': suite['sourceArchiveSHA256'], 'verifiedPayloads': checked,
                'preservedBeforeTask': before, 'routing': {'reconnaissance': 'Sol lead: exact source and dirty ownership review',
                'implementation': 'Sol 6.1 Medium: explicitly requested', 'validationAndPackaging': 'deterministic commands with Sol acceptance'},
                'contextProjectResult': 'All four courses intentionally blocked; not-active reported; no activation attempted'})
    print(f'Preserved archive, verified {checked} payloads, froze A1, created seven isolated authoring boundaries.')

if __name__ == '__main__':
    main()
