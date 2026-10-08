(() => {
  "use strict";
  const currency = value => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(value);
  const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const panels = [...document.querySelectorAll("[data-activity-id]")];
  const value = (panel, name) => panel.querySelector(`[name="${name}"]`)?.value.trim() || "";
  const number = (panel, name) => value(panel, name) === "" ? NaN : Number(value(panel, name));
  const payment = (principal, rate, months) => rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
  function simulateDebt(aStart,aRate,bStart,bRate,monthly,strategy,aMin,bMin) {
    let balances=[aStart,bStart], rates=[aRate,bRate], mins=[aMin,bMin], interest=0;
    for(let month=1;month<=600;month++){
      const charges=balances.map((b,i)=>round(b*rates[i]/1200));
      balances=balances.map((b,i)=>round(b+charges[i]));interest=round(interest+charges[0]+charges[1]);
      const due=balances.map((b,i)=>Math.min(b,mins[i]));
      if(round(due[0]+due[1])>monthly)return null;
      let remaining=round(monthly-due[0]-due[1]);balances=balances.map((b,i)=>round(b-due[i]));
      let first=strategy==='avalanche'?(aRate>=bRate?0:1):(aStart<=bStart?0:1);
      for(const i of [first,1-first]){const paid=Math.min(balances[i],remaining);balances[i]=round(balances[i]-paid);remaining=round(remaining-paid);}
      if(balances[0]+balances[1]===0)return {months:month,interest};
    }return null;
  }
  function schedule(principal,rate,months,limit=months,resetMonth=null,resetRate=null){let balance=principal,total=0,interest=0,regular=round(payment(principal,rate,months)),last=0;
    for(let m=1;m<=Math.min(months,limit);m++){if(m===resetMonth){rate=resetRate;regular=round(payment(balance,rate,months-m+1));}let charge=round(balance*rate),paid=m===months?round(balance+charge):Math.min(regular,round(balance+charge));balance=round(balance+charge-paid);interest=round(interest+charge);total=round(total+paid);last=paid;}return {regular,last,balance,total,interest};}
  const calculators = {
    "career-compare": p => {
      const aCost=number(p,"aCost"),bCost=number(p,"bCost"),aMonths=number(p,"aMonths"),bMonths=number(p,"bMonths");
      if ([aCost,bCost,aMonths,bMonths].some(x=>!Number.isFinite(x)||x<0)) return "Enter non-negative costs and months.";
      const cost=bCost-aCost,time=bMonths-aMonths,priority=value(p,"priority");
      return `Route A costs ${currency(aCost)} over ${aMonths} months. Route B costs ${currency(bCost)} over ${bMonths} months. B changes the estimate by ${currency(cost)} and ${time} months. Your priority is ${priority}. Check current entry requirements, travel, credentials, and job duties before choosing.`;
    },
    "program-plan": p => {
      const pathway=value(p,"pathway"),course=value(p,"course"),requirement=value(p,"requirement"),support=value(p,"support");
      if (![pathway,course,requirement,support].every(Boolean)) return "Add a pathway, preparation choice, requirement to confirm, and support person.";
      return `Provisional plan: ${pathway}. Preparation: ${course}. Verify: ${requirement}. Ask: ${support}. Next, cite a current program source and set a review date.`;
    },
    "interview": p => {
      const feedback={vague:"This is a claim without a situation or action. Add a specific example and result.",specific:"This identifies a situation, action, and outcome. Add the skill it demonstrates and what the learner learned.",exaggerated:"The claim is difficult to verify and overstates the role. Replace it with a truthful, specific action."};
      return `${feedback[value(p,"answer")]} ${value(p,"improvement") ? "Your improvement is saved with this activity; compare it with the feedback." : "Write one improvement to make the answer stronger."}`;
    },
    "workplace": p => {
      const safe=value(p,"action")==="pause",follow=value(p,"followup")==="report";
      return `${safe ? "Pausing and asking for a label, training, and supervisor guidance addresses the immediate risk." : "The immediate risk remains. Stop the task and seek information and training through the workplace process."} ${follow ? "Reporting and documenting the hazard supports follow-up." : "A follow-up report helps prevent the same hazard affecting someone else."}`;
    },
    "paystub": p => {
      const gross=round(20*16.50+2*24.75),net=round(gross-31.40),enteredGross=number(p,"gross"),enteredNet=number(p,"net");
      return `Expected gross: ${currency(gross)} (20 × $16.50 + 2 × $24.75). Expected net: ${currency(net)} after $31.40 in listed deductions. ${Math.abs(enteredGross-gross)<0.01&&Math.abs(enteredNet-net)<0.01 ? "Both entries match. Explain why year-to-date pay is not added to this period." : "Check the hours, rates, and deduction total, then revise your entries."}`;
    },
    "budget": p => {
      const names=["income","essentials","flexible","saving","surprise"],n=names.map(x=>number(p,x));
      if(n.some(x=>!Number.isFinite(x)||x<0))return "Enter non-negative amounts for each budget line.";
      const before=n[0]-n[1]-n[2]-n[3],after=before-n[4];
      return `Before the surprise: ${currency(before)} remaining. After it: ${currency(after)}. ${after<0?`Find at least ${currency(-after)} through an explained adjustment; protect essential costs and required payments.`:"The plan remains non-negative. Explain whether the remaining buffer is adequate."}`;
    },
    "contract": p => {
      const names=["promo","regular","aSetup","bMonthly","bSetup"],n=names.map(x=>number(p,x));
      if(n.some(x=>!Number.isFinite(x)||x<0))return "Enter non-negative agreement costs.";
      const a=6*n[0]+6*n[1]+n[2],b=12*n[3]+n[4];
      return `Plan A first-year cost: ${currency(a)}. Plan B: ${currency(b)}. ${a===b?"The modeled costs are equal":`${a<b?"A is lower":"B is lower"} by ${currency(Math.abs(a-b))}`} before tax. Compare device, cancellation, and coverage terms before deciding.`;
    },
    "loan": p => {
      const principal=number(p,"principal"),rate=number(p,"rate"),months=number(p,"months"),fees=number(p,"fees"),kind=value(p,"kind");
      if(!Number.isFinite(principal)||principal<=0||!Number.isFinite(rate)||rate<0||rate>50||!Number.isInteger(months)||months<1||months>600||!Number.isFinite(fees)||fees<0)return "Enter a positive principal, a rate from 0–50%, 1–600 whole months, and non-negative fees.";
      const monthlyRate=kind==="mortgage"?Math.pow(1+rate/200,1/6)-1:rate/1200;
      const rm=value(p,'resetMonth'),rr=value(p,'resetRate');
      if((rm||rr)&&(!rm||!rr||!Number.isInteger(Number(rm))||Number(rm)<2||Number(rm)>months||!Number.isFinite(Number(rr))||Number(rr)<0||Number(rr)>50))return 'Supply both reset fields: a whole month from 2 to the final month and a new annual rate from 0–50%, or leave both blank.';
      const resetRate=rr?(kind==='mortgage'?Math.pow(1+Number(rr)/200,1/6)-1:Number(rr)/1200):null;
      const result=schedule(principal,monthlyRate,months,kind==='mortgage'?60:months,rm?Number(rm):null,resetRate);
      return `${kind==='mortgage'?'Fictional mortgage: nominal annual rate compounded semi-annually; term shown ends at 60 payments.':'Monthly-rate loan.'} ${rm?'Payment after the month '+rm+' reset':'Regular payment'} ${currency(result.regular)}; last displayed payment ${currency(result.last)}; displayed payments total ${currency(result.total)}; interest ${currency(result.interest)}; remaining balance ${currency(result.balance)}. Separately paid fees ${currency(fees)}; displayed interest plus fees ${currency(result.interest+fees)}. Interest is rounded to cents each month; the final amortization payment clears the balance. ${rm?'The supplied reset re-amortizes the remaining balance over the original months.':'Rate held constant.'} This does not predict renewal terms.`;
    },
    "debt": p => {
      const a=number(p,"aBalance"),ar=number(p,"aRate"),b=number(p,"bBalance"),br=number(p,"bRate"),m=number(p,"monthly"),am=number(p,"aMinimum"),bm=number(p,"bMinimum");
      if([a,ar,b,br,m,am,bm].some(x=>!Number.isFinite(x)||x<0)||a+b<=0||ar>60||br>60||m<=0)return "Use non-negative balances, rates from 0–60%, and a positive total monthly payment.";
      if(m<Math.min(a,am)+Math.min(b,bm))return `The monthly budget is below the contractual minima. Increase it by at least ${currency(Math.min(a,am)+Math.min(b,bm)-m)} or investigate a confirmed arrangement.`;
      const avalanche=simulateDebt(a,ar,b,br,m,"avalanche",am,bm),snowball=simulateDebt(a,ar,b,br,m,"snowball",am,bm);
      if(!avalanche||!snowball)return "This payment does not repay both debts within the model. Raise the payment or seek qualified help with the fictional case.";
      return `Higher-rate-first: ${avalanche.months} months and ${currency(avalanche.interest)} interest. Smaller-balance-first: ${snowball.months} months and ${currency(snowball.interest)} interest. Explain the cost and motivation trade-off; actual minimums and fees may differ.`;
    },
    "saving": p => {
      const start=number(p,"start"),monthly=number(p,"monthly"),years=number(p,"years"),gross=number(p,"return"),fee=number(p,"fee"),inflation=number(p,"inflation");
      if([start,monthly,years,gross,fee,inflation].some(x=>!Number.isFinite(x))||start<0||start>100000||monthly<0||monthly>100000||!Number.isInteger(years)||years<1||years>50||gross<-50||gross>50||fee<0||fee>10||inflation<-10||inflation>20)return "Use non-negative amounts, 1–50 whole years, and rates within the shown ranges.";
      const factor=Math.pow(1+gross/100,1/12)*(1-fee/1200);let balance=start;
      for(let month=0;month<years*12;month++)balance=balance*factor+monthly;
      const real=balance/Math.pow(1+inflation/100,years),contributed=start+monthly*years*12;
      return `Contributed: ${currency(contributed)}. Illustrative future balance: ${currency(balance)}. Purchasing power in today's dollars at ${inflation}% inflation: about ${currency(real)}. Annual effective return is converted to a monthly factor; fees are deducted monthly, then the month-end deposit is added. Full precision is retained until display. Returns and inflation are assumptions, not promises.`;
    },
    "scam": p => `${value(p,"kind")==="job"?"Correct: asking a candidate to pay before an interview is a job-scam signal.":"Reclassify the message by the activity and demand; it concerns a job offer."} ${value(p,"verify")==="official"?"Independent contact through an official source is the safer verification route.":"Do not use the message's reply path or pay the requested fee; locate a trusted contact independently."}`,
    "plan-challenge": p => {
      const n=["income","essentials","flexible","debt","saving","shock"].map(x=>number(p,x));
      if(n.some(x=>!Number.isFinite(x)||x<0))return "Enter non-negative scenario amounts.";
      const before=n[0]-n[1]-n[2]-n[3]-n[4],after=before-n[5],choice=value(p,"change");
      const reduction=number(p,'reduction');
      if(!Number.isFinite(reduction)||reduction<0)return 'Enter the actual reduction, including zero if none.';
      if(choice==='borrow'&&reduction>0)return 'A borrowing choice is not a spending reduction. Use zero and explain the borrowing terms separately.';
      if(choice==='saving'&&reduction>n[4]||choice==='flexible'&&reduction>n[2])return 'The reduction cannot exceed the selected allocation.';
      const revised=after+reduction;
      const note=choice==="borrow"?"New borrowing adds cost and risk; compare existing flexibility and required payments first.":choice==="saving"?"A temporary saving change needs a recovery date and should protect near-term needs.":"Check how much flexible spending can realistically change.";
      return `Before the unexpected cost: ${currency(before)}. After: ${currency(after)}. ${after<0?`Gap: ${currency(-after)}.`:"No immediate deficit."} ${note} After the entered reduction: ${currency(revised)}. ${value(p,"review")?"Your review point is saved.":"Add a review point before relying on this revision."}`;
    }
  };
  function update(panel) {
    const output=panel.querySelector("[data-activity-output]");
    try { output.textContent=calculators[panel.dataset.activityId]?.(panel) || "This activity is unavailable."; }
    catch { output.textContent="Could not calculate this scenario. Check the inputs and try again."; }
  }
  panels.forEach(panel => {
    panel.addEventListener("input", () => update(panel));
    panel.addEventListener("change", () => update(panel));
    update(panel);
  });
})();
