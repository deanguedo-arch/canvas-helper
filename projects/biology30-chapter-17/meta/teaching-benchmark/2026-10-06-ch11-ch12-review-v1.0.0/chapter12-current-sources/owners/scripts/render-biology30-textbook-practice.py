"""Inventory original Biology questions and render lossless-context page crops.

PDF text is used only to locate identities; the learner sees original PDF pixels.
Context crops deliberately retain the whole printed page: no multipart question,
table, shared instruction or two-column continuation is cut at a text boundary.
"""
import json
import re
from pathlib import Path
import pdfplumber
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SLUGS = {11: 'biology30-unit-a-pilot-3', 12: 'biology30-chapter-12', 13: 'biology30-chapter-13'}
FIRST = {11: 360, 12: 404, 13: 434}
REVIEWS = {11: {384: ('11.1', range(1, 9)), 395: ('11.2', range(1, 8)), 399: ('11.3', range(1, 6)), 402: ('chapter', range(1, 16)), 403: ('chapter', range(16, 25))},
           12: {409: ('12.1', range(1, 6)), 418: ('12.2', range(1, 8)), 429: ('12.3', range(1, 6)), 432: ('chapter', range(1, 22)), 433: ('chapter', range(22, 34))},
           13: {442: ('13.1', range(1, 6)), 450: ('13.2', range(1, 8)), 455: ('13.3', range(1, 8)), 462: ('13.4', range(1, 6)), 464: ('chapter', range(1, 20)), 465: ('chapter', range(20, 31))}}
# Supplied figures permit these analysis tasks without acquiring new observations.
ANALYSIS = {11: {371: ('11.A paper analysis', [2,4]), 375: ('11.B paper analysis', [2,5]), 381: ('11.C analysis', range(1, 7)), 383: ('Drug activity analysis', [1,2]), 393: ('11.D photograph B', [3]), 400: ('Go Further', range(1,5))},
            12: {405: ('Opening activity paper analysis', [2,4]), 417: ('12.A diagram analysis', range(1, 5)), 428: ('12.C paper conclusion', [3]), 430: ('Go Further', range(1,4))},
            13: {435: ('Opening activity paper analysis', [4]), 443: ('Go Further', range(1,3)), 447: ('13.A paper discussion', [3,4]), 458: ('Thought Lab 13.1 supplied data', range(1,7)), 461: ('13.B paper analysis', [2]), 467: ('Go Further', range(1,4))}}

def decode(text):
    return re.sub(r'\(cid:(\d+)\)', lambda m: chr(int(m[1])+32) if int(m[1]) < 95 else ' ', text)

for chapter, slug in SLUGS.items():
    project = ROOT / 'projects' / slug
    pdf_path = project / f'workspace/assets/textbook/chapter-{chapter}.pdf'
    pdf = pdfplumber.open(pdf_path)
    manifest = {'schemaVersion': 1, 'chapter': chapter, 'coordinateSystem': 'PDF points, top-left of rendered media box', 'questions': [], 'pages': {},
                'excluded': ['Physical procedures and questions requiring new experimental observations', 'Cumulative Unit 5 review (468–471)' if chapter == 13 else 'Unit introductory activities outside this chapter'],
                'contextPolicy': 'Question-column crops have complete printed-page context below, retaining all subparts, figures, tables and shared instructions. Use the selected question number, not every question on the image.'}
    if chapter==13:manifest['excluded'].append({'page':461,'group':'13.B','numbers':[1,3,4,5,6],'reason':'Unknown A–E samples require laboratory observations; the supplied symptom chart is not the missing A–E sample results.'})
    texts = {}
    anchors = {}
    for i, page in enumerate(pdf.pages):
        printed = FIRST[chapter]+i
        if chapter == 13 and printed >= 468:
            continue
        texts[printed] = decode(page.extract_text() or '')
        # Orange question digits use embedded CID fonts; CID 18 is digit 1.
        digits = [c for c in page.chars if 'Bold' in c['fontname'] and c['non_stroking_color'] == (0.25, 0.95, 0.95, 0.25)]
        rows = {}
        for char in digits:
            rows.setdefault((round(char['top']), round(char['x0']/220)), []).append(char)
        numbers = set()
        anchors[printed] = {}
        for chars in rows.values():
            chars = sorted(chars, key=lambda c: c['x0'])
            # Repeated print layers must not duplicate the digits.
            unique = {round(c['x0'], 1): c for c in chars}
            value = ''.join(re.sub(r'\(cid:(\d+)\)', lambda m: chr(int(m[1])+31), c['text']) for c in unique.values())
            if value.isdigit():
                numbers.add(int(value))
                anchors[printed][('in-text', int(value))] = (min(c['x0'] for c in chars), min(c['top'] for c in chars))
        groups = [('in-text', sorted(numbers))]
        if printed in REVIEWS[chapter]:
            section, nums = REVIEWS[chapter][printed]
            groups.append(('chapter-review' if section == 'chapter' else f'section-{section}', nums))
        if printed in ANALYSIS[chapter]:
            group, nums = ANALYSIS[chapter][printed]
            groups.append((group, nums))
        for group, nums in groups:
            for number in nums:
                if group != 'in-text':
                    candidates=[w for w in page.extract_words() if w['text']==f'{number}.' and w['top']<730]
                    # Analysis blocks can repeat procedure numbers: use the final
                    # occurrence, which is the analysis/conclusion block.
                    if candidates:
                        w=candidates[-1] if printed in ANALYSIS[chapter] else candidates[0]
                        anchors[printed][(group,number)]=(w['x0'],w['top'])
                manifest['questions'].append({'id': f'ch{chapter}-p{printed}-{re.sub(r"[^a-z0-9]+", "-", group.lower()).strip("-")}-q{number}', 'page': printed, 'group': group,
                    'number': number, 'label': f'{group.replace("-", " ").title()} · p. {printed} · question {number}', 'crops': [{'page': printed, 'box': [0, 0, page.width, page.height]}]})
    # Add all referenced figure/table pages as context, plus adjacent review pages.
    figure_pages = {}
    for page, text in texts.items():
        for kind, number in re.findall(r'(Figure|Table)\s+('+str(chapter)+r'\.\d+)', text):
            figure_pages.setdefault((kind, number), []).append(page)
    for q in manifest['questions']:
        pages = {q['page']}
        if chapter==13 and q['page']==461:pages.add(460)
        if chapter==13 and q['page']==450:pages.add(447)
        for kind, number in re.findall(r'(Figure|Table)\s+('+str(chapter)+r'\.\d+)', texts[q['page']]):
            pages.update(figure_pages.get((kind, number), []))
        if q['group'] == 'chapter-review':
            pages.update(p for p, (g, _) in REVIEWS[chapter].items() if g == 'chapter')
        for page in sorted(pages-{q['page']}):
            p = pdf.pages[page-FIRST[chapter]]
            q['crops'].append({'page': page, 'box': [0, 0, p.width, p.height], 'role': 'referenced context / continuation'})
        source=pdf.pages[q['page']-FIRST[chapter]]
        anchor=anchors[q['page']].get((q['group'],q['number']))
        if anchor and q['group']=='in-text':
            x,y=anchor
            # Conservative column crop; a full context image remains available
            # immediately below for shared figures and continuation text.
            others=[ay for (g,n),(ax,ay) in anchors[q['page']].items() if g==q['group'] and n!=q['number'] and abs(ax-x)<35 and ay>y+5]
            boxes=[b for b in source.curves+source.rects if b.get('fill') and isinstance(b.get('non_stroking_color'),(tuple,list)) and .05<sum(b['non_stroking_color'])<.3 and b['x1']-b['x0']>120 and b['x0']<=x<=b['x1'] and b['top']<=y<=b['bottom']]
            if not boxes:continue
            box=boxes[0]
            left=max(0,box['x0']-source.bbox[0]-2)
            right=min(source.width,box['x1']-source.bbox[0]+2)
            top=max(0,max(box['top']-2,y-12)-source.bbox[1])
            bottom=min(box['bottom']+2-source.bbox[1],(min(others)-source.bbox[1]-5) if others else box['bottom']+2-source.bbox[1])
            q['crops'].insert(0,{'page':q['page'],'box':[left,top,right,bottom],'asset':q['id']+'.jpg','role':'selected question column; full context follows'})
        elif anchor and (q['group'].startswith('section-') or q['group']=='chapter-review'):
            x,y=anchor;mid=source.bbox[0]+source.width*.45
            same=[ay for (g,n),(ax,ay) in anchors[q['page']].items() if g==q['group'] and n!=q['number'] and (ax>mid)==(x>mid) and ay>y+5]
            right_starts=[ax for (g,n),(ax,ay) in anchors[q['page']].items() if g==q['group'] and ax>mid]
            left=x-source.bbox[0]-8
            right=source.width-10 if x>mid else (min(right_starts)-source.bbox[0]-12 if right_starts else source.width/2)
            bottom=(min(same)-source.bbox[1]-1) if same else source.height-25
            q['crops'].insert(0,{'page':q['page'],'box':[max(0,left),max(0,y-source.bbox[1]-2),right,bottom],'asset':q['id']+'.jpg','role':'selected question including its in-column figure'})
            # Explicit reviewed two-column continuations. These are question
            # subparts, not optional reference pages, so they remain visible.
            continued=(chapter,q['page'],q['group'],q['number']) in [(11,384,'section-11.1',5),(11,399,'section-11.3',3),(11,403,'chapter-review',19),(12,418,'section-12.2',5),(13,462,'section-13.4',5)]
            if continued:
                targets=[(ax,ay) for (g,n),(ax,ay) in anchors[q['page']].items() if g==q['group'] and ax>mid]
                right_x=min([ax for ax,ay in targets],default=mid+10)-source.bbox[0]-8
                headings=[w['top'] for w in source.extract_words() if w['text']=='Review']
                start=min(headings) if headings else min(ay for (g,n),(ax,ay) in anchors[q['page']].items() if g==q['group'])
                end=min([ay for ax,ay in targets],default=source.bbox[1]+source.height-25)-source.bbox[1]-5
                q['crops'].insert(1,{'page':q['page'],'box':[right_x,max(0,start-source.bbox[1]-4),source.width-10,end],'asset':q['id']+'-continuation.jpg','role':'required question continuation'})
    output = project / 'workspace/assets/textbook-practice'
    output.mkdir(parents=True, exist_ok=True)
    thumbnails = []
    needed = sorted({crop['page'] for q in manifest['questions'] for crop in q['crops']})
    for printed in needed:
        page = pdf.pages[printed-FIRST[chapter]]
        image = page.to_image(resolution=160,force_mediabox=True).original.convert('RGB')
        image.save(output / f'p{printed}.jpg', quality=90)
        for q in manifest['questions']:
            for crop in q['crops']:
                if crop['page']==printed and 'asset' in crop:
                    scale=160/72
                    image.crop(tuple(round(v*scale) for v in crop['box'])).save(output/crop['asset'],quality=92)
                    crop['src']='./assets/textbook-practice/'+crop['asset']
        manifest['pages'][str(printed)] = {'src': f'./assets/textbook-practice/p{printed}.jpg', 'pdfPage': printed-FIRST[chapter]+1, 'box': [0, 0, page.width, page.height]}
        thumb = image.copy()
        thumb.thumbnail((300, 400))
        tile = Image.new('RGB', (320, 430), 'white')
        tile.paste(thumb, (10, 24))
        ImageDraw.Draw(tile).text((10, 4), f'Chapter {chapter}, page {printed}', fill='black')
        thumbnails.append(tile)
    review_dir = project / 'meta/textbook-practice-review'
    review_dir.mkdir(parents=True, exist_ok=True)
    for generated in review_dir.glob('questions-*.jpg'):generated.unlink()
    for start in range(0, len(thumbnails), 6):
        sheet = Image.new('RGB', (960, 860), '#ddd')
        for n, tile in enumerate(thumbnails[start:start+6]):
            sheet.paste(tile, ((n%3)*320, (n//3)*430))
        sheet.save(review_dir / f'context-{start//6+1}.jpg')
    question_thumbs=[]
    for q in manifest['questions']:
        crop=q['crops'][0]
        if not crop.get('asset'):continue
        im=Image.open(output/crop['asset']);im.thumbnail((300,430))
        tile=Image.new('RGB',(320,460),'white');tile.paste(im,(10,26))
        ImageDraw.Draw(tile).text((5,5),f'p{q["page"]} {q["group"]} Q{q["number"]}',fill='black');question_thumbs.append(tile)
    for start in range(0,len(question_thumbs),12):
        sheet=Image.new('RGB',(1280,1380),'#ddd')
        for n,tile in enumerate(question_thumbs[start:start+12]):sheet.paste(tile,((n%4)*320,(n//4)*460))
        sheet.save(review_dir/f'questions-{start//12+1}.jpg')
    (project / 'meta/textbook-practice-manifest.json').write_text(json.dumps(manifest, indent=2))
    (project / 'workspace/assets/textbook-practice/manifest.json').write_text(json.dumps(manifest))
    print(f'Chapter {chapter}: {len(manifest["questions"])} questions, {len(needed)} context pages')
