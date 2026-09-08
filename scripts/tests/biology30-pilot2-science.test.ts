import test from "node:test";
import assert from "node:assert/strict";
import { alleleFrequencies, equilibriumFromRecessive, demographicChange, quadratEstimate, discreteGrowth, recombinationFrequency, stageCounts, monohybridCross, complementDNA, transcribeDNA, translateRNA } from "../lib/biology30-course/v1/pilot2-science.js";
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
test("observed allele counts and conditional equilibrium predictions stay distinct", () => {
  const result = alleleFrequencies(36, 48, 16); near(result.p, .6); near(result.q, .4); assert.equal(result.alleleCopies, 200);
  const observed = alleleFrequencies(44, 38, 18); near(observed.p, .63); assert.notDeepEqual(observed.observed, observed.expectedUnderEquilibrium);
  const recessive = equilibriumFromRecessive(.09); near(recessive.q, .3); near(recessive.Aa, .42);
  near(equilibriumFromRecessive(1/3).Aa * 36, 17.569219381653);
  for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) { if (!a && !b) continue; const r = alleleFrequencies(a, b, 0); near(r.p+r.q, 1); near(r.expectedUnderEquilibrium.reduce((x,y)=>x+y,0), 1); }
  for (const args of [[0,0,0],[-1,2,3],[1.5,2,3],[NaN,2,3]]) assert.throws(()=>alleleFrequencies(...args as [number,number,number]));
  assert.throws(()=>equilibriumFromRecessive(1.01));
});
test("population calculations retain area, interval and initial-population denominators", () => {
  const q = quadratEstimate([2,8,4,10,6],1,200); near(q.density,6); near(q.estimatedIndividuals,1200);
  assert.deepEqual(demographicChange(1000,120,30,70,20,10), { change:60,final:1060,absolutePerTime:6,perInitialIndividualOverInterval:.06,averagePerInitialIndividualPerTime:.006 });
  near(discreteGrowth(812,.3,2),1372.28); near(discreteGrowth(100,.1,2),121);
  assert.throws(()=>demographicChange(2,0,0,3,0,1)); assert.throws(()=>demographicChange(2,0,0,0,0,0)); assert.throws(()=>quadratEstimate([2],1,0)); assert.throws(()=>discreteGrowth(1,-1.1,2));
});
test("chromosome stages and Mendelian crosses preserve counts and conditional probabilities", () => {
  assert.deepEqual(stageCounts(6,"after-S"),{chromosomes:6,chromatids:12,sets:2}); assert.deepEqual(stageCounts(6,"after-meiosis-I"),{chromosomes:3,chromatids:6,sets:1}); assert.deepEqual(stageCounts(46,"after-meiosis-II"),{chromosomes:23,chromatids:23,sets:1});
  const cross=monohybridCross("Aa","Aa"); assert.deepEqual(cross,{AA:.25,Aa:.5,aa:.25}); near(cross.Aa/(cross.AA+cross.Aa),2/3); near(cross.aa*cross.aa,1/16); near((cross.AA+cross.Aa)*cross.aa,3/16);
  assert.deepEqual(monohybridCross("aA","aa"),{AA:0,Aa:.5,aa:.5}); assert.throws(()=>stageCounts(3,"G1")); assert.throws(()=>monohybridCross("AB","aa"));
  near(recombinationFrequency(20,100).observedPercent,20); assert.equal(recombinationFrequency(52,100).shortDistanceEstimate,null); assert.throws(()=>recombinationFrequency(2,1));
});
test("strand direction, code and termination independently reproduce sequence keys", () => {
  assert.equal(complementDNA("ATGC"),"TACG"); assert.equal(complementDNA("ATGC",true),"GCAT");
  assert.equal(transcribeDNA("ATGGAATTTTAA","coding-5-to-3"),"AUGGAAUUUUAA");
  assert.equal(transcribeDNA("TACCTTAAAATT","template-3-to-5"),"AUGGAAUUUUAA");
  assert.equal(transcribeDNA("TTAAAATTCCAT","template-5-to-3"),"AUGGAAUUUUAA");
  assert.deepEqual(translateRNA("AUGGAAUUUUAA").peptide,["Met","Glu","Phe"]);
  assert.deepEqual(translateRNA("AUGGAGUUUUAA").peptide,["Met","Glu","Phe"]);
  assert.deepEqual(translateRNA("AUGAGAAUUUUAA").peptide,["Met","Arg","Ile","Leu"]);
  assert.equal(translateRNA("AUGAGAAUUUUAA").trailingBases,"A");
  assert.deepEqual(translateRNA("UACACAUGCAUC").peptide,["Tyr","Thr","Cys","Ile"]); assert.equal(translateRNA("UACACAUGCAUC").startsWithAUG,false);
  assert.deepEqual(translateRNA("UAAAUG").peptide,[]); assert.equal(translateRNA("UAAAUG").stopIndex,0);
  for(const seq of ["ATGC","TTCGAATCGA","ATGGAATTTTAA"]) assert.equal(complementDNA(complementDNA(seq,true),true),seq);
  assert.throws(()=>transcribeDNA("ACGU","coding-5-to-3")); assert.throws(()=>translateRNA("ACTG"));
});
