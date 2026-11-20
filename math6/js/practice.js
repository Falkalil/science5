// تمرّن: يفتحُ التمارينَ «بلا حدود» للدرسِ الحاليّ
export function initPractice(LESSONS, opt) {
  const btn = document.createElement('button'); btn.className = 'tb'; btn.id = 'btnPrac'; btn.title = 'تمرّن بلا حدود';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg><span class="lbl">تمرّن</span>';
  const anchor = document.getElementById('btnLesson'); anchor ? anchor.after(btn) : document.body.appendChild(btn);
  btn.onclick = () => { const cur = window.__book ? window.__book.cur : 1; const l = LESSONS.filter(x => x.kind === 'lesson').find(x => cur >= x.from && cur <= x.to) || LESSONS.filter(x => x.kind === 'lesson').find(x => x.from >= cur) || LESSONS.find(x => x.kind === 'lesson'); opt.open(l, 'inf'); };
  const tp = document.getElementById('toolsPop'); if (tp && !tp.querySelector('[data-t="btnPrac"]')) { const b = document.createElement('button'); b.dataset.t = 'btnPrac'; b.textContent = '🎯 تمرّن بلا حدود'; tp.prepend(b); b.onclick = () => { tp.classList.remove('open'); btn.click(); }; }
  return { open: () => btn.click(), close: () => {}, isOpen: () => false };
}
