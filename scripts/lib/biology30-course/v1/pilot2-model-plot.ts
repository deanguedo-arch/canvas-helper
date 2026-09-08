import type { GraphWork } from "./pilot2-graph-work.js";
import { topicHtml as h } from "./pilot2-render-common.js";
/** Computed model values retain full precision; learner-entry limits do not apply. */
export function renderTopicModelPlot(graph:GraphWork['graphs'][number],instance:string) {
  const left=100,right=920,top=110,bottom=430,maximum=graph.maxima[0];
  if(!Number.isFinite(maximum)||maximum<=0||!graph.x.length||graph.series.some(series=>series.expected.length!==graph.x.length||series.expected.some(value=>!Number.isFinite(value)||value<0||value>maximum)))throw new Error('Invalid model plot data or scale');
  const numeric=graph.kind==='line'&&graph.x.every(value=>typeof value==='number'),xs=graph.x as number[],xmin=numeric?Math.min(...xs):0,xmax=numeric?Math.max(...xs):0;
  const x=(index:number)=>numeric?left+(right-left)*(xmax===xmin?.5:(xs[index]-xmin)/(xmax-xmin)):left+(right-left)*(index+.5)/graph.x.length;
  const y=(value:number)=>bottom-(bottom-top)*value/maximum,n=(value:number)=>Number(value.toFixed(3));
  const grid=Array.from({length:6},(_v,index)=>{const value=maximum*index/5,py=y(value);return `<path d="M${left} ${n(py)}H${right}" stroke="#d9e1df"/><text x="${left-12}" y="${n(py+6)}" text-anchor="end" font-size="20">${h(Number(value.toPrecision(5)))}</text>`;}).join('');
  const colours=['#176a65','#815022','#3d588b'];
  const series=graph.series.map((series,s)=>{
    const colour=colours[s%colours.length],barWidth=Math.min(70,(right-left)/graph.x.length*.7/graph.series.length);
    const points=series.expected.map((value,index)=>{const px=x(index),py=y(value),title=`<title>${h(series.label)}; ${h(graph.x[index])}: ${h(value)}</title>`;
      return graph.kind==='bar'?`<rect x="${n(px+(s-(graph.series.length-1)/2)*barWidth-barWidth/2+2)}" y="${n(py)}" width="${n(barWidth-4)}" height="${n(bottom-py)}" fill="${colour}">${title}</rect>${value===0?`<circle cx="${n(px+(s-(graph.series.length-1)/2)*barWidth)}" cy="${bottom}" r="4" fill="${colour}"/>`:''}`:`<circle cx="${n(px)}" cy="${n(py)}" r="5" fill="white" stroke="${colour}" stroke-width="2">${title}</circle>`;
    }).join('');
    const line=graph.kind==='line'?`<path d="${series.expected.map((value,index)=>`${index?'L':'M'}${n(x(index))} ${n(y(value))}`).join(' ')}" fill="none" stroke="${colour}" stroke-width="2"/>`:'';
    return `<g><path d="M100 ${30+s*28}h32" stroke="${colour}" stroke-width="4"/><text x="145" y="${37+s*28}" font-size="20">${h(series.label)}</text>${line}${points}</g>`;
  }).join('');
  const id=`${graph.id}-${instance}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="560" viewBox="0 0 960 560" role="img" aria-labelledby="${h(id)}-title ${h(id)}-description"><title id="${h(id)}-title">${h(graph.title)}</title><desc id="${h(id)}-description">${h(graph.xLabels[0])}; ${h(graph.yLabels[0])}. Every full-precision value is represented; the adjacent table supplies readable values.</desc><rect width="960" height="560" fill="white"/><g fill="#233531" font-family="sans-serif">${grid}<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#344643"/>${graph.x.map((value,index)=>`<text x="${n(x(index))}" y="462" text-anchor="middle" font-size="20">${h(value)}</text>`).join('')}<text x="510" y="520" text-anchor="middle" font-size="22">${h(graph.xLabels[0])}</text><text transform="translate(30 270) rotate(-90)" text-anchor="middle" font-size="22">${h(graph.yLabels[0])}</text>${series}</g></svg>`;
}
