// مجسّمات الصف الرابع (١): التصنيف والحيوانات
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, proxy, noiseTexture, tree, arrowTube, vessel, vesselGeo, mergeGeos } from './kit.js';
import { emo, txt, setTxt } from './models6a.js';

export function node(root, ch, pos, s = .9, bg = 'rgba(255,255,255,.85)') {
  const g = new THREE.Group(); const sp = emo(ch, s, bg); g.add(sp);
  const p = new THREE.Mesh(new THREE.SphereGeometry(s * .48, 16, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); g.add(p);
  g.position.set(...pos); root.add(g); return { g, sp, p };
}
const TAU = Math.PI * 2;

/* ═════════ ١) ممالك المخلوقات الحية الست (ص ٤٠–٤١) ═════════ */
export function kingdomsModel(api) {
  const root = new THREE.Group(); let filt = 0, t = 0;
  const K = [
    { id: 'bac', n: 'مملكة البكتيريا', c: '#7fc8e8', uni: 1, nuc: 0, info: 'مخلوقاتٌ وحيدةُ الخلية، خلاياها لا تحتوي على نواة، وتعيشُ في كلِّ مكان: في التربةِ والماءِ والهواءِ وداخلَ أجسامِنا. مثل: البكتيريا العصوية.' },
    { id: 'arc', n: 'مملكة البدائيات', c: '#b9a5e8', uni: 1, nuc: 0, info: 'مخلوقاتٌ وحيدةُ الخليةِ لا تحتوي خلاياها على نوى، يعيشُ كثيرٌ منها في بيئاتٍ قاسيةٍ جدًّا كالينابيعِ الحارّةِ والمياهِ شديدةِ الملوحة.' },
    { id: 'pro', n: 'مملكة الطلائعيات', c: '#8fd6b0', uni: 2, nuc: 1, info: 'خلاياها لها نوى، وقد تكونُ وحيدةَ الخليةِ مثلَ البراميسيوم، أو عديدةَ الخلايا مثلَ بعضِ الطحالب. بعضُها يصنعُ غذاءه وبعضُها يتغذّى على غيرِه.' },
    { id: 'fun', n: 'مملكة الفطريات', c: '#f2c98a', uni: 2, nuc: 1, info: 'خلاياها لها نوى، منها الوحيدُ الخليةِ كالخميرة، ومنها العديدُ الخلايا كالمشرومِ والكمأة. تحصلُ على غذائها من مخلوقاتٍ أخرى ولا تتحرّك.' },
    { id: 'pla', n: 'مملكة النباتات', c: '#9ad46a', uni: 0, nuc: 1, info: 'مخلوقاتٌ عديدةُ الخلايا، خلاياها لها نوى، تصنعُ غذاءها بنفسِها بالبناءِ الضوئيّ، ولا تنتقلُ من مكانِها. مثل: النخيلِ والحزازيات.' },
    { id: 'ani', n: 'مملكة الحيوانات', c: '#f29a8a', uni: 0, nuc: 1, info: 'مخلوقاتٌ عديدةُ الخلايا، خلاياها لها نوى، تحصلُ على غذائها من مخلوقاتٍ أخرى، ومعظمُها يتحرّكُ من مكانٍ إلى آخر. مثل: القطِّ والفهد.' }
  ];
  const groups = K.map((k, i) => {
    const a = i / K.length * TAU + Math.PI / 6, r = 2.7; const g = new THREE.Group(); g.position.set(Math.sin(a) * r, 0, Math.cos(a) * r * .8); root.add(g);
    const base = mesh(new THREE.CylinderGeometry(1, 1.1, .3, 40), mat(k.c, { roughness: .6 }), [0, -1.2, 0]); g.add(base);
    return { k, g, base };
  });
  // البكتيريا: عصيّات
  const bM = mat('#3f9ad0', { roughness: .4 }); const bac = groups[0].g; for (let i = 0; i < 7; i++) { const c = mesh(new THREE.CapsuleGeometry(.09, .45, 6, 12), bM, [Math.cos(i * 1.7) * .5, -.85 + (i % 3) * .14, Math.sin(i * 1.7) * .45], [i, i * .7, Math.PI / 2]); bac.add(c); }
  // البدائيات: كرات صغيرة
  const aM = mat('#7a5ad0', { roughness: .4 }); const arc = groups[1].g; for (let i = 0; i < 9; i++) arc.add(mesh(new THREE.SphereGeometry(.13, 14, 10), aM, [Math.cos(i * 2.1) * .55, -.9 + (i % 2) * .15, Math.sin(i * 2.1) * .5]));
  // الطلائعيات: براميسيوم بيضيّ بأهداب
  const pro = groups[2].g; const pm = mesh(new THREE.SphereGeometry(.42, 24, 16), glass('#5fc898', .55), [0, -.55, 0]); pm.scale.set(1.6, .7, .8); pro.add(pm); pro.add(mesh(new THREE.SphereGeometry(.13, 14, 10), mat('#2e7a52'), [.1, -.55, 0]));
  for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; const c = mesh(new THREE.CylinderGeometry(.008, .008, .16, 4), mat('#2e7a52'), [Math.cos(a) * .7, -.55 + Math.sin(a) * .31, 0]); c.rotation.z = a - Math.PI / 2; pro.add(c); }
  // الفطريات: مشروم
  const fun = groups[3].g; const fs = []; for (const [x, z, s] of [[0, 0, 1], [.45, .25, .7], [-.4, .3, .6]]) { const f = new THREE.Group(); f.add(mesh(new THREE.CylinderGeometry(.09, .12, .5, 12), mat('#f3ead8'), [0, .25, 0])); f.add(mesh(new THREE.SphereGeometry(.34, 24, 12, 0, TAU, 0, Math.PI / 2), mat('#c0392b'), [0, .48, 0])); f.position.set(x, -1.05, z); f.scale.setScalar(s); fun.add(f); fs.push(f); }
  // النباتات: نخلة
  const pla = groups[4].g; const palm = new THREE.Group(); palm.add(tube([[0, 0, 0], [.08, .7, 0], [.15, 1.4, 0]], .07, mat('#8a6a3a'), 20, 8)); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; palm.add(tube([[.15, 1.4, 0], [.15 + Math.cos(a) * .4, 1.6, Math.sin(a) * .4], [.15 + Math.cos(a) * .7, 1.3, Math.sin(a) * .7]], .04, mat('#3f8f32'), 16, 6)); } palm.position.y = -1.05; pla.add(palm);
  // الحيوانات
  const ani = node(groups[5].g, '🐈', [0, -.45, 0], 1.1, null);
  const parts = groups.map((G, i) => ({ id: G.k.id, name: G.k.n, info: G.k.info, objs: [G.base, ...G.g.children.filter(c => c.isMesh)], at: anchor(G.g, [0, .4, 0]) }));
  parts[5].objs.push(ani.p);
  function apply() {
    groups.forEach(G => { const k = G.k; const on = filt === 0 || (filt === 1 && k.uni >= 1) || (filt === 2 && k.uni !== 1) || (filt === 3 && !k.nuc) || (filt === 4 && k.nuc); G.g.scale.setScalar(on ? 1 : .55); G.base.material.opacity = on ? 1 : .35; G.base.material.transparent = !on; });
  }
  return {
    root, parts,
    update(dt) { t += dt; root.rotation.y = Math.sin(t * .15) * .15; bac.children.forEach((c, i) => { if (i > 1) c.rotation.y += dt * .6; }); pm.rotation.y = Math.sin(t) * .3; },
    cam: { pos: [0, 3.2, 8.6], target: [0, -.8, 0] }, inpage: { pos: [0, 3.4, 8.4], target: [0, -.8, 0] },
    controls: [
      { type: 'seg', label: 'أبرزْ الممالكَ التي', options: ['الكل', 'وحيدة الخلية', 'عديدة الخلايا', 'بلا نواة', 'لها نواة'], value: 0, on: k => { filt = k; apply(); api.toast(['اتّفقَ العلماءُ على تقسيمِ المخلوقاتِ الحيّةِ إلى ستِّ ممالك.', 'البكتيريا والبدائياتُ وحيدةُ الخلية، وقد تكونُ الطلائعياتُ والفطرياتُ وحيدةَ الخليةِ أيضًا.', 'النباتاتُ والحيواناتُ عديدةُ الخلايا، وكذلك بعضُ الطلائعياتِ والفطريات.', 'البكتيريا والبدائياتُ فقط خلاياها لا تحتوي على نوى.', 'الطلائعياتُ والفطرياتُ والنباتاتُ والحيواناتُ خلاياها لها نوى.'][k]); } }
    ],
    quiz: [
      { q: 'المس المملكةَ التي تصنعُ غذاءها بنفسِها ولا تنتقل.', a: 'pla' },
      { q: 'المس المملكةَ التي تنتمي إليها الكمأةُ والخميرة.', a: 'fun' },
      { q: 'المس المملكةَ التي ينتمي إليها البراميسيوم.', a: 'pro' },
      { q: 'المس مملكةً عديدةَ الخلايا تتحرّكُ ولا تصنعُ غذاءها.', a: 'ani' }
    ]
  };
}

/* ═════════ ٢) مستويات التصنيف (ص ٤٢–٤٣) ═════════ */
export function taxonomyModel(api) {
  const root = new THREE.Group(); let lvl = 0;
  const L = [
    { n: 'المملكة', e: ['🦗', '🐦', '🐄', '🐹', '🐭', '🐇', '🐿️'], d: 'المملكةُ الحيوانية: أكبرُ مجموعة؛ تتحرّكُ أفرادُها وتتكاثرُ وتتغذّى.' },
    { n: 'الشعبة', e: ['🐦', '🐄', '🐹', '🐭', '🐇', '🐿️'], d: 'الشعبة: تتشابهُ أفرادُها في صفةٍ واحدةٍ على الأقلّ، مثلُ وجودِ عمودٍ فقريٍّ في أجسامِها.' },
    { n: 'الطائفة', e: ['🐄', '🐹', '🐭', '🐇', '🐿️'], d: 'الطائفة: تنتجُ أفرادُ هذه المجموعةِ حليبًا لصغارِها.' },
    { n: 'الرتبة', e: ['🐹', '🐭', '🐿️', '🐿️'], d: 'الرتبة: أفرادُ هذه المجموعةِ لها أسنانٌ أماميةٌ طويلةٌ وحادّة.' },
    { n: 'الفصيلة', e: ['🐿️', '🐿️', '🐿️'], d: 'الفصيلة: أفرادُ هذه المجموعةِ لها ذيولٌ كثيفةُ الشعر (ذيلٌ منفوش).' },
    { n: 'الجنس', e: ['🐿️', '🐿️'], d: 'الجنس: تتسلّقُ أفرادُ هذه المجموعةِ الأشجار.' },
    { n: 'النوع', e: ['🐿️'], d: 'النوع: يحتوي على صنفٍ واحدٍ من المخلوقاتِ الحيّة (صدرٌ أبيضُ وظهرٌ بنّيّ) مثلُ السنجاب.' }
  ];
  const cols = ['#e8f4fc', '#d2ebfa', '#b7def7', '#96cdf0', '#73b9e6', '#4fa3da', '#2f86c4'];
  const rings = L.map((l, i) => { const r = 3.4 - i * .44; const m = mesh(new THREE.CylinderGeometry(r, r, .16, 56), mat(cols[i], { roughness: .7 }), [0, -1.6 + i * .2, 0]); root.add(m); return m; });
  const icons = new THREE.Group(); root.add(icons);
  const title = txt('', .42, '#1a4a7a'); title.position.set(0, 2.2, 0); root.add(title);
  const count = txt('', .3, '#555'); count.position.set(0, 1.65, 0); root.add(count);
  function apply() {
    icons.clear(); const l = L[lvl]; const n = l.e.length; const y = -1.6 + lvl * .2 + .5;
    l.e.forEach((ch, j) => { const a = j / n * TAU; const r = n === 1 ? 0 : Math.min(2.6 - lvl * .3, .45 + n * .17); const s = emo(ch, n === 1 ? 1.3 : .62); s.position.set(Math.sin(a) * r, y + (n === 1 ? .3 : 0), Math.cos(a) * r * .7); icons.add(s); });
    rings.forEach((m, i) => { m.visible = i <= lvl; m.material.emissive = new THREE.Color(i === lvl ? '#2266aa' : '#000'); m.material.emissiveIntensity = i === lvl ? .25 : 0; });
    setTxt(title, l.n); setTxt(count, 'عددُ الأفرادِ يقلُّ والتشابهُ يزداد');
  }
  apply();
  const parts = L.map((l, i) => ({ id: 'l' + i, name: l.n, info: l.d, objs: [rings[i]], at: anchor(root, [3.2 - i * .44, -1.5 + i * .2, 0]), hidden: () => i > lvl }));
  return {
    root, parts,
    update(dt) { icons.rotation.y += dt * .25; },
    cam: { pos: [0, 3.6, 8.6], target: [0, -.4, 0] }, inpage: { pos: [0, 3.4, 8.6], target: [0, -.3, 0] },
    controls: [{ type: 'steps', value: 0, steps: L.map((l, i) => ({ t: (i + 1) + '- ' + l.n, d: l.d })), on: i => { lvl = i; apply(); api.refreshParts && api.refreshParts(); } }],
    quiz: [{ q: 'انتقل إلى المستوى الأخير، ثم المس أصغرَ مجموعة.', a: 'l6' }, { q: 'المس المستوى الذي يضمُّ أكبرَ عددٍ من المخلوقات.', a: 'l0' }]
  };
}

/* ═════════ ٣) مجموعات اللافقاريات الثماني (ص ٥٨–٦٢) ═════════ */
export function invertModel(api) {
  const root = new THREE.Group(); let sel = -1, t = 0;
  const G = [];
  const add = (id, n, info, build, sea) => { const g = new THREE.Group(); build(g); root.add(g); G.push({ id, n, info, g, sea }); };
  // ١ الإسفنج
  add('sponge', 'الإسفنجيات', 'أبسطُ اللافقاريات؛ جسمٌ يشبهُ كيسًا له فتحةٌ في أعلاه، مجوّفٌ من الداخلِ ويتكوّنُ من طبقتين. يعيشُ في الماء، والبالغُ عديمُ الحركة.', g => {
    const m = mat('#e6b54a', { roughness: .95, map: noiseTexture('#e8b84e', '#b8862a', 2500) }); for (const [x, h] of [[0, 1.1], [.35, .8], [-.3, .7]]) { const c = mesh(new THREE.CylinderGeometry(.2, .14, h, 20, 1, true), m, [x, h / 2, 0]); m.side = THREE.DoubleSide; g.add(c); g.add(mesh(new THREE.TorusGeometry(.2, .03, 8, 20), mat('#c89030'), [x, h, 0], [Math.PI / 2, 0, 0])); for (let k = 0; k < 6; k++) g.add(mesh(new THREE.CircleGeometry(.03, 8), mat('#6a4a10'), [x + Math.cos(k) * .19, .2 + k * h / 7, Math.sin(k) * .19], [0, -k, 0])); }
  }, 1);
  // ٢ اللاسعات (قنديل البحر)
  let jelly; add('cnid', 'اللاسعات', 'لها لوامسُ تشبهُ الأذرعَ تنتهي بخلايا لاسعةٍ تشلُّ حركةَ الفريسة. منها قنديلُ البحرِ الذي يطفو ويسبح، والمرجانُ عديمُ الحركة.', g => {
    jelly = new THREE.Group(); jelly.add(mesh(new THREE.SphereGeometry(.45, 28, 16, 0, TAU, 0, Math.PI / 2), glass('#d06ad8', .6))); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; jelly.add(tube([[Math.cos(a) * .35, 0, Math.sin(a) * .35], [Math.cos(a) * .4, -.4, Math.sin(a) * .4], [Math.cos(a) * .3, -.9, Math.sin(a) * .3]], .015, mat('#e9a0ef'), 16, 5)); } jelly.position.y = .9; g.add(jelly);
  }, 1);
  // ٣ الديدان المفلطحة
  add('flat', 'الديدان المفلطحة', 'أجسامُها مسطّحة، لها رأسٌ وذيل، وهي أبسطُ أنواعِ الديدان. معظمُها غيرُ ضارّ، وبعضُها يعيشُ داخلَ أجسامِ حيواناتٍ أخرى.', g => {
    const f = mesh(new THREE.SphereGeometry(.5, 24, 12), mat('#c43a5a'), [0, .15, 0]); f.scale.set(.45, .06, 1.4); g.add(f); g.add(mesh(new THREE.SphereGeometry(.04, 8, 6), mat('#111'), [.08, .2, .55])); g.add(mesh(new THREE.SphereGeometry(.04, 8, 6), mat('#111'), [-.08, .2, .55]));
  }, 0);
  // ٤ الديدان الأسطوانية
  add('round', 'الديدان الأسطوانية', 'لها أجسامٌ رفيعةٌ ونهاياتٌ مدبّبة، ومعظمُها يعيشُ داخلَ أجسامِ بعضِ الحيوانات.', g => { g.add(tube([[-.6, .15, -.3], [-.2, .15, .3], [.2, .15, -.2], [.6, .15, .3]], .045, mat('#f0a8a0'), 40, 8)); }, 0);
  // ٥ الرخويات (حلزون)
  add('mollusk', 'الرخويات', 'أجسامُها ليّنةٌ لها تراكيبُ صلبةٌ لدعمِها وحمايتِها كالأصداف. منها الحلزونُ (يعيشُ على اليابسة) والحبّارُ والأخطبوطُ والمحار.', g => {
    const shellM = mat('#a0703a', { roughness: .5 }); for (let k = 0; k < 18; k++) { const a = k * .55, r = .05 + k * .022; g.add(mesh(new THREE.SphereGeometry(.06 + k * .013, 12, 10), shellM, [Math.cos(a) * r, .45 + Math.sin(a) * r, -.05])); }
    const body = mesh(new THREE.CapsuleGeometry(.13, .9, 6, 12), mat('#d8c8a0'), [0, .12, .1], [0, 0, Math.PI / 2]); g.add(body); g.add(tube([[.5, .2, .1], [.6, .45, .1]], .02, mat('#d8c8a0'), 8, 6));
  }, 0);
  // ٦ الديدان الحلقية (دودة الأرض)
  const segs = []; add('annel', 'الديدان الحلقية', 'تنتمي إليها دودةُ الأرض؛ جسمُها مقسّمٌ إلى حلقاتٍ متماثلةٍ ما عدا الرأسَ ونهايةَ الذيل، وتعيشُ على اليابسة.', g => { const m = mat('#d77f7f', { roughness: .5 }); for (let k = 0; k < 16; k++) { const s = mesh(new THREE.SphereGeometry(.1, 14, 10), m, [-.75 + k * .1, .12, 0]); s.scale.set(.75, 1, 1); g.add(s); segs.push(s); } g.add(mesh(new THREE.TorusGeometry(.1, .025, 8, 16), mat('#b05050'), [-.25, .12, 0], [0, Math.PI / 2, 0])); }, 0);
  // ٧ المفصليات (عنكبوت/حشرة)
  add('arthro', 'المفصليات', 'أكبرُ مجموعةٍ في اللافقاريات؛ أرجلٌ مفصليّةٌ وأجسامٌ مقسّمةٌ إلى أجزاءٍ وهيكلٌ خارجيٌّ صلبٌ تطرحُه عندما تنمو. مجموعاتُها: الحشرات، العديدةُ الأرجل، القشريات، العنكبيات.', g => {
    const m = mat('#3a2a1a', { roughness: .4 }); g.add(mesh(new THREE.SphereGeometry(.25, 16, 12), m, [0, .35, -.2])); g.add(mesh(new THREE.SphereGeometry(.17, 16, 12), m, [0, .32, .2]));
    for (let s of [-1, 1]) for (let k = 0; k < 4; k++) { const z = .28 - k * .14; g.add(tube([[s * .12, .32, z], [s * .45, .55, z + .05], [s * .7, 0, z + .1]], .025, m, 12, 5)); }
  }, 0);
  // ٨ شوكيات الجلد (نجم البحر)
  add('echino', 'شوكيات الجلد', 'جلدُها يحملُ أشواكًا، ولها دعامةٌ داخليةٌ تسمّى الهيكلَ الداخليّ. منها قنفذُ البحرِ ونجمُ البحر.', g => { const m = mat('#f07a3a', { roughness: .6 }); g.add(mesh(new THREE.SphereGeometry(.18, 16, 10), m, [0, .1, 0])); for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; const c = mesh(new THREE.ConeGeometry(.13, .65, 10), m, [Math.cos(a) * .33, .08, Math.sin(a) * .33]); c.rotation.set(0, -a, -Math.PI / 2); c.scale.z = .5; g.add(c); for (let q = 1; q < 4; q++) g.add(mesh(new THREE.SphereGeometry(.025, 6, 4), mat('#fff0d0'), [Math.cos(a) * q * .14, .15, Math.sin(a) * q * .14])); } }, 1);
  // المنصّات
  const sea = mesh(new THREE.CylinderGeometry(4, 4, .18, 64, 1, false, -Math.PI / 2, Math.PI), mat('#4aa3d8', { roughness: .4, transparent: true, opacity: .85 }), [0, -.1, 0]); root.add(sea);
  const land = mesh(new THREE.CylinderGeometry(4, 4, .18, 64, 1, false, Math.PI / 2, Math.PI), mat('#9a7a4a', { map: noiseTexture('#a07e4c', '#7a5a30', 3000) }), [0, -.1, 0]); root.add(land);
  const lw = txt('في الماء', .3, '#0a4a7a'); lw.position.set(2.9, .1, -1.4); root.add(lw); const ll = txt('على اليابسة (أو داخل الحيوانات)', .26, '#5a3a10'); ll.position.set(-2.4, .1, -1.4); root.add(ll);
  const seaIdx = G.filter(x => x.sea), landIdx = G.filter(x => !x.sea);
  seaIdx.forEach((x, i) => { const a = -Math.PI / 2 + (i + .5) / seaIdx.length * Math.PI; x.g.position.set(Math.sin(a) * 2.7, 0, Math.cos(a) * 2.2); });
  landIdx.forEach((x, i) => { const a = Math.PI / 2 + (i + .5) / landIdx.length * Math.PI; x.g.position.set(Math.sin(a) * 2.8, 0, Math.cos(a) * 2.3); });
  const parts = G.map(x => ({ id: x.id, name: x.n, info: x.info, objs: x.g.children.filter(c => c.isMesh || c.isGroup), at: anchor(x.g, [0, 1.1, 0]) }));
  function apply() { G.forEach((x, i) => x.g.scale.setScalar(sel < 0 || sel === i ? (sel === i ? 1.35 : 1) : .7)); }
  return {
    root, parts,
    update(dt) { t += dt; if (jelly) { jelly.position.y = .9 + Math.sin(t * 2) * .12; jelly.scale.y = 1 + Math.sin(t * 4) * .08; } segs.forEach((s, k) => { s.position.z = Math.sin(t * 3 - k * .5) * .08; s.scale.x = .75 + Math.sin(t * 3 - k * .5) * .12; }); },
    cam: { pos: [0, 4.2, 7.4], target: [0, 0, 0] }, inpage: { pos: [0, 4.6, 7], target: [0, 0, 0] },
    controls: [{ type: 'seg', label: 'المجموعة', options: ['الكل', ...G.map(x => x.n.replace('الديدان ', 'د. '))], value: 0, on: k => { sel = k - 1; apply(); if (sel >= 0) api.toast(G[sel].info); } }],
    quiz: [{ q: 'المس أبسطَ اللافقاريات.', a: 'sponge' }, { q: 'المس المجموعةَ التي لها هيكلٌ داخليٌّ وجلدٌ شوكيّ.', a: 'echino' }, { q: 'المس أكبرَ مجموعةٍ في اللافقاريات.', a: 'arthro' }, { q: 'المس المجموعةَ التي تنتمي إليها دودةُ الأرض.', a: 'annel' }, { q: 'المس الحيوانَ الذي له لوامسُ لاسعة.', a: 'cnid' }]
  };
}

/* ═════════ ٤) العمود الفقري — نموذج الصلصال (ص ٦٧–٦٨) ═════════ */
export function spineModel(api) {
  const root = new THREE.Group(); let hasSpine = true, load = 0, sag = 0, t = 0, cls = 0;
  const clay = mat('#7ad08a', { roughness: .8 });
  const body = new THREE.Group(); root.add(body);
  const trunk = mesh(new THREE.CapsuleGeometry(.55, 2.6, 10, 24), glass('#7ad08a', .45), [0, .9, 0], [0, 0, Math.PI / 2]); body.add(trunk);
  const head = mesh(new THREE.SphereGeometry(.5, 24, 18), clay, [-1.95, 1.35, 0]); body.add(head);
  const legs = []; for (const [x, z] of [[-1, -.35], [-1, .35], [1, -.35], [1, .35]]) { const l = mesh(new THREE.CylinderGeometry(.16, .14, 1.1, 12), clay, [x, .05, z]); body.add(l); legs.push(l); }
  /* هيكلُ سمكةٍ مفلطحةٍ شفّافة (العظامُ ملوّنةٌ كما في صورةِ الكتاب) */
  const fish = new THREE.Group(); fish.position.set(0, 1.2, 0); root.add(fish); let fishMode = true;
  const bodyM = new THREE.MeshPhysicalMaterial({ color: '#f4e6e8', transparent: true, opacity: .32, roughness: .2, clearcoat: 1, depthWrite: false, side: 2 });
  const fb = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), bodyM); fb.scale.set(2.3, 1.05, .16); fb.renderOrder = 5; fish.add(fb);
  const boneM = new THREE.MeshPhysicalMaterial({ color: '#d0287a', roughness: .35, clearcoat: .6 }), cartM = new THREE.MeshPhysicalMaterial({ color: '#4a7ad8', roughness: .35, clearcoat: .6 });
  const fv = [], rays = [], spines = []; const vG = new THREE.CylinderGeometry(.045, .045, .085, 12); vG.rotateZ(Math.PI / 2);
  const outline = x => 1.05 * Math.sqrt(Math.max(0, 1 - Math.pow(x / 2.3, 2)));
  for (let i = 0; i < 34; i++) { const x = -1.35 + i * .095, y = .02 + Math.sin(i * .1) * .02; const v = mesh(vG, boneM, [x, y, 0]); fish.add(v); fv.push(v);
    const h = outline(x) * .82, lean = .35;
    spines.push(vesselGeo([[x, y + .04, 0], [x + lean * .5 * h, y + h * .55, 0], [x + lean * h, y + h * .95, 0]], .012, .006, 8, 5, 0));
    spines.push(vesselGeo([[x, y - .04, 0], [x + lean * .5 * h, y - h * .55, 0], [x + lean * h, y - h * .95, 0]], .012, .006, 8, 5, 0)); }
  for (let i = 0; i < 46; i++) { const x = -1.6 + i * .082; if (x > 1.9) break; const h = outline(x); for (const s2 of [1, -1]) { if (s2 < 0 && x < -.9) continue; rays.push(vesselGeo([[x, s2 * h * .92, 0], [x + .05, s2 * (h + .12), 0], [x + .1, s2 * (h + .28), 0]], .007, .004, 6, 4, 0)); } }
  for (let i = 0; i < 16; i++) { const a = (i / 15 - .5) * 1.3; rays.push(vesselGeo([[1.9, 0, 0], [2.3 + Math.cos(a) * .2, Math.sin(a) * .35, 0], [2.4 + Math.cos(a) * .5, Math.sin(a) * .7, 0]], .009, .005, 8, 4, 0)); }
  const spM = new THREE.Mesh(mergeGeos(spines), boneM), rayM = new THREE.Mesh(mergeGeos(rays), cartM); fish.add(spM, rayM);
  const skull = new THREE.Group(); fish.add(skull);
  skull.add(mesh(new THREE.SphereGeometry(.45, 40, 28), new THREE.MeshPhysicalMaterial({ color: '#e04a8a', transparent: true, opacity: .55, roughness: .3, clearcoat: .8 }), [-1.7, .1, 0], null, [1, .9, .2]));
  skull.add(mesh(new THREE.TorusGeometry(.16, .035, 10, 28), boneM, [-1.78, .3, .03]), mesh(new THREE.SphereGeometry(.12, 20, 14), new THREE.MeshPhysicalMaterial({ color: '#1a1a1a', roughness: .1, clearcoat: 1 }), [-1.78, .3, .06]));
  skull.add(vessel([[-2.18, -.05, 0], [-2.0, -.22, 0], [-1.6, -.28, 0]], .035, .03, boneM, 12, 8), vessel([[-2.2, .02, 0], [-1.95, .05, 0], [-1.7, .0, 0]], .03, .025, boneM, 12, 8));
  skull.add(vessel([[-1.3, .55, 0], [-1.25, 0, 0], [-1.35, -.6, 0]], .03, .025, cartM, 16, 8));
  for (let i = 0; i < 10; i++) rays.length; const pect = []; for (let i = 0; i < 9; i++) { const a = -.6 + i * .12; pect.push(vesselGeo([[-1.15, -.15, .05], [-.85 + Math.cos(a) * .1, -.15 + Math.sin(a) * .35, .08], [-.6 + Math.cos(a) * .2, -.15 + Math.sin(a) * .6, .1]], .008, .004, 8, 4, 0)); } fish.add(new THREE.Mesh(mergeGeos(pect), cartM));
  // العمود الفقري
  const spine = new THREE.Group(); body.add(spine); const verts = [], discs = [];
  for (let i = 0; i < 15; i++) { const x = -1.6 + i * .23; const v = mesh(new THREE.CylinderGeometry(.09, .09, .16, 14), mat('#f5f0e0', { roughness: .5 }), [x, 1.05, 0], [0, 0, Math.PI / 2]); spine.add(v); verts.push(v); const sp = mesh(new THREE.BoxGeometry(.05, .16, .05), mat('#efe6cc'), [x, 1.2, 0]); spine.add(sp); verts.push(sp); if (i < 14) { const d = mesh(new THREE.CylinderGeometry(.07, .07, .06, 12), mat('#7fb6e8'), [x + .115, 1.05, 0], [0, 0, Math.PI / 2]); spine.add(d); discs.push(d); } }
  const cord = tube([[-1.9, 1.12, 0], [1.6, 1.12, 0]], .025, mat('#f2d04a', { emissive: '#f2d04a', emissiveIntensity: .3 }), 20, 8); spine.add(cord);
  const weights = new THREE.Group(); root.add(weights); const balls = []; for (let i = 0; i < 6; i++) { const b = mesh(new THREE.SphereGeometry(.22, 16, 12), mat('#e86a6a'), [-.9 + i * .36, 1.75, 0]); weights.add(b); balls.push(b); }
  const ground = mesh(new THREE.BoxGeometry(6, .1, 2.4), mat('#e8dcc4'), [0, -.55, 0]); root.add(ground);
  const lab = txt('', .3, '#333'); lab.position.set(0, -1.1, 1.3); root.add(lab);
  // طوائف الفقاريات
  const C = [['🐟', 'الأسماك', 'متغيرة'], ['🐸', 'البرمائيات', 'متغيرة'], ['🦎', 'الزواحف', 'متغيرة'], ['🐦', 'الطيور', 'ثابتة'], ['🐘', 'الثدييات', 'ثابتة']];
  const ring = new THREE.Group(); ring.position.set(0, 2.4, -1.4); root.add(ring); const cn = C.map(([e, n, k], i) => { const nd = node(ring, e, [-2.4 + i * 1.2, 0, 0], .7, k === 'ثابتة' ? 'rgba(255,190,150,.9)' : 'rgba(150,200,255,.9)'); return nd; });
  function apply() {
    fish.visible = fishMode; body.visible = weights.visible = ground.visible = lab.visible = !fishMode; ring.position.y = fishMode ? 3.1 : 2.4;
    const cap = hasSpine ? 6 : 1; const over = Math.max(0, load - cap); sag = hasSpine ? Math.min(.15, load * .02) : Math.min(1, .15 + load * .18);
    spine.visible = hasSpine; balls.forEach((b, i) => b.visible = i < load);
    setTxt(lab, hasSpine ? (load ? `يحملُ ${'٠١٢٣٤٥٦'[load]} كراتٍ دونَ أن ينهار — العمودُ الفقريُّ يدعمُ الجسم` : 'نموذجٌ له عمودٌ فقريّ (قلم)') : (load > 1 ? 'انهارَ النموذج! لا يوجدُ ما يدعمُ الجسم' : 'نموذجٌ بلا عمودٍ فقريّ'), hasSpine ? '#1a6a3a' : '#a02020');
  }
  apply();
  const parts = [
    { id: 'fvert', name: 'العمود الفقري للسمكة', info: 'هل أستطيعُ تحديدَ العمودِ الفقريِّ في هذه السمكة؟ إنّه سلسلةُ الفقراتِ الممتدّةُ من الرأسِ إلى الذيل، وتخرجُ منها أشواكٌ عظميّةٌ إلى أعلى وإلى أسفل.', objs: [...fv, spM], at: anchor(fish, [.2, .25, .1]), hidden: () => !fishMode },
    { id: 'fskull', name: 'الجمجمة (إثراء)', info: 'تحمي الجمجمةُ الدماغَ والعينين، وتتّصلُ بالعمودِ الفقريّ.', objs: skull.children, at: anchor(fish, [-1.7, .7, .1]), hidden: () => !fishMode },
    { id: 'frays', name: 'أشعّة الزعانف (إثراء)', info: 'عظامٌ رفيعةٌ تدعمُ الزعانفَ التي تساعدُ السمكةَ على السباحةِ والتوازن.', objs: [rayM], at: anchor(fish, [1.2, 1.15, .1]), hidden: () => !fishMode },
    { id: 'vert', name: 'الفقرات (العمود الفقري)', info: 'العمودُ الفقريُّ جزءٌ من الهيكلِ الداخليِّ يدعمُ الجسمَ ويسمحُ بحرّيةِ الحركةِ للحيواناتِ الثقيلة، وهو ما يميّزُ الفقارياتِ من اللافقاريات.', objs: verts, at: anchor(spine, [.3, 1.35, 0]), hidden: () => !hasSpine || fishMode },
    { id: 'cord', name: 'الحبل الشوكي', info: 'يمتدُّ داخلَ الفقراتِ التي تحميه، ويوصلُ الإشاراتِ العصبيةَ بينَ الدماغِ والجسم.', objs: [cord], at: anchor(spine, [1.4, 1.2, 0]), hidden: () => !hasSpine || fishMode },
    { id: 'legs', name: 'الأرجل', info: 'في النموذجِ الثالثِ تمثّلُ الأقلامُ في الأرجلِ عظامَ الأرجلِ التي تحملُ وزنَ الجسمِ أيضًا.', objs: legs, at: anchor(body, [1, -.2, .4]) },
    ...cn.map((nd, i) => ({ id: 'c' + i, name: C[i][1], info: `فقارياتٌ ${C[i][2]} درجةِ الحرارة.`, objs: [nd.p], at: anchor(nd.g, [0, .5, 0]) }))
  ];
  return {
    root, parts,
    update(dt) { t += dt; const cur = trunk.userData.s || 0; const s = lerp(cur, sag, Math.min(1, dt * 4)); trunk.userData.s = s; body.position.y = -s * .9; trunk.scale.set(1 + s * .3, 1 - s * .25, 1 + s * .5); legs.forEach(l => { l.scale.y = 1 - s * .6; l.position.y = .05 - s * .3; }); weights.position.y = -s * 1.1; cn.forEach((n, i) => n.g.position.y = Math.sin(t * 2 + i) * .06); },
    cam: { pos: [.5, 2.6, 8.4], target: [0, .9, 0] }, inpage: { pos: [.4, 2.4, 8.6], target: [0, .9, 0] },
    controls: [
      { type: 'seg', label: 'النموذج', options: ['هيكل سمكة (الكتاب)', 'له عمودٌ فقريّ', 'بلا عمودٍ فقريّ'], value: 0, on: k => { fishMode = k === 0; hasSpine = k !== 2; apply(); api.refreshParts && api.refreshParts(); } },
      { type: 'slider', label: 'كرات الصلصال (الوزن)', min: 0, max: 6, step: 1, value: 0, fmt: v => '٠١٢٣٤٥٦'[Math.round(v)], on: v => { load = Math.round(v); apply(); } }
    ],
    legend: [['#ffbe96', 'ثابتة درجة الحرارة'], ['#96c8ff', 'متغيرة درجة الحرارة']],
    quiz: [{ q: 'المس الجزءَ الذي يميّزُ الفقارياتِ من اللافقاريات.', a: 'vert' }, { q: 'المس طائفةً ثابتةَ درجةِ الحرارةِ لها ريش.', a: 'c3' }, { q: 'المس طائفةً متغيّرةَ درجةِ الحرارةِ تقضي جزءًا من حياتِها في الماءِ وجزءًا على اليابسة.', a: 'c1' }]
  };
}
