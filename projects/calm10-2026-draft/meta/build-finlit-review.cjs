/* Review-only rendering: the two fragment HTML files own visible prototype copy. */
const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('../../../node_modules/cheerio');

const workspace = path.resolve(__dirname, '../workspace');
const shell = fs.readFileSync(path.join(workspace, 'co1-01-review.html'), 'utf8');
for (const [slug, title] of [
  ['ce1-03', 'Compare routes into a career'],
  ['fl3-04', 'Check what your money will buy'],
]) {
  const $ = cheerio.load(shell, { decodeEntities: false });
  $('title').text(`${title} — FINLIT review`);
  $('link[href="./co1-01-review.css"]').attr('href', './finlit-review.css');
  $('.review-bar-link').attr('href', `./finlit-integration-comparison.html#${slug}`)
    .text('FINLIT review · Compare current and proposed');
  $('#review-main').html(fs.readFileSync(path.join(workspace, `${slug}-finlit-review.fragment.html`), 'utf8'));
  const co1ReviewLink = $('#course-sidebar a[href="#co1-01-review"]');
  co1ReviewLink.attr('href', './index.html#co1-01').find('.review-complete-mark').remove();
  $('#course-sidebar .nav-link').removeClass('active').removeAttr('aria-current')
    .removeAttr('data-review-active-link').removeAttr('data-review-name');
  const link = $(`#course-sidebar a[href="./index.html#${slug}"]`).first();
  if (!link.length) throw new Error(`No course navigation link for ${slug}`);
  link.attr('href', `./${slug}-finlit-review.html`).attr('aria-current', 'page')
    .attr('data-review-active-link', '').attr('data-review-name', link.text().trim())
    .addClass('active').prepend('<span class="review-complete-mark" hidden aria-hidden="true">✓</span>');
  $('#course-sidebar .nav-group').removeAttr('open');
  link.closest('.nav-group').attr('open', '');
  $('body > script').attr('src', './finlit-review.js');
  $('body').attr('data-review-copy', slug);
  $('head').append('<!-- Generated review page: edit the matching .fragment.html and run meta/build-finlit-review.cjs. -->');
  fs.writeFileSync(path.join(workspace, `${slug}-finlit-review.html`), $.html());
  console.log(`${slug}-finlit-review.html`);
}
