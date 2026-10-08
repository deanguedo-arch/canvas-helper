/* Credit Gauntlet v0.2 financial model. CAD integer cents; exact HALF_UP. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.CreditModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const VERSION = '0.2.0';
  const ROUTES = ['fixed_36', 'fixed_60', 'fixed_84', 'variable_36', 'variable_60', 'variable_84'];
  const halfUp = (numerator, denominator) => Number((2n * numerator + denominator) / (2n * denominator));
  function requireWhole(value, name, allowZero = true) {
    if (!Number.isSafeInteger(value) || value < (allowZero ? 0 : 1)) throw new Error('Invalid ' + name);
  }
  function interest(balance, rateBps) {
    requireWhole(balance, 'balance'); requireWhole(rateBps, 'rate');
    return halfUp(BigInt(balance) * BigInt(rateBps), 120000n);
  }
  function payment(principal, rateBps, months) {
    requireWhole(principal, 'principal'); requireWhole(rateBps, 'rate'); requireWhole(months, 'term', false);
    if (months > 120) throw new Error('Invalid term');
    if (!rateBps) return halfUp(BigInt(principal), BigInt(months));
    const a = BigInt(rateBps), b = 120000n, n = BigInt(months);
    const power = (a + b) ** n;
    return halfUp(BigInt(principal) * a * power, b * (power - b ** n));
  }
  function routeInfo(id) {
    if (!ROUTES.includes(id)) throw new Error('Invalid loan route');
    const [kind, term] = id.split('_'), months = Number(term), rateBps = kind === 'fixed' ? 650 : 500;
    const initialPayment = payment(1200000, rateBps, months);
    return { id, kind, months, rateBps, initialPayment, minimums: initialPayment + 10500,
      gap: Math.max(0, initialPayment + 10500 - 34000), eligible: initialPayment + 10500 <= 34000 };
  }
  function origin(id) {
    const r = routeInfo(id);
    return [
      { id: 'small', label: 'Small personal loan', balance: 80000, rateBps: 1100, minimum: 3000 },
      { id: 'store', label: 'Store card', balance: 250000, rateBps: 2400, minimum: 7500 },
      { id: 'vehicle', label: 'Vehicle loan', balance: 1200000, rateBps: r.rateBps, minimum: r.initialPayment }
    ];
  }
  function ordered(debts, strategy) {
    if (!['avalanche', 'snowball'].includes(strategy)) throw new Error('Invalid strategy');
    return debts.filter(d => d.balance > 0).slice().sort((a, b) => {
      const first = strategy === 'avalanche' ? b.rateBps - a.rateBps : a.balance - b.balance;
      const second = strategy === 'avalanche' ? a.balance - b.balance : b.rateBps - a.rateBps;
      return first || second || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    });
  }
  function month(debts, budget, strategy, storyMonth, finalVehicleMonth) {
    requireWhole(budget, 'budget');
    const rows = debts.map(d => {
      const charge = interest(d.balance, d.rateBps), owed = d.balance + charge;
      const minimum = d.id === 'vehicle' && storyMonth === finalVehicleMonth ? owed : Math.min(d.minimum, owed);
      return { id: d.id, label: d.label, opening: d.balance, rateBps: d.rateBps, interest: charge,
        payment: minimum, principal: minimum - charge, closing: owed - minimum, minimum, extra: 0 };
    });
    const required = rows.reduce((a, d) => a + d.minimum, 0);
    if (required > budget) throw new Error('Insufficient allocation');
    let unused = budget - required;
    const targets = strategy ? ordered(debts, strategy) : [];
    for (const target of targets) {
      const row = rows.find(d => d.id === target.id), extra = Math.min(unused, row.closing);
      row.payment += extra; row.principal += extra; row.extra = extra; row.closing -= extra; unused -= extra;
    }
    for (const row of rows) if (row.closing < 0) throw new Error('Negative balance');
    return { storyMonth, target: targets[0]?.id || null, rows, unused,
      interest: rows.reduce((a, d) => a + d.interest, 0), paid: rows.reduce((a, d) => a + d.payment, 0),
      debts: debts.map(d => ({ ...d, balance: rows.find(row => row.id === d.id).closing })) };
  }
  function firstYear(id, count = 12) {
    requireWhole(count, 'month'); if (count > 12) throw new Error('Invalid checkpoint');
    let debts = origin(id), rows = [];
    const r = routeInfo(id);
    for (let m = 1; m <= count; m++) {
      // Unaffordable routes are preview-only; their separate loan schedule is still inspectable.
      const step = month(debts, Math.max(34000, r.minimums), null, m, r.months);
      rows.push(step); debts = step.debts;
    }
    return { debts, rows, interest: rows.reduce((a, d) => a + d.interest, 0) };
  }
  function checkpoint(id) {
    const r = routeInfo(id), first = firstYear(id), debts = first.debts.map(d => ({ ...d }));
    const vehicle = debts.find(d => d.id === 'vehicle');
    if (r.kind === 'variable') { vehicle.rateBps = 650; vehicle.minimum = payment(vehicle.balance, 650, r.months - 12); }
    return { ...first, debts, eventId: 'reference-rate-rise-after-payment-12',
      required: debts.reduce((a, d) => a + d.minimum, 0), vehiclePayment: vehicle.minimum,
      eventIncrease: vehicle.minimum - r.initialPayment, reserve: 20000, budget: 49000 };
  }
  function loanSchedule(id, applyEvent = true) {
    const r = routeInfo(id); let balance = 1200000, minimum = r.initialPayment, rows = [], rateBps = r.rateBps;
    for (let m = 1; m <= r.months; m++) {
      if (applyEvent && r.kind === 'variable' && m === 13) { rateBps = 650; minimum = payment(balance, rateBps, r.months - 12); }
      const charge = interest(balance, rateBps), paid = m === r.months ? balance + charge : Math.min(minimum, balance + charge);
      rows.push({ storyMonth: m, id: 'vehicle', opening: balance, rateBps, interest: charge, payment: paid,
        principal: paid - charge, closing: balance + charge - paid });
      balance += charge - paid;
    }
    return { rows, interest: rows.reduce((a, d) => a + d.interest, 0), balance };
  }
  function portfolio(id, strategy) {
    const r = routeInfo(id); if (!r.eligible) throw new Error('Unaffordable route');
    const start = checkpoint(id); let debts = start.debts.map(d => ({ ...d })), rows = [], cleared = {};
    for (let m = 1; debts.some(d => d.balance > 0); m++) {
      if (m > 120) throw new Error('Calculation guard: specification error');
      const step = month(debts, 49000, strategy, m + 12, r.months);
      step.portfolioMonth = m; rows.push(step); debts = step.debts;
      for (const d of debts) if (d.balance === 0 && !cleared[d.id]) cleared[d.id] = m;
    }
    const phaseInterest = rows.reduce((a, d) => a + d.interest, 0);
    const firstClearMonth = Math.min(...Object.values(cleared));
    return { route: id, strategy, start, rows, debts, cleared, phaseInterest, totalInterest: phaseInterest + start.interest,
      months: rows.length, storyMonth: rows.length + 12, firstClearMonth,
      firstCleared: Object.keys(cleared).filter(id => cleared[id] === firstClearMonth),
      totalPaid: rows.reduce((a, d) => a + d.paid, 0), reserve: 20000 };
  }
  return { VERSION, ROUTES, interest, payment, routeInfo, origin, ordered, month, firstYear, checkpoint, loanSchedule, portfolio };
});
