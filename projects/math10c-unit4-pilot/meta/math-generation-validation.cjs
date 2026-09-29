const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const context=JSON.parse(process.argv[2]||'{}');
const workspace=context.workspace;
const sandbox={};
sandbox.globalThis=sandbox;
for(const file of ['chapter4-math.js','chapter4-checkers.js','chapter4-practice-data.js']){
  const full=path.join(workspace,'assets',file);
  vm.runInNewContext(fs.readFileSync(full,'utf8'),sandbox,{filename:full});
}
const math=sandbox.Chapter4Math;
const checkers=sandbox.Chapter4Checkers;
const practice=sandbox.Chapter4PracticeData;
const errors=[];
const lessons=Object.keys(checkers.tasks).sort();
const generatedQuestionsPerLesson={};
for(const lesson of lessons){
  const fingerprints=new Set();
  for(let seed=0;seed<10;seed++)for(const question of practice.lessonSet(lesson,seed,5))fingerprints.add(question.fingerprint);
  generatedQuestionsPerLesson[lesson]=fingerprints.size;
  if(fingerprints.size<50)errors.push(`Lesson ${lesson} has ${fingerprints.size} distinct generated instances; 50 are required.`);
}
const reviewPartitions=[0,1].map(seed=>practice.reviewSet(seed));
const reviewTargetUnion=[...new Set(reviewPartitions.flat().map(question=>question.target))].sort();
const expectedTargets=context.invocation.targetIds.slice().sort();
if(JSON.stringify(reviewTargetUnion)!==JSON.stringify(expectedTargets))errors.push('The two review partitions do not cover the declared target union exactly.');

const targetResponseCoverage={};
const variants=['initial','fresh','fresh2','transfer','transfer2','retention','retention2'];
for(const lesson of lessons){
  const expected=expectedTargets.filter(id=>id.startsWith(`C4-${lesson}`));
  for(const target of expected)targetResponseCoverage[target]={verification:0,verificationVariations:[],transfer:0,retention:0};
  for(const variant of variants){
    const task=checkers.getTask(lesson,variant);
    const covered=[...new Set(Object.values(task.fields).flatMap(field=>field.targets||[]))];
    const answers=Object.fromEntries(Object.entries(task.fields).map(([name,field])=>[name,field.answers[0]]));
    if(!checkers.checkTask(lesson,answers,variant).correct)errors.push(`${lesson}/${variant} rejects its reviewed answer set.`);
    for(const target of covered){if(!targetResponseCoverage[target])continue;if(variant==='initial'||variant==='fresh'||variant==='fresh2'){targetResponseCoverage[target].verification+=1;if(!targetResponseCoverage[target].verificationVariations.includes(task.variation))targetResponseCoverage[target].verificationVariations.push(task.variation);}else if(variant.startsWith('transfer'))targetResponseCoverage[target].transfer+=1;else if(variant.startsWith('retention'))targetResponseCoverage[target].retention+=1;}
  }
  for(const target of expected){const coverage=targetResponseCoverage[target];if(coverage.verification<2||coverage.verificationVariations.length<2||coverage.transfer<1||coverage.retention<1)errors.push(`${target} lacks a reachable two-variation verification, transfer, or retention path.`);}
}
if(!(checkers.getTask('42','initial').fields.verify.targets||[]).includes('C4-42d'))errors.push('C4-42d lacks an explicit equivalence-verification response.');
if(!(checkers.getTask('47','initial').fields.reason.targets||[]).includes('C4-47d'))errors.push('C4-47d lacks an explicit explanation response.');
if(!(checkers.getTask('48','initial').fields.strategy.targets||[]).includes('C4-48b'))errors.push('C4-48b lacks an explicit strategy-comparison response.');

const semanticCases=[
  ['-2^2','-4',true],['-2^2','4',false],['(-2)^2','4',true],
  ['sqrt(x^2)','x',false],['sqrt(x^4)','x^2',true],['5sqrt3','sqrt75',true]
];
for(const [left,right,expected] of semanticCases)if(math.equivalent(left,right)!==expected)errors.push(`Semantic case ${left} versus ${right} returned the wrong result.`);
const freshnessCases={};
for(const lesson of lessons){
  const initial=checkers.getTask(lesson,'initial'),fresh=checkers.getTask(lesson,'fresh'),changed=checkers.getTask(lesson,'fresh2'),transfer=checkers.getTask(lesson,'transfer');
  const fingerprints=task=>[...new Set(Object.values(task.fields).map(field=>field.fingerprint))].sort().join('|');
  freshnessCases[lesson]={routineDistinct:fingerprints(initial)!==fingerprints(fresh),changedVariation:changed.variation!==initial.variation,transferVariation:transfer.variation!==changed.variation};
  if(!Object.values(freshnessCases[lesson]).every(Boolean))errors.push(`Lesson ${lesson} does not prove distinct routine, changed-representation and transfer identities.`);
}
console.log(JSON.stringify({ok:errors.length===0,errors,measurements:{generatedQuestionsPerLesson,reviewPartitions:reviewPartitions.map(set=>set.length),reviewTargetUnion,targetResponseCoverage,semanticCases:semanticCases.length,freshnessCases}},null,2));
if(errors.length)process.exitCode=1;
