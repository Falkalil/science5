// بيانات كتاب الرياضيات: الفهرس (رقم صفحة الملف = الرقم المطبوع)
import { CHAPTERS } from '../lessons/js/toc.js';
export const BOOK = { title: 'الرياضيات – الصف السادس الابتدائي – الفصل الدراسي الأول', pages: 205, w: 1000, h: 1288 };
export const toPdf = p => p;
export const toPrinted = n => n;
export const MODELS = [];
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const ORD = ['', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
export const TOC = [{ t: 'مقدمة الكتاب', items: [['الغلاف', 1], ['المقدمة', 5], ['قائمة المحتويات', 6], ['كيف تستعمل كتابك؟', 8]] },
  ...CHAPTERS.map(C => ({ t: `الفصل ${ORD[C.n]}: ${C.title}`, items: C.units.map(u => [(u.kind === 'lesson' ? AR(u.id) + ' ' : '') + u.t, u.p[0], u.kind === 'test' ? '' : 'ch']) }))];
export const LESSONS = CHAPTERS.flatMap(C => C.units.map(u => ({ id: u.id, title: (u.kind === 'lesson' ? 'الدرس ' + AR(u.id) + ': ' : u.kind === 'explore' ? 'استكشاف: ' : '') + u.t, short: u.t, from: u.p[0], to: u.p[1], kind: u.kind, ch: C.n, color: C.color })));
