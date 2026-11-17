// مجسّمات الصف السادس (٢): النباتات وأجهزة الجسم والأنظمة البيئية
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, proxy, noiseTexture, tree, cloud, arrowTube } from './kit.js';
import { emo, txt, setTxt } from './models6a.js';

/* ═════════ ١) دورة حياة نبات حزازي (ص ٨٦) ═════════ */
export function mossModel(api) {
  const root = new THREE.Group(); let step = -1, t = 0;
  const R = 2.6; const pos = i => { const a = Math.PI / 2 - i / 5 * Math.PI * 2; return [Math.cos(a) * R, Math.sin(a) * R * .8, 0]; };
  const leafM = mat('#3f9a3a', { roughness: .6 }), leafM2 = mat('#6cbf4a');
  function moss(s = 1) { const g = new THREE.Group(); for (let i = 0; i < 14; i++) { const l = mesh(new THREE.ConeGeometry(.07, .5, 5), i % 2 ? leafM : leafM2); const a = i / 14 * Math.PI * 2; l.position.set(Math.cos(a) * .12, .25 + (i % 4) * .1, Math.sin(a) * .12); l.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); g.add(l); } g.add(mesh(new THREE.CylinderGeometry(.04, .05, .6, 6), mat('#5a8a3a'), [0, .3, 0])); for (let k = 0; k < 4; k++) g.add(tube([[0, 0, 0], [(k - 1.5) * .08, -.15, .05], [(k - 1.5) * .15, -.3, 0]], .01, mat('#8a6a4a'), 8, 4)); g.scale.setScalar(s); return g; }
  const stages = [];
  // 0 محفظة الأبواغ على ساق
  const s0 = new THREE.Group(); const m0 = moss(.8); s0.add(m0); const stalk = tube([[0, .5, 0], [.05, 1.1, 0], [0, 1.5, 0]], .025, mat('#c9a04a'), 12, 6); const caps = mesh(new THREE.CapsuleGeometry(.09, .22, 6, 10), mat('#b5772a'), [0, 1.62, 0]); s0.add(stalk, caps);
  // 1 أبواغ تتطاير
  const s1 = new THREE.Group(); const spores = []; for (let i = 0; i < 26; i++) { const sp = mesh(new THREE.SphereGeometry(.035, 6, 5), mat('#d9b44a'), [(Math.random() - .5) * .9, Math.random() * .9, (Math.random() - .5) * .4]); s1.add(sp); spores.push(sp); }
  // 2 نبات حزازي جديد
  const s2 = new THREE.Group(); const m2 = moss(.55); s2.add(m2);
  // 3 حزاز ورقي بفرعين ذكري وأنثوي
  const s3 = new THREE.Group(); const m3 = moss(1.2); s3.add(m3); const male = mesh(new THREE.CapsuleGeometry(.08, .35, 6, 10), mat('#7ab84a'), [-.25, 1.05, 0]); const female = mesh(new THREE.CapsuleGeometry(.08, .35, 6, 10), mat('#4a9a5a'), [.25, 1.05, 0]); s3.add(male, female);
  // 4 بويضة مخصبة ونموّ محفظة
  const s4 = new THREE.Group(); const fem = mesh(new THREE.CapsuleGeometry(.22, .6, 8, 14), glass('#6fbf5a', .55), [0, .4, 0]); const egg = mesh(new THREE.SphereGeometry(.13, 14, 10), mat('#d93a3a'), [0, .3, 0]); s4.add(fem, egg); const sperm = []; for (let i = 0; i < 4; i++) { const s = mesh(new THREE.CapsuleGeometry(.025, .12, 4, 6), mat('#5a5ad9')); s.position.set(-.6 + i * .1, .7 - i * .1, 0); s4.add(s); sperm.push(s); }
  [s0, s1, s2, s3, s4].forEach((g, i) => { g.position.set(...pos(i)); g.position.y -= .5; root.add(g); stages.push(g); });
  // أسهم الدورة
  const arrows = []; for (let i = 0; i < 5; i++) { const a0 = Math.PI / 2 - i / 5 * Math.PI * 2 - .35, a1 = a0 - .55; const pts = []; for (let k = 0; k <= 8; k++) { const a = lerp(a0, a1, k / 8); pts.push([Math.cos(a) * R * 1.05, Math.sin(a) * R * .85 - .1, -.3]); } const ar = arrowTube(pts, .05, '#e03030', .25); root.add(ar); arrows.push(ar); }
  const lab = ['محفظة أبواغ', 'أبواغ', 'نبات حزازي جديد', 'حزاز ورقي (فرع ذكري وأنثوي)', 'إخصاب البويضة'];
  const parts = [
    { id: 'caps', name: 'محفظة الأبواغ', info: 'في الطورِ البوغيِّ يحدثُ التكاثرُ اللاجنسيّ؛ حيث ينتجُ النباتُ الأبواغَ داخلَ محفظةٍ على ساق.', objs: [caps, stalk], at: anchor(s0, [0, 1.9, 0]) },
    { id: 'spore', name: 'الأبواغ', info: 'الحزازياتُ نباتاتٌ لابذريةٌ تتكاثرُ بالأبواغ، والأبواغُ خلايا يمكنُها أن تنموَ فتصبحَ نباتاتٍ جديدة.', objs: spores, at: anchor(s1, [0, 1.1, 0]) },
    { id: 'young', name: 'نبات حزازي جديد', info: 'تنمو الأبواغُ عندما تسقطُ في مكانٍ رطبٍ مناسب، فينتجُ نباتٌ حزازيٌّ جديد.', objs: m2.children, at: anchor(s2, [0, .6, 0]) },
    { id: 'game', name: 'الفرعان الذكري والأنثوي', info: 'المرحلةُ الأخرى في دورةِ حياتِها طورُ التكاثرِ الجنسيِّ وتسمّى الطورَ الجاميتيّ، ويحتاجُ النباتُ فيه إلى مشيجٍ مذكّرٍ ومشيجٍ مؤنّثٍ لكي يتكاثر.', objs: [male, female], at: anchor(s3, [0, 1.4, 0]) },
    { id: 'egg', name: 'البويضة المخصبة', info: 'يسبحُ المشيجُ المذكّرُ في الماءِ إلى البويضةِ فيخصبُها، فتنمو لتكوّنَ محفظةَ أبواغٍ جديدة. وتسمّى هذه العمليةُ المستمرّةُ ظاهرةَ تعاقبِ الأجيال.', objs: [egg, fem], at: anchor(s4, [0, 1, 0]) }
  ];
  function hi() { stages.forEach((g, i) => g.scale.setScalar(step < 0 || i === step ? 1 : .75)); arrows.forEach((a, i) => a.visible = step < 0 || i === step); }
  hi();
  return {
    root, parts,
    update(dt) { t += dt; spores.forEach((s, i) => { s.position.y = ((t * .3 + i * .07) % 1) * 1.1; s.position.x = Math.sin(t + i) * .45; }); sperm.forEach((s, i) => { const k = (t * .4 + i * .25) % 1; s.position.set(lerp(-.7, 0, k), lerp(.8, .35, k), 0); s.rotation.z = -1.2; }); },
    cam: { pos: [0, .3, 8.5], target: [0, -.3, 0] }, inpage: { pos: [0, .2, 8.4], target: [0, -.3, 0] },
    controls: [{ type: 'steps', value: -1, steps: lab.map((l, i) => ({ t: (i + 1) + '- ' + l, d: parts[i].info })), on: i => { step = i; hi(); } }],
    legend: [['#e03030', 'مراحل الدورة']],
    quiz: [
      { q: 'المس المكانَ الذي تتكوّنُ فيه الأبواغ.', a: 'caps' },
      { q: 'المس الأبواغَ المتطايرة.', a: 'spore' },
      { q: 'المس الفرعينِ الذكريَّ والأنثويّ.', a: 'game' }
    ]
  };
}

/* ── جسم إنسان شفاف ── */
function body(op = .14) {
  const g = new THREE.Group(); const m = glass('#f2c8a8', op, { side: 2 });
  g.add(mesh(new THREE.SphereGeometry(.75, 28, 20), m, [0, 3.3, 0])); g.add(mesh(new THREE.CapsuleGeometry(1.25, 2.4, 10, 24), m, [0, .6, 0]));
  g.children[1].scale.set(1, 1, .6); g.add(mesh(new THREE.CylinderGeometry(.3, .35, .4, 16), m, [0, 2.55, 0])); return g;
}

/* ═════════ ٢) الجهاز الهضمي (ص ١١١) ═════════ */
export function digestiveModel(api) {
  const root = new THREE.Group(); let speed = 1; root.add(body());
  const mouth = mesh(new THREE.TorusGeometry(.18, .05, 8, 20, Math.PI), mat('#c04a5a'), [0, 3.05, .6], [0, 0, Math.PI]); root.add(mouth);
  const eso = tube([[0, 3.0, .4], [0, 2.6, .1], [.05, 1.8, 0], [.25, 1.25, 0]], .09, mat('#e89aa0'), 30, 10); root.add(eso);
  const stomach = mesh(new THREE.SphereGeometry(.55, 28, 20), mat('#e07a86', { roughness: .45 }), [.55, .95, 0]); stomach.scale.set(1.15, .75, .7); stomach.rotation.z = -.5; root.add(stomach);
  const liver = mesh(new THREE.SphereGeometry(.75, 28, 20), mat('#8a3a2a', { roughness: .5 }), [-.5, 1.3, .1]); liver.scale.set(1.2, .55, .6); root.add(liver);
  const panc = mesh(new THREE.CapsuleGeometry(.11, .7, 6, 12), mat('#f0c27a'), [.35, .55, -.15], [0, 0, Math.PI / 2 + .2]); root.add(panc);
  const siPts = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 9; const r = .55 - i / 60 * .2; siPts.push([Math.cos(a) * r, .2 - i / 60 * 1.1 + Math.sin(a * 2) * .03, Math.sin(a) * r * .5 + .1]); }
  const smallI = tube([[.55, .65, 0], ...siPts], .07, mat('#f0a0a8'), 300, 8); root.add(smallI);
  const largeI = tube([[.15, -.95, .1], [-1, -.9, .1], [-1.05, .45, .1], [1.05, .45, .2], [1.05, -.9, .1], [.3, -1.2, .1], [.1, -1.5, 0]], .15, mat('#d9858f'), 120, 10); root.add(largeI);
  const path = curve([[0, 3.05, .6], [0, 2.6, .1], [.05, 1.8, 0], [.25, 1.25, 0], [.6, .95, 0], [.55, .65, 0], ...siPts.filter((_, i) => i % 3 === 0), [.15, -.95, .1], [-1, -.9, .1], [-1.05, .45, .1], [1.05, .45, .2], [1.05, -.9, .1], [.3, -1.2, .1], [.1, -1.5, 0]]);
  const bolus = mesh(new THREE.SphereGeometry(.13, 14, 10), mat('#a8722a'), [0, 3.05, .6]); root.add(bolus); let bt = -1;
  const say = [[0, 'الفم: يبدأُ الهضمُ في الفم.'], [.06, 'المريء: ينقلُ الطعامَ إلى المعدة.'], [.17, 'المعدة: يحلّلُ الحمضُ وإنزيمُ المعدةِ الغذاءَ إلى دقائقَ صغيرة.'], [.27, 'الأمعاءُ الدقيقة: تحلّلُ العصارةُ الهضميةُ البروتيناتِ والنشويّاتِ والدهون، وتُمتصُّ الموادُّ الغذائيةُ إلى الدم.'], [.72, 'الأمعاءُ الغليظة: يُمتصُّ الماء.'], [.97, 'الإخراج: التخلّصُ من الفضلاتِ خارجَ الجسم.']]; let said = -1;
  const parts = [
    { id: 'mouth', name: 'الفم', info: 'في الإنسانِ يحدثُ الهضمُ في الفمِ والمعدةِ والأمعاءِ الدقيقة.', objs: [mouth], at: anchor(root, [0, 3.05, .7]) },
    { id: 'eso', name: 'المريء', info: 'أنبوبٌ ينقلُ الغذاءَ من الفمِ إلى المعدة.', objs: [eso], at: anchor(root, [0, 2.2, .1]) },
    { id: 'stom', name: 'المعدة', info: 'يحلّلُ الحمضُ وإنزيمُ المعدةِ الغذاءَ إلى دقائقَ صغيرة.', objs: [stomach], at: anchor(root, [.9, 1.1, .3]) },
    { id: 'liver', name: 'الكبد', info: 'يساعدُ الكبدُ الجهازَ الهضميَّ في هضمِ الطعام، ويعملُ على تخليصِ الجسمِ من الفضلات.', objs: [liver], at: anchor(root, [-.9, 1.45, .4]) },
    { id: 'panc', name: 'البنكرياس', info: 'غدّةٌ تفرزُ عصارةً هضميةً تحلّلُ البروتيناتِ والنشويّاتِ والدهون.', objs: [panc], at: anchor(root, [.35, .55, .1]) },
    { id: 'si', name: 'الأمعاء الدقيقة', info: 'تقومُ الأمعاءُ الدقيقةُ بامتصاصِ الموادِّ الغذائيةِ ونقلِها إلى الدم.', objs: [smallI], at: anchor(root, [0, -.3, .5]) },
    { id: 'li', name: 'الأمعاء الغليظة', info: 'تمتصُّ الأمعاءُ الغليظةُ الماءَ من بقايا الطعام، ثم يتمُّ التخلّصُ من الفضلاتِ خارجَ الجسمِ بعمليةِ الإخراج.', objs: [largeI], at: anchor(root, [-1.1, -.2, .3]) }
  ];
  return {
    root, parts,
    update(dt) { if (bt >= 0) { bt += dt * .06 * speed; if (bt >= 1) { bt = -1; bolus.visible = false; return; } bolus.position.copy(path.getPointAt(bt)); bolus.scale.setScalar(1 - bt * .6); const k = say.filter(s => s[0] <= bt).length - 1; if (k !== said) { said = k; api.toast(say[k][1]); } } },
    cam: { pos: [0, 1.3, 7.6], target: [0, 1, 0] }, inpage: { pos: [0, 1.2, 7.6], target: [0, .95, 0] },
    controls: [
      { type: 'button', label: '🍞 ابتلع لقمة وتابعها', on: () => { bt = 0; said = -1; bolus.visible = true; } },
      { type: 'slider', label: 'سرعة المتابعة', min: .5, max: 4, step: .5, value: 1, fmt: v => v + '×', on: v => speed = v }
    ],
    quiz: [
      { q: 'أين تُمتصُّ الموادُّ الغذائيةُ إلى الدم؟ المسه.', a: 'si' },
      { q: 'المس العضوَ الذي يحلّلُ فيه الحمضُ الغذاء.', a: 'stom' },
      { q: 'المس الأنبوبَ الذي يصلُ الفمَ بالمعدة.', a: 'eso' },
      { q: 'المس العضوَ الذي يمتصُّ الماء.', a: 'li' }
    ]
  };
}

/* ═════════ ٣) الجهاز التنفسي (ص ١١٣) ═════════ */
export function lungsModel(api) {
  const root = new THREE.Group(); let rate = 1, t = 0, auto = true; root.add(body(.1));
  const airM = mat('#e8d2c4', { roughness: .5 });
  const nose = mesh(new THREE.ConeGeometry(.14, .3, 12), mat('#e8b090'), [0, 3.3, .75], [Math.PI / 2, 0, 0]); root.add(nose);
  const phar = tube([[0, 3.3, .55], [0, 3.1, .2], [0, 2.75, .05]], .09, airM, 16, 8); root.add(phar);
  const larynx = mesh(new THREE.CylinderGeometry(.16, .14, .28, 16), mat('#d8b8a8'), [0, 2.6, .05]); root.add(larynx);
  const trachea = new THREE.Group(); for (let i = 0; i < 9; i++) trachea.add(mesh(new THREE.TorusGeometry(.13, .035, 8, 18), airM, [0, 2.4 - i * .1, .05], [Math.PI / 2, 0, 0])); root.add(trachea);
  const bron = []; for (const s of [-1, 1]) { bron.push(tube([[0, 1.55, .05], [s * .4, 1.3, .05], [s * .75, 1.1, 0]], .08, airM, 16, 8)); for (let k = 0; k < 4; k++) bron.push(tube([[s * .75, 1.1, 0], [s * (.9 + k * .1), .8 - k * .25, (k - 1.5) * .15], [s * (1 + k * .12), .5 - k * .3, (k - 1.5) * .2]], .035, airM, 10, 6)); }
  bron.forEach(b => root.add(b));
  const lM = glass('#f28c9a', .45);
  const lungL = mesh(new THREE.SphereGeometry(1, 32, 24), lM, [-1, .5, 0]); lungL.scale.set(.62, 1.25, .6); const lungR = mesh(new THREE.SphereGeometry(1, 32, 24), lM, [1, .5, 0]); lungR.scale.set(.68, 1.25, .6); root.add(lungL, lungR);
  const alv = new THREE.Group(); for (let i = 0; i < 9; i++) alv.add(mesh(new THREE.SphereGeometry(.09, 10, 8), mat('#e05a6a'), [1.15 + (i % 3) * .14, -.25 + Math.floor(i / 3) * .14, .3])); root.add(alv);
  const diaph = mesh(new THREE.SphereGeometry(1.6, 32, 12, 0, Math.PI * 2, 0, Math.PI / 3.2), mat('#c0505a', { side: 2 }), [0, -1.45, 0]); diaph.scale.set(1, .45, .6); root.add(diaph);
  const o2 = new Flow(root, '#4ab0ff', .05, 50), co2 = new Flow(root, '#9a9a9a', .05, 50);
  o2.addPath(curve([[0, 3.4, .9], [0, 3.1, .3], [0, 2.6, .05], [0, 1.6, .05], [.6, 1.2, 0], [1.2, -.1, .3]]), .5).addPath(curve([[0, 3.4, .9], [0, 3.1, .3], [0, 2.6, .05], [0, 1.6, .05], [-.6, 1.2, 0], [-1.1, .2, .2]]), .5);
  co2.addPath(curve([[1.2, -.1, .3], [.6, 1.2, 0], [0, 1.6, .05], [0, 2.6, .05], [0, 3.1, .3], [0, 3.4, 1]]), .5);
  const parts = [
    { id: 'nose', name: 'الأنف والفم', info: 'في الإنسانِ يدخلُ الهواءُ عبرَ الفمِ والأنفِ إلى البلعوم.', objs: [nose], at: anchor(root, [.15, 3.35, .85]) },
    { id: 'phar', name: 'البلعوم', info: 'ممرٌّ يمرُّ عبرَه الهواءُ من الأنفِ والفمِ إلى الحنجرة.', objs: [phar], at: anchor(root, [-.2, 3.0, .2]) },
    { id: 'lar', name: 'الحنجرة', info: 'ينتقلُ الهواءُ من البلعومِ إلى الحنجرة، ثم إلى القصبةِ الهوائية.', objs: [larynx], at: anchor(root, [.25, 2.6, .1]) },
    { id: 'tra', name: 'القصبة الهوائية', info: 'أنبوبٌ تدعمُه حلقاتٌ غضروفيةٌ ينقلُ الهواءَ إلى الشعبتينِ الهوائيتين.', objs: trachea.children, at: anchor(root, [.25, 2.0, .1]) },
    { id: 'bron', name: 'الشعبتان والشعيبات الهوائية', info: 'تتفرّعُ الشعبتانِ الهوائيتانِ إلى شعيباتٍ هوائيةٍ أدقَّ فأدقّ، حتى تنتهيَ بأكياسٍ صغيرةٍ تسمّى الحويصلاتِ الهوائية.', objs: bron, at: anchor(root, [-.5, 1.4, .1]) },
    { id: 'alv', name: 'الحويصلات الهوائية', info: 'عندَ الحويصلاتِ الهوائيةِ يحدثُ تبادلُ الغازاتِ بينَ الدمِ والهواءِ الذي يدخلُ إليها من خلالِ جدرانِها الرقيقة.', objs: alv.children, at: anchor(root, [1.3, -.1, .4]) },
    { id: 'lung', name: 'الرئتان', info: 'تستخدمُ الزواحفُ والطيورُ والثديياتُ الرئاتِ بصورةٍ رئيسةٍ في التنفّس.', objs: [lungL, lungR], at: anchor(root, [-1.1, 1.4, .3]) },
    { id: 'dia', name: 'الحجاب الحاجز', info: 'ينقبضُ الحجابُ الحاجزُ وينبسطُ لينظّمَ عمليةَ التنفّس: الشهيقَ والزفير.', objs: [diaph], at: anchor(root, [0, -1.0, .6]) }
  ];
  return {
    root, parts,
    update(dt) { if (auto) t += dt * rate; const inh = Math.sin(t * 1.4); const k = 1 + inh * .08; lungL.scale.set(.62 * k, 1.25 * k, .6 * k); lungR.scale.set(.68 * k, 1.25 * k, .6 * k); diaph.position.y = -1.45 - inh * .15; o2.rate = inh > 0 ? 6 * rate : 0; co2.rate = inh < 0 ? 6 * rate : 0; o2.update(dt); co2.update(dt); },
    cam: { pos: [0, 1.5, 7.2], target: [0, 1.1, 0] }, inpage: { pos: [0, 1.4, 7.4], target: [0, 1.0, 0] },
    controls: [
      { type: 'slider', label: 'سرعة التنفّس', min: .3, max: 3, step: .1, value: 1, fmt: v => v < .8 ? 'هادئ' : v < 1.8 ? 'طبيعي' : 'سريع (رياضة)', on: v => { rate = v; if (v > 1.8) api.toast('في التمارينِ المجهدةِ يتنفّسُ الشخصُ بسرعةٍ لتزويدِ العضلاتِ بالأكسجين.'); } },
      { type: 'button', label: '🔍 اقترب من الحويصلات', toggle: true, on: on => api.flyTo(on ? [2.4, .3, 2.2] : [0, 1.5, 7.2], on ? [1.2, -.1, .3] : [0, 1.1, 0]) },
      { type: 'button', label: '❚❚ أوقف / شغّل التنفّس', on: () => auto = !auto }
    ],
    legend: [['#4ab0ff', 'أكسجين (شهيق)'], ['#9a9a9a', 'ثاني أكسيد الكربون (زفير)']],
    quiz: [
      { q: 'المس المكانَ الذي يحدثُ فيه تبادلُ الغازات.', a: 'alv' },
      { q: 'المس الأنبوبَ الذي تدعمُه حلقاتٌ وينقلُ الهواءَ إلى الرئتين.', a: 'tra' },
      { q: 'المس العضلةَ التي تنظّمُ الشهيقَ والزفير.', a: 'dia' }
    ]
  };
}

/* ═════════ ٤) الدورة الدموية (ص ١١٦) ═════════ */
export function heartModel(api) {
  const root = new THREE.Group(); let t = 0, rate = 1;
  const heart = new THREE.Group(); const R = mesh(new THREE.SphereGeometry(.65, 28, 20), mat('#3a5ad0', { roughness: .45 }), [-.35, 0, 0]); R.scale.set(1, 1.2, .9); const L = mesh(new THREE.SphereGeometry(.7, 28, 20), mat('#d0303a', { roughness: .45 }), [.4, -.05, 0]); L.scale.set(1, 1.25, .9); heart.add(R, L); root.add(heart);
  const red = mat('#d9343f'), blue = mat('#3456c8');
  const toLungR = tube([[-.3, .7, 0], [-.6, 1.6, 0], [-2.2, 1.6, 0]], .12, blue, 30, 10), toLungL = tube([[-.3, .7, 0], [.2, 1.8, 0], [2.2, 1.7, 0]], .12, blue, 30, 10);
  const fromLungR = tube([[-2.2, 1.0, .1], [-1, 1, .2], [.3, .6, .2]], .12, red, 30, 10), fromLungL = tube([[2.2, 1.0, .1], [1, .9, .2], [.5, .6, .2]], .12, red, 30, 10);
  const aorta = tube([[.5, .7, -.1], [.6, 2.4, -.2], [.9, 3, -.2]], .15, red, 30, 10), down = tube([[.6, -.7, -.1], [.6, -2, -.1]], .15, red, 20, 10);
  const vena = tube([[-.5, -2, .1], [-.6, -.7, .1], [-.5, -.3, .1]], .15, blue, 20, 10), venaUp = tube([[-.6, 3, .1], [-.6, .6, .1]], .15, blue, 20, 10);
  [toLungR, toLungL, fromLungR, fromLungL, aorta, down, vena, venaUp].forEach(o => root.add(o));
  function capBed(x, y, w = 1.1) { const g = new THREE.Group(); for (let i = 0; i < 10; i++) { const k = i / 9; const c = new THREE.Color().lerpColors(new THREE.Color('#3456c8'), new THREE.Color('#d9343f'), k); g.add(tube([[x - w / 2, y + .5 - k, 0], [x, y + .5 - k + Math.sin(i) * .1, .2], [x + w / 2, y + .5 - k, 0]], .03, mat(c), 14, 5)); } root.add(g); return g; }
  const capLR = capBed(-2.6, 1.3), capLL = capBed(2.6, 1.3), capBody = capBed(0, -2.6, 1.6);
  const lungR = mesh(new THREE.SphereGeometry(.85, 24, 16), glass('#f2a0a8', .3), [-2.6, 1.3, -.2]); lungR.scale.set(.8, 1.1, .6); const lungL = lungR.clone(); lungL.position.x = 2.6; root.add(lungR, lungL);
  const fb = new Flow(root, '#3456c8', .06, 60), fr = new Flow(root, '#e0404a', .06, 60);
  fb.addPath(curve([[-.5, -2.4, .1], [-.6, -.7, .1], [-.35, 0, .3], [-.6, 1.6, 0], [-2.2, 1.6, 0], [-2.8, 1.5, 0]]), .3).addPath(curve([[-.6, 3, .1], [-.6, .6, .1], [-.3, .7, .3], [.2, 1.8, 0], [2.2, 1.7, 0], [2.8, 1.6, 0]]), .3);
  fr.addPath(curve([[-2.6, .9, .1], [-1, 1, .2], [.4, .2, .3], [.6, 2.4, -.2], [.9, 3, -.2]]), .3).addPath(curve([[2.6, .9, .1], [1, .9, .2], [.4, 0, .3], [.6, -.7, -.1], [.6, -2.2, -.1], [0, -2.6, .2]]), .3);
  const parts = [
    { id: 'heartR', name: 'القلب (الجانب الأيمن)', info: 'تبدأُ الدورةُ الدمويةُ عندما يضخُّ القلبُ الدمَ غيرَ المؤكسجِ (غيرَ المحمّلِ بالأكسجين) إلى الرئتين.', objs: [R], at: anchor(heart, [-.7, .7, .3]) },
    { id: 'heartL', name: 'القلب (الجانب الأيسر)', info: 'يعودُ الدمُ المؤكسجُ إلى القلب، حيث يُضخُّ إلى جميعِ أجزاءِ الجسم.', objs: [L], at: anchor(heart, [.8, .7, .3]) },
    { id: 'lungcap', name: 'شعيرات الرئتين', info: 'في الرئةِ داخلَ الحويصلةِ الهوائيةِ يتمُّ تبادلُ الغازات؛ حيث ينتقلُ الأكسجينُ إلى الدم، وينتقلُ ثاني أكسيدِ الكربونِ إلى تجويفِ الحويصلةِ ثم إلى خارجِ الجسمِ مع هواءِ الزفير.', objs: [...capLR.children, ...capLL.children], at: anchor(root, [-2.6, 2.2, 0]) },
    { id: 'artery', name: 'الشريان', info: 'يحملُ الدمَ المؤكسجَ (اللونُ الأحمر) من القلبِ إلى سائرِ أجزاءِ الجسم.', objs: [aorta, down], at: anchor(root, [.9, 2.6, 0]) },
    { id: 'vein', name: 'الوريد', info: 'يحملُ الدمَ غيرَ المؤكسجِ (اللونُ الأزرق) من أجزاءِ الجسمِ إلى القلب.', objs: [vena, venaUp], at: anchor(root, [-.9, 2.6, 0]) },
    { id: 'bodycap', name: 'شعيرات الجسم', info: 'يصلُ الدمُ إلى أوعيةٍ دمويةٍ دقيقةٍ تسمّى الشعيرات، فتنتقلُ الموادُّ الغذائيةُ والأكسجينُ عبرَ جدرانِها الرقيقةِ لتصلَ إلى الخلايا، وتمرّرُ الخلايا فضلاتِها إلى الدم.', objs: capBody.children, at: anchor(root, [0, -1.8, .3]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt * rate; heart.scale.setScalar(1 + Math.max(0, Math.sin(t * 7)) * .07); fb.rate = fr.rate = 5 * rate; fb.paths.forEach(p => p.speed = .3 * rate); fr.paths.forEach(p => p.speed = .3 * rate); fb.update(dt); fr.update(dt); },
    cam: { pos: [0, .5, 9], target: [0, .3, 0] }, inpage: { pos: [0, .5, 9], target: [0, .3, 0] },
    controls: [
      { type: 'steps', value: -1, steps: [{ t: '١- الدم غير المؤكسج إلى القلب', d: 'يتدفّقُ الدمُ غيرُ المؤكسجِ (غيرُ المحمّلِ بالأكسجين) إلى القلب.' }, { t: '٢- إلى الرئتين', d: 'يضخُّ القلبُ الدمَ غيرَ المؤكسجِ إلى الرئتين.' }, { t: '٣- تبادل الغازات', d: 'يتخلّصُ الدمُ في الرئتينِ من ثاني أكسيدِ الكربونِ ويُحمّلُ بالأكسجين.' }, { t: '٤- إلى الجسم', d: 'يتدفّقُ الدمُ المؤكسجُ (المحمّلُ بالأكسجين) إلى القلب، ثم يُضخُّ إلى سائرِ أجزاءِ الجسم.' }], on: i => { api.select && api.select(['vein', 'heartR', 'lungcap', 'artery'][i]); } },
      { type: 'slider', label: 'نبض القلب', min: .5, max: 2.5, step: .1, value: 1, fmt: v => Math.round(v * 80) + ' نبضة/دقيقة', on: v => { rate = v; } }
    ],
    legend: [['#3456c8', 'دم غير مؤكسج'], ['#e0404a', 'دم مؤكسج']],
    quiz: [
      { q: 'أين يُضخُّ الدمُ غيرُ المؤكسج؟ المس الشعيراتِ هناك.', a: 'lungcap' },
      { q: 'المس الوعاءَ الذي يحملُ الدمَ المؤكسجَ إلى الجسم.', a: 'artery' },
      { q: 'المس الأوعيةَ الدقيقةَ التي تنقلُ الغذاءَ والأكسجينَ إلى خلايا الجسم.', a: 'bodycap' }
    ]
  };
}

/* ═════════ ٥) الجهاز الهيكلي والعضلي (ص ١٢٢–١٢٣) ═════════ */
export function skeletonModel(api) {
  const root = new THREE.Group(); let run = false, t = 0;
  const bone = mat('#efe6c8', { roughness: .55 });
  const skull = mesh(new THREE.SphereGeometry(.55, 24, 18), bone, [2.4, 1.6, 0]); skull.scale.set(1.4, .9, .8); root.add(skull);
  const spine = []; for (let i = 0; i < 16; i++) { const a = i / 15; const v = mesh(new THREE.CylinderGeometry(.12, .12, .16, 10), bone, [1.6 - a * 3.4, 1.35 + Math.sin(a * Math.PI) * .45, 0]); v.rotation.z = Math.PI / 2 + (a - .5) * .6; root.add(v); spine.push(v); }
  const ribs = []; for (let i = 0; i < 7; i++) { const r = mesh(new THREE.TorusGeometry(.55 - Math.abs(i - 3) * .04, .035, 8, 24, Math.PI * 1.6), bone, [1.1 - i * .22, 1.1, 0], [0, Math.PI / 2, Math.PI * .7]); root.add(r); ribs.push(r); }
  const pelvis = mesh(new THREE.TorusGeometry(.32, .08, 8, 18), bone, [-1.75, 1.3, 0], [0, Math.PI / 2, 0]); root.add(pelvis);
  const front = new THREE.Group(); front.position.set(1.1, .9, 0); front.add(mesh(new THREE.CylinderGeometry(.06, .05, 1.4, 8), bone, [0, -.7, 0])); root.add(front);
  // الرجل الخلفية: فخذ + ساق + قدم مع عضلتين ووتر
  const hip = new THREE.Group(); hip.position.set(-1.75, 1.2, .25); root.add(hip);
  const femur = mesh(new THREE.CylinderGeometry(.08, .07, 1.1, 10), bone, [0, -.55, 0]); hip.add(femur);
  const knee = new THREE.Group(); knee.position.set(0, -1.1, 0); hip.add(knee);
  const shin = mesh(new THREE.CylinderGeometry(.06, .05, 1, 10), bone, [0, -.5, 0]); knee.add(shin);
  const foot = mesh(new THREE.BoxGeometry(.7, .08, .12), bone, [.3, -1.02, 0]); knee.add(foot);
  const mFront = mesh(new THREE.CapsuleGeometry(.14, .7, 8, 12), mat('#c83a3a', { roughness: .5 }), [.18, -.5, .05]); hip.add(mFront);
  const mBack = mesh(new THREE.CapsuleGeometry(.16, .7, 8, 12), mat('#a82a32', { roughness: .5 }), [-.2, -.55, .05]); hip.add(mBack);
  const tendon = mesh(new THREE.CylinderGeometry(.03, .03, .5, 6), mat('#f6f2ea'), [-.15, -.25, .05]); knee.add(tendon);
  const lig = mesh(new THREE.SphereGeometry(.1, 12, 10), mat('#c9c0a0'), [0, 0, 0]); knee.add(lig);
  const parts = [
    { id: 'skull', name: 'الجمجمة', info: 'الجمجمةُ قاسيةٌ جدًّا لكي تحميَ الدماغَ الحسّاسَ من الإصابة، كما أنّها خفيفةُ الوزنِ لكي يسهلَ إبقاءُ الرأسِ منتصبًا.', objs: [skull], at: anchor(root, [2.6, 2.3, 0]) },
    { id: 'spine', name: 'العمود الفقري (الفقرات)', info: 'سلسلةٌ من الفقراتِ تدعمُ الجسمَ وتحمي الحبلَ الشوكيّ.', objs: spine, at: anchor(root, [0, 2.1, 0]) },
    { id: 'ribs', name: 'القفص الصدري (الأضلاع)', info: 'العظامُ في الجهازِ الهيكليِّ تحمي بعضَ الأعضاءِ الطريّة؛ فالقفصُ الصدريُّ يحمي القلبَ والرئتين.', objs: ribs, at: anchor(root, [.5, .55, .5]) },
    { id: 'pelvis', name: 'الحوض', info: 'عظامٌ ترتبطُ بها عظامُ الأرجلِ الخلفية، وتتّصلُ بالعمودِ الفقريّ.', objs: [pelvis], at: anchor(root, [-1.75, 1.75, 0]) },
    { id: 'femur', name: 'الفخذ', info: 'العظامُ نسيجٌ صلبٌ وخفيفٌ وقويّ، تتحرّكُ بسهولةٍ لكنّها لا تستطيعُ الحركةَ وحدَها.', objs: [femur, shin], at: anchor(hip, [.25, -.8, 0]) },
    { id: 'muscle', name: 'العضلات المتقابلة', info: 'العضلاتُ التي تسبّبُ الحركةَ تعملُ في أزواج؛ فعندما تنقبضُ عضلةٌ تسحبُ العظمَ المرتبطَ بها، وفي الوقتِ نفسِه تنبسطُ عضلةٌ أخرى. والعضلاتُ تسحبُ ولا تدفعُ أبدًا.', objs: [mFront, mBack], at: anchor(hip, [-.4, -.4, .2]) },
    { id: 'tendon', name: 'الوتر', info: 'الأوتارُ نسيجٌ يربطُ بينَ العظامِ والعضلات؛ فعندما تنقبضُ العضلةُ تسحبُ الوترَ الذي يحرّكُ العظم.', objs: [tendon], at: anchor(knee, [-.35, -.25, .1]) },
    { id: 'lig', name: 'الرباط', info: 'الأربطةُ نسيجٌ يربطُ العظامَ بعضَها ببعض.', objs: [lig], at: anchor(knee, [.2, .05, .1]) }
  ];
  function pose(k) { hip.rotation.z = .5 * k; knee.rotation.z = -.9 * k; mFront.scale.set(1 + k * .25, 1 - k * .2, 1 + k * .25); mBack.scale.set(1 - k * .1, 1 + k * .15, 1 - k * .1); front.rotation.z = -.4 * k; }
  pose(0);
  return {
    root, parts,
    update(dt) { if (run) { t += dt; const k = (Math.sin(t * 6) + 1) / 2; pose(k); root.position.y = Math.abs(Math.sin(t * 6)) * .1; } },
    cam: { pos: [0, 1, 7.5], target: [0, .7, 0] }, inpage: { pos: [0, .9, 7.2], target: [0, .7, 0] },
    controls: [
      { type: 'button', label: '🐇 اجعل الأرنب يركض', toggle: true, on: on => { run = on; if (!on) pose(0); else api.toast('تُرسَلُ أوامرُ من الدماغِ إلى عضلاتِ الرجل: تنقبضُ العضلةُ الأماميةُ فترفعُ الرجل، ثم تنقبضُ الخلفيةُ فتسحبُها إلى أسفل.'); } },
      { type: 'slider', label: 'انقباض العضلة الأمامية', min: 0, max: 10, step: 1, value: 0, fmt: v => v < 3 ? 'منبسطة' : v < 7 ? 'نصف انقباض' : 'منقبضة', on: v => { run = false; pose(v / 10); } }
    ],
    quiz: [
      { q: 'المس العظمَ الذي يحمي الدماغ.', a: 'skull' },
      { q: 'المس النسيجَ الذي يربطُ العضلةَ بالعظم.', a: 'tendon' },
      { q: 'المس العظامَ التي تحمي القلبَ والرئتين.', a: 'ribs' },
      { q: 'المس العضلاتِ التي تعملُ في أزواج.', a: 'muscle' }
    ]
  };
}

/* ═════════ ٦) الجهاز العصبي والغدد الصماء (ص ١٢٤) ═════════ */
export function nervousModel(api) {
  const root = new THREE.Group(); let t = 0, sig = -1, fast = 0;
  const fig = new THREE.Group(); root.add(fig); const fm = glass('#c9a27a', .18, { side: 2 });
  fig.add(mesh(new THREE.SphereGeometry(.7, 24, 18), fm, [0, 2.6, .2])); const torso = mesh(new THREE.CapsuleGeometry(.85, 2, 10, 20), fm, [0, .6, 0]); torso.scale.z = .75; fig.add(torso);
  for (const s of [-1, 1]) { fig.add(mesh(new THREE.ConeGeometry(.18, 1.4, 12), fm, [s * .3, 3.6, 0], [0, 0, s * -.15])); fig.add(mesh(new THREE.CapsuleGeometry(.18, 1.2, 6, 10), fm, [s * .55, -1.4, .2])); }
  const brain = mesh(new THREE.SphereGeometry(.45, 28, 20), mat('#f29aa8', { map: noiseTexture('#f4a8b4', '#d97a8a', 1500, 128, 128, 4), roughness: .6 }), [0, 2.7, .1]); brain.scale.set(1.15, .85, 1); root.add(brain);
  const eye = mesh(new THREE.SphereGeometry(.1, 14, 10), mat('#222'), [.35, 2.55, .75]); root.add(eye);
  const cord = tube([[0, 2.3, 0], [0, 1.6, -.25], [0, .4, -.35], [0, -.6, -.2]], .07, mat('#f2d06a', { emissive: '#7a5a00', emissiveIntensity: .1 }), 40, 10); root.add(cord);
  const nerves = []; const nM = mat('#e8b84a'); for (let i = 0; i < 6; i++) { const y = 1.8 - i * .45; for (const s of [-1, 1]) { const n = tube([[0, y, -.3], [s * .5, y - .15, 0], [s * .8, y - .4, .2]], .02, nM, 12, 5); root.add(n); nerves.push(n); } }
  const legN = []; for (const s of [-1, 1]) { const n = tube([[0, -.6, -.2], [s * .5, -1.2, .15], [s * .55, -2, .25]], .03, nM, 16, 6); root.add(n); legN.push(n); }
  const eyeN = tube([[.3, 2.55, .65], [.15, 2.65, .3]], .02, nM, 8, 5); root.add(eyeN);
  const adrenal = []; for (const s of [-1, 1]) { const k = mesh(new THREE.SphereGeometry(.18, 16, 12), mat('#9a3a3a'), [s * .35, .05, -.3]); k.scale.set(.7, 1, .6); root.add(k); const a = mesh(new THREE.ConeGeometry(.12, .16, 12), mat('#f2c22a'), [s * .35, .28, -.3]); root.add(a); adrenal.push(a); }
  const heart = mesh(new THREE.SphereGeometry(.22, 18, 14), mat('#d0303a'), [-.15, 1.2, .3]); root.add(heart);
  const fox = new THREE.Group(); const fM = mat('#e07a2a'); fox.add(mesh(new THREE.CapsuleGeometry(.25, .7, 6, 12), fM, [0, 0, 0], [0, 0, Math.PI / 2])); fox.add(mesh(new THREE.ConeGeometry(.2, .45, 12), fM, [.6, .15, 0], [0, 0, -Math.PI / 2])); fox.add(mesh(new THREE.ConeGeometry(.12, .6, 10), mat('#f6e6d0'), [-.65, .1, 0], [0, 0, Math.PI / 2 + .3])); fox.position.set(3.6, -1.4, .5); root.add(fox);
  const pulse = mesh(new THREE.SphereGeometry(.09, 12, 10), mat('#ffffff', { emissive: '#ffee55', emissiveIntensity: 1.5 })); pulse.visible = false; root.add(pulse);
  const adr = new Flow(root, '#ffcc22', .045, 40); adr.addPath(curve([[.35, .3, -.3], [.2, .8, 0], [-.15, 1.2, .3]]), .6).addPath(curve([[-.35, .3, -.3], [-.3, .8, 0], [-.15, 1.2, .3]]), .6); adr.rate = 0;
  const route = curve([[3.4, -1.2, .5], [1.6, .8, .9], [.35, 2.55, .75], [.15, 2.65, .3], [0, 2.4, 0], [0, 1.6, -.25], [0, .4, -.35], [0, -.6, -.2], [.5, -1.2, .15], [.55, -2, .25]]);
  const say = [[0, 'تبدأُ استجابةُ الأرنبِ عندما يرى الثعلب.'], [.22, 'تقومُ الخلايا العصبيةُ في عينَي الأرنبِ بإرسالِ معلوماتٍ إلى الدماغ.'], [.4, 'يستجيبُ الدماغُ بإرسالِ أوامرَ عبرَ الحبلِ الشوكيّ.'], [.75, 'ينقلُ الجهازُ العصبيُّ الأوامرَ إلى عضلاتِ الأرجلِ في أقلَّ من جزءٍ من الثانية ليبدأَ الركض.']]; let said = -1;
  const parts = [
    { id: 'brain', name: 'الدماغ', info: 'ينظّمُ حركاتِ العضلات، ويفسّرُ المعلوماتِ التي تصلُه من أعضاءِ الحسّ، وينظّمُ وظائفَ أعضاءِ الجسم.', objs: [brain], at: anchor(root, [0, 3.2, .2]) },
    { id: 'cord', name: 'الحبل الشوكي', info: 'يمرّرُ المعلوماتِ من الدماغِ وإليه.', objs: [cord], at: anchor(root, [-.25, 1.2, -.3]) },
    { id: 'nerves', name: 'الأعصاب', info: 'ترسلُ معلوماتٍ من أجزاءِ الجسمِ المختلفةِ إلى الدماغ، وتنقلُ أوامرَه إلى العضلات.', objs: [...nerves, ...legN, eyeN], at: anchor(root, [.8, 1.2, .2]) },
    { id: 'eye', name: 'العين (عضو حسّ)', info: 'تستقبلُ صورةَ الخطر، وتقومُ الخلايا العصبيةُ فيها بإرسالِ معلوماتٍ إلى الدماغ.', objs: [eye], at: anchor(root, [.5, 2.55, .85]) },
    { id: 'adr', name: 'الغدّتان الكظريّتان', info: 'تقعانِ فوقَ الكليتين، وتفرزانِ هرمونَ الأدرينالين، وتهيّئانِ الجسمَ لحالاتِ الطوارئِ والإجهاد.', objs: adrenal, at: anchor(root, [.5, .35, 0]) },
    { id: 'heart', name: 'القلب', info: 'يسرّعُ الأدرينالينُ نبضاتِ القلبِ ليزيدَ الدمَ المتدفّقَ إلى العضلات، فيصبحُ الحيوانُ مستعدًّا للهربِ أو الدفاعِ عن نفسِه.', objs: [heart], at: anchor(root, [-.4, 1.4, .5]) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; heart.scale.setScalar(1 + Math.max(0, Math.sin(t * (6 + fast * 6))) * .15);
      if (sig >= 0) { sig += dt * .22; pulse.visible = sig < 1; if (sig >= 1) { sig = -1; adr.rate = 8; fast = 1; api.toast('في الوقتِ نفسِه تفرزُ الغدّتانِ الكظريّتانِ الأدرينالين، فتتسارعُ نبضاتُ القلبِ ويستعدُّ الأرنبُ للهرب.'); } else { pulse.position.copy(route.getPointAt(sig)); const k = say.filter(s => s[0] <= sig).length - 1; if (k !== said) { said = k; api.toast(say[k][1]); } } }
      adr.update(dt); if (fast) { fast = Math.max(0, fast - dt * .08); if (!fast) adr.rate = 0; }
      brain.material.emissive.setRGB(sig > .3 && sig < .5 ? .4 : 0, sig > .3 && sig < .5 ? .3 : 0, 0);
    },
    cam: { pos: [1.2, 1.2, 8], target: [.6, .8, 0] }, inpage: { pos: [.8, 1, 8.4], target: [.6, .8, 0] },
    controls: [
      { type: 'button', label: '🦊 ظهر ثعلب! تابع الاستجابة', on: () => { sig = 0; said = -1; fast = 0; adr.rate = 0; } },
      { type: 'slider', label: 'زمن انتقال الإشارة', min: 0, max: 10, step: 1, value: 0, fmt: v => v < 3 ? 'أقل من جزء من الثانية' : 'دقيقة كاملة!', on: v => { if (v >= 3) api.toast('لو استغرقتِ الأوامرُ دقيقةً لما استطاعَ الأرنبُ الهربَ في الوقتِ المناسب، وأمسكَ به الثعلب.'); } }
    ],
    legend: [['#e8b84a', 'أعصاب'], ['#ffcc22', 'هرمون الأدرينالين']],
    quiz: [
      { q: 'المس العضوَ الذي يفسّرُ المعلومات.', a: 'brain' },
      { q: 'المس الغددَ التي تفرزُ الأدرينالين.', a: 'adr' },
      { q: 'المس الجزءَ الذي يمرّرُ المعلوماتِ من الدماغِ وإليه.', a: 'cord' }
    ]
  };
}

/* ── رموز المخلوقات ── */
function node(root, ch, pos, s = .9, bg = 'rgba(255,255,255,.85)') { const g = new THREE.Group(); const sp = emo(ch, s, bg); g.add(sp); const p = new THREE.Mesh(new THREE.SphereGeometry(s * .48, 16, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); g.add(p); g.position.set(...pos); root.add(g); return { g, sp, p }; }

/* ═════════ ٧) السلسلة الغذائية في غابة (ص ١٣٩) ═════════ */
export function foodchainModel(api) {
  const root = new THREE.Group(); let step = -1;
  const ground = mesh(new THREE.CylinderGeometry(4.6, 4.6, .3, 48), mat('#5a7a3a', { map: noiseTexture('#5e8a3e', '#3e6a2a', 3000) }), [0, -1.65, 0]); root.add(ground);
  for (let i = 0; i < 6; i++) { const tr = tree(1.6 + Math.random() * .6, '#2f6e2f'); tr.position.set(-3.6 + i * 1.4, -1.5, -2.6 - (i % 2) * .5); root.add(tr); }
  const N = [node(root, '☀️', [-3.4, 2.4, 0], 1.1, null), node(root, '🌿', [-2.2, -.8, .6], 1), node(root, '🦗', [-.6, -.9, 1.2], .9), node(root, '🦜', [.8, .5, .8], 1), node(root, '🐆', [2.6, -.6, .9], 1.2), node(root, '🍄', [.6, -1.1, 2.3], .85)];
  const flows = []; const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
  links.forEach(([a, b], i) => { const A = N[a].g.position, B = N[b].g.position; const mid = A.clone().add(B).multiplyScalar(.5).add(V(0, .6, 0)); const ar = arrowTube([A.toArray(), mid.toArray(), B.clone().lerp(A, .22).toArray()], .04, i === 4 ? '#8a6a4a' : '#f2a22a', .25); root.add(ar); const f = new Flow(root, i === 0 ? '#ffd23a' : '#ffae3a', .06, 20); f.addPath(ar.userData.curve, .5); flows.push({ ar, f }); });
  const names = ['الشمس', 'المنتج', 'المستهلك الأول', 'المستهلك الثاني', 'المستهلك الثالث', 'المحلّل'];
  const infos = ['تستمدُّ معظمُ المخلوقاتِ الحيّةِ طاقتَها من الشمس، وتنتقلُ الطاقةُ من مخلوقٍ حيٍّ إلى آخرَ عبرَ السلسلةِ الغذائية.', 'تبدأُ السلسلةُ الغذائيةُ بالمنتج، وهو مخلوقٌ حيٌّ ينتجُ غذاءه بنفسِه بالبناءِ الضوئيّ. والنباتاتُ هي المنتجاتُ الرئيسةُ على اليابسة.', 'المستهلكاتُ الأولى تتغذّى على المنتجات، ومنها الحشراتُ (كالجرادة) والمواشي والفئرانُ والفيلة.', 'المستهلكاتُ الثانيةُ تحصلُ على الطاقةِ بتغذّيها على المستهلكاتِ الأولى، ومنها بعضُ أنواعِ الطيورِ التي تأكلُ الحشرات.', 'المستهلكاتُ الثالثةُ تأتي في نهايةِ معظمِ السلاسلِ الغذائية، وتتغذّى على المستهلكِ الثاني.', 'المحلّلُ مخلوقٌ حيٌّ يقومُ بتحليلِ بقايا المخلوقاتِ الميتةِ إلى موادَّ أبسط، ويعيدُ تدويرَ الموادِّ في البيئة، كالديدانِ والبكتيريا والفطريات.'];
  const parts = N.map((n, i) => ({ id: ['sun', 'prod', 'c1', 'c2', 'c3', 'dec'][i], name: names[i], info: infos[i], objs: [n.p], at: anchor(n.g, [0, .7, 0]) }));
  function hi() { N.forEach((n, i) => n.sp.scale.setScalar((step < 0 || i === step || i === step + 1 ? 1 : .6) * (i === 4 ? 1.2 : 1))); flows.forEach((x, i) => { x.ar.visible = step < 0 || i === step; x.f.rate = (step < 0 || i === step) ? 3 : 0; }); }
  hi();
  return {
    root, parts,
    update(dt) { flows.forEach(x => x.f.update(dt)); N[2].g.position.y = -.9 + Math.abs(Math.sin(performance.now() / 300)) * .1; },
    cam: { pos: [0, 2.2, 8.5], target: [0, -.2, 0] }, inpage: { pos: [0, 1.8, 8.6], target: [0, -.1, 0] },
    controls: [
      { type: 'steps', value: -1, steps: names.map((n, i) => ({ t: (i + 1) + '- ' + n, d: infos[i] })), on: i => { step = i; hi(); } },
      { type: 'button', label: '🚫 أزل المنتجات (جفاف)', toggle: true, on: on => { N[1].g.visible = !on; flows.forEach((x, i) => { if (i >= 1) x.f.rate = on ? 0 : 3; }); api.toast(on ? 'بدونِ المنتجاتِ لا تجدُ المستهلكاتُ الأولى غذاءً، فتموتُ أو تهاجر، ثم يتأثّرُ المستهلكُ الثاني والثالث.' : 'عادتِ المنتجاتُ فعادتِ الطاقةُ تنتقلُ في السلسلة.'); } }
    ],
    legend: [['#ffd23a', 'انتقال الطاقة']],
    quiz: [
      { q: 'المس المنتجَ في السلسلةِ الغذائية.', a: 'prod' },
      { q: 'المس المستهلكَ الأوّل.', a: 'c1' },
      { q: 'المس المخلوقَ الذي يحلّلُ بقايا المخلوقاتِ الميتة.', a: 'dec' },
      { q: 'المس المستهلكَ الثالث.', a: 'c3' }
    ]
  };
}

/* ═════════ ٨) الشبكة الغذائية على اليابسة (ص ١٤٠) ═════════ */
export function foodwebModel(api) {
  const root = new THREE.Group();
  const ground = mesh(new THREE.CylinderGeometry(4.4, 4.4, .2, 48), mat('#b8c98a'), [0, -2.2, 0]); root.add(ground);
  const S = { grass: node(root, '🌾', [-1.6, -1.5, .8]), plant: node(root, '🌿', [1.6, -1.5, .8]), hop: node(root, '🦗', [-2.6, -.3, .2], .8), mouse: node(root, '🐭', [-.2, -.6, .6], .85), deer: node(root, '🦌', [2.6, -.3, .2], 1), snake: node(root, '🐍', [-2.4, 1.3, 0], .95), eagle: node(root, '🦅', [-.2, 2.2, -.2], 1.1), tiger: node(root, '🐅', [2.4, 1.6, 0], 1.2) };
  const E = [['grass', 'hop'], ['grass', 'mouse'], ['plant', 'mouse'], ['plant', 'deer'], ['hop', 'snake'], ['mouse', 'snake'], ['mouse', 'eagle'], ['snake', 'eagle'], ['deer', 'tiger'], ['mouse', 'tiger']];
  const arrows = E.map(([a, b]) => { const A = S[a].g.position, B = S[b].g.position; const ar = arrowTube([A.clone().lerp(B, .2).toArray(), A.clone().lerp(B, .5).add(V(0, .2, .3)).toArray(), A.clone().lerp(B, .78).toArray()], .035, '#3a9ad9', .22); root.add(ar); return { a, b, ar }; });
  const off = {};
  function apply() { for (const k in S) S[k].g.visible = !off[k]; arrows.forEach(x => x.ar.visible = !off[x.a] && !off[x.b]); }
  const info = { grass: 'المنتجاتُ تشكّلُ أساسَ الشبكةِ الغذائية، فهي تصنعُ غذاءها بنفسِها.', plant: 'نباتاتٌ منتجةٌ تتغذّى عليها آكلاتُ الأعشاب.', hop: 'مستهلكٌ أوّلُ يتغذّى على النباتات، وهو فريسةٌ للأفعى.', mouse: 'مستهلكٌ أوّلُ يتغذّى على النباتاتِ والبذور، وهو جزءٌ من عدّةِ سلاسلَ غذائية؛ تأكلُه الأفعى والنسرُ والنمر.', deer: 'آكلُ أعشابٍ له أسنانٌ ذاتُ حوافَّ مستويةٍ لقطعِ النباتات وأسنانٌ مسطّحةٌ لطحنِها.', snake: 'قد تكونُ الأفعى مفترسًا يبتلعُ الفأرَ في يومٍ ما، ثم تصبحُ في اليومِ التالي فريسةً للنسر.', eagle: 'مفترسٌ يتغذّى على الأفاعي والفئرانِ والأرانبِ وحيواناتٍ أخرى.', tiger: 'مستهلكٌ يصطادُ الحيواناتِ ويمزّقُ الفريسةَ بأنيابِه وقواطعِه الحادّة.' };
  const nm = { grass: 'الأعشاب (منتج)', plant: 'النباتات (منتج)', hop: 'الجرادة', mouse: 'الفأر', deer: 'الغزال', snake: 'الأفعى', eagle: 'النسر', tiger: 'النمر' };
  const parts = Object.keys(S).map(k => ({ id: k, name: nm[k], info: info[k], objs: [S[k].p], at: anchor(S[k].g, [0, .65, 0]), hidden: () => !!off[k] }));
  return {
    root, parts,
    update(dt) { S.eagle.g.position.x = -.2 + Math.sin(performance.now() / 1500) * .3; },
    cam: { pos: [0, 1.2, 9], target: [0, 0, 0] }, inpage: { pos: [0, .9, 9], target: [0, 0, 0] },
    controls: [
      { type: 'button', label: '🐭 أزل الفئران من النظام البيئي', toggle: true, on: on => { off.mouse = on; apply(); api.refreshParts && api.refreshParts(); api.toast(on ? 'التغيّراتُ في جزءٍ من الشبكةِ تؤثّرُ في بقيّةِ الأجزاء: تقلُّ أغذيةُ الأفعى والنسرِ والنمر، وقد تزدادُ النباتاتُ والأعشاب.' : 'عادتِ الفئران.'); } },
      { type: 'button', label: '🐍 أزل الأفاعي', toggle: true, on: on => { off.snake = on; apply(); api.refreshParts && api.refreshParts(); api.toast(on ? 'بغيابِ الأفاعي قد تزدادُ أعدادُ الجرادِ والفئران، ويقلُّ غذاءُ النسر.' : 'عادتِ الأفاعي.'); } }
    ],
    legend: [['#3a9ad9', 'اتّجاه انتقال الطاقة (من يُؤكَل إلى من يأكل)']],
    quiz: [
      { q: 'المس حيوانًا يكونُ مفترسًا وفريسةً في الوقتِ نفسِه.', a: 'snake' },
      { q: 'المس حيوانًا هو جزءٌ من ثلاثِ سلاسلَ غذائيةٍ أو أكثر.', a: 'mouse' },
      { q: 'المس آكلَ أعشابٍ كبيرًا.', a: 'deer' }
    ]
  };
}

/* ═════════ ٩) هرم الطاقة (ص ١٤٢) ═════════ */
export function pyramidModel(api) {
  const root = new THREE.Group(); let sea = 0, base = 10000;
  const cols = ['#7cb342', '#c0ca33', '#ffb300', '#e65100'], H = .9;
  const levels = []; const labels = [];
  for (let i = 0; i < 4; i++) { const r0 = 2.8 - i * .65, r1 = 2.8 - (i + 1) * .65; const m = mesh(new THREE.CylinderGeometry(r1 * .72, r0 * .72, H, 4, 1), mat(cols[i], { roughness: .5, transparent: true, opacity: .92 }), [0, -1.6 + i * H + H / 2, 0], [0, Math.PI / 4, 0]); root.add(m); levels.push(m); const l = txt('', .34, '#333'); l.position.set(2.6 - i * .35, -1.6 + i * H + H / 2, 0); root.add(l); labels.push(l); }
  const sets = [[['🌾', '🌿', '🌻'], ['🦗', '🐛', '🦋'], ['🐦', '🐦'], ['🦊']], [['🦠', '🌱', '🦠'], ['🦐', '🐟', '🦐'], ['🐟', '🐧'], ['🦭']]];
  const icons = new THREE.Group(); root.add(icons);
  function apply() {
    icons.clear(); sets[sea].forEach((row, i) => row.forEach((ch, j) => { const s = emo(ch, .55); s.position.set((j - (row.length - 1) / 2) * .62, -1.6 + i * H + H / 2, (2.8 - i * .65) * .55); icons.add(s); }));
    labels.forEach((l, i) => setTxt(l, Math.round(base / Math.pow(10, i)).toLocaleString('ar-EG') + ' وحدة'));
  }
  apply();
  const heat = new Flow(root, '#ff6a3a', .05, 60); for (let i = 0; i < 4; i++) { const y = -1.6 + i * H + H / 2; heat.addPath(curve([[-(2.4 - i * .6) * .6, y, 0], [-(3 - i * .5), y + .3, .3], [-(3.6 - i * .4), y + .7, .5]]), .5); }
  heat.rate = 8;
  const nm = ['المنتجات', 'المستهلكات الأولى', 'المستهلكات الثانية', 'المستهلكات الثالثة'];
  const inf = ['تشكّلُ المنتجاتُ قاعدةَ الهرمِ الغذائيّ؛ لأنّها تدعمُ المخلوقاتِ الأخرى كافّة، وتوجدُ بأعدادٍ أكبرَ كثيرًا من المستهلكات.', 'الحيواناتُ التي تستهلكُ المنتجاتِ تحتلُّ المستوى التاليَ في الهرم. ولا تمتصُّ المستهلكاتُ الطاقةَ كلَّها، بل تستعملُ جزءًا في نشاطاتِها وتفقدُ جزءًا على شكلِ حرارة.', 'ينتقلُ ١/١٠ الطاقةِ الموجودةِ فقط في مستوى معيّنٍ من الهرمِ إلى المخلوقاتِ الموجودةِ في المستوى الذي يليه.', 'تناقصُ الطاقةِ من مستوى إلى آخرَ يحدُّ من أعدادِ المستهلكاتِ في قمّةِ الهرم.'];
  const parts = levels.map((m, i) => ({ id: 'l' + i, name: nm[i], info: inf[i], objs: [m], at: anchor(root, [-(2.4 - i * .6) * .55, -1.6 + i * H + H * .8, .6]) }));
  parts.push({ id: 'heat', name: 'طاقة مفقودة على شكل حرارة', info: 'في أثناءِ انتقالِ الطاقةِ تُستعملُ بعضُها في الوظائفِ الداخليةِ للمخلوقاتِ الحيّة، وبعضُها الآخرُ يتمُّ إطلاقُه على شكلِ حرارة.', objs: [proxy(root, [-2.6, 0, .4], [.8, 2.8, .8])], at: anchor(root, [-2.9, 1.1, .4]) });
  return {
    root, parts,
    update(dt) { heat.update(dt); },
    cam: { pos: [0, 1.4, 8.4], target: [0, -.1, 0] }, inpage: { pos: [0, 1, 8.4], target: [0, -.1, 0] },
    controls: [
      { type: 'seg', label: 'المكان', options: ['على اليابسة', 'في المحيط'], value: 0, on: k => { sea = k; apply(); } },
      { type: 'slider', label: 'طاقة المنتجات', min: 1000, max: 100000, step: 1000, value: 10000, fmt: v => Math.round(v).toLocaleString('ar-EG'), on: v => { base = v; apply(); } }
    ],
    legend: [['#ff6a3a', 'طاقة مفقودة (حرارة)']],
    quiz: [
      { q: 'المس المستوى الذي يشكّلُ قاعدةَ الهرم.', a: 'l0' },
      { q: 'المس المستوى الذي يحصلُ على أقلِّ طاقة.', a: 'l3' },
      { q: 'أين تذهبُ الطاقةُ غيرُ المنتقلة؟ المسها.', a: 'heat' }
    ]
  };
}

/* ═════════ ١٠) مناطق الحياة في المحيط (ص ١٥٦) ═════════ */
export function oceanzonesModel(api) {
  const root = new THREE.Group(); let depth = 0;
  const W = 9, D = 2.4;
  const shape = new THREE.Shape(); shape.moveTo(-W / 2, -3.2); shape.lineTo(W / 2, -3.2); shape.lineTo(W / 2, .4); shape.lineTo(W / 2 - 1.2, .2); shape.lineTo(W / 2 - 2.4, -.6); shape.lineTo(W / 2 - 3.6, -1.2); shape.lineTo(-1, -2.4); shape.lineTo(-W / 2, -2.6); shape.lineTo(-W / 2, -3.2);
  const floor = mesh(new THREE.ExtrudeGeometry(shape, { depth: D, bevelEnabled: false }), mat('#c9a46a', { map: noiseTexture('#d4b07a', '#a8854e', 3000) }), [0, 0, -D / 2]); root.add(floor);
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#7fd3f5'); gr.addColorStop(.35, '#2a7ab8'); gr.addColorStop(1, '#06213f'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const water = mesh(new THREE.BoxGeometry(W, 3.2, D), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: .55, depthWrite: false }), [0, -1.6, 0]); root.add(water);
  const lightL = mesh(new THREE.PlaneGeometry(W - 1.2, .02), new THREE.MeshBasicMaterial({ color: '#ffe066' }), [-.6, -1, D / 2 + .01]); root.add(lightL);
  const lL = txt('٢٠٠ م: تختفي أشعة الشمس', .3, '#7a5a00'); lL.position.set(-2.5, -.75, D / 2 + .1); root.add(lL);
  const plank = new THREE.Group(); for (let i = 0; i < 60; i++) plank.add(mesh(new THREE.SphereGeometry(.03, 6, 5), mat('#7ad97a', { emissive: '#2a8a2a', emissiveIntensity: .4 }), [(Math.random() - .5) * (W - .4), -.05 - Math.random() * .5, (Math.random() - .5) * D])); root.add(plank);
  const nek = [node(root, '🐬', [-3, -.9, .4], .9, null), node(root, '🦈', [-.4, -1.2, .5], .8, null), node(root, '🐟', [1.6, -.6, .5], .55, null), node(root, '🐋', [-2.2, -2, .3], 1, null)];
  const ben = [node(root, '🦀', [2.3, -.9, .6], .55, null), node(root, '🦞', [.6, -2.0, .5], .55, null), node(root, '🪸', [3.4, -.25, .5], .55, null), node(root, '🐙', [-2.8, -2.45, .5], .6, null)];
  const sun = mesh(new THREE.SphereGeometry(.35, 20, 14), mat('#ffd23a', { emissive: '#ffb000', emissiveIntensity: .9 }), [-3.6, 1.6, 0]); root.add(sun);
  const zoneMeta = [['tidal', 'منطقة المدّ', [3.9, .5, 0], 'المنطقةُ التي يغمرُها الماءُ عندَ المدّ ويكشفُها الجزر، ويتأثّرُ مَن يعيشُ فيها بالمدِّ والجزر.'], ['coast', 'منطقة الشاطئ', [1.8, .5, 0], 'منطقةٌ ضحلةٌ قربَ اليابسة تصلُها أشعّةُ الشمس، غنيّةٌ بالمخلوقاتِ الحيّة.'], ['open', 'منطقة المحيط', [-2, .5, 0], 'المنطقةُ المفتوحةُ العميقة؛ تقلُّ أشعّةُ الشمسِ تدريجيًّا مع العمقِ وتزدادُ ظلمةُ الماءِ وبرودتُه.']];
  const zones = zoneMeta.map(([id, n, p]) => { const l = txt(n, .32, '#0a3a6a'); l.position.set(...p); root.add(l); return l; });
  const probe = mesh(new THREE.ConeGeometry(.12, .3, 12), mat('#ff3a3a'), [-1.2, 0, D / 2 + .1]); probe.rotation.z = Math.PI; root.add(probe);
  const parts = [
    { id: 'plank', name: 'العوالق', info: 'تبدأُ السلاسلُ الغذائيةُ في المحيطِ بالعوالقِ التي تعيشُ بالقربِ من سطحِ الماء، ومنها الدياتومات، وتشكّلُ مصدرًا رئيسًا لغذاءِ المخلوقاتِ البحرية.', objs: plank.children, at: anchor(root, [.5, .1, 0]) },
    { id: 'nekton', name: 'السوابح', info: 'الحيواناتُ التي تسبحُ في الماء، ومنها الأسماكُ والدلافين.', objs: nek.map(n => n.p), at: anchor(root, [-3, -.4, .4]) },
    { id: 'benthos', name: 'القاعيات', info: 'المخلوقاتُ الحيّةُ التي تعيشُ بالقربِ من القاع، ومنها سرطانُ البحرِ والإسفنجُ والمرجان.', objs: ben.map(n => n.p), at: anchor(root, [.6, -1.6, .5]) },
    { id: 'light', name: 'حدّ وصول ضوء الشمس', info: 'قربَ السطحِ تدفئُ أشعّةُ الشمسِ الماء وتمدُّ المخلوقاتِ التي تقومُ بالبناءِ الضوئيِّ بالطاقة، وتقلُّ تدريجيًّا إلى أن تختفيَ عندَ عمقِ ٢٠٠ مترٍ تقريبًا.', objs: [lightL], at: anchor(root, [-3.6, -1, D / 2]) },
    ...zoneMeta.map(([id, n, p, inf], i) => ({ id, name: n, info: inf, objs: [proxy(root, [p[0], -.3, 0], [i === 2 ? 4 : 1.8, 1, D], 'box')], at: anchor(root, [p[0], p[1] - .3, 0]) }))
  ];
  return {
    root, parts,
    update(dt) { const t = performance.now() / 1000; nek.forEach((n, i) => { n.g.position.x += Math.sin(t * .5 + i) * .005; }); plank.position.x = Math.sin(t * .3) * .1; },
    cam: { pos: [0, .4, 9.2], target: [0, -1.1, 0] }, inpage: { pos: [0, -.2, 9.4], target: [0, -1.2, 0] },
    controls: [
      { type: 'slider', label: 'أنزل المسبار في المحيط', min: 0, max: 4000, step: 50, value: 0, fmt: v => Math.round(v).toLocaleString('ar-EG') + ' م', on: v => { depth = v; probe.position.y = -v / 4000 * 2.6; const L = v < 200 ? Math.round(100 - v / 2) : 0; api.toast(`العمق ${Math.round(v).toLocaleString('ar-EG')} م: الضوء ${L.toLocaleString('ar-EG')}٪ — ${v < 200 ? 'ماءٌ دافئٌ مضيءٌ تحدثُ فيه عملياتُ البناءِ الضوئيّ' : 'ظلامٌ وبرودةٌ وضغطٌ مرتفع؛ تتغذّى المخلوقاتُ بعضُها على بعض أو على موادَّ تصلُ من السطح'}`); } }
    ],
    quiz: [
      { q: 'المس المخلوقاتِ التي تعيشُ قربَ السطحِ وتبدأُ بها السلاسلُ الغذائية.', a: 'plank' },
      { q: 'المس المخلوقاتِ التي تعيشُ بالقربِ من القاع.', a: 'benthos' },
      { q: 'المس منطقةَ المدّ.', a: 'tidal' }
    ]
  };
}

/* ═════════ ١١) نطاقات التربة (ص ١٦٩) ═════════ */
export function soilModel(api) {
  const root = new THREE.Group(); let erode = false;
  const Wd = 2.6, Dp = 2.2;
  function layer(h, y, c1, c2, n, s) { return mesh(new THREE.BoxGeometry(Wd, h, Dp), mat('#fff', { map: noiseTexture(c1, c2, n, 256, 256, s), roughness: 1 }), [0, y, 0]); }
  const A = layer(1, 1.2, '#3e2a18', '#5a3e26', 3500, 3), B = layer(1.1, .15, '#a8743a', '#c8944a', 2500, 4), C = layer(1.2, -1, '#9a8a70', '#6e604a', 1200, 9), bed = layer(.6, -1.9, '#6a6a6a', '#4a4a4a', 800, 12);
  root.add(A, B, C, bed);
  const rocks = []; for (let i = 0; i < 18; i++) { const r = mesh(new THREE.DodecahedronGeometry(.12 + Math.random() * .16, 0), mat('#8a7c66', { flatShading: true }), [(Math.random() - .5) * (Wd + .02), -1 + (Math.random() - .5) * 1, Dp / 2 + .02]); root.add(r); rocks.push(r); }
  for (let i = 0; i < 14; i++) { const r = mesh(new THREE.DodecahedronGeometry(.05 + Math.random() * .05, 0), mat('#d2a05a', { flatShading: true }), [(Math.random() - .5) * Wd, .15 + (Math.random() - .5) * .9, Dp / 2 + .02]); root.add(r); }
  const grass = new THREE.Group(); for (let i = 0; i < 160; i++) grass.add(mesh(new THREE.ConeGeometry(.03, .3 + Math.random() * .2, 4), mat(i % 2 ? '#5aa03a' : '#7cbc4a'), [(Math.random() - .5) * Wd, 1.85, (Math.random() - .5) * Dp])); root.add(grass);
  const roots = []; for (let i = 0; i < 8; i++) { const x = (Math.random() - .5) * 2, z = Dp / 2 + .01; const r = tube([[x, 1.7, z], [x + .1, 1.3, z], [x - .1, .95, z], [x + .05, .75, z]], .02, mat('#e8d8b8'), 12, 4); root.add(r); roots.push(r); }
  const hum = []; for (let i = 0; i < 20; i++) { const h = mesh(new THREE.BoxGeometry(.08, .02, .05), mat('#8a6a2a'), [(Math.random() - .5) * Wd, 1.2 + (Math.random() - .5) * .8, Dp / 2 + .02]); root.add(h); hum.push(h); }
  const tags = [['أ', 1.2, '#5ab03a'], ['ب', .15, '#f28a2a'], ['ج', -1, '#7a3ab0']].map(([s, y, c]) => { const l = txt(s, .36, '#fff', c); l.position.set(-Wd / 2 - .5, y, Dp / 2); root.add(l); return l; });
  const water = new Flow(root, '#3c9ae0', .045, 80); for (let i = 0; i < 6; i++) { const x = (i - 2.5) * .35; water.addPath(curve([[x, 1.9, Dp / 2 + .05], [x + .05, 1.2, Dp / 2 + .05], [x - .05, .4, Dp / 2 + .05], [x, -.6, Dp / 2 + .05], [x, -1.6, Dp / 2 + .05]]), .18); } water.rate = 0;
  const parts = [
    { id: 'A', name: 'النطاق (أ): التربة السطحية', info: 'يحملُ معظمَ المغذّيات، ويحوي الدبال، وتنمو فيه معظمُ جذورِ النباتات، وتمتصُّ الماءَ والغذاءَ من الدبال.', objs: [A], at: anchor(root, [Wd / 2, 1.5, Dp / 2]) },
    { id: 'hum', name: 'الدبال', info: 'جزءٌ من التربةِ تكوّنَ من الموادِّ العضويةِ المتحلّلة، وهي بقايا النباتاتِ والحيواناتِ الميتةِ التي حلّلتْها المخلوقاتُ المجهرية، ويمتصُّ الماءَ ويحتفظُ به أكثرَ من الفتاتِ الصخريّ.', objs: hum, at: anchor(root, [.6, 1.0, Dp / 2]), hidden: () => erode },
    { id: 'B', name: 'النطاق (ب): التربة تحت السطحية', info: 'فيه نسبةٌ قليلةٌ من الدبالِ ونسبةٌ كبيرةٌ من الصخورِ المفتّتة، وهذه الصخورُ تشبهُ الصخورَ التي تكوّنُ الصلصال.', objs: [B], at: anchor(root, [Wd / 2, .4, Dp / 2]) },
    { id: 'C', name: 'النطاق (ج)', info: 'معظمُه يتكوّنُ من قطعٍ كبيرةٍ من صخورِ التجوية، وهذه المنطقةُ تكونُ صلبة، وتقعُ فوقَ الصخورِ غيرِ المجوّاة.', objs: [C, ...rocks], at: anchor(root, [Wd / 2, -.7, Dp / 2]) },
    { id: 'bed', name: 'الصخور غير المجوّاة', info: 'الصخرُ الأصليُّ الذي تتكوّنُ منه التربةُ عبرَ سنينَ طويلةٍ بفعلِ التجوية.', objs: [bed], at: anchor(root, [Wd / 2, -1.9, Dp / 2]) },
    { id: 'roots', name: 'جذور النباتات', info: 'جذورُ النباتاتِ تثبّتُ التربةَ في مكانِها؛ فإذا زالتِ النباتاتُ تزدادُ تعريةُ التربة.', objs: roots, at: anchor(root, [-.6, 1.4, Dp / 2]), hidden: () => erode }
  ];
  return {
    root, parts,
    update(dt) { water.update(dt); water.items.forEach(m => { const y = m.position.y; m.userData.p.speed = y > .7 ? .08 : .22; }); },
    cam: { pos: [3, 1.6, 6], target: [0, 0, 0] }, inpage: { pos: [1.2, .4, 7], target: [0, 0, 0] }, fit: 1,
    controls: [
      { type: 'button', label: '💧 اسكب ماءً على التربة', on: () => { water.rate = 12; setTimeout(() => water.rate = 0, 2500); api.toast('يحتفظُ الدبالُ في النطاقِ (أ) بالماءِ أطول، ثم يتسرّبُ ببطءٍ إلى الطبقاتِ السفلى.'); } },
      { type: 'button', label: '🌬️ أزل النباتات ودع الرياح تعرّي التربة', toggle: true, on: on => { erode = on; grass.visible = !on; roots.forEach(r => r.visible = !on); hum.forEach(h => h.visible = !on); A.scale.y = on ? .25 : 1; A.position.y = on ? .82 : 1.2; api.refreshParts && api.refreshParts(); api.toast(on ? 'بدونِ جذورٍ تثبّتُها انجرفتِ التربةُ السطحيةُ الغنيّةُ بالدبال، فيصعبُ نموُّ النباتات. لذا نحفظُ التربةَ بمصدّاتِ الرياحِ والأشرطةِ المتبادلة.' : 'عادَ الغطاءُ النباتيُّ يثبّتُ التربة.'); } }
    ],
    legend: [['#3c9ae0', 'ماء يتسرّب']],
    quiz: [
      { q: 'المس النطاقَ الذي يحوي معظمَ الموادِّ العضوية.', a: 'A' },
      { q: 'المس النطاقَ المكوّنَ من قطعٍ صخريةٍ كبيرة.', a: 'C' },
      { q: 'المس الموادَّ العضويةَ المتحلّلةَ في التربة.', a: 'hum' }
    ]
  };
}
