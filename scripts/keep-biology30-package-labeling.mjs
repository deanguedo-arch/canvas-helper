import fs from 'node:fs';
import {load} from 'cheerio';
for(const chapter of [12,13]){
 const dir=`projects/biology30-chapter-${chapter}`;
 const $=load(fs.readFileSync(`${dir}/workspace/index.html`,'utf8'));
 const data=JSON.parse($('#course-data').text());
 const removed=data.labelDiagrams.filter(d=>!d.id.startsWith(`ch${chapter}-reviewed-package-`));
 if(removed.length)fs.writeFileSync(`${dir}/meta/retired-labeling-diagrams.json`,JSON.stringify(removed,null,2)+'\n');
 data.labelDiagrams=data.labelDiagrams.filter(d=>d.id.startsWith(`ch${chapter}-reviewed-package-`));
 if(!data.labelDiagrams.length)throw Error('No package diagrams available');
 $('[data-diagram-select] option').each((_,el)=>{if(!data.labelDiagrams.some(d=>d.id===$(el).attr('value')))$(el).remove();});
 $('#course-data').text(JSON.stringify(data));fs.writeFileSync(`${dir}/workspace/index.html`,$.html());
 let js=fs.readFileSync(`${dir}/workspace/main.js`,'utf8');
 const marker='// Preserve removed-diagram attempts without displaying retired images.';
 if(!js.includes(marker)){
  js=js.replace("renderAllChecks();['flash','blanks','mc','mixed'].forEach(renderPractice);",()=>`${marker}\nif(S.practice.labeling&&!labelSpec(S.practice.labeling.diagramId)){\n change(n=>{(n.retiredLabelingRuns??=[]).push(clone(n.practice.labeling));delete n.practice.labeling;},'Older diagram attempts preserved. Choose a package diagram to continue.');\n}\nrenderAllChecks();['flash','blanks','mc','mixed'].forEach(renderPractice);`);
 }
 fs.writeFileSync(`${dir}/workspace/main.js`,js);
 console.log(`Chapter ${chapter}: removed ${removed.length} older diagrams; kept ${data.labelDiagrams.length} reviewed package diagrams.`);
}
