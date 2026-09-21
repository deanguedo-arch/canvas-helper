"""One local focused repair batch. No live checkout, integration, package or deploy.
Writes new results; optional native-origin/MathLive gates are separate commands
and are not silently treated as passes when unavailable.
"""
from pathlib import Path
import subprocess,os,json,datetime,hashlib,sys
ROOT=Path(__file__).resolve().parents[2];env={**os.environ};env.setdefault('NODE_PATH',subprocess.check_output(['npm','root','-g'],text=True).strip());rows=[]
commands=[['node','tests/repair/emit_bridge.cjs'],['node','tests/repair/core_regressions.cjs'],['node','tests/repair/codec_regressions.cjs'],['node','tests/repair/controller_regressions.cjs'],['node','tests/repair/original_fixture_bindings.cjs'],['node','tests/repair/run_shared_test_bodies.cjs'],[sys.executable,'tests/repair/independent_oracles.py'],[sys.executable,'tests/repair/worked_identity_oracles.py'],[sys.executable,'tests/repair/browser_regressions.py'],[sys.executable,'tests/repair/additional_browser_cases.py'],[sys.executable,'tests/repair/edge_browser_cases.py'],[sys.executable,'tests/repair/measure_capacity.py'],[sys.executable,'tests/assemble.py'],[sys.executable,'tests/repair/prepare_shared_patch.py']]
files={p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()for base in [ROOT/'workspace',ROOT/'shared-repository/proposed']for p in base.rglob('*')if p.is_file()}
start=int(sys.argv[1]) if len(sys.argv)>1 else 1
for i,cmd in enumerate(commands):
 if i+1<start:continue
 print('RUN',' '.join(cmd),flush=True);r=subprocess.run(cmd,cwd=ROOT,env=env,capture_output=True,text=True,timeout=240);log=f'evidence/repair-run-{i+1:02}.log';(ROOT/log).write_text(r.stdout+'\n'+r.stderr);rows.append({'command':' '.join(cmd),'exitCode':r.returncode,'result':'passed'if r.returncode==0 else'failed','log':log})
 (ROOT/'evidence/repair-execution-ledger-partial.json').write_text(json.dumps({'sourceSha256':files,'startCommand':start,'commands':rows},indent=2))
 if r.returncode:print((r.stdout+'\n'+r.stderr)[-3000:],flush=True)
report={'recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceSha256':files,'startCommand':start,'commands':rows,'warning':'Individual passing commands do not establish all acceptance cases. Capacity commands succeed when they correctly MEASURE failures; see fit flags. Native origin, MathLive, full repository, Studio, CI, LMS and AT gates excluded, not passed.'}
(ROOT/'evidence/repair-execution-ledger.json').write_text(json.dumps(report,indent=2));print(json.dumps({'commandsPassed':sum(x['exitCode']==0 for x in rows),'commandsFailed':sum(x['exitCode']!=0 for x in rows)}));sys.exit(any(x['exitCode']!=0 for x in rows))
