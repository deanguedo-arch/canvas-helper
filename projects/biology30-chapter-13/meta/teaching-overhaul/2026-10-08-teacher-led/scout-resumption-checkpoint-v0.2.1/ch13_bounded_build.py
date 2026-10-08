from pathlib import Path
from html.parser import HTMLParser
import re,json,hashlib,shutil

sha=lambda b:hashlib.sha256(b).hexdigest()
def term(key,label):return f'<button type="button" class="bio-term" data-term-id="ch13-word-{key}">{label}</button>'
class Bounds(HTMLParser):
    def __init__(self,text,target):
        super().__init__(convert_charrefs=False);self.text=text;self.target=target;self.depth=0;self.a=None;self.b=None;self.tag=None
        self.lines=[0]
        for m in re.finditer('\n',text):self.lines.append(m.end())
    def pos(self):
        line,col=self.getpos();return self.lines[line-1]+col
    def handle_starttag(self,tag,attrs):
        if self.a is None and dict(attrs).get('id')==self.target:self.a=self.pos();self.tag=tag;self.depth=1
        elif self.a is not None and self.b is None and tag==self.tag:self.depth+=1
    def handle_endtag(self,tag):
        if self.a is not None and self.b is None and tag==self.tag:
            self.depth-=1
            if self.depth==0:self.b=self.text.index('>',self.pos())+1
def bounds(text,ident):
    p=Bounds(text,ident);p.feed(text);assert p.a is not None and p.b is not None,ident
    return p.a,p.b
def build(before,out,contents,sources,header_edits=None):
    before=Path(before);out=Path(out)
    if out.exists():
        assert not (out/'BOUNDED_RECEIPT.json').exists(),'Refuse to overwrite completed candidate'
        shutil.rmtree(out)
    shutil.copytree(before,out,symlinks=True)
    original=(before/'new/index.html').read_text();t=original;deltas=[]
    for ident,body in contents.items():
        a,b=bounds(t,ident);old=t[a:b];tag=re.match('<[^>]+>',old)[0];closing='</'+re.match(r'<(\w+)',tag)[1]+'>'
        figures=re.findall(r'<figure\b[\s\S]*?</figure>',old)
        tables=re.findall(r'<div class="comparison-table">[\s\S]*?</table></div>',old)
        for i,f in enumerate(figures):body=body.replace('{FIGURE'+str(i)+'}',f)
        for i,f in enumerate(tables):body=body.replace('{TABLE'+str(i)+'}',f)
        assert not re.search(r'\{(?:FIGURE|TABLE)\d+\}',body),ident
        new=tag+body+closing
        assert figures==re.findall(r'<figure\b[\s\S]*?</figure>',new),ident
        assert set(re.findall('data-term-id="([^"]+)"',old))<=set(re.findall('data-term-id="([^"]+)"',new)),(ident,'vocabulary identity lost')
        assert not re.search(r'<(?:input|textarea|select|script|style|iframe)\b|\son\w+\s*=',body,re.I),ident
        t=t[:a]+new+t[b:]
        deltas.append((old,new,ident))
        (out/f'{ident}.fragment.html').write_text(new)
    for old,new in header_edits or []:
        assert t.count(old)==1,(old,t.count(old));t=t.replace(old,new,1);deltas.append((old,new,'header/source shortcut'))
    recovered=t
    for old,new,_ in reversed(deltas):assert recovered.count(new)==1;recovered=recovered.replace(new,old,1)
    assert recovered==original,'Outside bounded intervals drifted'
    assert re.findall(r'<figure\b[\s\S]*?</figure>',original)==re.findall(r'<figure\b[\s\S]*?</figure>',t)
    assert re.findall(r'<(?:input|textarea|select|script)\b[^>]*>',original)==re.findall(r'<(?:input|textarea|select|script)\b[^>]*>',t)
    (out/'new/index.html').write_text(t)
    receipt={'beforeSha256':sha(original.encode()),'candidateSha256':sha(t.encode()),'canonicalIntegrated':False,'teacherAccepted':False,'outsideIntervalsExact':True,'protectedPracticeAssessmentAndRuntimeExact':True,'originalFiguresExact':True,'sources':sources,'blocks':[{'id':id,'beforeSha256':sha(old.encode()),'afterSha256':sha(new.encode())} for old,new,id in deltas],'instructionalReview':'Author source/practice trace; fresh blind learner review pending','browserVerified':False,'chapterComplete':False}
    (out/'BOUNDED_RECEIPT.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in receipt.items() if k!='blocks'},ensure_ascii=False,indent=2))
