"""Produce an UNAPPLIED unified patch and check it against isolated references.
Does not touch a Canvas Helper checkout. No git commit/branch/push is performed.
"""
from pathlib import Path
import hashlib,json,difflib,tempfile,shutil,subprocess
ROOT=Path(__file__).resolve().parents[2];base=ROOT/'shared-repository/base';proposed=ROOT/'shared-repository/proposed'
paths=sorted({p.relative_to(base)for p in base.rglob('*')if p.is_file()}|{p.relative_to(proposed)for p in proposed.rglob('*')if p.is_file()})
chunks=[];files=[]
for rel in paths:
 a=base/rel;b=proposed/rel;old=a.read_bytes()if a.exists()else b'';new=b.read_bytes()if b.exists()else b''
 if old==new:continue
 h=lambda x:hashlib.sha256(x).hexdigest()
 chunks.append('diff --git a/'+rel.as_posix()+' b/'+rel.as_posix()+'\n')
 if not a.exists():chunks.append('new file mode 100644\n')
 chunks.extend(difflib.unified_diff(old.decode().splitlines(True),new.decode().splitlines(True),fromfile='a/'+rel.as_posix()if a.exists()else'/dev/null',tofile='b/'+rel.as_posix()if b.exists()else'/dev/null'))
 files.append({'path':rel.as_posix(),'baseSha256':h(old)if a.exists()else None,'proposedSha256':h(new),'status':'unapplied-to-repository'})
patch=ROOT/'shared-repository/canvas-helper-save-receipts-and-codec.patch';patch.write_text(''.join(chunks))
with tempfile.TemporaryDirectory(prefix='math10c-patch-check-')as d:
 copy=Path(d);shutil.copytree(base,copy,dirs_exist_ok=True)
 r=subprocess.run(['git','apply','--check',str(patch)],cwd=copy,capture_output=True,text=True)
 if r.returncode:raise RuntimeError('Patch dry-run failed: '+r.stderr)
 # Applying only to a disposable reference mirror proves patch bytes reconstruct
 # the proposed source. This is NOT application to a repository checkout.
 a=subprocess.run(['git','apply',str(patch)],cwd=copy,capture_output=True,text=True)
 if a.returncode:raise RuntimeError(a.stderr)
 assert all((copy/f['path']).read_bytes()==(proposed/f['path']).read_bytes()for f in files)
report={'recordedBaseline':'d0b4cf731dd180cebee908915772e90687d40215','repositoryApplied':False,'isolatedReferenceDryRun':'passed','isolatedPatchReconstruction':'passed','fullRepositoryTests':'not_run','Studio':'not_run','CI':'not_run','patchSha256':hashlib.sha256(patch.read_bytes()).hexdigest(),'files':files}
(ROOT/'evidence/shared-patch-verification.json').write_text(json.dumps(report,indent=2));(ROOT/'shared-repository/PATCH_BASE_HASHES.json').write_text(json.dumps(report,indent=2));print(json.dumps({'changedFiles':len(files),'dryRun':r.returncode,'patch':str(patch)}))
