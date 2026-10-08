// Approved FINLIT lesson interactions. Course.js alone owns learner saving/history/completion.
(() => {
  'use strict';
  function showFeedback(id, message, good) {
    const output = document.getElementById(id);
    if (!output) return;
    output.textContent = message;
    output.classList.toggle('good', Boolean(good));
    output.hidden = false;
  }
  function clearFeedback(id) { const output=document.getElementById(id); if(output)output.hidden=true; }
  document.querySelectorAll('[data-review-choice]').forEach(group => {
    const output = group.querySelector('[data-review-feedback]');
    const messages = JSON.parse(group.querySelector('[data-review-messages]').content.textContent);
    const correct = Number(group.dataset.correct);
    const render = () => {
      const checked = group.querySelector('input[type="radio"]:checked');
      if (!checked) { output.hidden = true; return; }
      const index = Number(checked.value);
      output.textContent = messages[index];
      output.classList.toggle('good', index === correct);
      output.hidden = false;
    };
    group.querySelectorAll('input[type="radio"]').forEach(radio => {radio.addEventListener('change', render);radio.addEventListener('finlit:restore', render);});
    render();
  });


  for (const lesson of ['ce1-03','fl3-04']) {
    let ranModel = false;
  if (lesson === 'ce1-03') {
    const travel = document.getElementById('ce-b-travel');
    const total = document.getElementById('ce-b-total');
    document.querySelector('[data-review-check="ce-cost"]').addEventListener('click', () => {
      const t = Number(travel.value), c = Number(total.value);
      if (!travel.value || !total.value) return showFeedback('ce-cost-feedback', 'Enter both the ten-month travel cost and full listed total, then check again.', false);
      if (t === 800 && c === 2650) return showFeedback('ce-cost-feedback', 'Correct. $80 × 10 = $800 travel; $1,600 + $250 + $800 = $2,650. That is $1,250 above Leah’s $1,400 limit.', true);
      if (t === 80 || c === 1930) return showFeedback('ce-cost-feedback', 'You counted only one month of travel. Route B lasts ten months: $80 × 10, then add the two one-time charges.', false);
      if (t !== 800) return showFeedback('ce-cost-feedback', 'Recheck the repeated line: $80 each month for ten months. Enter the travel subtotal first.', false);
      return showFeedback('ce-cost-feedback', 'The travel subtotal is right. Rebuild the full line: $1,600 tuition/fees + $250 supplies + $800 travel.', false);
    });
    [travel, total].forEach(control => control.addEventListener('input', () => clearFeedback('ce-cost-feedback')));
  }

  if (lesson === 'fl3-04') {
    const run = document.getElementById('fl-run-compounding');
    const results = document.getElementById('fl-compounding-results');
    results.hidden = true;
    run.addEventListener('click', () => { ranModel = true; results.hidden = false; results.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
    const extra = document.getElementById('fl-compounding-extra');
    const reason = document.getElementById('fl-compounding-reason');
    const limit = document.getElementById('fl-compounding-limit');
    document.getElementById('fl-check-compounding').addEventListener('click', () => {
      if (!ranModel) return showFeedback('fl-compounding-feedback', 'Run the $40 and $60 model comparisons first so you can separate deposits from modelled growth.', false);
      if (!extra.value || !reason.value || !limit.value.trim()) return showFeedback('fl-compounding-feedback', 'Enter the extra deposits, choose why the balance difference is larger, and name one reason the future balance is uncertain.', false);
      if (Number(extra.value) !== 9600) return showFeedback('fl-compounding-feedback', 'Calculate only the added deposits first: $20 more each month × 12 months × 40 years = $9,600. Then compare modelled growth.', false);
      if (reason.value !== 'interest') return showFeedback('fl-compounding-feedback', 'The extra $20 is deposited many times and can also earn modelled growth. The 5% rate is an assumption, not a guarantee.', false);
      return showFeedback('fl-compounding-feedback', 'Yes. $9,600 extra is deposited; the modelled balance difference is about $29,650.49 because the extra deposits also grow. Your final note should consider future prices, fees, taxes or uncertain returns.', true);
    });
    [extra, reason, limit].forEach(control => control.addEventListener(control.tagName === 'TEXTAREA' || control.tagName === 'INPUT' ? 'input' : 'change', () => clearFeedback('fl-compounding-feedback')));
    const fee = document.getElementById('fl-fee-difference');
    const claim = document.getElementById('fl-fee-claim');
    const explain = document.getElementById('fl-fee-explain');
    document.getElementById('fl-check-fee').addEventListener('click', () => {
      if (!fee.value || !claim.value || !explain.value.trim()) return showFeedback('fl-fee-feedback', 'Enter the displayed difference, choose a supported claim, and explain why this model is conditional.', false);
      if (Math.abs(Number(fee.value) - 1.04) > 0.005) return showFeedback('fl-fee-feedback', 'Subtract the two displayed nominal balances: $104.00 − $102.96 = $1.04. The fee is applied monthly in this model.', false);
      if (claim.value !== 'supported') return showFeedback('fl-fee-feedback', 'Only the comparison between these two otherwise identical model runs is supported. The fee is not exactly a one-time $1 charge, and the return is not guaranteed.', false);
      return showFeedback('fl-fee-feedback', 'Correct. The fee run finishes $1.04 lower in this model. Check that your explanation calls 4% a chosen assumption rather than a promise.', true);
    });
    [fee, claim, explain].forEach(control => control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', () => clearFeedback('fl-fee-feedback')));
  }


  }
  const difference=document.getElementById('borrow-cost-difference');
  document.querySelector('[data-finlit-number="borrow-cost-difference"]')?.addEventListener('click',()=>{
    const good=difference.value!==''&&Math.abs(Number(difference.value)-36.08)<0.005;
    showFeedback('borrow-cost-feedback',good?'Yes. $42.00 − $5.92 = $36.08 more for the payday example over the same 14 days. This does not establish eligibility for either product.':'Use the two costs, not the principal: $42.00 − $5.92. Keep the comparison to the same $300 and 14 days.',good);
  });
  difference?.addEventListener('input',()=>clearFeedback('borrow-cost-feedback'));
  // Keep the prototype arithmetic checks. Writing is self-reviewed, never automatically graded.
  const expected={'ce-final-c':1410,'ce-final-d':2700,'fl-final-price':252,'fl-final-gap':4};
  function validateFinals(){
    Object.entries(expected).forEach(([id,value])=>{
      const f=document.getElementById(id);if(!f)return;
      f.setCustomValidity(f.value!==''&&Math.abs(Number(f.value)-value)>0.005?'Recheck '+(f.closest('label')?.textContent.trim()||'this total')+' using the supplied record and worked method.':'');
    });
  }
  Object.keys(expected).forEach(id=>document.getElementById(id)?.addEventListener('input',validateFinals));
  document.addEventListener('calm:restore',()=>{validateFinals();document.querySelectorAll('.finlit-feedback[id]').forEach(f=>f.hidden=true);document.querySelectorAll('[data-review-choice]').forEach(group=>group.querySelector('input')?.dispatchEvent(new Event('finlit:restore')));});
  for (const id of ['ce1-03','fl3-04']) {
    const article=document.getElementById(id);
    article?.querySelector('[data-complete-lesson]')?.addEventListener('click',event=>{
      validateFinals();
      const invalid=[...article.querySelectorAll('[data-final-field]')].find(f=>f.validity.customError);
      if(invalid){event.stopImmediatePropagation();article.querySelector('[data-completion-status]').textContent=invalid.validationMessage;invalid.focus();}
    });
  }
  validateFinals();
})();
