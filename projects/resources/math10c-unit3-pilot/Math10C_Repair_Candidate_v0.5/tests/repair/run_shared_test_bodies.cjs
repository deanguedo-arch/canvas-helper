/* Executes added test bodies from the actual proposed repository files after
   TypeScript erasure. The full repository imports/runner are NOT available. */
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript');const {ROOT,loadTree}=require('./emit_bridge.cjs');
const base=path.join(ROOT,'shared-repository/proposed/scripts/tests');
function compile(name,code){const out=ts.transpileModule(code,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;const m={exports:{}};const req=id=>{if(id==='../lib/scorm-state-codec.js')return loadTree('proposed').codec;return require(id);};new Function('exports','require','module',out)(m.exports,req,m);}
compile('codec',fs.readFileSync(path.join(base,'scorm-state-codec.test.ts'),'utf8'));
const content=fs.readFileSync(path.join(base,'scorm-export.test.ts'),'utf8'),added=content.slice(content.indexOf('// Isolated wire/receipt tests.'));
const prefix="import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';const buildScormBridgeScript=(globalThis as any).__repairActualBuilder;\n";
globalThis.__repairActualBuilder=loadTree('proposed').bridge.buildScormBridgeScript;compile('added-export',prefix+added);
