import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { renderTopicModelOutput } from "../lib/biology30-course/v1/pilot2-render-model-output.js";
import { renderTopicModelPlot } from "../lib/biology30-course/v1/pilot2-model-plot.js";
import type { ModelOutput } from "../lib/biology30-course/v1/pilot2-models.js";

test('all27 authored model-case displays preserve observations and bounded interpretation',async()=>{
 let count=0;
 for(const unit of ['b','c','d']){
  const data=JSON.parse(await readFile(`projects/resources/biology30-production/v1/units/unit-${unit}/pilot2-model-outputs.json`,'utf8')) as {outputs:ModelOutput[]};
  for(const output of data.outputs){const original=JSON.stringify(output),html=renderTopicModelOutput(output),$=load(html);assert.ok($('body').text().includes(output.explanation));assert.ok($('body').text().includes(output.limitation));assert.equal(JSON.stringify(output),original);assert.equal($('table').last().find('tbody tr').length,output.rows.length);assert.equal($('script').length,0);count++;}
 }
 assert.equal(count,27);
});
test('model plots retain full-precision expected frequencies without weakening learner entry rules',()=>{
 const svg=renderTopicModelPlot({id:'frequency',title:'Expected frequency',kind:'bar',x:['AA'],series:[{id:'expected',label:'Expected',expected:[0.265225]}],xLabels:['Genotype'],yLabels:['Frequency'],maxima:[1],expectedAxes:[0,0,0]},'fixture');
 assert.ok(svg.includes('0.265225'));assert.ok(svg.includes('height="84.872"')); // .265225 ×320 plot pixels
 const $=load(renderTopicModelOutput({modelId:'fixture',modelVersion:1,choice:'Aa-aa',title:'Aa × aa',columns:['Genotype','Probability'],rows:[['AA',0],['Aa',.5],['aa',.5]],explanation:'Equal segregation.',limitation:'One-locus model.',visual:'punnett-square',values:{first:'Aa',second:'aa'}}));
 assert.deepEqual($('table').first().find('tbody td').map((_i,node)=>$(node).text()).get(),['Aa','aa','Aa','aa']);
});
