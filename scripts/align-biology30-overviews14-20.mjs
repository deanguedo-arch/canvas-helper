/** Mechanical overview-template adaptation; all other canonical bytes retained. */
import {readFile,writeFile} from 'node:fs/promises';
import {load} from 'cheerio';
const reference=load(await readFile('projects/biology30-chapter-12/workspace/index.html','utf8'));
const descriptions={
14:['How reproductive systems work','Reproductive organs produce gametes and provide pathways for fertilization. Hormones coordinate sperm production, egg development and changes in the uterus. Follow each structure and signal to explain how these processes work together.'],
15:['How human development works','Fertilization brings together the genetic information in sperm and egg. Cell division, differentiation and hormone signals support development from an early embryo through birth. Trace how structures and signals support each stage.'],
16:['How cells reproduce','DNA is copied before a cell divides. Mitosis maintains chromosome number, while meiosis produces haploid cells and creates genetic variation. Follow the chromosomes through each process and explain the resulting cells.'],
17:['How traits are inherited','Alleles pass from parents to offspring through gametes. Use inheritance patterns, probability and pedigrees to explain how different allele combinations can produce different traits.'],
18:['How genetic information works','DNA stores genetic information. Cells copy DNA and use its instructions to make RNA and proteins. Follow the information through these processes and explain how a change in DNA can affect a protein.'],
19:['How populations change genetically','A population contains a shared pool of alleles. Track allele frequencies and explain how selection, genetic drift, gene flow and mutation can change a population over generations.'],
20:['How populations grow and interact','Births, deaths and movement change population size. Resources and interactions with other organisms influence growth and distribution. Use population data to explain these changes and the limits of a model.']};
for(let ch=14;ch<=20;ch++){
 const base=`projects/biology30-chapter-${ch}`,file=`${base}/workspace/index.html`,src=await readFile(file,'utf8'),$=load(src);
 const old=$('#overview'),title=old.find('h1').first().text(),outcomes=old.find('.chapter-outcomes').first().html();
 const C=JSON.parse($('#course-data').text()),count=C.checks.length;
 const template=load(reference('#overview').toString(),null,false),ov=template('#overview');
 ov.find('.overview-hero .eyebrow').text(`Biology 30 · Chapter ${ch}`);
 ov.find('.overview-hero h1').text(title);
 ov.find('.overview-hero .lead').text(descriptions[ch][1]);
 ov.find('.hero-meta').html(`<span>${count-1} teaching topics</span><span>1 integrated review</span><span>${count} required checks</span>`);
 const chapter=ov.find('.chapter-overview');chapter.find('h2').text(descriptions[ch][0]);chapter.find('p').first().text(descriptions[ch][1]);
 chapter.find('.chapter-outcomes').html(outcomes);
 chapter.find('.chapter-outcomes li').each((i,e)=>{const text=template(e).text();if(!/^I can\b/.test(text))template(e).text('I can '+text[0].toLowerCase()+text.slice(1));});
 ov.find('.roadmap').empty();
 C.lessons.forEach((lesson,i)=>{const route=`lesson-${String(i+1).padStart(2,'0')}`,card=reference('#overview .roadmap-card').first().clone();card.attr('href','#'+route);card.find('.chapter-count').text(`TOPIC ${String(i+1).padStart(2,'0')}`);card.find('h3').text(lesson.title);card.find('p').text($(`#${route} .lesson-question`).first().text());card.find('[data-lesson-completion]').attr('data-lesson-completion',route);ov.find('.roadmap').append(card.toString());});
 if(ch===14)ov.find('.overview-callout').before('<p><strong>Clinical examples explain biology, not personal diagnosis or treatment.</strong> Use a qualified health professional for individual health questions.</p>');
 const start=src.indexOf(old.toString());
 // The delivered HTML is serialized by the same parser. Refuse a lossy whole-file rewrite.
 if(start<0)throw Error(`Chapter ${ch}: overview bytes not located exactly`);
 const replacement=ov.toString(),next=src.slice(0,start)+replacement+src.slice(start+old.toString().length);
 await writeFile(file,next);
 if(ch===14){const t=`${base}/meta/external-generation/authoring/templates/overview-current.html`;await writeFile(t,replacement+'\n');const mfile=`${base}/meta/project.json`,m=JSON.parse(await readFile(mfile,'utf8'));if(!m.canonicalSources.includes(t))m.canonicalSources.push(t);await writeFile(mfile,JSON.stringify(m,null,2)+'\n');}
 console.log(`Chapter ${ch}: reference overview blocks; ${count} route cards; other canonical bytes unchanged`);
}
