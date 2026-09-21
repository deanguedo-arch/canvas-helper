"""Executable native-origin gate. No storage or Web Locks replacements.
Runs a temporary local server and two real pages in one browser context.
Does NOT install into Canvas Helper, package SCORM, or contact a tenant.
Exit 2 records a blocked environment; it must never be reported as a pass.
"""
from browser_env import ROOT,Server
from playwright.sync_api import sync_playwright
import json,sys,os
result={'command':'python tests/repair/native_origin_recheck.py','cases':['SAVE-10','SAVE-11','ACCESS-01'],'environment':'native localStorage and navigator.locks, same-origin Chromium tabs; no SCORM tenant','result':'not_run'}
try:
 with Server() as server,sync_playwright() as pw:
  browser=pw.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
  context=browser.new_context();a=context.new_page();b=context.new_page()
  a.goto(server.url+'/workspace/index.html',wait_until='domcontentloaded',timeout=8000)
  a.wait_for_function('window.Unit3Debug&&Unit3Debug.ready()',timeout=8000)
  b.goto(server.url+'/workspace/index.html',wait_until='domcontentloaded',timeout=8000)
  b.wait_for_function('window.Unit3Debug',timeout=8000)
  assert a.evaluate('Unit3Debug.saving().ownsWriterLock')
  assert not b.evaluate('Unit3Debug.saving().ownsWriterLock')
  a.evaluate("location.hash='u3-35'");a.locator('[data-answer="g35"]').fill('x^2+3x+4x+12')
  canonical=a.evaluate('localStorage.getItem(Unit3Debug.saving().localKey)')
  assert canonical and 'x^2+3x+4x+12' in canonical
  assert b.locator('[data-answer="g35"]').is_disabled()
  a.evaluate('Unit3Debug.releaseWriter()');b.evaluate('Unit3Debug.requestWriter()')
  assert b.evaluate('Unit3Debug.saving().blocked'), 'Stale secondary tab must reconcile after transfer'
  assert b.evaluate('localStorage.getItem(Unit3Debug.saving().localKey)')==canonical
  assert a.evaluate('Unit3Debug.saving().blocked')
  result.update(result='passed',assertions=['one native writer','secondary read-only','explicit release','stale transfer preserves canonical bytes'])
  browser.close()
except Exception as e:
 text=str(e);result.update(result='blocked' if 'ERR_BLOCKED_BY_ADMINISTRATOR' in text else 'failed',detail=text[:1600])
(ROOT/'evidence/native-origin-gate.json').write_text(json.dumps(result,indent=2));print(json.dumps(result));sys.exit(0 if result['result']=='passed' else 2 if result['result']=='blocked' else 1)
