/* Fictional classroom economy. Cents are rounded at transaction boundaries. */
(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.PPFinance=api;})(typeof window==='object'?window:globalThis,function(){
  const cents=n=>Math.round((n+Number.EPSILON)*100)/100;
  const minimum=balance=>cents(Math.min(Math.max(0,balance),Math.max(25,balance*.02)));
  function loanMonth(loan,cash){
    const L={...loan},interest=cents(L.bal*.015);L.bal=cents(L.bal+interest);
    const scheduled=L.left<=0?L.bal:Math.min(L.pay,Math.max(0,L.bal-(L.arrears||0)));
    const due=cents(Math.min(L.bal,(L.arrears||0)+scheduled));
    const paid=cents(Math.min(Math.max(0,cash),due));L.bal=cents(L.bal-paid);L.left=Math.max(0,L.left-1);
    const missed=paid+.001<due;L.arrears=cents(Math.max(0,due-paid));
    if(missed){L.bal=cents(L.bal+25);L.arrears=cents(L.arrears+25);}
    // arrears is a partition of bal, never another liability or interest base.
    L.arrears=Math.min(L.bal,L.arrears);
    return{loan:L.bal<=.005?null:L,interest,due,paid,fee:missed?25:0,missed,cash:cents(cash-paid)};
  }
  function creditMonth(balance,paid,statementMinimum){
    const due=statementMinimum??minimum(balance+paid),short=cents(Math.max(0,due-paid));
    const missed=balance>0&&short>.005,fee=missed?25:0,interest=cents(balance*.0175);
    return{balance:cents(balance+fee+interest),due,short,missed,fee,interest};
  }
  function validNumbers(state){
    const required=['cash','savings','debt','ms','well','ps','energy','stress','month'];
    if(required.some(k=>!Number.isFinite(state[k])))return false;
    const walk=v=>typeof v==='number'?Number.isFinite(v):Array.isArray(v)?v.every(walk):v&&typeof v==='object'?Object.values(v).every(walk):true;
    return walk(state);
  }
  return{cents,minimum,loanMonth,creditMonth,validNumbers};
});
