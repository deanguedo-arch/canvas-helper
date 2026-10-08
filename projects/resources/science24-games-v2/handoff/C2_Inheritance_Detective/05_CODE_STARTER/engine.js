export function gametes(genotype){if(!/^[Aa]{2}$/.test(genotype))throw new Error('Use a two-allele A/a genotype');return [...new Set(genotype.split(''))]}
export function normalizeGenotype(a,b){return [a,b].sort((x,y)=>x===y?0:(x==='A'?-1:1)).join('')}
export function cross(parent1,parent2){const g1=gametes(parent1),g2=gametes(parent2);const counts={};let total=0;for(const a of g1)for(const b of g2){const z=normalizeGenotype(a,b);counts[z]=(counts[z]||0)+1;total++}return Object.fromEntries(Object.entries(counts).map(([k,v])=>[k,v/total]))}
export function phenotypeProbabilities(result){let dominant=0,recessive=0;for(const [g,p] of Object.entries(result)){if(g.includes('A'))dominant+=p;else recessive+=p}return {dominant,recessive}}
