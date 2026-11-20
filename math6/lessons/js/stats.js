// أدواتُ الإحصاءِ والتمثيلاتِ البيانيّة (تُستعملُ في الفصلِ الثاني وما بعده)
import { AR, fmt, ansInput, parseNum, parseList, rnd, pick, shuf } from './mathkit.js';
import { $, $$, star, fld, num, mcq, open, ch } from './engine.js';

const COL = ['#e85a4f', '#3a7ae0', '#2f8f4a', '#d07a10', '#8a4ad8', '#1aa3a3', '#c8407a', '#6a8a1a'];
export const sum = a => a.reduce((x, y) => x + y, 0);
export const mean = a => sum(a) / a.length;
export const sorted = a => a.slice().sort((x, y) => x - y);
export const median = a => { const s = sorted(a), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
export const modes = a => { const c = {}; a.forEach(x => c[x] = (c[x] || 0) + 1); const m = Math.max(...Object.values(c)); return m < 2 ? [] : Object.keys(c).filter(k => c[k] === m).map(Number).sort((x, y) => x - y); };
export const range = a => Math.max(...a) - Math.min(...a);
export const counts = a => { const c = {}; a.forEach(x => c[x] = (c[x] || 0) + 1); return c; };
const r2 = v => Math.round(v * 100) / 100;
export function niceStep(max) { return [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000].find(s => max / s <= 8) || Math.ceil(max / 8); }
const esc = s => String(s);
const lab = v => fmt(v);

/* ── رسمُ الأعمدةِ أو الخطوط (SVG) ── */
export function chartSVG(data, o = {}) {
  const kind = o.kind || 'bar', n = data.length, vals = data.map(d => d[1]);
  const step = o.step || niceStep(Math.max(...vals, 1)), max = o.max || Math.ceil(Math.max(...vals, 1) / step) * step, min = o.min || 0;
  const W = 400, L = 46, R = 12, T = o.title ? 30 : 12, long = data.some(d => String(d[0]).length > 6), B = long ? 70 : 40, H = 250 + (long ? 30 : 0);
  const pw = W - L - R, ph = H - T - B, Y = v => T + ph - (v - min) / (max - min) * ph;
  const cx = i => kind === 'line' ? L + pw * (i + .5) / n : L + pw * (n - i - .5) / n;
  let g = '';
  for (let v = min; v <= max + 1e-9; v += step) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ccd" stroke-width="1"/><text x="${L - 5}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#444">${lab(v)}</text>`;
  if (kind === 'line') for (let i = 0; i < n; i++) g += `<line x1="${cx(i)}" x2="${cx(i)}" y1="${T}" y2="${T + ph}" stroke="#e3e3ee"/>`;
  g += `<line x1="${L}" x2="${L}" y1="${T}" y2="${T + ph}" stroke="#333"/><line x1="${L}" x2="${W - R}" y1="${T + ph}" y2="${T + ph}" stroke="#333"/>`;
  const bw = Math.min(46, pw / n * .62);
  data.forEach(([nm, v], i) => {
    const x = cx(i);
    if (v !== null && v !== undefined) {
      if (kind === 'bar') g += `<rect class="cbar" data-i="${i}" x="${x - bw / 2}" y="${Y(Math.max(v, min))}" width="${bw}" height="${Math.max(0, T + ph - Y(Math.max(v, min)))}" fill="${o.color || COL[i % COL.length]}" rx="3"/>` + (o.labels ? `<text x="${x}" y="${Y(v) - 4}" text-anchor="middle" font-size="11" font-weight="700">${lab(v)}</text>` : '');
    }
    g += long ? `<text x="${x}" y="${T + ph + 12}" font-size="10.5" text-anchor="end" transform="rotate(-35 ${x} ${T + ph + 12})">${esc(nm)}</text>` : `<text x="${x}" y="${T + ph + 16}" font-size="11" text-anchor="middle">${esc(nm)}</text>`;
  });
  if (kind === 'line') { const pts = data.map((d, i) => d[1] == null ? null : [cx(i), Y(d[1])]); const P = pts.filter(Boolean); if (P.length > 1) g += `<polyline points="${P.map(p => p.join(',')).join(' ')}" fill="none" stroke="${o.color || '#3a7ae0'}" stroke-width="3"/>`; P.forEach(p => g += `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${o.color || '#3a7ae0'}"/>`); if (o.labels) data.forEach((d, i) => d[1] != null && (g += `<text x="${cx(i)}" y="${Y(d[1]) - 9}" text-anchor="middle" font-size="11" font-weight="700">${lab(d[1])}</text>`)); }
  if (o.title) g += `<text x="${W / 2}" y="18" text-anchor="middle" font-size="13" font-weight="800" fill="#223">${o.title}</text>`;
  if (o.x) g += `<text x="${L + pw / 2}" y="${H - 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#555">${o.x}</text>`;
  if (o.y) g += `<text transform="rotate(-90 12 ${T + ph / 2})" x="12" y="${T + ph / 2}" text-anchor="middle" font-size="11" font-weight="700" fill="#555">${o.y}</text>`;
  return `<svg class="chsvg" style="direction:ltr" viewBox="0 0 ${W} ${H}" data-min="${min}" data-max="${max}" data-t="${T}" data-ph="${ph}" data-l="${L}" data-pw="${pw}" data-n="${n}" data-k="${kind}">${g}</svg>`;
}
export const chartBox = (data, o) => `<div class="chbox">${chartSVG(data, o)}</div>`;

/* ── التمثيلُ بالنقاط ── */
export function dotSVG(vals, o = {}) {
  const min = o.min ?? Math.min(...vals), max = o.max ?? Math.max(...vals), n = max - min, c = counts(vals), hmax = Math.max(1, ...Object.values(c));
  const u = Math.max(16, Math.min(34, 360 / Math.max(n, 1))), W = Math.max(400, n * u + 50), L = 25, H = Math.max(110, hmax * 16 + 70), base = H - 34;
  const X = v => L + (v - min) * u;
  const ev = o.every || (n > 30 ? 5 : n > 15 ? 5 : 1);
  let g = `<line x1="8" x2="${W - 8}" y1="${base}" y2="${base}" stroke="#333" stroke-width="1.6"/><path d="M8 ${base}l8 -5v10zM${W - 8} ${base}l-8 -5v10z" fill="#333"/>`;
  for (let v = min; v <= max; v++) { const big = (v - min) % ev === 0; g += `<line x1="${X(v)}" x2="${X(v)}" y1="${base - (big ? 6 : 4)}" y2="${base + (big ? 6 : 4)}" stroke="#333"/>` + (big || ev === 1 ? `<text x="${X(v)}" y="${base + 20}" font-size="11" text-anchor="middle">${AR(v)}</text>` : ''); }
  Object.entries(c).forEach(([v, k]) => { for (let j = 0; j < k; j++) g += `<text x="${X(+v)}" y="${base - 10 - j * 15}" font-size="15" text-anchor="middle" fill="#2a6ad0" font-weight="700">×</text>`; });
  if (o.title) g += `<text x="${W / 2}" y="16" text-anchor="middle" font-size="13" font-weight="800">${o.title}</text>`;
  return `<div class="dotw"><svg viewBox="0 0 ${W} ${H}" style="direction:ltr;min-width:${Math.min(W, 700)}px">${g}</svg></div>`;
}

/* ── التمثيلُ بالصور ── */
export function pictoHTML(rows, icon, per, title) {
  return `<div class="picto">${title ? `<b>${title}</b>` : ''}${rows.map(([n, v]) => { const k = v / per, f = Math.floor(k), h = k - f; return `<div class="prow"><span class="pn">${n}</span><span class="pi">${icon.repeat(f)}${h ? `<span class="half" style="width:${h}em">${icon}</span>` : ''}</span></div>`; }).join('')}<div class="meta">${icon} = ${AR(per)}</div></div>`;
}

/* ── صانعُ التمثيلِ بالأعمدةِ أو بالخطوط (تفاعليّ) ── */
export function graphMaker(el, o, done) {
  const data = o.data, vals = data.map(d => d[1]), stepOK = o.step || niceStep(Math.max(...vals)), maxOK = Math.ceil(Math.max(...vals) / stepOK) * stepOK;
  const opts = shuf([[maxOK, stepOK], [maxOK - stepOK, stepOK], (() => { const t = [stepOK / 2, stepOK / 5, stepOK / 10].find(x => Number.isInteger(x) && x >= 1 && maxOK / x > 12); return t && Math.random() < .6 ? [maxOK, t] : [maxOK * 5, stepOK * 5]; })()]);
  let max = null, step = null; const cur = data.map(() => null);
  el.innerHTML = `<div class="gm"><div class="q">١) اخترِ التدريجَ المناسب:</div><div class="opts inl gs">${opts.map(([m, s], i) => `<button data-i="${i}">من ٠ إلى ${fmt(m)}، والفترةُ ${fmt(s)}</button>`).join('')}</div><div class="fb gfb"></div><div class="gpl"></div></div>`;
  const fb = $('.gfb', el);
  $$('.gs button', el).forEach(b => b.onclick = () => { const [m, s] = opts[+b.dataset.i]; if (m < Math.max(...vals)) { b.classList.add('no'); fb.innerHTML = 'هذا التدريجُ لا يتّسعُ لأكبرِ قيمة (' + fmt(Math.max(...vals)) + ').'; return; } if (m / s > 12) { b.classList.add('no'); fb.innerHTML = 'الفتراتُ كثيرةٌ جدًّا؛ اخترْ فترةً أكبر.'; return; } if (m > maxOK * 2.5) { b.classList.add('no'); fb.innerHTML = 'التدريجُ كبيرٌ جدًّا؛ ستبدو الأعمدةُ قصيرةً ويصعبُ قراءتُها.'; return; } $$('.gs button', el).forEach(x => x.disabled = true); b.classList.add('ok'); max = m; step = s; fb.innerHTML = '✓ تدريجٌ مناسب.'; plot(); });
  function plot() {
    const pl = $('.gpl', el);
    pl.innerHTML = `<div class="q">٢) ${o.kind === 'line' ? 'المسْ مكانَ كلِّ نقطة (أو اسحبْ) لتمثّلَ القيمة' : 'المسْ أو اسحبْ داخلَ كلِّ عمودٍ لتحديدِ ارتفاعِه'}، ثم اضغطْ «تحقّق».</div><div class="chbox gmc"></div><table class="tb gtb"><tr><th>${o.cat || 'الفئة'}</th>${data.map(d => `<td>${d[0]}</td>`).join('')}</tr><tr><th>القيمة</th>${data.map(d => `<td>${fmt(d[1])}</td>`).join('')}</tr><tr><th>رسمتَ</th>${data.map((d, i) => `<td class="gv${i}">—</td>`).join('')}</tr></table><div class="row"><button class="btn sm" data-a="gchk">تحقّق ✓</button><button class="btn s sm" data-a="gclr">مسح</button></div>`;
    const draw = () => { $('.gmc', el).innerHTML = chartSVG(data.map((d, i) => [d[0], cur[i]]), { kind: o.kind, max, step, title: o.title, labels: true, x: o.x, y: o.y }); bind(); };
    const bind = () => { const sv = $('.gmc svg', el); const A = k => +sv.dataset[k];
      const pick = e => { const r = sv.getBoundingClientRect(), sx = 400 / r.width, x = (e.clientX - r.left) * sx, y = (e.clientY - r.top) * sx; const n = data.length; let i = Math.floor((x - A('l')) / A('pw') * n); if (o.kind !== 'line') i = n - 1 - i; if (i < 0 || i >= n) return; let v = A('min') + (A('t') + A('ph') - y) / A('ph') * (A('max') - A('min')); const snap = step / (step >= 2 ? 4 : 2); v = Math.max(0, Math.min(A('max'), Math.round(v / snap) * snap)); cur[i] = r2(v); $('.gv' + i, el).textContent = fmt(cur[i]); draw(); };
      let down = false; sv.onpointerdown = e => { down = true; sv.setPointerCapture(e.pointerId); pick(e); }; sv.onpointermove = e => down && pick(e); sv.onpointerup = () => down = false; sv.style.touchAction = 'none'; };
    draw();
    $('[data-a="gclr"]', el).onclick = () => { cur.fill(null); data.forEach((d, i) => $('.gv' + i, el).textContent = '—'); draw(); };
    $('[data-a="gchk"]', el).onclick = () => { const tol = step / 4 + 1e-9; const bad = data.map((d, i) => cur[i] === null || Math.abs(cur[i] - d[1]) > tol ? i : -1).filter(i => i >= 0);
      if (!bad.length) { done && done(true); $('.gmc', el).insertAdjacentHTML('afterend', '<div class="fb">✓ تمثيلٌ صحيح! ' + (o.after || '') + '</div>'); $('[data-a="gchk"]', el).disabled = true; }
      else done && done(false, 'راجعْ: ' + bad.map(i => data[i][0]).join('، ') + (bad.some(i => cur[i] === null) ? ' (لم تُرسمْ بعد)' : '')); };
  }
}

/* ── صانعُ التمثيلِ بالنقاط ── */
export function dotMaker(el, o, done) {
  const min = o.min ?? Math.min(...o.data), max = o.max ?? Math.max(...o.data), want = counts(o.data), c = {};
  el.innerHTML = `<div class="q">المسْ فوقَ العددِ على خطِّ الأعدادِ لتضعَ إشارةَ ×، واستعملِ «حذف» لإزالةِ إشارة.</div><div class="row"><button class="btn s sm" data-m="add">➕ إضافة</button><button class="btn s sm" data-m="del">➖ حذف</button><span class="meta dm-n"></span></div><div class="dm"></div><div class="row"><button class="btn sm" data-a="dchk">تحقّق ✓</button></div>`;
  let mode = 'add'; $$('[data-m]', el).forEach(b => b.onclick = () => { mode = b.dataset.m; $$('[data-m]', el).forEach(x => x.classList.toggle('on', x === b)); }); $('[data-m="add"]', el).classList.add('on');
  const draw = () => { const L = []; Object.entries(c).forEach(([v, k]) => { for (let j = 0; j < k; j++) L.push(+v); }); $('.dm', el).innerHTML = dotSVG(L.length ? L : [min], { min, max, title: o.title, every: o.every }).replace(/<text[^>]*>×<\/text>/g, m => L.length ? m : ''); $('.dm-n', el).textContent = `وضعتَ ${AR(L.length)} من ${AR(o.data.length)}`;
    const sv = $('.dm svg', el); sv.onclick = e => { const r = sv.getBoundingClientRect(), vb = sv.viewBox.baseVal, x = (e.clientX - r.left) * vb.width / r.width; const n = max - min, u = Math.max(16, Math.min(34, 360 / Math.max(n, 1))); const v = Math.round((x - 25) / u) + min; if (v < min || v > max) return; c[v] = Math.max(0, (c[v] || 0) + (mode === 'add' ? 1 : -1)); draw(); }; };
  draw();
  $('[data-a="dchk"]', el).onclick = () => { const keys = new Set([...Object.keys(want), ...Object.keys(c)]); const bad = [...keys].filter(k => (want[k] || 0) !== (c[k] || 0)).map(Number).sort((a, b) => a - b); if (!bad.length) { done && done(true); $('[data-a="dchk"]', el).disabled = true; } else done && done(false, 'عددُ الإشاراتِ غيرُ صحيحٍ فوقَ: ' + bad.map(AR).join('، ')); };
}

/* ── الجدولُ التكراريّ بالإشارات ── */
const tallyMarks = k => { let s = ''; for (let i = 0; i < Math.floor(k / 5); i++) s += '<s class="t5">||||</s> '; return s + '|'.repeat(k % 5); };
export function tallyTool(el, o, done) {
  const names = o.names, keys = Object.keys(names), c = {}; keys.forEach(k => c[k] = 0);
  el.innerHTML = `<div class="q">المسْ كلَّ بيانٍ بالترتيب لتسجّلَ إشارتَه في الجدول:</div><div class="tchips">${o.items.map((x, i) => `<button class="tch" data-i="${i}">${o.show ? o.show(x) : x}</button>`).join('')}</div><table class="tb ttb"><tr><th>${o.head || 'النوع'}</th><th>الإشارات</th><th>التكرار</th></tr>${keys.map(k => `<tr><td>${names[k]}</td><td class="tm" data-k="${k}"></td><td class="tc" data-k="${k}"></td></tr>`).join('')}</table><div class="fb"></div>`;
  let n = 0;
  $$('.tch', el).forEach(b => b.onclick = () => { if (b.disabled) return; b.disabled = true; b.classList.add('used'); const k = o.items[+b.dataset.i]; c[k]++; n++; $(`.tm[data-k="${k}"]`, el).innerHTML = tallyMarks(c[k]); $(`.tc[data-k="${k}"]`, el).textContent = AR(c[k]); if (n === o.items.length) { $('.fb', el).innerHTML = '✓ اكتملَ الجدولُ التكراريّ.'; done && done(true); } });
}

/* ── الجدولُ الإلكترونيّ: جدولٌ قابلٌ للتعديلِ يرسمُ تمثيلًا مباشرةً ── */
export function sheetTool(el, o) {
  const rows = o.rows.map(r => r.slice());
  el.innerHTML = `<div class="sheet"><table class="tb sht"><tr><th>⋄</th><th>A</th><th>B</th></tr><tr><th>١</th><td><b>${o.head[0]}</b></td><td><b>${o.head[1]}</b></td></tr></table><div class="row"><button class="btn s sm" data-a="add">➕ صفّ</button><select class="sk"><option value="bar">التمثيلُ بالأعمدة</option><option value="line">التمثيلُ بالخطوط</option></select></div><div class="chbox shc"></div></div>`;
  $('.sk', el).value = o.kind || 'bar';
  const tb = $('.sht', el);
  const draw = () => { const d = rows.filter(r => r[0] !== '' && !isNaN(parseNum(String(r[1])))).map(r => [r[0], parseNum(String(r[1]))]); $('.shc', el).innerHTML = d.length ? chartSVG(d, { kind: $('.sk', el).value, title: o.title, labels: true, x: o.head[0], y: o.head[1] }) : ''; };
  const render = () => { $$('tr.dr', tb).forEach(r => r.remove()); rows.forEach((r, i) => { const tr = document.createElement('tr'); tr.className = 'dr'; tr.innerHTML = `<th>${AR(i + 2)}</th><td><input class="cell" value="${r[0]}"></td><td><input class="cell" inputmode="decimal" value="${typeof r[1] === 'number' ? AR(r[1]) : r[1]}"></td>`; tb.appendChild(tr); const [a, b] = $$('input', tr); a.oninput = () => { rows[i][0] = a.value; draw(); }; b.oninput = () => { rows[i][1] = b.value; draw(); }; }); draw(); };
  $('[data-a="add"]', el).onclick = () => { rows.push(['', '']); render(); }; $('.sk', el).onchange = draw; render();
}

/* ── توزيعُ المكعّباتِ بالتساوي (المتوسّطُ الحسابيّ) ── */
export function levelTool(el, vals, names) {
  let v = vals.slice(), sel = null; const total = sum(vals), n = vals.length;
  el.innerHTML = `<div class="q">المسْ عمودًا لتأخذَ منه مكعّبًا، ثم المسْ عمودًا آخرَ لتضعَه فيه، حتى تتساوى الأعمدة (أو تقتربَ قدرَ الإمكان).</div><div class="lvl"></div><div class="row"><button class="btn s sm" data-a="auto">⚖️ وزّعْ تلقائيًّا</button><button class="btn s sm" data-a="rst">↺ ابدأْ من جديد</button></div><div class="fb"></div>`;
  const draw = () => { $('.lvl', el).innerHTML = v.map((k, i) => `<div class="tw ${sel === i ? 'sel' : ''}" data-i="${i}"><div class="cubes">${'<i></i>'.repeat(k)}</div><b>${AR(k)}</b>${names ? `<span>${names[i]}</span>` : ''}</div>`).join('');
    $$('.tw', el).forEach(t => t.onclick = () => { const i = +t.dataset.i; if (sel === null) { if (v[i] > 0) sel = i; } else { if (i !== sel) { v[sel]--; v[i]++; } sel = null; } draw(); });
    const eq = Math.max(...v) - Math.min(...v) <= (total % n ? 1 : 0); $('.fb', el).innerHTML = eq ? `✓ ${total % n ? 'أقربُ توزيعٍ متساوٍ' : 'تساوتِ الأعمدة'}! المجموعُ ${AR(total)} ÷ ${AR(n)} = <b>${fmt(r2(total / n))}</b> وهو المتوسّطُ الحسابيّ.` : `المجموع = ${AR(total)}، عددُ الأعمدة = ${AR(n)}`; if (eq && !el.dataset.st) { el.dataset.st = 1; star(1, 'وزّعتَ بالتساوي'); } };
  $('[data-a="auto"]', el).onclick = () => { const q = Math.floor(total / n), r = total % n; v = v.map((_, i) => q + (i < r ? 1 : 0)); sel = null; draw(); };
  $('[data-a="rst"]', el).onclick = () => { v = vals.slice(); sel = null; delete el.dataset.st; draw(); };
  draw();
}

/* ── محلّلُ البيانات: الوسيط والمنوال والمدى والمتوسّط (مع القيم المتطرّفة) ── */
export function statTool(el, data) {
  el.innerHTML = `<div class="row">البيانات: <input class="ans" style="width:230px" value="${data.map(AR).join('، ')}" data-kp="list" inputmode="none"><button class="btn s sm" data-a="go">حلّلْ</button></div><div class="meta">المسْ أيَّ عددٍ لاستبعادِه (مثل القيمةِ المتطرّفة) ولاحظْ أثرَه.</div><div class="sbox2"></div>`;
  let D = data.slice(), off = new Set();
  const draw = () => { const S = sorted(D.map((x, i) => [x, i])).length ? D.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x) : []; const A = S.filter(s => !off.has(s.i)).map(s => s.x);
    if (!A.length) { $('.sbox2', el).innerHTML = ''; return; } const n = A.length, md = median(A), mo = modes(A);
    const mid = n % 2 ? [(n - 1) / 2] : [n / 2 - 1, n / 2]; let k = -1;
    $('.sbox2', el).innerHTML = `<div class="schips">${S.map(s => { const on = !off.has(s.i); if (on) k++; return `<button class="sc ${!on ? 'off' : mid.includes(k) && on ? 'mid' : ''} ${on && mo.includes(s.x) ? 'mo' : ''}" data-i="${s.i}">${fmt(s.x)}</button>`; }).join('')}</div>
      <table class="tb"><tr><th>المتوسّطُ الحسابيّ</th><td>${AR(sum(A))} ÷ ${AR(n)} = <b>${fmt(r2(mean(A)))}</b></td></tr><tr><th>الوسيط</th><td><b>${fmt(md)}</b> ${n % 2 ? '(العددُ الأوسط)' : '(متوسّطُ العددينِ الأوسطين)'}</td></tr><tr><th>المنوال</th><td><b>${mo.length ? mo.map(fmt).join('، ') : 'لا يوجد'}</b></td></tr><tr><th>المدى</th><td>${fmt(Math.max(...A))} − ${fmt(Math.min(...A))} = <b>${fmt(r2(range(A)))}</b></td></tr></table>`;
    $$('.sc', el).forEach(b => b.onclick = () => { const i = +b.dataset.i; off.has(i) ? off.delete(i) : off.add(i); draw(); }); };
  $('[data-a="go"]', el).onclick = () => { const L = parseList($('input', el).value).filter(x => !isNaN(x)); if (L.length) { D = L; off = new Set(); draw(); } };
  draw();
}

/* ── أنواعُ أسئلة ── */
export const modeFn = data => { const m = modes(data); return raw => { if (/لا|ليس|-|—/.test(raw)) return m.length ? { ok: false, msg: 'يوجدُ عددٌ يتكرّرُ أكثرَ من غيره.' } : { ok: true }; const L = parseList(raw).filter(x => !isNaN(x)); if (!L.length) return { empty: true, msg: 'اكتبِ المنوال، أو «لا يوجد».' }; const ok = L.length === m.length && sorted(L).every((x, i) => x === m[i]); return ok ? { ok: true } : { ok: false, msg: !m.length ? 'لا يتكرّرُ أيُّ عدد؛ فلا يوجدُ منوال.' : L.length < m.length ? 'يوجدُ أكثرُ من منوال.' : 'المنوالُ هو القيمةُ الأكثرُ تكرارًا.' }; }; };
const MN = { mean: 'المتوسّطُ الحسابيّ', median: 'الوسيط', mode: 'المنوال', range: 'المدى' };
export function msQ(tag, text, data, which = ['median', 'mode', 'range'], o = {}) {
  const s = sorted(data), m = modes(data);
  const F = which.map(w => w === 'mode' ? [MN.mode, 0, 'fn', { fn: modeFn(data), show: m.length ? m.map(fmt).join('، ') : 'لا يوجد', kp: 'list', ph: 'أو: لا يوجد' }] : [MN[w], r2(w === 'mean' ? mean(data) : w === 'median' ? median(data) : range(data))]);
  const sol = [`الترتيب: ${s.map(fmt).join('، ')}`];
  if (which.includes('mean')) sol.push(`المتوسّط = ${AR(sum(data))} ÷ ${AR(data.length)} = ${fmt(r2(mean(data)))}`);
  if (which.includes('median')) sol.push(`الوسيط = ${fmt(median(data))}`);
  if (which.includes('mode')) sol.push(`المنوال: ${m.length ? m.map(fmt).join('، ') : 'لا يوجد'}`);
  if (which.includes('range')) sol.push(`المدى = ${fmt(Math.max(...data))} − ${fmt(Math.min(...data))} = ${fmt(range(data))}`);
  return fld(tag, text, F, { sol, hints: ['رتّبِ البياناتِ من الأصغرِ إلى الأكبرِ أوّلًا.', 'الوسيطُ في المنتصف، والمنوالُ الأكثرُ تكرارًا، والمدى = الأكبر − الأصغر، والمتوسّط = المجموع ÷ العدد.'], skill: which.length === 1 ? which[0] : 'mmr', mount: el => statHelp(el, data), ...o });
}
function statHelp(el, data) { el.innerHTML = '<button class="lnk">🧮 رتّبِ البياناتِ لي</button>'; $('button', el).onclick = () => { el.innerHTML = `<div class="schips">${sorted(data).map(x => `<span class="sc">${fmt(x)}</span>`).join('')}</div>`; }; }
export const meanQ = (tag, text, data, o = {}) => num(tag, text, r2(mean(data)), { sol: [`المجموع = ${data.map(fmt).join(' + ')} = ${fmt(sum(data))}`, `المتوسّط = ${fmt(sum(data))} ÷ ${AR(data.length)} = ${fmt(r2(mean(data)))}`], hints: ['اجمعْ جميعَ القيم.', 'اقسمِ المجموعَ على عددِ القيم.'], skill: 'mean', mistakes: [[sum(data), 'هذا هو المجموع؛ اقسمْه على عددِ القيم.']], ...o });
export const graphTask = (tag, text, data, kind, o = {}) => ({ tag, text, ans: { type: 'task', show: 'تمثيلٌ صحيح', run: (el, cb) => graphMaker(el, { data, kind, title: o.gtitle, x: o.x, y: o.y, cat: o.cat, step: o.step }, cb) }, html: o.html, skill: 'graph', title: o.title, sol: o.sol, hints: o.hints || ['اخترْ تدريجًا يبدأُ من الصفر ويتّسعُ لأكبرِ قيمة.', 'حدّدْ ارتفاعَ كلِّ ' + (kind === 'line' ? 'نقطة' : 'عمود') + ' حسبَ قيمتِه في الجدول.'], ...o.extra });
export const dotTask = (tag, text, data, o = {}) => ({ tag, text, ans: { type: 'task', show: 'تمثيلٌ صحيح', run: (el, cb) => dotMaker(el, { data, min: o.min, max: o.max, title: o.gtitle, every: o.every }, cb) }, html: o.html, skill: 'dot', title: o.title, hints: ['ارسمْ خطَّ أعدادٍ يشملُ أصغرَ قيمةٍ وأكبرَها.', 'ضعْ إشارةَ × فوقَ العددِ في كلِّ مرّةٍ يظهرُ فيها.'], sol: ['التكرارات: ' + Object.entries(counts(data)).map(([v, k]) => `${AR(v)} (${AR(k)})`).join('، ')] });
export const tallyTask = (tag, text, items, names, o = {}) => ({ tag, text, ans: { type: 'task', show: 'جدولٌ تكراريٌّ كامل', run: (el, cb) => tallyTool(el, { items, names, head: o.head }, cb) }, skill: 'tally', title: o.title, sol: [Object.entries(names).map(([k, n]) => `${n}: ${AR(items.filter(x => x === k).length)}`).join('، ')] });
