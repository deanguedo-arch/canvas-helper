(() => {
  "use strict";
  const currency = value => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(value);
  const round = value => Math.round((value + Number.EPSILON) * 100) / 100;
  const panels = [...document.querySelectorAll("[data-activity-id]")];
  const value = (panel, name) => panel.querySelector(`[name="${name}"]`)?.value.trim() || "";
  const number = (panel, name) => Number(value(panel, name));
  const payment = (principal, rate, months) => rate === 0 ? principal / months : principal * rate / (1 - Math.pow(1 + rate, -months));
  function simulateDebt(aStart, aRate, bStart, bRate, monthly, strategy) {
    let a = aStart, b = bStart, interestTotal = 0;
    for (let month = 1; month <= 600; month += 1) {
      const ai = a * aRate / 1200, bi = b * bRate / 1200;
      a += ai; b += bi; interestTotal += ai + bi;
      if (monthly <= ai + bi && a + b > monthly) return null;
      let remaining = monthly;
      for (const key of ["a", "b"]) {
        const balance = key === "a" ? a : b;
        if (!balance) continue;
        const minimum = Math.min(balance, Math.max(key === "a" ? ai + 1 : bi + 1, Math.min(25, balance)));
        const paid = Math.min(minimum, remaining);
        if (key === "a") a -= paid; else b -= paid;
        remaining -= paid;
      }
      const first = strategy === "avalanche" ? (aRate >= bRate ? "a" : "b") : (aStart <= bStart ? "a" : "b");
      for (const key of [first, first === "a" ? "b" : "a"]) {
        if (remaining <= 0) break;
        const paid = Math.min(key === "a" ? a : b, remaining);
        if (key === "a") a -= paid; else b -= paid;
        remaining -= paid;
      }
      if (a + b < 0.01) return { months: month, interest: round(interestTotal) };
    }
    return null;
  }
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
      const instalment=payment(principal,monthlyRate,months),total=instalment*months+fees;
      return `${kind==="mortgage"?"Canadian semi-annual rate convention illustration":"Ordinary monthly-rate loan illustration"}: monthly payment ${currency(instalment)}; repayment plus separately paid upfront fees ${currency(total)}; cost above principal ${currency(total-principal)}. This classroom model holds the rate and payment constant and does not represent an actual mortgage offer. Check real contract terms.`;
    },
    "debt": p => {
      const a=number(p,"aBalance"),ar=number(p,"aRate"),b=number(p,"bBalance"),br=number(p,"bRate"),m=number(p,"monthly");
      if([a,ar,b,br,m].some(x=>!Number.isFinite(x)||x<0)||a+b<=0||ar>60||br>60||m<=0)return "Use non-negative balances, rates from 0–60%, and a positive total monthly payment.";
      const avalanche=simulateDebt(a,ar,b,br,m,"avalanche"),snowball=simulateDebt(a,ar,b,br,m,"snowball");
      if(!avalanche||!snowball)return "This payment does not repay both debts within the model. Raise the payment or seek qualified help with the fictional case.";
      return `Higher-rate-first: ${avalanche.months} months and ${currency(avalanche.interest)} interest. Smaller-balance-first: ${snowball.months} months and ${currency(snowball.interest)} interest. Explain the cost and motivation trade-off; actual minimums and fees may differ.`;
    },
    "saving": p => {
      const start=number(p,"start"),monthly=number(p,"monthly"),years=number(p,"years"),gross=number(p,"return"),fee=number(p,"fee"),inflation=number(p,"inflation");
      if([start,monthly,years,gross,fee,inflation].some(x=>!Number.isFinite(x))||start<0||monthly<0||!Number.isInteger(years)||years<1||years>60||gross<-20||gross>30||fee<0||fee>10||inflation<0||inflation>20)return "Use non-negative amounts, 1–60 whole years, and rates within the shown ranges.";
      const rate=(gross-fee)/1200;let balance=start;
      for(let month=0;month<years*12;month++)balance=balance*(1+rate)+monthly;
      const real=balance/Math.pow(1+inflation/100,years),contributed=start+monthly*years*12;
      return `Contributed: ${currency(contributed)}. Illustrative future balance: ${currency(balance)}. Purchasing power in today's dollars at ${inflation}% inflation: about ${currency(real)}. Returns and inflation are assumptions, not promises.`;
    },
    "scam": p => `${value(p,"kind")==="job"?"Correct: asking a candidate to pay before an interview is a job-scam signal.":"Reclassify the message by the activity and demand; it concerns a job offer."} ${value(p,"verify")==="official"?"Independent contact through an official source is the safer verification route.":"Do not use the message's reply path or pay the requested fee; locate a trusted contact independently."}`,
    "plan-challenge": p => {
      const n=["income","essentials","flexible","debt","saving","shock"].map(x=>number(p,x));
      if(n.some(x=>!Number.isFinite(x)||x<0))return "Enter non-negative scenario amounts.";
      const before=n[0]-n[1]-n[2]-n[3]-n[4],after=before-n[5],choice=value(p,"change");
      const note=choice==="borrow"?"New borrowing adds cost and risk; compare existing flexibility and required payments first.":choice==="saving"?"A temporary saving change needs a recovery date and should protect near-term needs.":"Check how much flexible spending can realistically change.";
      return `Before the unexpected cost: ${currency(before)}. After: ${currency(after)}. ${after<0?`Gap: ${currency(-after)}.`:"No immediate deficit."} ${note}`;
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
