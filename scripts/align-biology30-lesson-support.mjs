// Idempotent presentation repair; word IDs, saved responses and video data stay unchanged.
import fs from 'node:fs';
import {load} from 'cheerio';
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
for (const chapter of [12,13]) {
 const path=`projects/biology30-chapter-${chapter}/workspace/index.html`;
 const $=load(fs.readFileSync(path,'utf8'));
 const data=JSON.parse($('#course-data').text());
 $('section[id^="lesson-"]').each((_,el)=>{
  const lesson=$(el), id=lesson.attr('id'), number=Number(id.split('-')[1]);
  const help=lesson.find('details.vocab-help').first();
  help.addClass('lesson-vocabulary-help');
  if(help.length && !help.find('.lesson-words').length){
   const rows=help.find('dl > div').toArray();
   for(const row of rows){
    const dt=$(row).find('dt'), term=dt.text().trim();
    const word=data.words.find(w=>w.lesson===number && w.term.toLowerCase()===term.toLowerCase()) || data.words.find(w=>w.term.toLowerCase()===term.toLowerCase());
    if(word)dt.html(`<button type="button" class="bio-term" data-term-id="${escape(word.id)}" aria-haspopup="dialog">${escape(term)}</button>`);
   }
   help.empty().append('<summary>Vocabulary help</summary>');
   const primary=$(`<section class="lesson-words" aria-labelledby="${id}-anchor-words"><p class="section-label">Key terms</p><h2 id="${id}-anchor-words">Words for this lesson</h2><p>Use these definitions when you need help with a term.</p><dl></dl></section>`);
   rows.slice(0,4).forEach(row=>primary.find('dl').append(row));
   help.append(primary);
   if(rows.length>4){
    const more=$('<details class="lesson-term-inventory"><summary>More vocabulary for this lesson</summary><div><h3>Lesson vocabulary</h3><dl></dl></div></details>');
    rows.slice(4).forEach(row=>more.find('dl').append(row));help.append(more);
   }
  }
  for(const video of data.videos.filter(v=>v.lesson===number)){
   if(lesson.find('[data-video-stage]').toArray().some(e=>$(e).attr('data-video-stage')===video.id))continue;
   const card=$(`<aside class="video-companion"><div class="video-copy"><p class="eyebrow">Optional video support</p><h3>${escape(video.title)}</h3><p><strong>As you watch:</strong> ${escape(video.purpose)}</p><p class="resource-note">Internet connection required.</p><a href="https://www.youtube.com/watch?v=${escape(video.id)}" target="_blank" rel="noopener">Open on YouTube</a></div><div class="video-visual"><div class="video-stage" data-video-stage="${escape(video.id)}"><button type="button" data-play-video="${escape(video.id)}">Load video</button></div><div class="concept-summary"><h4>Written alternative</h4><p>${escape(video.fallback)}</p></div></div></aside>`);
   const previous=lesson.find('.video-companion').last();
   if(previous.length)previous.after(card);else lesson.find('.activity-disclosure').first().before(card);
  }
 });
 fs.writeFileSync(path,$.html());
 console.log(`Chapter ${chapter}: vocabulary disclosure repaired; ${data.videos.length} lesson videos retained.`);
}
