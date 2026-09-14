import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {load} from 'cheerio';
import {validateBiologyWordRecords,renderBiologyWordDetails} from '../lib/biology30-vocabulary/word-record.js';
import {renderBiologyWordReader} from '../lib/biology30-vocabulary/word-reader.js';

const data=JSON.parse(await readFile('projects/resources/biology20-production/v1/units/a/word-details.json','utf8'));
test('all 35 authored records have word-owned sections and resolvable categories/related words',()=>{
 validateBiologyWordRecords(data.words,data.categories);assert.equal(data.words.length,35);
 for(const word of data.words){const $=load(renderBiologyWordDetails(word,data.words));assert.equal($('h2').text(),word.term);assert.deepEqual($('h3').map((_,e)=>$(e).text()).get(),['Meaning','Word structure','What it does','Related ideas','Common confusion','Retrieve the idea']);assert.ok(word.whatItDoes!==word.definition);}
});
test('categories contain only word controls, each word has one authoritative reader entry',()=>{
 const $=load(renderBiologyWordReader(data.words,data.categories));
 assert.equal($('[data-biology-word-view]').length,35);
 assert.equal($('nav p,nav h3,nav textarea').length,0);
 for(const category of data.categories)assert.equal($('.word-category>h2').filter((_,e)=>$(e).text()===category.label).length,1);
 for(const word of data.words)assert.equal($(`[data-biology-word-view="${word.id}"]`).length,1);
});
test('cohesion describes cohesion, not its category; categories cannot fill missing fields',()=>{
 const word=data.words.find((w:any)=>w.term==='cohesion');const html=renderBiologyWordDetails(word,data.words);
 assert.match(html,/surface tension/);assert.match(html,/droplet/);assert.doesNotMatch(html,/Water properties and cycling/);
 const missing=structuredClone(data);delete missing.words[0].whatItDoes;
 assert.throws(()=>validateBiologyWordRecords(missing.words,missing.categories),/Incomplete word/);
 const competing=structuredClone(data);competing.categories[0].meaning='A category definition must not substitute for a word.';
 assert.throws(()=>validateBiologyWordRecords(competing.words,competing.categories),/organize words only/);
});
