// Review-only source clarifications. Frozen inputs remain untouched.
const c = require('cheerio');
const link = (url, label) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
module.exports = function jurisdictionCopy(html, id) {
  const $ = c.load(html, {sourceCodeLocationInfo: true}), edits = [];
  function paragraph(selector, contains, content) {
    const found = $(selector).toArray().filter(e => $(e).text().includes(contains));
    if (found.length !== 1) throw Error(`Jurisdiction paragraph: ${id} ${contains} (${found.length})`);
    const e = found[0], l = e.sourceCodeLocation;
    edits.push({start:l.startTag.endOffset, end:l.endTag.startOffset, value:content});
  }
  if (id === 'overview') paragraph('#overview p', 'All the information needed', 'All the information needed for the course activities is supplied here. People, employers, budgets and incidents in the cases are fictional. Dollar amounts are in Canadian dollars (CAD) unless a source explicitly states otherwise. Official reading records are labelled with their source and the date they were checked. You can open the original page for current information, but you do not need another account or a paid service to do the lesson.');
  const article = $('#'+id);
  if (/^(ce1|fl[1-4])-\d\d$/.test(id) && article.find('p,td,li').text().includes('$')) {
    const header = article.children('header.page-header')[0];
    if (!header) throw Error('Missing currency header '+id);
    const at = header.sourceCodeLocation.endTag.startOffset;
    edits.push({start:at,end:at,value:`<p class="mini" data-canvas-helper-edit-key="${id}-currency-note">Dollar amounts in this lesson are Canadian dollars (CAD).</p>`});
  }
  if (id === 'ce1-05') paragraph('#ce1-05-foundations >p', 'Keep a complete graduation plan', 'Keep a complete graduation plan alongside any career-preparation choices. The two case records below show only selected pathway steps; their other graduation categories and credits are accounted for separately. You will not calculate a complete diploma total from these short tables. The overview follows Alberta graduation requirements. Current LearnAlberta course records, checked October 5, 2026, confirm that INF2050: Word Processing 2 has no prerequisite and INF3060: Word Processing 3 requires INF2050. You can check '+link('https://www.alberta.ca/graduation-requirements-credentials-and-credits','Alberta graduation information')+', '+link('https://curriculum.learnalberta.ca/hs-courses/en/courses/INF2050','the provincial Word Processing 2 record')+' and '+link('https://curriculum.learnalberta.ca/hs-courses/en/courses/INF3060','the provincial Word Processing 3 record')+'. The school’s '+link('https://cbe-learn.cbe.ab.ca/fine-arts','Art course examples')+' and '+link('https://cbe-learn.cbe.ab.ca/information-processing','CTS course examples')+' show local offerings; they do not establish what every Alberta school offers. These references are optional; the facts needed for this activity are included here.');
  if (id === 'co2-02') paragraph('#co2-02 p', 'Optional disclosure: Current official sources', 'Optional disclosure: <strong>Current official sources</strong>. The dated Alberta records below are enough for the lesson. For a real worksite, the '+link('https://www.alberta.ca/refuse-dangerous-work','Alberta dangerous-work refusal guidance')+' explains the provincial threshold and process; '+link('https://www.alberta.ca/index.php/young-workers','Alberta young-worker safety guidance')+' explains employer and worker responsibilities. These links are optional. No external training, contact or login is required here.');
  if (id === 'fl3-03') {
    paragraph('#fl3-03 p', 'short record summarizes selected Canada Revenue Agency', 'The following short record summarizes selected Canada Revenue Agency (CRA) plan distinctions, read September 28, 2026. It is enough for this lesson; actual eligibility, room and withdrawal conditions must be checked before a real transaction. Optional official explanations: '+link('https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/tax-free-savings-account/what.html','TFSA')+', '+link('https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4040/rrsps-other-registered-plans-retirement.html','RRSP')+', '+link('https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/first-home-savings-account.html','FHSA')+' and '+link('https://www.canada.ca/en/services/benefits/education/education-savings/managing-plan.html','RESP payments')+'.');
    paragraph('#fl3-03 p', 'Crypto assets are digital assets', '<strong>Crypto assets</strong> are digital assets with potentially substantial price, platform and access risks. A token’s popularity or a platform’s registration does not guarantee its value. The Alberta Securities Commission (ASC) is Alberta’s securities regulator. Its '+link('https://www.checkfirst.ca/','CheckFirst investor education')+' explains investment risks and registration checks. No crypto purchase is required here, and no advertised return is treated as evidence of suitability.');
  }
  if (id === 'fl4-02') paragraph('#fl4-02 p', 'For an investment, the source recommends', 'For an investment, the source recommends independent research and registration checks. In Alberta, the provincial securities regulator is the '+link('https://www.asc.ca/','Alberta Securities Commission (ASC)')+'. Its '+link('https://www.checkfirst.ca/','CheckFirst resource')+' helps Albertans learn how to check an investment and the person or firm offering it. Registration is one check, not a guarantee of returns or proof that a message’s sender is the registered person. These references are optional; this course does not ask you to evaluate or buy a real investment.');
  if (id === 'fl4-04') {
    const row = $('#fl4-04 tr').toArray().find(e=>$(e).children('td').first().text()==='Sales tax');
    if (!row) throw Error('Missing FL4-04 tax row');
    const cells = $(row).children('td').toArray();
    for (const [e,value] of [[cells[0],'GST (5%)'],[cells[2],'Goods and Services Tax: $150 × 0.05 = $7.50 for this taxable Alberta purchase.']]) {
      const l=e.sourceCodeLocation; edits.push({start:l.startTag.endOffset,end:l.endTag.startOffset,value});
    }
    const at=row.parent.parent.sourceCodeLocation.endOffset;
    if (row.parent.parent.name !== 'table') throw Error('Unexpected tax table structure');
    edits.push({start:at,end:at,value:'\n<p data-canvas-helper-edit-key="fl4-04-alberta-gst-note">GST means Goods and Services Tax. For this taxable purchase in Alberta, 5% of the $150 subtotal is $7.50, giving the supplied $157.50 total. Alberta has no provincial sales tax (PST). This does not mean every purchase has GST: some supplies are exempt or taxed at 0%. The '+link('https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-place-supply.html','CRA sales-tax guidance')+' is an optional reference. Keep the government tax separate from the store’s mandatory fees when comparing prices.</p>\n'});
  }
  edits.sort((a,b)=>b.start-a.start); for(const e of edits)html=html.slice(0,e.start)+e.value+html.slice(e.end);
  return html;
};
