// المختبرات الافتراضية — مختبر «المخلوقات الحية» (الصف الأول، ص ١٥ و١٨)
const AR = s => String(s).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

const CSS = `
.vl{margin-top:8px}
.vl .vtabs{display:flex;gap:6px;margin:6px 0 10px;flex-wrap:wrap}
.vl .vtabs button{flex:1;min-width:150px;border:2px solid #3a7ae0;background:#fff;color:#1a4a9a;border-radius:12px;padding:8px;font-weight:800;font:inherit;font-weight:800}
.vl .vtabs button.on{background:#3a7ae0;color:#fff}
.vl .stage{background:linear-gradient(180deg,#dff1ff 0%,#f4fbff 62%,#e9dcc4 62%,#dccaa8 100%);border-radius:16px;border:1px solid #c9dcef;overflow:hidden;position:relative}
.vl .stage svg{display:block;width:100%;height:auto}
.vl .ctl{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
.vl .ctl button{border:0;border-radius:12px;padding:10px 14px;font:inherit;font-weight:800;background:#3a7ae0;color:#fff;box-shadow:0 3px 0 #2a5ab0}
.vl .ctl button.w{background:#2aa0d8;box-shadow:0 3px 0 #1a7ab0}.vl .ctl button.g{background:#2f8f6a;box-shadow:0 3px 0 #1f6f50}.vl .ctl button.s{background:#fff;color:#5a4a36;box-shadow:0 3px 0 #d9c9a8;border:1px solid #d9c9a8}
.vl .ctl button:disabled{opacity:.45}
.vl .day{position:absolute;top:8px;right:10px;background:#fff;border-radius:12px;padding:4px 12px;font-weight:800;color:#1a4a9a;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.vl .msg{background:#fffbea;border-top:2px solid #f0d890;padding:8px 14px;font-weight:800;color:#3a2a10;text-align:center;font-size:16px;min-height:24px}
.vl table{width:100%;border-collapse:collapse;margin-top:6px;font-size:15px;background:#fff}
.vl th,.vl td{border:1px solid #d9e4f0;padding:6px;text-align:center}.vl th{background:#eaf3ff;color:#1a4a9a}
.vl .sw{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
.vl .sw label{flex:1;min-width:120px;display:flex;align-items:center;justify-content:center;gap:8px;background:#fff;border:2px solid #cfdcec;border-radius:14px;padding:10px;font-weight:800;cursor:pointer;user-select:none}
.vl .sw label.on{border-color:#2f8f6a;background:#eefaf3}
.vl .sw input{width:20px;height:20px;accent-color:#2f8f6a}
.vl .pred{background:#fff8e6;border:1px dashed #e0a830;border-radius:14px;padding:10px;margin:8px 0}
.vl .health{height:12px;background:#eee;border-radius:9px;overflow:hidden;margin-top:4px}.vl .health i{display:block;height:100%;transition:width .5s,background .5s}
`;

function plantSVG(x, base, h, health, opt = {}) {
  // h: ارتفاع الساق بالبكسل، health: 0..1 (1 سليم)، opt.pale: نقص الضوء
  const droop = (1 - health), bend = droop * 60;
  const green = opt.pale ? mix('#c9c96a', '#5aa83a', health) : mix('#a88a4a', '#4f9a3a', health);
  const top = [x + bend * .6, base - h + droop * h * .25];
  const stem = `<path d="M${x} ${base} Q${x} ${base - h * .6} ${top[0]} ${top[1]}" stroke="${mix('#8a7a4a', '#4f8a32', health)}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  const n = Math.max(1, Math.round(h / 40));
  let leaves = '';
  for (let i = 0; i < n; i++) {
    const t = (i + .7) / (n + .4), px = x + (top[0] - x) * t * t, py = base - (base - top[1]) * t, L = 30 + Math.min(i, 3) * 4;
    for (const s of [-1, 1]) {
      const ang = -32 + droop * 85 + (i % 2 ? 6 : -4);
      leaves += `<path d="M0 0 Q${L * .45} ${-L * .38} ${L} 0 Q${L * .45} ${L * .38} 0 0 Z" fill="${green}" stroke="${mix('#7a6a3a', '#3a7a2a', health)}" stroke-width="1.5" transform="translate(${px} ${py}) scale(${s} 1) rotate(${ang})"/><path d="M2 0 L${L * .85} 0" stroke="${mix('#7a6a3a', '#3a7a2a', health)}" stroke-width="1" opacity=".6" transform="translate(${px} ${py}) scale(${s} 1) rotate(${ang})"/>`;
    }
  }
  const flower = h > 120 && health > .7 ? `<g transform="translate(${top[0]} ${top[1] - 6})">${[0, 72, 144, 216, 288].map(a => `<ellipse rx="9" ry="5" cx="9" transform="rotate(${a})" fill="#ffd34a"/>`).join('')}<circle r="6" fill="#e08a1a"/></g>` : `<circle cx="${top[0]}" cy="${top[1]}" r="5" fill="${green}"/>`;
  return stem + leaves + flower;
}
function mix(a, b, t) { t = Math.max(0, Math.min(1, t)); const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
const pot = (x, y) => `<path d="M${x - 62} ${y} L${x + 62} ${y} L${x + 48} ${y + 78} L${x - 48} ${y + 78} Z" fill="#c8704a" stroke="#9a5030" stroke-width="2"/><rect x="${x - 68}" y="${y - 10}" width="136" height="16" rx="5" fill="#d8805a" stroke="#9a5030" stroke-width="2"/><ellipse cx="${x}" cy="${y - 2}" rx="60" ry="7" fill="#6a4a2a"/>`;
const can = (x, y, on) => on ? `<g transform="translate(${x} ${y}) rotate(-28)"><rect x="-30" y="-18" width="52" height="36" rx="8" fill="#3aa0e0"/><path d="M22 -10 L58 -26 L60 -20 L24 0 Z" fill="#3aa0e0"/><path d="M-30 -10 Q-48 0 -30 12" stroke="#2a80c0" stroke-width="5" fill="none"/></g>${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${x + 40 + (i % 3) * 7}" cy="${y + 10 + i * 12}" r="3.5" fill="#4ab0ff"><animate attributeName="cy" from="${y + 6}" to="${y + 90}" dur=".6s" begin="${i * .1}s" repeatCount="indefinite"/></circle>`).join('')}` : '';

export function labLiving(box, api) {
  if (!document.getElementById('vlCSS')) { const s = document.createElement('style'); s.id = 'vlCSS'; s.textContent = CSS; document.head.appendChild(s); }
  let mode = 0;
  box.innerHTML = `<div class="vl"><div class="vtabs"><button data-m="0" class="on">🪴 التجربة ١: النبات والحجر</button><button data-m="1">🔬 التجربة ٢: ماذا يحتاج النبات؟</button></div><div class="vb"></div></div>`;
  const vb = box.querySelector('.vb');
  box.querySelectorAll('[data-m]').forEach(b => b.onclick = () => { mode = +b.dataset.m; box.querySelectorAll('[data-m]').forEach(x => x.classList.toggle('on', x === b)); (mode ? exp2 : exp1)(); });

  /* ── التجربة ١: نبات وحجر نرويهما أسبوعًا (ص ١٥) ── */
  function exp1() {
    let day = 0, watered = false, wateringAnim = 0, h = 60, health = 1, dry = 0, pred = null, done = false;
    const log = [];
    vb.innerHTML = `
      <div class="pred"><b>١) أتوقّعُ قبلَ أن أبدأ:</b> ماذا سيحدثُ للنباتِ والحجرِ إذا رويتُهما بالماءِ أسبوعًا كاملًا؟
        <div class="chips" style="margin-top:6px">${['النباتُ ينمو، والحجرُ لا يتغيّر', 'النباتُ والحجرُ ينموان معًا', 'لا يتغيّرُ أيٌّ منهما'].map((c, i) => `<button class="chip" data-p="${i}">${c}</button>`).join('')}</div></div>
      <b>٢) أجرّب:</b> أسقي النباتَ والحجرَ ثم أنتقلُ إلى اليومِ التالي. (جرّبْ أيضًا أن تنسى السقيَ يومين!)
      <div class="stage"><svg viewBox="0 0 640 380"></svg><div class="day"></div><div class="msg"></div></div>
      <div class="ctl"><button class="w" id="e1w">💧 أسقي النباتَ والحجر</button><button id="e1d">🌙 مرَّ يوم ←</button><button class="s" id="e1r">🔄 من البداية</button></div>
      <b>٣) أسجّلُ البيانات:</b>
      <table><thead><tr><th>اليوم</th><th>سقيتُ؟</th><th>طولُ النبات</th><th>حالُ النبات</th><th>الحجر</th></tr></thead><tbody id="e1t"><tr><td colspan="5" style="color:#999">ابدأ التجربة…</td></tr></tbody></table>
      <div id="e1c"></div>`;
    const svg = vb.querySelector('svg'), msg = vb.querySelector('.msg'), dayEl = vb.querySelector('.day');
    vb.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { vb.querySelectorAll('[data-p]').forEach(x => x.classList.remove('on')); b.classList.add('on'); pred = +b.dataset.p; });
    function draw() {
      const wet = watered;
      svg.innerHTML = `
        ${pot(180, 280)}${plantSVG(180, 276, h, health)}
        <text x="180" y="372" text-anchor="middle" font-size="20" font-weight="800" fill="#3a2a10">النبات 🌱</text>
        <ellipse cx="460" cy="345" rx="92" ry="16" fill="#9ab8d0" opacity=".55"/><path d="M370 300 Q460 362 550 300 Z" fill="#cfe9ff" stroke="#8ab" stroke-width="2" opacity=".9"/>
        ${wet ? `<path d="M380 304 Q460 352 540 304 Z" fill="#4aa3e8" opacity=".45"/>` : ''}
        <path d="M410 300 Q408 262 440 252 Q478 240 506 262 Q522 280 512 302 Z" fill="${wet ? '#6e6a66' : '#9a948c'}" stroke="#5a554f" stroke-width="2"/>
        <path d="M432 270 Q452 262 470 270" stroke="${wet ? '#5a5652' : '#b8b2aa'}" stroke-width="3" fill="none"/>
        <text x="460" y="372" text-anchor="middle" font-size="20" font-weight="800" fill="#3a2a10">الحجر 🪨</text>
        <g>${can(wateringAnim ? 70 : -200, 120, wateringAnim)}${can(wateringAnim ? 360 : -200, 170, wateringAnim)}</g>
        <circle cx="590" cy="50" r="26" fill="#ffd34a"/>`;
      dayEl.textContent = 'اليوم ' + AR(day) + ' من ٧';
      vb.querySelector('#e1d').disabled = done;
      vb.querySelector('#e1w').disabled = done || watered;
    }
    function row() {
      const st = health > .8 ? '😊 سليمٌ أخضر' : health > .45 ? '😟 بدأ يذبل' : '😢 ذابل';
      log.push(`<tr><td>${AR(day)}</td><td>${watered ? '💧 نعم' : '✗ لا'}</td><td>${AR((h / 20).toFixed(1))} سم</td><td>${st}</td><td>لم يتغيّر</td></tr>`);
      vb.querySelector('#e1t').innerHTML = log.join('');
    }
    vb.querySelector('#e1w').onclick = () => {
      if (watered || done) return; watered = true; wateringAnim = 1; msg.textContent = '💧 سقيتُ النباتَ والحجرَ بالماء'; draw();
      setTimeout(() => { wateringAnim = 0; draw(); }, 1300);
    };
    vb.querySelector('#e1d').onclick = () => {
      if (done) return;
      if (day === 0 && pred === null) { msg.textContent = '✋ اخترْ توقّعَك أوّلًا في الأعلى'; return; }
      day++;
      if (watered) { dry = 0; health = Math.min(1, health + .35); h = Math.min(200, h + 18 * health); msg.textContent = '🌱 النباتُ شربَ الماءَ ونما! أمّا الحجرُ فبقيَ كما هو.'; }
      else { dry++; health = Math.max(.1, health - (dry > 1 ? .35 : .2)); msg.textContent = dry > 1 ? '😢 النباتُ عطشانُ ويذبل! يحتاجُ إلى الماءِ لكي يعيش.' : '😟 نسيتُ السقي… أوراقُ النباتِ بدأتْ تتدلّى.'; }
      row(); watered = false; draw();
      if (day >= 7) finish();
    };
    vb.querySelector('#e1r').onclick = exp1;
    function finish() {
      done = true; draw();
      const grew = h > 90;
      msg.textContent = grew ? '🎉 مرَّ أسبوع: النباتُ نما، والحجرُ لم يتغيّر!' : '⚠ مرَّ أسبوع: النباتُ لم ينمُ جيّدًا لأنّه لم يحصلْ على الماءِ كلَّ يوم.';
      const right = pred === 0;
      vb.querySelector('#e1c').innerHTML = `<div class="card green" style="margin-top:10px"><span class="tag g">٤) أستنتج</span>
        <p>${right ? '✅ توقّعُك صحيح!' : '🤔 توقّعُك يختلفُ عن النتيجة — وهذا جيّد؛ العالِمُ يتعلّمُ من تجربتِه.'}</p>
        <p><b>النبات</b> احتاجَ إلى الماءِ ونما وتغيّر؛ فهو <b>مخلوقٌ حيّ</b>.</p><p><b>الحجر</b> لم ينمُ ولم يتغيّرْ مع أنّنا رويناه؛ فهو <b>شيءٌ غيرُ حيّ</b>.</p>
        ${grew ? '' : '<p>💡 أعِدِ التجربةَ واسقِ النباتَ كلَّ يومٍ لترى الفرق.</p>'}</div>`;
      api.award(grew ? 3 : 1, 'أكملتَ التجربة');
    }
    draw(); msg.textContent = 'اخترْ توقّعَك، ثم اسقِ وانتقلْ يومًا بعد يوم';
  }

  /* ── التجربة ٢: ماذا يحتاج النبات؟ (ص ١٨) ── */
  function exp2() {
    const need = { sun: true, water: true, air: true }; let day = 0, h = 70, health = 1, found = {}, timer = 0;
    const NAMES = { sun: '☀️ ضوءُ الشمس', water: '💧 الماء', air: '🌬️ الهواء' };
    vb.innerHTML = `<p style="margin:4px 0"><b>أستقصي:</b> أطفئُ شرطًا واحدًا، ثم أضغطُ «مرّتْ ٣ أيام» وألاحظُ ماذا يحدثُ للنبات. أكتشفُ الأشياءَ الثلاثةَ التي يحتاجُ إليها النبات.</p>
      <div class="sw">${Object.keys(NAMES).map(k => `<label class="on"><input type="checkbox" data-k="${k}" checked>${NAMES[k]}</label>`).join('')}</div>
      <div class="stage"><svg viewBox="0 0 640 380"></svg><div class="day"></div><div class="msg"></div></div>
      <div style="font-weight:800;margin-top:6px">صحّةُ النبات:</div><div class="health"><i></i></div>
      <div class="ctl"><button class="g" id="e2d">⏩ مرّتْ ٣ أيام</button><button class="s" id="e2r">🔄 نبتةٌ جديدة</button></div>
      <div id="e2f" class="card" style="margin-top:6px"></div>`;
    const svg = vb.querySelector('svg'), msg = vb.querySelector('.msg'), dayEl = vb.querySelector('.day');
    function draw(anim) {
      const dark = !need.sun, jar = !need.air;
      svg.innerHTML = `
        ${dark ? '<rect width="640" height="380" fill="#1a2240" opacity=".55"/>' : '<circle cx="560" cy="60" r="34" fill="#ffd34a"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<line x1="${560 + Math.cos(i * .785) * 42}" y1="${60 + Math.sin(i * .785) * 42}" x2="${560 + Math.cos(i * .785) * 56}" y2="${60 + Math.sin(i * .785) * 56}" stroke="#ffc020" stroke-width="5" stroke-linecap="round"/>`).join('')}
        ${dark ? '<text x="320" y="72" text-anchor="middle" font-size="20" fill="#fff" font-weight="800">🌑 النبتةُ في غرفةٍ مظلمة</text>' : ''}
        ${pot(320, 280)}${plantSVG(320, 276, h, health, { pale: !need.sun && health < 1 })}
        ${need.water && anim ? can(190, 110, 1) : ''}
        ${!need.water ? `<text x="320" y="372" text-anchor="middle" font-size="18" fill="#a05a20" font-weight="800">التربةُ جافّة 🏜️</text><path d="M268 278 l10 6 l-6 6 M330 279 l8 7 M360 278 l-6 8" stroke="#3a2a10" stroke-width="2"/>` : `<text x="320" y="372" text-anchor="middle" font-size="18" fill="#2a6a2a" font-weight="800">التربةُ رطبة 💧</text>`}
        ${jar ? `<path d="M222 285 L222 70 Q222 40 252 40 L388 40 Q418 40 418 70 L418 285" fill="#cfe9ff" opacity=".35" stroke="#7aa8c8" stroke-width="4"/><rect x="236" y="26" width="168" height="18" rx="6" fill="#7aa8c8"/><text x="320" y="20" text-anchor="middle" font-size="16" fill="#1a4a6a" font-weight="800">برطمانٌ مغلق: لا يدخلُ الهواء</text>` : ''}`;
      dayEl.textContent = 'اليوم ' + AR(day);
      const hb = vb.querySelector('.health i'); hb.style.width = (health * 100) + '%'; hb.style.background = health > .7 ? '#2f8f6a' : health > .4 ? '#e0a830' : '#d04a3a';
    }
    function foundCard() {
      const keys = Object.keys(found);
      vb.querySelector('#e2f').innerHTML = `<span class="tag">📋 ما اكتشفتُه</span>${Object.keys(NAMES).map(k => `<p style="margin:4px 0">${found[k] ? '✅' : '⬜'} النباتُ يحتاجُ إلى ${NAMES[k]}</p>`).join('')}
        ${keys.length === 3 ? '<p class="fb ok" style="display:block">🌟 أحسنت! اكتشفتَ أنّ النباتَ يحتاجُ إلى <b>ضوءِ الشمسِ والماءِ والهواء</b> لكي يعيش (ص ١٨).</p>' : `<p style="color:#6a5a44;margin:4px 0">بقيَ ${AR(3 - keys.length)} — أطفئْ شرطًا آخرَ وجرّب.</p>`}`;
    }
    vb.querySelectorAll('[data-k]').forEach(c => c.onchange = () => { need[c.dataset.k] = c.checked; c.parentElement.classList.toggle('on', c.checked); draw(); msg.textContent = c.checked ? 'أعدتَ ' + NAMES[c.dataset.k] : 'أزلتَ ' + NAMES[c.dataset.k] + ' — ماذا تتوقّع؟'; });
    vb.querySelector('#e2d').onclick = () => {
      clearInterval(timer); const miss = Object.keys(need).filter(k => !need[k]);
      let n = 0; timer = setInterval(() => {
        day++; n++;
        if (!miss.length) { health = Math.min(1, health + .15); h = Math.min(200, h + 12); }
        else health = Math.max(.08, health - .12 * miss.length);
        draw(miss.length === 0 || need.water);
        if (n >= 3) {
          clearInterval(timer);
          if (!miss.length) msg.textContent = '🌱 النباتُ حصلَ على كلِّ ما يحتاجُ إليه فنما!';
          else if (miss.length === 1) { const k = miss[0]; const isNew = !found[k]; found[k] = 1; msg.textContent = { sun: '🥀 بدونِ ضوءِ الشمسِ اصفرّتْ أوراقُ النباتِ وضعُف!', water: '🥀 بدونِ الماءِ ذبلَ النباتُ وتدلّتْ أوراقُه!', air: '🥀 بدونِ الهواءِ ذبلَ النبات!' }[k]; foundCard(); if (isNew) { api.award(1, 'اكتشفتَ حاجةً للنبات'); if (Object.keys(found).length === 3) api.award(2, 'أتممتَ المختبر'); } }
          else msg.textContent = '🥀 أزلتَ أكثرَ من شرط! أطفئْ شرطًا واحدًا فقط لتعرفَ السبب.';
        }
      }, 450);
    };
    vb.querySelector('#e2r').onclick = () => { clearInterval(timer); day = 0; h = 70; health = 1; draw(); msg.textContent = 'نبتةٌ جديدةٌ سليمة 🌱'; };
    draw(); foundCard(); msg.textContent = 'كلُّ الشروطِ متوافرة. أطفئْ واحدًا منها لتجرّب';
  }
  exp1();
}

export const LABS = { living: labLiving };
