import type { ModelOutput } from "./pilot2-models.js";
import { type GraphWork } from "./pilot2-graph-work.js";
import { renderTopicModelPlot } from "./pilot2-model-plot.js";
import { topicHtml as h, renderTopicDataset } from "./pilot2-render-common.js";
const display=(value:string|number)=>typeof value==='number'?Number(value.toPrecision(6)):value;
function plot(output:ModelOutput,graphs:GraphWork['graphs']) {
  return graphs.map(graph=>{const svg=renderTopicModelPlot(graph,`${output.modelId}-${output.choice}-result`);return `<figure class="p2-figure"><div class="p2-graph-scroll" tabindex="0" role="region" aria-label="Model result graph; scroll on narrow screens">${svg}</div><figcaption>${h(graph.title)}</figcaption><p>${graph.kind==='line'?'Connecting lines guide comparison; they do not establish unmeasured intermediate values.':'Bar height represents the named quantity for each comparison group.'}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge result graph</button></figure>`;}).join('');
}
export function renderTopicModelOutput(output:ModelOutput) {
  let visual='';
  const bar=(id:string,title:string,x:(string|number)[],series:{id:string;label:string;expected:number[]}[],maximum:number):GraphWork['graphs'][number]=>({id:`${output.modelId}-${id}`,title,kind:'bar',x,series,xLabels:['Comparison group'],yLabels:[title],maxima:[maximum],expectedAxes:[0,0,0]});
  if(output.visual==='separate-line-panels'){
    visual=plot(output,output.columns.slice(1).map((label,index)=>{const values=output.rows.map(row=>Number(row[index+1]));return {id:`${output.modelId}-hormone-${index}`,title:label,kind:'line',x:output.rows.map(row=>Number(row[0])),series:[{id:`hormone-${index}`,label,expected:values}],xLabels:['Cycle day'],yLabels:[label],maxima:[Math.max(1,...values)*1.2],expectedAxes:[0,0,0]};}));
  }else if(output.visual==='paired-proportions')visual=plot(output,[bar('proportions','Proportion with marker M',output.rows.map(row=>String(row[0])),[{id:'proportion',label:'Marker M proportion',expected:output.rows.map(row=>Number(row[3]))}],1)]);
  else if(output.visual==='observed-expected-bars')visual=plot(output,[bar('frequencies','Genotype frequency',output.rows.map(row=>String(row[0])),[{id:'observed',label:'Observed frequency',expected:output.rows.map(row=>Number(row[2]))},{id:'expected',label:'Expected under equilibrium',expected:output.rows.map(row=>Number(row[3]))}],1)]);
  else if(output.visual==='replicate-comparison'){
    const rows=output.rows.filter(row=>typeof row[0]==='number'),values=rows.map(row=>Number(row[1]));
    visual=plot(output,[bar('replicates','Mean dry mass per focal A plant (g/A)',rows.map(row=>`Replicate ${row[0]}`),[{id:'replicate',label:'Replicate mean',expected:values}],Math.max(1,...values)*1.2)]);
  }else if(output.visual==='punnett-square'){
    const first=String(output.values.first),second=String(output.values.second);
    if(!/^[Aa]{2}$/.test(first)||!/^[Aa]{2}$/.test(second))throw new Error('Unsupported model gamete representation');
    visual=renderTopicDataset({columns:['Gamete from second parent',...first.split('').map(allele=>`First parent: ${allele} (½)`)],rows:second.split('').map(allele=>[`${allele} (½)`,...first.split('').map(other=>(other+allele).split('').sort().join(''))])},'Punnett square: each cell has probability ¼');
  }else if(output.visual==='chromosome-stages'){
    const panels=output.rows.map((row,index)=>{
      const count=Number(row[1]),molecules=Number(row[2]),replicated=molecules===2*count;
      if(!Number.isInteger(count)||count<1||count>100||(!replicated&&molecules!==count))throw new Error('Unsupported chromosome model count');
      const left=20+index*240;
      const icons=Array.from({length:count},(_v,i)=>{const x=left+30+(i%8)*23,y=110+Math.floor(i/8)*30;return `<path d="${replicated?`M${x-5} ${y-10}L${x+5} ${y+10}M${x+5} ${y-10}L${x-5} ${y+10}`:`M${x} ${y-10}V${y+10}`}" stroke="#176a65" stroke-width="3"/><circle cx="${x}" cy="${y}" r="2" fill="#233531"/>`;}).join('');
      return `<g><text x="${left+110}" y="35" text-anchor="middle" font-size="20">${h(row[0])}</text><rect x="${left}" y="60" width="220" height="430" rx="12" fill="none" stroke="#344643"/>${icons}<text x="${left+110}" y="530" text-anchor="middle" font-size="20">${count} chromosomes</text><text x="${left+110}" y="560" text-anchor="middle" font-size="20">${molecules} DNA molecules</text><text x="${left+110}" y="590" text-anchor="middle" font-size="20">${h(row[3])} chromosome sets</text></g>`;
    }).join('');
    visual=`<figure class="p2-figure"><div class="p2-graph-scroll" tabindex="0" role="region" aria-label="Chromosome counts in one cell at each stage"><svg xmlns="http://www.w3.org/2000/svg" width="980" height="620" viewBox="0 0 980 620" role="img"><title>Chromosome and DNA molecule counts per cell</title><desc>Single rods have one DNA molecule; paired rods joined at one centromere have two. The adjacent table gives every count.</desc><rect width="980" height="620" fill="white"/>${panels}</svg></div><figcaption>Counts in one cell or final product at each named stage</figcaption><p>Symbols represent chromosome counts and replication state. They do not reconstruct particular chromosome identities or allele combinations.</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge chromosome model</button></figure>`;
  }else if(output.visual==='population-balance'){
    const values=new Map(output.rows.map(row=>[String(row[0]),Number(row[1])]));
    visual=`<p class="p2-equation" aria-label="Population balance equation">${h(values.get('Initial population')!)} + ${h(values.get('Births')!)} + ${h(values.get('Immigration')!)} − ${h(values.get('Deaths')!)} − ${h(values.get('Emigration')!)} = ${h(values.get('Final population')!)} individuals</p>`;
  }else if(!['aligned-sequences','pathway-observations'].includes(output.visual))throw new Error('Unsupported model result display');
  // Evidence matrices and oriented sequence rows are themselves the appropriate
  // comparison visual; they do not imply a numeric scale or an invented pathway.
  return `<section data-pilot2-model-result-kind="${h(output.visual)}"><h3>${h(output.title)}</h3>${visual}${renderTopicDataset({columns:output.columns,rows:output.rows.map(row=>row.map(display))},'Model observations and calculated values')}<p>${h(output.explanation)}</p><p>${h(output.limitation)}</p></section>`;
}
