/** Browser-safe, fixed presentation order. Saved values always remain canonical indices. */
function rank(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  return (hash ^ hash >>> 16) >>> 0;
}

export function practiceOptionOrder(item: { id: string; options: string[] }) {
  if (!item.id || item.options.length !== 4 || new Set(item.options).size !== 4) throw new Error("Four distinct canonical practice options required");
  return item.options.map((text, index) => ({ value: String(index), text, rank: rank(`${item.id}\0${index}`) }))
    .sort((a, b) => a.rank - b.rank || Number(a.value) - Number(b.value))
    .map(({ value, text }) => ({ value, text }));
}
