// مجسّمات الصف السادس (٢): النباتات وأجهزة الجسم والأنظمة البيئية
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, proxy, noiseTexture, tree, cloud, arrowTube, noise3, tissue, vessel, mergeGeos, twigs, srnd, reseed, organGeo, fbm3, badge, ArrowFlow, CellFlow } from './kit.js';
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
  const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color: '#f0c4a4', roughness: .5, transparent: true, opacity: op + .04, depthWrite: false, sheen: 1, sheenColor: new THREE.Color('#ffe4cf'), clearcoat: .2 });
  const prof = [[0, -1.75], [.95, -1.65], [1.15, -1.25], [1.08, -.6], [1.0, 0], [1.08, .7], [1.25, 1.5], [1.38, 2.1], [1.2, 2.38], [.55, 2.5], [.34, 2.58], [.32, 2.85], [0, 2.86]].map(([r, y]) => new THREE.Vector2(r, y));
  const t = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), m); t.scale.z = .6; g.add(t);
  const h = new THREE.Mesh(organGeo(.72, v => { v.y *= 1.18; v.z *= 1.05; if (v.z > .3 && Math.abs(v.x) < .12 && v.y > -.2 && v.y < .25) v.z += .08 * (1 - Math.abs(v.x) / .12); }, 64, 48), m); h.position.set(0, 3.35, 0); g.add(h);
  const pre = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, opacity: 0, depthWrite: true });
  [...g.children].forEach(o => { const d = o.clone(); d.material = pre; d.renderOrder = 20; d.raycast = () => {}; d.userData.glow = true; g.add(d); o.renderOrder = 21; });
  return g;
}
/* ═════════ ٢) الجهاز الهضمي (ص ١١١) — أعضاءٌ واقعيّة ═════════ */
export function digestiveModel(api) {
  const root = new THREE.Group(); let speed = 1; root.add(body()); reseed(21);
  const mouth = mesh(new THREE.TorusGeometry(.18, .055, 14, 32, Math.PI), tissue('#c04a5a'), [0, 3.05, .62], [0, 0, Math.PI]); root.add(mouth);
  const eso = vessel([[0, 3.0, .4], [0, 2.6, .1], [.05, 1.8, 0], [.25, 1.25, 0]], .095, .085, tissue('#d98a90', { kind: 'pore' }), 40, 16, .03); root.add(eso);
  const stomach = mesh(organGeo(.55, v => { const a = Math.atan2(v.y, v.x); v.x *= 1.15; v.y *= .8; v.z *= .7; v.y += Math.cos(v.x * 2.2) * .12; v.multiplyScalar(1 + fbm3(v.x * 5, v.y * 5, v.z * 5) * .04); }), tissue('#d9737f', { bumpScale: 1.1 }), [.55, .95, 0]); stomach.rotation.z = -.5; root.add(stomach);
  const liver = mesh(organGeo(.75, v => { v.x *= 1.25; v.y *= .55; v.z *= .62; if (v.x > 0) { v.y *= 1 - v.x * .5; v.z *= 1 - v.x * .3; } v.y -= Math.max(0, -v.y) * .2; v.multiplyScalar(1 + fbm3(v.x * 3, v.y * 3, v.z * 3) * .03); }), tissue('#7a2a1e', { kind: 'pore', bumpScale: .5, clearcoat: .9 }), [-.5, 1.3, .1]); root.add(liver);
  const gall = mesh(organGeo(.13, v => { v.y *= 1.6; }), tissue('#5f8a3a', { clearcoat: 1 }), [-.35, .95, .32], [0, 0, .5]); root.add(gall);
  const panc = mesh(organGeo(.4, v => { v.x *= 1.1; v.y *= .26; v.z *= .26; v.y += v.x * v.x * .15; v.multiplyScalar(1 + fbm3(v.x * 9, v.y * 9, v.z * 9) * .12); }), tissue('#eab77a', { kind: 'pore', bumpScale: 1.2 }), [.35, .55, -.15], [0, 0, .2]); root.add(panc);
  const siPts = []; for (let i = 0; i <= 90; i++) { const t = i / 90; siPts.push([.62 * Math.sin(t * 23 + .6) * (.75 + .25 * Math.cos(t * 7)), .28 - t * 1.12 + .13 * Math.sin(t * 41), .12 + .22 * Math.cos(t * 17) + .05 * Math.sin(t * 53)]); }
  const smallI = vessel([[.55, .65, 0], ...siPts], .075, .07, tissue('#eb9da5', { bumpScale: .6 }), 600, 12, .06); root.add(smallI);
  const largeI = vessel([[.15, -.95, .1], [-1, -.9, .1], [-1.05, .45, .1], [1.05, .45, .2], [1.05, -.9, .1], [.3, -1.2, .1], [.1, -1.5, 0]], .16, .13, tissue('#c9737c', { bumpScale: .8 }), 220, 16, .16); root.add(largeI);
  const path = curve([[0, 3.05, .6], [0, 2.6, .1], [.05, 1.8, 0], [.25, 1.25, 0], [.6, .95, 0], [.55, .65, 0], ...siPts.filter((_, i) => i % 3 === 0), [.15, -.95, .1], [-1, -.9, .1], [-1.05, .45, .1], [1.05, .45, .2], [1.05, -.9, .1], [.3, -1.2, .1], [.1, -1.5, 0]]);
  const bolus = mesh(organGeo(.13, v => v.multiplyScalar(1 + fbm3(v.x * 20, v.y * 20, v.z * 20) * .15), 24, 18), mat('#a8722a'), [0, 3.05, .6]); root.add(bolus); let bt = -1;
  const say = [[0, 'الفم: يبدأُ الهضمُ في الفم.'], [.06, 'المريء: ينقلُ الطعامَ إلى المعدة.'], [.17, 'المعدة: يحلّلُ الحمضُ وإنزيمُ المعدةِ الغذاءَ إلى دقائقَ صغيرة.'], [.27, 'الأمعاءُ الدقيقة: تحلّلُ العصارةُ الهضميةُ البروتيناتِ والنشويّاتِ والدهون، وتُمتصُّ الموادُّ الغذائيةُ إلى الدم.'], [.72, 'الأمعاءُ الغليظة: يُمتصُّ الماء.'], [.97, 'الإخراج: التخلّصُ من الفضلاتِ خارجَ الجسم.']]; let said = -1;
  const parts = [
    { id: 'mouth', name: 'الفم', info: 'في الإنسانِ يحدثُ الهضمُ في الفمِ والمعدةِ والأمعاءِ الدقيقة.', objs: [mouth], at: anchor(root, [0, 3.05, .7]) },
    { id: 'eso', name: 'المريء', info: 'أنبوبٌ ينقلُ الغذاءَ من الفمِ إلى المعدة.', objs: [eso], at: anchor(root, [0, 2.2, .1]) },
    { id: 'stom', name: 'المعدة', info: 'يحلّلُ الحمضُ وإنزيمُ المعدةِ الغذاءَ إلى دقائقَ صغيرة.', objs: [stomach], at: anchor(root, [.9, 1.1, .3]) },
    { id: 'liver', name: 'الكبد', info: 'يساعدُ الكبدُ الجهازَ الهضميَّ في هضمِ الطعام، ويعملُ على تخليصِ الجسمِ من الفضلات.', objs: [liver], at: anchor(root, [-.9, 1.45, .4]) },
    { id: 'gall', name: 'الحويصلة الصفراوية', info: 'كيسٌ صغيرٌ تحتَ الكبدِ يخزّنُ العصارةَ الصفراءَ التي يفرزُها الكبد، وتساعدُ على هضمِ الدهون. (إثراء)', objs: [gall], at: anchor(root, [-.45, .85, .45]) },
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

/* ═════════ ٣) الجهاز التنفسي (ص ١١٣) — أعضاءٌ واقعيّة ═════════ */
export function lungsModel(api) {
  const root = new THREE.Group(); let rate = 1, t = 0, auto = true; root.add(body(.1)); reseed(31);
  const airM = tissue('#d9b3a2', { kind: 'pore', bumpScale: .5 });
  const nose = mesh(organGeo(.16, v => { v.z *= 1.6; v.y *= 1.2; if (v.z > 0) v.x *= 1 - v.z * 1.2; }), tissue('#e8b090', { kind: 'pore' }), [0, 3.32, .72]); root.add(nose);
  const phar = vessel([[0, 3.3, .55], [0, 3.1, .2], [0, 2.75, .05]], .1, .09, airM, 20, 12); root.add(phar);
  const larynx = mesh(organGeo(.16, v => { v.y *= 1.1; if (v.z > 0) v.z *= 1.3; }), tissue('#d8b8a8'), [0, 2.6, .05]); root.add(larynx);
  const trachea = new THREE.Group(); trachea.add(vessel([[0, 2.48, .05], [0, 1.95, .05], [0, 1.55, .05]], .12, .115, airM, 30, 16)); for (let i = 0; i < 9; i++) trachea.add(mesh(new THREE.TorusGeometry(.125, .028, 10, 28), tissue('#efe2d6'), [0, 2.4 - i * .1, .05], [Math.PI / 2, 0, 0])); root.add(trachea);
  const bron = []; const tw = [];
  for (const s of [-1, 1]) { bron.push(vessel([[0, 1.55, .05], [s * .4, 1.3, .05], [s * .75, 1.1, 0]], .085, .06, airM, 20, 12)); for (let k = 0; k < 4; k++) { const e = V(s * (1 + k * .12), .5 - k * .3, (k - 1.5) * .2); bron.push(vessel([[s * .75, 1.1, 0], [s * (.9 + k * .1), .8 - k * .25, (k - 1.5) * .15], e.toArray()], .04, .025, airM, 12, 8)); twigs(tw, e, V(s * .2, -.6, (k - 1.5) * .3), .13, .016, 4, 1.5); twigs(tw, V(s * (.9 + k * .1), .8 - k * .25, (k - 1.5) * .15), V(s * .5, .4 - k * .3, (k - 1.5) * .4), .14, .016, 4, 1.5); } }
  bron.push(new THREE.Mesh(mergeGeos(tw), airM)); bron.forEach(b => root.add(b));
  const lM = tissue('#ec8a97', { transparent: true, opacity: .55, depthWrite: false, bumpScale: 1.4, roughness: .55 });
  const lungGeo = s => organGeo(1, v => { const t = (v.y + 1) / 2; v.x *= (.5 + t * .2) * (v.x * s > 0 ? 1.15 : .8); v.y *= 1.05 - (v.y > 0 ? v.y * .35 : 0); if (v.y < -.6) v.y += (v.x * s) * .1; v.multiplyScalar(1 + fbm3(v.x * 3 + s, v.y * 3, v.z * 3) * .05); if (s < 0 && v.x * s < -.1 && v.y < .1 && v.z > 0) v.x += s * .12; }, 72, 56);
  const lungL = mesh(lungGeo(-1), lM, [-1, .5, 0]); lungL.scale.set(.62 / .62, 1.25, .6); const lungR = mesh(lungGeo(1), lM, [1, .5, 0]); lungR.scale.set(1.1, 1.25, .6); lungL.renderOrder = lungR.renderOrder = 2; root.add(lungL, lungR);
  // عنقودُ الحويصلاتِ الهوائيّةِ مع شعيراتٍ دمويّة
  const alv = new THREE.Group(); const aM = tissue('#e8707e', { kind: 'pore', clearcoat: 1 }), cap = [];
  for (let i = 0; i < 16; i++) { const p = V(1.2 + (srnd() - .5) * .32, -.12 + (srnd() - .5) * .3, .3 + (srnd() - .5) * .16); alv.add(mesh(new THREE.SphereGeometry(.055 + srnd() * .025, 18, 14), aM, p.toArray())); twigs(cap, p, V(srnd() - .5, srnd() - .5, 1), .06, .006, 2, 1.6); }
  const capM = [new THREE.Mesh(mergeGeos(cap), tissue('#b5121d'))]; alv.add(...capM); root.add(alv);
  const diaph = mesh(new THREE.SphereGeometry(1.6, 48, 16, 0, Math.PI * 2, 0, Math.PI / 3.2), tissue('#b8505a', { side: 2, bumpScale: 1 }), [0, -1.45, 0]); diaph.scale.set(1, .45, .6); root.add(diaph);
  const o2 = new Flow(root, '#4ab0ff', .05, 50), co2 = new Flow(root, '#9a9a9a', .05, 50);
  o2.addPath(curve([[0, 3.4, .9], [0, 3.1, .3], [0, 2.6, .05], [0, 1.6, .05], [.6, 1.2, 0], [1.2, -.1, .3]]), .5).addPath(curve([[0, 3.4, .9], [0, 3.1, .3], [0, 2.6, .05], [0, 1.6, .05], [-.6, 1.2, 0], [-1.1, .2, .2]]), .5);
  co2.addPath(curve([[1.2, -.1, .3], [.6, 1.2, 0], [0, 1.6, .05], [0, 2.6, .05], [0, 3.1, .3], [0, 3.4, 1]]), .5);
  const parts = [
    { id: 'nose', name: 'الأنف والفم', info: 'في الإنسانِ يدخلُ الهواءُ عبرَ الفمِ والأنفِ إلى البلعوم.', objs: [nose], at: anchor(root, [.15, 3.35, .85]) },
    { id: 'phar', name: 'البلعوم', info: 'ممرٌّ يمرُّ عبرَه الهواءُ من الأنفِ والفمِ إلى الحنجرة.', objs: [phar], at: anchor(root, [-.2, 3.0, .2]) },
    { id: 'lar', name: 'الحنجرة', info: 'ينتقلُ الهواءُ من البلعومِ إلى الحنجرة، ثم إلى القصبةِ الهوائية.', objs: [larynx], at: anchor(root, [.25, 2.6, .1]) },
    { id: 'tra', name: 'القصبة الهوائية', info: 'أنبوبٌ تدعمُه حلقاتٌ غضروفيةٌ ينقلُ الهواءَ إلى الشعبتينِ الهوائيتين.', objs: trachea.children, at: anchor(root, [.25, 2.0, .1]) },
    { id: 'bron', name: 'الشعبتان والشعيبات الهوائية', info: 'تتفرّعُ الشعبتانِ الهوائيتانِ إلى شعيباتٍ هوائيةٍ أدقَّ فأدقّ، حتى تنتهيَ بأكياسٍ صغيرةٍ تسمّى الحويصلاتِ الهوائية.', objs: bron, at: anchor(root, [-.5, 1.4, .1]) },
    { id: 'alv', name: 'الحويصلات الهوائية', info: 'عندَ الحويصلاتِ الهوائيةِ يحدثُ تبادلُ الغازاتِ بينَ الدمِ والهواءِ الذي يدخلُ إليها من خلالِ جدرانِها الرقيقة.', objs: alv.children, at: anchor(root, [1.3, -.1, .45]) },
    { id: 'lung', name: 'الرئتان', info: 'تستخدمُ الزواحفُ والطيورُ والثديياتُ الرئاتِ بصورةٍ رئيسةٍ في التنفّس.', objs: [lungL, lungR], at: anchor(root, [-1.1, 1.4, .3]) },
    { id: 'dia', name: 'الحجاب الحاجز', info: 'ينقبضُ الحجابُ الحاجزُ وينبسطُ لينظّمَ عمليةَ التنفّس: الشهيقَ والزفير.', objs: [diaph], at: anchor(root, [0, -1.0, .6]) }
  ];
  return {
    root, parts,
    update(dt) { if (auto) t += dt * rate; const inh = Math.sin(t * 1.4); const k = 1 + inh * .08; lungL.scale.set(1.05 * k, 1.25 * k, .6 * k); lungR.scale.set(1.12 * k, 1.25 * k, .6 * k); diaph.position.y = -1.45 - inh * .15; o2.rate = inh > 0 ? 6 * rate : 0; co2.rate = inh < 0 ? 6 * rate : 0; o2.update(dt); co2.update(dt); },
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

/* ═════════ ٤) الدورة الدموية (ص ١١٦) — نموذجٌ واقعيٌّ مطابقٌ لشكلِ الكتاب ═════════ */
export function heartModel(api) {
  const root = new THREE.Group(); let beat = 0, rate = 1, step = -1; reseed(11);
  const red = tissue('#b5121d', { kind: 'pore', bumpScale: .4, transparent: true, opacity: .74 }), blue = tissue('#2a45a8', { kind: 'pore', bumpScale: .4, transparent: true, opacity: .74 });
  const capM = tissue('#7d3a8f', { kind: 'pore', bumpScale: .3, transparent: true, opacity: .85 });
  const book = new THREE.Group(), extra = new THREE.Group(); root.add(book, extra); extra.visible = false;
  const flows = { a: [], v: [] };
  const add = (grp, pts, r0, r1, m, fl, ex) => { const o = vessel(pts, r0, r1, m); o.renderOrder = 1; grp.add(o); if (fl) flows[fl].push({ c: o.userData.curve, r0, r1, hide: ex ? () => !extra.visible : null }); return o; };
  // الأوعيةُ كما في الشكل
  const aorta = [add(book, [[.08, 1.42, .3], [-.02, 1.9, .24], [.05, 2.18, .05], [.24, 2.12, -.16], [.26, 1.7, -.3], [.18, .9, -.32]], .11, .095, red, 'a'), add(book, [[.05, 2.15, .05], [.05, 2.6, .05], [.05, 2.95, .05]], .06, .055, red, 'a')];
  const vena = [add(book, [[-.2, 2.95, .14], [-.2, 2.3, .12], [-.17, 1.75, .22], [-.14, 1.42, .3]], .1, .095, blue, 'v'), add(book, [[-.14, .8, -.05], [-.15, 1.0, .05], [-.16, 1.15, .22]], .1, .1, blue, 'v')];
  const part = [add(book, [[-.02, 1.38, .4], [-.06, 1.72, .45], [-.02, 1.95, .32]], .085, .075, blue, 'v')];
  for (const s of [1, -1]) part.push(add(book, [[-.02, 1.95, .32], [.25 * s, 2.0, .24], [.5 * s, 1.92, .12]], .06, .045, blue, 'v'));
  const pvein = []; for (const s of [1, -1]) for (const dy of [.12, -.18]) pvein.push(add(book, [[.62 * s, 1.5 + dy, .08], [.38 * s, 1.38 + dy * .5, .16], [.16 * s + .06, 1.26, .2]], .035, .045, red, 'a'));
  // الشعيراتُ الدمويّةُ في الرئتين: تبدأُ زرقاءَ وتنتهي حمراء
  const caps = []; { const bl = [], rd = [], mid = [];
    for (const s of [1, -1]) { twigs(bl, V(.5 * s, 1.92, .12), V(.5 * s, -.15, 0), .2, .028, 4, 1.3); twigs(bl, V(.5 * s, 1.92, .12), V(.25 * s, .6, -.1), .18, .024, 3, 1.3); twigs(bl, V(.5 * s, 1.92, .12), V(.2 * s, -1, 0), .22, .026, 4, 1.2);
      for (const dy of [.12, -.18]) { twigs(rd, V(.62 * s, 1.5 + dy, .08), V(.6 * s, -.1, -.05), .18, .026, 4, 1.3); twigs(rd, V(.62 * s, 1.5 + dy, .08), V(.2 * s, -.8, 0), .2, .024, 3, 1.2); }
      for (let k = 0; k < 14; k++) twigs(mid, V((.35 + srnd() * .45) * s, 1.05 + srnd() * 1.05, -.15 + srnd() * .3), V(srnd() - .5, srnd() - .5, srnd() - .5), .08, .01, 2, 1.5); }
    for (const [L, m] of [[bl, blue], [rd, red], [mid, capM]]) { const o = new THREE.Mesh(mergeGeos(L), m); o.renderOrder = 1; book.add(o); caps.push(o); } }
  // القلب
  const heart = new THREE.Group(); heart.position.set(.06, 1.16, .32); heart.rotation.set(.25, -.35, .55); const HS = .82; heart.scale.setScalar(HS); book.add(heart);
  const hShape = v => { const y = v.y; const s = y < 0 ? 1 + y * .55 : 1 - y * y * .08; v.x *= s * 1.05; v.z *= s * .9; v.y *= 1.25; v.multiplyScalar(1 + fbm3(v.x * 3 + 1, v.y * 3, v.z * 3) * .05); if (y > .3) v.x += Math.sin(v.z * 4) * .04; return v; };
  const hm = tissue('#8e1d22', { bumpScale: .9 }), raM = tissue('#6e2240'), laM = tissue('#7a1a24');
  const H = mesh(organGeo(.42, hShape, 96, 72), hm); heart.add(H);
  const RA = mesh(new THREE.SphereGeometry(.2, 40, 30), raM, [-.3, .42, .02], null, [1, .8, .9]), LA = mesh(new THREE.SphereGeometry(.2, 40, 30), laM, [.28, .42, .02], null, [1, .8, .9]); heart.add(RA, LA);
  const cor = (pts, r, m) => heart.add(vessel(pts.map(p => hShape(V(...p).multiplyScalar(1.03))), r, r * .4, m, 40, 8));
  const corA = tissue('#c0141f'), corV = tissue('#2c49b0');
  cor([[0, .3, .42], [.05, 0, .44], [.12, -.3, .33], [.08, -.5, .15]], .018, corA); cor([[.2, .28, .35], [.35, 0, .2], [.32, -.3, .05]], .016, corA); cor([[-.25, .28, .33], [-.32, 0, .25], [-.25, -.35, .1]], .016, corA); cor([[.05, .25, .43], [-.08, -.1, .43], [-.05, -.45, .25]], .014, corV);
  // الرئتان والقصبة
  const lungs = new THREE.Group(); book.add(lungs); const lungM = tissue('#e39a9a', { transparent: true, opacity: .5, depthWrite: false, bumpScale: 1.2, roughness: .55 });
  for (const s of [1, -1]) { const g = organGeo(.5, v => { const t = v.y + .5; v.x *= (.55 + t * .2) * (v.x * s < 0 ? .75 : 1.1); v.z *= .9; v.y *= 2.1 - (v.y > 0 ? v.y * .9 : 0); v.multiplyScalar(1 + fbm3(v.x * 4 + s, v.y * 4, v.z * 4) * .06); }, 80, 60);
    const m = new THREE.Mesh(g, lungM); m.position.set(.58 * s, 1.55, .02); m.renderOrder = 2; lungs.add(m); }
  const trM = tissue('#e7d2c4', { kind: 'pore', bumpScale: .5 }); lungs.add(vessel([[0, 2.75, -.08], [0, 2.2, -.1], [0, 1.98, -.12]], .06, .055, trM, 20, 12)); for (const s of [1, -1]) lungs.add(vessel([[0, 1.98, -.12], [.22 * s, 1.84, -.12], [.45 * s, 1.66, -.1]], .045, .03, trM, 16, 10));
  // إثراء: الجسمُ كاملًا
  const aT = [], vT = [], ex = [];
  ex.push(add(extra, [[.18, .9, -.32], [.06, -.2, -.26], [.04, -.6, -.2]], .095, .085, red, 'a', 1), add(extra, [[-.1, -.62, -.08], [-.1, -.1, -.14], [-.14, .8, -.05]], .1, .1, blue, 'v', 1));
  for (const s of [1, -1]) { const off = (pts, dx, dz) => pts.map(([x, y, z]) => [x + s * dx, y, z + dz]);
    ex.push(add(extra, [[.16 * s, 2.15, .02], [.45 * s, 2.32, .02], [.9 * s, 2.3, 0], [1.15 * s, 1.6, .02], [1.35 * s, .95, .06], [1.52 * s, .35, .12], [1.63 * s, -.12, .16]], .055, .03, red, 'a', 1));
    ex.push(add(extra, [[.05, 2.6, .05], [.15 * s, 2.75, .08], [.17 * s, 2.95, .06], [.2 * s, 3.25, .02]], .045, .025, red, 'a', 1), add(extra, [[.17 * s, 2.95, .06], [.3 * s, 3.2, .15], [.35 * s, 3.55, .05], [.22 * s, 3.75, -.05]], .025, .012, red, null, 1));
    ex.push(add(extra, [[.04 * s, -.6, -.2], [.25 * s, -.85, -.02], [.42 * s, -1.25, .08], [.48 * s, -2.1, .05], [.5 * s, -2.35, -.05], [.5 * s, -3.0, -.02], [.52 * s, -3.42, .02], [.56 * s, -3.55, .3]], .075, .028, red, 'a', 1));
    ex.push(add(extra, off([[1.63 * s, -.12, .16], [1.52 * s, .35, .12], [1.35 * s, .95, .06], [1.15 * s, 1.6, .02], [.9 * s, 2.3, 0], [.45 * s, 2.25, .1]], .06, .09).concat([[-.2, 2.3, .12]]), .03, .06, blue, 'v', 1));
    ex.push(add(extra, [[.28 * s, 3.3, .05], [.25 * s, 2.95, .14], [.22 * s, 2.55, .16], [-.12 + .06 * s, 2.4, .14]], .025, .05, blue, 'v', 1));
    ex.push(add(extra, off([[.56 * s, -3.55, .3], [.52 * s, -3.42, .02], [.5 * s, -3.0, -.02], [.5 * s, -2.35, -.05], [.48 * s, -2.1, .05], [.42 * s, -1.25, .08], [.25 * s, -.85, -.02]], .07, .07).concat([[-.1, -.62, -.08]]), .03, .085, blue, 'v', 1));
    twigs(aT, V(1.63 * s, -.12, .16), V(.15 * s, -1, .2), .28, .02, 3); twigs(aT, V(.56 * s, -3.55, .3), V(0, -.2, 1), .2, .02, 2); twigs(aT, V(.22 * s, 3.75, -.05), V(-.3 * s, .6, -.2), .22, .012, 3); twigs(aT, V(.48 * s, -2.1, .05), V(.3 * s, -.5, .4), .25, .025, 2);
    twigs(vT, V(1.7 * s, -.1, .25), V(.1 * s, -1, .2), .26, .02, 3); twigs(vT, V(.63 * s, -3.55, .36), V(0, -.2, 1), .18, .018, 2); twigs(vT, V(.3 * s, 3.4, .05), V(.1 * s, .6, -.3), .22, .012, 3); }
  const bodyCap = [new THREE.Mesh(mergeGeos(aT), red), new THREE.Mesh(mergeGeos(vT), blue)]; bodyCap.forEach(o => { o.renderOrder = 1; extra.add(o); });
  const skinM = new THREE.MeshPhysicalMaterial({ color: '#e7b99a', roughness: .5, transparent: true, opacity: .16, depthWrite: false, sheen: 1, sheenColor: new THREE.Color('#ffe2cc') }), skin = new THREE.Group(); extra.add(skin);
  const limb = (a, b, r1, r2) => { const A0 = V(...a), B0 = V(...b), m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, A0.distanceTo(B0), 32, 8, true), skinM); m.position.copy(A0).add(B0).multiplyScalar(.5); m.quaternion.setFromUnitVectors(V(0, 1, 0), B0.clone().sub(A0).normalize()); skin.add(m);
    for (const [p, r] of [[A0, r1], [B0, r2]]) { const j = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), skinM); j.position.copy(p); skin.add(j); } };
  { const prof = [[0, -1.15], [.5, -1.05], [.62, -.65], [.56, -.1], [.5, .3], [.58, .9], [.74, 1.5], [.82, 2.05], [.64, 2.35], [.25, 2.55], [.13, 2.62]].map(([r, y]) => new THREE.Vector2(r, y));
    const t = new THREE.Mesh(new THREE.LatheGeometry(prof, 64), skinM); t.scale.z = .6; skin.add(t); const h = new THREE.Mesh(new THREE.SphereGeometry(.42, 48, 36), skinM); h.position.set(0, 3.35, .02); h.scale.set(.95, 1.2, 1.05); skin.add(h); limb([0, 2.55, 0], [0, 2.95, .02], .15, .14);
    for (const s of [1, -1]) { limb([.62 * s, 2.25, 0], [1.18 * s, 1.0, .05], .19, .14); limb([1.18 * s, 1.0, .05], [1.6 * s, -.08, .15], .14, .1); limb([.32 * s, -.95, 0], [.46 * s, -2.2, .04], .3, .19); limb([.46 * s, -2.2, .04], [.5 * s, -3.35, -.02], .19, .11); } }
  { const pre = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, opacity: 0, depthWrite: true }); skinM.side = THREE.FrontSide;
    [...skin.children].forEach(m => { const d = m.clone(); d.material = pre; d.renderOrder = 20; d.raycast = () => {}; d.userData.glow = true; skin.add(d); m.renderOrder = 21; }); }
  // خلايا الدم + الأسهمُ الخضراءُ المرقّمة
  const cA = new CellFlow(root, flows.a, '#ff2a3a', 480), cV = new CellFlow(root, flows.v, '#4a6cff', 400);
  const STEPS = [
    { p: [[[-.2, 2.85, .28], [-.17, 1.8, .36], [-.2, 1.4, .5], [-.12, 1.0, .58]], [[-.15, .82, .1], [-.17, 1.0, .25], [-.15, 1.12, .5]]], at: [-.62, .78, .6] },
    { p: [[[-.05, 1.05, .62], [-.02, 1.45, .55], [-.08, 1.78, .58], [-.02, 1.98, .46], [-.3, 2.06, .38], [-.55, 1.98, .26]], [[-.02, 1.98, .46], [.3, 2.06, .38], [.55, 1.98, .26]]], at: [-.42, 2.4, .4] },
    { p: [[[-.6, 1.98, .3], [-.92, 1.75, .3], [-.95, 1.35, .3], [-.7, 1.3, .3]], [[.6, 1.98, .3], [.92, 1.75, .3], [.95, 1.35, .3], [.7, 1.3, .3]]], at: [-1.1, 1.0, .35] },
    { p: [[[.62, 1.45, .3], [.35, 1.32, .38], [.22, 1.2, .55], [.18, .95, .58]], [[.12, 1.05, .6], [.12, 1.45, .52], [.02, 1.95, .44], [.06, 2.3, .22], [.06, 2.85, .18]], [[.24, 2.12, .02], [.38, 1.7, -.15], [.3, 1.0, -.15]]], at: [.85, .8, .55] }];
  STEPS.forEach((S, i) => { S.f = new ArrowFlow(book, S.p); S.b = badge(i + 1, .2); S.b.position.set(...S.at); S.f.g.add(S.b); });
  const showStep = k => { step = k; STEPS.forEach((S, i) => S.f.g.visible = k < 0 || k === i); raM.emissive.set(k === 0 || k === 1 ? '#2a3fa0' : '#000'); raM.emissiveIntensity = .6; laM.emissive.set(k === 3 ? '#a01020' : '#000'); laM.emissiveIntensity = .6; };
  showStep(-1);
  const parts = [
    { id: 'heart', name: 'القلب', info: 'عضلةٌ تضخُّ الدمَ إلى جميعِ أجزاءِ الجسم. جانبُه الأيمنُ يستقبلُ الدمَ غيرَ المؤكسجِ ويضخُّه إلى الرئتين، وجانبُه الأيسرُ يستقبلُ الدمَ المؤكسجَ ويضخُّه إلى الجسم. (إثراء: ينبضُ نحو ٧٢ مرّةً في الدقيقة)', objs: [H, RA, LA], at: anchor(book, [.25, .85, .55]) },
    { id: 'lungcap', name: 'شعيرات دموية', info: 'في الرئةِ داخلَ الحويصلةِ الهوائيةِ يتمُّ تبادلُ الغازات؛ حيث ينتقلُ الأكسجينُ إلى الدم، وينتقلُ ثاني أكسيدِ الكربونِ إلى تجويفِ الحويصلةِ ثم إلى خارجِ الجسمِ مع هواءِ الزفير. يبدأُ الدمُ فيها غيرَ مؤكسجٍ (أزرق) وينتهي مؤكسجًا (أحمر).', objs: caps, at: anchor(book, [.9, 1.7, .2]) },
    { id: 'lung', name: 'الرئة', info: 'يصلُ إليها الدمُ غيرُ المؤكسجِ من القلب، فيتخلّصُ من ثاني أكسيدِ الكربونِ ويُحمَّلُ بالأكسجين.', objs: lungs.children.slice(0, 2), at: anchor(book, [-.85, 2.15, .1]) },
    { id: 'artery', name: 'شريان', info: 'يحملُ الدمَ المؤكسجَ (اللونُ الأحمر) من القلبِ إلى سائرِ أجزاءِ الجسم. (إثراء: هذا هو الشريانُ الأبهر، أكبرُ شرايينِ الجسم)', objs: aorta, at: anchor(book, [.05, 2.9, .1]) },
    { id: 'vein', name: 'وريد', info: 'يحملُ الدمَ غيرَ المؤكسجِ (اللونُ الأزرق) من أجزاءِ الجسمِ إلى القلب. (إثراء: الوريدانِ الأجوفانِ العلويُّ والسفليّ)', objs: vena, at: anchor(book, [-.2, 2.9, .2]) },
    { id: 'partery', name: 'الشريان الرئوي (إثراء)', info: 'يحملُ الدمَ غيرَ المؤكسجِ من القلبِ إلى الرئتين؛ لذا لونُه أزرقُ مع أنّه شريان، فالشريانُ هو ما يخرجُ من القلب.', objs: part, at: anchor(book, [-.3, 2.02, .35]), hidden: () => !extra.visible },
    { id: 'pvein', name: 'الأوردة الرئوية (إثراء)', info: 'تحملُ الدمَ المؤكسجَ من الرئتين إلى القلب؛ لذا لونُها أحمرُ مع أنّها أوردة، فالوريدُ هو ما يعودُ إلى القلب.', objs: pvein, at: anchor(book, [.45, 1.35, .2]), hidden: () => !extra.visible },
    { id: 'bodycap', name: 'شعيرات الجسم (إثراء)', info: 'يصلُ الدمُ إلى أوعيةٍ دمويةٍ دقيقةٍ تسمّى الشعيرات، فتنتقلُ الموادُّ الغذائيةُ والأكسجينُ عبرَ جدرانِها الرقيقةِ لتصلَ إلى الخلايا، وتمرّرُ الخلايا فضلاتِها إلى الدم.', objs: bodyCap, at: anchor(extra, [-1.65, -.35, .25]), hidden: () => !extra.visible },
    { id: 'bodyvessels', name: 'أوعية الجسم (إثراء)', info: 'تتفرّعُ الشرايينُ إلى جميعِ أجزاءِ الجسم، وتعودُ الأوردةُ بالدمِ إلى القلب. يحتوي جسمُ الإنسانِ البالغِ على نحو ٥ لتراتٍ من الدم.', objs: ex, at: anchor(extra, [.48, -1.8, .1]), hidden: () => !extra.visible }];
  const bookPose = { pos: [0, 1.85, 6.2], target: [0, 1.75, .1] }, bodyPose = { pos: [0, .6, 15], target: [0, .2, 0] };
  return {
    root, parts, pageBox: [-1.2, .7, -.5, 1.2, 3.0, .6],
    update(dt) { beat += dt * rate * 1.2; const ph = beat % 1, pulse = Math.exp(-Math.pow((ph - .08) / .05, 2)) * .07 + Math.exp(-Math.pow((ph - .3) / .06, 2)) * .045; heart.scale.setScalar(HS * (1 + pulse));
      const sp = .5 * rate * (1 + pulse * 6); cA.update(dt, sp); cV.update(dt, sp * .7); STEPS.forEach(S => S.f.update(dt * rate)); },
    cam: bookPose, inpage: bookPose,
    controls: [
      { type: 'steps', value: -1, steps: [{ t: '١- الدم غير المؤكسج إلى القلب', d: 'يتدفّقُ الدمُ غيرُ المؤكسجِ (غيرُ المحمّلِ بالأكسجين) إلى القلب. (إثراء: عبرَ الوريدينِ الأجوفينِ إلى الأذينِ الأيمن)' }, { t: '٢- إلى الرئتين', d: 'يُضخُّ الدمُ غيرُ المؤكسجِ إلى الرئتين. (إثراء: من البطينِ الأيمنِ عبرَ الشريانِ الرئويّ)' }, { t: '٣- تبادل الغازات', d: 'يتخلّصُ الدمُ في الرئتينِ من ثاني أكسيدِ الكربونِ ويُحمّلُ بالأكسجين. (إثراء: في الرئتينِ نحو ٣٠٠ مليونِ حويصلةٍ هوائيّة)' }, { t: '٤- إلى الجسم', d: 'يتدفّقُ الدمُ المؤكسجُ (المحمّلُ بالأكسجين) إلى القلب، ثم يُضخُّ إلى سائرِ أجزاءِ الجسم. (إثراء: عبرَ الشريانِ الأبهر)' }],
        on: i => { showStep(i); api.select && api.select(['vein', 'heart', 'lungcap', 'artery'][i]); } },
      { type: 'button', label: '▶ المسار كاملًا', on: () => { showStep(-1); api.setStep && api.setStep(-1); } },
      { type: 'button', label: '🧍 إثراء: الجسم كاملًا', toggle: true, on: v => { extra.visible = v; const p = v ? bodyPose : bookPose; api.flyTo(p.pos.map((x, i) => i === 2 && !v ? x : x), p.target); api.refreshParts && api.refreshParts(); } },
      { type: 'button', label: '🫁 إظهار/إخفاء الرئتين', toggle: true, on: v => { lungs.visible = !v; } },
      { type: 'slider', label: 'نبض القلب', min: .5, max: 2, step: .1, value: 1, fmt: v => Math.round(v * 72) + ' نبضة/دقيقة', on: v => { rate = v; } }
    ],
    legend: [['#2a45a8', 'دم غير مؤكسج'], ['#c0121f', 'دم مؤكسج'], ['#36c24a', 'اتجاه جريان الدم']],
    quiz: [
      { q: 'أين يُضخُّ الدمُ غيرُ المؤكسج؟ المس الشعيراتِ هناك.', a: 'lungcap' },
      { q: 'المس الوعاءَ الذي يحملُ الدمَ المؤكسجَ من القلبِ إلى الجسم.', a: 'artery' },
      { q: 'المس الوعاءَ الذي يحملُ الدمَ غيرَ المؤكسجِ إلى القلب.', a: 'vein' }
    ]
  };
}

/* ═════════ ٥) الجهاز الهيكلي والعضلي (ص ١٢٢–١٢٣) — هيكلُ أرنبٍ واقعيّ ═════════ */
function boneGeo(len, r, ends = 1.9) { const P = []; for (let i = 0; i <= 16; i++) { const t = i / 16, k = Math.pow(Math.abs(t - .5) * 2, 6); P.push(new THREE.Vector2(r * (.9 + (ends - .9) * k) * (1 + .05 * Math.sin(t * 20)), -t * len)); } P.unshift(new THREE.Vector2(0, 0)); P.push(new THREE.Vector2(0, -len)); return new THREE.LatheGeometry(P, 20); }
function rabbitFur(op = .16, upright = false) { const m = new THREE.MeshPhysicalMaterial({ color: '#9a7350', roughness: .9, transparent: true, opacity: op, depthWrite: false, sheen: 1, sheenColor: new THREE.Color('#f3e2cc'), sheenRoughness: .4 }); const g = new THREE.Group();
  const add = (geo, p, r, s) => { const o = new THREE.Mesh(geo, m); o.position.set(...p); if (r) o.rotation.set(...r); if (s) o.scale.set(...s); g.add(o); };
  if (!upright) { add(organGeo(1, v => { v.x *= 2.3; v.y *= 1.05; v.z *= .95; if (v.x < -1) v.y *= 1.15; v.y += Math.max(0, v.x) * -.1; }), [-.2, 1.15, 0]); add(organGeo(.62, v => { v.x *= 1.55; if (v.x > .5) { v.y *= .8; v.z *= .8; } }), [2.35, 1.6, 0]);
    for (const z of [-.18, .18]) add(organGeo(.25, v => { v.y *= 4; v.z *= .35; }), [1.9, 2.7, z], [0, 0, .5]); add(organGeo(.55, v => { v.x *= 1.6; v.y *= .9; v.z *= .7; }), [-1.6, .45, .3]); add(organGeo(.3, v => v.multiplyScalar(1)), [-2.55, 1.35, 0]); }
  else { add(organGeo(.95, v => { v.y *= 1.45; v.z *= .9; if (v.y < 0) { v.x *= 1.15; v.z *= 1.1; } }), [0, .7, 0]); add(organGeo(.62, v => { v.z *= 1.4; v.y *= .95; }), [0, 2.55, .25]);
    for (const s of [-1, 1]) { add(organGeo(.22, v => { v.y *= 4.5; v.z *= .4; }), [s * .32, 3.75, 0], [0, 0, s * -.15]); add(organGeo(.45, v => { v.z *= 1.5; v.y *= .8; }), [s * .6, -.7, .35]); } }
  const pre = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, opacity: 0, depthWrite: true }); [...g.children].forEach(o => { const d = o.clone(); d.material = pre; d.renderOrder = 20; d.raycast = () => {}; d.userData.glow = true; g.add(d); o.renderOrder = 21; }); return g; }
export function skeletonModel(api) {
  const root = new THREE.Group(); let run = false, t = 0; reseed(41);
  const bone = tissue('#ece2c6', { kind: 'pore', bumpScale: .6, clearcoat: .25, roughness: .55, sheen: .2 });
  const fur = rabbitFur(.4); root.add(fur);
  const skull = mesh(organGeo(.44, v => { v.x *= 1.5; v.y *= .8; v.z *= .72; if (v.x > .2) { const k = 1 - (v.x - .2) * .5; v.y *= k; v.z *= k; } const e = Math.hypot(v.x - .15, v.y - .15); if (Math.abs(v.z) > .3 && e < .2) v.z *= .82 + e * .9; v.multiplyScalar(1 + fbm3(v.x * 6, v.y * 6, v.z * 6) * .02); }), bone, [2.4, 1.6, 0]); root.add(skull);
  const jaw = mesh(organGeo(.24, v => { v.x *= 2; v.y *= .35; v.z *= .7; }), bone, [2.5, 1.32, 0], [0, 0, -.15]); root.add(jaw);
  const spineC = curve([[2.0, 1.45, 0], [1.6, 1.55, 0], [.6, 1.85, 0], [-.6, 1.8, 0], [-1.6, 1.4, 0], [-2.3, 1.25, 0], [-2.7, 1.45, 0]]); const spine = [];
  for (let i = 0; i < 30; i++) { const u = i / 29, p = spineC.getPointAt(u), tg = spineC.getTangentAt(u), s = u > .9 ? .6 : 1;
    const v = mesh(organGeo(.1 * s, w => { w.y *= .75; w.x *= 1.3; if (w.y > .03) w.y += .08 * (1 - Math.abs(w.x) / .12) * s; }, 16, 12), bone, p.toArray()); v.rotation.z = Math.atan2(tg.y, tg.x) - 0; root.add(v); spine.push(v); }
  const ribs = []; for (let i = 0; i < 12; i++) { const x = 1.3 - i * .14, top = spineC.getPointAt(.12 + i * .028), d = .55 - Math.abs(i - 4) * .035, h = .9 - i * .02;
    for (const s of [-1, 1]) { const r = vessel([[top.x, top.y - .05, 0], [x - .05, top.y - .2, s * d * .9], [x - .15, top.y - h * .7, s * d], [x - .1, top.y - h, s * .08]], .03, .022, bone, 24, 8, .02); root.add(r); ribs.push(r); } }
  const pelvis = mesh(organGeo(.35, v => { v.x *= 2.1; v.y *= .55; v.z *= .5; if (v.x < 0) v.y += v.x * -.25; }), bone, [-1.75, 1.3, .1], [0, 0, -.45]); root.add(pelvis);
  const front = new THREE.Group(); front.position.set(1.1, .9, .2); root.add(front);
  const scap = mesh(organGeo(.3, v => { v.y *= 1.3; v.z *= .15; }), bone, [.05, .45, 0], [0, 0, -.3]); front.add(scap);
  front.add(mesh(boneGeo(.7, .05), bone, [0, 0, 0], [0, 0, -.25]), mesh(boneGeo(.75, .04), bone, [.17, -.68, 0], [0, 0, .05]), mesh(organGeo(.1, v => { v.x *= 2.2; v.y *= .5; }), bone, [.3, -1.42, 0]));
  const hip = new THREE.Group(); hip.position.set(-1.75, 1.2, .25); root.add(hip);
  const femur = mesh(boneGeo(1.1, .07), bone); hip.add(femur);
  const knee = new THREE.Group(); knee.position.set(0, -1.1, 0); hip.add(knee);
  const shin = mesh(boneGeo(1.0, .055), bone); knee.add(shin);
  const foot = new THREE.Group(); foot.position.set(0, -1.0, 0); knee.add(foot); for (let k = 0; k < 4; k++) foot.add(mesh(boneGeo(.75, .025, 1.6), bone, [0, 0, (k - 1.5) * .05], [0, 0, Math.PI / 2 + .05]));
  const musM = tissue('#b8323a', { kind: 'vein', bumpScale: 1.4, clearcoat: .6 }), musM2 = tissue('#9a2630', { kind: 'vein', bumpScale: 1.4, clearcoat: .6 });
  const spindle = (r, l) => organGeo(r, v => { v.y *= l / r / 2; const k = 1 - Math.pow(Math.abs(v.y) / (l / 2), 2) * .55; v.x *= k; v.z *= k; }, 32, 24);
  const mFront = mesh(spindle(.15, .95), musM, [.18, -.5, .06]); hip.add(mFront);
  const mBack = mesh(spindle(.17, 1.0), musM2, [-.2, -.55, .06]); hip.add(mBack);
  const tendon = mesh(boneGeo(.5, .025, 1.2), tissue('#f6f2ea', { kind: 'pore', clearcoat: 1 }), [-.15, 0, .06]); knee.add(tendon);
  const lig = mesh(organGeo(.09, v => { v.y *= 1.5; }), tissue('#d8cfb0', { clearcoat: .8 }), [0, 0, .07]); knee.add(lig);
  const parts = [
    { id: 'skull', name: 'الجمجمة', info: 'الجمجمةُ قاسيةٌ جدًّا لكي تحميَ الدماغَ الحسّاسَ من الإصابة، كما أنّها خفيفةُ الوزنِ لكي يسهلَ إبقاءُ الرأسِ منتصبًا.', objs: [skull, jaw], at: anchor(root, [2.6, 2.2, 0]) },
    { id: 'spine', name: 'العمود الفقري (الفقرات)', info: 'سلسلةٌ من الفقراتِ تدعمُ الجسمَ وتحمي الحبلَ الشوكيّ.', objs: spine, at: anchor(root, [0, 2.15, 0]) },
    { id: 'ribs', name: 'القفص الصدري (الأضلاع)', info: 'العظامُ في الجهازِ الهيكليِّ تحمي بعضَ الأعضاءِ الطريّة؛ فالقفصُ الصدريُّ يحمي القلبَ والرئتين.', objs: ribs, at: anchor(root, [.5, .85, .6]) },
    { id: 'pelvis', name: 'الحوض', info: 'عظامٌ ترتبطُ بها عظامُ الأرجلِ الخلفية، وتتّصلُ بالعمودِ الفقريّ.', objs: [pelvis], at: anchor(root, [-1.75, 1.7, .2]) },
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
      { type: 'button', label: '🐇 إظهار/إخفاء جسم الأرنب', toggle: true, on: v => { fur.visible = !v; } },
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
  const root = new THREE.Group(); let t = 0, sig = -1, fast = 0; reseed(51);
  const fig = rabbitFur(.22, true); root.add(fig);
  const brain = mesh(organGeo(.45, v => { v.x *= 1.15; v.y *= .85; const fold = Math.abs(noise3(v.x * 9, v.y * 9, v.z * 9)); v.multiplyScalar(1 - fold * .06); if (Math.abs(v.x) < .03) v.multiplyScalar(.94); }, 96, 72), tissue('#f0a3ae', { kind: 'vein', bumpScale: 1.6, roughness: .5 }), [0, 2.7, .1]); root.add(brain);
  const eye = mesh(new THREE.SphereGeometry(.1, 24, 18), new THREE.MeshPhysicalMaterial({ color: '#1a0f0a', roughness: .05, clearcoat: 1 }), [.35, 2.55, .75]); root.add(eye);
  const cord = vessel([[0, 2.3, 0], [0, 1.6, -.25], [0, .4, -.35], [0, -.6, -.2]], .075, .055, tissue('#f2c96a', { kind: 'pore', emissive: '#7a5a00', emissiveIntensity: .1 }), 60, 14, .02); root.add(cord);
  const nerves = []; const nM = tissue('#e8a83a', { kind: 'pore', bumpScale: .3 }); const nt = []; for (let i = 0; i < 6; i++) { const y = 1.8 - i * .45; for (const s of [-1, 1]) { const n = vessel([[0, y, -.3], [s * .5, y - .15, 0], [s * .8, y - .4, .2]], .025, .012, nM, 16, 6); root.add(n); nerves.push(n); twigs(nt, V(s * .8, y - .4, .2), V(s, -.3, .3), .25, .01, 3, 1.3); } } const nTw = new THREE.Mesh(mergeGeos(nt), nM); root.add(nTw); nerves.push(nTw);
  const legN = []; for (const s of [-1, 1]) { const n = vessel([[0, -.6, -.2], [s * .5, -1.2, .15], [s * .55, -2, .25]], .035, .015, nM, 24, 8); root.add(n); legN.push(n); }
  const eyeN = vessel([[.3, 2.55, .65], [.15, 2.65, .3]], .022, .018, nM, 10, 6); root.add(eyeN);
  const adrenal = []; for (const s of [-1, 1]) { const k = mesh(organGeo(.18, v => { v.x *= .7; v.z *= .6; if (v.x * s < -.05) v.x *= .7; }), tissue('#8a2f2a', { clearcoat: .9 }), [s * .35, .05, -.3]); root.add(k); const a = mesh(organGeo(.11, v => { v.y *= .7; if (v.y > 0) { v.x *= 1 - v.y * 3; v.z *= 1 - v.y * 2; } }), tissue('#f2b82a', { kind: 'pore' }), [s * .35, .26, -.3]); root.add(a); adrenal.push(a); }
  const heart = mesh(organGeo(.22, v => { const y = v.y; const k = y < 0 ? 1 + y * 2 : 1; v.x *= k; v.z *= k * .9; v.y *= 1.2; }), tissue('#9a1f26'), [-.15, 1.2, .3], [0, 0, .4]); root.add(heart);
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
