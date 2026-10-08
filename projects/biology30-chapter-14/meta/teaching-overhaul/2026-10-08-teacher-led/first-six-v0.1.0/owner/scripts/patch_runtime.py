#!/usr/bin/env python3
"""Idempotent narrow runtime patches for configured chapters and offline assets."""
from pathlib import Path
import re
R=Path(__file__).resolve().parents[1];p=R/'workspace/main.js';s=p.read_text()
if 'const asset=' not in s:s=s.replace("const norm=x=>","const asset=path=>window.BiologyChapterAssets?.resolve(path)||path;\nconst norm=x=>")
s=s.replace('src="${esc(d.src)}"','src="${esc(asset(d.src))}"').replace('src="${d.src}"','src="${esc(asset(d.src))}"')
# Source stimuli are part of the question, not answer explanations.
anchor=" if(item.kind==='diagram'){const d=labelSpec(item.diagramId);"
insert=""" if(item.stimuli?.length)form=item.stimuli.map((stimulus,i)=>`<figure class="science-figure"><div class="figure-toolbar"><strong>Question diagram / data ${i+1}</strong><button type="button" class="text-link" data-enlarge-figure="stimulus">View larger</button></div><img src="${esc(asset(stimulus.src))}" alt="${esc(stimulus.alt||'Question diagram or data')}"><figcaption>Use this information with the question.</figcaption></figure>`).join('')+form;
"""
if 'if(item.stimuli?.length)'not in s:s=s.replace(anchor,insert+anchor)
s=s.replace('Match each letter to one of the listed structures. This is a schematic, not a measured anatomical specimen.','Match each letter to the listed structure, hormone or event. Use the diagram and the lesson explanation.')
s=re.sub(r'Identify the labelled structures(?: or signals)*','Identify the labelled structures or signals',s).replace('Choose a structure','Choose an answer')
p.write_text(s)
p=R/'workspace/assets/revision-practice.js';s=p.read_text().replace('lesson:concept?.lesson||q.lesson','lesson:q.lesson');p.write_text(s)
# Resolve images at render time; keep stable short paths in saved question snapshots.
p=R/'workspace/assets/textbook-practice.js';s=p.read_text()
if 'const asset='not in s:s=s.replace(" const root=document.querySelector", " const asset=path=>global.BiologyChapterAssets?.resolve(path)||path;\n const root=document.querySelector")
s=s.replace('esc(c.src||M.pages[c.page].src)','esc(asset(c.src||M.pages[c.page].src))').replace('esc(p.src)','esc(asset(p.src))')
p.write_text(s)
print('Runtime patches applied')
