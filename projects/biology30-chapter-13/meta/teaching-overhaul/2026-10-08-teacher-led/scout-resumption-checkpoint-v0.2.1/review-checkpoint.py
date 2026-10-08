from pathlib import Path
import hashlib,json,subprocess,datetime
ROOT=Path(__file__).resolve().parent
REPO=Path('/Users/deanguedo/Documents/GitHub/canvas-helper')
inventory=json.loads((REPO/'projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1/CHAPTER_INVENTORY.json').read_text())
statuses={11:'previous integrated teaching; regression closure remains',12:'previous integrated teaching; regression closure remains',13:'lessons 01–03 prior reviewed candidate; 04–05 locally authored candidate with source trace, desktop checks and blind review pending; 06–13 unclaimed for direct content worker',17:'parent direct source correction: exact-copy acceptance only06–07;02/05 method references;01/03/04 and08–15+extension acceptance pending; earlier01–07 accepted summary superseded'}
rows=[]
for c in inventory['chapters']:
 data=(REPO/c['canonicalEntry']).read_bytes()
 current=hashlib.sha256(data).hexdigest()
 assert current==c['entrySha256'],f"Chapter {c['chapter']} owner drift"
 rows.append({**c,'verifiedCurrentSha256':current,'matchesPriorInventory':True,'instructionalStatus':statuses.get(c['chapter'],'not yet independently reviewed against teaching standard'),'sourceCoverageThisPass':'textbook pp436–450 read/rendered; native teacher text/media04–31 reviewed; original PPTX14–43 extraction available; complete native01–08 and protected tasks; returned01–03 manuscripts; protocol and five image handoffs' if c['chapter']==13 else 'owner/source-presence and workflow status only','browserCoverageThisPass':'prior01–03 checks; newL02 reading clarification route/scroll; L04–05 route/figure rendering; five companion figure dialogs desktop; further check lifecycle pending' if c['chapter']==13 else 'prior recorded checks only; no new browser checks','lmsOnlyChecks':'actual Brightspace learner persistence/photos/SCORM; not run','complete':False})
out={'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ownerRepo':str(REPO),'branch':subprocess.check_output(['git','branch','--show-current'],cwd=REPO,text=True).strip(),'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=REPO,text=True).strip(),'modelApproval':'GPT-6.1 Sol / High; Dean approved Oct08 12:20 UTC; unchanged','courseComplete':False,'nextUnfinishedChapter':13,'nextUnfinishedLesson':'lesson-06','chapters':rows}
(ROOT/'COMPLETION_MATRIX.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'chaptersVerified':len(rows),'branch':out['branch'],'next':'13 / lesson-06','courseComplete':False},indent=2))
