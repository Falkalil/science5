// أدواتُ الرياضيّات التفاعليّة: أرقامٌ عربيّة، عبارات، لوحةُ أرقام، الحسابُ العموديّ، الأنماط، التمثيلُ بالأعمدة، الميزان
export const DIG = '٠١٢٣٤٥٦٧٨٩';
export const AR = s => String(s).replace(/\d/g, d => DIG[d]).replace(/\./g, ',');
// تنسيقُ عدد: d = عددُ المنازلِ العشريّة (اختياريّ)
export function fmt(n, d) { if (d === undefined) { const r = Math.round(n * 1000) / 1000; return AR(String(r)); } return AR(n.toFixed(d)); }
export const toW = s => String(s).replace(/[٠-٩]/g, c => DIG.indexOf(c)).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c));
export function parseNum(s) { s = toW(s).replace(/[٫,]/g, '.').replace(/[^\d.\-]/g, ''); if (!s || s === '.' || s === '-') return NaN; return Number(s); }
export function parseList(s) { return toW(s).split(/[،;؛\s]+|,(?=\s)/).map(x => x.trim()).filter(Boolean).map(parseNum); }
export function parseTime(s) { const m = toW(s).match(/(\d{1,2})\s*[:٫.]\s*(\d{2})/); return m ? +m[1] * 60 + +m[2] : NaN; }
export const fmtTime = m => AR(Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'));
export const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const OPS = { '+': '+', '-': '−', 'x': '×', '/': '÷', '=': '=' };
// عبارةٌ رياضيّةٌ تُقرأُ من اليمين: M([359,'+',88,'=','؟'])
export const M = parts => `<span class="mx">${parts.map(p => typeof p === 'number' ? `<b class="n">${fmt(p)}</b>` : OPS[p] ? `<i class="op">${OPS[p]}</i>` : `<b class="n">${p}</b>`).join('')}</span>`;

/* ───────── لوحةُ الأرقام ───────── */
let kp = null, kpIn = null;
const KPX = { num: ['−'], list: ['،', '−'], time: [':', '،'], frac: ['/', '␣', '−'], expr: ['س', 'ن', '+', '−', '×', '÷', '(', ')', '^'], pf: ['×', '^'], cmp: ['<', '>', '='] };
export function keypad() {
  if (kp) return kp;
  kp = document.createElement('div'); kp.id = 'kp';
  kp.innerHTML = '<div class="kx"></div><div class="kb">' + ['٧', '٨', '٩', '⌫', '٤', '٥', '٦', ',', '١', '٢', '٣', '٠', '✓'].map(k => `<button type="button" data-k="${k}" class="${k === '✓' ? 'ok' : k === '⌫' ? 'bk' : ''}">${k}</button>`).join('') + '</div><button type="button" class="hide" data-k="x">⌄ إخفاء اللوحة</button>';
  document.body.appendChild(kp);
  kp.addEventListener('pointerdown', e => e.preventDefault());
  kp.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b || !kpIn) return; const k = b.dataset.k;
    if (k === 'x') return hideKp(); if (k === '⌫') kpIn.value = kpIn.value.slice(0, -1); else if (k === '✓') { kpIn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); if (kpIn.classList.contains('ok') || kpIn.disabled) hideKp(); return; }
    else kpIn.value += (k === '،' ? '، ' : k === '␣' ? ' ' : k === '^' ? '^' : k);
    kpIn.dispatchEvent(new Event('input', { bubbles: true })); });
  document.addEventListener('focusin', e => { const t = e.target; if (t.matches && t.matches('input.ans')) { kpIn = t; if (!t.classList.contains('cell')) { const x = KPX[t.dataset.kp || 'num'] || KPX.num; kp.querySelector('.kx').innerHTML = x.map(k => `<button type="button" data-k="${k}">${k === '␣' ? 'مسافة' : k === '^' ? 'أُس' : k}</button>`).join(''); kp.classList.add('show'); document.body.classList.add('kpon'); } } });
  document.addEventListener('pointerdown', e => { if (kp.classList.contains('show') && !e.target.closest('#kp') && !e.target.closest('input.ans')) hideKp(); });
  return kp;
}
export function hideKp() { kp && kp.classList.remove('show'); document.body.classList.remove('kpon'); }
export const ansInput = (ph = 'إجابتي', w = '', mode = 'num') => `<input class="ans" data-kp="${mode}" inputmode="none" autocomplete="off" placeholder="${ph}" ${w ? `style="width:${w}"` : ''}>`;

/* ───────── الحسابُ العموديّ (جمع/طرح) ───────── */
// يكتبُ الطالبُ الناتجَ رقمًا رقمًا من الآحاد إلى اليسار، مع تلميحاتِ الحملِ وإعادةِ التجميع
export function column(el, a, b, op, onDone) {
  const r = op === '+' ? a + b : a - b, A = String(a), B = String(b), R = String(r), W = Math.max(A.length, B.length, R.length);
  const pad = s => s.padStart(W, ' ').split('');
  // الحمل/الاستلاف لكلِّ منزلة
  const carry = Array(W).fill(0), borrow = Array(W).fill(0);
  { let c = 0, br = 0; for (let i = 0; i < W; i++) { const x = +(A[A.length - 1 - i] || 0), y = +(B[B.length - 1 - i] || 0); if (op === '+') { const s = x + y + c; carry[W - 1 - i] = c; c = s >= 10 ? 1 : 0; } else { const top = x - br; borrow[W - 1 - i] = br; br = top < y ? 1 : 0; } } }
  el.innerHTML = `<div class="col" dir="ltr"><div class="crow"><span class="opc"></span>${pad('').map((_, i) => `<span class="cy" data-i="${i}"></span>`).join('')}</div>
    <div class="crow"><span class="opc"></span>${pad(A).map(d => `<span>${d.trim() ? DIG[d] : ''}</span>`).join('')}</div>
    <div class="crow"><span class="opc">${op === '+' ? '+' : '−'}</span>${pad(B).map(d => `<span>${d.trim() ? DIG[d] : ''}</span>`).join('')}</div>
    <div class="crow line"><span class="opc"></span>${pad(R).map((d, i) => d.trim() ? `<input class="ans cell" maxlength="1" inputmode="numeric" data-i="${i}">` : '<span></span>').join('')}</div></div>
    <div class="colhint"></div>`;
  const cells = [...el.querySelectorAll('input.cell')], hint = el.querySelector('.colhint'); let wrong = 0;
  const colTxt = i => { const k = W - 1 - i, x = +(A[A.length - 1 - k] || 0), y = +(B[B.length - 1 - k] || 0);
    if (op === '+') { const c = carry[i], s = x + y + c; return `منزلةُ ${['الآحاد', 'العشرات', 'المئات', 'الألوف', 'عشرات الألوف'][k] || ''}: ${fmt(x)} + ${fmt(y)}${c ? ' + ١ (المحمول)' : ''} = ${fmt(s)}${s >= 10 && i > 0 ? ` ← اكتبْ ${fmt(s % 10)} واحملْ ١ إلى المنزلةِ التالية` : ''}`; }
    const top = x - borrow[i]; return `منزلةُ ${['الآحاد', 'العشرات', 'المئات', 'الألوف', 'عشرات الألوف'][k] || ''}: ${borrow[i] ? `أصبحَ ${fmt(x)} بعدَ الاستلاف ${fmt(top)}، ` : ''}${top < y ? `${fmt(top)} أصغرُ من ${fmt(y)} ← أعِدِ التجميع: ${fmt(top + 10)} − ${fmt(y)} = ${fmt(top + 10 - y)}` : `${fmt(top)} − ${fmt(y)} = ${fmt(top - y)}`}`; };
  cells.forEach(c => {
    c.addEventListener('input', () => { const v = toW(c.value).replace(/\D/g, '').slice(-1); c.value = v ? DIG[v] : ''; if (!v) return; const i = +c.dataset.i, ok = v === R.padStart(W, ' ')[i];
      c.classList.toggle('ok', ok); c.classList.toggle('no', !ok);
      if (ok) { if (op === '+' && i > 0 && carry[i]) el.querySelector(`.cy[data-i="${i}"]`).textContent = ''; if (op === '+' && i > 0) { const nx = el.querySelector(`.cy[data-i="${i - 1}"]`); if (nx && carry[i - 1]) nx.textContent = '١'; } if (op === '-' && i > 0 && borrow[i - 1]) { const nx = el.querySelector(`.cy[data-i="${i - 1}"]`); nx.textContent = '−١'; } hint.textContent = ''; const prev = cells[cells.indexOf(c) - 1]; if (prev) prev.focus(); else if (cells.every(x => x.classList.contains('ok'))) { hint.innerHTML = '✓ أحسنت! الناتج ' + M([a, op, b, '=', r]); onDone && onDone(!wrong); } }
      else { wrong++; hint.textContent = '💡 ' + colTxt(i); } });
    c.addEventListener('keydown', e => { if (e.key === 'Backspace' && !c.value) { const nx = cells[cells.indexOf(c) + 1]; nx && nx.focus(); } });
  });
  setTimeout(() => cells[cells.length - 1] && cells[cells.length - 1].focus({ preventScroll: true }), 50);
  return { reveal() { cells.forEach(c => { c.value = DIG[R.padStart(W, ' ')[+c.dataset.i]]; c.classList.add('ok'); }); } };
}
// خطواتُ الضربِ (كما في الكتاب): ضربٌ في الآحادِ ثم العشراتِ ثم الجمع
export function mulSteps(a, b) {
  const B = String(b), parts = []; for (let i = B.length - 1; i >= 0; i--) { const d = +B[i] * 10 ** (B.length - 1 - i); if (d) parts.push(d); }
  const L = parts.map(d => `اضربْ ${M([a, 'x', d, '=', a * d])}`);
  if (parts.length > 1) L.push(`اجمعْ النواتج: ${M([...parts.flatMap((d, i) => i ? ['+', a * d] : [a * d]), '=', a * b])}`);
  return L;
}
// خطواتُ القسمةِ المطوّلة
export function divSteps(a, b) {
  const A = String(a), L = []; let cur = 0, q = '';
  for (let i = 0; i < A.length; i++) { cur = cur * 10 + +A[i]; if (cur < b && !q) { continue; } const d = Math.floor(cur / b); q += d; L.push(i === 0 || q.length === 1 ? `${M([cur, '/', b])} = ${fmt(d)}، و${M([d, 'x', b, '=', d * b])}، والباقي ${fmt(cur - d * b)}` : `ننزلُ ${fmt(+A[i])} فيصبحُ ${fmt(cur)}: ${M([cur, '/', b])} = ${fmt(d)}، والباقي ${fmt(cur - d * b)}`); cur -= d * b; }
  L.push(`إذن ${M([a, '/', b, '=', Math.floor(a / b)])}${cur ? ' والباقي ' + fmt(cur) : ''}، وللتحقّق: ${M([Math.floor(a / b), 'x', b, '=', a - cur])}`);
  return L;
}

/* ───────── مستكشفُ الأنماط: حدودٌ وأقواسُ الفروق ───────── */
// seq: الحدود، known: عددُ المعلوم، mode: 'd' فرقٌ ثابت | 'd2' فرقٌ متزايد | 'r' ضرب
export function patternSVG(seq, known, show, mode = 'd', fmtf = fmt) {
  const n = seq.length, w = Math.min(96, 640 / n), W = n * w + 20, H = 128;
  const x = i => W - 10 - w * i - w / 2; let s = `<svg viewBox="0 0 ${W} ${H}" class="pat">`;
  seq.forEach((v, i) => { const k = i < known || show === 'all'; s += `<rect x="${x(i) - w * .42}" y="14" width="${w * .84}" height="40" rx="10" fill="${k ? '#fff' : '#fff6d8'}" stroke="${k ? '#3a7ae0' : '#e0a020'}" stroke-width="2.5" ${k ? '' : 'stroke-dasharray="6 4"'}/><text x="${x(i)}" y="41" text-anchor="middle" font-size="${w < 70 ? 15 : 19}" fill="#123">${k ? fmtf(v) : '؟'}</text>`; });
  if (show) for (let i = 0; i < n - 1; i++) { if (show !== 'all' && i + 1 >= known && show !== 'next') break; const a = x(i), b = x(i + 1), lab = mode === 'r' ? '×' + fmt(+(seq[i + 1] / seq[i]).toFixed(3)) : (seq[i + 1] - seq[i] >= 0 ? '+' : '−') + fmtf(Math.abs(+(seq[i + 1] - seq[i]).toFixed(3)));
    const vis = i + 1 < known || show === 'all'; s += `<path d="M${a - 8} 60 Q${(a + b) / 2} 98 ${b + 8} 60" fill="none" stroke="${vis ? '#e0603a' : '#ccc'}" stroke-width="2.2" marker-end="url(#ah)"/><text x="${(a + b) / 2}" y="${116}" text-anchor="middle" direction="ltr" font-size="14" fill="${vis ? '#c0401a' : '#aaa'}">${vis ? AR(lab) : '؟'}</text>`; }
  return s.replace('<svg', '<svg').replace('class="pat">', 'class="pat"><defs><marker id="ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="#e0603a"/></marker></defs>') + '</svg>';
}

/* ───────── التمثيلُ بالأعمدة (أفقيّ مثل الكتاب) — المسْ عمودين لترى الفرق ───────── */
export function barChart(el, data, title, unit, onPair) {
  const max = Math.max(...data.map(d => d.v)) * 1.15, W = 600, rowH = 40, H = data.length * rowH + 60;
  const X = v => 150 + v / max * 420;
  el.innerHTML = `<div class="bch"><b>${title}</b><svg viewBox="0 0 ${W} ${H}">${data.map((d, i) => `<g data-b="${i}" style="cursor:pointer"><rect x="0" y="${20 + i * rowH}" width="${W}" height="${rowH}" fill="transparent"/><text x="140" y="${44 + i * rowH}" text-anchor="end" font-size="16" fill="#223">${d.n}</text><rect class="bar" x="150" y="${28 + i * rowH}" width="${X(d.v) - 150}" height="22" rx="4" fill="#e85a4f"/><text x="${X(d.v) + 8}" y="${45 + i * rowH}" font-size="15" fill="#123" direction="ltr">${fmt(d.v)}</text></g>`).join('')}<line x1="150" y1="20" x2="150" y2="${H - 36}" stroke="#556"/><text x="370" y="${H - 10}" text-anchor="middle" font-size="13" fill="#556">${unit}</text></svg><div class="bmsg">المسْ عمودينِ لتقارنَ بينهما.</div></div>`;
  let sel = [];
  el.querySelectorAll('[data-b]').forEach(g => g.onclick = () => { const i = +g.dataset.b; sel = sel.includes(i) ? sel.filter(x => x !== i) : [...sel.slice(-1), i];
    el.querySelectorAll('.bar').forEach((r, k) => r.setAttribute('fill', sel.includes(k) ? '#3a7ae0' : '#e85a4f'));
    const m = el.querySelector('.bmsg'); if (sel.length === 2) { const [p, q] = sel.map(k => data[k]).sort((u, v) => v.v - u.v); m.innerHTML = `الفرقُ بينَ ${p.n} و${q.n}: ${M([p.v, '-', q.v, '=', +(p.v - q.v).toFixed(2)])} ${unit.replace(/[()]/g, '')}`; onPair && onPair(p, q); } else m.textContent = sel.length ? 'اخترْ عمودًا ثانيًا.' : 'المسْ عمودينِ لتقارنَ بينهما.'; });
}

/* ───────── ميزانُ المعادلة: س + أ = ج ───────── */
export function balance(el, a, c, sym = 'س') {
  const x = c - a; let guess = null, removed = false;
  el.innerHTML = `<div class="bal"><svg viewBox="0 0 600 260"></svg><div class="row"><span>جرّبْ قيمةً لـ${sym}:</span>${ansInput('قيمة ' + sym, '150px')}<button class="btn s" data-a="try">ضعْها في الكفّة</button></div>
    <div class="row"><button class="btn" data-a="sub">اطرحْ ${fmt(a)} من الكفّتين ⚖️</button></div><div class="bmsg"></div></div>`;
  const svg = el.querySelector('svg'), msg = el.querySelector('.bmsg');
  function draw() {
    const left = removed ? (guess ?? null) : (guess === null ? null : guess + a), tilt = guess === null ? 0 : Math.max(-9, Math.min(9, ((guess + a) - c) / c * 60));
    const L = removed ? [[sym, '#8a6ad8']] : [[sym, '#8a6ad8'], [fmt(a), '#3a7ae0']], R = removed ? [[fmt(x), '#2f8f6a', removed && guess === null]] : [[fmt(c), '#e0a020']];
    const pan = (cx, items) => items.map((it, i) => `<rect x="${cx - 70}" y="${90 - i * 40 - 32}" width="140" height="34" rx="8" fill="${it[1]}" opacity="${it[2] ? .55 : 1}"/><text x="${cx}" y="${90 - i * 40 - 9}" text-anchor="middle" font-size="18" fill="#fff">${it[0]}</text>`).join('');
    svg.innerHTML = `<rect x="292" y="120" width="16" height="110" fill="#8a7a6a"/><rect x="230" y="228" width="140" height="16" rx="6" fill="#6a5a4a"/>
      <g transform="rotate(${tilt} 300 120)"><rect x="80" y="114" width="440" height="10" rx="5" fill="#6a5a4a"/>
      <g transform="translate(0 30)"><path d="M380 92 h220 l-20 26 h-180z" fill="#c8b890"/>${pan(490, L)}</g>
      <g transform="translate(0 30)"><path d="M0 92 h220 l-20 26 h-180z" fill="#c8b890"/>${pan(110, R)}</g></g>
      <text x="300" y="22" text-anchor="middle" font-size="20" fill="#123">${removed ? `${sym} = ${fmt(x)}` : `${sym} + ${fmt(a)} = ${fmt(c)}`}</text>`;
  }
  el.querySelector('[data-a="try"]').onclick = () => { const v = parseNum(el.querySelector('input').value); if (isNaN(v)) return; guess = v; draw(); msg.innerHTML = v + a === c ? `✓ الكفّتانِ متوازنتان! ${M([v, '+', a, '=', c])} إذن ${sym} = ${fmt(v)}` : v + a > c ? `الكفّةُ اليمنى أثقل: ${M([v, '+', a, '=', v + a])} أكبرُ من ${fmt(c)}. جرّبْ عددًا أصغر.` : `الكفّةُ اليسرى أثقل: ${M([v, '+', a, '=', v + a])} أصغرُ من ${fmt(c)}. جرّبْ عددًا أكبر.`; };
  el.querySelector('input').addEventListener('keydown', e => { if (e.key === 'Enter') el.querySelector('[data-a="try"]').click(); });
  el.querySelector('[data-a="sub"]').onclick = () => { removed = true; guess = null; draw(); msg.innerHTML = `ما نفعلُه في كفّةٍ نفعلُه في الأخرى فيبقى الميزانُ متوازنًا: ${M([sym, '+', a, '-', a, '=', c, '-', a])} ← ${M([sym, '=', x])}`; };
  draw();
}
