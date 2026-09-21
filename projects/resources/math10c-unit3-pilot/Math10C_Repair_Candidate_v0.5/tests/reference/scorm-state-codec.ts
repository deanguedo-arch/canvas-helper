/** Bounded lossless UTF-8 codec; compatible with the imported Chemistry save format. */
export function buildScormStateCodecRuntime() {
  return String.raw`const stateCodec = (function () {
const LIMIT=1000000,PREFIX='CH10LZ1|';
function hash(bytes){let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return (h>>>0).toString(16);}
function encode(s){const a=new TextEncoder().encode(s);if(a.length>LIMIT)throw Error('The work record exceeds the supported one-megabyte state limit.');const output=[],seen=new Map();let pos=0;
 function add(i){if(i+2>=a.length)return;const k=(a[i]<<16)|(a[i+1]<<8)|a[i+2];let list=seen.get(k);if(!list){list=[];seen.set(k,list);}list.push(i);if(list.length>28)list.shift();}
 while(pos<a.length){const flagAt=output.length;output.push(0);let flags=0;for(let bit=0;bit<8&&pos<a.length;bit++){
  let length=0,offset=0;const key=pos+2<a.length?(a[pos]<<16)|(a[pos+1]<<8)|a[pos+2]:-1,possible=seen.get(key)||[];
  for(let c=possible.length-1;c>=0;c--){const candidate=possible[c],distance=pos-candidate;if(distance>4095)break;let n=0;while(n<18&&pos+n<a.length&&a[candidate+n]===a[pos+n])n++;if(n>=3&&n>length){length=n;offset=distance;if(n===18)break;}}
  if(length>=3){flags|=1<<bit;const token=(offset<<4)|(length-3);output.push(token>>8,token&255);for(let j=0;j<length;j++)add(pos+j);pos+=length;}else{output.push(a[pos]);add(pos);pos++;}
 }output[flagAt]=flags;}
 let bin='';for(let i=0;i<output.length;i+=8192)bin+=String.fromCharCode(...output.slice(i,i+8192));const packed=PREFIX+a.length+'|'+hash(a)+'|'+btoa(bin);return packed.length<a.length?packed:s;
}
function decode(s){if(!s.startsWith(PREFIX))return s;const parts=s.split('|');if(parts.length!==4||!/^\d+$/.test(parts[1])||! /^[0-9a-f]+$/.test(parts[2]))throw Error('Invalid saved-state header.');const expected=Number(parts[1]);if(expected>LIMIT)throw Error('Saved state exceeds the decode limit.');const input=Uint8Array.from(atob(parts[3]),c=>c.charCodeAt(0)),out=new Uint8Array(expected);let p=0,q=0;
 while(p<input.length&&q<expected){const flags=input[p++];for(let bit=0;bit<8&&p<input.length&&q<expected;bit++){
  if(flags&(1<<bit)){if(p+1>=input.length)throw Error('Truncated saved state.');const token=(input[p++]<<8)|input[p++],offset=token>>4,length=(token&15)+3;if(!offset||offset>q||q+length>expected)throw Error('Invalid saved-state reference.');for(let j=0;j<length;j++){out[q]=out[q-offset];q++;}}
  else out[q++]=input[p++];
 }}if(q!==expected||p!==input.length||hash(out)!==parts[2])throw Error('Saved-state integrity check failed.');return new TextDecoder('utf-8',{fatal:true}).decode(out);
}
return {encode, decode};
})();`;
}
