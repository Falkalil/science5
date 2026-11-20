// كتابُ الرياضيّاتِ التفاعليّ — الصفّ السادس (الجزء الأوّل)
import { AR, keypad, pick } from './mathkit.js';
import { $, $$, store, pg, star, toast, CTX, mastery, isSolved, problemCard, worked, ansText } from './engine.js';
import { stepsHTML } from './algebra.js';
import { CHAPTERS, PAGES } from './toc.js';

keypad();
const main = $('#main');
const LOADED = {};
async function chapter(n) { if (!LOADED[n]) LOADED[n] = (await import(`./ch${n}.js`)).default; return LOADED[n]; }
const unitMeta = id => { for (const c of CHAPTERS) for (const u of c.units) if (u.id === id) return [c, u]; return []; };
const doneOf = id => Object.keys(store.get('solved', {})[id] || {}).length;
const stripT = s => String(s).replace(/<sup>(.*?)<\/sup>/g, '$1').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* ══════════ التوجيه ══════════ */
function route() { const h = location.hash.slice(1) || '/'; const p = h.split('/').filter(Boolean); hideBot();
  if (p[0] === 'u') return openUnit(decodeURIComponent(p[1]), +(p[2] || 0)); if (p[0] === 'book') return openBook(+(p[1] || 1)); home(); }
window.addEventListener('hashchange', route);
const go = h => { if (location.hash === '#' + h) route(); else location.hash = h; };
document.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go('/book/' + g.dataset.go); } });

/* ══════════ الرئيسة ══════════ */
function home() {
  setHead('رياضيات الصفّ السادس', 'الجزء الأوّل · كتابٌ تفاعليّ', null); CTX.lesson = null;
  const last = store.get('last'), lm = last && unitMeta(last)[1];
  main.innerHTML = `${lm ? `<a class="resume" href="#/u/${last}">▶ تابعْ من حيثُ توقّفت: <b>${lm.t}</b></a>` : ''}
    <div class="hgrid"><a class="hcard book" href="#/book/10">📖<b>الكتابُ كاملًا</b><small>${AR(PAGES)} صفحة</small></a><a class="hcard" href="#/u/1-1">🚀<b>الدرسُ الأوّل</b><small>الخطوات الأربع لحلّ المسألة</small></a></div>
    ${CHAPTERS.map(c => `<section class="chap" style="--c:${c.color}"><div class="chh"><span class="chn">${AR(c.n)}</span><div><b>${c.title}</b><small>ص ${AR(c.pages[0])}–${AR(c.pages[1])}</small></div></div>
      <div class="units">${c.units.map(u => { const d = doneOf(u.id); return `<a class="unit ${u.kind}" href="#/u/${u.id}"><span class="un">${u.kind === 'lesson' ? AR(u.id) : u.kind === 'explore' ? '🔎' : u.kind === 'ext' ? '➕' : '📝'}</span><span class="ut">${u.t}<small>${u.kind === 'explore' ? 'استكشاف · ' : u.kind === 'ext' ? 'توسّع · ' : ''}ص ${AR(u.p[0])}${u.p[1] !== u.p[0] ? '–' + AR(u.p[1]) : ''}</small></span>${d ? `<span class="done">✓ ${AR(d)}</span>` : ''}</a>`; }).join('')}</div></section>`).join('')}
    <footer>تصميم: أ. فهد الشيخي</footer>`;
}
function setHead(t, s, back, badge) { $('#ht').innerHTML = `${t}<small>${s || ''}</small>`; $('#hbadge').textContent = badge || '٦'; $('#back').style.display = back ? '' : 'none'; $('#back').onclick = () => go(back); $('#tabs').innerHTML = ''; $('#tabs').style.display = 'none'; }

/* ══════════ الوحدة ══════════ */
async function openUnit(id, tab) {
  const [C, meta] = unitMeta(id); if (!meta) return home();
  main.innerHTML = '<div class="loading">⏳ جارٍ التحميل…</div>';
  let CH; try { CH = await chapter(C.n); } catch (e) { console.error(e); main.innerHTML = '<div class="card">هذا الفصلُ قيدَ الإعداد… قريبًا إن شاء الله.</div>'; return; }
  const U = CH.units[id]; if (!U) { main.innerHTML = '<div class="card">هذه الوحدةُ قيدَ الإعداد… قريبًا إن شاء الله.</div>'; return; }
  CTX.lesson = { id, U, CH }; store.set('last', id);
  setHead(meta.t, `الفصل ${AR(C.n)} · ص ${AR(meta.p[0])}–${AR(meta.p[1])}`, '/', meta.kind === 'lesson' ? AR(id) : meta.kind === 'explore' ? '🔎' : '📝');
  const T = [];
  if (U.intro || U.ready || U.idea) T.push(['📘', U.kind === 'test' ? 'مقدّمة' : 'الدرس', el => tabIntro(el, U, meta)]);
  (U.tabs || []).forEach(t => T.push([t.icon, t.name, el => t.render(el, U)]));
  if ((U.examples || []).length) T.push(['🧩', 'أمثلة', el => tabExamples(el, U, CH)]);
  if ((U.ex || []).length) T.push(['✍️', U.kind === 'test' ? 'الأسئلة' : 'تدرّب', el => tabPractice(el, U, id)]);
  if ((U.gens || []).length) T.push(['♾️', 'بلا حدود', el => tabInfinite(el, U, CH, id)]);
  T.push(['📖', 'الصفحات', el => tabPages(el, meta.p)]);
  const tb = $('#tabs'); tb.style.display = ''; tb.innerHTML = T.map((t, i) => `<button data-t="${i}"><span>${t[0]}</span>${t[1]}</button>`).join('');
  const show = i => { i = Math.max(0, Math.min(i, T.length - 1)); $$('#tabs button').forEach((b, k) => b.classList.toggle('on', k === i)); main.innerHTML = ''; window.scrollTo(0, 0); CTX.cur = null; CTX.onRecord = null; T[i][2](main); history.replaceState(null, '', `#/u/${id}/${i}`); };
  $$('#tabs button').forEach(b => b.onclick = () => show(+b.dataset.t)); show(tab);
}
function tabIntro(el, U, meta) {
  el.innerHTML = `${U.idea ? `<div class="card idea"><span class="tag">${U.kind === 'explore' ? 'فكرةُ الاستكشاف' : 'فكرةُ الدرس'}</span><p>${U.idea}</p>${(U.vocab || []).length ? `<div class="vocab"><b>المفردات:</b> ${U.vocab.map((v, i) => `<button data-v="${i}">${v[0]}</button>`).join('')}</div><div class="vdef"></div>` : ''}</div>` : ''}
    ${U.ready ? `<div class="card"><span class="tag">استعدّ ${pg(U.readyP || meta.p[0])}</span>${U.readyText ? `<div class="ptext">${U.readyText}</div>` : ''}<div id="rdyM"></div><div id="rdy"></div></div>` : ''}<div id="intro"></div>`;
  $$('.vocab button', el).forEach(b => b.onclick = () => { const v = U.vocab[+b.dataset.v]; $('.vdef', el).innerHTML = `<b>${v[0]}</b>: ${v[1]}`; });
  if (U.readyMount) U.readyMount($('#rdyM', el));
  (U.ready || []).forEach(P => { const d = document.createElement('div'); $('#rdy', el).appendChild(d); problemCard(d, P); });
  const box = $('#intro', el);
  (U.intro || []).forEach(B => { const d = document.createElement('div'); d.className = 'card'; box.appendChild(d); d.innerHTML = `${B.tag ? `<span class="tag">${B.tag}</span>` : ''}${B.h ? `<h2>${B.h} ${pg(B.p)}</h2>` : ''}${B.html || ''}${B.tool ? '<div class="tool"></div>' : ''}`; if (B.tool) B.tool(d.querySelector('.tool')); });
}
function tabExamples(el, U, CH) {
  el.innerHTML = `<div class="card meta">في كلِّ مثال: <b>توقّعْ</b> الخطوةَ ثم اضغطْ «الخطوةُ التالية». ومع «🔁 مثالٌ مشابه» تحصلُ على أمثلةٍ جديدةٍ بلا حدود.</div>`;
  U.examples.forEach((P, i) => { P.id = P.id || 'x' + i; const d = document.createElement('div'); el.appendChild(d); const gen = P.gen && CH.gens[P.gen] ? () => CH.gens[P.gen](store.get('level', 1)) : null; if (P.cfu) problemCard(d, P, { gen }); else worked(d, P, { gen }); });
}
function tabPractice(el, U, id) {
  el.innerHTML = `${U.kind === 'test' ? '' : `<div class="card row" style="justify-content:space-between"><label class="sw"><input type="checkbox" id="scf" ${store.get('scaffold', true) ? 'checked' : ''}> 🪜 المسائلُ اللفظيّةُ بالخطواتِ الأربع</label><span class="meta">المسْ أيَّ تمرينٍ لتفتحَه</span></div>`}` +
    U.ex.map(([n, p, L], gi) => `<div class="card"><h2>${n} ${pg(p)}</h2>${L.map((P, i) => { P.id = P.id || `e${gi}-${i}`; const t = P.title || stripT(P.text); return `<div class="pli"><button class="plh" data-g="${gi}" data-i="${i}"><span class="ptag">${P.tag}</span><span class="plt">${t.length > 48 && !t.includes('<') ? t.slice(0, 46) + '…' : t}</span><i>${isSolved(id, P.id) ? '✅' : '▾'}</i></button><div class="plb"></div></div>`; }).join('')}</div>`).join('');
  const s = $('#scf', el); if (s) s.onchange = e => store.set('scaffold', e.target.checked);
  $$('.plh', el).forEach(b => b.onclick = () => { const P = U.ex[+b.dataset.g][2][+b.dataset.i], body = b.nextElementSibling; if (body.innerHTML) { body.innerHTML = ''; return; } problemCard(body, P, { onDone: () => { $('i', b).textContent = '✅'; } }); });
}
function tabInfinite(el, U, CH, id) {
  let type = 'all', streak = 0; const L = store.get('level', 1);
  const names = U.gens.map(k => [k, CH.gnames[k] || k]);
  el.innerHTML = `<div class="card"><h2>♾️ أمثلةٌ بلا حدود</h2><p class="meta">مسائلُ جديدةٌ بأرقامٍ مختلفةٍ في كلِّ مرّة، على نمطِ مسائلِ الدرس.</p>
    <div class="lv">${[['🟢', 'دعم', 'أعدادٌ أصغر'], ['🔵', 'أساسي', 'مثل الكتاب'], ['🟣', 'إثراء', 'أعدادٌ أكبر ومسائلُ أصعب']].map((x, i) => `<button data-lv="${i}" class="${i === L ? 'on' : ''}">${x[0]} ${x[1]}<small>${x[2]}</small></button>`).join('')}</div>
    ${names.length > 1 ? `<div class="row"><span>النوع:</span><select id="gT"><option value="all">🎲 كلُّ الأنواع</option>${names.map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div>` : ''}
    <div class="row c"><span class="pill">🔥 متتالية: <b id="stk">٠</b></span></div></div><div id="gp"></div><div class="row c"><button class="btn" id="gN">مسألةٌ جديدة ←</button></div>
    <div class="card"><h2>📊 إتقاني لمهاراتِ الدرس</h2><div id="mast"></div><p class="meta">من آخرِ ٦ محاولاتٍ في كلِّ مهارة. 🏅 = إتقان (٨٠٪ فأكثر).</p></div>`;
  const mk = () => { const k = type === 'all' ? pick(U.gens) : type; const P = CH.gens[k](store.get('level', 1)); P.skill = P.skill || k; return P; };
  const renderM = () => { const keys = Object.keys(store.get('mastery', {})).filter(k => k.startsWith(id + ':')).map(k => k.split(':')[1]); $('#mast', el).innerHTML = keys.length ? keys.map(k => { const p = mastery(id + ':' + k); return `<div class="ml"><span>${CH.gnames[k] || (CH.skills || {})[k] || ({ op: 'اختيارُ العمليّة' })[k] || k}</span><div class="mbar"><i style="width:${Math.max(p, 0)}%;background:${p >= 80 ? '#2f8f6a' : p >= 50 ? '#e0a020' : '#e0603a'}"></i></div><b>${p < 0 ? '—' : AR(p) + '٪'}</b>${p >= 80 ? '🏅' : ''}</div>`; }).join('') : '<p class="meta">ابدأْ بحلِّ المسائلِ ليظهرَ إتقانُك هنا.</p>'; };
  CTX.onRecord = renderM; renderM();
  const next = () => problemCard($('#gp', el), mk(), { gen: mk, onDone: ok => { streak = ok ? streak + 1 : 0; $('#stk', el).textContent = AR(streak); if (streak && streak % 5 === 0) star(3, `${AR(streak)} إجاباتٍ صحيحةٍ متتالية!`); } });
  $$('.lv button', el).forEach(b => b.onclick = () => { store.set('level', +b.dataset.lv); $$('.lv button', el).forEach(x => x.classList.toggle('on', x === b)); next(); });
  const sel = $('#gT', el); if (sel) sel.onchange = e => { type = e.target.value; next(); };
  $('#gN', el).onclick = next; next();
}
function tabPages(el, [a, b]) { el.innerHTML = `<div class="pages">${Array.from({ length: b - a + 1 }, (_, i) => a + i).map(p => `<figure><img loading="lazy" src="pages/${p}.webp" alt="صفحة ${AR(p)}"><figcaption>صفحة ${AR(p)} <button class="pg" data-go="${p}">🔍 فتحُ الصفحة</button></figcaption></figure>`).join('')}</div>`; }

/* ══════════ الكتابُ المصوَّر ══════════ */
function openBook(p) {
  p = Math.max(1, Math.min(PAGES, p || 1)); let U = null; for (const c of CHAPTERS) for (const u of c.units) if (!U && p >= u.p[0] && p <= u.p[1]) U = u;
  setHead('الكتابُ المصوَّر', `صفحة ${AR(p)} من ${AR(PAGES)}`, CTX.lesson ? '/u/' + CTX.lesson.id : '/');
  main.innerHTML = `<div class="book"><div class="bnav"><button class="btn s sm" data-d="-1">→ السابقة</button><span><input class="pgin" value="${AR(p)}" inputmode="numeric"> / ${AR(PAGES)}</span><button class="btn s sm" data-d="1">التالية ←</button></div>
    ${U ? `<a class="golesson" href="#/u/${U.id}">🎯 ${U.kind === 'lesson' ? 'افتحْ الدرسَ التفاعليّ ' + AR(U.id) : 'افتحْ النسخةَ التفاعليّة'}: ${U.t}</a>` : ''}
    <div class="bimg"><img src="pages/${p}.webp" alt="صفحة ${AR(p)}"></div></div>`;
  const nav = d => { const q = Math.max(1, Math.min(PAGES, p + d)); history.replaceState(null, '', '#/book/' + q); openBook(q); };
  $$('[data-d]', main).forEach(b => b.onclick = () => nav(+b.dataset.d));
  $('.pgin', main).onchange = e => { const v = +String(e.target.value).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)); if (v) nav(v - p); };
  let x0 = null; const bi = $('.bimg', main); bi.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true }); bi.addEventListener('touchend', e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 60) nav(dx > 0 ? 1 : -1); x0 = null; });
  if (p < PAGES) { const im = new Image(); im.src = `pages/${p + 1}.webp`; }
}

/* ══════════ المساعد (إجاباتٌ مدمجة) ══════════ */
const bot = $('#bot');
function hideBot() { bot.classList.remove('open'); }
$('#botBtn').onclick = () => { bot.classList.toggle('open'); if (bot.classList.contains('open')) botHome(); };
$('#botX').onclick = hideBot;
function say(html, who = 'a') { const b = $('#botLog'); b.insertAdjacentHTML('beforeend', `<div class="m ${who}">${html}</div>`); b.scrollTop = b.scrollHeight; }
function botHome() { $('#botLog').innerHTML = ''; const P = CTX.cur && CTX.cur.P; say(P ? `أنا معك في: <b>${P.tag || ''} ${P.title || ''}</b>. ماذا تحتاج؟` : CTX.lesson ? `أنا معك في: <b>${unitMeta(CTX.lesson.id)[1].t}</b>. افتحْ مسألةً، أو اكتبْ مصطلحًا لأشرحَه.` : 'افتحْ درسًا أو مسألةً ثم اطلبْ مساعدتي.'); }
$$('#botQ button').forEach(b => b.onclick = () => { const q = b.dataset.q, S = CTX.cur, P = S && S.P, U = CTX.lesson && CTX.lesson.U; say(b.textContent, 'u');
  if (q === 'idea') return say(U ? `<b>الفكرة:</b> ${U.idea || ''}${U.summary ? '<br>' + U.summary : ''}${(U.vocab || []).length ? '<br><b>المفردات:</b><br>' + U.vocab.map(v => `• <b>${v[0]}</b>: ${v[1]}`).join('<br>') : ''}` : 'افتحْ درسًا أوّلًا.');
  if (q === 'steps') return say('<b>الخطواتُ الأربع:</b><br>١. <b>افهمْ</b>: ما المعطيات؟ وما المطلوب؟<br>٢. <b>خطّطْ</b>: اخترِ العمليّةَ أو الخطّة، وقدّرِ الإجابة.<br>٣. <b>حُلَّ</b>: نفّذِ الخطّة.<br>٤. <b>تحقّقْ</b>: هل الإجابةُ معقولةٌ وقريبةٌ من التقدير؟');
  if (!P) return say('افتحْ مسألةً أوّلًا من «أمثلة» أو «تدرّب» أو «بلا حدود».');
  if (q === 'hint') { S.hk = S.hk || 0; const H = P.hints || (P.plan ? [P.plan] : P.calc ? ['تذكّرْ ترتيبَ العمليّات: الأقواس، ثم الأسس، ثم الضرب والقسمة، ثم الجمع والطرح.'] : ['اقرأِ المسألةَ جيّدًا وحدّدِ المطلوب.']); say('💡 ' + H[Math.min(S.hk, H.length - 1)]); S.hk++; return; }
  if (q === 'sol') return say('<b>الحلُّ خطوةً بخطوة:</b><br>' + (P.plan ? '• ' + P.plan + '<br>' : '') + (P.calc ? stepsHTML(P.calc) + '<br>' : (P.sol || []).map(s => '• ' + s).join('<br>') + '<br>') + (P.ans.type !== 'open' ? `✅ الإجابة: <b>${ansText(P.ans)}</b>` : P.ans.v));
  if (q === 'err') { const w = S.wrongLast; return say(w ? `إجابتُك كانت «${w.raw}». ${w.msg || 'لم أجدْ خطأً شائعًا مطابقًا؛ راجعِ العمليّةَ ثم الحسابَ خطوةً خطوة، وقارنْ بتقديرِك.'}` : 'لم تُدخلْ إجابةً خاطئةً بعد في هذه المسألة 👍'); }
  if (q === 'sim') { if (!S.similar) return say('افتحْ تبويبَ «بلا حدود» أو «أمثلة» للحصولِ على مسائلَ مشابهة.'); S.similar(); hideBot(); toast('🔁 مسألةٌ مشابهةٌ جديدة'); } });
$('#botIn').addEventListener('keydown', e => { if (e.key !== 'Enter') return; const q = e.target.value.trim(); if (!q) return; e.target.value = ''; say(q, 'u'); const n = s => s.replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/^ال/, '');
  const all = []; Object.values(LOADED).forEach(ch => Object.values(ch.units).forEach(u => (u.vocab || []).forEach(v => all.push(v)))); const hit = all.find(v => n(q).includes(n(v[0])) || n(v[0]).includes(n(q)));
  say(hit ? `<b>${hit[0]}</b>: ${hit[1]}` : 'لم أجدْ هذا المصطلحَ في الدروسِ التي فتحتَها. جرّبْ «📘 الفكرة» أو «💡 تلميح».'); });

/* ── وضعُ العرض ── */
$('#present').onclick = () => { document.body.classList.toggle('present'); const on = document.body.classList.contains('present'); $('#present').textContent = on ? '✕' : '🖥️'; try { on ? document.documentElement.requestFullscreen() : document.fullscreenElement && document.exitFullscreen(); } catch (e) {} };
$('#stars').textContent = '⭐ ' + AR(store.get('stars', 0));
route();
