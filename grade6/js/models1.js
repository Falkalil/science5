// مجسّمات الوحدة الأولى (١): الفيروس، الجذر، الساق، الورقة، النقل
import { THREE, mat, glass, mesh, tube, curve, anchor, V, cellTexture, noiseTexture, Flow, lerp, clamp, ease, tissue, vessel, twigs, mergeGeos, organGeo, fbm3, srnd, reseed, tissueBump } from './kit.js';

/* ───────────── ص ٣٤: فيروس ملتصق بخلية بكتيرية ───────────── */
export function virus(api) {
  const root = new THREE.Group();
  // الخلية البكتيرية: كرة متموّجة الحافة
  const cg = new THREE.SphereGeometry(1.6, 96, 64);
  const p = cg.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    const w = 1 + 0.035 * Math.sin(n.x * 9) * Math.sin(n.y * 8) + 0.03 * Math.sin(n.z * 11 + n.x * 4);
    v.copy(n.multiplyScalar(1.6 * w)); p.setXYZ(i, v.x, v.y, v.z);
  }
  cg.computeVertexNormals();
  const cellTex = noiseTexture('#7a3f5c', '#c9772e', 6000, 512, 512, 4);
  const cellMat = mat('#ffffff', { map: cellTex, roughness: .85, transparent: true, opacity: 1 });
  const cell = mesh(cg, cellMat); root.add(cell);
  const rim = mesh(new THREE.SphereGeometry(1.66, 64, 48), glass('#e0912f', .25)); root.add(rim);

  // الفيروس: رأس متعدد الأوجه + ذيل + أرجل
  function makeVirus(s = 1) {
    const g = new THREE.Group();
    const headM = new THREE.MeshPhysicalMaterial({ color: '#b6dc3a', emissive: '#3d5a00', emissiveIntensity: .2, flatShading: true, roughness: .3, clearcoat: .8, transparent: true, opacity: .85 });
    const hg = new THREE.IcosahedronGeometry(0.3, 0); hg.scale(1, 1.35, 1);
    const head = mesh(hg, headM, [0, 0.7, 0]); g.add(head);
    const core = mesh(new THREE.TorusKnotGeometry(0.1, 0.018, 64, 6, 2, 5), mat('#2f5a07', { emissive: '#3a7a10', emissiveIntensity: .4 }), [0, 0.7, 0]); g.add(core);
    const tailM = mat('#8fc43a', { roughness: .45, clearcoat: .5 });
    g.add(mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.06, 16), tailM, [0, 0.36, 0]));
    for (let k = 0; k < 9; k++) g.add(mesh(new THREE.TorusGeometry(0.06, 0.018, 8, 18), tailM, [0, 0.31 - k * .045, 0], [Math.PI / 2, 0, 0]));
    g.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.42, 12), tailM, [0, 0.12, 0]));
    g.add(mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.04, 6), tailM, [0, -0.11, 0]));
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2, x = Math.cos(a), z = Math.sin(a);
      g.add(tube([[x * .12, -0.11, z * .12], [x * .38, -0.02, z * .38], [x * .48, -0.3, z * .48], [x * .5, -0.5, z * .5]], 0.016, tailM, 20, 6));
    }
    g.scale.setScalar(s); return g;
  }
  const vir = makeVirus(1.5); root.add(vir);
  const surf = V(0.55, 1.5, 0.35).normalize().multiplyScalar(1.62);
  function placeOnCell(obj, dir, dist) { const d = dir.clone().normalize(); obj.position.copy(d.clone().multiplyScalar(dist)); obj.quaternion.setFromUnitVectors(V(0, 1, 0), d); }
  // فيروسات جديدة داخل الخلية
  const kids = [];
  for (let i = 0; i < 14; i++) {
    const k = makeVirus(0.45); k.visible = false;
    const d = V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize();
    k.userData = { home: d.clone().multiplyScalar(0.4 + Math.random() * 0.8), out: d.clone().multiplyScalar(3.4 + Math.random() * 1.2), spin: Math.random() * 6 };
    k.position.copy(k.userData.home); root.add(k); kids.push(k);
  }
  // خلية أخرى بعيدة تهاجمها الفيروسات
  const cell2 = mesh(new THREE.SphereGeometry(0.9, 48, 32), mat('#ffffff', { map: cellTex, transparent: true, opacity: 0 }), [4.2, -1.2, -1.5]);
  root.add(cell2);
  const dna = tube([[0, .4, 0], [.1, .1, .05], [-.12, -.2, 0], [.08, -.5, -.05], [-.05, -.8, 0]], .025, mat('#5fd35a', { emissive: '#2a8a20', emissiveIntensity: .6 }), 40, 6);
  dna.visible = false; root.add(dna);
  const frags = [];
  for (let i = 0; i < 26; i++) {
    const f = mesh(new THREE.TetrahedronGeometry(0.25 + Math.random() * .25), mat('#b3624a', { map: cellTex, flatShading: true }));
    const d = V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(); f.userData = { d }; f.visible = false; root.add(f); frags.push(f);
  }

  let step = 1, tStep = 0, cellsMade = 14;
  const steps = [
    { t: 'الفيروس خارج الخلية', d: 'الفيروسات تسلك سلوك المخلوقات الحية أحيانًا، وسلوك الأشياء غير الحية أحيانًا أخرى.' },
    { t: '١- يلتصق بالخلية', d: 'عندما يصبح الفيروس داخل الجسم يلتصق بخلية.' },
    { t: '٢- يدخلها ويسيطر عليها', d: 'ثم يدخلها، فيسيطر على نشاطاتها.' },
    { t: '٣- إنتاج فيروسات أكثر', d: 'ويستخدمها في إنتاج فيروسات أكثر.' },
    { t: '٤- تنفجر الخلية', d: 'وعندما تمتلئ الخلية بالفيروسات تنفجر، فتخرج الفيروسات منها لتهاجم خلايا أخرى مسببة العدوى والأمراض.' }
  ];
  function setStep(i) { step = i; tStep = 0; }
  setStep(1);

  const parts = [
    { id: 'virus', name: 'فيروس', info: 'هناك مخلوقات – منها الفيروسات – تسلك سلوك المخلوقات الحية أحيانًا، وسلوك الأشياء غير الحية أحيانًا أخرى. لا يمكن تصنيف الفيروسات ضمن أيٍّ من الممالك الست.', objs: [vir], at: anchor(vir, [0, 0.9, 0]) },
    { id: 'cell', name: 'خلية بكتيرية', info: 'البدائيات والبكتيريا وبعض الطلائعيات مخلوقات وحيدة الخلية. يلتصق الفيروس بالخلية ثم يدخلها ويسيطر على نشاطاتها.', objs: [cell, rim], at: anchor(root, [-1.2, -0.6, 1.2]) },
    { id: 'kids', name: 'فيروسات جديدة', info: 'يستخدم الفيروس الخلية في إنتاج فيروسات أكثر. وعندما تمتلئ الخلية بالفيروسات تنفجر، فتخرج الفيروسات منها لتهاجم خلايا أخرى.', objs: kids, at: anchor(root, [0.2, 0.3, 0.6]), hidden: () => step < 3 }
  ];

  function update(dt) {
    tStep += dt; const k = ease(tStep / 1.6);
    const outDir = surf.clone().normalize();
    vir.visible = step < 4 || tStep < 0.3;
    if (step === 0) { placeOnCell(vir, outDir, 3.4 + Math.sin(performance.now() / 600) * 0.12); }
    else if (step === 1) placeOnCell(vir, outDir, lerp(3.4, 2.38, k));
    else placeOnCell(vir, outDir, 2.38);
    // المادة الوراثية تدخل الخلية
    dna.visible = step === 2; if (dna.visible) { dna.position.copy(outDir.clone().multiplyScalar(lerp(1.6, 0.6, k))); dna.scale.setScalar(.6 + k * .4); }
    const cutaway = step >= 2 && step < 4;
    cellMat.opacity = lerp(cellMat.opacity, cutaway ? 0.45 : 1, 0.08); cellMat.depthWrite = cellMat.opacity > .9;
    cell.visible = rim.visible = step < 4 || tStep < 0.25;
    const shown = step === 3 ? Math.floor(clamp(tStep / 2.4) * cellsMade) : (step === 4 ? cellsMade : 0);
    kids.forEach((m, i) => {
      m.visible = i < shown; m.rotation.y += dt * .8;
      if (step === 4) { const kk = ease((tStep - .2) / 1.8); m.position.lerpVectors(m.userData.home, i % 3 === 0 ? V(4.2, -1.2, -1.5).add(m.userData.home.clone().normalize().multiplyScalar(.95)) : m.userData.out, kk); }
      else m.position.copy(m.userData.home);
    });
    frags.forEach(f => { f.visible = step === 4 && tStep < 2.6; if (f.visible) { const kk = ease(tStep / 1.4); f.position.copy(f.userData.d.clone().multiplyScalar(1.4 + kk * 2.2)); f.rotation.x += dt * 2; f.material.opacity = 1; } });
    cell2.visible = step === 4; cell2.material.opacity = step === 4 ? clamp(tStep - .5) : 0; cell2.material.transparent = true;
  }

  return {
    root, parts, update,
    cam: { pos: [3.2, 2.2, 6.2], target: [0.3, 0.3, 0] }, inpage: { pos: [0.4, 1.1, 6.3], target: [0.2, 0.25, 0] },
    controls: [
      { type: 'steps', steps, value: 1, on: setStep },
      { type: 'slider', label: 'عدد الفيروسات الناتجة داخل الخلية', min: 4, max: 14, step: 1, value: 14, fmt: v => v, on: v => { cellsMade = v; } }
    ],
    quiz: [
      { q: 'المس الفيروس.', a: 'virus' },
      { q: 'المس الخلية البكتيرية التي يلتصق بها الفيروس.', a: 'cell' }
    ]
  };
}

/* ───────────── ص ٤٢: أجزاء الجذر ───────────── */
export function rootModel(api) {
  const root = new THREE.Group();
  const L = 6, R0 = 0.9; // طول الجذر ونصف قطره عند القاعدة
  const radiusAt = x => R0 * (1 - 0.55 * clamp(x / L)) * (x > L - 0.9 ? Math.sqrt(clamp((L - x) / 0.9)) * 0.85 + 0.15 : 1);
  const axis = new THREE.Group(); axis.rotation.z = -0.5; axis.position.set(-2.2, 1.2, 0); root.add(axis);
  const epiTex = cellTexture('#d9973f', '#a8641d', 10, 22, .2, 256, 512); epiTex.repeat.set(3, 2);
  const corTex = cellTexture('#b8562c', '#7a2d10', 8, 8); const vasTex = cellTexture('#2fa04f', '#13652c', 6, 10);
  const mEpi = mat('#ffffff', { map: epiTex, roughness: .8, side: THREE.DoubleSide });
  const mCor = mat('#ffffff', { map: corTex, roughness: .8, side: THREE.DoubleSide });
  const mVas = mat('#ffffff', { map: vasTex, roughness: .7, side: THREE.DoubleSide });
  const mCap = mat('#c98a3c', { roughness: .95 });
  const mFace = { epi: mat('#e6a64c', { side: THREE.DoubleSide }), cor: mat('#b44f2a', { side: THREE.DoubleSide }), vas: mat('#36a65a', { side: THREE.DoubleSide }) };

  // جسم الجذر (لاثي)
  function lathe(scale, from, to, m, thetaStart = 0, thetaLen = Math.PI * 2) {
    const pts = []; for (let i = 0; i <= 60; i++) { const x = from + (to - from) * i / 60; pts.push(new THREE.Vector2(radiusAt(x) * scale, x)); }
    const g = new THREE.LatheGeometry(pts, 72, thetaStart, thetaLen); const me = new THREE.Mesh(g, m); me.rotation.z = -Math.PI / 2; me.castShadow = true; return me;
  }
  const CUT = 1.4; // طول الجزء المقطوع
  const body = lathe(1, CUT, L - 0.35, mEpi); axis.add(body);
  const cutGroup = new THREE.Group(); axis.add(cutGroup);
  let cutAngle = Math.PI / 2;
  const layers = {};
  function buildCut() {
    cutGroup.clear();
    const s = cutAngle, len = Math.PI * 2 - s;
    layers.epi = lathe(1, 0, CUT, mEpi, s, len); layers.cor = lathe(0.82, 0, CUT + .001, mCor, s, len); layers.vas = lathe(0.42, 0, CUT + .3, mVas, 0, Math.PI * 2);
    cutGroup.add(layers.epi, layers.cor, layers.vas);
    // وجوه القطع
    const ring = (r1, r2, m, x) => { const g = new THREE.RingGeometry(r1, r2, 64, 1, s, len); const me = new THREE.Mesh(g, m); me.rotation.y = -Math.PI / 2; me.position.x = x; return me; };
    const r = radiusAt(0);
    cutGroup.add(ring(r * .82, r, mFace.epi, 0.002), ring(r * .42, r * .82, mFace.cor, 0.004));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(r * .42, 48), mFace.vas); disc.rotation.y = -Math.PI / 2; disc.position.x = 0.006; cutGroup.add(disc);
    // وجه القطع الطولي
    if (s > 0.01) {
      for (const [r1, r2, m] of [[.82, 1, mFace.epi], [.42, .82, mFace.cor]]) for (const a of [s, Math.PI * 2]) {
        const sh = new THREE.Shape(); sh.moveTo(0, radiusAt(0) * r1); sh.lineTo(CUT, radiusAt(CUT) * r1); sh.lineTo(CUT, radiusAt(CUT) * r2); sh.lineTo(0, radiusAt(0) * r2);
        const me = new THREE.Mesh(new THREE.ShapeGeometry(sh), m); me.rotation.x = a + Math.PI / 2; cutGroup.add(me);
      }
    }
    parts[0].objs = [layers.epi, body]; parts[2].objs = [layers.cor]; parts[3].objs = [layers.vas];
  }
  // القلنسوة
  const capPts = []; for (let i = 0; i <= 30; i++) { const t = i / 30; capPts.push(new THREE.Vector2(radiusAt(L - .5) * 1.12 * Math.sin(t * Math.PI / 2 + Math.PI / 2) , L - 0.55 + 0.6 * t)); }
  const capG = new THREE.LatheGeometry([new THREE.Vector2(radiusAt(L - .55) * 1.1, L - .6), new THREE.Vector2(radiusAt(L - .4) * 1.12, L - .35), new THREE.Vector2(radiusAt(L - .25) * 1.0, L - .18), new THREE.Vector2(0.05, L + 0.02), new THREE.Vector2(0, L + .03)], 48);
  const cap = new THREE.Mesh(capG, mCap); cap.rotation.z = -Math.PI / 2; axis.add(cap);
  // نتوءات على القلنسوة
  const bump = new THREE.SphereGeometry(0.035, 6, 5);
  for (let i = 0; i < 140; i++) { const x = L - .55 + Math.random() * .55, a = Math.random() * 7, r = radiusAt(x) * 1.05; const b = new THREE.Mesh(bump, mCap); b.position.set(x, Math.cos(a) * r, Math.sin(a) * r); axis.add(b); }
  // الشعيرات الجذرية
  const hairs = new THREE.Group(); axis.add(hairs);
  const mHair = mat('#e8b066', { roughness: .7 }); const hairPaths = [];
  for (let i = 0; i < 70; i++) {
    const x = 2.2 + Math.random() * 2.4, a = Math.random() * Math.PI * 2, r = radiusAt(x);
    const n = V(0, Math.cos(a), Math.sin(a)), len = 0.6 + Math.random() * .8;
    const p0 = V(x, 0, 0).add(n.clone().multiplyScalar(r * .98));
    const pts = [p0, p0.clone().add(n.clone().multiplyScalar(len * .4)).add(V(.1, 0, 0)), p0.clone().add(n.clone().multiplyScalar(len * .75)).add(V(-.05 + Math.random() * .2, (Math.random() - .5) * .2, (Math.random() - .5) * .2)), p0.clone().add(n.clone().multiplyScalar(len)).add(V(Math.random() * .2, (Math.random() - .5) * .3, (Math.random() - .5) * .3))];
    const h = tube(pts, 0.018, mHair, 14, 5); hairs.add(h); hairPaths.push(pts);
  }
  // جذور جانبية
  const mSide = mat('#d08f3a');
  for (const [x, a] of [[1.9, .6], [2.6, -2.3], [1.7, 3.5]]) { const n = V(0, Math.cos(a), Math.sin(a)); const p0 = V(x, 0, 0).add(n.clone().multiplyScalar(radiusAt(x) * .9)); const c = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.7, 16), mSide); c.position.copy(p0.clone().add(n.clone().multiplyScalar(.3)).add(V(.15, 0, 0))); c.quaternion.setFromUnitVectors(V(0, 1, 0), n.clone().add(V(.4, 0, 0)).normalize()); axis.add(c); }

  // جسيمات الماء: من التربة إلى الشعيرات ثم إلى المركز ثم في أوعية النقل
  const water = new Flow(axis, '#3aa7ff', 0.05, 120); water.rate = 6; water.on = false;
  hairPaths.forEach((pts, i) => { if (i % 2) return; const tip = pts[3]; const out = tip.clone().add(tip.clone().setX(0).normalize().multiplyScalar(.6));
    water.addPath(curve([out, tip, pts[1], V(pts[0].x, pts[0].y * .3, pts[0].z * .3), V(pts[0].x - .4, 0, 0), V(-0.2, 0, 0)]), .22); });

  const parts = [
    { id: 'epi', name: 'البشرة', info: 'تسمّى الطبقة الخارجية للجذر البشرة. وبشرة الجذر لها شعيرات جذرية تمتص الماء.', objs: [], at: anchor(axis, [3.4, radiusAt(3.4) * .9, .3]) },
    { id: 'hair', name: 'الشعيرات الجذرية', info: 'تمتص الجذور الماء عن طريق شعيرات جذرية تتفرع منها، وهي تراكيب شبيهة بالخيوط الصغيرة الدقيقة.', objs: [hairs], at: anchor(axis, [3.2, -1.25, 0]) },
    { id: 'cor', name: 'القشرة', info: 'يلي البشرة طبقة القشرة التي تخزن الغذاء.', objs: [], at: anchor(axis, [0.2, .55, .35]) },
    { id: 'vas', name: 'أوعية النقل', info: 'تقع أوعية النقل في مركز الجذر، وهي تقوم بنقل الماء والأملاح المعدنية التي تمتصها الشعيرات الجذرية.', objs: [], at: anchor(axis, [-0.15, 0.05, 0.2]) },
    { id: 'cap', name: 'القلنسوة', info: 'قلنسوة تغطي قمة الجذر، وتوفر له الصلابة الكافية والحماية في أثناء اختراقه التربة.', objs: [cap], at: anchor(axis, [L - .1, 0.25, 0]) }
  ];
  buildCut();
  // جزيئات تربة
  const soil = new THREE.Group(); root.add(soil); soil.visible = false;
  const soilM = mat('#7a5534', { roughness: 1 });
  for (let i = 0; i < 160; i++) { const s = mesh(new THREE.DodecahedronGeometry(0.05 + Math.random() * .09), soilM); s.position.set((Math.random() - .5) * 9, (Math.random() - .5) * 6, (Math.random() - .5) * 4); soil.add(s); }

  return {
    root, parts,
    update(dt) { water.update(dt); },
    cam: { pos: [1, 1.2, 8.5], target: [0, -0.4, 0] }, inpage: { pos: [0, 0.8, 8.4], target: [0.1, -0.5, 0] },
    controls: [
      { type: 'slider', label: 'اكشف طبقات الجذر (القطع)', min: 0, max: 180, step: 5, value: 90, fmt: v => v + '°', on: v => { cutAngle = v / 180 * Math.PI; buildCut(); api.refreshParts(); } },
      { type: 'button', label: 'شغّل امتصاص الماء', toggle: true, on: on => { water.on = on; soil.visible = on; if (!on) water.clear(); api.toast(on ? 'تمتص الشعيرات الجذرية الماء من التربة، ثم تنقله أوعية النقل في مركز الجذر.' : ''); } },
      { type: 'slider', label: 'كمية الماء في التربة', min: 0, max: 10, step: 1, value: 6, fmt: v => ['جافة', 'قليلة', 'قليلة', 'متوسطة', 'متوسطة', 'متوسطة', 'وفيرة', 'وفيرة', 'وفيرة', 'كثيرة', 'كثيرة'][v], on: v => { water.rate = v * 1.2; } }
    ],
    quiz: [
      { q: 'أيّ أجزاء الجذر يغطي قمته ويحميه في أثناء اختراقه التربة؟', a: 'cap' },
      { q: 'المس الجزء الذي يمتص الماء ويشبه الخيوط الصغيرة الدقيقة.', a: 'hair' },
      { q: 'المس الطبقة التي تخزن الغذاء.', a: 'cor' },
      { q: 'أين تقع أوعية النقل؟ المسها.', a: 'vas' },
      { q: 'المس الطبقة الخارجية للجذر.', a: 'epi' }
    ]
  };
}

/* ───────────── ص ٤٤: الساق اللينة والساق الخشبية ───────────── */
export function stemModel(api) {
  const root = new THREE.Group();
  const soft = new THREE.Group(), woody = new THREE.Group(); root.add(soft, woody);
  soft.position.set(-2.1, 0, 0); woody.position.set(2.1, 0, 0);
  // ── مقطع الساق اللينة
  const H = 0.55;
  const softSec = new THREE.Group(); soft.add(softSec); softSec.rotation.x = 1.15;
  const mGreen = tissue('#5ca93a', { kind: 'vein', bumpScale: 1.4, roughness: .6 }), mInner = mat('#fff', { map: cellTexture('#f6e27a', '#d9b84a', 14, 14, .3) });
  softSec.add(mesh(new THREE.CylinderGeometry(1.55, 1.55, H, 72, 1, true), mGreen));
  const ringG = new THREE.RingGeometry(1.42, 1.55, 72); const top1 = mesh(ringG, mat('#7cc44c', { side: 2 }), [0, H / 2 + .001, 0], [-Math.PI / 2, 0, 0]); softSec.add(top1);
  softSec.add(mesh(new THREE.CylinderGeometry(1.42, 1.42, H, 72), mInner));
  const mX = tissue('#e2412b', { kind: 'vein', bumpScale: 1.4, roughness: .5 }), mP = tissue('#f07a3a', { kind: 'vein', bumpScale: 1.4, roughness: .5 }), mCam = tissue('#3c9a34', { kind: 'vein', bumpScale: 1.4, roughness: .5 });
  const sx = [], sp = [];
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const x = mesh(new THREE.CylinderGeometry(0.17, 0.17, H + .03, 20), mX, [c * 0.82, 0, s * 0.82]);
    const p = mesh(new THREE.CylinderGeometry(0.15, 0.15, H + .03, 20), mP, [c * 1.18, 0, s * 1.18]);
    softSec.add(x, p); sx.push(x); sp.push(p);
  }
  const camRing = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.035, 8, 120), mCam); camRing.rotation.x = Math.PI / 2; camRing.position.y = H / 2 + .02; softSec.add(camRing);
  const dots = new THREE.Group(); softSec.add(dots); // نقاط الكامبيوم المتقطعة
  // ساق لينة طويلة (يمكن ثنيها)
  const softStemM = tissue('#a6d86a', { kind: 'vein', bumpScale: 1.4, roughness: .45 });
  let bend = 0; let softStem;
  function buildSoftStem() {
    if (softStem) soft.remove(softStem);
    const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10; const y = -2.6 + t * 3.6; const bx = Math.sin(t * 1.4) * bend * 1.6; pts.push(V(-1.8 + bx, y, 0.3 - bx * .2)); }
    softStem = tube(pts, 0.13, softStemM, 40, 14); soft.add(softStem); if (parts) parts[3].objs = [softStem, softSec];
  }
  // ── مقطع الساق الخشبية
  const woodSec = new THREE.Group(); woody.add(woodSec); woodSec.rotation.x = 1.15;
  woodSec.add(mesh(new THREE.CylinderGeometry(1.6, 1.6, H, 72, 1, true), tissue('#6b3a17', { kind: 'vein', bumpScale: 1.4, roughness: .95 })));
  woodSec.add(mesh(new THREE.RingGeometry(1.42, 1.6, 72), mat('#7a4520', { side: 2 }), [0, H / 2 + .001, 0], [-Math.PI / 2, 0, 0]));
  const xyTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.fillStyle = '#f2a23c'; g.fillRect(0, 0, 512, 512); for (let r = 20; r < 230; r += 14) { g.strokeStyle = r % 28 ? '#e08a2a' : '#f7c25d'; g.lineWidth = 6; g.beginPath(); g.arc(256, 256, r, 0, 7); g.stroke(); } for (let i = 0; i < 60; i++) { const a = i / 60 * 7; g.strokeStyle = '#d9792055'; g.lineWidth = 2; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.cos(a) * 240, 256 + Math.sin(a) * 240); g.stroke(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const wX = mesh(new THREE.CylinderGeometry(1.12, 1.12, H + .01, 72), [mat('#e8912f'), mat('#fff', { map: xyTex }), mat('#e8912f')]); woodSec.add(wX);
  const wCam = mesh(new THREE.CylinderGeometry(1.2, 1.2, H + .02, 72, 1, true), mCam); woodSec.add(wCam);
  const wCamTop = mesh(new THREE.RingGeometry(1.12, 1.2, 72), mat('#3c9a34', { side: 2 }), [0, H / 2 + .012, 0], [-Math.PI / 2, 0, 0]); woodSec.add(wCamTop);
  const wP = mesh(new THREE.CylinderGeometry(1.42, 1.42, H + .015, 72, 1, true), mP); woodSec.add(wP);
  const wPTop = mesh(new THREE.RingGeometry(1.2, 1.42, 72), mat('#ef6a3a', { side: 2 }), [0, H / 2 + .008, 0], [-Math.PI / 2, 0, 0]); woodSec.add(wPTop);
  const twig = tube([[1.9, -2.6, .4], [1.85, -1.4, .3], [1.95, -0.2, .25], [1.9, 1.0, .2]], 0.16, mat('#6e4423', { map: noiseTexture('#6e4423', '#4a2a12', 3000), roughness: 1 }), 30, 12); woody.add(twig);
  for (const [y, s] of [[-1.6, 1], [-0.4, -1]]) woody.add(mesh(new THREE.ConeGeometry(.05, .35, 8), mat('#5b3519'), [1.9 + s * .17, y, .3], [0, 0, -s * 1.1]));

  // جسيمات النقل: الماء في الخشب للأعلى، والسكر في اللحاء في الاتجاهين
  const water = new Flow(soft, '#2f8cff', .05, 80), sugar = new Flow(soft, '#ff9a2a', .05, 80);
  const water2 = new Flow(woody, '#2f8cff', .05, 80), sugar2 = new Flow(woody, '#ff9a2a', .05, 80);
  for (const f of [water, sugar, water2, sugar2]) { f.on = false; f.rate = 5; }
  function rebuildFlows() {
    for (const f of [water, sugar]) { f.paths = []; f.clear(); }
    const c = softStem.userData.curve, pts = c.getPoints(20);
    water.addPath(curve(pts.map(p => p.clone().add(V(-.05, 0, .1)))), .35);
    sugar.addPath(curve(pts.slice().reverse().map(p => p.clone().add(V(.06, 0, .1)))), .3, 1);
    sugar.addPath(curve(pts.map(p => p.clone().add(V(.06, 0, .1)))), .3, 1);
  }
  water2.addPath(curve([[1.84, -2.6, .55], [1.8, -1.4, .45], [1.9, -.2, .4], [1.85, 1, .35]]), .35);
  sugar2.addPath(curve([[1.95, 1, .35], [1.98, -.2, .42], [1.9, -1.4, .47], [1.95, -2.6, .55]]), .3);
  sugar2.addPath(curve([[1.95, -2.6, .55], [1.9, -1.4, .47], [1.98, -.2, .42], [1.95, 1, .35]]), .3);
  let parts = null;
  parts = [
    { id: 'xylem', name: 'الخشب', info: 'الخشب سلسلة من الأنابيب تنقل الماء والأملاح المعدنية في اتجاه واحد فقط؛ أي من جذور النبات إلى الأوراق.', objs: [...sx, wX], at: anchor(softSec, [0.82, H / 2, 0]) },
    { id: 'cambium', name: 'الكامبيوم', info: 'تفصل طبقة الكامبيوم طبقتي الخشب واللحاء. ووظيفتها إنتاج خلايا كلٍّ من الخشب واللحاء.', objs: [camRing, wCam, wCamTop], at: anchor(woodSec, [0, H / 2, -1.16]) },
    { id: 'phloem', name: 'اللحاء', info: 'اللحاء ينقل السكر الذي يُصنع في الأوراق إلى أجزاء النبات الأخرى. ويتم نقل السكر عبر اللحاء في اتجاهين: من أعلى إلى أسفل، وبالعكس.', objs: [...sp, wP, wPTop], at: anchor(woodSec, [1.31, H / 2, 0.3]) },
    { id: 'soft', name: 'ساق لينة', info: 'تمتاز الساق اللينة بأنها طرية وخضراء، ويمكن ثنيها بسهولة، كما أن لونها الأخضر يدل على احتواء خلاياها على مادة الكلوروفيل التي تُسهم في عملية صنع الغذاء.', objs: [], at: anchor(soft, [-1.8, -2.2, .4]) },
    { id: 'woody', name: 'ساق خشبية', info: 'الساق الخشبية محاطة بقشرة صلبة تحميها، ولا تحتوي على كلوروفيل. ونحن نشاهدها في الشجيرات القصيرة والأشجار العالية.', objs: [twig, woodSec.children[0], woodSec.children[1]], at: anchor(woody, [1.9, -2.2, .4]) }
  ];
  buildSoftStem(); rebuildFlows();
  let show = 0;
  return {
    root, parts,
    update(dt) { for (const f of [water, sugar, water2, sugar2]) f.update(dt); },
    cam: { pos: [0, 1.6, 9.5], target: [0, -0.4, 0] }, inpage: { pos: [0, 1.2, 8.8], target: [0, -0.5, 0] },
    controls: [
      { type: 'seg', label: 'اعرض', options: ['الساقين معًا', 'الساق اللينة', 'الساق الخشبية'], value: 0, on: i => { show = i; soft.visible = i !== 2; woody.visible = i !== 1; soft.position.x = i === 1 ? 0 : -2.1; woody.position.x = i === 2 ? -1.0 : 2.1; } },
      { type: 'slider', label: 'اثنِ الساق اللينة', min: 0, max: 10, step: 1, value: 0, fmt: v => v ? 'مثنية' : 'مستقيمة', on: v => { bend = v / 10; buildSoftStem(); rebuildFlows(); if (v > 6) api.toast('الساق اللينة طرية ويمكن ثنيها بسهولة، أما الساق الخشبية فمحاطة بقشرة صلبة تحميها.'); } },
      { type: 'button', label: 'شغّل النقل في الساق', toggle: true, on: on => { for (const f of [water, sugar, water2, sugar2]) { f.on = on; if (!on) f.clear(); } api.toast(on ? 'الأزرق: ماء وأملاح في الخشب (اتجاه واحد إلى الأعلى). البرتقالي: سكر في اللحاء (في الاتجاهين).' : ''); } }
    ],
    quiz: [
      { q: 'المس الجزء الذي ينقل السكر من الأوراق إلى جذور النبات.', a: 'phloem' },
      { q: 'المس الطبقة التي تنتج خلايا الخشب واللحاء.', a: 'cambium' },
      { q: 'المس الأنابيب التي تنقل الماء من الجذور إلى الأوراق.', a: 'xylem' },
      { q: 'أيّ الساقين طرية خضراء يمكن ثنيها بسهولة؟', a: 'soft' },
      { q: 'أيّ الساقين محاطة بقشرة صلبة ولا تحتوي على كلوروفيل؟', a: 'woody' }
    ]
  };
}

/* ───────────── ص ٤٥: مخطط أجزاء الورقة ───────────── */
export function leafModel(api) {
  const root = new THREE.Group();
  const W = 5, D = 2.6; // أبعاد المكعب
  const blk = new THREE.Group(); root.add(blk); blk.rotation.y = -0.35;
  // البشرة العلوية
  const epiTex = cellTexture('#8fd16b', '#4f9a35', 16, 8, .15); epiTex.repeat.set(1, 1);
  const upper = mesh(new THREE.BoxGeometry(W, 0.22, D), mat('#fff', { map: epiTex }), [0, 1.0, 0]); blk.add(upper);
  // الطبقة الشمعية (قابلة للقشر)
  const waxG = new THREE.PlaneGeometry(W + .1, D + .1, 40, 20); waxG.rotateX(-Math.PI / 2);
  const waxBase = waxG.attributes.position.array.slice();
  const wax = mesh(waxG, glass('#c9f5b0', .45, { side: 2, roughness: .05, metalness: .1 }), [0, 1.14, 0]); blk.add(wax);
  let peel = 0.25;
  function setPeel(k) { peel = k; const a = waxG.attributes.position; for (let i = 0; i < a.count; i++) { const x = waxBase[i * 3], z = waxBase[i * 3 + 2]; const d = (x + z * .3 + W / 2 + 1) / (W + 1); const lift = Math.max(0, d - (1 - k)) ; a.setY(i, lift * lift * 3.5); a.setX(i, x - lift * lift * 1.2); } a.needsUpdate = true; waxG.computeVertexNormals(); }
  setPeel(peel);
  // الطبقة العمادية: أعمدة
  const pal = new THREE.Group(); blk.add(pal);
  const palM = tissue('#6cbf4a', { kind: 'pore', transparent: true, opacity: .8, roughness: .35, bumpScale: .8 }); const chlM = tissue('#1f6d1f', { kind: 'pore', bumpScale: .6 });
  const colG = new THREE.CapsuleGeometry(0.11, 0.55, 8, 16); { const P = colG.attributes.position; for (let k = 0; k < P.count; k++) { const y = P.getY(k); P.setX(k, P.getX(k) * (1 + Math.sin(y * 9) * .06)); } colG.computeVertexNormals(); }
  const chlI = new THREE.InstancedMesh(new THREE.SphereGeometry(.035, 10, 8).scale(1, 1.6, 1), chlM, 20 * 9 * 10); let ci = 0; const o3 = new THREE.Object3D();
  for (let i = 0; i < 20; i++) for (let j = 0; j < 9; j++) { const cx = -W / 2 + .14 + i * (W - .28) / 19, cz = -D / 2 + .16 + j * (D - .32) / 8; const c = mesh(colG, palM, [cx, 0.52, cz], [0, 0, (srnd() - .5) * .08]); pal.add(c);
    for (let k = 0; k < 10; k++) { const a = srnd() * 6.28; o3.position.set(cx + Math.cos(a) * .085, .52 + (srnd() - .5) * .6, cz + Math.sin(a) * .085); o3.rotation.set(0, a, (srnd() - .5) * .4); o3.updateMatrix(); chlI.setMatrixAt(ci++, o3.matrix); } }
  pal.add(chlI);
  // الطبقة الإسفنجية: خلايا كروية
  const spg = new THREE.Group(); blk.add(spg); const spM = tissue('#86c862', { kind: 'pore', roughness: .4, bumpScale: 1 });
  for (let i = 0; i < 160; i++) { const x = (Math.random() - .5) * (W - .3), z = (Math.random() - .5) * (D - .3); if (Math.abs(z) < .45) continue; spg.add(mesh(organGeo(0.13 + Math.random() * .07, v => v.multiplyScalar(1 + fbm3(v.x * 18 + i, v.y * 18, v.z * 18) * .2), 16, 12), spM, [x, -0.25 + (Math.random() - .5) * .55, z])); }
  // العرق: حزمة على طول المكعب
  const vein = new THREE.Group(); blk.add(vein);
  const xyM = tissue('#a85b2c', { kind: 'vein', bumpScale: 1.5 }), phM = tissue('#d98a4e', { kind: 'pore' });
  const xy = [], ph = [];
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; const t = mesh(new THREE.CylinderGeometry(0.08, 0.08, W - .02, 12), k % 2 ? phM : xyM, [0, -0.2 + Math.sin(a) * .2, Math.cos(a) * .2], [0, 0, Math.PI / 2]); vein.add(t); (k < 4 ? xy : ph).push(t); }
  const sheath = mesh(new THREE.CylinderGeometry(0.42, 0.42, W - .02, 24, 1, true), glass('#9bd27b', .35, { side: 2 }), [0, -0.2, 0], [0, 0, Math.PI / 2]); vein.add(sheath);
  // البشرة السفلية مع الثغور
  const lower = mesh(new THREE.BoxGeometry(W, 0.2, D), mat('#fff', { map: cellTexture('#7dc35a', '#4f9a35', 16, 8, .15) }), [0, -0.85, 0]); blk.add(lower);
  const guards = []; const gM = tissue('#2d7f2a', { kind: 'pore', bumpScale: 1 });
  const stomaPos = [[-1.6, .55], [0.2, -.7], [1.6, .6]];
  for (const [x, z] of stomaPos) { const pair = []; for (const s of [-1, 1]) { const g = mesh(new THREE.TorusGeometry(0.16, 0.07, 10, 20, Math.PI), gM, [x, -0.97, z + s * 0.09], [Math.PI / 2, 0, s > 0 ? 0 : Math.PI]); g.scale.set(1, 1, .9); blk.add(g); pair.push(g); } guards.push(pair); }
  const holes = stomaPos.map(([x, z]) => { const h = mesh(new THREE.CircleGeometry(0.1, 20), mat('#0b2a0b'), [x, -0.955, z], [Math.PI / 2, 0, 0]); h.scale.set(1.4, 0.4, 1); blk.add(h); return h; });

  // بخار الماء الخارج و ثاني أكسيد الكربون الداخل
  const vapor = new Flow(blk, '#7cc8ff', .05, 60), co2 = new Flow(blk, '#bdbdbd', .05, 60);
  for (const [x, z] of stomaPos) { vapor.addPath(curve([[x, -0.3, z], [x, -0.95, z], [x + .2, -1.6, z + .1], [x - .1, -2.4, z]]), .45); co2.addPath(curve([[x + .3, -2.4, z - .2], [x + .1, -1.6, z], [x, -0.95, z], [x - .2, -0.4, z - .1]]), .45); }
  let water = 7;
  function setWater(v) { water = v; const k = v / 10; guards.forEach(p => p.forEach(g => g.scale.set(0.8 + k * 0.35, 0.8 + k * .45, .9))); guards.forEach((p, i) => { p[0].position.z = stomaPos[i][1] - 0.04 - k * .1; p[1].position.z = stomaPos[i][1] + 0.04 + k * .1; holes[i].scale.set(1.4, 0.05 + k * .85, 1); }); vapor.rate = co2.rate = k > .3 ? k * 6 : 0; }
  setWater(water);

  const parts = [
    { id: 'wax', name: 'الطبقة الشمعية', info: 'ينتقل الماء عبر الخشب إلى عروق الورقة التي تغطيها طبقة شمعية تمنع تبخّر الماء.', objs: [wax], at: anchor(blk, [-1.2, 1.25, -.6]) },
    { id: 'epi', name: 'البشرة', info: 'البشرة تغطي سطحي الورقة العلوي والسفلي، وفي سطحها السفلي ثقوب تسمّى الثغور.', objs: [upper, lower], at: anchor(blk, [W / 2 - .2, 1.0, D / 2]) },
    { id: 'pal', name: 'الطبقة العمادية', info: 'البناء الضوئي عملية إنتاج الغذاء التي يتم معظمها في الطبقة العمادية.', objs: pal.children, at: anchor(blk, [W / 2 - .1, .5, D / 2 - .1]) },
    { id: 'vein', name: 'العرق', info: 'يدخل الماء إلى النبات عبر الجذور، وينتقل عبر الخشب إلى عروق الورقة.', objs: [sheath], at: anchor(blk, [W / 2, -0.2, .45]) },
    { id: 'xylem', name: 'الخشب', info: 'ينتقل الماء عبر الخشب إلى عروق الورقة.', objs: xy, at: anchor(blk, [W / 2, -0.05, .1]) },
    { id: 'phloem', name: 'اللحاء', info: 'اللحاء ينقل السكر الذي يُصنع في الأوراق إلى أجزاء النبات الأخرى.', objs: ph, at: anchor(blk, [W / 2, -0.38, -.1]) },
    { id: 'stoma', name: 'الثغر', info: 'تحصل الأوراق على ثاني أكسيد الكربون من الهواء الذي يدخل إلى الورقة عن طريق ثقوب موجودة في سطحها السفلي تسمّى الثغور.', objs: holes, at: anchor(blk, [0.2, -1.05, -.7]) },
    { id: 'guard', name: 'الخلايا الحارسة', info: 'تتحكم الخلايا الحارسة في الثغور. عندما تحتوي الورقة على كمية كبيرة من الماء تنتفخ الخلايا الحارسة وتفتح الثغور. وعندما تقلّ كمية الماء تنكمش الخلايا الحارسة، مما يغلق الثقوب ويمنع الماء من الخروج.', objs: guards.flat(), at: anchor(blk, [-1.6, -1.1, .75]) }
  ];
  let flip = false;
  return {
    root, parts,
    update(dt) { vapor.update(dt); co2.update(dt); },
    cam: { pos: [2.5, 3.2, 7.2], target: [0, -0.1, 0] }, inpage: { pos: [1.6, 2.6, 7.4], target: [0.1, -0.2, 0] },
    controls: [
      { type: 'slider', label: 'كمية الماء في الورقة', min: 0, max: 10, step: 1, value: 7, fmt: v => v < 3 ? 'قليلة' : v < 7 ? 'متوسطة' : 'كبيرة', on: v => { setWater(v); api.toast(v < 3 ? 'قلّت كمية الماء: تنكمش الخلايا الحارسة فتُغلق الثغور ويُمنع خروج الماء.' : v > 6 ? 'كمية كبيرة من الماء: تنتفخ الخلايا الحارسة وتُفتح الثغور، فيخرج الماء الزائد (النتح) ويدخل الهواء.' : ''); } },
      { type: 'slider', label: 'اقشر الطبقة الشمعية', min: 0, max: 10, step: 1, value: 2.5, fmt: v => v * 10 + '٪', on: v => setPeel(v / 10) },
      { type: 'button', label: 'اقلب لرؤية الثغور', toggle: true, on: on => { flip = on; api.flyTo(on ? [1.5, -5.5, 4] : [2.5, 3.2, 7.2], [0, -0.6, 0]); } }
    ],
    legend: [['#7cc8ff', 'بخار ماء يخرج (النتح)'], ['#bdbdbd', 'ثاني أكسيد الكربون يدخل']],
    quiz: [
      { q: 'المس الطبقة التي يتم فيها معظم البناء الضوئي.', a: 'pal' },
      { q: 'المس الطبقة التي تمنع تبخّر الماء.', a: 'wax' },
      { q: 'المس الخلايا التي تتحكم في فتح الثغور وإغلاقها.', a: 'guard' },
      { q: 'من أين يدخل ثاني أكسيد الكربون إلى الورقة؟ المسه.', a: 'stoma' },
      { q: 'المس النسيج الذي ينقل الماء إلى عروق الورقة.', a: 'xylem' }
    ]
  };
}

/* ───────────── ص ٤٦: النقل في النباتات ───────────── */
export function transportModel(api) {
  const root = new THREE.Group();
  const barkM = tissue('#8a6440', { kind: 'vein', bumpScale: 3, roughness: .9, clearcoat: 0, sheen: .2 }); reseed(81);
  // الجذع والفروع
  const trunk = vessel([[0, -3.2, 0], [0.05, -1.5, 0], [-0.05, 0.4, 0], [0.1, 2.2, 0], [0.0, 3.6, 0]], 0.62, 0.38, barkM, 60, 24, .06);
  const br1 = vessel([[0.05, 1.6, 0], [1.0, 2.4, 0.1], [2.2, 2.9, 0.1], [3.2, 3.0, 0]], 0.24, 0.1, barkM, 30, 12, .05);
  const br2 = vessel([[0.0, 0.2, 0], [0.9, 0.0, 0.2], [1.8, -0.2, 0.4]], 0.18, 0.08, barkM, 30, 12, .05);
  const br3 = vessel([[0.0, 2.6, 0], [-1.1, 3.3, -.2], [-2.2, 3.7, -.3]], 0.2, 0.08, barkM, 30, 12, .05);
  root.add(trunk, br1, br2, br3);
  const tw = []; for (const [p, d] of [[[3.2, 3.0, 0], [1, .6, 0]], [[-2.2, 3.7, -.3], [-1, .7, 0]], [[0, 3.6, 0], [0, 1, 0]], [[2.2, 2.9, .1], [.3, 1, .2]]]) twigs(tw, V(...p), V(...d), .6, .07, 3, .8); root.add(new THREE.Mesh(mergeGeos(tw), barkM));
  const rootsG = new THREE.Group(); root.add(rootsG); const rootM = tissue('#a8794a', { kind: 'vein', bumpScale: 2, roughness: .85, clearcoat: 0 });
  const rootPaths = [];
  for (const d of [[-2.2, -4.4, .5], [-1, -4.8, -.8], [1.2, -4.7, .6], [2.4, -4.3, -.3], [0.2, -5.1, .2]]) { const pts = [V(0, -3.0, 0), V(d[0] * .4, -3.7, d[2] * .4), V(d[0], d[1], d[2])]; rootsG.add(vessel(pts, 0.2, 0.05, rootM, 24, 10, .08)); rootPaths.push(pts);
    const rt = []; twigs(rt, V(d[0], d[1], d[2]), V(d[0] * .3, -1, d[2] * .3), .5, .045, 3, 1.1); twigs(rt, V(d[0] * .6, (d[1] - 3.7) / 2 - .1, d[2] * .6), V(d[0], -.6, d[2]), .45, .04, 2, 1); rootsG.add(new THREE.Mesh(mergeGeos(rt), rootM)); }
  // تاج الشجرة: كتلٌ ورقيّةٌ عضويّة
  const crown = new THREE.Group(); root.add(crown); const leafM = new THREE.MeshPhysicalMaterial({ color: '#4f9a3a', roughness: .75, sheen: .8, sheenColor: new THREE.Color('#d8f0a0'), bumpMap: tissueBump('pore', 4), bumpScale: 4 }), leafM2 = leafM.clone(); leafM2.color = new THREE.Color('#3c7e2c');
  for (let i = 0; i < 20; i++) { const s = 0.75 + srnd() * .75, k = i % 5; crown.add(mesh(organGeo(1, v => v.multiplyScalar(1 + fbm3(v.x * 2.3 + k, v.y * 2.3, v.z * 2.3) * .3), 36, 26), i % 2 ? leafM : leafM2, [(srnd() - .45) * 5, 3.7 + srnd() * 1.6, (srnd() - .5) * 2.4 - 1.2], null, [s, s * .85, s])); }
  // الورقة المكبّرة داخل دائرة: نصلٌ بعروقٍ وانحناء
  const leafShape = new THREE.Shape(); leafShape.moveTo(0, 0); leafShape.bezierCurveTo(0.5, 0.55, 1.4, 0.6, 2.1, 0); leafShape.bezierCurveTo(1.4, -0.6, 0.5, -0.55, 0, 0);
  const lg = new THREE.ShapeGeometry(leafShape, 40); { const P = lg.attributes.position; for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, -y * y * .35 + Math.sin(x * 2.2) * .05); } lg.computeVertexNormals(); }
  const bigLeaf = mesh(lg, new THREE.MeshPhysicalMaterial({ color: '#5cb43c', side: 2, roughness: .4, clearcoat: .6, sheen: .6, bumpMap: tissueBump('vein', 7), bumpScale: 3 }), [1.85, -0.25, 0.45], [0, 0, 0.15]); root.add(bigLeaf);
  const midrib = vessel([[1.85, -.25, .47], [2.8, -.12, .47], [3.9, .05, .47]], 0.035, 0.012, tissue('#3d8a2a', { kind: 'vein' }), 20, 8, 0); root.add(midrib);
  for (let i = 1; i < 6; i++) for (const s of [-1, 1]) { const x0 = 1.85 + i * .33, y0 = -.25 + i * .05; root.add(vessel([[x0, y0, .48], [x0 + .2, y0 + s * .2, .47], [x0 + .32, y0 + s * .32 * (1 - i / 7), .45]], .014, .005, tissue('#4a9a30'), 8, 6, 0)); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.06, 10, 80), mat('#c8502a')); ring.position.set(2.9, -0.1, 0.45); root.add(ring);
  // الشمس
  const sun = mesh(new THREE.SphereGeometry(0.55, 32, 24), new THREE.MeshBasicMaterial({ color: '#ffd23a' }), [4.6, 5.6, -1]); root.add(sun);
  const sunGlow = mesh(new THREE.SphereGeometry(0.9, 32, 24), new THREE.MeshBasicMaterial({ color: '#ffe680', transparent: true, opacity: .35 }), [4.6, 5.6, -1]); root.add(sunGlow);
  // أنابيب الخشب (أزرق) واللحاء (برتقالي)
  const xyPts = [V(-0.3, -3.3, .58), V(-0.25, -1.4, .58), V(-0.2, 0.5, .58), V(0.4, 1.2, .5), V(1.0, 0.25, .45), V(1.9, -.2, .5)];
  const phPts = [V(1.9, -.35, .5), V(1.0, 0.0, .55), V(0.35, 0.3, .6), V(0.25, -1.4, .6), V(0.25, -3.3, .6)];
  const xyT = tube(xyPts, 0.08, glass('#2f8cff', .55), 60, 8), phT = tube(phPts, 0.08, glass('#e4572e', .55), 60, 8);
  const xyUp = tube([V(-0.3, 0.6, .58), V(-.2, 2.2, .5), V(1.0, 2.6, .25), V(2.6, 3.05, .2)], 0.06, glass('#2f8cff', .55), 40, 8); root.add(xyT, phT, xyUp);
  const water = new Flow(root, '#2f8cff', .07, 90), sugar = new Flow(root, '#ff8a1e', .07, 90), vapor = new Flow(root, '#9ad7ff', .06, 60);
  rootPaths.forEach(pts => water.addPath(curve([pts[2], pts[1], ...xyPts]), .16));
  water.addPath(curve([...xyPts.slice(0, 3), V(-.2, 2.2, .5), V(1.0, 2.6, .25), V(2.6, 3.05, .2)]), .18, .5);
  rootPaths.forEach(pts => sugar.addPath(curve([...phPts, pts[1].clone().add(V(.1, 0, .1)), pts[2].clone().add(V(.1, 0, .1))]), .14));
  for (let i = 0; i < 4; i++) { const x = 2.2 + i * .45; vapor.addPath(curve([[x, -0.3, .5], [x + .15, -0.9, .5], [x - .05, -1.4, .55], [x + .1, -2.0, .55]]), .5); }
  let light = 7, soilW = 7;
  function rates() { water.rate = soilW * 0.9; sugar.rate = Math.min(light, soilW) * 0.8; vapor.rate = soilW * 0.5; sunGlow.scale.setScalar(.5 + light / 8); sun.material.color.set(light < 2 ? '#bba54a' : '#ffd23a'); }
  rates();
  const steps = [
    { t: '١- يدخل الماء من خلال الجذور', d: 'يدخل الماء إلى النبات عبر الجذور.', f: ['roots'] },
    { t: '٢- ينتقل الماء عبر نسيج الخشب إلى الأوراق', d: 'الخشب ينقل الماء والأملاح المعدنية في اتجاه واحد فقط؛ من جذور النبات إلى الأوراق.', f: ['xylem'] },
    { t: '٣- يستعمل الماء في الورقة لإنتاج السكر', d: 'يدخل كلٌّ من ثاني أكسيد الكربون والماء إلى البلاستيدات الخضراء، ويتحدان في وجود طاقة ضوء الشمس. وينتج عن هذه العملية الأكسجين والسكر.', f: ['leaf'] },
    { t: '٤- ينقل السكر في نسيج اللحاء', d: 'ينتقل السكر إلى جميع الخلايا النباتية عبر اللحاء، ويتم تخزين الفائض منه على شكل مواد يمكن للنبات أن يفككها لاحقًا للحصول على الغذاء.', f: ['phloem'] },
    { t: '٥- يتبخّر بعض الماء من خلال الثغور', d: 'ويخرج معظم الأكسجين من الثغور باعتباره فضلات تطرحها النباتات.', f: ['stoma'] }
  ];
  const vaporObjs = [];
  const parts = [
    { id: 'roots', name: 'الجذور', info: 'يدخل الماء من خلال الجذور.', objs: rootsG.children, at: anchor(root, [-1.6, -4.3, .5]) },
    { id: 'xylem', name: 'نسيج الخشب', info: 'ينتقل الماء عبر نسيج الخشب إلى الأوراق.', objs: [xyT, xyUp], at: anchor(root, [-0.25, -1.9, .6]) },
    { id: 'phloem', name: 'نسيج اللحاء', info: 'ينقل السكر في نسيج اللحاء إلى جميع الخلايا النباتية.', objs: [phT], at: anchor(root, [0.3, -1.0, .6]) },
    { id: 'leaf', name: 'الورقة', info: 'يستعمل الماء في الورقة لإنتاج السكر:\nثاني أكسيد الكربون + ماء ← (ضوء) سكر الجلوكوز + الأكسجين', objs: [bigLeaf, midrib], at: anchor(root, [3.2, .35, .5]) },
    { id: 'stoma', name: 'الثغور', info: 'يتبخّر بعض الماء من خلال الثغور، ويخرج معظم الأكسجين من الثغور باعتباره فضلات تطرحها النباتات.', objs: [ring], at: anchor(root, [2.9, -1.5, .5]) }
  ];
  let focus = null, focusT = 0;
  return {
    root, parts,
    update(dt, t) {
      water.update(dt); sugar.update(dt); vapor.update(dt);
      focusT += dt;
      if (focus) { const pulse = .35 + .35 * Math.sin(focusT * 5); parts.forEach(p => p.objs.forEach(o => { if (o.material && o.material.emissive) o.material.emissiveIntensity = focus.includes(p.id) ? pulse : 0; })); }
    },
    cam: { pos: [1.6, 0.4, 11.5], target: [1.0, 0.2, 0] }, inpage: { pos: [1.2, 0.2, 11.6], target: [0.9, 0, 0] },
    controls: [
      { type: 'steps', steps, value: -1, on: i => { focus = steps[i].f; focusT = 0; parts.forEach(p => p.objs.forEach(o => { if (o.material && o.material.emissive) { o.material = o.material.clone(); o.material.emissive.set('#ffe14d'); o.material.emissiveIntensity = 0; } })); } },
      { type: 'slider', label: 'شدة ضوء الشمس', min: 0, max: 10, step: 1, value: 7, fmt: v => v < 2 ? 'ظلام' : v < 6 ? 'خافت' : 'قوي', on: v => { light = v; rates(); api.toast(v < 2 ? 'بلا ضوء لا تحدث عملية البناء الضوئي، فيتوقف إنتاج السكر.' : ''); } },
      { type: 'slider', label: 'الماء في التربة', min: 0, max: 10, step: 1, value: 7, fmt: v => v < 2 ? 'جافة' : v < 6 ? 'قليل' : 'وفير', on: v => { soilW = v; rates(); } }
    ],
    legend: [['#2f8cff', 'ماء'], ['#ff8a1e', 'سكر'], ['#9ad7ff', 'بخار ماء']],
    quiz: [
      { q: 'من أيّ جزء يدخل الماء إلى النبات؟', a: 'roots' },
      { q: 'المس النسيج الذي ينقل الماء إلى الأوراق.', a: 'xylem' },
      { q: 'كيف يصل السكر المتكوّن في الأوراق إلى الجذور؟ المس النسيج الناقل.', a: 'phloem' },
      { q: 'أين يُستعمل الماء لإنتاج السكر؟', a: 'leaf' }
    ]
  };
}
