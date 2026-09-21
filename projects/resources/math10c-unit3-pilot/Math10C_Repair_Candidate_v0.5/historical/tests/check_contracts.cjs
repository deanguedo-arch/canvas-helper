const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.runInNewContext(fs.readFileSync(root+'/workspace/assets/unit-data.js','utf8'),ctx);
const D=ctx.window.UNIT3_DATA,M=require(root+'/workspace/assets/algebra.js'),C=require(root+'/workspace/assets/contracts.js');const results=[];
function test(name,fn){try{fn();results.push({id:name,status:'pass'});}catch(e){results.push({id:name,status:'fail',detail:e.message});console.log('FAIL',name,e.message);}}
for(const q of D.questions)test('AUTHORED-'+q.id,()=>{assert.equal(C.check(q.answer,q).status,q.mode==='split'?'ungraded':'correct');if(q.expression)assert.ok(M.eq(M.parse(q.answer).p,M.parse(q.expression).p));});
const q=(answer,mode='factor',contract='core-quadratic-v1')=>({answer,mode,contract});
for(const raw of ['(x+4)*(x+3)','(3+x)(4+x)','(-x-3)(-x-4)','(-1)(x+3)(-x-4)','((x+3))^1*(x+4)','(x+3)1(x+4)'])test('FORM-'+raw,()=>assert.equal(C.check(raw,q('(x+3)(x+4)')).status,'correct'));
const cases=[['M01','(x+3)(x+4)',q('(x+3)(x+4)'),'correct'],['M02','(x+4)*(x+3)',q('(x+3)(x+4)'),'correct'],['M03','(x+2)(x+6)',q('(x+3)(x+4)'),'incorrect'],['M04','x^2+7x+12',q('(x+3)(x+4)'),'equivalent'],['M05','(x+3)(x+4',q('(x+3)(x+4)'),'input'],['M06','2(x+2)(x+3)',q('2(x+2)(x+3)'),'correct'],['M07','2(x^2+5x+6)',q('2(x+2)(x+3)'),'equivalent'],['M08','(x-3)(x+2)',q('(x-3)(x+2)'),'correct'],['M09','x^2+3x+4x+12',q('x^2+7x+12','split'),'intermediate']];
for(const[id,raw,task,status]of cases)test('BINDING-'+id,()=>assert.equal(C.check(raw,task).status,status));
test('M09-final-field-is-not-complete',()=>assert.equal(C.check('x^2+3x+4x+12',q('(x+3)(x+4)')).status,'equivalent'));
test('Equivalent-middle-split-not-false-algebra',()=>assert.equal(C.check('x^2+2x+5x+12',q('x^2+7x+12','split')).status,'equivalent'));
test('Integer-GCF-inside-binomial-is-incomplete',()=>assert.equal(C.check('(2x+4)(x+3)',q('2(x+2)(x+3)')).status,'equivalent'));
test('Core-variable-is-bounded',()=>assert.equal(C.check('(y+3)(y+4)',q('(x+3)(x+4)')).status,'unsupported'));
test('Core-power-is-bounded',()=>assert.equal(C.check('x^3',q('(x+3)(x+4)')).status,'unsupported'));
test('Malformed-expression-preserves-raw',()=>{let raw='(x+3)(x+4';C.check(raw,q('(x+3)(x+4)'));assert.equal(raw,'(x+3)(x+4');});
for(const raw of ['alert(1);','constructor.constructor(1)','__proto__','x/2','x^7','('.repeat(25)+'x'+')'.repeat(25),'1000000*1000000'])test('UNSUPPORTED-'+raw,()=>assert.notEqual(C.check(raw,q('(x+3)(x+4)')).status,'correct'));
let count=0;for(const family of ['positive','signed','common'])for(let p=family==='positive'?1:-9;p<=9;p++)for(let v=p;v<=9;v++)if(p&&v)for(let g=family==='common'?2:1;g<=(family==='common'?9:1);g++){
 const item=C.family(family,p,v,g);test('GEN-'+item.id,()=>{const coefficients=M.parse(item.answer).p;assert.equal(coefficients.xx,g);assert.equal(coefficients.x||0,g*(p+v));assert.equal(coefficients['']||0,g*p*v);assert.equal(C.check(item.answer,item).status,'correct');assert.deepEqual(C.fromId(item.id),item);});count++;}
test('BINDING-M11',()=>assert.equal(C.trig('26.6 degrees').status,'correct'));
test('BINDING-M12',()=>assert.equal(C.trig('0.464 radians').status,'different_requested_unit'));
test('Trig-impossible-acute-angle-is-mathematical',()=>assert.equal(C.trig('120 degrees').status,'incorrect'));
test('Trig-negative-length-is-mathematical',()=>assert.equal(C.trig('-5 m',{kind:'length'}).status,'incorrect'));
test('Trig-length-value-and-unit',()=>assert.equal(C.trig('5.0 m',{kind:'length'}).status,'correct'));
test('Trig-precision-not-concept-diagnosis',()=>assert.equal(C.trig('26.565 degrees').status,'precision'));
test('Trig-missing-unit',()=>assert.equal(C.trig('26.6').status,'missing_unit'));
test('BINDING-M16-explicit-exhaustion',()=>assert.throws(()=>C.generate('positive',46,1),/No fresh/));
test('Deterministic-seed-and-frozen-parameters',()=>assert.deepEqual(C.generate('signed',6,121),C.generate('signed',6,121)));
test('Fresh-means-different-mathematics',()=>{const all=C.generate('positive',45,12);const avoid=all.map(C.signature);assert.throws(()=>C.generate('positive',1,13,avoid),/No fresh/);});
for(let i=17;i<=30;i++)test('PILOT-UNSUPPORTED-M'+i,()=>assert.equal(C.check('x',{contract:'future-M'+i,answer:'x',mode:'factor'}).status,'unsupported'));
const crypto=require('node:crypto'),hash=crypto.createHash('sha256').update(fs.readFileSync(root+'/tests/original_M01_M30.json')).digest('hex');test('Original-corpus-immutable',()=>assert.equal(hash,'b59def072b94e8a208cb2fef5418b0898620d96a1966fba3c89fbbfcf4431cb5'));
const output={suite:'Exact authored contracts, all bounded generated instances, derived original-fixture bindings and separate guards',scope:'Local construction checks, not full content, Studio, accessibility or LMS acceptance',generatedInstances:count,passed:results.filter(x=>x.status==='pass').length,failed:results.filter(x=>x.status==='fail').length,originalFixtureHash:hash,originalFixtureExecutionMetadata:'unchanged/not_run',results};fs.writeFileSync(root+'/evidence/contract-results.json',JSON.stringify(output,null,2));console.log(JSON.stringify({passed:output.passed,failed:output.failed,generatedInstances:count}));if(output.failed)process.exitCode=1;
