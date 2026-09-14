import {topicHtml as h} from '../biology30-course/v1/pilot2-render-common.js';
export type Diagram={suffix:string;title:string;kind:string;lines?:string[];labels?:string[];values?:number[];units?:string;columns?:string[];rows?:string[][];note:string};
const text=(x:number,y:number,s:string,size=24)=>`<text x="${x}" y="${y}" font-size="${size}">${h(s)}</text>`;
export function renderBiology20Diagram(d:Diagram){
 let content='';
 if(d.kind==='bars'){
  const max=Math.max(...d.values!);content=text(40,106,d.units!,22);
  d.values!.forEach((v,i)=>{const y=150+i*105;content+=text(40,y,d.labels![i],23)+`<rect x="40" y="${y+12}" width="${820*v/max}" height="32" fill="#356c47"/>`+text(880,y+38,String(v));});
 }else if(d.kind==='table'){
  d.columns!.forEach((s,i)=>content+=text(40+i*335,125,s,23));
  d.rows!.forEach((r,j)=>{content+=`<path d="M40 ${155+j*75}H1050" stroke="#a4afa6"/>`;r.forEach((s,i)=>content+=text(40+i*335,195+j*75,s,22));});
 }else d.lines!.forEach((s,i)=>{content+=text(40,140+i*65,s,23);});
 const words=d.note.split(' '),lines:string[]=[];for(const w of words){if(!lines.length||lines.at(-1)!.length+w.length>90)lines.push(w);else lines[lines.length-1]+=' '+w;}
 return `<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="590" viewBox="0 0 1100 590"><rect width="1100" height="590" fill="#fff"/><g fill="#18251b" font-family="sans-serif">${text(40,52,d.title,28)}${content}${lines.map((s,i)=>text(40,535+i*28,s,20)).join('')}</g></svg>`;
}
