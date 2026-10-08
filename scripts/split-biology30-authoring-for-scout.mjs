import { execFileSync } from 'node:child_process';
import path from 'node:path';

const chapter = Number(process.argv[2]);
if (![16,18,19,20].includes(chapter)) throw new Error('Use chapter 16, 18, 19 or 20');
const root = path.resolve(`projects/biology30-chapter-${chapter}/meta/teaching-overhaul/2026-10-08-teacher-led/chapter-sized-authoring-v0.1.0`);
const source = path.join(root, `Biology30_CH${chapter}_Chapter_Sized_Source_Handoff_v0.1.0.zip`);
const python = `
import sys, pathlib, hashlib, json, zipfile, io
source=pathlib.Path(sys.argv[1]); destination=pathlib.Path(sys.argv[2]); chapter=sys.argv[3]
data=source.read_bytes(); size=18_000_000
chunks=[data[i:i+size] for i in range(0,len(data),size)]
manifest={'schemaVersion':1,'chapter':int(chapter),'originalName':source.name,'originalBytes':len(data),'originalSha256':hashlib.sha256(data).hexdigest(),'parts':[],'role':'source handoff only; not runnable course or authoring approval'}
for i,chunk in enumerate(chunks,1):
    manifest['parts'].append({'order':i,'archive':f'Biology30_CH{chapter}_Source_Part{i:02d}_of{len(chunks):02d}.zip','payload':f'archive.part{i:02d}','bytes':len(chunk),'sha256':hashlib.sha256(chunk).hexdigest()})
instructions='''These ZIPs contain ordered byte chunks of ONE verified source handoff, not separate chapters. Extract every part to one directory. Read PARTS_MANIFEST.json; verify each chunk bytes/SHA256, concatenate payloads in manifest order, then verify the resulting original ZIP bytes/SHA256 and CRC before extraction. Every part is required. Do not claim delivery/completeness from this part alone. Read START_HERE.md in the reconstructed source archive. Preserve source and protected contracts; no source content was changed when splitting. These are teacher/author source files including answer-bearing material, not student distribution.\n'''
destination.mkdir(parents=True,exist_ok=True)
receipts=[]
for entry,chunk in zip(manifest['parts'],chunks):
    buffer=io.BytesIO()
    with zipfile.ZipFile(buffer,'w',compression=zipfile.ZIP_STORED) as z:
        z.writestr(entry['payload'],chunk)
        z.writestr('PARTS_MANIFEST.json',json.dumps(manifest,indent=2)+'\\n')
        z.writestr('READ_FIRST.txt',instructions)
    payload=buffer.getvalue(); out=destination/entry['archive']
    if out.exists() and out.read_bytes()!=payload: raise RuntimeError('Refuse overwrite: '+str(out))
    out.write_bytes(payload)
    with zipfile.ZipFile(out) as z:
        assert z.testzip() is None
        assert z.read(entry['payload'])==chunk
    assert len(payload)<20_000_000
    receipts.append({'file':str(out),'bytes':len(payload),'sha256':hashlib.sha256(payload).hexdigest()})
assert hashlib.sha256(b''.join(chunks)).hexdigest()==manifest['originalSha256']
with zipfile.ZipFile(io.BytesIO(data)) as z: assert z.testzip() is None
record={'manifest':manifest,'archives':receipts,'reconstructionVerified':True,'uploaded':False}
(destination/'SPLIT_RECEIPT.json').write_text(json.dumps(record,indent=2)+'\\n')
print(json.dumps({'chapter':chapter,'parts':len(chunks),'originalSha256':manifest['originalSha256'],'eachBelow20MB':True,'reconstructionVerified':True}))
`;
process.stdout.write(execFileSync('python3', ['-c', python, source, path.join(root,'scout-parts'), String(chapter)], {encoding:'utf8'}));
