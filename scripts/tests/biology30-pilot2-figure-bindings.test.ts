import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {readTopicFigureBindings} from '../lib/biology30-course/v1/pilot2-figure-bindings.js';
const root=process.cwd(),read=async(unit:string,name:string)=>JSON.parse(await readFile(path.join(root,`projects/resources/biology30-production/v1/units/unit-${unit}/${name}.json`),'utf8'));
test('all127 figure targets stay explicit and provisional figure selections retain exact bytes',async()=>{
 let targets=0,ready=0;for(const unit of ['b','c','d']){const contract=await read(unit,'pilot2-contract'),manifest=await read(unit,'pilot2-figures'),result=await readTopicFigureBindings(root,contract,manifest);targets+=manifest.targets.length;ready+=result.figures.length;assert.equal(result.teacherDecision,null);assert.equal((await readTopicFigureBindings(root,contract,manifest,true)).figures.length,manifest.targets.length);await assert.rejects(()=>readTopicFigureBindings(root,contract,{...manifest,status:"draft"},true),/incomplete/);}
 assert.equal(targets,127);assert.equal(ready,127);
});
test('figure binding rejects changed pixels, wrong dimensions and missing required targets',async()=>{
 const contract=await read('b','pilot2-contract'),manifest=await read('b','pilot2-figures');let changed=structuredClone(manifest);changed.assets[0].sha256='0'.repeat(64);await assert.rejects(()=>readTopicFigureBindings(root,contract,changed),/source bytes changed/);
 changed=structuredClone(manifest);changed.assets[0].width++;await assert.rejects(()=>readTopicFigureBindings(root,contract,changed),/dimensions changed/);
 changed=structuredClone(manifest);changed.targets.pop();await assert.rejects(()=>readTopicFigureBindings(root,contract,changed),/inventory drift/);
 changed=structuredClone(manifest);changed.assets[0].sourcePath='../outside.png';await assert.rejects(()=>readTopicFigureBindings(root,contract,changed),/outside/);
});
test('required microscopy group preserves all five original labels and verifies every panel',async()=>{
 const contract=await read('c','pilot2-contract'),manifest=await read('c','pilot2-figures'),result=await readTopicFigureBindings(root,contract,manifest),figure=result.figures.find(item=>item.id==='c-topic-mitosis-observation-and-simulation-figure')!;
 assert.equal(figure.panels?.length,5);assert.deepEqual(figure.panels!.map(panel=>panel.src),['a','b','c','d','e'].map(letter=>`assets/figures/c-mhr-cell-${letter}.jpg`));assert.ok(figure.panels!.every(panel=>panel.width<=255&&panel.height<=203));assert.match(figure.comparisonGuide!,/uncertain|not clearly/);
 let changed=structuredClone(manifest);changed.assets[4].sha256='0'.repeat(64);await assert.rejects(()=>readTopicFigureBindings(root,contract,changed),/source bytes changed/);
 changed=structuredClone(manifest);changed.targets.find((target:{panelAssetIds?:string[]})=>target.panelAssetIds).panelAssetIds[4]='missing-original';await assert.rejects(()=>readTopicFigureBindings(root,contract,changed),/Unknown figure panel/);
});
