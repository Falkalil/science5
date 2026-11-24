// مجسّمات الصف السادس (٢): النباتات وأجهزة الجسم والأنظمة البيئية
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, proxy, noiseTexture, tree, cloud, arrowTube, noise3, tissue, vessel, mergeGeos, twigs, srnd, reseed, organGeo, fbm3, badge, ArrowFlow, CellFlow, tissueBump, vesselGeo } from './kit.js';
import { emo, txt, setTxt } from './models6a.js';

/* ═════════ ١) دورة حياة نبات حزازي (ص ٨٦) ═════════ */
export function mossModel(api) {
  const root = new THREE.Group(); let step = -1, t = 0;
  const R = 2.6; const pos = i => { const a = Math.PI / 2 - i / 5 * Math.PI * 2; return [Math.cos(a) * R, Math.sin(a) * R * .8, 0]; };
  const leafM = mat('#3f9a3a', { roughness: .6 }), leafM2 = mat('#6cbf4a');
  const mlG = organGeo(1, v => { const t = (v.y + 1) / 2; v.y = t * .42; const w = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05)), .7) * (1 - t * .55) * .075; v.x *= w; v.z = v.z * .012 + t * t * .09 - Math.abs(v.x) * .4; }, 16, 20);
  const stemM = tissue('#4f8a34', { kind: 'vein' }), rhM = tissue('#8a6a4a', { kind: 'vein' }); leafM.bumpMap = tissueBump('vein', 23); leafM.bumpScale = 2; leafM.side = 2; leafM2.bumpMap = leafM.bumpMap; leafM2.bumpScale = 2; leafM2.side = 2;
  function moss(s = 1) { const g = new THREE.Group(); const N = 30; for (let i = 0; i < N; i++) { const t = i / N, a = i * 2.4; const l = mesh(mlG, i % 3 ? leafM : leafM2); l.position.set(0, .08 + t * .72, 0); l.rotation.order = 'YXZ'; l.rotation.set(1.1 - t * .75, a, 0); l.scale.setScalar(1.05 - t * .45); g.add(l); }
    g.add(vessel([[0, 0, 0], [.01, .4, 0], [0, .82, 0]], .035, .02, stemM, 16, 8)); const rh = []; for (let k = 0; k < 5; k++) twigs(rh, V(0, .02, 0), V(Math.cos(k * 1.3) * .7, -1, Math.sin(k * 1.3) * .7), .16, .008, 3, 1.2, 4); g.add(new THREE.Mesh(mergeGeos(rh), rhM)); g.scale.setScalar(s); return g; }
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
  const s4 = new THREE.Group(); const fem = mesh(new THREE.CapsuleGeometry(.22, .6, 8, 14), tissue('#9ad07a', { kind: 'pore', transparent: true, opacity: .45, depthWrite: false }), [0, .4, 0]); { const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(.06, 12, 10), tissue('#4f9a3a', { kind: 'pore', bumpScale: 1.5 }), 400), o3 = new THREE.Object3D(); let n = 0; for (let r = 0; r <= 12; r++) { const y = -.5 + r * .083, rad = .24 * Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, Math.abs(y) - .3) / .24, 2))), k = Math.max(1, Math.round(rad * 2 * Math.PI / .1)); for (let j = 0; j < k; j++) { const a = (j + r * .5) / k * Math.PI * 2; if (Math.sin(a) > .15) continue; o3.position.set(Math.cos(a) * rad, y, Math.sin(a) * rad); o3.scale.setScalar(.85 + Math.random() * .3); o3.updateMatrix(); cells.setMatrixAt(n++, o3.matrix); } } cells.count = n; fem.add(cells); } const egg = mesh(new THREE.SphereGeometry(.13, 14, 10), mat('#d93a3a'), [0, .3, 0]); s4.add(fem, egg); const sperm = []; for (let i = 0; i < 4; i++) { const s = mesh(new THREE.CapsuleGeometry(.025, .12, 4, 6), mat('#5a5ad9')); s.position.set(-.6 + i * .1, .7 - i * .1, 0); s4.add(s); sperm.push(s); }
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
/* ═════════ ٢) الجهاز الهضمي (ص ١١١) — تشريحٌ واقعيٌّ مطابقٌ لشكلِ الكتاب ═════════ */
/** أنبوبٌ بنصفِ قطرٍ متغيّرٍ rf(t) */
function tubeR(pts, rf, seg = 120, rad = 18, closeEnds = false) {
  const c = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p : V(...p)), false, 'centripetal'); const g = new THREE.TubeGeometry(c, seg, 1, rad, false), P = g.attributes.position, v = V(0, 0, 0);
  for (let i = 0; i <= seg; i++) { const t = i / seg, ctr = c.getPointAt(t), r = rf(t); for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(P, k).sub(ctr).multiplyScalar(r).add(ctr); P.setXYZ(k, v.x, v.y, v.z); } }
  g.computeVertexNormals(); g.userData.curve = c; return g;
}
export function digestiveModel(api) {
  const root = new THREE.Group(); let speed = 1; root.add(body()); reseed(21);
  /* الفم والبلعوم والمريء */
  const mouthG = new THREE.Group();
  mouthG.add(mesh(organGeo(.07, v => { v.y *= .35; v.z *= .5; v.x *= 1.3; }), tissue('#c25560'), [0, 3.0, .69]));
  mouthG.add(mesh(organGeo(.16, v => { v.x *= .85; v.y *= .35; v.z *= 1.5; }), tissue('#d77a82', { kind: 'pore' }), [0, 2.96, .38]));
  mouthG.add(vessel([[0, 3.0, .68], [0, 3.05, .45], [0, 3.06, .2], [0, 2.98, .02]], .05, .07, tissue('#d4606c', { kind: 'pore' }), 24, 12, .03));
  const toothM = mat('#fbf7ee', { roughness: .3, clearcoat: .8 }); for (let i = 0; i < 8; i++) { const a = (i / 7 - .5) * 1.6; mouthG.add(mesh(new THREE.BoxGeometry(.022, .03, .02), toothM, [Math.sin(a) * .13, 3.035, .62 - (1 - Math.cos(a)) * .13], [0, a, 0])); }
  const phar = vessel([[0, 2.98, .02], [0, 2.85, -.02], [0, 2.7, -.06]], .075, .06, tissue('#d4606c', { kind: 'pore' }), 16, 12, .03);
  const eso = vessel([[0, 2.7, -.06], [0, 2.3, -.12], [-.02, 1.9, -.12], [.06, 1.55, -.05], [.2, 1.36, .05]], .05, .055, tissue('#d98a90', { kind: 'pore' }), 50, 14, .02);
  root.add(mouthG, phar, eso);
  /* المعدة: كيسٌ على شكلِ حرف J، قاعٌ منتفخٌ لأعلى، وتضيقُ عند البوّاب */
  const stPts = [[.2, 1.36, .05], [.32, 1.5, .05], [.55, 1.48, .06], [.72, 1.2, .1], [.68, .9, .16], [.48, .72, .2], [.22, .72, .2], [.06, .8, .16]];
  const stomach = new THREE.Mesh(tubeR(stPts, t => { const b = .09 + .27 * Math.sin(Math.PI * Math.min(1, t * 1.25)) * (1 - t * .35); return b * (1 + fbm3(t * 9, 1, 2) * .05); }, 120, 28), tissue('#d9737f', { bumpScale: 1.1 }));
  const fundusCap = mesh(new THREE.SphereGeometry(.09, 20, 14), stomach.material, [.2, 1.36, .05]);
  /* الكبد: إسفينٌ كبيرٌ في الجهةِ اليمنى من الجسم تحتَ الحجاب الحاجز */
  const liver = mesh(organGeo(1, v => { if (v.x < 0) { const sx = Math.sqrt(Math.max(0, 1 - v.y * v.y - v.z * v.z)); v.x = -Math.pow(sx, .45) * Math.pow(-v.x / Math.max(sx, 1e-4), 1); } v.x *= .92; const k = Math.max(0, Math.min(1, (1 - v.x / .92) / 2)); v.y *= .14 + .42 * Math.pow(k, .55); v.z *= .2 + .34 * Math.pow(k, .45); if (v.y < 0) v.y *= .55; v.y -= v.x * .1; v.multiplyScalar(1 + fbm3(v.x * 3, v.y * 3, v.z * 3) * .03); }, 80, 60), tissue('#7a2a1e', { kind: 'pore', bumpScale: .5, clearcoat: .9 }), [-.36, 1.36, .14]);
  const fal = mesh(new THREE.TorusGeometry(.4, .006, 6, 30, 1.2), tissue('#c88a70'), [-.05, 1.1, .55], [0, 0, 1]);
  const gall = mesh(organGeo(.11, v => { v.y *= 1.7; v.x *= .8; if (v.y > 0) v.multiplyScalar(1 - v.y * .5); }), tissue('#5f8a3a', { clearcoat: 1 }), [-.38, 1.08, .42], [.3, 0, .35]);
  /* البنكرياس خلفَ المعدة، ورأسُه داخلَ انحناءةِ الاثني عشر */
  const panc = new THREE.Mesh(tubeR([[-.12, .58, -.02], [.1, .66, -.08], [.4, .74, -.1], [.68, .84, -.08]], t => .085 * (1.25 - t * .6) * (1 + fbm3(t * 30, 0, 0) * .2), 50, 14), tissue('#eab77a', { kind: 'pore', bumpScale: 1.4 }));
  /* الاثنا عشر: حرفُ C حولَ رأسِ البنكرياس */
  const duoPts = [[.06, .8, .16], [-.12, .78, .12], [-.26, .62, .08], [-.24, .44, .06], [-.06, .4, .04], [.18, .46, .02]];
  const duo = new THREE.Mesh(tubeR(duoPts, () => .062, 60, 14), tissue('#e8929c', { bumpScale: .6 }));
  /* الأمعاءُ الدقيقة: أنبوبٌ طويلٌ ملتفٌّ يملأُ وسطَ البطن */
  const siPts = [[.18, .46, .02], [.38, .36, .12]]; { const cells = []; for (let r = 0; r < 5; r++) { const row = []; for (let c = 0; c < 4; c++) row.push([-.42 + c * .28, .26 - r * .25]); if (r % 2) row.reverse(); cells.push(...row); }
    cells.forEach(([cx, cy], i) => { const R = .12 + srnd() * .035, a0 = srnd() * 6.28, turns = 1.05 + srnd() * .4, n = 10, U = V(1, (srnd() - .5) * .5, (srnd() - .5) * .6).normalize(), W0 = V(0, 1, 0).applyAxisAngle(U, (srnd() - .5) * 2.4); const W = W0.sub(U.clone().multiplyScalar(W0.dot(U))).normalize();
      for (let k = 0; k < n; k++) { const a = a0 + k / n * turns * Math.PI * 2, p = V(cx + (srnd() - .5) * .05, cy, .22 + (i % 3 - 1) * .06).addScaledVector(U, Math.cos(a) * R).addScaledVector(W, Math.sin(a) * R * .85); siPts.push(p.toArray()); } }); }
  siPts.push([-.45, -.86, .1], [-.6, -.82, .1]);
  const smallI = new THREE.Mesh(tubeR(siPts, () => .064, 900, 12), tissue('#eb9da5', { bumpScale: .6 }));
  /* الأمعاءُ الغليظة: الأعور والزائدة ← الصاعد ← المستعرض ← النازل ← السيني ← المستقيم */
  const liPts = [[-.72, -.95, .12], [-.8, -.6, .14], [-.82, -.1, .14], [-.8, .32, .16], [-.66, .5, .26], [-.3, .38, .38], [0, .26, .42], [.32, .34, .38], [.68, .56, .26], [.86, .5, .14], [.88, .0, .1], [.84, -.6, .1], [.72, -.98, .12], [.38, -1.12, .22], [.1, -1.06, .2], [.02, -1.25, .06], [0, -1.58, -.02]];
  const haustra = t => (t > .93 ? .075 : .14) * (1 + .13 * Math.max(0, Math.sin(t * 190)) * (t < .9 ? 1 : 0));
  const largeI = new THREE.Mesh(tubeR(liPts, haustra, 700, 18), tissue('#c9737c', { bumpScale: .8 }));
  const cecum = mesh(organGeo(.15, v => { v.y *= 1.2; }), largeI.material, [-.72, -.98, .12]);
  const app = vessel([[-.72, -1.08, .1], [-.66, -1.2, .14], [-.58, -1.26, .2]], .025, .018, tissue('#d58690'), 12, 8);
  const anus = mesh(new THREE.TorusGeometry(.06, .02, 8, 20), tissue('#a84a56'), [0, -1.6, -.02], [Math.PI / 2, 0, 0]);
  [liver, fal, gall, panc, duo, smallI, largeI, cecum, app, anus, stomach, fundusCap].forEach(o => root.add(o));
  /* مسارُ اللقمة */
  const path = curve([[0, 3.04, .72], [0, 3.05, .4], [0, 2.95, .02], [0, 2.7, -.06], [0, 2.3, -.12], [-.02, 1.9, -.12], [.06, 1.55, -.05], [.2, 1.36, .05], ...stPts.slice(2), ...duoPts.slice(1), ...siPts.filter((_, i) => i % 2 === 0), ...liPts]);
  const bolus = mesh(organGeo(.07, v => v.multiplyScalar(1 + fbm3(v.x * 20, v.y * 20, v.z * 20) * .15), 24, 18), mat('#a8722a'), [0, 3.05, .6]); bolus.visible = false; bolus.raycast = () => {}; root.add(bolus); let bt = -1;
  const say = [[0, 'الفم: يبدأُ الهضمُ في الفم.'], [.05, 'المريء: ينقلُ الطعامَ إلى المعدة.'], [.12, 'المعدة: يحلّلُ الحمضُ وإنزيمُ المعدةِ الغذاءَ إلى دقائقَ صغيرة.'], [.2, 'الأمعاءُ الدقيقة: تحلّلُ العصارةُ الهضميةُ التي تفرزُها الغددُ الهضميةُ البروتيناتِ والنشويّاتِ والدهون، وتمتصُّ الموادَّ الغذائيةَ وتنقلُها إلى الدم.'], [.7, 'الأمعاءُ الغليظة: يُمتصُّ الماء من بقايا الطعام.'], [.97, 'الإخراج: التخلّصُ من الفضلاتِ خارجَ الجسم.']]; let said = -1;
  const parts = [
    { id: 'mouth', name: 'الفم', info: 'في الإنسانِ يحدثُ الهضمُ في الفمِ والمعدةِ والأمعاءِ الدقيقة. (إثراء: تطحنُ الأسنانُ الطعام، وتفرزُ الغددُ اللعابيّةُ اللعابَ الذي يبدأُ هضمَ النشويّات.)', objs: mouthG.children, at: anchor(root, [.15, 3.08, .72]) },
    { id: 'eso', name: 'المريء', info: 'أنبوبٌ عضليٌّ ينقلُ الغذاءَ من الفمِ إلى المعدة.', objs: [eso, phar], at: anchor(root, [.05, 2.2, -.1]) },
    { id: 'stom', name: 'المعدة', info: 'يحلّلُ الحمضُ وإنزيمُ المعدةِ الغذاءَ إلى دقائقَ صغيرة.', objs: [stomach, fundusCap], at: anchor(root, [.8, 1.25, .3]) },
    { id: 'liver', name: 'الكبد', info: 'يساعدُ الكبدُ الجهازَ الهضميَّ في هضمِ الطعام، ويعملُ على تخليصِ الجسمِ من الفضلات. (إثراء: أكبرُ عضوٍ داخليٍّ في الجسم.)', objs: [liver, fal], at: anchor(root, [-.95, 1.6, .45]) },
    { id: 'gall', name: 'الحويصلة الصفراوية (إثراء)', info: 'كيسٌ صغيرٌ تحتَ الكبدِ يخزّنُ العصارةَ الصفراءَ التي يفرزُها الكبد، وتساعدُ على هضمِ الدهون. (إثراء)', objs: [gall], at: anchor(root, [-.42, .96, .55]) },
    { id: 'panc', name: 'البنكرياس', info: 'غدّةٌ هضميةٌ خلفَ المعدةِ تفرزُ عصارةً هضميةً تحلّلُ البروتيناتِ والنشويّاتِ والدهون.', objs: [panc], at: anchor(root, [.55, .82, -.05]) },
    { id: 'si', name: 'الأمعاء الدقيقة', info: 'تقومُ الأمعاءُ الدقيقةُ بامتصاصِ الموادِّ الغذائيةِ ونقلِها إلى الدم. (إثراء: طولُها نحو ٦ أمتار، وأوّلُها الاثنا عشر.)', objs: [smallI, duo], at: anchor(root, [.15, -.35, .45]) },
    { id: 'li', name: 'الأمعاء الغليظة', info: 'تمتصُّ الأمعاءُ الغليظةُ الماءَ من بقايا الطعام، ثم يتمُّ التخلّصُ من الفضلاتِ خارجَ الجسمِ بعمليةِ الإخراج.', objs: [largeI, cecum, app, anus], at: anchor(root, [-1.0, -.2, .3]) }
  ];
  return {
    root, parts,
    update(dt) { if (bt >= 0) { bt += dt * .045 * speed; if (bt >= 1) { bt = -1; bolus.visible = false; return; } bolus.position.copy(path.getPointAt(bt)); bolus.scale.setScalar(1 - bt * .5); const k = say.filter(s => s[0] <= bt).length - 1; if (k !== said) { said = k; api.toast(say[k][1]); } } },
    cam: { pos: [0, 1.0, 7.4], target: [0, .8, 0] }, inpage: { pos: [0, .9, 7.6], target: [0, .8, 0] },
    controls: [
      { type: 'button', label: '🍞 ابتلع لقمة وتابعها', on: () => { bt = 0; said = -1; bolus.visible = true; } },
      { type: 'slider', label: 'سرعة المتابعة', min: .5, max: 4, step: .5, value: 1, fmt: v => v + '×', on: v => speed = v },
      { type: 'button', label: '🔍 أخفِ الكبد والمعدة لرؤية ما خلفهما', toggle: true, on: v => { liver.visible = fal.visible = gall.visible = !v; stomach.visible = fundusCap.visible = !v; } }
    ],
    quiz: [
      { q: 'أين تُمتصُّ الموادُّ الغذائيةُ إلى الدم؟ المسه.', a: 'si' },
      { q: 'المس العضوَ الذي يحلّلُ فيه الحمضُ الغذاء.', a: 'stom' },
      { q: 'المس الأنبوبَ الذي يصلُ الفمَ بالمعدة.', a: 'eso' },
      { q: 'المس العضوَ الذي يمتصُّ الماء.', a: 'li' },
      { q: 'المس الغدّةَ التي تفرزُ عصارةً هضميةً خلفَ المعدة.', a: 'panc' }
    ]
  };
}

/* ═════════ ٣) الجهاز التنفسي في الإنسان (ص ١١٣) — تشريحٌ دقيقٌ مطابقٌ لشكلِ الكتاب ═════════ */
/* شكلٌ بارامتريٌّ ملتفّ: f(u,v) → [x,y,z]، مع تنعيمِ خطِّ الالتحام */
function paramGeo(nu, nv, f) {
  const pos = [], idx = [];
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = f((i % nu) / nu, j / nv); pos.push(p[0], p[1], p[2]); }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, b = a + 1, c = a + nu + 1, d = c + 1; idx.push(a, b, c, b, d, c); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.userData.nu = nu; g.userData.nv = nv; seamNormals(g); return g;
}
function seamNormals(g) {
  g.computeVertexNormals(); const N = g.attributes.normal, nu = g.userData.nu, nv = g.userData.nv, n = new THREE.Vector3(), m = new THREE.Vector3();
  for (let j = 0; j <= nv; j++) { const a = j * (nu + 1), b = a + nu; n.fromBufferAttribute(N, a); m.fromBufferAttribute(N, b); n.add(m).normalize(); N.setXYZ(a, n.x, n.y, n.z); N.setXYZ(b, n.x, n.y, n.z); }
  N.needsUpdate = true;
}
/* سطحُ الحجابِ الحاجزِ العلويّ: قبّتانِ تحتَ الرئتين (اليمنى أعلى قليلًا بسببِ الكبد) ومركزٌ وتريٌّ أخفض */
const DIA0 = .3;
function diaTop(x, z) { const e = (cx, w, h) => h * Math.exp(-Math.pow((x - cx) / w, 2) - Math.pow(z / .55, 2)); return DIA0 + e(-.6, .42, .5) + e(.6, .42, .44) + e(0, .3, .06); }

export function lungsModel(api) {
  const root = new THREE.Group(); let rate = 1, t = 0, auto = true; root.add(body(.1)); reseed(31);
  const mucM = tissue('#d4606c', { kind: 'pore', bumpScale: .6 });            // غشاءُ الأنفِ والفمِ والبلعوم
  const cartM = tissue('#efd6cc', { kind: 'pore', bumpScale: .5, roughness: .45 }); // الغضاريف
  const bronM = tissue('#e3c2bb', { kind: 'pore', bumpScale: .4 });
  const twigM = tissue('#cf6f80', { kind: 'vein', bumpScale: .3 });

  /* ── الأنف والفم والبلعوم ── */
  const nasal = vessel([[0, 3.4, .8], [0, 3.47, .55], [0, 3.44, .28], [0, 3.3, .06]], .055, .085, mucM, 30, 12, .04);
  const nostrils = new THREE.Group(); for (const s of [-1, 1]) nostrils.add(mesh(organGeo(.028, v => { v.z *= .5; v.x *= 1.4; }), tissue('#5a1e26'), [s * .045, 3.37, .8]));
  const oral = vessel([[0, 3.0, .68], [0, 3.05, .45], [0, 3.07, .22], [0, 3.0, .04]], .05, .075, mucM, 30, 12, .03);
  const lips = mesh(organGeo(.07, v => { v.y *= .35; v.z *= .5; }), tissue('#c25560'), [0, 3.0, .68]);
  const tongue = mesh(organGeo(.16, v => { v.x *= .85; v.y *= .35; v.z *= 1.5; }), tissue('#d77a82', { kind: 'pore' }), [0, 2.96, .38]);
  const phar = vessel([[0, 3.32, .02], [0, 3.12, -.04], [0, 2.92, -.02], [0, 2.8, .02]], .09, .08, mucM, 30, 14, .04);
  /* ── الحنجرة: غضروفٌ درقيٌّ بزاويةٍ أماميةٍ ولسانُ المزمار ── */
  const larynx = new THREE.Group();
  larynx.add(mesh(organGeo(.12, v => { v.y *= 1.05; if (v.z > 0) { v.z *= 1.25 - Math.abs(v.x) * 2.2; } v.x *= 1.1; }, 40, 30), cartM, [0, 2.72, .07]));
  larynx.add(mesh(new THREE.TorusGeometry(.085, .028, 10, 30), cartM, [0, 2.6, .06], [Math.PI / 2, 0, 0]));
  const epi = mesh(organGeo(.06, v => { v.z *= .25; v.y *= 1.5; }), tissue('#e7b3a8'), [0, 2.88, .0], [-.5, 0, 0]); larynx.add(epi);
  /* ── القصبةُ الهوائيّة: حلقاتٌ غضروفيّةٌ على شكلِ حرف C مفتوحةٌ من الخلف ── */
  const CAR = V(0, 1.95, -.04), TR0 = V(0, 2.56, .06);
  const trachea = new THREE.Group(); trachea.add(vessel([TR0, V(0, 2.25, .02), CAR], .068, .066, bronM, 30, 16, .01));
  for (let i = 0; i < 13; i++) { const k = i / 13, p = TR0.clone().lerp(CAR, k + .02); const ring = mesh(new THREE.TorusGeometry(.074, .016, 8, 28, Math.PI * 1.55), cartM, p.toArray(), [Math.PI / 2, 0, Math.PI * .5 + Math.PI * .225]); trachea.add(ring); }
  /* ── الشعبتانِ الهوائيّتانِ الرئيسيّتان: اليمنى أقصرُ وأعرضُ وأكثرُ عموديّة ── */
  const HR = V(-.42, 1.66, -.04), HL = V(.45, 1.7, -.04);
  const bronchi = [vessel([CAR, V(-.2, 1.84, -.04), HR], .066, .056, bronM, 20, 14, .01), vessel([CAR, V(.24, 1.9, -.04), HL], .058, .05, bronM, 20, 14, .01)];

  /* ── الرئتان: قمّةٌ عند الترقوة، قاعدةٌ مقعّرةٌ على الحجاب، سطحٌ داخليٌّ مسطّح، وثلمةٌ قلبيّةٌ في اليسرى ── */
  const LUNG = { [-1]: { cx: -.62, A: .53, B: .58, apex: 2.45 }, [1]: { cx: .62, A: .49, B: .57, apex: 2.47 } };
  const prof = w => .25 * (1 - w) + .75 * Math.sqrt(Math.max(0, 1 - Math.pow(w, 1.8)));
  function lungXZ(s, a, w, k) {
    const L = LUNG[s], ca = Math.cos(a), sa = Math.sin(a), lat = ca * s, p = prof(w) * k;
    let x = ca * L.A * p, z = sa * L.B * p; if (lat < 0) x *= .66;
    if (s > 0 && lat < 0 && sa > 0) x += s * .17 * k * Math.exp(-Math.pow((w - .2) / .17, 2)) * sa * sa * (-lat); // الثلمة القلبية
    // شقوقُ الفصوص: المائلُ في الرئتين، والأفقيُّ في اليمنى
    let g = Math.exp(-Math.pow((w - (.45 - .3 * sa)) / .02, 2)); if (s < 0 && sa > -.2 && w > .45 - .3 * sa) g = Math.max(g, Math.exp(-Math.pow((w - .6) / .02, 2)));
    const n = 1 + fbm3(x * 5 + s, w * 6, z * 5) * .025 - g * .06 * k; return [L.cx + x * n, .02 + z * n];
  }
  function lungMesh(s) {
    const L = LUNG[s], c0 = [], c1 = [], dxz = [];
    const g = paramGeo(72, 60, (u, v) => {
      const a = u * Math.PI * 2; let w, k; if (v < .2) { k = Math.max(.001, v / .2); w = 0; } else { k = 1; w = (v - .2) / .8; }
      const [x, z] = lungXZ(s, a, w, k), [xr, zr] = lungXZ(s, a, 0, 1), Dr = diaTop(xr, zr) - DIA0, Db = diaTop(x, z) - DIA0;
      if (v < .2) { c0.push(DIA0 + .035); c1.push(Db); } else { const ww = Math.pow(w, .9); c0.push((1 - ww) * (DIA0 + .035) + ww * L.apex); c1.push((1 - ww) * Dr); }
      dxz.push(x - L.cx, z - .02); return [x, c0[c0.length - 1] + c1[c1.length - 1], z];
    });
    const m = new THREE.Mesh(g, lM); m.renderOrder = 3; m.userData.lung = { s, c0, c1, dxz, cx: L.cx }; return m;
  }
  function breathe(m, f, ex) { const P = m.geometry.attributes.position, L = m.userData.lung; for (let i = 0; i < P.count; i++) P.setXYZ(i, L.cx + L.dxz[2 * i] * ex, L.c0[i] + L.c1[i] * f, .02 + L.dxz[2 * i + 1] * ex); P.needsUpdate = true; seamNormals(m.geometry); }
  const lM = tissue('#f08d9e', { transparent: true, opacity: .58, depthWrite: false, bumpScale: 1.3, roughness: .5, sheen: .8 });
  const lungR = lungMesh(-1), lungL = lungMesh(1);
  function inLung(p, s, mg = .8) { const L = LUNG[s], w = (p.y - (DIA0 + .45)) / (L.apex - DIA0 - .45); if (w < .03 || w > .93) return false; const pr = prof(w); let dx = (p.x - L.cx) / (L.A * pr); if (dx * s < 0) dx /= .66; const dz = (p.z - .02) / (L.B * pr); return dx * dx + dz * dz < mg; }

  /* ── الشجرةُ القصبيّة: شعبٌ فصّيّةٌ (٣ يمنى، ٢ يسرى) تتفرّعُ إلى شعيباتٍ داخلَ الرئة ── */
  const lobar = [], fine = [], tips = [];
  function grow(p, d, len, r, depth, s) {
    if (depth === 0) { tips.push(p.clone()); return; }
    const ax = V(srnd() - .5, srnd() - .5, srnd() - .5).cross(d).normalize();
    for (const sg of [-1, 1]) { let l = len; for (let tr = 0; tr < 6; tr++) {
      const nd = d.clone().applyAxisAngle(ax, sg * (.42 + srnd() * .25)).normalize(), e = p.clone().addScaledVector(nd, l);
      if (!inLung(e, s, .78)) { l *= .78; ax.applyAxisAngle(d, .9); continue; }
      const mid = p.clone().addScaledVector(nd, l * .5).add(V(srnd() - .5, srnd() - .5, srnd() - .5).multiplyScalar(l * .12));
      fine.push(vesselGeo([p, mid, e], r, r * .75, 6, 6, .02)); grow(e, nd, len * .76, r * .72, depth - 1, s); break; } }
  }
  const LOBES = { [-1]: [[-.58, 2.18, .02], [-.82, 1.42, .26], [-.74, .98, -.12]], [1]: [[.58, 2.12, .04], [.72, 1.08, -.06]] };
  for (const s of [-1, 1]) { const H = s < 0 ? HR : HL;
    for (const T of LOBES[s]) { const tv = V(...T), e = H.clone().lerp(tv, .45), d = tv.clone().sub(H).normalize();
      lobar.push(vessel([H, H.clone().lerp(e, .5).add(V(0, 0, .02)), e], .044, .034, bronM, 14, 10, .01)); grow(e, d, .22, .026, 6, s); } }
  const tipG = []; tips.forEach(p => { const g = new THREE.SphereGeometry(.018, 8, 6); g.translate(p.x, p.y, p.z); tipG.push(g); });
  const fineM = new THREE.Mesh(mergeGeos(fine), twigM), tipM = new THREE.Mesh(mergeGeos(tipG), tissue('#e2788a', { kind: 'pore', clearcoat: 1 }));
  fineM.renderOrder = tipM.renderOrder = 1;

  /* ── الحجابُ الحاجز: عضلةٌ قبّيّةٌ تحتَ الرئتين ومركزٌ وتريٌّ فاتح ── */
  const diaC = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); const gr = x.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#efd9cf'); gr.addColorStop(.28, '#e2b8ae'); gr.addColorStop(.42, '#b8434f'); gr.addColorStop(1, '#93303c'); x.fillStyle = gr; x.fillRect(0, 0, 256, 256);
    x.strokeStyle = 'rgba(70,10,20,.22)'; x.lineWidth = 2; for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2; x.beginPath(); x.moveTo(128 + Math.cos(a) * 40, 128 + Math.sin(a) * 40); x.lineTo(128 + Math.cos(a) * 128, 128 + Math.sin(a) * 128); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const dia = { c0: [], c1: [] };
  const diaGeo = paramGeo(64, 24, (u, v) => { const a = u * Math.PI * 2, x = Math.cos(a) * 1.2 * v, z = Math.sin(a) * .74 * v; const edge = Math.pow(v, 6) * .05; dia.c0.push(DIA0 - edge); dia.c1.push(diaTop(x, z) - DIA0); return [x, DIA0 - edge + dia.c1[dia.c1.length - 1], z]; });
  { const uv = [], nu = 64, nv = 24; for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const a = i / nu * Math.PI * 2, r = j / nv * .5; uv.push(.5 + Math.cos(a) * r, .5 + Math.sin(a) * r); } diaGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); }
  const diaph = new THREE.Mesh(diaGeo, new THREE.MeshPhysicalMaterial({ map: diaC, roughness: .45, clearcoat: .6, sheen: .5, sheenColor: new THREE.Color('#ffd8d8'), side: 2, bumpMap: tissueBump('vein', 5), bumpScale: 1 }));

  /* ── تكبير: شعيبةٌ هوائيّةٌ تنتهي بحويصلاتٍ هوائيّةٍ تحيطُ بها شعيراتٌ دمويّة (كما في الكتاب) ── */
  const IN = V(-2.4, 2.25, .35), alv = new THREE.Group(); alv.position.copy(IN); root.add(alv);
  const aM = tissue('#ec8f9c', { kind: 'pore', clearcoat: 1, bumpScale: .5 }), sacs = [], capA = [], capV = [];
  const bro = vessel([[.62, -.05, 0], [.38, 0, .02], [.18, .02, 0]], .055, .045, twigM, 16, 12, .02); alv.add(bro);
  const DUCT = [[-.12, .22, .06], [-.2, -.02, .1], [-.08, -.24, .02], [-.02, .05, -.18]];
  DUCT.forEach(([x, y, z], i) => { const end = V(x, y, z); alv.add(vessel([[.18, .02, 0], [.08, y * .4, z * .4], end], .035, .03, twigM, 10, 10, .02));
    const sac = []; for (let k = 0; k < 14; k++) { const d = V(srnd() - .5, srnd() - .5, srnd() - .5).normalize(); d.x -= .35; d.normalize(); const p = end.clone().addScaledVector(d, .06 + srnd() * .06); const g = new THREE.SphereGeometry(.04 + srnd() * .015, 18, 14); g.translate(p.x, p.y, p.z); sac.push(g);
      twigs(k % 2 ? capA : capV, p.clone().addScaledVector(d, .035), V(srnd() - .5, srnd() - .5, srnd() - .5), .06, .007, 2, 1.7, 4); }
    sacs.push(...sac); });
  const sacM = new THREE.Mesh(mergeGeos(sacs), aM); alv.add(sacM);
  const capMs = [new THREE.Mesh(mergeGeos(capA), tissue('#c0141f')), new THREE.Mesh(mergeGeos(capV), tissue('#2a45a8'))]; alv.add(...capMs);
  alv.scale.setScalar(1.25);
  // مخروطُ التكبير من طرفِ شعيبةٍ في الرئةِ اليمنى إلى العنقود
  const zFrom = V(-.98, 1.92, .26), zTo = IN.clone().add(V(.55, 0, 0)), zL = zFrom.distanceTo(zTo);
  const zc = mesh(new THREE.CylinderGeometry(.42, .03, zL, 32, 1, true), new THREE.MeshBasicMaterial({ color: '#e07a8a', transparent: true, opacity: .16, depthWrite: false, side: 2 }));
  zc.position.copy(zFrom).add(zTo).multiplyScalar(.5); zc.quaternion.setFromUnitVectors(V(0, 1, 0), zTo.clone().sub(zFrom).normalize()); zc.raycast = () => {}; root.add(zc);

  root.add(nasal, nostrils, oral, lips, tongue, phar, larynx, trachea, ...bronchi, ...lobar, fineM, tipM, lungR, lungL, diaph);

  /* ── تدفّقُ الهواء ── */
  const o2 = new Flow(root, '#4ab0ff', .035, 70), co2 = new Flow(root, '#8c8c8c', .035, 70);
  const upper = [[0, 3.42, .95], [0, 3.47, .55], [0, 3.42, .25], [0, 3.2, -.02], [0, 2.9, -.02], [0, 2.72, .06], [0, 2.4, .04], [0, 1.98, -.03]];
  const ends = [[[-.2, 1.84, -.04], [-.42, 1.66, -.04], [-.55, 1.95, .02], [-.6, 2.2, .02]], [[-.2, 1.84, -.04], [-.42, 1.66, -.04], [-.7, 1.35, .2]], [[-.2, 1.84, -.04], [-.42, 1.66, -.04], [-.68, 1.0, -.1]], [[.24, 1.9, -.04], [.45, 1.7, -.04], [.56, 2.0, .04]], [[.24, 1.9, -.04], [.45, 1.7, -.04], [.66, 1.05, -.05]]];
  ends.forEach(e => { o2.addPath(curve([...upper, ...e]), .32); co2.addPath(curve([...e.slice().reverse(), ...upper.slice().reverse().slice(0, -1), [0, 3.0, .68], [0, 3.0, .95]]), .32); });

  const parts = [
    { id: 'nose', name: 'الأنف', info: 'يدخلُ الهواءُ عبرَ الأنفِ والفمِ إلى البلعوم. (إثراء: تدفّئُ الشعيراتُ والمخاطُ في الأنفِ الهواءَ وترطّبُه وتنقّيه من الغبار.)', objs: [nasal, ...nostrils.children], at: anchor(root, [.02, 3.52, .78]) },
    { id: 'mouth', name: 'الفم', info: 'يدخلُ الهواءُ أيضًا عبرَ الفمِ إلى البلعوم.', objs: [oral, lips, tongue], at: anchor(root, [.16, 2.98, .72]) },
    { id: 'phar', name: 'البلعوم', info: 'ممرٌّ خلفَ الأنفِ والفمِ يمرُّ عبرَه الهواءُ إلى الحنجرة. (إثراء: ويمرُّ منه الطعامُ أيضًا إلى المريء.)', objs: [phar], at: anchor(root, [-.12, 3.18, -.08]) },
    { id: 'lar', name: 'الحنجرة', info: 'ينتقلُ الهواءُ من البلعومِ إلى الحنجرة، ثم إلى القصبةِ الهوائية. (إثراء: فيها الحبالُ الصوتية، ويغلقُها لسانُ المزمارِ عندَ البلع.)', objs: larynx.children, at: anchor(root, [.05, 2.8, .15]) },
    { id: 'tra', name: 'القصبة الهوائية', info: 'أنبوبٌ تدعمُه حلقاتٌ غضروفيةٌ ينقلُ الهواءَ من الحنجرةِ إلى الشعبتينِ الهوائيتين.', objs: trachea.children, at: anchor(root, [.03, 2.3, .08]) },
    { id: 'bron', name: 'الشعب الهوائية', info: 'تتفرّعُ القصبةُ الهوائيةُ إلى شعبتينِ هوائيتين، تدخلُ كلٌّ منهما إحدى الرئتين، ثم تتفرّعانِ إلى شعبٍ أصغر. (إثراء: الشعبةُ اليمنى أقصرُ وأعرض، وتتفرّعُ إلى ثلاثِ شعبٍ للفصوصِ الثلاثة، واليسرى إلى شعبتين.)', objs: [...bronchi, ...lobar], at: anchor(root, [-.32, 1.74, 0]) },
    { id: 'bronchiole', name: 'الشعيبة الهوائية', info: 'تتفرّعُ الشعبُ الهوائيةُ إلى شعيباتٍ هوائيةٍ أدقَّ فأدقّ، حتى تنتهيَ بأكياسٍ صغيرةٍ تسمّى الحويصلاتِ الهوائية.', objs: [fineM, bro], at: anchor(root, [-.78, 1.55, .3]) },
    { id: 'alv', name: 'الحويصلة الهوائية', info: 'عندَ الحويصلاتِ الهوائيةِ يحدثُ تبادلُ الغازاتِ بينَ الدمِ والهواءِ الذي يدخلُ إليها من خلالِ جدرانِها الرقيقة. (إثراء: تحيطُ بكلِّ حويصلةٍ شعيراتٌ دمويّة.)', objs: [sacM, ...capMs, tipM], at: anchor(root, [-2.3, 2.45, .4]) },
    { id: 'lung', name: 'الرئة', info: 'للإنسانِ رئتانِ في التجويفِ الصدريّ، يدخلُهما الهواءُ عبرَ الشعبِ الهوائية. (إثراء: اليمنى ثلاثةُ فصوص، واليسرى فصّان وفيها تجويفٌ يستقرُّ فيه القلب.)', objs: [lungR, lungL], at: anchor(root, [.95, 1.6, .2]) },
    { id: 'dia', name: 'عضلة الحجاب الحاجز', info: 'عضلةٌ تحتَ الرئتين تنقبضُ وتنبسطُ لتنظّمَ عمليةَ التنفّس: عندَ الشهيقِ تنقبضُ وتنخفضُ فيتّسعُ الصدرُ ويدخلُ الهواء، وعندَ الزفيرِ تنبسطُ وترتفعُ فيخرجُ الهواء.', objs: [diaph], at: anchor(root, [.25, .55, .55]) }
  ];
  const home = { pos: [-2.6, 2.1, 6.9], target: [-.45, 1.85, 0] };
  return {
    root, parts,
    update(dt) {
      if (auto) t += dt * rate; const inh = Math.sin(t * 1.4), a = (inh + 1) / 2, f = 1 - .26 * a, ex = 1 + .045 * a;
      breathe(lungR, f, ex); breathe(lungL, f, ex);
      { const P = diaph.geometry.attributes.position; for (let i = 0; i < P.count; i++) P.setY(i, dia.c0[i] + dia.c1[i] * f); P.needsUpdate = true; seamNormals(diaph.geometry); }
      const flow = Math.cos(t * 1.4); o2.rate = flow > .1 && auto ? 9 * rate : 0; co2.rate = flow < -.1 && auto ? 9 * rate : 0; o2.update(dt); co2.update(dt);
    },
    cam: home, inpage: { pos: [-.35, 1.95, 7.6], target: [-.35, 1.85, 0] },
    controls: [
      { type: 'slider', label: 'سرعة التنفّس', min: .3, max: 3, step: .1, value: 1, fmt: v => v < .8 ? 'هادئ' : v < 1.8 ? 'طبيعي' : 'سريع (رياضة)', on: v => { rate = v; if (v > 1.8) api.toast('في التمارينِ المجهدةِ يتنفّسُ الشخصُ بسرعةٍ لتزويدِ العضلاتِ بالأكسجين.'); } },
      { type: 'button', label: '🔍 اقترب من الحويصلات', toggle: true, on: on => api.flyTo(on ? [-1.35, 2.35, 2.1] : home.pos, on ? IN.toArray() : home.target) },
      { type: 'button', label: '🫁 إظهار/إخفاء الرئتين', toggle: true, on: v => { lungR.visible = lungL.visible = !v; } },
      { type: 'button', label: '❚❚ أوقف / شغّل التنفّس', on: () => auto = !auto }
    ],
    legend: [['#4ab0ff', 'أكسجين (شهيق)'], ['#8c8c8c', 'ثاني أكسيد الكربون (زفير)']],
    quiz: [
      { q: 'المس المكانَ الذي يحدثُ فيه تبادلُ الغازات.', a: 'alv' },
      { q: 'المس الأنبوبَ الذي تدعمُه حلقاتٌ وينقلُ الهواءَ إلى الشعبتين.', a: 'tra' },
      { q: 'المس العضلةَ التي تنظّمُ الشهيقَ والزفير.', a: 'dia' },
      { q: 'إلى أين ينتقلُ الهواءُ بعدَ البلعوم؟ المسه.', a: 'lar' }
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
/* ── أرنبٌ واقعيّ (جلدٌ شفّافٌ بفرو) بوضعيّتي الكتاب: «crouch» جاثمٌ (ص ١٢٢) و«upright» واقفٌ على رجليه (ص ١٢٤)، والرأسُ نحو اليسار ── */
let _furTex = null;
function furTex() { if (_furTex) return _furTex; const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.fillStyle = '#8a6a4c'; x.fillRect(0, 0, S, S);
  for (let i = 0; i < 9000; i++) { const px = Math.random() * S, py = Math.random() * S, l = 6 + Math.random() * 14, a = Math.PI / 2 + (Math.random() - .5) * .5, v = Math.random(); x.strokeStyle = v < .33 ? 'rgba(60,40,26,.5)' : v < .66 ? 'rgba(170,140,105,.45)' : 'rgba(230,215,190,.35)'; x.lineWidth = 1 + Math.random(); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  _furTex = new THREE.CanvasTexture(c); _furTex.colorSpace = THREE.SRGBColorSpace; _furTex.wrapS = _furTex.wrapT = THREE.RepeatWrapping; _furTex.repeat.set(3, 3); return _furTex; }
function rabbitSkin(op = .3, pose = 'crouch') {
  const m = new THREE.MeshPhysicalMaterial({ map: furTex(), bumpMap: furTex(), bumpScale: 2, color: '#c9a27c', roughness: .95, transparent: true, opacity: op, depthWrite: false, sheen: .3, sheenColor: new THREE.Color('#d9c0a0'), sheenRoughness: .6 });
  const ear = new THREE.MeshPhysicalMaterial({ map: furTex(), color: '#d8a890', roughness: .8, transparent: true, opacity: Math.min(.9, op * 1.6), depthWrite: false, sheen: .6, sheenColor: new THREE.Color('#ffd9cc'), side: 2 });
  const g = new THREE.Group(); const add = (geo, p, r, mm = m) => { const o = new THREE.Mesh(geo, mm); o.position.set(...p); if (r) o.rotation.set(...r); g.add(o); return o; };
  const blob = (rx, ry, rz, f) => organGeo(1, v => { v.x *= rx; v.y *= ry; v.z *= rz; f && f(v); v.multiplyScalar(1 + fbm3(v.x * 3, v.y * 3, v.z * 3) * .02); }, 56, 40);
  const head = (p, rot) => { const h = add(blob(.66, .5, .46, v => { if (v.x < 0) { const k = 1 + v.x * .55; v.y *= k; v.z *= k; v.y -= v.x * v.x * .25; } }), p, rot); return h; };
  const earG = (p, rot) => add(organGeo(1, v => { v.x *= .2; v.y *= .72; v.z *= .05; if (v.y < -.6) { v.x *= .7; } }, 32, 24), p, rot, ear);
  if (pose === 'crouch') {
    add(blob(1.7, 1.02, .86, v => { v.y += Math.max(0, v.x) * .25 - v.x * v.x * .05; if (v.y < -.6) v.y = -.6 + (v.y + .6) * .4; }), [.35, 1.02, 0]);
    add(blob(.62, .66, .58), [-1.15, 1.1, 0]);
    head([-1.98, 1.7, 0], [0, 0, -.25]);
    for (const s of [-1, 1]) { earG([-1.42, 2.55, s * .2], [s * .18, 0, .5]);
      add(blob(.78, .72, .42), [1.45, .72, s * .36]); add(blob(.78, .13, .2), [1.15, .1, s * .42]); add(blob(.13, .38, .14), [-1.15, .32, s * .32]); }
    add(blob(.24, .24, .24), [2.18, 1.0, 0]);
  } else {
    add(blob(.9, 1.4, .82, v => { if (v.y < 0) { v.x *= 1.1; v.z *= 1.12; } v.x += Math.max(0, v.y) * .1; }), [.1, .85, 0]);
    head([-.42, 2.58, 0], [0, 0, -.1]);
    for (const s of [-1, 1]) { earG([-.05, 3.6, s * .2], [s * .14, 0, -.12]);
      add(blob(.72, .85, .42), [.3, -.05, s * .4]); add(blob(.8, .13, .2), [-.15, -.85, s * .42]); add(blob(.13, .45, .14), [-.6, 1.05, s * .3], [0, 0, -.3]); }
    add(blob(.24, .24, .24), [.95, -.55, 0]);
  }
  const pre = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true, opacity: 0, depthWrite: true }); [...g.children].forEach(o => { const d = o.clone(); d.material = pre; d.renderOrder = 20; d.raycast = () => {}; d.userData.glow = true; g.add(d); o.renderOrder = 21; });
  g.userData.mats = [m, ear]; return g;
}
/** عظمٌ طويلٌ بين نقطتين (مع رأسين منتفخين) */
function boneAB(a, b, r, mt, ends = 1.9) { const A = V(...a), B = V(...b), L = A.distanceTo(B); const o = new THREE.Mesh(boneGeo(L, r, ends), mt); o.position.copy(A); o.quaternion.setFromUnitVectors(V(0, -1, 0), B.clone().sub(A).normalize()); return o; }

/* ═════════ ٥) الجهاز الهيكلي والعضلي (ص ١٢٢–١٢٣) — هيكلُ أرنبٍ جاثمٍ كما في الكتاب ═════════ */
export function skeletonModel(api) {
  const root = new THREE.Group(); let run = false, t = 0; reseed(41);
  const bone = tissue('#eee3c4', { kind: 'pore', bumpScale: .6, clearcoat: .3, roughness: .5, sheen: .25 });
  const fur = rabbitSkin(.42, 'crouch'); root.add(fur);
  /* الجمجمة: صندوقٌ دماغيٌّ مستدير، ومحجرٌ كبيرٌ للعين، وخطمٌ طويل، وفكٌّ سفليّ، وقواطع */
  const skullG = new THREE.Group(); root.add(skullG);
  skullG.add(mesh(organGeo(.4, v => { v.x *= 1.15; v.y *= .9; v.z *= .9; v.multiplyScalar(1 + fbm3(v.x * 6, v.y * 6, v.z * 6) * .02); }), bone, [-1.72, 1.86, 0]));
  skullG.add(mesh(organGeo(1, v => { v.x *= .52; const k = .55 + .45 * (v.x + .52) / 1.04; v.y *= .24 * k; v.z *= .22 * k; }), bone, [-2.3, 1.72, 0], [0, 0, .32]));
  for (const s of [-1, 1]) { skullG.add(vessel([[-2.18, 1.58, s * .2], [-1.98, 1.5, s * .34], [-1.75, 1.6, s * .32]], .035, .03, bone, 16, 8, .02)); skullG.add(vessel([[-2.15, 1.98, s * .14], [-1.95, 2.06, s * .3], [-1.78, 1.98, s * .3]], .03, .026, bone, 16, 8, .02)); }
  const mand = new THREE.Group(); mand.add(vessel([[-2.6, 1.46, 0], [-2.35, 1.38, .1], [-1.95, 1.36, .16], [-1.78, 1.42, .17], [-1.74, 1.66, .18]], .045, .04, bone, 30, 10, .02)); mand.add(mand.children[0].clone()); mand.children[1].scale.z = -1; skullG.add(mand);
  const incM = mat('#f6efd8', { roughness: .3, clearcoat: 1 }); skullG.add(vessel([[-2.72, 1.6, 0], [-2.78, 1.52, 0], [-2.74, 1.44, 0]], .025, .02, incM, 10, 8), vessel([[-2.62, 1.44, 0], [-2.7, 1.48, 0]], .02, .017, incM, 8, 8));
  const eyeM = new THREE.MeshPhysicalMaterial({ color: '#1a0f0a', roughness: .05, clearcoat: 1 }); for (const s of [-1, 1]) skullG.add(mesh(new THREE.SphereGeometry(.15, 28, 20), eyeM, [-1.98, 1.78, s * .24]));
  /* العمود الفقري: فقراتٌ عنقيّةٌ وصدريّةٌ وقطنيّةٌ وعجزيّةٌ وذيليّة على ظهرٍ مقوّس */
  const spineC = curve([[-1.48, 1.62, 0], [-1.25, 1.42, 0], [-.95, 1.52, 0], [-.4, 1.85, 0], [.4, 2.06, 0], [1.15, 1.92, 0], [1.6, 1.52, 0], [1.88, 1.08, 0], [2.06, .82, 0], [2.12, .62, 0]]);
  const vGeo = (s) => { const L = []; const body = new THREE.CylinderGeometry(.075 * s, .075 * s, .1 * s, 14); body.rotateZ(Math.PI / 2); L.push(body); const sp = new THREE.BoxGeometry(.035 * s, .09 * s, .045 * s); sp.translate(0, .08 * s, 0); L.push(sp); for (const z of [-1, 1]) { const tp = new THREE.BoxGeometry(.04 * s, .03 * s, .12 * s); tp.translate(0, .02 * s, z * .1 * s); L.push(tp); } return mergeGeos(L); };
  const VG = vGeo(1), VGs = vGeo(.62), spine = [];
  for (let i = 0; i < 38; i++) { const u = i / 37, p = spineC.getPointAt(u), tg = spineC.getTangentAt(u), v = new THREE.Mesh(u > .86 ? VGs : VG, bone); v.position.copy(p); const up = V(0, 1, 0).sub(tg.clone().multiplyScalar(tg.y)).normalize(); v.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tg, up, tg.clone().cross(up))); if (u < .12) v.scale.setScalar(.85); root.add(v); spine.push(v); }
  /* القفصُ الصدريّ: ١٢ زوجًا من الأضلاعِ وقصّ */
  const ribs = []; const sternum = []; for (let i = 0; i < 12; i++) { const u = .17 + i * .03, top = spineC.getPointAt(u), fl = i >= 8, sx = top.x - .3 - i * .015, sy = .62 + i * .03, d = .52 + Math.sin(i / 11 * Math.PI) * .15;
    for (const s of [-1, 1]) { const end = fl ? [top.x - .1, top.y - .75, s * d * .8] : [sx, sy, s * .06]; const r = vessel([[top.x, top.y - .04, s * .07], [top.x + .02, top.y - .12, s * d * .85], [top.x - .08, (top.y + sy) / 2, s * d], [sx + .12, sy + .1, s * d * .6], end], .028, .02, bone, 30, 8, .02); root.add(r); ribs.push(r); }
    if (!fl) { const st = mesh(new THREE.CapsuleGeometry(.04, .07, 4, 8), bone, [sx, sy - .02, 0], [0, 0, Math.PI / 2]); root.add(st); sternum.push(st); } }
  /* الطرفُ الأماميّ: لوحُ الكتف، العضد، الكعبرة والزند، عظامُ الكفّ */
  const front = [];
  for (const s of [-1, 1]) { const z = s * .42; const sc = mesh(organGeo(1, v => { v.y *= .42; v.x *= .2; v.z *= .03; if (v.y > 0) v.x *= 1 + v.y * 1.6; }), bone, [-.78, 1.42, s * .5], [0, 0, -.5]); root.add(sc); front.push(sc);
    front.push(boneAB([-1.0, 1.05, z], [-.78, .5, z], .045, bone), boneAB([-.78, .5, z], [-1.1, .1, z], .035, bone), boneAB([-.76, .52, z - s * .04], [-1.08, .1, z - s * .04], .025, bone));
    for (let k = 0; k < 4; k++) front.push(boneAB([-1.1, .08, z + (k - 1.5) * .035], [-1.42, .02, z + (k - 1.5) * .045], .014, bone, 1.5)); }
  front.forEach(o => root.add(o));
  /* الحوض: الحرقفةُ متّصلةٌ بالعجز، والوركُ ثمّ الإسك */
  const pelvis = []; for (const s of [-1, 1]) { pelvis.push(mesh(organGeo(1, v => { v.x *= .42; v.y *= .11; v.z *= .06; }), bone, [1.62, 1.18, s * .2], [0, s * .1, -1.05])); pelvis.push(mesh(organGeo(1, v => { v.x *= .28; v.y *= .12; v.z *= .06; }), bone, [1.92, .7, s * .22], [0, 0, -.35]));
    pelvis.push(mesh(new THREE.TorusGeometry(.09, .03, 8, 18), bone, [1.8, .7, s * .25])); }
  pelvis.forEach(o => root.add(o));
  /* الطرفُ الخلفيّ (يتحرّك): الفخذ، الساق، القدمُ الطويلة، مع عضلتين متقابلتين ووترٍ ورباط */
  const A = V(1.72, .76, .32);
  const hip = new THREE.Group(); hip.position.copy(A); root.add(hip);
  const K = V(1.16, .4, .36).sub(A), T = V(1.98, .2, .36).sub(A).sub(K), F = V(.98, .03, .4).sub(A).sub(K).sub(T);
  const femur = boneAB([0, 0, 0], K.toArray(), .055, bone); hip.add(femur);
  const knee = new THREE.Group(); knee.position.copy(K); hip.add(knee);
  const shin = boneAB([0, 0, 0], T.toArray(), .045, bone); knee.add(shin); knee.add(boneAB([0, -.02, -.03], T.clone().multiplyScalar(.7).toArray(), .02, bone));
  const ankle = new THREE.Group(); ankle.position.copy(T); knee.add(ankle);
  const heel = mesh(organGeo(.07, v => { v.x *= 1.6; }), bone, [.06, -.02, 0]); ankle.add(heel); const foot = [heel];
  for (let k = 0; k < 4; k++) { const b = boneAB([0, 0, (k - 1.5) * .03], F.clone().add(V(0, 0, (k - 1.5) * .05)).toArray(), .016, bone, 1.5); ankle.add(b); foot.push(b); }
  const other = new THREE.Group(); other.position.set(0, 0, -.68); root.add(other); { const h2 = hip.clone(true); h2.position.copy(A).add(V(0, 0, -.64)); root.add(h2); }
  const musM = tissue('#b8323a', { kind: 'vein', bumpScale: 1.4, clearcoat: .6 }), musM2 = tissue('#9a2630', { kind: 'vein', bumpScale: 1.4, clearcoat: .6 });
  const spindleAB = (a, b, r, m) => { const Av = V(...a), Bv = V(...b), L = Av.distanceTo(Bv); const g = organGeo(r, v => { v.y *= L / r / 2; const k = 1 - Math.pow(Math.abs(v.y) / (L / 2), 2) * .6; v.x *= k; v.z *= k; }, 32, 24); const o = new THREE.Mesh(g, m); o.position.copy(Av).add(Bv).multiplyScalar(.5); o.quaternion.setFromUnitVectors(V(0, 1, 0), Bv.clone().sub(Av).normalize()); return o; };
  const mFront = spindleAB([-.05, .05, .1], K.clone().add(V(-.02, .1, .02)).toArray(), .1, musM); hip.add(mFront);
  const mBack = spindleAB([.14, .02, .08], K.clone().add(V(.14, -.02, .04)).toArray(), .11, musM2); hip.add(mBack);
  const calf = spindleAB([.04, -.04, .07], T.clone().multiplyScalar(.6).add(V(.05, .02, .03)).toArray(), .07, musM2); knee.add(calf);
  const tendon = vessel([T.clone().multiplyScalar(.58).add(V(.06, 0, .07)).toArray(), T.clone().add(V(.1, .02, .05)).toArray()], .014, .012, tissue('#f6f2ea', { kind: 'pore', clearcoat: 1 }), 10, 8); knee.add(tendon);
  const lig = mesh(organGeo(.05, v => { v.y *= 1.8; v.x *= .6; }), tissue('#d8cfb0', { clearcoat: .8 }), [0, 0, .07]); knee.add(lig);
  const parts = [
    { id: 'skull', name: 'الجمجمة', info: 'الجمجمةُ قاسيةٌ جدًّا لكي تحميَ الدماغَ الحسّاسَ من الإصابة، كما أنّها خفيفةُ الوزنِ لكي يسهلَ إبقاءُ الرأسِ منتصبًا.', objs: skullG.children, at: anchor(root, [-1.8, 2.3, 0]) },
    { id: 'spine', name: 'الفقرة (العمود الفقري)', info: 'العمودُ الفقريُّ سلسلةٌ من الفقراتِ تدعمُ الجسمَ وتحمي الحبلَ الشوكيّ.', objs: spine, at: anchor(root, [.4, 2.35, 0]) },
    { id: 'ribs', name: 'الضلع (القفص الصدري)', info: 'العظامُ في الجهازِ الهيكليِّ تحمي بعضَ الأعضاءِ الطريّة؛ فالقفصُ الصدريُّ يحمي القلبَ والرئتين.', objs: [...ribs, ...sternum], at: anchor(root, [-.3, .9, .7]) },
    { id: 'front', name: 'عظام الطرف الأمامي (إثراء)', info: 'لوحُ الكتفِ والعضدُ والكعبرةُ والزندُ وعظامُ الكفّ.', objs: front, at: anchor(root, [-1.2, .55, .6]) },
    { id: 'pelvis', name: 'الحوض', info: 'عظامٌ ترتبطُ بها عظامُ الأرجلِ الخلفية، وتتّصلُ بالعمودِ الفقريّ.', objs: pelvis, at: anchor(root, [1.75, 1.4, .3]) },
    { id: 'femur', name: 'الفخذ', info: 'العظامُ نسيجٌ صلبٌ وخفيفٌ وقويّ، تتحرّكُ بسهولةٍ لكنّها لا تستطيعُ الحركةَ وحدَها؛ فمصدرُ القوّةِ التي تحرّكُها هو الجهازُ العضليّ.', objs: [femur, shin, ...foot], at: anchor(hip, [-.3, -.05, .2]) },
    { id: 'muscle', name: 'العضلات المتقابلة', info: 'العضلاتُ التي تسبّبُ الحركةَ تعملُ في أزواج؛ فعندما تنقبضُ عضلةٌ تسحبُ العظمَ المرتبطَ بها، وفي الوقتِ نفسِه تنبسطُ عضلةٌ أخرى. والعضلاتُ تسحبُ ولا تدفعُ أبدًا.', objs: [mFront, mBack, calf], at: anchor(hip, [-.15, .2, .3]) },
    { id: 'tendon', name: 'الوتر', info: 'الأوتارُ نسيجٌ يربطُ بينَ العظامِ والعضلات؛ فعندما تنقبضُ العضلةُ تسحبُ الوترَ الذي يحرّكُ العظم.', objs: [tendon], at: anchor(knee, [.65, -.05, .15]) },
    { id: 'lig', name: 'الرباط', info: 'الأربطةُ نسيجٌ يربطُ العظامَ بعضَها ببعض.', objs: [lig], at: anchor(knee, [-.12, .05, .12]) }
  ];
  function pose(k) { hip.rotation.z = -.55 * k; knee.rotation.z = .95 * k; ankle.rotation.z = -.7 * k; mFront.scale.set(1 + k * .25, 1 - k * .15, 1 + k * .25); mBack.scale.set(1 - k * .1, 1 + k * .12, 1 - k * .1); }
  pose(0);
  return {
    root, parts,
    update(dt) { if (run) { t += dt; const k = (Math.sin(t * 6) + 1) / 2; pose(k); root.position.y = Math.abs(Math.sin(t * 6)) * .08; } },
    cam: { pos: [-.8, 1.6, 7.6], target: [-.2, 1.05, 0] }, inpage: { pos: [-.3, 1.3, 7.4], target: [-.2, 1.05, 0] },
    controls: [
      { type: 'button', label: '🐇 اجعل الأرنب يركض', toggle: true, on: on => { run = on; if (!on) { pose(0); root.position.y = 0; } else api.toast('تُرسَلُ أوامرُ من الدماغِ إلى عضلاتِ الرجل: تنقبضُ عضلةٌ فتسحبُ العظمَ وتنبسطُ المقابلة، ثم يتبادلان.'); } },
      { type: 'button', label: '🐇 إظهار/إخفاء جسم الأرنب', toggle: true, on: v => { fur.visible = !v; } },
      { type: 'slider', label: 'انقباض العضلة', min: 0, max: 10, step: 1, value: 0, fmt: v => v < 3 ? 'منبسطة' : v < 7 ? 'نصف انقباض' : 'منقبضة', on: v => { run = false; pose(v / 10); } }
    ],
    quiz: [
      { q: 'المس العظمَ الذي يحمي الدماغ.', a: 'skull' },
      { q: 'المس النسيجَ الذي يربطُ العضلةَ بالعظم.', a: 'tendon' },
      { q: 'المس العظامَ التي تحمي القلبَ والرئتين.', a: 'ribs' },
      { q: 'المس العضلاتِ التي تعملُ في أزواج.', a: 'muscle' }
    ]
  };
}

/* ═════════ ٦) الجهاز العصبي والغدد الصماء (ص ١٢٤) — أرنبٌ واقفٌ كما في الكتاب ═════════ */
export function nervousModel(api) {
  const root = new THREE.Group(); let t = 0, sig = -1, fast = 0, said = -1; reseed(51);
  const fig = rabbitSkin(.36, 'upright'); root.add(fig);
  /* الدماغ: بصلتانِ شمّيّتان، نصفا كرةٍ مخّيّان، مخيخ، وجذعُ الدماغ */
  const brainM = tissue('#f2a0ac', { kind: 'vein', bumpScale: 1.2, roughness: .45 }), brainG = new THREE.Group(); brainG.position.set(-.3, 2.62, 0); brainG.rotation.z = -.12; root.add(brainG);
  for (const s of [-1, 1]) brainG.add(mesh(organGeo(.24, v => { v.x *= 1.55; v.y *= .8; v.z *= .62; if (v.z * s < 0) v.z *= .6; v.multiplyScalar(1 - Math.abs(noise3(v.x * 14, v.y * 14, v.z * 14)) * .03); }, 64, 48), brainM, [0, .02, s * .13]), mesh(organGeo(.07, v => { v.x *= 1.6; }), brainM, [-.4, -.03, s * .06]));
  brainG.add(mesh(organGeo(.16, v => { v.y *= .85; v.x *= .8; v.multiplyScalar(1 - Math.abs(Math.sin(v.y * 60)) * .04); }, 48, 36), tissue('#e48a98', { kind: 'vein', bumpScale: 1.5 }), [.38, -.06, 0]));
  const stem = vessel([[.25, -.12, 0], [.4, -.2, 0], [.5, -.32, 0]], .08, .065, brainM, 12, 12); brainG.add(stem);
  const eyeM = new THREE.MeshPhysicalMaterial({ color: '#1a0f0a', roughness: .05, clearcoat: 1 }), eyes = []; for (const s of [-1, 1]) { const e = mesh(new THREE.SphereGeometry(.09, 28, 20), eyeM, [-.6, 2.66, s * .34]); root.add(e); eyes.push(e); }
  /* الحبلُ الشوكيُّ على طولِ الظهر، تخرجُ منه أزواجُ الأعصاب */
  const cordC = curve([[.22, 2.32, 0], [.42, 2.0, 0], [.62, 1.4, 0], [.72, .7, 0], [.66, .05, 0], [.6, -.35, 0], [.85, -.55, 0]]);
  const nM = tissue('#f2b03a', { kind: 'pore', bumpScale: .3, emissive: '#6a4200', emissiveIntensity: .12 });
  const cord = vessel(Array.from({ length: 30 }, (_, i) => cordC.getPointAt(i / 29)), .06, .035, tissue('#f6c25a', { kind: 'pore', emissive: '#7a5a00', emissiveIntensity: .12 }), 80, 14, .01); root.add(cord);
  const nerveGeos = [], twigG = [];
  for (let i = 0; i < 22; i++) { const u = .04 + i / 22 * .86 + (srnd() - .5) * .01, p = cordC.getPointAt(u); for (const s of [-1, 1]) { const out = V(p.x - .3 - srnd() * .1, p.y - .1 - srnd() * .1, s * (.5 + srnd() * .1)), front = V(-.55 + (p.y < 1.6 && p.y > .4 ? 0 : .15), p.y - .35, s * .3); nerveGeos.push(vesselGeo([p.toArray(), V(p.x + .02, p.y - .06, s * .25), out, front], .016, .007, 18, 5, .02)); twigs(twigG, front, V(-.3, -.3, s * .2), .14, .005, 2, 1.3, 4); } }
  for (const s of [-1, 1]) { nerveGeos.push(vesselGeo([[.66, 1.55, 0], [.2, 1.35, s * .3], [-.35, 1.2, s * .32], [-.6, .7, s * .3]], .028, .012, 24, 7)); twigs(twigG, V(-.6, .7, s * .3), V(-.1, -1, 0), .16, .008, 3, 1.2, 4);
    nerveGeos.push(vesselGeo([[.64, .05, 0], [.55, -.2, s * .3], [.2, -.5, s * .42], [-.2, -.82, s * .42], [-.75, -.88, s * .42]], .034, .014, 30, 7)); twigs(twigG, V(-.75, -.88, s * .42), V(-1, 0, 0), .15, .008, 3, 1.2, 4);
    nerveGeos.push(vesselGeo([[.28, 2.45, s * .05], [-.2, 2.5, s * .2], [-.55, 2.58, s * .28]], .02, .016, 12, 6)); }
  const nerves = new THREE.Mesh(mergeGeos(nerveGeos), nM), nTw = new THREE.Mesh(mergeGeos(twigG), nM); root.add(nerves, nTw);
  /* الكليتان (بلونٍ ورديٍّ كما في الكتاب) والغدّتانِ الكظريّتانِ فوقهما */
  const adrenal = [], kid = []; for (const s of [-1, 1]) { const k = mesh(organGeo(.2, v => { v.y *= 1.35; v.z *= .65; v.x *= .75; if (v.x < -.04) v.x *= .5 + Math.abs(v.y) * 1.5; }), tissue('#c8398a', { clearcoat: .9 }), [.4, .5, s * .3]); root.add(k); kid.push(k);
    const a = mesh(organGeo(.1, v => { v.y *= .75; if (v.y > 0) { v.x *= 1 - v.y * 4; v.z *= 1 - v.y * 3; } v.z *= .7; }), tissue('#f08a2a', { kind: 'pore' }), [.44, .8, s * .3]); root.add(a); adrenal.push(a); }
  const heart = mesh(organGeo(.2, v => { const y = v.y; const k = y < 0 ? 1 + y * 2 : 1; v.x *= k; v.z *= k * .9; v.y *= 1.2; }), tissue('#9a1f26'), [-.25, 1.35, .05], [0, 0, .4]); root.add(heart);
  /* الثعلب */
  const fox = emo('🦊', 2.2); fox.position.set(-3.0, -.95, .6); fox.rotation.y = Math.PI * .5; root.add(fox);
  const pulse = mesh(new THREE.SphereGeometry(.07, 12, 10), mat('#ffffff', { emissive: '#ffee55', emissiveIntensity: 1.5 })); pulse.visible = false; pulse.raycast = () => {}; root.add(pulse);
  const adr = new Flow(root, '#ffcc22', .04, 40); adr.addPath(curve([[.44, .85, .3], [.2, 1.1, .2], [-.25, 1.35, .05]]), .6).addPath(curve([[.44, .85, -.3], [.1, 1.1, -.1], [-.25, 1.35, .05]]), .6); adr.rate = 0;
  const route = curve([[-2.8, -.2, .7], [-1.6, 1.4, .6], [-.62, 2.6, .3], [-.2, 2.55, .12], [.2, 2.45, 0], ...Array.from({ length: 8 }, (_, i) => cordC.getPointAt(i / 7 * .9).toArray()), [.2, -.5, .42], [-.2, -.82, .42], [-.75, -.88, .42]]);
  const say = [[0, 'تبدأُ استجابةُ الأرنبِ عندما يرى الثعلب.'], [.2, 'تقومُ الخلايا العصبيةُ في عينَي الأرنبِ بإرسالِ معلوماتٍ إلى الدماغ.'], [.36, 'يستجيبُ الدماغُ بإرسالِ أوامرَ عبرَ الحبلِ الشوكيّ.'], [.75, 'ينقلُ الجهازُ العصبيُّ الأوامرَ إلى عضلاتِ الأرجلِ في أقلَّ من جزءٍ من الثانيةِ ليبدأَ الأرنبُ الركض.']];
  const parts = [
    { id: 'brain', name: 'الدماغ', info: 'ينظّمُ حركاتِ العضلات، ويفسّرُ المعلوماتِ التي تصلُه من أعضاءِ الحسّ، وينظّمُ وظائفَ أعضاءِ الجسم.', objs: brainG.children, at: anchor(root, [-.3, 2.95, .1]) },
    { id: 'cord', name: 'الحبل الشوكي', info: 'يمرّرُ المعلوماتِ من الدماغِ وإليه.', objs: [cord], at: anchor(root, [.95, 1.3, 0]) },
    { id: 'nerves', name: 'الأعصاب', info: 'ترسلُ معلوماتٍ من أجزاءِ الجسمِ المختلفةِ إلى الدماغ، وتنقلُ أوامرَه إلى العضلات.', objs: [nerves, nTw], at: anchor(root, [-.5, 1.6, .6]) },
    { id: 'eye', name: 'العين (عضو حسّ)', info: 'تستقبلُ صورةَ الخطر، وتقومُ الخلايا العصبيةُ فيها بإرسالِ معلوماتٍ إلى الدماغ.', objs: eyes, at: anchor(root, [-.75, 2.75, .4]) },
    { id: 'adr', name: 'الغدّتان الكظريّتان', info: 'تقعانِ فوقَ الكليتين، وتفرزانِ هرمونَ الأدرينالين، وتهيّئانِ الجسمَ لحالاتِ الطوارئِ والإجهاد.', objs: adrenal, at: anchor(root, [.75, .95, .3]) },
    { id: 'kid', name: 'الكليتان (إثراء)', info: 'تقعُ الغدّتانِ الكظريّتانِ فوقَ الكليتين. (إثراء: تنقّي الكليتانِ الدمَ من الفضلات.)', objs: kid, at: anchor(root, [.75, .4, .35]) },
    { id: 'heart', name: 'القلب', info: 'يسرّعُ الأدرينالينُ نبضاتِ القلبِ ليزيدَ الدمَ المتدفّقَ إلى العضلات، فيصبحُ الحيوانُ مستعدًّا للهربِ أو الدفاعِ عن نفسِه.', objs: [heart], at: anchor(root, [-.5, 1.5, .3]) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; heart.scale.setScalar(1 + Math.max(0, Math.sin(t * (6 + fast * 6))) * .15);
      if (sig >= 0) { sig += dt * .2; pulse.visible = sig < 1; if (sig >= 1) { sig = -1; adr.rate = 8; fast = 1; api.toast('في الوقتِ نفسِه تفرزُ الغدّتانِ الكظريّتانِ الأدرينالين، فتتسارعُ نبضاتُ القلبِ ويستعدُّ الأرنبُ للهرب.'); } else { pulse.position.copy(route.getPointAt(sig)); const k = say.filter(s => s[0] <= sig).length - 1; if (k !== said) { said = k; api.toast(say[k][1]); } } }
      adr.update(dt); if (fast) { fast = Math.max(0, fast - dt * .08); if (!fast) adr.rate = 0; }
      const lit = sig > .28 && sig < .45 ? .4 : 0; brainM.emissive.setRGB(lit, lit * .7, 0); nM.emissiveIntensity = sig > .4 ? .5 : .12;
    },
    cam: { pos: [-1.2, 1.4, 8.2], target: [-.6, 1.2, 0] }, inpage: { pos: [-.4, 1.4, 7.6], target: [0, 1.3, 0] },
    controls: [
      { type: 'button', label: '🦊 ظهر ثعلب! تابع الاستجابة', on: () => { sig = 0; said = -1; fast = 0; adr.rate = 0; } },
      { type: 'button', label: '🐇 إظهار/إخفاء جسم الأرنب', toggle: true, on: v => { fig.visible = !v; } },
      { type: 'slider', label: 'زمن انتقال الإشارة', min: 0, max: 10, step: 1, value: 0, fmt: v => v < 3 ? 'أقل من جزء من الثانية' : 'دقيقة كاملة!', on: v => { if (v >= 3) api.toast('لو استغرقتِ الأوامرُ دقيقةً لما استطاعَ الأرنبُ الهربَ في الوقتِ المناسب، وأمسكَ به الثعلب.'); } }
    ],
    legend: [['#f2b03a', 'أعصاب'], ['#ffcc22', 'هرمون الأدرينالين']],
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
  const plank = new THREE.Group(); const plM = tissue('#8ae07a', { kind: 'pore', transparent: true, opacity: .8, emissive: '#2a8a2a', emissiveIntensity: .35 }); for (let i = 0; i < 60; i++) plank.add(mesh(i % 3 ? new THREE.SphereGeometry(.03, 10, 8).scale(1, 1, i % 2 ? 1 : 2.2) : new THREE.CylinderGeometry(.035, .035, .015, 12), plM, [(Math.random() - .5) * (W - .4), -.05 - Math.random() * .5, (Math.random() - .5) * D])); root.add(plank);
  const nek = [node(root, '🐬', [-3, -.9, .4], .9, null), node(root, '🦈', [-.4, -1.2, .5], .8, null), node(root, '🐟', [1.6, -.6, .5], .55, null), node(root, '🐋', [-2.2, -2, .3], 1, null)];
  const ben = [node(root, '🦀', [2.3, -.9, .6], .55, null), node(root, '🦞', [.6, -2.0, .5], .55, null), node(root, '🪸', [3.4, -.25, .5], .55, null), node(root, '🐙', [-2.8, -2.45, .5], .6, null)];
  const sun = mesh(new THREE.SphereGeometry(.35, 20, 14), mat('#ffd23a', { emissive: '#ffb000', emissiveIntensity: .9 }), [-3.6, 1.6, 0]); root.add(sun);
  { const fy = x => { const P = [[-W / 2, -2.6], [-1, -2.4], [W / 2 - 3.6, -1.2], [W / 2 - 2.4, -.6], [W / 2 - 1.2, .2], [W / 2, .4]]; for (let k = 0; k < P.length - 1; k++) if (x <= P[k + 1][0]) return P[k][1] + (P[k + 1][1] - P[k][1]) * (x - P[k][0]) / (P[k + 1][0] - P[k][0]); return .4; };
    const rkM = mat('#8a7a62', { bumpMap: tissueBump('pore', 44), bumpScale: 4, roughness: .95 }), kelpM = tissue('#5a7a2a', { kind: 'vein', side: 2, transparent: true, opacity: .9 });
    for (let i = 0; i < 26; i++) { const x = -W / 2 + .3 + Math.random() * (W - .8), z = (Math.random() - .5) * (D - .3); const r = .08 + Math.random() * .14; root.add(mesh(organGeo(r, v => { v.y *= .6; v.multiplyScalar(1 + fbm3(v.x * 8 + i, v.y * 8, v.z * 8) * .35); }, 18, 12), rkM, [x, fy(x) + r * .3, z])); }
    for (let i = 0; i < 14; i++) { const x = .3 + Math.random() * 2.6, z = (Math.random() - .5) * (D - .4), y0 = fy(x), h = Math.min(1.2, -y0 - .1) * (.5 + Math.random() * .5); if (h < .15) continue; const pts = []; for (let k = 0; k <= 8; k++) pts.push(V(x + Math.sin(k * .9 + i) * .06, y0 + h * k / 8, z)); root.add(vessel(pts, .025, .008, kelpM, 24, 6, .1)); } }
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
let _soilRock = null;
export function soilModel(api) {
  const root = new THREE.Group(); let erode = false;
  const Wd = 2.6, Dp = 2.2;
  function layer(h, y, c1, c2, n, s) { return mesh(new THREE.BoxGeometry(Wd, h, Dp), mat('#fff', { map: noiseTexture(c1, c2, n, 256, 256, s), roughness: 1 }), [0, y, 0]); }
  const A = layer(1, 1.2, '#3e2a18', '#5a3e26', 3500, 3), B = layer(1.1, .15, '#a8743a', '#c8944a', 2500, 4), C = layer(1.2, -1, '#9a8a70', '#6e604a', 1200, 9), bed = layer(.6, -1.9, '#6a6a6a', '#4a4a4a', 800, 12);
  root.add(A, B, C, bed);
  const rocks = []; for (let i = 0; i < 18; i++) { const r = mesh(organGeo(.12 + Math.random() * .16, v => { v.z *= .6; v.multiplyScalar(1 + fbm3(v.x * 9 + i, v.y * 9, v.z * 9) * .35); }, 20, 14), _soilRock || (_soilRock = mat('#8a7c66', { bumpMap: tissueBump('pore', 41), bumpScale: 4, roughness: .95 })), [(Math.random() - .5) * (Wd + .02), -1 + (Math.random() - .5) * 1, Dp / 2 + .02]); root.add(r); rocks.push(r); }
  for (let i = 0; i < 14; i++) { const r = mesh(organGeo(.05 + Math.random() * .05, v => v.multiplyScalar(1 + fbm3(v.x * 20 + i, v.y * 20, v.z * 20) * .35), 12, 10), mat('#c8964e', { bumpMap: tissueBump('pore', 42), bumpScale: 3, roughness: .95 }), [(Math.random() - .5) * Wd, .15 + (Math.random() - .5) * .9, Dp / 2 + .02]); root.add(r); }
  const grass = new THREE.Group(); { const bl = []; for (let k = 0; k < 4; k++) { const g = new THREE.PlaneGeometry(.03, .42, 1, 5), P = g.attributes.position; for (let j = 0; j < P.count; j++) { const y = P.getY(j) + .21; P.setX(j, P.getX(j) * (1 - y / .45)); P.setZ(j, y * y * .8); } g.translate(0, .21, 0); g.rotateY(k * 1.6); bl.push(g); } const bG = mergeGeos(bl), gA = mat('#5aa03a', { side: 2 }), gB = mat('#7cbc4a', { side: 2 }); for (let i = 0; i < 220; i++) { const m = mesh(bG, i % 2 ? gA : gB, [(Math.random() - .5) * Wd, 1.7, (Math.random() - .5) * Dp], [0, Math.random() * 6, 0]); m.scale.setScalar(.8 + Math.random() * .5); grass.add(m); } } root.add(grass);
  const roots = []; for (let i = 0; i < 8; i++) { const x = (Math.random() - .5) * 2, z = Dp / 2 + .01; const rm = tissue('#e8d8b8', { kind: 'vein' }); const r = vessel([[x, 1.72, z], [x + .1, 1.3, z], [x - .1, .95, z], [x + .05, .7, z]], .028, .008, rm, 20, 6, .04); const tw = []; twigs(tw, V(x, 1.4, z), V(.5, -1, 0), .2, .01, 2, 1, 4); twigs(tw, V(x, 1.1, z), V(-.5, -1, 0), .18, .009, 2, 1, 4); tw.forEach(g => { const P = g.attributes.position; for (let j = 0; j < P.count; j++) P.setZ(j, z); }); r.add(new THREE.Mesh(mergeGeos(tw), rm)); root.add(r); roots.push(r); }
  const hum = []; for (let i = 0; i < 20; i++) { const h = mesh(organGeo(.05, v => { v.y *= .25; v.x *= 1.6; v.multiplyScalar(1 + fbm3(v.x * 30 + i, v.y * 30, v.z * 30) * .3); }, 12, 8), mat(['#6a4a1a', '#8a6a2a', '#4a3a1a'][i % 3], { bumpMap: tissueBump('vein', 43), bumpScale: 3 }), [(Math.random() - .5) * Wd, 1.2 + (Math.random() - .5) * .8, Dp / 2 + .02]); root.add(h); hum.push(h); }
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
