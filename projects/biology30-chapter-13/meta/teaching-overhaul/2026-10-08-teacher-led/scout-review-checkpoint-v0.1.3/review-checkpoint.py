from pathlib import Path
import hashlib,json,subprocess,datetime
ROOT=Path(__file__).resolve().parent
REPO=Path('/Users/deanguedo/Documents/GitHub/canvas-helper')
inventory=json.loads((REPO/'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1/CHAPTER_INVENTORY.json').read_text())
statuses={11:'previous integrated teaching; regression closure remains',12:'previous integrated teaching; regression closure remains',13:'lessons 01–03 independently reviewed isolated candidate; 04–13 unfinished',17:'accepted teaching method and 01–07 owner preserved; existing 08–15+extension candidate pending teacher acceptance'}
rows=[]
for c in inventory['chapters']:
 data=(REPO/c['canonicalEntry']).read_bytes()
 current=hashlib.sha256(data).hexdigest()
 assert current==c['entrySha256'],f"Chapter {c['chapter']} owner drift"
 rows.append({**c,'verifiedCurrentSha256':current,'matchesPriorInventory':True,'instructionalStatus':statuses.get(c['chapter'],'not yet independently reviewed against teaching standard'),'sourceCoverageThisPass':'textbook pp436–442; teacher slides04–13 visuals; current native lessons01–03; complete returned manuscripts and practice map' if c['chapter']==13 else 'owner/source-presence and workflow status only','browserCoverageThisPass':'desktop route render and preserved visual review01–03; lesson02 vocabulary; optional response save/reload/All My Work, progress unchanged; source reader printed439/PDF6' if c['chapter']==13 else 'prior recorded checks only; no new browser checks','lmsOnlyChecks':'actual Brightspace learner persistence/photos/SCORM; not run','complete':False})
out={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownerRepo':str(REPO),'branch':subprocess.check_output(['git','branch','--show-current'],cwd=REPO,text=True).strip(),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),'modelApproval':'GPT-6.1 Sol / High; Dean approved Oct08 12:20 UTC; unchanged','courseComplete':False,'nextUnfinishedChapter':13,'nextUnfinishedLesson':'lesson-04','chapters':rows}
(ROOT/'COMPLETION_MATRIX.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'chaptersVerified':len(rows),'branch':out['branch'],'next':'13 / lesson-04','courseComplete':False},indent=2))
