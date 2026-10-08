export function gametes(genotype){if(!/^[Aa]{2}$/.test(genotype))throw new Error('Use a two-allele A/a genotype.');return [...genotype];}
export function normalizeGenotype(a,b){if(!/^[Aa]$/.test(a)||!/^[Aa]$/.test(b))throw new Error('Unknown allele.');return [a,b].sort((x,y)=>x===y?0:x==='A'?-1:1).join('');}
export function cross(p1,p2){const g1=gametes(p1),g2=gametes(p2),counts={AA:0,Aa:0,aa:0};for(const a of g1)for(const b of g2)counts[normalizeGenotype(a,b)]+=0.25;return counts;}
export function phenotypeProbabilities(result){return{dominant:(result.AA||0)+(result.Aa||0),recessive:result.aa||0};}
export function possibleParentSets({parent1,parent2,child=null}){const allowed=x=>x==='dominant'?['AA','Aa']:x==='unknown'?['AA','Aa','aa']:[x];return allowed(parent1).flatMap(a=>allowed(parent2).filter(b=>!child||cross(a,b)[child]>0).map(b=>[a,b]));}
function percent(v){if(v==null)throw new Error('Complete every probability.');const str=String(v).trim();if(!str)throw new Error('Complete every probability.');let n;if(/^\d+\s*\/\s*\d+$/.test(str)){const[a,b]=str.split('/').map(Number);if(!b)throw new Error('Probability denominator must be positive.');n=a/b*100;}else{const numeric=str.replace(/%$/,'').trim();if(!numeric)throw new Error('Complete every probability.');n=Number(numeric);}if(!Number.isFinite(n)||n<0||n>100)throw new Error('Enter a probability from 0 to 100%, or a valid fraction.');return n;}
export function validate(s,a){try{
 if(s.kind==='constraint'){if(a.parent1!=='Aa'||a.parent2!=='Aa')return{valid:false,message:'The aa child needs an a allele from each dominant-phenotype parent. Eliminate genotypes that cannot supply it.'};return{valid:true,message:'Both parents are constrained to Aa under the stated model.'};}
 if(s.kind==='uncertainty'){
   const pairs=[[a.possible1,a.probability1],[a.possible2,a.probability2]];
   if(new Set(pairs.map(x=>x[0])).size!==2||!pairs.every(([g])=>['AA','Aa'].includes(g)))return{valid:false,message:'List both AA and Aa for the unknown dominant parent; the supplied evidence does not select one.'};
   if(!pairs.every(([g,p])=>Math.abs(percent(p)-cross('aa',g).aa*100)<1e-6))return{valid:false,message:'Calculate the recessive probability separately for each possible parental cross.'};
   if(a.uncertainty!=='underdetermined')return{valid:false,message:'A single probability is not justified until the dominant parent genotype is known.'};
   return{valid:true,message:'Both compatible crosses and their probabilities are retained: 0% or 50% recessive phenotype, depending on the unknown genotype.'};
 }
 const expected=cross(...s.parents);
 if(s.kind==='cross'&&s.stage!=='worked'){
   const g1=gametes(s.parents[0]),g2=gametes(s.parents[1]);
   for(let r=0;r<2;r++)for(let c=0;c<2;c++)if(a['cell'+(r*2+c)]!==normalizeGenotype(g1[r],g2[c]))return{valid:false,message:'Combine exactly one allele from the row parent and one from the column parent in each cell.'};
 }
 if(['AA','Aa','aa'].some(g=>Math.abs(percent(a['p_'+g])-expected[g]*100)>1e-6))return{valid:false,message:'Count the equally likely square cells. Distinguish genotype probability from a guaranteed family count.'};
 if(s.kind==='independent'&&a.outcome!=='independent')return{valid:false,message:'Prior offspring do not make another outcome due. The same probabilities apply to each pregnancy in this simplified model.'};
 return{valid:true,message:'Your genotype probabilities agree with the stated fictional cross; no outcome is guaranteed.'};
}catch(e){return{valid:false,message:e.message};}}
