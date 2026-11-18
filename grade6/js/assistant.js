// «مساعد العلوم الذكي» داخل الدرس
// - داخل claude.ai: يجيب بالذكاء الاصطناعي (قدرة sample).
// - خارجها (GitHub Pages / التطبيق / النسخة دون إنترنت): مساعدٌ مدمجٌ يجيب من محتوى الدرس.
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const norm = s => strip(s).replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const CSS = `
#lesson .botBtn{position:absolute;left:14px;bottom:78px;z-index:18;border:0;border-radius:30px;padding:12px 18px;background:linear-gradient(135deg,#6a4ad8,#3a7ae0);color:#fff;font:inherit;font-weight:800;font-size:16px;box-shadow:0 6px 20px rgba(58,74,200,.45);display:flex;align-items:center;gap:8px}
#lesson .botBtn i{font-style:normal;font-size:24px;animation:bwave 2.4s infinite}@keyframes bwave{0%,80%,100%{transform:none}85%{transform:rotate(-14deg)}92%{transform:rotate(12deg)}}
#lesson .bot{position:absolute;left:12px;bottom:76px;z-index:19;width:min(430px,calc(100% - 24px));height:min(640px,calc(100% - 150px));background:#fff;border-radius:20px;box-shadow:0 14px 50px rgba(20,20,60,.35);display:none;flex-direction:column;overflow:hidden;border:1px solid #d8d2f2}
#lesson .bot.open{display:flex}
#lesson .bot .bh{background:linear-gradient(135deg,#6a4ad8,#3a7ae0);color:#fff;padding:10px 12px;display:flex;align-items:center;gap:8px}
#lesson .bot .bh b{flex:1;font-size:17px}#lesson .bot .bh small{display:block;font-size:11px;opacity:.9;font-weight:600}
#lesson .bot .bh button{border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:10px;width:34px;height:34px;font-size:16px}
#lesson .bot .ctx{background:#f3f0ff;padding:6px 10px;font-size:13px;color:#4a3a8a;display:flex;align-items:center;gap:6px}
#lesson .bot .ctx select{flex:1;font:inherit;font-size:13px;border:1px solid #cfc6f2;border-radius:8px;padding:3px;background:#fff;min-width:0}
#lesson .bot .msgs{flex:1;overflow:auto;padding:10px;display:flex;flex-direction:column;gap:8px;background:#fbfaff;-webkit-overflow-scrolling:touch}
#lesson .bot .m{max-width:88%;padding:9px 12px;border-radius:16px;line-height:1.75;font-size:15.5px;white-space:normal;word-wrap:break-word}
#lesson .bot .m.u{align-self:flex-start;background:#3a7ae0;color:#fff;border-bottom-right-radius:4px}
#lesson .bot .m.a{align-self:flex-end;background:#fff;border:1px solid #e2dcf6;color:#2a2440;border-bottom-left-radius:4px}
#lesson .bot .m.a b{color:#4a2ab0;background:none}
#lesson .bot .m.a ul{margin:4px 0;padding-inline-start:20px}
#lesson .bot .m .opts{display:flex;flex-direction:column;gap:6px;margin-top:8px}
#lesson .bot .m .opts button{border:1px solid #cfc6f2;background:#f7f5ff;border-radius:10px;padding:8px;font:inherit;font-size:15px;text-align:start}
#lesson .bot .m .opts button.ok{background:#dff5e8;border-color:#2f8f6a}#lesson .bot .m .opts button.no{background:#fde4e1;border-color:#d04a3a}
#lesson .bot .m .why{margin-top:6px;font-size:14px;color:#3a6a4a}
#lesson .bot .typing{display:inline-flex;gap:4px}#lesson .bot .typing i{width:7px;height:7px;border-radius:50%;background:#8a7ad8;animation:tdot 1s infinite}#lesson .bot .typing i:nth-child(2){animation-delay:.15s}#lesson .bot .typing i:nth-child(3){animation-delay:.3s}
@keyframes tdot{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-5px);opacity:1}}
#lesson .bot .chips{display:flex;gap:6px;overflow-x:auto;padding:8px 10px 4px;scrollbar-width:none;border-top:1px solid #eee}
#lesson .bot .chips button{flex:0 0 auto;border:1px solid #cfc6f2;background:#f3f0ff;color:#4a2ab0;border-radius:18px;padding:6px 12px;font:inherit;font-size:14px;font-weight:700;white-space:nowrap}
#lesson .bot .in{display:flex;gap:6px;padding:6px 10px 10px}
#lesson .bot .in input{flex:1;min-width:0;border:1px solid #cfc6f2;border-radius:14px;padding:9px 12px;font:inherit;font-size:15px}
#lesson .bot .in button{border:0;border-radius:14px;background:#6a4ad8;color:#fff;font-size:18px;width:46px}
#lesson .bot .cmp{display:flex;gap:6px;margin-top:6px;flex-wrap:wrap}#lesson .bot .cmp select{flex:1;min-width:120px;font:inherit;font-size:14px;border:1px solid #cfc6f2;border-radius:8px;padding:4px}
#lesson .bot .cmp button{border:0;border-radius:10px;background:#6a4ad8;color:#fff;font:inherit;font-weight:800;padding:6px 14px}
#lesson .bot table{border-collapse:collapse;width:100%;font-size:14px;margin-top:6px}#lesson .bot td,#lesson .bot th{border:1px solid #e2dcf6;padding:5px;vertical-align:top}#lesson .bot th{background:#f3f0ff}
`;

function md(t) { // تنسيق بسيط لإجابة الذكاء الاصطناعي
  const lines = esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').split('\n');
  let out = '', inList = false;
  for (const l of lines) {
    const m = l.match(/^\s*(?:[-•*]|\d+[.)]|[٠-٩]+[.)])\s+(.*)/);
    if (m) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${m[1]}</li>`; }
    else { if (inList) { out += '</ul>'; inList = false; } if (l.trim()) out += l + '<br>'; }
  }
  if (inList) out += '</ul>';
  return out.replace(/(<br>)+$/, '');
}

export function mountAssistant(host, L, getSec) {
  if (!L.assist) return null;
  if (!document.getElementById('botCSS')) { const s = document.createElement('style'); s.id = 'botCSS'; s.textContent = CSS; document.head.appendChild(s); }
  const A = L.assist;
  let ai = null, aiTried = false, history = [], busy = false, secIdx = Math.max(0, getSec()), asked = [];
  const btn = document.createElement('button'); btn.className = 'botBtn'; btn.innerHTML = '<i>🤖</i> مساعدُ العلوم'; host.appendChild(btn);
  const box = document.createElement('div'); box.className = 'bot';
  box.innerHTML = `<div class="bh"><span style="font-size:26px">🤖</span><b>مساعدُ العلوم الذكيّ<small class="mode">…</small></b><button data-clear title="محادثة جديدة">🗑</button><button data-close title="إغلاق">✕</button></div>
    <div class="ctx">📍 نتحدّثُ عن: <select>${L.sections.map((s, i) => `<option value="${i}">${esc(s.title)}</option>`).join('')}<option value="-1">الدرسُ كاملًا</option></select></div>
    <div class="msgs"></div>
    <div class="chips"><button data-q="why">🤔 لماذا يحدثُ هذا؟</button><button data-q="simple">🧒 اشرحْها بطريقةٍ أسهل</button><button data-q="example">🏠 مثالٌ من حياتنا</button><button data-q="quiz">📝 اختبرْني</button><button data-q="diff">⚖️ الفرقُ بين مفهومين</button></div>
    <div class="in"><input placeholder="اكتبْ سؤالَك عن الدرس…" maxlength="300"><button title="إرسال">➤</button></div>`;
  host.appendChild(box);
  const msgs = box.querySelector('.msgs'), sel = box.querySelector('.ctx select'), inp = box.querySelector('.in input'), modeEl = box.querySelector('.mode');
  sel.value = secIdx;
  sel.onchange = () => { secIdx = +sel.value; };
  const S = () => secIdx >= 0 ? L.sections[secIdx] : null;
  const topic = () => S() ? S().title : L.title.split(': ')[1];

  const add = (cls, html) => { const d = document.createElement('div'); d.className = 'm ' + cls; d.innerHTML = html; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d; };
  function greet() {
    msgs.innerHTML = '';
    add('a', `مرحبًا يا بطل! 👋 أنا <b>مساعدُ العلوم</b>. اسألْني عن درسِ «${esc(L.title.split(': ')[1])}»، أو اخترْ من الأزرارِ في الأسفل.<br><small style="color:#777">اخترْ من الأعلى الجزءَ الذي تقرؤه الآن لأفهمَ ما تقصده بكلمة «هذا».</small>`);
  }

  /* ── الذكاء الاصطناعي ── */
  async function getAI() {
    if (aiTried) return ai; aiTried = true;
    try { if (window.claude && typeof window.claude.use === 'function') ai = await window.claude.use('sample'); } catch (e) { ai = null; }
    paintMode(); return ai;
  }
  function paintMode() { modeEl.textContent = ai ? '✨ يعملُ بالذكاءِ الاصطناعيّ' : '📘 المساعدُ المدمج — يجيبُ من محتوى الدرس'; }
  function lessonText() {
    const parts = [`الدرس: ${L.title} (صفحات الكتاب ${L.from}–${L.to})`, `السؤال الأساسي: ${L.essential}`,
      'الأهداف: ' + L.objectives.map(o => strip(o.t)).join(' | '),
      'المفردات: ' + L.vocab.map(v => `${v.w}: ${strip(v.d)}`).join(' | ')];
    L.sections.forEach((s, i) => parts.push(`[الجزء ${i + 1}: ${s.title} — ص ${s.pages.join('،')}]\n` + s.body.map(strip).join('\n')));
    return parts.join('\n\n');
  }
  function brief() {
    return `أنت «مساعدُ العلوم» داخل كتابٍ تفاعليٍّ لمادة العلوم للصف السادس الابتدائي في المملكة العربية السعودية، وتتحدّث مع طالبٍ عمرُه نحو ١١ سنة.
قواعدُك:
- أجبْ بالعربية الفصحى البسيطة وبأسلوبٍ ودودٍ مشجّع.
- اعتمدْ على نصِّ الدرسِ أدناه ومستوى الصفِّ السادس، ولا تخترعْ معلوماتٍ غيرَ صحيحة. يمكنك استخدامُ أمثلةٍ من الحياة اليومية في السعودية (المزارع، النخيل، الحدائق، المطبخ…).
- إذا سُئلتَ عن شيءٍ خارجَ العلوم أو بعيدٍ عن الدرس فاعتذرْ بلطفٍ واقترحْ سؤالًا عن الدرس.
- اجعلِ الإجابةَ قصيرة: من ٣ إلى ٦ جملٍ أو نقاطٍ قليلة، ورمزٌ تعبيريٌّ واحدٌ على الأكثر. استخدمْ **عريضًا** للمصطلحاتِ العلمية.
- عند الإحالة إلى الكتاب اذكرْ رقمَ الصفحةِ من الأرقامِ الواردة.
- لا تطلبْ معلوماتٍ شخصيةً من الطالب.
الجزءُ الذي يقرؤه الطالبُ الآن: «${topic()}». كلمةُ «هذا» أو «هذه» في سؤالِه تعودُ إليه.

نصُّ الدرس:
${lessonText()}`;
  }
  async function askAI(userText, label, kind) {
    add('u', esc(label || userText));
    const wait = add('a', '<span class="typing"><i></i><i></i><i></i></span>');
    const turns = history.slice(-8).concat([{ role: 'user', content: userText }]);
    turns[0] = { role: 'user', content: brief() + '\n\n—\nسؤالُ الطالب: ' + turns[0].content };
    busy = true;
    try {
      const r = await ai(turns, { modelTier: 'quick', cache: false, onText: ({ text }) => { wait.innerHTML = md(text); msgs.scrollTop = msgs.scrollHeight; } });
      const text = (r && r.text) || ''; wait.innerHTML = md(text) || '…';
      history.push({ role: 'user', content: userText }, { role: 'assistant', content: text });
    } catch (e) {
      if (e && e.code === 'not_granted') { ai = null; paintMode(); }
      wait.innerHTML = (e && e.code === 'rate_limited' ? '⏳ أسئلةٌ كثيرةٌ في وقتٍ قصير؛ انتظرْ قليلًا ثم حاولْ مرّةً أخرى.' : '⚠ تعذّرَ الاتصالُ بالمساعدِ الذكيّ الآن، وهذه إجابةٌ من محتوى الدرس:') + '<br>' + (e && e.code === 'rate_limited' ? '' : localAnswer(label || userText, kind));
    }
    busy = false; msgs.scrollTop = msgs.scrollHeight;
  }

  /* ── المساعد المدمج ── */
  const secData = () => (A.sections && S() && A.sections[S().id]) || null;
  function localAnswer(q, kind) {
    const d = secData();
    if (kind === 'why') return d ? d.why : `اخترْ جزءًا محدّدًا من الأعلى، ثم اسألْني «لماذا يحدثُ هذا؟».`;
    if (kind === 'simple') return d ? d.simple : `اخترْ جزءًا محدّدًا من الأعلى لأشرحَه لك بطريقةٍ أسهل.`;
    if (kind === 'example') return d ? d.example : `اخترْ جزءًا محدّدًا من الأعلى لأعطيَك مثالًا من حياتنا.`;
    // سؤالٌ حرّ: نبحثُ عن مصطلحٍ أو سؤالٍ جاهزٍ مطابق
    const nq = norm(q);
    const faq = (A.faq || []).find(f => f.k.some(k => nq.includes(norm(k))));
    if (faq) return faq.a;
    const v = L.vocab.filter(v => nq.includes(norm(v.w)));
    if (v.length) return v.map(x => `<b>${esc(x.w)}</b>: ${strip(x.d)} <small>(ص ${AR(x.p)})</small>`).join('<br><br>');
    return `لم أجدْ إجابةً جاهزةً لهذا السؤالِ في محتوى الدرس 🤔<br>جرّبْ أن تكتبَ اسمَ مصطلحٍ من الدرس، مثل: ${L.vocab.slice(0, 3).map(v => '«' + esc(v.w) + '»').join('، ')}، أو استخدمِ الأزرارَ في الأسفل.${window.claude ? '' : '<br><small style="color:#777">للإجابةِ عن أيِّ سؤالٍ بالذكاءِ الاصطناعيّ افتحِ الكتابَ من رابطِه على Claude.</small>'}`;
  }

  /* ── اختبرني ── */
  function renderQuiz(q) {
    const d = add('a', `<b>📝 سؤال:</b> ${esc(q.q)}<div class="opts">${q.o.map((o, i) => `<button data-i="${i}">${'أبجد'[i]}) ${esc(o)}</button>`).join('')}</div><div class="why"></div>`);
    d.querySelectorAll('.opts button').forEach(b => b.onclick = () => {
      if (d.dataset.done) return; d.dataset.done = 1; const ok = +b.dataset.i === q.a;
      b.classList.add(ok ? 'ok' : 'no'); d.querySelectorAll('.opts button')[q.a].classList.add('ok');
      d.querySelector('.why').innerHTML = (ok ? '✅ أحسنت! ' : '❌ ليس تمامًا. ') + esc(q.why || '') + `<br><button class="more" style="margin-top:6px;border:0;border-radius:10px;background:#6a4ad8;color:#fff;padding:6px 12px;font:inherit;font-weight:800">سؤالٌ آخر ←</button>`;
      d.querySelector('.more').onclick = quiz; msgs.scrollTop = msgs.scrollHeight;
      history.push({ role: 'assistant', content: 'سؤال اختبار: ' + q.q }, { role: 'user', content: 'أجبتُ ' + (ok ? 'إجابةً صحيحة' : 'إجابةً خاطئة') });
    });
  }
  function localQuestion() {
    const pool = [...(L.quiz.mcq || []).map(m => ({ q: m.q, o: m.o, a: m.a, why: 'راجع ص ' + AR(m.p) + '.' })),
      ...(L.quiz.tf || []).map(t => ({ q: 'صوابٌ أم خطأ: ' + t.q, o: ['صواب', 'خطأ'], a: t.a ? 0 : 1, why: (t.fix || '') + ' (ص ' + AR(t.p) + ')' }))];
    const left = pool.filter(p => !asked.includes(p.q)); const q = (left.length ? shuffle(left) : shuffle(pool))[0]; asked.push(q.q); return q;
  }
  async function quiz() {
    if (busy) return;
    add('u', '📝 اختبرْني' + (S() ? ' في: ' + esc(S().title) : ''));
    if (ai) {
      const wait = add('a', '<span class="typing"><i></i><i></i><i></i></span>'); busy = true;
      try {
        const r = await ai.json(brief() + `\n\nاكتبْ سؤالَ اختيارٍ من متعدّدٍ واحدًا جديدًا عن ${S() ? '«' + topic() + '»' : 'الدرس'} لطالبِ الصفِّ السادس، يقيسُ الفهمَ لا الحفظ، بأربعةِ خياراتٍ قصيرة، خيارٌ واحدٌ صحيح.
لا تكرّرْ هذه الأسئلة: ${asked.slice(-6).join(' | ') || 'لا يوجد'}.
أعدْ JSON فقط بالشكل: {"q":"نصّ السؤال","o":["أ","ب","ج","د"],"a":رقم الخيار الصحيح من 0 إلى 3,"why":"تفسير قصير في جملة"}`, { modelTier: 'quick', cache: false });
        wait.remove(); busy = false;
        if (r && r.q && Array.isArray(r.o) && r.o.length >= 2 && r.a >= 0 && r.a < r.o.length) { asked.push(r.q); return renderQuiz(r); }
        throw new Error('bad');
      } catch (e) { wait.remove(); busy = false; if (e && e.code === 'not_granted') { ai = null; paintMode(); } }
    }
    renderQuiz(localQuestion());
  }

  /* ── الفرق بين مفهومين ── */
  function diffPicker() {
    const terms = [...new Set([...(A.pairs || []).flatMap(p => [p[0], p[1]]), ...L.vocab.map(v => v.w)])];
    const d = add('a', `⚖️ اخترِ المفهومين اللذين تريدُ المقارنةَ بينهما:<div class="cmp"><select>${terms.map(t => `<option>${esc(t)}</option>`).join('')}</select><select>${terms.map((t, i) => `<option ${i === 1 ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select><button>قارنْ</button></div>`);
    const [s1, s2] = d.querySelectorAll('select'); const p0 = (A.pairs || [])[0]; if (p0) { s1.value = p0[0]; s2.value = p0[1]; }
    d.querySelector('.cmp button').onclick = () => {
      const a = s1.value, b = s2.value; if (a === b) { s2.focus(); return; }
      if (ai) return askAI(`وضّحْ لي الفرقَ بينَ «${a}» و«${b}» في جدولٍ صغيرٍ أو نقاطٍ قصيرة، ثم اذكرْ وجهَ تشابهٍ واحدًا بينهما.`, `⚖️ ما الفرقُ بينَ «${a}» و«${b}»؟`);
      add('u', esc(`⚖️ ما الفرقُ بينَ «${a}» و«${b}»؟`));
      const pr = (A.pairs || []).find(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));
      const def = t => { const v = L.vocab.find(x => x.w === t); return v ? strip(v.d) : ((A.extra || {})[t] || '—'); };
      add('a', `<table><tr><th>${esc(a)}</th><th>${esc(b)}</th></tr><tr><td>${esc(def(a))}</td><td>${esc(def(b))}</td></tr></table>${pr ? `<div style="margin-top:6px">💡 ${pr[2]}</div>` : ''}`);
    };
  }

  function run(kind) {
    if (busy) return;
    if (kind === 'quiz') return quiz();
    if (kind === 'diff') return diffPicker();
    const label = { why: '🤔 لماذا يحدثُ هذا؟', simple: '🧒 اشرحْها لي بطريقةٍ أسهل', example: '🏠 أعطِني مثالًا من حياتِنا اليومية' }[kind] + (S() ? ` (${S().title})` : '');
    if (ai) {
      const p = { why: `لماذا يحدثُ ما في «${topic()}»؟ اشرحِ السببَ العلميَّ خطوةً خطوة.`, simple: `اشرحْ لي فكرةَ «${topic()}» بطريقةٍ أسهلَ باستخدامِ تشبيهٍ من الحياة، كأنّك تشرحُ لطفل.`, example: `أعطِني مثالًا أو مثالينِ من حياتِنا اليوميةِ في السعودية على «${topic()}»، واربطْ كلَّ مثالٍ بالفكرةِ العلمية.` }[kind];
      return askAI(p, label, kind);
    }
    add('u', esc(label)); add('a', localAnswer('', kind));
  }
  box.querySelectorAll('[data-q]').forEach(b => b.onclick = async () => { await getAI(); run(b.dataset.q); });
  const send = async () => { const t = inp.value.trim(); if (!t || busy) return; inp.value = ''; await getAI(); if (ai) return askAI(t); add('u', esc(t)); add('a', localAnswer(t)); };
  box.querySelector('.in button').onclick = send; inp.onkeydown = e => { if (e.key === 'Enter') send(); };
  box.querySelector('[data-close]').onclick = () => { box.classList.remove('open'); btn.style.display = ''; };
  box.querySelector('[data-clear]').onclick = () => { history = []; asked = []; greet(); };
  btn.onclick = async () => { const s = getSec(); if (s >= 0) { secIdx = s; sel.value = s; } box.classList.toggle('open'); btn.style.display = box.classList.contains('open') ? 'none' : ''; if (box.classList.contains('open')) { if (!msgs.children.length) greet(); getAI(); } };
  paintMode(); greet();
  return { setSection(i) { if (i >= 0) { secIdx = i; sel.value = i; } }, attach(h) { h.appendChild(btn); h.appendChild(box); } };
}
