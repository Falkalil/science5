// محرّكُ العبارات: تحليل، حساب، خطواتُ ترتيبِ العمليّات، الكسور، التحليلُ إلى العوامل
import { AR, DIG, toW, fmt } from './mathkit.js';

/* ── التقطيع ── */
// أنواع: n عدد، v متغيّر، o عمليّة (+ - * / ^)، ( )
export function tokenize(s) {
  s = toW(String(s)).replace(/[٫]/g, '.').replace(/−|–/g, '-').replace(/[×xX]/g, '*').replace(/[÷:]/g, '/').replace(/\[/g, '(').replace(/\]/g, ')').replace(/\s+/g, ' ');
  // الأسّ المكتوبُ رمزًا علويًّا
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + [...m].map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)).join(''));
  const T = []; let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ') { i++; continue; }
    if (/[\d.,]/.test(c)) { let j = i; while (j < s.length && /[\d.,]/.test(s[j])) j++; let num = s.slice(i, j).replace(/,/g, '.'); T.push({ t: 'n', v: parseFloat(num) }); i = j; continue; }
    if ('+-*/^'.includes(c)) { T.push({ t: 'o', v: c }); i++; continue; }
    if (c === '(' || c === ')') { T.push({ t: c }); i++; continue; }
    if ('=<>≠≈'.includes(c)) { T.push({ t: 'rel', v: c }); i++; continue; }
    if (c === '■' || c === '؟' || c === '?') { T.push({ t: 'v', v: c === '■' ? '■' : '؟' }); i++; continue; }
    if (/[ء-ي a-z]/i.test(c)) { T.push({ t: 'v', v: c }); i++; continue; }
    throw new Error('رمزٌ غيرُ معروف: ' + c);
  }
  // الضربُ الضمنيّ: ٣س، ٢(…)، )(
  const out = []; T.forEach((t, k) => { const p = out[out.length - 1]; if (p && (p.t === 'n' || p.t === 'v' || p.t === ')') && (t.t === 'v' || t.t === '(' || (t.t === 'n' && p.t !== 'n'))) out.push({ t: 'o', v: '*', imp: true }); out.push(t); });
  // السالبُ الأحاديّ
  const o2 = []; out.forEach((t, k) => { const p = o2[o2.length - 1]; if (t.t === 'o' && t.v === '-' && (!p || p.t === 'o' || p.t === '(')) { o2.push({ t: 'n', v: 0, neg: true }); } o2.push(t); });
  return o2;
}
const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
function apply(a, o, b) { return o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : o === '/' ? a / b : Math.pow(a, b); }
export function evalTokens(T, vars = {}) {
  const vals = [], ops = [];
  const red = () => { const o = ops.pop(), b = vals.pop(), a = vals.pop(); vals.push(apply(a, o, b)); };
  for (const t of T) {
    if (t.t === 'n') vals.push(t.v);
    else if (t.t === 'v') { if (!(t.v in vars)) throw new Error('متغيّرٌ بلا قيمة: ' + t.v); vals.push(vars[t.v]); }
    else if (t.t === '(') ops.push('(');
    else if (t.t === ')') { while (ops.length && ops[ops.length - 1] !== '(') red(); ops.pop(); }
    else { while (ops.length && ops[ops.length - 1] !== '(' && (PREC[ops[ops.length - 1]] > PREC[t.v] || (PREC[ops[ops.length - 1]] === PREC[t.v] && t.v !== '^'))) red(); ops.push(t.v); }
  }
  while (ops.length) red();
  if (vals.length !== 1 || isNaN(vals[0])) throw new Error('عبارةٌ غيرُ مكتملة');
  return vals[0];
}
export const evalExpr = (s, vars) => evalTokens(tokenize(s), vars);
export const varsOf = s => [...new Set(tokenize(s).filter(t => t.t === 'v').map(t => t.v))];
const r9 = x => Math.round(x * 1e9) / 1e9;

/* ── العرض ── */
const OPS = { '+': '+', '-': '−', '*': '×', '/': '÷' };
export function renderTokens(T) {
  let h = '';
  for (let i = 0; i < T.length; i++) {
    const t = T[i];
    if (t.neg) { continue; }
    if (t.t === 'n') { const nx = T[i + 1]; h += `<b class="n">${fmt(r9(t.v))}</b>`; }
    else if (t.t === 'v') h += `<b class="n v">${t.v === 'ج' ? 'جـ' : t.v === 'ه' ? 'هـ' : t.v}</b>`;
    else if (t.t === '(' || t.t === ')') h += `<i class="pr">${t.t}</i>`;
    else if (t.t === 'rel') h += `<i class="op">${t.v}</i>`;
    else if (t.v === '^') { const e = T[i + 1]; h += `<sup>${e.t === 'n' ? fmt(e.v) : e.v}</sup>`; i++; }
    else if (t.imp) { }
    else if (t.v === '-' && i > 0 && T[i - 1].neg) h += '<i class="op">−</i>';
    else h += `<i class="op">${OPS[t.v]}</i>`;
  }
  return `<span class="mx">${h}</span>`;
}
export const R = s => renderTokens(tokenize(s)); // عرضُ عبارةٍ نصّيّة

/* ── خطواتُ ترتيبِ العمليّات ── */
export function steps(s) {
  let T = tokenize(s); const out = [renderTokens(T)]; let guard = 0;
  while (T.length > 1 && guard++ < 60) {
    // أعمقُ أقواس
    let lo = 0, hi = T.length; let depth = 0, best = -1, bd = 0;
    T.forEach((t, i) => { if (t.t === '(') { depth++; if (depth > bd) { bd = depth; best = i; } } else if (t.t === ')') depth--; });
    if (best >= 0) { lo = best + 1; hi = lo; let d = 1; while (hi < T.length) { if (T[hi].t === '(') d++; if (T[hi].t === ')') { d--; if (!d) break; } hi++; } }
    const seg = T.slice(lo, hi);
    if (seg.length === 1 && best >= 0) { // أزلِ الأقواس حولَ عددٍ واحد
      T = [...T.slice(0, lo - 1), seg[0], ...T.slice(hi + 1)];
      // ضربٌ ضمنيٌّ بعدَ إزالةِ القوس يبقى ضربًا
      continue;
    }
    let k = seg.findIndex(t => t.t === 'o' && t.v === '^');
    if (k < 0) k = seg.findIndex(t => t.t === 'o' && (t.v === '*' || t.v === '/'));
    if (k < 0) k = seg.findIndex(t => t.t === 'o' && (t.v === '+' || t.v === '-') && !(seg[k - 1] && seg[k - 1].neg));
    if (k < 0) break;
    const a = seg[k - 1], b = seg[k + 1]; if (!a || !b || a.t !== 'n' || b.t !== 'n') break;
    const v = apply(a.v, seg[k].v, b.v);
    seg.splice(k - 1, 3, { t: 'n', v: r9(v) });
    T = [...T.slice(0, lo), ...seg, ...T.slice(hi)];
    // عددٌ وحيدٌ بينَ قوسين يُزالُ في الخطوةِ نفسِها
    for (let i = 0; i + 2 < T.length; i++) if (T[i].t === '(' && T[i + 1].t === 'n' && T[i + 2].t === ')') { T.splice(i, 3, T[i + 1]); }
    // ضربٌ ضمنيٌّ بينَ عددين بعدَ إزالةِ القوس
    for (let i = 0; i + 1 < T.length; i++) if (T[i].t === 'n' && T[i + 1].t === 'n') T.splice(i + 1, 0, { t: 'o', v: '*' });
    out.push(renderTokens(T));
  }
  return out;
}
export const stepsHTML = s => steps(s).map((x, i) => (i ? '= ' : '') + x).join('<br>');

/* ── الكسور ── */
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
export const lcm = (a, b) => a / gcd(a, b) * b;
export const fr = (n, d) => `<span class="fr"><b>${AR(n)}</b><b>${AR(d)}</b></span>`;
export const mixed = (w, n, d) => `<span class="mxd">${w ? `<b class="w">${AR(w)}</b>` : ''}${fr(n, d)}</span>`;
// يقبل: ٣/٤ ، ١ ٣/٤ ، ٥ ، ٠,٧٥
export function parseFrac(s) {
  s = toW(String(s)).replace(/[٫,]/g, '.').trim(); let m;
  if ((m = s.match(/^(-?\d+)\s+(\d+)\s*\/\s*(\d+)$/))) return { w: +m[1], n: +m[2], d: +m[3], v: +m[1] + +m[2] / +m[3], mixed: true };
  if ((m = s.match(/^(-?\d+)\s*\/\s*(\d+)$/))) return { w: 0, n: +m[1], d: +m[2], v: +m[1] / +m[2] };
  if ((m = s.match(/^-?\d+(\.\d+)?$/))) return { w: 0, n: +s, d: 1, v: +s, whole: true, dec: !!m[1] };
  return null;
}
export const simplest = f => f && (f.whole ? !f.dec : gcd(f.n, f.d) === 1 && (!f.mixed || f.n < f.d));

/* ── التحليلُ إلى العواملِ الأوّليّة ── */
export const isPrime = n => { if (n < 2 || n % 1) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
export function primeFactors(n) { const f = []; for (let p = 2; p * p <= n; p++) while (n % p === 0) { f.push(p); n /= p; } if (n > 1) f.push(n); return f; }
// «٢ × ٢ × ٣» أو «٢^٢ × ٣» أو «٢² × ٣»
export function parsePF(s) {
  const T = tokenize(s); const f = []; let i = 0;
  while (i < T.length) { const t = T[i]; if (t.t === 'n') { let e = 1; if (T[i + 1] && T[i + 1].v === '^' && T[i + 2] && T[i + 2].t === 'n') { e = T[i + 2].v; i += 2; } for (let k = 0; k < e; k++) f.push(t.v); i++; } else if (t.t === 'o' && t.v === '*') i++; else return null; }
  return f.sort((a, b) => a - b);
}
export const pfHTML = n => { const f = primeFactors(n), c = {}; f.forEach(p => c[p] = (c[p] || 0) + 1); return `<span class="mx">${Object.entries(c).map(([p, e]) => `<b class="n">${AR(p)}</b>${e > 1 ? `<sup>${AR(e)}</sup>` : ''}`).join('<i class="op">×</i>')}</span>`; };

/* ── تكافؤُ العبارات الجبريّة ── */
export function sameExpr(a, b) {
  try { const vs = [...new Set([...varsOf(a), ...varsOf(b)])]; for (let k = 0; k < 4; k++) { const env = {}; vs.forEach((v, i) => env[v] = 2 + k * 3 + i * 7 + k * i); if (Math.abs(evalExpr(a, env) - evalExpr(b, env)) > 1e-7) return false; } return true; } catch (e) { return false; }
}
