#!/usr/bin/env python3
"""Check exact source inventory and preservation; never grant visual or media clearance."""
import hashlib
import json
import posixpath
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = ROOT / 'projects/resources/biology30-production/v1'
PACKET = BASE / 'pilot2/intake/7783e714077e56dcb6c423d61903d577a7decc4756cb38ace124679b279fbf13'
RELATIONS = BASE / 'pilot2/relationships/7783e714077e56dcb6c423d61903d577a7decc4756cb38ace124679b279fbf13/package-relationships.json'

def read(path):
    return json.loads(path.read_text())

def exact_keys(rows, key, expected, label):
    actual = [key(row) for row in rows]
    if len(set(actual)) != len(actual) or set(actual) != set(expected):
        raise ValueError(f'{label} identity inventory differs')

def audit():
    decks, plans, videos, relationships = [read(p) for p in [PACKET/'decks.json', PACKET/'daily-plans.json', PACKET/'videos.json', RELATIONS]]
    reports = []
    for unit in 'BCD':
        folder = BASE / f'units/unit-{unit.lower()}'
        media, rows, links = [read(folder/f'pilot2-{name}-dispositions.json') for name in ['media', 'plan', 'link']]
        if any(doc['unit'] != unit or doc['teacherDecision'] is not None for doc in [media, rows, links]):
            raise ValueError('Cross-unit data or unauthorized teacher decision')
        source_assets = {(deck['sourceSha256'], asset['part']):asset for deck in decks if deck['unit']==unit for asset in deck['media']}
        exact_keys(media['assets'], lambda a:(a['sourceSha256'],a['packagePart']), source_assets, 'Media')
        for asset in media['assets']:
            source = source_assets[(asset['sourceSha256'],asset['packagePart'])]
            file = (ROOT/asset['authoringLocalFile']).resolve()
            if PACKET.resolve() not in file.parents or file.is_symlink() or hashlib.sha256(file.read_bytes()).hexdigest() != source['sha256'] or asset['assetSha256'] != source['sha256']:
                raise ValueError('Preserved media bytes/path differ')
            if asset['learnerAsset'] is not None or asset['rights'] != 'not-cleared-for-learner-reuse':
                raise ValueError('Reference-only media was silently enabled')
            if not asset['reason'].strip() or not asset['relationships'] or not asset['directSlideIds']:
                raise ValueError('Media reference disposition is incomplete')
            package_source = next(source for source in relationships['decks'] if source['sourceSha256']==asset['sourceSha256'])
            expected_references = []
            for rel in package_source['relationships']:
                if rel.get('TargetMode') == 'External':
                    continue
                parent, filename = posixpath.split(rel['part'])
                origin = posixpath.join(posixpath.dirname(parent), filename[:-5])
                target = posixpath.normpath(posixpath.join(posixpath.dirname(origin), rel['Target']))
                if target == asset['packagePart']:
                    expected_references.append({**rel, 'sourcePart':origin, 'resolvedTarget':target})
            if asset['relationships'] != expected_references:
                raise ValueError('Media package relationships differ')
        source_rows = {row['id']:(plan,row) for plan in plans if plan['unit']==unit for row in plan['rows']}
        exact_keys(rows['rows'], lambda row:row['rowId'], source_rows, 'Plan row')
        for row in rows['rows']:
            plan, original = source_rows[row['rowId']]
            if row['sourceCells'] != original['cells'] or row['sourceSha256'] != plan['sourceSha256'] or not row['disposition'] or not row['reason'].strip():
                raise ValueError('Plan row source fidelity differs')
        source_links = {(section,source['sourceSha256'],rel['part'],rel['Id'],rel['Target']) for section in ['decks','plans'] for source in relationships[section] if source['unit']==unit for rel in source['relationships'] if rel.get('TargetMode')=='External'}
        exact_keys(links['relationships'], lambda link:(link['sourceKind'],link['sourceSha256'],link['sourcePart'],link['relationshipId'],link['originalUrl']), source_links, 'External relationship')
        source_videos = {video['id']:[o for o in video['occurrences'] if o['unit']==unit] for video in videos if any(o['unit']==unit for o in video['occurrences'])}
        exact_keys(links['youtubeCandidates'], lambda video:video['videoId'], source_videos, 'YouTube')
        for video in links['youtubeCandidates']:
            if video['sourceOccurrences'] != source_videos[video['videoId']] or video['providerFilesDownloaded']:
                raise ValueError('Video occurrences changed or media was redistributed')
            if video['learnerSelected'] or video['required']:
                raise ValueError('Unreviewed candidate was silently enabled')
        reports.append({'unit':unit,'planRows':len(source_rows),'embeddedAssets':len(source_assets),'mediaRelationships':sum(len(a['relationships']) for a in media['assets']),'externalRelationships':len(source_links),'youtubeCandidates':len(source_videos),'youtubeOccurrences':sum(len(v) for v in source_videos.values()),'proof':'Exact inventory and reference preservation only; source scientific review, replacement figures, selected captions and rendered evidence remain separate.'})
    return reports

if __name__ == '__main__':
    print(json.dumps(audit(), indent=2))
