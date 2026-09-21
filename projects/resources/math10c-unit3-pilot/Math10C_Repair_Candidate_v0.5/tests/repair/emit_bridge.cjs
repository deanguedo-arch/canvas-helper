/* Executes the REAL supplied TypeScript builder via type erasure only.
   Cheerio is a fail-fast unused import for this emitter path (no exporter/DOM
   parsing methods are called). This is NOT the full repository test runner. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'../..');
function loadTree(which){const base=path.join(ROOT,'shared-repository',which,'scripts/lib'),cache={};
 function load(name){if(cache[name])return cache[name].exports;const src=fs.readFileSync(path.join(base,name+'.ts'),'utf8');const code=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;const module={exports:{}};cache[name]=module;const requireLocal=(id)=>{if(id==='cheerio')return{load(){throw Error('Cheerio exporter parsing is outside the isolated bridge-emission harness.');}};return load(id.replace(/^\.\//,'').replace(/\.js$/,''));};vm.runInThisContext('(function(exports,require,module){'+code+'\n})',{filename:name+'.ts'})(module.exports,requireLocal,module);return module.exports;}
 return{bridge:load('scorm'),codec:load('scorm-state-codec')};
}
function emit(which='proposed',overrides={}){return loadTree(which).bridge.buildScormBridgeScript({tracking:JSON.parse(fs.readFileSync(path.join(ROOT,'workspace/scorm-tracking.json'))),projectSlug:'math10c-unit3-pilot',storageKeys:[],version:'2004',...overrides});}
if(require.main===module){const out=path.join(ROOT,'tests/repair/runtime');fs.mkdirSync(out,{recursive:true});for(const which of ['base','proposed'])fs.writeFileSync(path.join(out,'bridge-'+which+'.js'),emit(which));console.log('Emitted actual base and proposed shared bridges (isolated TypeScript type-erasure harness).');}
module.exports={emit,loadTree,ROOT};
