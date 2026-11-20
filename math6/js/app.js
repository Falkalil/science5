// درسٌ تفاعليّ: ١-١ الخطوات الأربع لحلِّ المسألة — رياضيات الصف السادس (ص ١٠–١٦)
import { AR, fmt, fmtTime, parseNum, parseList, parseTime, rnd, pick, shuf, M, keypad, hideKp, ansInput, column, mulSteps, divSteps, patternSVG, barChart, balance } from './mathkit.js';
import { BOOK, GEN, GEN_NAMES, SK, OPN } from './problems.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = (() => { const K = 'math6-l11'; let d = {}; try { d = JSON.parse(localStorage.getItem(K)) || {}; } catch (e) {} return { get: (k, v) => d[k] ?? v, set: (k, v) => { d[k] = v; try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} } }; })();
keypad();

/* ── النجوم والإتقان ── */
function star(n = 1, why = '') { const s = store.get('stars', 0) + n; store.set('stars', s); const b = $('#stars'); b.textContent = '⭐ ' + AR(s); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); if (why) toast('⭐ +' + AR(n) + ' ' + why); }
function record(skill, ok) { if (!skill) return; const m = store.get('mastery', {}); (m[skill] ||= []).push(ok ? 1 : 0); m[skill] = m[skill].slice(-6); store.set('mastery', m); renderMastery(); }
const mastery = sk => { const a = (store.get('mastery', {})[sk] || []); return a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 100) : -1; };
function renderMastery() { const el = $('#mast'); if (!el) return; el.innerHTML = Object.entries(SK).map(([k, n]) => { const p = mastery(k); return `<div class="ml"><span>${n}</span><div class="mbar"><i style="width:${Math.max(p, 0)}%;background:${p >= 80 ? '#2f8f6a' : p >= 50 ? '#e0a020' : '#e0603a'}"></i></div><b>${p < 0 ? '—' : AR(p) + '٪'}</b>${p >= 80 ? '🏅' : ''}</div>`; }).join(''); }
let toastT; function toast(t) { const e = $('#toast'); e.innerHTML = t; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 2200); }
const pg = p => `<button class="pg" data-go="${p}">📖 ص ${AR(p)}</button>`;

/* ── فحصُ الإجابة ── */
function judge(P, raw) {
  const A = P.ans; if (A.type === 'num') { const v = parseNum(raw); if (isNaN(v)) return { empty: true }; const ok = Math.abs(v - A.v) < 1e-6; const m = !ok && (P.mistakes || []).find(([w]) => Math.abs(w - v) < 1e-6); return { ok, v, msg: m ? m[1] : '' }; }
  if (A.type === 'list') { const L = parseList(raw); if (!L.length || L.some(isNaN)) return { empty: true, msg: 'اكتبِ الأعدادَ مفصولةً بالفاصلة «،».' }; const ok = L.length === A.v.length && L.every((x, i) => Math.abs(x - A.v[i]) < 1e-6); return { ok, msg: !ok && L.length !== A.v.length ? `المطلوبُ ${AR(A.v.length)} أعداد.` : !ok && L[0] === A.v[0] ? 'بدايةٌ صحيحة! راجعِ الحدودَ التالية.' : '' }; }
  if (A.type === 'times') { const L = raw.split(/[،,؛;\s]+/).filter(Boolean).map(parseTime); if (!L.length || L.some(isNaN)) return { empty: true, msg: 'اكتبِ المواعيدَ مثل ١٠:١٠، ١٠:٤٠' }; const ok = L.length === A.v.length && L.every((x, i) => x === A.v[i]); return { ok, msg: !ok && L[0] === A.v[0] ? 'الموعدُ الأوّلُ صحيح! راجعِ البقيّة.' : '' }; }
  return { empty: true };
}
const ansText = A => A.type === 'num' ? fmt(A.v) + (A.unit ? ' ' + A.unit : '') : A.type === 'list' ? A.v.map(v => fmt(v)).join('، ') : A.type === 'times' ? A.v.map(fmtTime).join('، ') : A.type === 'mcq' ? A.opts[A.v] : '';

/* ══════════ بطاقةُ المسألة بالخطوات الأربع ══════════ */
let CUR = null; // المسألةُ الحاليّةُ للمساعد
const OPS = ['add', 'sub', 'mul', 'div', 'pat', 'multi'];
export function problemCard(host, P, opt = {}) {
  const scaffold = (opt.scaffold ?? store.get('scaffold', true)) && P.ans.type !== 'mcq' && P.ans.type !== 'open' && !P.div;
  const S = { P, tries: 0, wrongLast: null, done: false, step: 0 };
  host.innerHTML = `<div class="pc"><div class="ph">${P.tag ? `<span class="ptag">${P.tag}</span>` : ''}<b>${P.title || ''}</b>${P.p ? pg(P.p) : ''}</div><div class="ptext">${P.text}</div>
    ${P.chart ? '<div class="pchart"></div>' : ''}${P.seq ? '<div class="pseq"></div>' : ''}
    <div class="steps"></div><div class="pfoot"><button class="lnk" data-a="hint">💡 تلميح</button>${P.gen ? '<button class="lnk" data-a="similar">🔁 مسألةٌ مشابهة</button>' : ''}${scaffold ? '<button class="lnk" data-a="direct">⚡ أجبْ مباشرة</button>' : ''}</div></div>`;
  const root = host.firstElementChild, steps = $('.steps', root); let hintN = 0;
  root.addEventListener('pointerdown', () => { CUR = S; }, true); CUR = S;
  if (P.chart) barChart($('.pchart', root), P.chart.data.map(([n, v]) => ({ n, v })), P.chart.title, P.chart.unit);
  if (P.seq) { const sq = $('.pseq', root); let show = ''; const draw = () => { sq.innerHTML = patternSVG(P.seq, P.known, show, P.mode || 'd', v => fmt(v, P.dec || String(P.seq[0]).includes('.') || P.id === 'ex2' ? 2 : undefined)) + `<div class="row c"><button class="btn s sm" data-pv="1">${P.mode === 'r' ? '✖️ أظهرِ النسبةَ بينَ الحدود' : '🔍 أظهرِ الفروق'}</button></div>`; $('[data-pv]', sq).onclick = () => { show = show ? '' : 'known'; draw(); }; }; draw(); S.revealSeq = () => { show = 'all'; draw(); }; }
  const add = (cls, html) => { const d = document.createElement('div'); d.className = 'st ' + cls; d.innerHTML = html; steps.appendChild(d); return d; };
  const L4 = { f: ['افهمْ', '#3a7ae0'], k: ['خطّطْ', '#8a4ad8'], h: ['حُلَّ', '#e07a1a'], t: ['تحقّقْ', '#2f8f6a'] };
  const head = k => `<span class="sk" style="background:${L4[k][1]}">${L4[k][0]}</span>`;
  function stepF() { const o = shuf([P.ask, ...(P.askWrong || [])]); const d = add('f', `${head('f')}<div class="q">ما المطلوبُ في هذه المسألة؟</div><div class="opts">${o.map(x => `<button>${x}</button>`).join('')}</div><div class="fb"></div>`);
    $$('.opts button', d).forEach(b => b.onclick = () => { if (d.dataset.ok) return; const ok = b.textContent === P.ask; b.classList.add(ok ? 'ok' : 'no'); if (!ok) { $('.fb', d).textContent = 'اقرأِ السؤالَ الأخيرَ في المسألةِ مرّةً أخرى.'; return; } d.dataset.ok = 1; $('.fb', d).innerHTML = '✓ ' + (P.extra || 'أحسنت، حدّدتَ المطلوب.'); stepK(); }); }
  function stepK() { const o = shuf([P.op, ...shuf(OPS.filter(x => x !== P.op)).slice(0, 3)]); const d = add('k', `${head('k')}<div class="q">ما العمليّةُ أو الخطّةُ المناسبة؟</div><div class="opts g2">${o.map(x => `<button data-op="${x}">${OPN[x]}</button>`).join('')}</div><div class="fb"></div>`);
    $$('.opts button', d).forEach(b => b.onclick = () => { if (d.dataset.ok) return; const ok = b.dataset.op === P.op; b.classList.add(ok ? 'ok' : 'no'); record('op', ok && !d.dataset.miss); if (!ok) { d.dataset.miss = 1; $('.fb', d).textContent = 'فكّرْ في الكلماتِ المفتاحيّة: يزيد، أمثال، كلّ، نمط…'; return; } d.dataset.ok = 1; $('.fb', d).innerHTML = '✓ ' + P.plan; if (P.est) stepE(); else stepH(); }); }
  function stepE() { const d = add('k', `<div class="q">🎯 قدّرِ الإجابةَ قبلَ الحلّ (تقريبيًّا):</div><div class="row">${ansInput('تقديري', '140px')}<button class="btn s sm">تمّ</button></div><div class="fb"></div>`);
    const go = () => { const v = parseNum($('input', d).value); if (isNaN(v)) return; S.est = v; const ok = Math.abs(v - P.ans.v) <= Math.abs(P.ans.v) * .2; $('.fb', d).innerHTML = (ok ? '✓ تقديرٌ جيّد. ' : 'تقديرُك بعيدٌ قليلًا. ') + 'مثال للتقدير: ' + P.est.t; if (!d.dataset.ok) { d.dataset.ok = 1; stepH(); } };
    $('button', d).onclick = go; $('input', d).addEventListener('keydown', e => e.key === 'Enter' && go()); }
  function stepH() {
    const A = P.ans; let inner;
    if (A.type === 'mcq') inner = `<div class="opts">${A.opts.map((o, i) => `<button data-i="${i}">${'أبجد'[i]}) ${o}</button>`).join('')}</div>`;
    else if (A.type === 'open') inner = `<textarea placeholder="أكتبُ إجابتي…"></textarea><button class="btn s sm" data-a="model">قارنْ بالإجابةِ النموذجيّة</button>`;
    else inner = `${P.col ? '<div class="colw"></div>' : ''}<div class="row">${ansInput(A.type === 'list' ? 'مثل: ٢٩، ٣٥، ٤١' : A.type === 'times' ? 'مثل: ١٠:١٠، ١٠:٤٠، ١١:١٠' : 'الإجابة', A.type === 'num' ? '150px' : '260px')}${A.unit ? `<span class="unit">${A.unit}</span>` : ''}<button class="btn sm" data-a="chk">تحقّق ✓</button></div>${P.div || P.mul ? '<button class="lnk" data-a="steps">🧮 أرني خطواتِ الحساب</button><ol class="calc"></ol>' : ''}`;
    const d = add('h', `${scaffold ? head('h') : ''}${inner}<div class="fb"></div>`); S.hEl = d;
    if (A.type === 'mcq') $$('.opts button', d).forEach(b => b.onclick = () => { if (S.done) return; const ok = +b.dataset.i === A.v; b.classList.add(ok ? 'ok' : 'no'); S.tries++; if (ok) finish(d, S.tries === 1); else $('.fb', d).textContent = '✗ حاولْ مرّةً أخرى، واستعملِ التلميح.'; });
    else if (A.type === 'open') $('[data-a="model"]', d).onclick = () => { $('.fb', d).innerHTML = '📝 ' + A.v; if (!S.done) { S.done = true; star(1, 'للتفكيرِ والكتابة'); } };
    else {
      const inp = $('input', d), chk = () => { if (S.done) return; const r = judge(P, inp.value); if (r.empty) { $('.fb', d).textContent = r.msg || 'اكتبْ إجابتَك أوّلًا.'; return; } S.tries++; if (r.ok) { inp.classList.add('ok'); finish(d, S.tries === 1); } else { S.wrongLast = { raw: inp.value, msg: r.msg }; inp.classList.add('no'); setTimeout(() => inp.classList.remove('no'), 600); $('.fb', d).innerHTML = '✗ ' + (r.msg || 'ليستْ صحيحة. راجعْ خطّتَك أو استعملِ التلميح 💡') + (S.tries >= 3 ? ' <button class="lnk" data-a="show">أرني الحلّ</button>' : ''); const sb = $('[data-a="show"]', d); if (sb) sb.onclick = () => { inp.value = ansText(P.ans).replace(/ [^\d٠-٩،:,].*$/, ''); finish(d, false, true); }; } };
      $('[data-a="chk"]', d).onclick = chk; inp.addEventListener('keydown', e => e.key === 'Enter' && chk());
      const st = $('[data-a="steps"]', d); if (st) { const L = P.div ? divSteps(...P.div) : mulSteps(...P.mul); let k = 0; st.onclick = () => { if (k < L.length) { $('.calc', d).insertAdjacentHTML('beforeend', `<li>${L[k++]}</li>`); if (k === L.length) st.remove(); else st.textContent = '🧮 الخطوةُ التالية'; } }; }
      if (P.col) { const w = $('.colw', d); w.innerHTML = '<button class="lnk">✏️ احسبْ عموديًّا</button>'; $('button', w).onclick = () => column(w, P.col[0], P.col[1], P.col[2] === '-' ? '-' : '+', () => { inp.value = AR(P.ans.v); }); }
    }
  }
  function finish(d, first, shown) {
    S.done = true; hideKp(); record(P.skill, first && !shown); if (first && !shown) star(scaffold ? 2 : 1, 'إجابةٌ صحيحة');
    $('.fb', d).innerHTML = (shown ? 'الإجابة: ' : '✓ أحسنت! ') + `<b>${ansText(P.ans)}</b>` + (P.sol ? `<div class="sol">${P.sol.map(s => `<div>${s}</div>`).join('')}</div>` : '');
    S.revealSeq && S.revealSeq();
    if (P.check) add('t', `${scaffold ? head('t') : '✔️ '}${P.check}${S.est !== undefined ? `<div class="meta">تقديرُك كانَ ${fmt(S.est)} والإجابةُ ${ansText(P.ans)} — ${Math.abs(S.est - P.ans.v) <= Math.abs(P.ans.v) * .2 ? 'قريبان؛ الإجابةُ معقولة ✓' : 'بعيدان؛ راجعْ تقديرَك أو حلَّك.'}</div>` : ''}`);
    opt.onDone && opt.onDone(first && !shown);
  }
  $('[data-a="hint"]', root).onclick = () => { const H = P.hints || []; if (!H.length) return; toastIn(root, '💡 ' + H[Math.min(hintN, H.length - 1)] + (hintN >= H.length - 1 && P.sol ? '' : '')); hintN++; };
  const sim = $('[data-a="similar"]', root); if (sim) sim.onclick = () => problemCard(host, GEN[P.gen](store.get('level', 1)), opt);
  const dir = $('[data-a="direct"]', root); if (dir) dir.onclick = () => { problemCard(host, P, { ...opt, scaffold: false }); };
  if (scaffold) stepF(); else stepH();
  S.similar = () => P.gen && problemCard(host, GEN[P.gen](store.get('level', 1)), opt);
  return S;
}
function toastIn(root, t) { let h = $('.hintbox', root); if (!h) { h = document.createElement('div'); h.className = 'hintbox'; $('.pfoot', root).before(h); } h.innerHTML = t; }

/* ══════════ التبويبات ══════════ */
const TABS = [['تهيئة', '🧭', 'التهيئة', tabReady], ['استعدّ', '📿', 'استعدّ', tabBeads], ['الخطوات', '🪜', 'الخطوات الأربع', tabSteps], ['أمثلة', '🧩', 'أمثلة محلولة', tabExamples], ['تدرّب', '✍️', 'تدرّب وحلّ المسائل', tabPractice], ['∞', '♾️', 'أمثلة بلا حدود', tabInfinite], ['الكتاب', '📖', 'صفحات الكتاب', tabBook]];
let tab = store.get('tab', 0);
function go(t) { tab = t; store.set('tab', t); $$('#tabs button').forEach((b, i) => b.classList.toggle('on', i === t)); const m = $('#main'); m.innerHTML = ''; window.scrollTo(0, 0); TABS[t][3](m); }
$('#tabs').innerHTML = TABS.map((t, i) => `<button data-t="${i}"><span>${t[1]}</span>${t[2]}</button>`).join('');
$$('#tabs button').forEach(b => b.onclick = () => go(+b.dataset.t));
document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { bookPage = +g.dataset.go; go(6); } });

/* ── ١. التهيئة (ص ١٠–١١) ── */
function tabReady(m) {
  m.innerHTML = `<div class="card"><span class="tag">الفصل ١ — الجبر: الأنماط العددية والدوال ${pg(10)}</span><h2>🌟 الفكرةُ العامّة</h2><p>أكتبُ عباراتٍ ومعادلاتٍ رياضيّة، وأستعملُ المتغيّراتِ لتمثيلِ الأعداد.</p>
    <h3>🏟️ الربطُ بالحياة: مدرّجاتُ استادِ الملكِ فهدٍ الدوليّ</h3><p>تتّسعُ المدرّجاتُ لـ ٧٠٠٠٠ متفرّجٍ تقريبًا. حضرَ مباراةً ٣٥٣٥٨ متفرّجًا. نستعملُ المعادلة ${M(['س', '+', 35358, '=', 70000])} لإيجادِ عددِ المقاعدِ الخالية <b>س</b>.</p>
    <p class="meta">جرّبْ قيمًا لـ س على الميزان، أو اطرحِ العددَ نفسَه من الكفّتين:</p><div id="bal"></div></div>
    <div class="card"><h2>📝 اختبارٌ سريع ${pg(11)}</h2><p class="meta">المسْ أيَّ تمرينٍ لتحلَّه. الجمعُ والطرحُ عموديًّا رقمًا رقمًا، والضربُ والقسمةُ مع خطواتِ الحلّ. واضغطْ 🔁 لتمارينَ جديدةٍ بلا حدود.</p><div id="rq"></div></div>`;
  balance($('#bal', m), 35358, 70000);
  const SET = { add: [[129, 83], [99, 56], [67, 42], [79, 88], [78, 97], [86, 66]], sub: [[43, 7], [75, 27], [128, 34], [150, 68], [102, 76], [235, 126]], mul: [[12, 25], [30, 18], [15, 42], [34, 27], [16, 50], [22, 47]], div: [[72, 9], [84, 6], [126, 3], [146, 2], [208, 4], [504, 8]] };
  const NM = { add: ['أوجدْ ناتجَ الجمع', '+', 1], sub: ['أوجدْ ناتجَ الطرح', '-', 7], mul: ['أوجدْ ناتجَ الضرب', 'x', 14], div: ['أوجدْ ناتجَ القسمة', '/', 20] };
  const rq = $('#rq', m), done = store.get('readyDone', {});
  const genOne = k => k === 'add' ? [rnd(20, 400), rnd(20, 99)] : k === 'sub' ? (() => { const a = rnd(40, 400); return [a, rnd(5, a - 5)]; })() : k === 'mul' ? [rnd(11, 45), rnd(11, 50)] : (() => { const b = rnd(2, 9); return [b * rnd(8, 70), b]; })();
  function render() {
    rq.innerHTML = Object.entries(SET).map(([k, L]) => `<div class="rsec"><div class="rh"><b>${NM[k][0]}</b> <button class="lnk" data-new="${k}">🔁 تمارينُ جديدة</button></div><div class="rgrid">${L.map(([a, b], i) => `<button class="rit ${done[k + a + b] ? 'ok' : ''}" data-k="${k}" data-i="${i}"><span class="num">${AR(NM[k][2] + i)}</span>${M([a, NM[k][1], b])}</button>`).join('')}</div><div class="rwork" data-w="${k}"></div></div>`).join('') +
      `<div class="rsec"><div id="r13"></div></div>`;
    $$('[data-new]', rq).forEach(b => b.onclick = () => { SET[b.dataset.new] = Array.from({ length: 6 }, () => genOne(b.dataset.new)); render(); });
    $$('.rit', rq).forEach(b => b.onclick = () => { $$('.rit', rq).forEach(x => x.classList.remove('sel')); b.classList.add('sel'); const k = b.dataset.k, [a, c] = SET[k][+b.dataset.i], w = $(`[data-w="${k}"]`, rq); $$('.rwork', rq).forEach(x => x !== w && (x.innerHTML = ''));
      const fin = ok => { done[k + a + c] = 1; store.set('readyDone', done); b.classList.add('ok'); if (ok) star(1); };
      if (k === 'add' || k === 'sub') column(w, a, c, k === 'add' ? '+' : '-', fin);
      else { const r = k === 'mul' ? a * c : a / c; w.innerHTML = `<div class="row">${M([a, NM[k][1], c, '='])} ${ansInput('؟', '120px')}<button class="btn sm">تحقّق</button></div><button class="lnk">🧮 أرني الخطوات</button><ol class="calc"></ol><div class="fb"></div>`;
        const inp = $('input', w), chk = () => { const v = parseNum(inp.value); if (isNaN(v)) return; if (v === r) { inp.classList.add('ok'); $('.fb', w).innerHTML = '✓ ' + M([a, NM[k][1], c, '=', r]); fin(!w.dataset.miss); } else { w.dataset.miss = 1; inp.classList.add('no'); setTimeout(() => inp.classList.remove('no'), 600); $('.fb', w).textContent = k === 'div' && v * c !== a ? `✗ تحقّقْ بالضرب: ${AR(v)} × ${AR(c)} = ${AR(v * c)} وليس ${AR(a)}` : '✗ حاولْ مرّةً أخرى أو اطلبِ الخطوات.'; } };
        $('.btn', w).onclick = chk; inp.addEventListener('keydown', e => e.key === 'Enter' && chk()); inp.focus();
        const L = k === 'mul' ? mulSteps(a, c) : divSteps(a, c); let j = 0; const sb = $('.lnk', w); sb.onclick = () => { if (j < L.length) $('.calc', w).insertAdjacentHTML('beforeend', `<li>${L[j++]}</li>`); if (j >= L.length) sb.remove(); else sb.textContent = '🧮 الخطوةُ التالية'; }; }
      w.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    problemCard($('#r13', rq), { id: 'r13w', p: 11, tag: '١٣', title: 'كتب', skill: 'multi', op: 'multi', text: 'اشترى سلطانُ ثلاثةَ كتبٍ ثمنُها ٨٩ ريالًا. إذا كانَ ثمنُ أحدِ الكتبِ ٢٤ ريالًا، وثمنُ كتابٍ آخرَ ٣١ ريالًا، فما ثمنُ الكتابِ الثالث؟', ask: 'ثمنُ الكتابِ الثالث', askWrong: ['ثمنُ الكتبِ الثلاثة', 'ثمنُ الكتابينِ معًا'], plan: 'نجمعُ ثمنَ الكتابينِ ثم نطرحُ من ٨٩.', ans: { type: 'num', v: 34, unit: 'ريال' }, sol: [M([24, '+', 31, '=', 55]), M([89, '-', 55, '=', 34])], check: `${M([24, '+', 31, '+', 34, '=', 89])} ✓`, mistakes: [[65, 'طرحتَ ثمنَ كتابٍ واحدٍ فقط (٨٩ − ٢٤).'], [58, 'طرحتَ ثمنَ كتابٍ واحدٍ فقط (٨٩ − ٣١).'], [144, 'جمعتَ كلَّ الأعداد؛ ٨٩ هو الثمنُ الكلّيّ.']], hints: ['ما ثمنُ الكتابينِ المعروفين معًا؟', 'اطرحْ ٥٥ من ٨٩.'], gen: 'multi' });
  }
  render();
}

/* ── ٢. استعدّ: قلادةُ الخرز (ص ١٢) ── */
function tabBeads(m) {
  const U = ['P', 'Y', 'P', 'P', 'Y', 'P', 'P', 'P', 'Y', 'P', 'P', 'P', 'P', 'Y'];
  m.innerHTML = `<div class="card"><span class="tag">استعدّ ${pg(12)}</span><h2>📿 حِرَفٌ يدويّة</h2><p>تعملُ سميرةُ ٨ قلاداتٍ باستعمالِ حبّاتِ الخرز، حيثُ يتطلّبُ عملُ القلادةِ الواحدةِ <b>تكرارَ النمطِ أدناه أربعَ مرّات</b>.</p>
    <p class="meta">المسْ الحبّاتِ لتعدَّها 👆</p><div id="bead"></div><div class="row c"><span class="pill pp">🟣 <b id="cP">٠</b></span><span class="pill py">🟡 <b id="cY">٠</b></span><button class="btn s sm" id="bR">↺ صفّر العدّ</button></div>
    <div class="sl">عددُ مرّاتِ تكرارِ النمط: <input type="range" id="bN" min="1" max="4" value="1"><b id="bNv">١</b></div><div id="neck"></div></div>
    <div id="bq1"></div><div id="bq2"></div><div id="bq3"></div>`;
  const cnt = { P: 0, Y: 0 }, tapped = new Set();
  const beadSVG = (n, small) => { let s = '', x = 20; const r = small ? 9 : 17, gap = small ? 20 : 38, W = U.length * n * gap + 40; for (let k = 0; k < n; k++) U.forEach((c, i) => { const id = k * U.length + i; s += `<circle data-b="${id}" cx="${x}" cy="${30 + Math.sin(id / 2) * (small ? 4 : 8)}" r="${r}" fill="url(#g${c})" stroke="${tapped.has(id) && !small ? '#123' : 'none'}" stroke-width="3" style="cursor:pointer"/>${tapped.has(id) && !small ? `<text x="${x}" y="${36 + Math.sin(id / 2) * 8}" text-anchor="middle" font-size="14" fill="#fff">✓</text>` : ''}`; x += gap; });
    return `<svg viewBox="0 0 ${W} 60" class="beads"><defs><radialGradient id="gP" cx=".35" cy=".35"><stop offset="0" stop-color="#b8a0f0"/><stop offset="1" stop-color="#5a3aa8"/></radialGradient><radialGradient id="gY" cx=".35" cy=".35"><stop offset="0" stop-color="#fff6a0"/><stop offset="1" stop-color="#e0b000"/></radialGradient></defs><path d="M10 30 Q${W / 2} 60 ${W - 10} 30" stroke="#333" fill="none" stroke-width="2"/>${s}</svg>`; };
  const draw = () => { $('#bead', m).innerHTML = beadSVG(1); $$('#bead [data-b]', m).forEach(c => c.onclick = () => { const id = +c.dataset.b; if (tapped.has(id)) return; tapped.add(id); cnt[U[id]]++; $('#cP', m).textContent = AR(cnt.P); $('#cY', m).textContent = AR(cnt.Y); draw(); if (tapped.size === U.length) toast('عددتَ النمطَ كلَّه: ١٠ بنفسجيّة و٤ صفراء'); }); };
  draw(); $('#bR', m).onclick = () => { tapped.clear(); cnt.P = cnt.Y = 0; $('#cP', m).textContent = $('#cY', m).textContent = '٠'; draw(); };
  const neck = () => { const n = +$('#bN', m).value; $('#bNv', m).textContent = AR(n); $('#neck', m).innerHTML = `<div class="scroll">${beadSVG(n, true)}</div><table class="tb"><tr><th>تكرارُ النمط</th>${[1, 2, 3, 4].map(k => `<td class="${k === n ? 'hl' : ''}">${AR(k)}</td>`).join('')}</tr><tr><th>🟣 بنفسجيّة</th>${[1, 2, 3, 4].map(k => `<td class="${k === n ? 'hl' : ''}">${k <= n ? AR(10 * k) : '؟'}</td>`).join('')}</tr><tr><th>🟡 صفراء</th>${[1, 2, 3, 4].map(k => `<td class="${k === n ? 'hl' : ''}">${k <= n ? AR(4 * k) : '؟'}</td>`).join('')}</tr></table>`; };
  $('#bN', m).oninput = neck; neck();
  problemCard($('#bq1', m), { id: 'b1', p: 12, tag: '١', title: 'قلادةٌ واحدة', skill: 'mul', op: 'mul', text: 'ما عددُ كلٍّ من حبّاتِ الخرزِ البنفسجيّةِ والصفراءِ المستعملةِ لعملِ قلادةٍ واحدة؟ (اكتبْ عددَ البنفسجيّةِ ثم الصفراء)', ask: 'عددُ حبّاتِ كلِّ لونٍ في قلادةٍ واحدة', askWrong: ['عددُ الحبّاتِ في النمطِ مرّةً واحدة', 'عددُ القلادات'], plan: 'في النمطِ ١٠ بنفسجيّة و٤ صفراء، والقلادةُ = النمطُ × ٤.', ans: { type: 'list', v: [40, 16] }, sol: [M([10, 'x', 4, '=', 40]) + ' بنفسجيّة', M([4, 'x', 4, '=', 16]) + ' صفراء'], check: 'حرّكِ المؤشّرَ إلى ٤ لترى الجدول ✓', hints: ['عُدَّ حبّاتِ النمطِ أوّلًا: ١٠ بنفسجيّة و٤ صفراء.', 'اضربْ كلَّ عددٍ في ٤، واكتبِ الإجابةَ هكذا: ٤٠، ١٦'] }, { scaffold: true });
  problemCard($('#bq2', m), { id: 'b2', p: 12, tag: '٢', title: 'ثماني قلادات', skill: 'mul', op: 'mul', text: 'ما عددُ كلٍّ من حبّاتِ الخرزِ البنفسجيّةِ والصفراءِ لعملِ ثماني قلادات؟ (البنفسجيّة ثم الصفراء)', ask: 'عددُ حبّاتِ كلِّ لونٍ في ٨ قلادات', askWrong: ['عددُ الحبّاتِ في قلادةٍ واحدة', 'عددُ مرّاتِ تكرارِ النمط'], plan: 'نضربُ ما في القلادةِ الواحدةِ في ٨.', est: null, ans: { type: 'list', v: [320, 128] }, sol: [M([40, 'x', 8, '=', 320]) + ' بنفسجيّة', M([16, 'x', 8, '=', 128]) + ' صفراء'], check: `أو: ${M([10, 'x', 32, '=', 320])} لأنّ النمطَ يتكرّرُ ٨ × ٤ = ٣٢ مرّة ✓`, hints: ['في القلادةِ الواحدةِ ٤٠ بنفسجيّة و١٦ صفراء.', 'اضربْ كلًّا منهما في ٨.'] }, { scaffold: true });
  problemCard($('#bq3', m), { id: 'b3', p: 12, tag: '٣', title: 'اشرحْ', skill: 'op', op: 'mul', text: 'اشرحْ طريقةَ إيجادِ عددِ حبّاتِ الخرزِ لكلِّ لونٍ لعملِ ثماني قلادات.', ans: { type: 'open', v: 'أعدُّ حبّاتِ كلِّ لونٍ في النمطِ الواحد (١٠ بنفسجيّة، ٤ صفراء)، ثم أضربُ في ٤ لأحصلَ على القلادةِ الواحدة (٤٠ و١٦)، ثم أضربُ في ٨ قلادات (٣٢٠ و١٢٨). ويمكنُ أيضًا ضربُ عددِ النمطِ مباشرةً في ٣٢ = ٤ × ٨.' } });
}

/* ── ٣. الخطوات الأربع (ص ١٢–١٣) ── */
function tabSteps(m) {
  const ST = [['افهمْ', '#3a7ae0', '🔎', ['اقرأِ المسألةَ بعناية.', 'ما معطياتُ المسألة؟', 'ما المطلوبُ إيجادُه؟', 'هل المعطياتُ كافية؟', 'هل هناك معلوماتٌ زائدة؟']], ['خطّطْ', '#8a4ad8', '🗺️', ['كيف ترتبطُ الحقائقُ بعضُها ببعض؟', 'اخترْ خطّةً لحلِّ المسألة.', 'قدّرِ الإجابة.']], ['حُلَّ', '#e07a1a', '✏️', ['استعملْ خطّتَك لحلِّ المسألة.', 'إذا لم تنجحْ خطّتُك، فراجعْها أو اخترْ خطّةً أخرى.', 'ما الحلّ؟']], ['تحقّقْ', '#2f8f6a', '✅', ['أعِدْ قراءةَ المسألة.', 'هل تتّفقُ إجابتُك مع معطياتِ المسألة؟', 'هل إجابتُك قريبةٌ من تقديرِك؟', 'هل إجابتُك معقولة؟', 'إذا لم يتحقّقْ ذلك، فاخترْ خطّةً أخرى.']]];
  const KW = [['زائد، جمع', 'add'], ['مجموع', 'add'], ['أضف', 'add'], ['و، مع، إجمالي', 'add'], ['ناقص', 'sub'], ['الفرق', 'sub'], ['يزيد على، يقلّ عن', 'sub'], ['اطرح من، كم بقي', 'sub'], ['عدد مرّات', 'mul'], ['ناتج ضرب', 'mul'], ['مضروبًا في', 'mul'], ['مضاعف', 'mul'], ['مقسومٌ على', 'div'], ['توزيعٌ إلى', 'div']];
  m.innerHTML = `<div class="card"><span class="tag">مفهوم ${pg(12)}</span><h2>🪜 يعتمدُ حلُّ المسألةِ على أربعِ خطوات</h2><p class="meta">المسْ كلَّ خطوةٍ لتقلبَها وتقرأَ أسئلتَها.</p><div class="four">${ST.map(([n, c, e, L], i) => `<div class="flip" data-f="${i}"><div class="fi"><div class="ff" style="background:${c}"><span>${e}</span><b>${AR(i + 1)}. ${n}</b></div><div class="fbk" style="border-color:${c}"><b style="color:${c}">${n}</b><ul>${L.map(x => `<li>${x}</li>`).join('')}</ul></div></div></div>`).join('')}</div>
    <div class="note">💡 <b>معقوليّةُ الإجابة:</b> يمكنُك أن تتحقّقَ من معقوليّةِ الإجابةِ بمقارنتِها بالتقديرِ في الخطوةِ الأخيرةِ للخطّة.</div></div>
    <div class="card"><h2>🧩 رتّبِ الخطوات</h2><p class="meta">المسِ الخطواتِ بترتيبِها الصحيح:</p><div class="opts g2" id="ord"></div><div class="fb" id="ordF"></div></div>
    <div class="card"><span class="tag">${pg(13)}</span><h2>🔑 الكلماتُ المفتاحيّة</h2><p>تكونُ بعضُ المسائلِ سهلةَ الحلّ إذا تعرّفْتَ العمليّةَ المستعملةَ فيها. المسْ كلمةً ثم المسِ العمليّةَ المناسبة:</p>
      <div class="kw" id="kwW"></div><div class="bins">${[['add', 'الجمع', '+'], ['sub', 'الطرح', '−'], ['mul', 'الضرب', '×'], ['div', 'القسمة', '÷']].map(([k, n, s]) => `<div class="bin" data-bin="${k}"><b><i>${s}</i> ${n}</b><div class="in"></div></div>`).join('')}</div><div class="fb" id="kwF"></div></div>`;
  $$('.flip', m).forEach(f => f.onclick = () => f.classList.toggle('on'));
  let k = 0; $('#ord', m).innerHTML = shuf(ST.map((s, i) => [s[0], i])).map(([n, i]) => `<button data-i="${i}">${n}</button>`).join('');
  $$('#ord button', m).forEach(b => b.onclick = () => { if (b.classList.contains('ok')) return; if (+b.dataset.i === k) { b.classList.add('ok'); b.textContent = AR(k + 1) + '. ' + b.textContent; k++; if (k === 4) { $('#ordF', m).textContent = '✓ افهمْ ← خطّطْ ← حُلَّ ← تحقّقْ'; star(1, 'رتّبتَ الخطوات'); } } else { b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); } });
  let sel = null, ok = 0, miss = 0; const W = shuf(KW);
  $('#kwW', m).innerHTML = W.map(([w], i) => `<button data-w="${i}">${w}</button>`).join('');
  $$('#kwW button', m).forEach(b => b.onclick = () => { if (b.classList.contains('used')) return; $$('#kwW button', m).forEach(x => x.classList.toggle('sel', x === b)); sel = b; });
  $$('.bin', m).forEach(bn => bn.onclick = () => { if (!sel) { $('#kwF', m).textContent = 'اخترْ كلمةً أوّلًا.'; return; } const [w, op] = W[+sel.dataset.w]; if (op === bn.dataset.bin) { $('.in', bn).insertAdjacentHTML('beforeend', `<span>${w}</span>`); sel.classList.add('used'); sel.classList.remove('sel'); sel = null; ok++; $('#kwF', m).textContent = '✓'; if (ok === W.length) { $('#kwF', m).textContent = '🌟 صنّفتَ كلَّ الكلماتِ المفتاحيّة!'; star(miss ? 1 : 3, 'الكلماتُ المفتاحيّة'); record('op', !miss); } } else { miss++; sel.classList.add('no'); setTimeout(() => sel && sel.classList.remove('no'), 400); $('#kwF', m).textContent = `✗ «${w}» لا تدلُّ على ${bn.querySelector('b').textContent.slice(2)}.`; } });
}

/* ── ٤. أمثلةٌ محلولة خطوةً بخطوة (ص ١٣–١٤) ── */
function tabExamples(m) {
  m.innerHTML = `<div class="card"><p>في كلِّ مثال: <b>توقّعْ</b> الخطوةَ قبلَ أن تراها، ثم اضغطْ «الخطوةُ التالية». واضغطْ <b>«مثالٌ مشابه»</b> لتحصلَ على مثالٍ جديدٍ بأرقامٍ أخرى — بلا حدود.</p></div><div id="w1"></div><div id="c1"></div><div id="w2"></div><div id="c2"></div>`;
  worked($('#w1', m), BOOK.ex1); problemCard($('#c1', m), BOOK.cfuA); worked($('#w2', m), BOOK.ex2); problemCard($('#c2', m), BOOK.cfuB);
}
function worked(host, P) {
  const steps = [['افهمْ', '#3a7ae0', `المطلوب: <b>${P.ask}</b>.${P.extra ? ' ' + P.extra : ''}`, { q: 'ما المطلوب؟', o: shuf([P.ask, ...P.askWrong]), a: P.ask }],
    ['خطّطْ', '#8a4ad8', P.plan + (P.est ? `<div>التقدير: ${P.est.t}</div>` : ''), { q: 'أيُّ عمليّةٍ أو خطّة؟', o: shuf([OPN[P.op], ...shuf(Object.values(OPN).filter(x => x !== OPN[P.op])).slice(0, 2)]), a: OPN[P.op] }],
    ['حُلَّ', '#e07a1a', P.sol.join('<br>') + `<div>الإجابة: <b>${ansText(P.ans)}</b></div>`, { q: 'ما الناتج؟ (اكتبْه)', input: true }], ['تحقّقْ', '#2f8f6a', P.check, null]];
  let k = 0;
  host.innerHTML = `<div class="pc worked"><div class="ph"><span class="ptag">${P.tag || 'مثال'}</span><b>${P.title}</b>${P.p ? pg(P.p) : ''}<button class="lnk" data-a="sim" style="margin-inline-start:auto">🔁 مثالٌ مشابه</button></div><div class="ptext">${P.text}</div>${P.chart ? '<div class="pchart"></div>' : ''}${P.seq ? `<div class="pseq">${patternSVG(P.seq, P.known, '', P.mode || 'd', v => fmt(v, P.id === 'ex2' || P.dec ? 2 : undefined))}</div>` : ''}<div class="wsteps"></div><div class="row c"><button class="btn" data-a="next">الخطوةُ التالية ←</button></div></div>`;
  if (P.chart) barChart($('.pchart', host), P.chart.data.map(([n, v]) => ({ n, v })), P.chart.title, P.chart.unit);
  const box = $('.wsteps', host), nb = $('[data-a="next"]', host);
  function reveal() { const [n, c, body] = steps[k]; box.insertAdjacentHTML('beforeend', `<div class="ws"><span class="sk" style="background:${c}">${n}</span><div>${body}</div></div>`); if (n === 'حُلَّ' && P.seq) $('.pseq', host).innerHTML = patternSVG(P.seq, P.known, 'all', P.mode || 'd', v => fmt(v, P.id === 'ex2' || P.dec ? 2 : undefined)); k++; nb.textContent = k < 4 ? 'الخطوةُ التالية ←' : '✓ انتهى المثال'; nb.disabled = k >= 4; if (k >= 4) star(1, 'تابعتَ المثال'); }
  nb.onclick = () => { if (k >= 4) return; const pr = steps[k][3]; if (!pr) return reveal();
    const d = document.createElement('div'); d.className = 'ws pred'; d.innerHTML = `<span class="sk" style="background:${steps[k][1]}">${steps[k][0]}</span><div><b>🤔 توقّعْ:</b> ${pr.q}${pr.input ? `<div class="row">${ansInput('توقّعي', '150px')}<button class="btn sm">تحقّق</button><button class="lnk" data-skip>تخطَّ</button></div>` : `<div class="opts">${pr.o.map(o => `<button>${o}</button>`).join('')}</div>`}<div class="fb"></div></div>`; box.appendChild(d); nb.disabled = true;
    const done = () => { d.remove(); nb.disabled = false; reveal(); };
    if (pr.input) { const inp = $('input', d), chk = () => { const r = judge(P, inp.value); if (r.empty) return; if (r.ok) { star(1); $('.fb', d).textContent = '✓ صحيح!'; setTimeout(done, 700); } else { $('.fb', d).innerHTML = '✗ ' + (r.msg || 'ليستْ صحيحة؛ حاولْ مرّةً أخرى أو تخطَّ.'); } }; $('.btn', d).onclick = chk; inp.addEventListener('keydown', e => e.key === 'Enter' && chk()); $('[data-skip]', d).onclick = done; }
    else $$('.opts button', d).forEach(b => b.onclick = () => { const ok = b.textContent === pr.a; b.classList.add(ok ? 'ok' : 'no'); if (ok) setTimeout(done, 500); else $('.fb', d).textContent = 'فكّرْ مرّةً أخرى.'; }); };
  $('[data-a="sim"]', host).onclick = () => worked(host, GEN[P.gen](store.get('level', 1)));
}

/* ── ٥. تدرّبْ وحلَّ المسائل (ص ١٤–١٦) ── */
function tabPractice(m) {
  const G = [['✅ تأكّدْ', 14, ['t1', 't2']], ['✍️ تدرّبْ، وحلَّ المسائل', 15, ['t3', 't4', 't5', 't6', 't7', 't8']], ['🧠 مسائلُ مهاراتِ التفكيرِ العليا', 16, ['t9', 't10']], ['📝 تدريبٌ على اختبار', 16, ['t11', 't12']], ['➗ الاستعدادُ للدرسِ اللاحق', 16, ['r13', 'r14', 'r15', 'r16']]];
  const sv = store.get('solved', {});
  m.innerHTML = `<div class="card row" style="justify-content:space-between"><label class="sw"><input type="checkbox" id="scf" ${store.get('scaffold', true) ? 'checked' : ''}> 🪜 الحلُّ بالخطواتِ الأربع</label><span class="meta">المسْ أيَّ مسألةٍ لتفتحَها</span></div>` +
    G.map(([n, p, ids]) => `<div class="card"><h2>${n} ${pg(p)}</h2>${ids.map(id => `<div class="pli"><button class="plh" data-id="${id}"><span class="ptag">${BOOK[id].tag}</span> ${BOOK[id].title} <i>${sv[id] ? '✅' : '▾'}</i></button><div class="plb" id="pb-${id}"></div></div>`).join('')}</div>`).join('');
  $('#scf', m).onchange = e => store.set('scaffold', e.target.checked);
  $$('.plh', m).forEach(b => b.onclick = () => { const id = b.dataset.id, body = $('#pb-' + id, m); if (body.innerHTML) { body.innerHTML = ''; return; } problemCard(body, BOOK[id], { onDone: ok => { sv[id] = 1; store.set('solved', sv); $('i', b).textContent = '✅'; } }); body.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
}

/* ── ٦. أمثلةٌ بلا حدود ── */
function tabInfinite(m) {
  const L = store.get('level', 1); let type = store.get('gtype', 'all'), streak = 0;
  m.innerHTML = `<div class="card"><h2>♾️ أمثلةٌ بلا حدود</h2><p class="meta">مسائلُ جديدةٌ بأرقامٍ مختلفةٍ في كلِّ مرّة، على نمطِ مسائلِ الدرس.</p>
    <div class="lv">${[['🟢', 'دعم', 'أعدادٌ أصغر'], ['🔵', 'أساسي', 'مثل الكتاب'], ['🟣', 'إثراء', 'أعدادٌ أكبر وأنماطٌ أصعب']].map((x, i) => `<button data-lv="${i}" class="${i === L ? 'on' : ''}">${x[0]} ${x[1]}<small>${x[2]}</small></button>`).join('')}</div>
    <div class="row"><span>النوع:</span><select id="gT"><option value="all">🎲 كلُّ الأنواع</option>${Object.entries(GEN_NAMES).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select><label class="sw"><input type="checkbox" id="scf2" ${store.get('scaffold', true) ? 'checked' : ''}> 🪜 بالخطواتِ الأربع</label></div>
    <div class="row c"><span class="pill">🔥 متتالية: <b id="stk">٠</b></span></div></div><div id="gp"></div><div class="row c"><button class="btn" id="gN">مسألةٌ جديدة ←</button></div>
    <div class="card"><h2>📊 تقدّمي في مهاراتِ الدرس</h2><div id="mast"></div><p class="meta">تُحسبُ من آخرِ ٦ محاولاتٍ في كلِّ مهارة. 🏅 = إتقان (٨٠٪ فأكثر).</p></div>`;
  $('#gT', m).value = type; renderMastery();
  const next = () => { const k = type === 'all' ? pick(Object.keys(GEN)) : type; problemCard($('#gp', m), GEN[k](store.get('level', 1)), { onDone: ok => { streak = ok ? streak + 1 : 0; $('#stk', m).textContent = AR(streak); if (streak && streak % 5 === 0) star(3, `${AR(streak)} إجاباتٍ صحيحةٍ متتالية!`); } }); };
  $$('.lv button', m).forEach(b => b.onclick = () => { store.set('level', +b.dataset.lv); $$('.lv button', m).forEach(x => x.classList.toggle('on', x === b)); next(); });
  $('#gT', m).onchange = e => { type = e.target.value; store.set('gtype', type); next(); };
  $('#scf2', m).onchange = e => { store.set('scaffold', e.target.checked); next(); };
  $('#gN', m).onclick = next; next();
}

/* ── ٧. صفحاتُ الكتاب ── */
let bookPage = 12;
function tabBook(m) {
  m.innerHTML = `<div class="book"><div class="bnav"><button class="btn s sm" data-d="-1">→ السابقة</button><b id="bpn"></b><button class="btn s sm" data-d="1">التالية ←</button></div><div class="bimg"><img id="bimg" alt="صفحة من الكتاب"></div><div class="thumbs">${[10, 11, 12, 13, 14, 15, 16].map(p => `<button data-p="${p}">${AR(p)}</button>`).join('')}</div></div>`;
  const show = () => { $('#bimg', m).src = `pages/${bookPage}.webp`; $('#bpn', m).textContent = 'صفحة ' + AR(bookPage); $$('.thumbs button', m).forEach(b => b.classList.toggle('on', +b.dataset.p === bookPage)); };
  $$('[data-d]', m).forEach(b => b.onclick = () => { bookPage = Math.max(10, Math.min(16, bookPage + +b.dataset.d)); show(); });
  $$('.thumbs button', m).forEach(b => b.onclick = () => { bookPage = +b.dataset.p; show(); });
  let x0 = null; $('.bimg', m).addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); $('.bimg', m).addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) { bookPage = Math.max(10, Math.min(16, bookPage + (dx > 0 ? 1 : -1))); show(); } x0 = null; });
  show();
}

/* ══════════ مساعدُ الرياضيّات (إجاباتٌ مدمجة) ══════════ */
const bot = $('#bot');
$('#botBtn').onclick = () => { bot.classList.toggle('open'); if (bot.classList.contains('open')) botHome(); };
$('#botX').onclick = () => bot.classList.remove('open');
function say(html, who = 'a') { const b = $('#botLog'); b.insertAdjacentHTML('beforeend', `<div class="m ${who}">${html}</div>`); b.scrollTop = b.scrollHeight; }
function botHome() { $('#botLog').innerHTML = ''; say(CUR ? `أنا معك في مسألة: <b>${CUR.P.title || CUR.P.tag}</b>. ماذا تحتاج؟` : 'افتحْ أيَّ مسألةٍ ثم اطلبْ مساعدتي، أو اخترْ من الأسفل.'); }
$$('#botQ button').forEach(b => b.onclick = () => { const q = b.dataset.q, P = CUR && CUR.P; say(b.textContent, 'u');
  if (q === 'steps') return say('<b>الخطواتُ الأربع:</b><br>١. <b>افهمْ</b>: ما المعطيات؟ وما المطلوب؟<br>٢. <b>خطّطْ</b>: اخترِ العمليّةَ أو الخطّة، وقدّرِ الإجابة.<br>٣. <b>حُلَّ</b>: نفّذِ الخطّة.<br>٤. <b>تحقّقْ</b>: هل الإجابةُ معقولةٌ وقريبةٌ من التقدير؟');
  if (q === 'kw') return say('<b>الكلماتُ المفتاحيّة:</b><br>➕ مجموع، أضف، إجمالي<br>➖ الفرق، يزيد على، يقلّ عن، كم بقي<br>✖️ عدد مرّات، أمثال، لكلّ، ناتج ضرب<br>➗ مقسوم على، توزيع، في الدقيقةِ الواحدة<br>🔁 «إذا استمرَّ النمط» ← ابحثْ عن نمط');
  if (!P) return say('افتحْ مسألةً أوّلًا من تبويبِ «تدرّب» أو «أمثلة بلا حدود».');
  if (q === 'hint') { CUR.hk = (CUR.hk || 0); const H = P.hints || ['ابدأْ بتحديدِ المطلوب.']; say('💡 ' + H[Math.min(CUR.hk, H.length - 1)]); CUR.hk++; return; }
  if (q === 'plan') return say('🗺️ ' + (P.plan || 'حدّدِ العمليّةَ المناسبةَ من الكلماتِ المفتاحيّة.'));
  if (q === 'sol') return say('<b>الحلُّ خطوةً بخطوة:</b><br>' + (P.plan ? '• ' + P.plan + '<br>' : '') + (P.sol || []).map(s => '• ' + s).join('<br>') + (P.ans.type !== 'open' ? `<br>✅ الإجابة: <b>${ansText(P.ans)}</b>` : '<br>' + P.ans.v));
  if (q === 'err') { const w = CUR.wrongLast; return say(w ? `إجابتُك كانت «${w.raw}». ${w.msg || 'لم أجدْ خطأً شائعًا مطابقًا؛ راجعِ العمليّةَ ثم الحسابَ خطوةً خطوة، وقارنْ بتقديرِك.'}` : 'لم تُدخلْ إجابةً خاطئةً بعد في هذه المسألة 👍'); }
  if (q === 'sim') { if (!P.gen) return say('لا يوجدُ مولّدٌ لهذه المسألة.'); CUR.similar(); bot.classList.remove('open'); toast('🔁 مسألةٌ مشابهةٌ جديدة'); } });

/* ── وضعُ العرض ── */
$('#present').onclick = () => { document.body.classList.toggle('present'); const on = document.body.classList.contains('present'); $('#present').textContent = on ? '✕ إنهاءُ العرض' : '🖥️ وضعُ العرض'; try { on ? document.documentElement.requestFullscreen() : document.fullscreenElement && document.exitFullscreen(); } catch (e) {} };
$('#stars').textContent = '⭐ ' + AR(store.get('stars', 0));
go(tab);
