/* Portable builds keep each binary once. Canonical workspace builds use local paths. */
(function(){
 'use strict';
 const assets=window.S24_EMBEDDED;if(!assets)return;
 const urls=new Map();
 function url(path){if(!assets[path])return path;if(urls.has(path))return urls.get(path);const record=assets[path],binary=atob(record.data),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);const resolved=URL.createObjectURL(new Blob([bytes],{type:record.mime}));urls.set(path,resolved);return resolved;}
 function resolve(value){if(typeof value==='string')return url(value);if(Array.isArray(value))return value.map(resolve);if(value&&typeof value==='object'){for(const key of Object.keys(value))value[key]=resolve(value[key]);}return value;}
 resolve(window.S24_DATA);
 document.querySelectorAll('[src],[href]').forEach(el=>{for(const attr of ['src','href'])if(el.hasAttribute(attr)&&assets[el.getAttribute(attr)])el.setAttribute(attr,url(el.getAttribute(attr)));});
 window.S24Assets={url};
})();
