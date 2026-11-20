// المحرّك: بطاقةُ المسألة (الخطوات الأربع + أنواعُ الإجابات)، الأمثلةُ المحلولة، أدواتُ التأليف
import { AR, fmt, fmtTime, parseNum, parseList, parseTime, shuf, M, ansInput, hideKp, column, mulSteps, divSteps, patternSVG, barChart } from './mathkit.js';
import { evalExpr, R, steps, parseFrac, simplest, parsePF, primeFactors, isPrime, sameExpr, fr, mixed } from './algebra.js';

export const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const store = (() => { const K = 'math6-book'; let d = {}; try { d = JSON.parse(localStorage.getItem(K)) || {}; } catch (e) {} return { get: (k, v) => d[k] ?? v, set: (k, v) => { d[k] = v; try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} } }; })();
export const OPN = { add: 'جمع', sub: 'طرح', mul: 'ضرب', div: 'قسمة', pat: 'البحث عن نمط', multi: 'أكثر من عملية', eq: 'كتابة معادلة وحلّها', table: 'إنشاء جدول', guess: 'التخمين والتحقّق', list: 'إنشاء قائمة منظّمة' };
const OPKEYS = ['add', 'sub', 'mul', 'div', 'pat', 'multi'];
export const pg = p => p ? `<button class="pg" data-go="${p}">📖 ص ${AR(p)}</button>` : '';
let toastT; export function toast(t) { const e = $('#toast'); if (!e) return; e.innerHTML = t; e.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => e.classList.remove('show'), 2200); }
export function star(n = 1, why = '') { const s = store.get('stars', 0) + n; store.set('stars', s); const b = $('#stars'); if (b) { b.textContent = '⭐ ' + AR(s); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); } if (why) toast('⭐ +' + AR(n) + ' ' + why); }
export const CTX = { lesson: null, cur: null, onRecord: null };
export function record(skill, ok) { if (!skill) return; const key = (CTX.lesson ? CTX.lesson.id + ':' : '') + skill; const m = store.get('mastery', {}); (m[key] ||= []).push(ok ? 1 : 0); m[key] = m[key].slice(-6); store.set('mastery', m); CTX.onRecord && CTX.onRecord(); }
export function mastery(key) { const a = store.get('mastery', {})[key] || []; return a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 100) : -1; }
function markSolved(P) { if (!CTX.lesson || !P.id) return; const s = store.get('solved', {}); (s[CTX.lesson.id] ||= {})[P.id] = 1; store.set('solved', s); }
export const isSolved = (lid, pid) => !!((store.get('solved', {})[lid] || {})[pid]);

/* ═════════ فحصُ الإجابات ═════════ */
const KP = { num: 'num', list: 'list', times: 'time', frac: 'frac', expr: 'expr', pf: 'pf', fn: 'list' };
export function judgeOne(A, raw, P = {}) {
  raw = String(raw || '').trim(); if (!raw) return { empty: true };
  const t = A.type;
  if (t === 'num') { const v = parseNum(raw); if (isNaN(v) || /[\/^×÷+]/.test(raw.replace(/^-/, ''))) return { empty: true, msg: 'اكتبِ الناتجَ عددًا واحدًا.' }; const ok = Math.abs(v - A.v) < 1e-6 * Math.max(1, Math.abs(A.v)); const m = !ok && (P.mistakes || []).find(([w]) => Math.abs(w - v) < 1e-6); return { ok, v, msg: m ? m[1] : (!ok && A.unitHint ? A.unitHint : '') }; }
  if (t === 'list') { const L = parseList(raw); if (!L.length || L.some(isNaN)) return { empty: true, msg: 'اكتبِ الأعدادَ مفصولةً بالفاصلة «،».' }; let a = L, b = A.v.slice(); if (A.unordered) { a = L.slice().sort((x, y) => x - y); b = b.sort((x, y) => x - y); } const ok = a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-6); return { ok, msg: !ok && L.length !== A.v.length ? `المطلوبُ ${AR(A.v.length)} ${A.v.length > 2 ? 'أعداد' : 'عددان'}.` : '' }; }
  if (t === 'times') { const L = raw.split(/[،,؛;\s]+/).filter(Boolean).map(parseTime); if (!L.length || L.some(isNaN)) return { empty: true, msg: 'اكتبِ المواعيدَ مثل ١٠:١٠، ١٠:٤٠' }; const ok = L.length === A.v.length && L.every((x, i) => x === A.v[i]); return { ok, msg: !ok && L[0] === A.v[0] ? 'الموعدُ الأوّلُ صحيح! راجعِ البقيّة.' : '' }; }
  if (t === 'frac') { const f = parseFrac(raw); if (!f) return { empty: true, msg: 'اكتبِ الكسرَ هكذا: ٣/٤ ، والعددَ الكسريَّ هكذا: ١ ٣/٤' }; const want = parseFrac(A.v); const eq = Math.abs(f.v - want.v) < 1e-9;
    if (!eq) { const m = (P.mistakes || []).find(([w]) => { const g = parseFrac(w); return g && Math.abs(g.v - f.v) < 1e-9; }); return { ok: false, msg: m ? m[1] : '' }; }
    if (A.simplest !== false && !simplest(f)) return { ok: false, msg: f.mixed && f.n >= f.d ? 'الكسرُ في العددِ الكسريِّ يجبُ أن يكونَ أصغرَ من ١.' : 'القيمةُ صحيحة، لكن اكتبْها في <b>أبسطِ صورة</b> (اقسمِ البسطَ والمقامَ على القاسمِ المشتركِ الأكبر).' };
    if (A.form === 'mixed' && !f.mixed && !f.whole && f.n > f.d) return { ok: false, msg: 'القيمةُ صحيحة، والمطلوبُ كتابتُها <b>عددًا كسريًّا</b> (مثل ٢ ١/٣).' };
    if (A.form === 'improper' && f.mixed) return { ok: false, msg: 'القيمةُ صحيحة، والمطلوبُ كتابتُها <b>كسرًا غيرَ فعليّ</b> (مثل ٧/٣).' };
    if (A.form === 'dec' && !f.whole) return { ok: false, msg: 'المطلوبُ كتابتُه كسرًا عشريًّا.' };
    return { ok: true }; }
  if (t === 'expr') { let ok = false; try { ok = sameExpr(raw, A.v); } catch (e) { return { empty: true, msg: 'تأكّدْ من كتابةِ العبارة.' }; } const m = !ok && (P.mistakes || []).find(([w]) => sameExpr(raw, w)); return { ok, msg: m ? m[1] : '' }; }
  if (t === 'pf') { const f = parsePF(raw); if (!f) return { empty: true, msg: 'اكتبِ العواملَ مثل: ٢ × ٢ × ٣ أو ٢^٢ × ٣' }; const want = primeFactors(A.v); const prod = f.reduce((x, y) => x * y, 1); const ok = f.length === want.length && f.every((x, i) => x === want[i]);
    return { ok, msg: ok ? '' : prod === A.v && f.some(x => !isPrime(x)) ? 'حاصلُ الضربِ صحيح، لكنّ بعضَ العواملِ ليستْ أوّليّة؛ حلّلْها أكثر.' : prod !== A.v ? `حاصلُ ضربِ عواملِك ${AR(prod)} وليس ${AR(A.v)}.` : '' }; }
  if (t === 'fn') return A.fn(raw);
  if (t === 'text') { const n = s => s.replace(/[ً-ْـ\s]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي'); const ok = [].concat(A.v).some(x => n(x) === n(raw)); return { ok }; }
  return { empty: true };
}
export function ansText(A) {
  const t = A.type; if (t === 'num') return fmt(A.v) + (A.unit ? ' ' + A.unit : ''); if (t === 'list') return A.v.map(v => fmt(v)).join('، ') + (A.unit ? ' ' + A.unit : ''); if (t === 'times') return A.v.map(fmtTime).join('، ');
  if (t === 'mcq' || t === 'choice') return A.opts[A.v]; if (t === 'frac') { const f = parseFrac(A.v); return f.mixed ? mixed(f.w, f.n, f.d) : f.whole ? AR(A.v) : fr(f.n, f.d); }
  if (t === 'expr') return R(A.v); if (t === 'pf') return R(A.show || primeFactors(A.v).join('×')); if (t === 'text') return [].concat(A.v)[0]; if (t === 'fn') return A.show || ''; if (t === 'fields') return A.fields.map(f => `${f.label}: ${ansText(f)}`).join('، '); return '';
}
const PH = { num: 'الإجابة', list: 'مثل: ٢٩، ٣٥، ٤١', times: 'مثل: ١٠:١٠، ١٠:٤٠', frac: 'مثل: ٣/٤ أو ١ ١/٢', expr: 'مثل: ن + ٣', pf: 'مثل: ٢ × ٢ × ٣', text: 'الإجابة' };
const W = { num: '150px', list: '260px', times: '260px', frac: '150px', expr: '200px', pf: '230px', text: '200px' };

/* ═════════ بطاقةُ المسألة ═════════ */
export function problemCard(host, P, opt = {}) {
  const A = P.ans, canScaffold = P.ask && P.op && !['mcq', 'open', 'choice', 'fields'].includes(A.type);
  const scaffold = canScaffold && (opt.scaffold ?? store.get('scaffold', true));
  const S = { P, tries: 0, wrongLast: null, done: false };
  host.innerHTML = `<div class="pc"><div class="ph">${P.tag ? `<span class="ptag">${P.tag}</span>` : ''}${P.title ? `<b>${P.title}</b>` : ''}${pg(P.p)}</div><div class="ptext">${P.text}</div>
    ${P.html || ''}${P.chart ? '<div class="pchart"></div>' : ''}${P.seq ? '<div class="pseq"></div>' : ''}<div class="pmount"></div>
    <div class="steps"></div><div class="pfoot">${P.hints && P.hints.length ? '<button class="lnk" data-a="hint">💡 تلميح</button>' : ''}${P.gen && opt.gen ? '<button class="lnk" data-a="similar">🔁 مسألةٌ مشابهة</button>' : ''}${scaffold ? '<button class="lnk" data-a="direct">⚡ أجبْ مباشرة</button>' : ''}</div></div>`;
  const root = host.firstElementChild, stepsEl = $('.steps', root); let hintN = 0;
  root.addEventListener('pointerdown', () => { CTX.cur = S; }, true); CTX.cur = S;
  if (P.chart) barChart($('.pchart', root), P.chart.data.map(([n, v]) => ({ n, v })), P.chart.title, P.chart.unit);
  if (P.mount) P.mount($('.pmount', root));
  if (P.seq) { const sq = $('.pseq', root); let show = ''; const fm = v => fmt(v, P.dec); const draw = () => { sq.innerHTML = patternSVG(P.seq, P.known, show, P.mode || 'd', fm) + `<div class="row c"><button class="btn s sm" data-pv="1">${P.mode === 'r' ? '✖️ أظهرِ النسبةَ بينَ الحدود' : '🔍 أظهرِ الفروق'}</button></div>`; $('[data-pv]', sq).onclick = () => { show = show ? '' : 'known'; draw(); }; }; draw(); S.revealSeq = () => { show = 'all'; draw(); }; }
  const add = (cls, html) => { const d = document.createElement('div'); d.className = 'st ' + cls; d.innerHTML = html; stepsEl.appendChild(d); return d; };
  const L4 = { f: ['افهمْ', '#3a7ae0'], k: ['خطّطْ', '#8a4ad8'], h: ['حُلَّ', '#e07a1a'], t: ['تحقّقْ', '#2f8f6a'] };
  const head = k => `<span class="sk" style="background:${L4[k][1]}">${L4[k][0]}</span>`;
  function stepF() { const o = shuf([P.ask, ...(P.askWrong || [])]); const d = add('f', `${head('f')}<div class="q">ما المطلوبُ في هذه المسألة؟</div><div class="opts">${o.map(x => `<button>${x}</button>`).join('')}</div><div class="fb"></div>`);
    $$('.opts button', d).forEach(b => b.onclick = () => { if (d.dataset.ok) return; const ok = b.textContent === P.ask; b.classList.add(ok ? 'ok' : 'no'); if (!ok) { $('.fb', d).textContent = 'اقرأِ السؤالَ الأخيرَ في المسألةِ مرّةً أخرى.'; return; } d.dataset.ok = 1; $('.fb', d).innerHTML = '✓ ' + (P.extra || 'أحسنت، حدّدتَ المطلوب.'); stepK(); }); }
  function stepK() { const pool = P.opsChoices || OPKEYS; const o = shuf([P.op, ...shuf(pool.filter(x => x !== P.op)).slice(0, 3)]); const d = add('k', `${head('k')}<div class="q">ما العمليّةُ أو الخطّةُ المناسبة؟</div><div class="opts g2">${o.map(x => `<button data-op="${x}">${OPN[x]}</button>`).join('')}</div><div class="fb"></div>`);
    $$('.opts button', d).forEach(b => b.onclick = () => { if (d.dataset.ok) return; const ok = b.dataset.op === P.op; b.classList.add(ok ? 'ok' : 'no'); record('op', ok && !d.dataset.miss); if (!ok) { d.dataset.miss = 1; $('.fb', d).textContent = 'فكّرْ في الكلماتِ المفتاحيّةِ في المسألة.'; return; } d.dataset.ok = 1; $('.fb', d).innerHTML = '✓ ' + (P.plan || ''); if (P.est) stepE(); else stepH(); }); }
  function stepE() { const d = add('k', `<div class="q">🎯 قدّرِ الإجابةَ قبلَ الحلّ (تقريبيًّا):</div><div class="row">${ansInput('تقديري', '140px')}<button class="btn s sm">تمّ</button></div><div class="fb"></div>`);
    const go = () => { const v = parseNum($('input', d).value); if (isNaN(v)) return; S.est = v; const ok = Math.abs(v - A.v) <= Math.abs(A.v) * .2; $('.fb', d).innerHTML = (ok ? '✓ تقديرٌ جيّد. ' : 'تقديرُك بعيدٌ قليلًا. ') + (P.est.t ? 'مثالٌ للتقدير: ' + P.est.t : ''); if (!d.dataset.ok) { d.dataset.ok = 1; stepH(); } };
    $('button', d).onclick = go; $('input', d).addEventListener('keydown', e => e.key === 'Enter' && go()); }
  function inputFor(a, i = '') { return `${ansInput(a.ph || PH[a.type] || 'الإجابة', a.w || W[a.type] || '150px', a.kp || KP[a.type] || 'num').replace('<input', `<input data-f="${i}"`)}${a.unit && a.type !== 'list' ? `<span class="unit">${a.unit}</span>` : ''}`; }
  function stepH() {
    let inner;
    if (A.type === 'mcq' || A.type === 'choice') inner = `<div class="opts ${A.type === 'choice' ? 'inl' : ''}">${A.opts.map((o, i) => `<button data-i="${i}">${A.type === 'mcq' ? 'أبجد'[i] + ') ' : ''}${o}</button>`).join('')}</div>`;
    else if (A.type === 'open') inner = `<textarea placeholder="أكتبُ إجابتي…"></textarea><button class="btn s sm" data-a="model">قارنْ بالإجابةِ النموذجيّة</button>`;
    else if (A.type === 'fields') inner = A.fields.map((f, i) => `<div class="row fld"><b>${f.label}</b>${inputFor(f, i)}</div>`).join('') + '<div class="row"><button class="btn sm" data-a="chk">تحقّق ✓</button></div>';
    else inner = `${P.col ? '<div class="colw"></div>' : ''}<div class="row">${inputFor(A)}<button class="btn sm" data-a="chk">تحقّق ✓</button></div>`;
    if (P.calc || P.div || P.mul) inner += '<button class="lnk" data-a="steps">🧮 أرني خطواتِ الحساب</button><ol class="calc"></ol>';
    const d = add('h', `${scaffold ? head('h') : ''}${inner}<div class="fb"></div>`);
    const fb = $('.fb', d);
    if (A.type === 'mcq' || A.type === 'choice') $$('.opts button', d).forEach(b => b.onclick = () => { if (S.done) return; const ok = +b.dataset.i === A.v; b.classList.add(ok ? 'ok' : 'no'); S.tries++; if (ok) finish(d, S.tries === 1); else { S.wrongLast = { raw: b.textContent, msg: (P.mistakes || []).find(([w]) => w === +b.dataset.i)?.[1] }; fb.innerHTML = '✗ ' + (S.wrongLast.msg || 'حاولْ مرّةً أخرى، واستعملِ التلميح.'); } });
    else if (A.type === 'open') $('[data-a="model"]', d).onclick = () => { fb.innerHTML = '📝 ' + A.v; if (!S.done) { S.done = true; markSolved(P); star(1, 'للتفكيرِ والكتابة'); opt.onDone && opt.onDone(true); } };
    else {
      const inps = $$('input.ans', d);
      const chk = () => { if (S.done) return; let all = true, any = false, msgs = [];
        if (A.type === 'fields') { A.fields.forEach((f, i) => { const inp = inps[i]; if (inp.classList.contains('ok')) return; const r = judgeOne(f, inp.value, P); if (r.empty) { all = false; if (r.msg) msgs.push(r.msg); return; } any = true; if (r.ok) inp.classList.add('ok'), inp.readOnly = true; else { all = false; inp.classList.add('no'); setTimeout(() => inp.classList.remove('no'), 600); msgs.push(`${f.label}: ${r.msg || 'راجعْها.'}`); } }); if (!any && !all) { fb.innerHTML = msgs[0] || 'اكتبْ إجاباتِك أوّلًا.'; return; } S.tries++; if (all) return finish(d, S.tries === 1); S.wrongLast = { raw: inps.map(x => x.value).join('، '), msg: msgs.join(' ') }; fb.innerHTML = '✗ ' + msgs.join('<br>'); return; }
        const inp = inps[0], r = judgeOne(A, inp.value, P); if (r.empty) { fb.innerHTML = r.msg || 'اكتبْ إجابتَك أوّلًا.'; return; }
        S.tries++; if (r.ok) { inp.classList.add('ok'); finish(d, S.tries === 1); return; }
        S.wrongLast = { raw: inp.value, msg: r.msg }; inp.classList.add('no'); setTimeout(() => inp.classList.remove('no'), 600);
        fb.innerHTML = '✗ ' + (r.msg || 'ليستْ صحيحة. راجعْ حلَّك أو استعملِ التلميح 💡') + (S.tries >= 3 ? ' <button class="lnk" data-a="show">أرني الحلّ</button>' : '');
        const sb = $('[data-a="show"]', d); if (sb) sb.onclick = () => finish(d, false, true); };
      $('[data-a="chk"]', d).onclick = chk; inps.forEach(inp => inp.addEventListener('keydown', e => e.key === 'Enter' && chk()));
      if (P.col) { const w = $('.colw', d); w.innerHTML = '<button class="lnk">✏️ احسبْ عموديًّا</button>'; $('button', w).onclick = () => column(w, P.col[0], P.col[1], P.col[2] === '-' ? '-' : '+', () => { inps[0].value = AR(A.v); }); }
    }
    const st = $('[data-a="steps"]', d); if (st) { const L = P.calc ? steps(P.calc).map((x, i) => (i ? '= ' : '') + x) : P.div ? divSteps(...P.div) : mulSteps(...P.mul); let k = 0; st.onclick = () => { if (k < L.length) $('.calc', d).insertAdjacentHTML('beforeend', `<li>${L[k++]}</li>`); if (k >= L.length) st.remove(); else st.textContent = '🧮 الخطوةُ التالية'; }; }
  }
  function finish(d, first, shown) {
    S.done = true; hideKp(); record(P.skill, first && !shown); if (!shown) markSolved(P); if (first && !shown) star(scaffold ? 2 : 1, 'إجابةٌ صحيحة');
    const sol = P.sol || (P.calc ? [steps(P.calc).map((x, i) => (i ? '= ' : '') + x).join(' ')] : null);
    $('.fb', d).innerHTML = (shown ? 'الإجابة: ' : '✓ أحسنت! ') + `<b>${ansText(A)}</b>` + (sol ? `<div class="sol">${sol.map(s => `<div>${s}</div>`).join('')}</div>` : '');
    S.revealSeq && S.revealSeq();
    if (P.check) add('t', `${scaffold ? head('t') : '✔️ '}${P.check}${S.est !== undefined ? `<div class="meta">تقديرُك كانَ ${fmt(S.est)} والإجابةُ ${ansText(A)} — ${Math.abs(S.est - A.v) <= Math.abs(A.v) * .2 ? 'قريبان؛ الإجابةُ معقولة ✓' : 'بعيدان؛ راجعْ تقديرَك أو حلَّك.'}</div>` : ''}`);
    opt.onDone && opt.onDone(first && !shown);
  }
  const hb = $('[data-a="hint"]', root); if (hb) hb.onclick = () => { const H = P.hints; let h = $('.hintbox', root); if (!h) { h = document.createElement('div'); h.className = 'hintbox'; $('.pfoot', root).before(h); } h.innerHTML = '💡 ' + H[Math.min(hintN, H.length - 1)]; hintN++; };
  const sim = $('[data-a="similar"]', root); if (sim) sim.onclick = () => problemCard(host, opt.gen(), opt);
  const dir = $('[data-a="direct"]', root); if (dir) dir.onclick = () => problemCard(host, P, { ...opt, scaffold: false });
  if (scaffold) stepF(); else stepH();
  S.similar = opt.gen ? () => problemCard(host, opt.gen(), opt) : null;
  return S;
}

/* ═════════ المثالُ المحلولُ خطوةً بخطوة ═════════ */
// P.ws = [[عنوان، محتوى، سؤالُ توقّعٍ اختياريّ {o:[...], a} | {num:v} ]]
export function worked(host, P, opt = {}) {
  const C = ['#3a7ae0', '#8a4ad8', '#e07a1a', '#2f8f6a', '#c0401a', '#1a8aa0'];
  let W = P.ws; if (!W) W = [['افهمْ', `المطلوب: <b>${P.ask}</b>.${P.extra ? ' ' + P.extra : ''}`, P.askWrong ? { o: shuf([P.ask, ...P.askWrong]), a: P.ask } : null], ['خطّطْ', P.plan + (P.est ? `<div>التقدير: ${P.est.t}</div>` : ''), P.op ? { o: shuf([OPN[P.op], ...shuf(OPKEYS.filter(x => x !== P.op)).slice(0, 2).map(x => OPN[x])]), a: OPN[P.op] } : null], ['حُلَّ', (P.sol || []).join('<br>') + `<div>الإجابة: <b>${ansText(P.ans)}</b></div>`, ['num', 'list', 'frac', 'expr'].includes(P.ans.type) ? { ans: P.ans } : null], ['تحقّقْ', P.check || '']].filter(s => s[1]);
  let k = 0;
  host.innerHTML = `<div class="pc worked"><div class="ph"><span class="ptag">${P.tag || 'مثال'}</span>${P.title ? `<b>${P.title}</b>` : ''}${pg(P.p)}${opt.gen ? '<button class="lnk" data-a="sim" style="margin-inline-start:auto">🔁 مثالٌ مشابه</button>' : ''}</div><div class="ptext">${P.text}</div>${P.html || ''}${P.chart ? '<div class="pchart"></div>' : ''}<div class="pmount"></div>${P.seq ? `<div class="pseq">${patternSVG(P.seq, P.known, '', P.mode || 'd', v => fmt(v, P.dec))}</div>` : ''}<div class="wsteps"></div><div class="row c"><button class="btn" data-a="next">${W.length ? 'الخطوةُ الأولى ←' : ''}</button></div></div>`;
  if (P.chart) barChart($('.pchart', host), P.chart.data.map(([n, v]) => ({ n, v })), P.chart.title, P.chart.unit);
  if (P.mount) P.mount($('.pmount', host));
  const box = $('.wsteps', host), nb = $('[data-a="next"]', host);
  function reveal() { const [n, body] = W[k]; box.insertAdjacentHTML('beforeend', `<div class="ws"><span class="sk" style="background:${C[k % C.length]}">${n}</span><div>${body}</div></div>`); if (P.seq && k === W.length - 1) $('.pseq', host).innerHTML = patternSVG(P.seq, P.known, 'all', P.mode || 'd', v => fmt(v, P.dec)); k++; nb.textContent = k < W.length ? 'الخطوةُ التالية ←' : '✓ انتهى المثال'; nb.disabled = k >= W.length; if (k >= W.length) { star(1, 'تابعتَ المثال'); markSolved(P); } }
  nb.onclick = () => { if (k >= W.length) return; const pr = W[k][2]; if (!pr) return reveal();
    const d = document.createElement('div'); d.className = 'ws pred'; d.innerHTML = `<span class="sk" style="background:${C[k % C.length]}">${W[k][0]}</span><div><b>🤔 توقّعْ:</b> ${pr.q || (pr.o ? 'ما الخطوةُ المناسبة؟' : 'ما الناتج؟')}${pr.ans ? `<div class="row">${ansInput('توقّعي', W[pr.ans.type] || '150px', KP[pr.ans.type] || 'num')}<button class="btn sm">تحقّق</button><button class="lnk" data-skip>تخطَّ</button></div>` : `<div class="opts">${pr.o.map(o => `<button>${o}</button>`).join('')}</div>`}<div class="fb"></div></div>`; box.appendChild(d); nb.disabled = true;
    const done = () => { d.remove(); nb.disabled = false; reveal(); };
    if (pr.ans) { const inp = $('input', d), chk = () => { const r = judgeOne(pr.ans, inp.value, P); if (r.empty) { $('.fb', d).innerHTML = r.msg || ''; return; } if (r.ok) { star(1); $('.fb', d).textContent = '✓ صحيح!'; setTimeout(done, 700); } else $('.fb', d).innerHTML = '✗ ' + (r.msg || 'ليستْ صحيحة؛ حاولْ مرّةً أخرى أو تخطَّ.'); }; $('.btn', d).onclick = chk; inp.addEventListener('keydown', e => e.key === 'Enter' && chk()); $('[data-skip]', d).onclick = done; }
    else $$('.opts button', d).forEach(b => b.onclick = () => { const ok = b.textContent === pr.a; b.classList.add(ok ? 'ok' : 'no'); if (ok) setTimeout(done, 500); else $('.fb', d).textContent = 'فكّرْ مرّةً أخرى.'; }); };
  const sb = $('[data-a="sim"]', host); if (sb) sb.onclick = () => worked(host, opt.gen(), opt);
}

/* ═════════ أدواتُ التأليفِ السريع ═════════ */
// حساب عبارة: الإجابةُ والخطواتُ تُحسبان آليًّا
export const calc = (tag, expr, o = {}) => ({ tag, text: o.text || 'أوجدْ قيمةَ: ' + R(expr), ans: { type: 'num', v: Math.round(evalExpr(expr, o.vars) * 1e9) / 1e9, unit: o.unit }, calc: o.vars ? null : expr, ...o });
export const num = (tag, text, v, o = {}) => ({ tag, text, ans: { type: 'num', v, unit: o.unit }, ...o });
export const lst = (tag, text, v, o = {}) => ({ tag, text, ans: { type: 'list', v, unordered: o.unordered, unit: o.unit }, ...o });
export const mcq = (tag, text, opts, v, o = {}) => ({ tag, text, ans: { type: 'mcq', opts, v }, ...o });
export const ch = (tag, text, opts, v, o = {}) => ({ tag, text, ans: { type: 'choice', opts, v }, ...o });
export const open = (tag, text, v, o = {}) => ({ tag, text, ans: { type: 'open', v }, ...o });
export const frq = (tag, text, v, o = {}) => ({ tag, text, ans: { type: 'frac', v, simplest: o.simplest, form: o.form }, ...o });
export const exq = (tag, text, v, o = {}) => ({ tag, text, ans: { type: 'expr', v }, ...o });
export const pfq = (tag, n, o = {}) => ({ tag, text: o.text || `حلّلِ العددَ ${AR(n)} إلى عواملِه الأوّليّة.`, ans: { type: 'pf', v: n }, ...o });
export const fld = (tag, text, fields, o = {}) => ({ tag, text, ans: { type: 'fields', fields: fields.map(([label, v, type = 'num', extra = {}]) => ({ label, v, type, ...extra })) }, ...o });
export const fnq = (tag, text, fn, show, o = {}) => ({ tag, text, ans: { type: 'fn', fn, show, kp: o.kp }, ...o });
export const txt = (tag, text, v, o = {}) => ({ tag, text, ans: { type: 'text', v }, ...o });
export const cmp = (tag, a, b, o = {}) => { const va = typeof a === 'number' ? a : evalExpr(a), vb = typeof b === 'number' ? b : evalExpr(b); return { tag, text: o.text || `ضعْ <b>&gt;</b> أو <b>&lt;</b> أو <b>=</b>: ${o.ha || (typeof a === 'number' ? M([a]) : R(a))} ○ ${o.hb || (typeof b === 'number' ? M([b]) : R(b))}`, ans: { type: 'choice', opts: ['&gt;', '&lt;', '='], v: va > vb + 1e-9 ? 0 : va < vb - 1e-9 ? 1 : 2 }, ...o }; };
export const tbl = (rows, o = {}) => `<table class="tb">${rows.map((r, i) => `<tr>${r.map((c, j) => (j === 0 && o.headCol !== false) || (i === 0 && o.headRow) ? `<th>${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
