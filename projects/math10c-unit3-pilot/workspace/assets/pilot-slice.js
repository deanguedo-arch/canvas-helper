/* Blocked Chapter 3 review-candidate boundary for math10c-unit3-pilot.
   All 22 mastery-course pages are learner-reachable. Optional textbook
   practice is owned by three standalone SCORM courses. Completion derives only from the eight
   recorded lesson checks u3-check-31 through u3-check-38. The triangle
   contrast (u3-transfer) stays reachable as an optional lab and never counts
   toward Chapter progress. Saved state keeps its key, version and all
   evidence; an unknown route migrates to u3-overview. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MathPilotSlice=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const ACTIVE_ROUTES=['u3-overview','u3-ready','u3-31','u3-32','u3-33','u3-34','u3-35','u3-36','u3-37','u3-38','u3-practice','u3-mixed','u3-errors','u3-review','u3-reference','u3-number-lab','u3-expansion-lab','u3-vocab','u3-work','u3-resources','u3-support-library','u3-transfer'];
const INACTIVE_ROUTES=[];
const OPTIONAL_ROUTES=['u3-transfer'];
const COMPLETION_LESSONS=['3.1','3.2','3.3','3.4','3.5','3.6','3.7','3.8'];
const REQUIRED_IDS=['u3-check-31','u3-check-32','u3-check-33','u3-check-34','u3-check-35','u3-check-36','u3-check-37','u3-check-38'];
const TOTAL_CHECKPOINTS=8;
function isActiveRoute(id){return ACTIVE_ROUTES.indexOf(id)!==-1;}
function isKnownRoute(id){return isActiveRoute(id)||INACTIVE_ROUTES.indexOf(id)!==-1;}
function isOptionalRoute(id){return OPTIONAL_ROUTES.indexOf(id)!==-1;}
function isRequiredId(id){return REQUIRED_IDS.indexOf(id)!==-1;}
function migrateRoute(state){
 if(!state||typeof state!=='object')return state;
 if(isKnownRoute(state.route))return state;
 const next={};for(const key of Object.keys(state))next[key]=state[key];
 next.route='u3-overview';return next;
}
function angleSetupOk(trig){const t=trig||{};return t.side==='BC'&&t.adjacent==='AB'&&t.hypotenuse==='AC'&&t.ratio==='tan';}
function lengthSetupOk(trig){return (trig||{}).length==='sin';}
function reasonOk(trig){return ((trig||{}).reason||'').trim().length>0;}
function checkedCurrent(trig,rowsKey,rawKey,statusKey){const t=trig||{},rows=Array.isArray(t[rowsKey])?t[rowsKey]:[],latest=rows.at(-1);return t[statusKey]==='correct'&&!!latest&&latest[1]===t[rawKey]&&latest[2]==='correct';}
function isTriangleComplete(trig){
 const t=trig||{};
 return angleSetupOk(t)&&checkedCurrent(t,'aa','angleRaw','angle')&&lengthSetupOk(t)&&checkedCurrent(t,'la','lengthRaw','lengthStatus')&&reasonOk(t);
}
function recordedLessons(done){const lessons=Array.isArray(done)?done:[];return COMPLETION_LESSONS.filter(n=>lessons.indexOf(n)!==-1);}
function pilotProgress(done,trig){
 const recorded=recordedLessons(done);
 const factoring=recorded.indexOf('3.5')!==-1,transfer=isTriangleComplete(trig);
 return{factoring,transfer,lessons:recorded,count:recorded.length,total:TOTAL_CHECKPOINTS};
}
const chapterProgress=pilotProgress;
const unitProgress=pilotProgress;
/* Chapter 3 textbook library. Printed pages 134-201 map onto 11 staged PDFs;
   PDF page numbers are 1-based offsets from each file's printed start. The
   Unit 3 solutions PDF is never referenced here. */
const TEXTBOOK=[
{key:'3.1',title:'3.1 Factors and multiples',file:'assets/textbook/math10c-3-1.pdf',printStart:134,printEnd:141,pdfPages:8},
{key:'3.2',title:'3.2 Squares, cubes and roots',file:'assets/textbook/math10c-3-2.pdf',printStart:142,printEnd:149,pdfPages:8},
{key:'3.3',title:'3.3 Common factors',file:'assets/textbook/math10c-3-3.pdf',printStart:150,printEnd:156,pdfPages:7},
{key:'3.4',title:'3.4 Modelling binomial products',file:'assets/textbook/math10c-3-4.pdf',printStart:157,printEnd:158,pdfPages:2},
{key:'3.5',title:'3.5 Factoring x^2 + bx + c',file:'assets/textbook/math10c-3-5.pdf',printStart:159,printEnd:167,pdfPages:9},
{key:'3.6',title:'3.6 Factoring ax^2 + bx + c',file:'assets/textbook/math10c-3-6.pdf',printStart:168,printEnd:181,pdfPages:14},
{key:'3.7',title:'3.7 Multiplying polynomials',file:'assets/textbook/math10c-3-7.pdf',printStart:182,printEnd:187,pdfPages:6},
{key:'3.8',title:'3.8 Special polynomials',file:'assets/textbook/math10c-3-8.pdf',printStart:188,printEnd:195,pdfPages:8},
{key:'study-guide',title:'Chapter 3 study guide',file:'assets/textbook/math10c-study-guide-3.pdf',printStart:196,printEnd:197,pdfPages:2},
{key:'review',title:'Chapter 3 review',file:'assets/textbook/math10c-review-3.pdf',printStart:198,printEnd:200,pdfPages:3},
{key:'practice-test',title:'Chapter 3 practice test',file:'assets/textbook/math10c-practice-test-3.pdf',printStart:201,printEnd:201,pdfPages:1}];
function textbookForPrintedPage(n){if(!Number.isSafeInteger(n))return null;for(const t of TEXTBOOK)if(n>=t.printStart&&n<=t.printEnd)return{key:t.key,title:t.title,file:t.file,printed:n,pdfPage:n-t.printStart+1,pdfPages:t.pdfPages};return null;}
const QUESTION_SPECS={
'3.1':[[140,3,19],[141,20,22]],'3.2':[[146,4,6],[147,7,18]],'3.3':[[155,4,14],[156,15,22]],'3.4':[[158,1,4]],
'3.5':[[166,4,11],[167,12,23]],'3.6':[[177,5,13],[178,14,23]],'3.7':[[186,4,15],[187,16,22]],'3.8':[[194,4,9],[195,10,21]],
review:[[198,1,10,'review'],[199,11,22,'review'],[200,23,35,'review'],[201,1,9,'test']]};
const TEXTBOOK_QUESTIONS=[];
for(const[key,specs]of Object.entries(QUESTION_SPECS))for(const[page,from,to,group]of specs)for(let n=from;n<=to;n++){const kind=group||'lesson',id=kind==='review'?'review-q'+n:kind==='test'?'test-q'+n:'q'+n,prefix=kind==='review'?'review':kind==='test'?'test':key.replace('.','-');TEXTBOOK_QUESTIONS.push({section:key,id,label:kind==='review'?'Review '+n:kind==='test'?'Practice test '+n:'Q'+n,number:n,printed:page,image:'assets/textbook-crops/'+prefix+'-q'+n+'.png'});}
function textbookQuestions(section){return TEXTBOOK_QUESTIONS.filter(q=>q.section===section).map(q=>({...q}));}
function textbookQuestion(section,id){const q=TEXTBOOK_QUESTIONS.find(x=>x.section===section&&x.id===id);return q?{...q}:null;}
return{ACTIVE_ROUTES,INACTIVE_ROUTES,OPTIONAL_ROUTES,COMPLETION_LESSONS,REQUIRED_IDS,TOTAL_CHECKPOINTS,TEXTBOOK,TEXTBOOK_QUESTIONS,isActiveRoute,isKnownRoute,isOptionalRoute,isRequiredId,migrateRoute,textbookForPrintedPage,textbookQuestions,textbookQuestion,angleSetupOk,lengthSetupOk,reasonOk,checkedCurrent,isTriangleComplete,recordedLessons,pilotProgress,chapterProgress,unitProgress};
});
