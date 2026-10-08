from pathlib import Path
import hashlib,json,base64,re,shutil
ROOT=Path(__file__).resolve().parent
SOURCE=ROOT/'comparison/ch13-batch01-03-v0.1.2'
OUT=ROOT/'comparison/ch13-batch01-03-v0.1.3'
ART=ROOT/'generated_images/exec-dfb42ea8-7138-4fed-ba8e-594fea31d10a.png'
sha=lambda x:hashlib.sha256(x).hexdigest()
assert not OUT.exists(),'Refuse overwrite'
shutil.copytree(SOURCE,OUT,symlinks=True)
assets=OUT/'new/assets'; native_assets=assets.resolve(); assets.unlink(); assets.mkdir()
for p in native_assets.iterdir(): (assets/p.name).symlink_to(p,target_is_directory=p.is_dir())
visuals=assets/'teaching-review'; visuals.mkdir()
png=base64.b64encode(ART.read_bytes()).decode()
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1536 1216" role="img" aria-labelledby="title desc">
<title id="title">Two ways hormones signal to a target cell</title><desc id="desc">Left: a conceptual water-soluble hormone remains outside a detailed phospholipid bilayer and binds a receptor spanning the membrane; the receptor initiates an internal signalling relay. Right: a conceptual steroid has crossed the membrane and binds an intracellular receptor near a nucleus; the system can influence gene activity. The orange shapes are symbols, not molecular structures. Thyroid hormone uptake is not shown.</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#146c60"/></marker></defs>
<rect width="1536" height="1216" fill="#fff"/>
<image x="0" y="96" width="1536" height="1024" href="data:image/png;base64,{png}"/>
<g font-family="Arial,sans-serif" fill="#171b1b">
<text x="40" y="56" font-size="34" font-weight="700">Water-soluble hormone</text><text x="810" y="56" font-size="34" font-weight="700">Steroid hormone (lipid soluble)</text>
<g font-size="25"><text x="445" y="248">Hormone stays outside</text><path d="M446 258L320 299" fill="none" stroke="#171b1b" stroke-width="2"/>
<text x="455" y="376">Surface receptor</text><path d="M465 384L359 424" fill="none" stroke="#171b1b" stroke-width="2"/>
<text x="34" y="634">Cytoplasm</text><text x="811" y="634">Cytoplasm</text>
<rect x="969" y="431" width="486" height="53" rx="2" fill="#fff" fill-opacity=".94"/><text x="984" y="465">Cell membrane: phospholipid bilayer</text>
<text x="43" y="1080">Internal signalling relay</text><path d="M309 1050L427 832" fill="none" stroke="#171b1b" stroke-width="2"/>
<text x="809" y="788">Intracellular receptor</text><path d="M1052 794L1199 767" fill="none" stroke="#171b1b" stroke-width="2"/>
<text x="1031" y="291">Steroid enters the cell</text><path d="M977 321L977 681" stroke="#146c60" stroke-width="4" fill="none" marker-end="url(#arrow)"/>
<text x="1410" y="1090">Nucleus</text><path d="M1442 1060L1405 1005" fill="none" stroke="#171b1b" stroke-width="2"/>
</g><path d="M685 658L685 932" fill="none" stroke="#146c60" stroke-width="4" marker-end="url(#arrow)"/>
<text x="40" y="1166" font-size="27" font-weight="700">Surface binding → internal relay</text><text x="810" y="1166" font-size="27" font-weight="700">Intracellular binding → gene activity</text>
<text x="40" y="1201" font-size="22">Conceptual models; not molecular scale. Thyroid hormones use transport proteins and are not shown here.</text>
</g></svg>'''
(visuals/'ch13-l02-receptors.svg').write_text(svg)
shutil.copy2(ART,visuals/'ch13-l02-receptor-art.png')
fragment=(OUT/'lesson-02.teaching-fragment.html').read_text()
old_figure=re.search(r'<figure\b[\s\S]*?</figure>',fragment).group()
new_figure=re.sub(r'src="data:image/svg\+xml;base64,[^"]+"','src="assets/teaching-review/ch13-l02-receptors.svg"',old_figure,count=1)
assert new_figure!=old_figure
new_figure=new_figure.replace('Steroids act through intracellular receptors. Thyroid hormone is a chemically distinct lipid-soluble example.','The steroid model shows intracellular binding. Orange shapes are conceptual symbols, not molecular structures. Thyroid hormones use transport proteins and are not shown here.')
new_fragment=fragment.replace(old_figure,new_figure,1)
(OUT/'lesson-02.teaching-fragment.html').write_text(new_fragment)
html=(OUT/'new/index.html').read_text(); assert html.count(fragment)==1
html=html.replace(fragment,new_fragment,1); (OUT/'new/index.html').write_text(html)
receipt=json.loads((OUT/'ASSEMBLY_RECEIPT.json').read_text())
receipt['candidateSha256']=sha(html.encode())
receipt['visualChangeAuthorization']='Dean Oct08 12:39UTC: high-quality imagegen improvements; source reference preserved as evidence'
receipt['visualArtifact']={'path':'new/assets/teaching-review/ch13-l02-receptors.svg','sha256':sha(svg.encode()),'generatedArtworkSha256':sha(ART.read_bytes()),'scientificallyReviewed':True,'browserVerified':False,'chemicalStructureDepicted':False,'deterministicLabels':True,'purpose':'show phospholipid barrier and distinguish external recognition/internal relay from intracellular steroid binding'}
for l in receipt['lessons']:
 if l['lessonId']=='lesson-02':
  l['fragmentSha256']=sha(new_fragment.encode()); l['lockedFigureExact']=False; l['figureChangeAuthorizedByLatestUser']=True
assert html.replace(new_fragment,fragment,1)==(SOURCE/'new/index.html').read_text()
receipt['onlyDeltaFromV012']='lesson02 figure image src, accessible caption and new visual assets; all protected tasks and runtime exact'
(OUT/'ASSEMBLY_RECEIPT.json').write_text(json.dumps(receipt,indent=2)+'\n')
(OUT/'index.html').write_text((OUT/'index.html').read_text().replace('v0.1.2','v0.1.3'))
print(json.dumps(receipt['visualArtifact'],indent=2)); print('candidateSha256',receipt['candidateSha256'])
