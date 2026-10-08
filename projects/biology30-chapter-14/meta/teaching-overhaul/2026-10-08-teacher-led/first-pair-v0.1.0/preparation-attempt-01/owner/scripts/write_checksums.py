from pathlib import Path
import hashlib
root=Path(__file__).resolve().parents[1]
records=[]
for p in sorted(root.rglob('*')):
 if not p.is_file()or p.name=='SHA256SUMS.txt'or '__pycache__'in p.parts:continue
 records.append(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+p.relative_to(root).as_posix())
(root/'SHA256SUMS.txt').write_text('\n'.join(records)+'\n')
print(len(records),'checksums written')
