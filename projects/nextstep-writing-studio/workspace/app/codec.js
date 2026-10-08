import { gzipSync, Gunzip } from 'fflate';

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
export const MAX_RAW = 1048576;
export const MAX_WIRE = 56000;

export function canonical(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw Error('Nonfinite number');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw Error('Not a plain JSON object');
    const keys = Object.keys(value).sort();
    if (keys.some(key => forbidden.has(key))) throw Error('Forbidden property');
    return `{${keys.map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  throw Error('Not a JSON value');
}

export async function sha256(bytes) {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return [...digest].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function strictJSON(text, maxBytes = MAX_RAW) {
  if (typeof text !== 'string' || encoder.encode(text).length > maxBytes) throw Error('JSON input bound');
  let pos = 0;
  const ws = () => { while (/[\x20\t\n\r]/.test(text[pos] || '\0')) pos++; };
  function readString() {
    const start = pos++;
    while (pos < text.length) {
      const ch = text[pos++];
      if (ch === '"') return JSON.parse(text.slice(start, pos));
      if (ch === '\\') pos++;
    }
    throw Error('Unterminated string');
  }
  function readValue(depth) {
    if (depth > 100) throw Error('JSON nesting bound');
    ws(); const ch = text[pos];
    if (ch === '"') return readString();
    if (ch === '{') {
      pos++; const out = Object.create(null), seen = new Set(); ws();
      if (text[pos] === '}') { pos++; return out; }
      while (true) {
        ws(); if (text[pos] !== '"') throw Error('Object key expected');
        const key = readString();
        if (seen.has(key)) throw Error('Duplicate JSON key');
        if (forbidden.has(key)) throw Error('Forbidden property');
        seen.add(key); ws(); if (text[pos++] !== ':') throw Error('Colon expected');
        out[key] = readValue(depth + 1); ws();
        if (text[pos] === '}') { pos++; return out; }
        if (text[pos++] !== ',') throw Error('Comma expected');
      }
    }
    if (ch === '[') {
      pos++; const out = []; ws();
      if (text[pos] === ']') { pos++; return out; }
      while (true) {
        out.push(readValue(depth + 1)); ws();
        if (text[pos] === ']') { pos++; return out; }
        if (text[pos++] !== ',') throw Error('Comma expected');
      }
    }
    const token = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(pos));
    if (!token) throw Error('Value expected');
    pos += token[0].length;
    const value = JSON.parse(token[0]);
    if (typeof value === 'number' && !Number.isFinite(value)) throw Error('Nonfinite number');
    return value;
  }
  const value = readValue(0); ws();
  if (pos !== text.length) throw Error('Trailing JSON input');
  return value;
}

function toBase64(bytes) {
  let output = '';
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    output += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(output);
}
function fromBase64(value) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  if (toBase64(bytes) !== value) throw Error('Noncanonical Base64');
  return bytes;
}

export async function encodeState(value, maxWire = MAX_WIRE) {
  const raw = encoder.encode(canonical(value));
  if (raw.length > MAX_RAW) throw Error('Raw payload bound');
  const wire = `WS1.${await sha256(raw)}.${toBase64(gzipSync(raw, { level: 9, mtime: 0 }))}`;
  if (wire.length > maxWire) throw Error('Wire capacity');
  return wire;
}

export async function decodeState(wire) {
  if (typeof wire !== 'string' || wire.length > 128000 || /[^\x00-\x7f]/.test(wire)) throw Error('Wire input bound');
  const match = /^WS1\.([0-9a-f]{64})\.((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/.exec(wire);
  if (!match || !match[2]) throw Error('Invalid wire envelope');
  const compressed = fromBase64(match[2]);
  const parts = []; let length = 0;
  const inflator = new Gunzip((chunk) => {
    length += chunk.length;
    if (length > MAX_RAW) throw Error('Inflated payload bound');
    parts.push(chunk);
  });
  // Streaming callbacks enforce the output cap before allocating a combined result.
  for (let index = 0; index < compressed.length; index += 4096) {
    inflator.push(compressed.subarray(index, index + 4096), index + 4096 >= compressed.length);
  }
  const raw = new Uint8Array(length); let offset = 0;
  for (const part of parts) { raw.set(part, offset); offset += part.length; }
  if (await sha256(raw) !== match[1]) throw Error('Wire checksum mismatch');
  const text = decoder.decode(raw);
  const parsed = strictJSON(text);
  if (canonical(parsed) !== text) throw Error('Noncanonical payload');
  return parsed;
}

export async function backupChecksum(envelope) {
  const { checksum, ...body } = envelope;
  return sha256(encoder.encode(canonical(body)));
}

export function wordCount(text) {
  return (text.replace(/\u00a0/g, ' ').match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
}
