// الدرسُ التفاعليّ: يُعرضُ تطبيقُ دروسِ الرياضيّاتِ في لوحةٍ فوقَ الكتاب
const CSS = `
#mLesson{position:fixed;inset:0;z-index:60;background:#fffaf2;display:none;flex-direction:column}
#mLesson.open{display:flex}
#mLesson iframe{flex:1;border:0;width:100%;background:#fffaf2}
#lessonChip{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(74px + env(safe-area-inset-bottom));z-index:40;display:none;border:0;border-radius:999px;padding:10px 18px;background:linear-gradient(135deg,#c8102e,#e8503a);color:#fff;font:800 15px Tajawal,sans-serif;box-shadow:0 6px 18px #0006;max-width:92vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;animation:chipIn .4s}
@keyframes chipIn{from{opacity:0;transform:translate(-50%,10px)}}
body.hl #lessonChip,body.nt #lessonChip,body.zoomed #lessonChip{display:none!important}`;
export function initLessons(LESSONS, opt) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const root = document.createElement('div'); root.id = 'mLesson'; root.innerHTML = '<iframe title="الدرس التفاعلي" allow="fullscreen"></iframe>'; document.body.appendChild(root);
  const fr = root.querySelector('iframe');
  const chip = document.createElement('button'); chip.id = 'lessonChip'; document.body.appendChild(chip);
  let current = null, page = 1;
  const base = () => window.__LESSON_URL || 'lessons/index.html?embed=1';
  function open(l, tab = 0) {
    current = l; root.classList.add('open'); chip.style.display = 'none'; document.body.classList.add('lsOpen');
    const url = base() + '#/' + (l ? 'u/' + l.id + '/' + tab : '');
    if (fr.dataset.loaded) { try { fr.contentWindow.location.hash = '#/' + (l ? 'u/' + l.id + '/' + tab : ''); return; } catch (e) {} }
    fr.src = url; fr.dataset.loaded = 1;
  }
  function close() { root.classList.remove('open'); document.body.classList.remove('lsOpen'); update(page); }
  function update(cur) { page = cur;
    const l = LESSONS.find(x => cur >= x.from && cur <= x.to);
    chip.style.display = l && !root.classList.contains('open') ? 'block' : 'none';
    if (l) { chip.textContent = (l.kind === 'test' ? '📝 ابدأ: ' : '▶ ابدأ الدرسَ التفاعليّ: ') + l.short; chip.onclick = () => open(l); }
  }
  addEventListener('message', e => { const d = e.data || {}; if (d.mb === 'close') close(); if (d.mb === 'go') { close(); opt.goTo(d.p); } });
  return { open, close, update, isOpen: () => root.classList.contains('open') };
}
