export const formulaCounts = {H2:{H:2},O2:{O:2},H2O:{H:2,O:1},H2O2:{H:2,O:2},CH4:{C:1,H:4},CO2:{C:1,O:2},Fe:{Fe:1},Fe2O3:{Fe:2,O:3},CaCO3:{Ca:1,C:1,O:3},HCl:{H:1,Cl:1},CaCl2:{Ca:1,Cl:2},N2:{N:2},NH3:{N:1,H:3}};
export function countSide(species, coefficients, allowZero = false) {
  if (species.length !== coefficients.length || !species.length) throw new Error('Every substance needs a coefficient.');
  const out = {};
  species.forEach((f,i) => {
    if (!Object.hasOwn(formulaCounts, f)) throw new Error('Unknown substance formula.');
    const raw = coefficients[i], c = Number(raw);
    if (raw === '' || raw == null || !Number.isSafeInteger(c) || c < (allowZero ? 0 : 1)) throw new Error('Submit positive whole-number coefficients for every substance.');
    for (const [el,n] of Object.entries(formulaCounts[f])) out[el] = (out[el] || 0) + n*c;
  });
  if (Object.values(out).some(n => !Number.isSafeInteger(n))) throw new Error('Coefficient is too large to count exactly.');
  return out;
}
export function validateBalance(reactants, products, coefficients, allowZero = false) {
  if (coefficients.length !== reactants.length + products.length) throw new Error('Every substance needs one coefficient.');
  const left = countSide(reactants, coefficients.slice(0,reactants.length), allowZero);
  const right = countSide(products, coefficients.slice(reactants.length), allowZero);
  const elements = [...new Set([...Object.keys(left), ...Object.keys(right)])];
  const differences = Object.fromEntries(elements.map(e => [e,(left[e] || 0)-(right[e] || 0)]));
  return {balanced: elements.every(e => differences[e] === 0), left, right, differences};
}
export function gcdAll(values) { const gcd=(a,b)=>b ? gcd(b,a%b) : Math.abs(a); return values.reduce((a,b)=>gcd(a,b),0); }
export function simplest(values) { const g=gcdAll(values); return g > 1 ? values.map(n=>n/g) : values.slice(); }
export function validate(s, answer) {
  try {
    const coefficients = s.reactants.concat(s.products_list).map((_,i)=>answer['c'+i]);
    const r=validateBalance(s.reactants,s.products_list,coefficients);
    if (!r.balanced) return {valid:false,message:'Count each element separately. Repair the rows with different atom counts.', details:r};
    if (s.smallestRequired && gcdAll(coefficients.map(Number)) !== 1) return {valid:false,message:'This is balanced. This prompt also asks for the smallest whole-number ratio; divide all coefficients by their common factor.',details:r};
    return {valid:true,message:'Each element is conserved. Your equation is balanced' + (gcdAll(coefficients.map(Number)) > 1 ? '; this valid multiple can be simplified.' : '.'),details:r};
  } catch(e) { return {valid:false,message:e.message}; }
}
