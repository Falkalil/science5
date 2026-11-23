// مجسّمات الوحدة الأولى (٢): الفراولة، الإخصاب، البيضة، الزهرة، دورة حياة النبات الزهري
import { THREE, mat, glass, mesh, tube, curve, anchor, V, cellTexture, noiseTexture, Flow, lerp, clamp, ease, tissue, tissueBump } from './kit.js';

// ورقة ثلاثية (فراولة)
function trifoliate(size, m) {
  const g = new THREE.Group();
  const sh = new THREE.Shape(); sh.moveTo(0, 0);
  for (let i = 0; i <= 16; i++) { const t = i / 16 * Math.PI; const r = 0.5 + 0.04 * (i % 2); sh.lineTo(Math.sin(t) * r * 0.75, (1 - Math.cos(t)) * r); }
  for (const a of [-0.75, 0, 0.75]) { const lf = mesh(new THREE.ShapeGeometry(sh, 4), m); lf.rotation.set(-1.05, 0, a); lf.position.set(Math.sin(a) * .08, 0, 0); g.add(lf); }
  g.scale.setScalar(size); return g;
}
function berry(s = 1) {
  const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push(new THREE.Vector2(Math.sin(t * Math.PI) * (0.55 - 0.3 * t) * (t < .15 ? t / .15 * .9 + .1 : 1), -t * 1.0)); }
  const g = new THREE.Group();
  const b = mesh(new THREE.LatheGeometry(pts, 24), mat('#e8262e', { roughness: .35 })); g.add(b);
  const seedM = mat('#f7e25a'); const sg = new THREE.SphereGeometry(0.025, 6, 4);
  for (let i = 0; i < 40; i++) { const t = .15 + Math.random() * .75, a = Math.random() * 7; const r = Math.sin(t * Math.PI) * (0.55 - 0.3 * t) * 1.01; g.add(mesh(sg, seedM, [Math.cos(a) * r, -t, Math.sin(a) * r])); }
  for (let k = 0; k < 5; k++) { const c = mesh(new THREE.ConeGeometry(0.1, 0.35, 4), mat('#3f8a2a'), [Math.cos(k * 1.26) * .2, 0.03, Math.sin(k * 1.26) * .2], [0, -k * 1.26, Math.PI / 2.4]); g.add(c); }
  g.scale.setScalar(s); return g;
}

/* ───────────── ص ٦١: تكاثر نبات الفراولة ───────────── */
export function strawberryModel(api) {
  const root = new THREE.Group();
  const soil = mesh(new THREE.BoxGeometry(12, 0.08, 4), mat('#fff', { map: noiseTexture('#8a6646', '#6b4a2e', 5000, 256, 256, 3), roughness: 1, transparent: true, opacity: .9 }), [0, -0.04, 0]); root.add(soil);
  root.add(mesh(new THREE.BoxGeometry(12, 1.6, 4), glass('#7a5534', .3), [0, -0.88, 0]));
  const leafM = mat('#3f9a3a', { side: 2, roughness: .6 }), stemM = mat('#6fae45', { roughness: .5 });
  // النبات الأصلي
  const mother = new THREE.Group(); mother.position.set(-4.2, 0, 0); mother.scale.setScalar(1.6); root.add(mother);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, h = 1.4 + Math.random() * .6; const pts = [V(0, 0, 0), V(Math.cos(a) * .3, h * .6, Math.sin(a) * .3), V(Math.cos(a) * .7, h, Math.sin(a) * .7)]; mother.add(tube(pts, 0.04, stemM, 16, 6)); const tl = trifoliate(1.0, leafM); tl.position.copy(pts[2]); tl.rotation.y = -a + Math.PI / 2; mother.add(tl); }
  for (const [x, z, s] of [[.6, .7, .55], [1.0, .2, .5], [.3, -.8, .5], [-.7, .6, .45]]) { const b = berry(s); b.position.set(x, .55, z); b.rotation.z = .4; mother.add(b); mother.add(tube([[0, .2, 0], [x * .6, 1.0, z * .6], [x, .6, z]], .025, stemM, 10, 5)); }
  const mRoots = new THREE.Group(); mother.add(mRoots); const rootM = mat('#d8c7a2');
  for (let i = 0; i < 9; i++) { const a = i / 9 * 7; mRoots.add(tube([[0, 0, 0], [Math.cos(a) * .3, -.6, Math.sin(a) * .3], [Math.cos(a) * .55, -1.3, Math.sin(a) * .55]], .03, rootM, 10, 5)); }
  // الساق الجارية والنباتات الجديدة
  const runnerPts = [V(-4.0, 0.3, 0.2), V(-2.8, 0.9, 0.6), V(-1.4, 0.15, 0.4), V(-0.2, 0.02, 0.2), V(1.4, 0.6, -0.2), V(2.8, 0.1, -0.1), V(4.2, 0.02, 0)];
  const runnerCurve = curve(runnerPts);
  let runner = null; const runnerM = mat('#7cbf4a', { roughness: .4 });
  function plantlet() { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const a = i / 4 * 7 + .3, h = 1.0; const pts = [V(0, 0, 0), V(Math.cos(a) * .2, h * .6, Math.sin(a) * .2), V(Math.cos(a) * .5, h, Math.sin(a) * .5)]; g.add(tube(pts, 0.03, stemM, 12, 5)); const tl = trifoliate(.8, leafM); tl.position.copy(pts[2]); tl.rotation.y = -a + Math.PI / 2; g.add(tl); } const rs = new THREE.Group(); for (let i = 0; i < 6; i++) { const a = i / 6 * 7; rs.add(tube([[0, 0, 0], [Math.cos(a) * .2, -.4, Math.sin(a) * .2], [Math.cos(a) * .35, -.9, Math.sin(a) * .35]], .025, rootM, 8, 4)); } g.add(rs); g.userData.roots = rs; return g; }
  const p1 = plantlet(), p2 = plantlet(); p1.position.copy(runnerCurve.getPointAt(0.52)).setY(0); p2.position.copy(runnerCurve.getPointAt(1)).setY(0); root.add(p1, p2);
  let day = 18, cut = false;
  function setDay(d) {
    day = d; const len = clamp(d / 22);
    if (runner) root.remove(runner); runner = null;
    if (len > 0.02 && !cut) { const pts = []; for (let i = 0; i <= 30; i++) pts.push(runnerCurve.getPointAt(i / 30 * len)); runner = tube(pts, 0.07, runnerM, 60, 8); root.add(runner); }
    const g1 = clamp((d - 9) / 10), g2 = clamp((d - 20) / 10);
    p1.scale.setScalar(Math.max(.001, g1) * 1.5); p2.scale.setScalar(Math.max(.001, g2) * 1.5); p1.visible = g1 > 0; p2.visible = g2 > 0;
    p1.userData.roots.scale.y = clamp((d - 12) / 8) + .001; p2.userData.roots.scale.y = clamp((d - 23) / 8) + .001;
    parts[1].objs = runner ? [runner] : [];
  }
  const parts = [
    { id: 'mother', name: 'النبات الأصلي', info: 'العديد من النباتات الشائعة تتكاثر عن طريق الساق الجارية، ويتصل النبات الأصلي بنبات الفراولة الجديد بالساق الجارية.', objs: mother.children.filter(o => o !== mRoots), at: anchor(mother, [0, 2.2, 0]) },
    { id: 'runner', name: 'الساق الجارية', info: 'الساق الجارية ساق نبات تغرس في التربة، ويتم تدعيمها فتنمو وتصبح نباتًا جديدًا. ويمكن للساق الجارية أن تنمو إلى أسفل من أفرع النبات المتدلية، ومن ذلك نبات الفراولة.', objs: [], at: anchor(root, [-2.6, 1.1, .6]), hidden: () => !runner },
    { id: 'new', name: 'النبات الجديد', info: 'يمكن لبعض النباتات أن تتكاثر بنوع من التكاثر اللاجنسي يسمّى التكاثر الخضري؛ حيث تنمو نباتات جديدة انطلاقًا من الأوراق، أو الجذور، أو السيقان.', objs: [p1, p2], at: anchor(p1, [0, 1.5, 0]), hidden: () => day < 11 },
    { id: 'roots', name: 'الجذور', info: 'تنمو للنبات الجديد جذور في التربة فيصبح نباتًا جديدًا.', objs: [mRoots, p1.userData.roots, p2.userData.roots], at: anchor(p1, [0.3, -0.7, 0.3]), hidden: () => day < 14 },
    { id: 'fruit', name: 'ثمار الفراولة', info: 'النباتات الزهرية هي المجموعة الوحيدة التي تنتج الأزهار والبذور والثمار. والفراولة يمكنها أيضًا أن تُنتج نباتات جديدة دون بذور عن طريق الساق الجارية.', objs: mother.children.filter(o => o.children && o.children.length > 30), at: anchor(mother, [1.0, 0.6, .8]) }
  ];
  setDay(day);
  return {
    root, parts,
    update(dt) {},
    cam: { pos: [0, 4.2, 9.5], target: [0, 0.4, 0] }, inpage: { pos: [0, 2.4, 9.4], target: [0, 0.5, 0] },
    controls: [
      { type: 'slider', label: 'الأيام', min: 0, max: 32, step: 1, value: 18, fmt: v => 'اليوم ' + v, on: v => { setDay(v); } },
      { type: 'button', label: 'اقطع الساق الجارية', toggle: true, on: on => { cut = on; setDay(day); api.toast(on ? (day > 22 ? 'بعد أن نمت للنبات الجديد جذوره أصبح نباتًا مستقلًا يعيش وحده.' : 'النبات الجديد لم تكتمل جذوره بعد؛ انتظر أيامًا أكثر قبل القطع.') : ''); } },
      { type: 'button', label: 'شغّل النمو', on: () => api.animate(v => { setDay(Math.round(v)); api.setControl(0, Math.round(v)); }, 0, 32, 6) }
    ],
    quiz: [
      { q: 'أيّ جزء من نبات الفراولة يمكنه إنتاج نباتات جديدة دون بذور؟', a: 'runner' },
      { q: 'المس النبات الأصلي.', a: 'mother' },
      { q: 'المس النبات الجديد الذي نما من الساق الجارية.', a: 'new' }
    ]
  };
}

/* ───────────── ص ٧٠: الإخصاب ───────────── */
export function fertilModel(api) {
  const root = new THREE.Group();
  // البيضة (مشيج مؤنث)
  const eggM = glass('#4da3e8', .82, { roughness: .25, depthWrite: true });
  const egg = mesh(new THREE.SphereGeometry(1.25, 64, 48), eggM, [-1.6, 1.4, 0]); root.add(egg);
  const nucM = glass('#38b6a6', .9, { depthWrite: true });
  const nuc = mesh(new THREE.SphereGeometry(0.42, 32, 24), nucM, [-1.6, 1.4, 0.75]); root.add(nuc);
  const chrG = new THREE.CapsuleGeometry(0.05, 0.38, 4, 8);
  const chrF = [mesh(chrG, mat('#2fd17a', { emissive: '#0c5', emissiveIntensity: .3 })), mesh(chrG, mat('#2fd17a', { emissive: '#0c5', emissiveIntensity: .3 }))];
  chrF.forEach((c, i) => { c.position.set(-.1 + i * .2, 0, .4); c.rotation.z = .5 + i * .3; nuc.add(c); });
  // الحيوان المنوي (مشيج مذكر)
  function sperm() { const g = new THREE.Group(); const head = mesh(new THREE.SphereGeometry(0.22, 24, 16), mat('#d4552b', { roughness: .35 })); head.scale.set(1, 1.25, .8); g.add(head); const tail = new THREE.Group(); g.add(tail); g.userData = { tail, head }; return g; }
  function wiggle(s, t) { const tl = s.userData.tail; tl.clear(); const pts = []; for (let i = 0; i <= 10; i++) { const y = 0.2 + i * 0.22; pts.push(V(Math.sin(t * 8 - i * .8) * .12 * (i / 10), y, 0)); } tl.add(tube(pts, 0.025, mat('#e8a35a'), 20, 5)); }
  const sp = sperm(); root.add(sp);
  const spMid = [];
  const chrM = mesh(chrG, mat('#ff4a3a', { emissive: '#a00', emissiveIntensity: .3 })); chrM.visible = false; nuc.add(chrM);
  // اللاقحة النامية: كرات خلايا
  const emb = new THREE.Group(); root.add(emb); emb.position.set(-1.6, 1.4, 0);
  const cellM = glass('#7aa7e0', .9, { depthWrite: true, roughness: .35 });
  let stage = 0, divs = 0, tSt = 0;
  function buildEmb(n) {
    emb.clear(); if (n <= 0) return; const count = Math.pow(2, n); const R = 1.25;
    const r = R * (n === 1 ? .55 : n === 2 ? .5 : Math.pow(1 / count, 1 / 3) * 1.15);
    const pts = []; if (count === 2) pts.push(V(-.6, 0, 0), V(.6, 0, 0)); else if (count === 4) pts.push(V(-.55, .3, -.3), V(.55, .3, -.3), V(0, -.45, -.3), V(0, 0, .55));
    else for (let i = 0; i < count; i++) { const y = 1 - (i + .5) / count * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996; pts.push(V(Math.cos(a) * rr, y, Math.sin(a) * rr).multiplyScalar(R - r * .7)); }
    pts.forEach(p => emb.add(mesh(new THREE.SphereGeometry(r, 24, 16), cellM, [p.x, p.y, p.z])));
  }
  // سهام
  const arrM = mat('#e8323a');
  function arrow(from, to) { const g = new THREE.Group(); const d = to.clone().sub(from), L = d.length(); const sh = mesh(new THREE.CylinderGeometry(.06, .06, L * .75, 10), arrM); sh.position.y = L * .375; const hd = mesh(new THREE.ConeGeometry(.18, L * .25, 14), arrM); hd.position.y = L * .875; g.add(sh, hd); g.position.copy(from); g.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); return g; }
  // ماء وأمشاج كثيرة (الإخصاب الخارجي)
  const pond = new THREE.Group(); root.add(pond); pond.visible = false;
  const waterBox = mesh(new THREE.BoxGeometry(12, 7, 6), glass('#4fb3d9', .12, { side: 2 }), [0, 1, 0]); pond.add(waterBox);
  const frogEggs = []; for (let i = 0; i < 26; i++) { const g = mesh(new THREE.SphereGeometry(.35, 16, 12), glass('#d8f0ff', .5), [(Math.random() - .5) * 8, -1.6 + Math.random() * .8, (Math.random() - .5) * 3]); const d = mesh(new THREE.SphereGeometry(.12, 10, 8), mat('#1d1d1d')); g.add(d); pond.add(g); frogEggs.push(g); }
  const swarm = []; for (let i = 0; i < 40; i++) { const s = sperm(); s.scale.setScalar(.45); s.userData.seed = Math.random() * 10; s.userData.target = frogEggs[i % frogEggs.length]; pond.add(s); swarm.push(s); }
  const steps = [
    { t: 'مشيج مذكر ومشيج مؤنث', d: 'يحدث التكاثر الجنسي في الحيوانات عندما تتم عملية الإخصاب التي يحدث فيها اندماج المشيج المذكر (الحيوان المنوي) مع المشيج المؤنث (البيضة).' },
    { t: 'اندماج مشيج مذكر مع مشيج مؤنث', d: 'يندمج المشيج المذكر مع المشيج المؤنث.' },
    { t: 'بيضة مخصبة (لاقحة)', d: 'فتنتج البيضة المخصبة (اللاقحة).' },
    { t: 'نمو اللاقحة', d: 'تنمو اللاقحة؛ فتنقسم إلى خلايا أكثر فأكثر.' }
  ];
  function setStage(i) { stage = i; tSt = 0; if (i < 3) { divs = 0; buildEmb(0); api.setControl && api.setControl(1, 0); } else { divs = Math.max(divs, 3); buildEmb(divs); api.setControl && api.setControl(1, divs); } }
  const parts = [
    { id: 'sperm', name: 'مشيج مذكر', info: 'المشيج المذكر هو الحيوان المنوي.', objs: [sp], at: anchor(sp, [0, 0, 0]), hidden: () => stage >= 2 },
    { id: 'egg', name: 'مشيج مؤنث', info: 'المشيج المؤنث هو البيضة.', objs: [egg], at: anchor(root, [-2.6, 2.4, .6]), hidden: () => stage >= 2 },
    { id: 'zygote', name: 'بيضة مخصبة (لاقحة)', info: 'يندمج المشيج المذكر (الحيوان المنوي) مع المشيج المؤنث (البيضة)، فتنتج البيضة المخصبة (اللاقحة).', objs: [egg, nuc], at: anchor(root, [-2.6, 2.4, .6]), hidden: () => stage !== 2 },
    { id: 'embryo', name: 'نمو اللاقحة', info: 'تنمو اللاقحة (البيضة المخصبة) فتنقسم إلى خلايا كثيرة.', objs: emb.children, at: anchor(root, [-2.7, 2.5, .6]), hidden: () => stage < 3 }
  ];
  let ext = false;
  return {
    root, parts,
    update(dt, t) {
      tSt += dt;
      if (ext) { swarm.forEach(s => { const u = s.userData, tg = u.target.position; const k = (t * .15 + u.seed) % 1; s.position.set(tg.x + Math.cos(u.seed * 7) * (1 - k) * 3, tg.y + 1.8 * (1 - k) + .35, tg.z + Math.sin(u.seed * 5) * (1 - k) * 2); s.lookAt(tg); s.rotateX(-Math.PI / 2); wiggle(s, t + u.seed); }); return; }
      const eggC = V(-1.6, 1.4, 0);
      if (stage === 0) { sp.position.set(1.8 + Math.sin(t) * .2, 3.0 + Math.cos(t * 1.3) * .15, .3); sp.rotation.z = 2.2; }
      else if (stage === 1) { const k = ease(tSt / 1.8); sp.position.lerpVectors(V(1.8, 3.0, .3), eggC.clone().add(V(.95, .75, .4)), k); sp.rotation.z = 2.2; if (tSt > 1.8) { sp.visible = false; chrM.visible = true; chrM.position.set(.1, .05, .4); chrM.rotation.z = -.6; } else sp.visible = true; }
      else { sp.visible = false; chrM.visible = true; }
      if (stage === 0) { sp.visible = true; chrM.visible = false; }
      wiggle(sp, t);
      egg.visible = nuc.visible = stage < 3 || divs === 0; eggM.color.set(stage >= 2 ? '#3f8fd6' : '#4da3e8');
      emb.rotation.y += dt * .3;
    },
    cam: { pos: [0, 1.8, 8.5], target: [-0.6, 1.4, 0] }, inpage: { pos: [-0.4, 1.6, 8.0], target: [-0.6, 1.5, 0] },
    controls: [
      { type: 'steps', steps, value: 0, on: setStage },
      { type: 'slider', label: 'انقسامات اللاقحة', min: 0, max: 5, step: 1, value: 0, fmt: v => v ? Math.pow(2, v) + ' خلية' : 'خلية واحدة', on: v => { divs = v; if (v > 0 && stage < 3) { stage = 3; api.setStep && api.setStep(3); } buildEmb(v); parts[3].objs = emb.children; } },
      { type: 'button', label: 'الإخصاب الخارجي في الماء', toggle: true, on: on => { ext = on; pond.visible = on; [egg, nuc, sp, emb].forEach(o => o.visible = !on); api.flyTo(on ? [0, 2.5, 11] : [0, 1.8, 8.5], on ? [0, 0, 0] : [-0.6, 1.4, 0]); api.toast(on ? 'في أثناء تزاوج ضفادع المستنقعات تطلق الأنثى أمشاجها في الماء، ثم يطلق الذكر أمشاجه فوق أمشاج الأنثى، ويحدث الإخصاب. يسمّى ذلك الإخصاب الخارجي.' : ''); } }
    ],
    quiz: [
      { q: 'المس المشيج المذكر (الحيوان المنوي).', a: 'sperm' },
      { q: 'المس المشيج المؤنث (البيضة).', a: 'egg' }
    ]
  };
}

/* ───────────── ص ٧٢: تركيب البيضة ───────────── */
export function eggModel(api) {
  const root = new THREE.Group();
  const prof = []; for (let i = 0; i <= 48; i++) { const t = i / 48 * Math.PI; const y = -Math.cos(t); prof.push(new THREE.Vector2(Math.sin(t) * (1 - 0.18 * y) * 1.0, y * 1.32)); }
  const shellM = mat('#f1dcc0', { roughness: .55, side: 2, map: noiseTexture('#f3dfc3', '#e3c69f', 1500, 256, 256, 2) });
  const innerM = mat('#fffaf2', { side: 1, roughness: .8 });
  const halves = [];
  for (const s of [0, 1]) {
    const g = new THREE.Group();
    const gl = new THREE.LatheGeometry(prof.filter((p, i) => s ? i >= 22 : i <= 26), 64);
    g.add(new THREE.Mesh(gl, shellM)); const inn = new THREE.Mesh(gl, innerM); inn.scale.setScalar(.97); g.add(inn);
    root.add(g); halves.push(g);
  }
  const white = mesh(new THREE.SphereGeometry(1, 48, 32), glass('#f4fbff', .35, { roughness: .05, metalness: .1 })); white.scale.set(.93, 1.2, .93); root.add(white);
  const yolk = mesh(new THREE.SphereGeometry(0.5, 48, 32), mat('#ffaa14', { roughness: .25, emissive: '#c55a00', emissiveIntensity: .15 }), [0, -0.1, 0]); root.add(yolk);
  // بيضة الضفدع
  const frog = new THREE.Group(); root.add(frog); frog.visible = false;
  const jelly = mesh(new THREE.SphereGeometry(1.2, 48, 32), glass('#cfeee0', .38, { roughness: 0.02 })); frog.add(jelly);
  const fe = mesh(new THREE.SphereGeometry(.45, 32, 24), mat('#2b2b2b', { roughness: .4 })); const feTop = mesh(new THREE.SphereGeometry(.452, 32, 24, 0, 6.3, 0, 1.4), mat('#e7e1cf')); fe.add(feTop); fe.rotation.x = Math.PI; frog.add(fe);
  const others = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 7; const o = mesh(new THREE.SphereGeometry(1.0, 32, 24), glass('#cfeee0', .25), [Math.cos(a) * 2.3, Math.sin(i) * .4 - .3, Math.sin(a) * 2.3 - 1.4]); o.add(mesh(new THREE.SphereGeometry(.35, 16, 12), mat('#2b2b2b'))); frog.add(o); others.push(o); }
  let open = 0.55, type = 0;
  function setOpen(k) { open = k; halves[1].position.set(k * 1.6, k * 1.4, 0); halves[1].rotation.z = -k * 1.0; halves[0].position.set(-k * .4, -k * .3, 0); halves[0].rotation.z = k * .25; white.scale.set(.93 + k * .25, 1.2 - k * .45, .93 + k * .25); white.position.y = -k * .45; yolk.position.y = -0.1 - k * .3; }
  setOpen(open);
  const parts = [
    { id: 'shell', name: 'قشرة صلبة', info: 'الزواحف والطيور تحاط بيوضها بقشرة خارجية صلبة مليئة بسائل مائي.', objs: halves.flatMap(h => h.children), at: anchor(halves[1], [0.6, 1.1, 0]), hidden: () => type },
    { id: 'white', name: 'سائل مائي', info: 'السائل المائي يوفّر البيئة الرطبة التي يحتاج إليها الجنين لينمو، وهو كذلك يحميه من ظروف الجفاف الخارجية.', objs: [white], at: anchor(white, [-0.85, -0.2, 0.3]), hidden: () => type },
    { id: 'yolk', name: 'المحّ', info: 'تتغذّى الأجنة على المحّ الموجود في البيوض.', objs: [yolk], at: anchor(yolk, [0, 0.45, 0.2]), hidden: () => type },
    { id: 'jelly', name: 'طبقة تشبه الهلام', info: 'تضع الأسماك والضفادع بيوضها في المياه المفتوحة. وقد تتعرض بيوضها لبعض المخلوقات الحية الجائعة التي تتغذى عليها؛ لذا هيّأ الله سبحانه وتعالى لأجنتها طبقة تشبه الهلام تحيط ببيوضها لحمايتها.', objs: [jelly, ...others], at: anchor(frog, [0.8, 0.9, 0.4]), hidden: () => !type },
    { id: 'embryo', name: 'الجنين', info: 'الإخصاب الناجح ينتج بيضة مخصبة (لاقحة) تحوي جنينًا قابلًا للنمو داخلها.', objs: [fe], at: anchor(frog, [0, 0, 0.45]), hidden: () => !type }
  ];
  return {
    root, parts, update(dt) { if (type) others.forEach((o, i) => o.position.y += Math.sin(performance.now() / 700 + i) * .002); },
    cam: { pos: [2.2, 2.2, 6.2], target: [0.3, 0.1, 0] }, inpage: { pos: [0.2, 1.8, 6.8], target: [0.3, 0, 0] },
    controls: [
      { type: 'slider', label: 'اكسر القشرة وافتحها', min: 0, max: 10, step: 1, value: 5.5, fmt: v => v ? (v * 10) + '٪' : 'مغلقة', on: v => setOpen(v / 10) },
      { type: 'seg', label: 'نوع البيضة', options: ['بيضة طائر (دجاج)', 'بيضة ضفدع'], value: 0, on: i => { type = i; frog.visible = !!i; [white, yolk, ...halves].forEach(o => o.visible = !i); api.toast(i ? 'بيضة الضفدع لا قشرة لها؛ تحيط بها طبقة تشبه الهلام. أيّ البيوض توفّر حماية أقلّ للجنين؟' : ''); } }
    ],
    quiz: [
      { q: 'على أيّ جزء تتغذّى الأجنة داخل البيضة؟', a: 'yolk' },
      { q: 'المس الجزء الذي يوفّر البيئة الرطبة للجنين ويحميه من الجفاف.', a: 'white' },
      { q: 'المس الغطاء الخارجي الصلب لبيضة الطائر.', a: 'shell' }
    ]
  };
}

/* ───────────── ص ٧٣: تركيب الزهرة ───────────── */
export function flowerModel(api) {
  const root = new THREE.Group(); root.position.y = -1.2;
  // البتلات
  const petals = []; const petalM = new THREE.MeshPhysicalMaterial({ vertexColors: true, side: 2, roughness: .5, sheen: .35, sheenColor: new THREE.Color('#fff2a0'), clearcoat: .25, bumpMap: tissueBump('vein', 12), bumpScale: .6 });
  for (let i = 0; i < 6; i++) {
    const g = new THREE.PlaneGeometry(2, 1, 16, 20); const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const u = p.getX(k), v = p.getY(k) + .5; const w = Math.sqrt(Math.max(0, Math.sin(Math.PI * (0.12 + 0.86 * v)))) * (0.45 + 0.75 * v);
      const r = 0.25 + v * 2.5, lat = u * w, hgt = 0.15 + v * v * 1.3 + 0.35 * u * u * v; p.setXYZ(k, lat, hgt, r); }
    g.computeVertexNormals(); { const P = g.attributes.position, col = new Float32Array(P.count * 3), c = new THREE.Color(); for (let k = 0; k < P.count; k++) { const v = (P.getZ(k) - .25) / 2.5; c.set('#6aa83a').lerp(new THREE.Color('#f0b000'), THREE.MathUtils.smoothstep(v, .02, .3)).lerp(new THREE.Color('#ffcc10'), THREE.MathUtils.smoothstep(v, .6, 1) * .6); col.set([c.r, c.g, c.b], k * 3); } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
    const pv = new THREE.Group(); pv.rotation.y = i / 6 * Math.PI * 2 + (i % 2) * .08; const pm = new THREE.Mesh(g, petalM); pm.castShadow = true; pv.add(pm); pv.position.y = 0.55; root.add(pv); petals.push({ pv, pm });
  }
  // السبلات
  const sepals = []; const sepM = tissue('#3e9a35', { kind: 'vein', side: 2 });
  for (let i = 0; i < 5; i++) { const g = new THREE.ConeGeometry(.35, 1.4, 4, 1, true); const pv = new THREE.Group(); pv.rotation.y = i / 5 * 7 + .6; const s = mesh(g, sepM, [0, 0, .5], [-2.3, 0, 0]); s.scale.set(1, 1, .25); pv.add(s); pv.position.y = .45; root.add(pv); sepals.push(s); }
  root.add(mesh(new THREE.CylinderGeometry(.22, .28, 1.4, 24), tissue('#4a9a35', { kind: 'vein' }), [0, -.25, 0]));
  // الكربلة: مبيض + قلم + ميسم
  const ovProf = []; for (let i = 0; i <= 24; i++) { const t = i / 24; ovProf.push(new THREE.Vector2(Math.sin(t * Math.PI) * .42 + (t > .8 ? 0 : 0), t * 1.3)); }
  const ovM = tissue('#7cbf45', { kind: 'pore', side: 2, bumpScale: .8 });
  let ovary = new THREE.Mesh(new THREE.LatheGeometry(ovProf, 40), ovM); ovary.position.y = 0.4; root.add(ovary);
  const ovules = new THREE.Group(); root.add(ovules); for (let i = 0; i < 4; i++) ovules.add(mesh(new THREE.SphereGeometry(.09, 16, 12), mat('#f7f25a', { emissive: '#aa9900', emissiveIntensity: .3 }), [0, .65 + i * .22, 0]));
  const styleC = curve([[0, 1.6, 0], [0, 2.6, 0], [0.05, 3.6, 0], [0.12, 4.3, 0]]);
  const style = mesh(new THREE.TubeGeometry(styleC, 30, .13, 16), tissue('#8fcb55', { kind: 'pore', bumpScale: .5 })); root.add(style);
  const stigma = mesh(new THREE.SphereGeometry(.24, 24, 16), tissue('#b9d44a', { kind: 'pore', bumpScale: 2.5, roughness: .7 }), [0.12, 4.35, 0]); stigma.scale.set(1.2, .7, 1.2); root.add(stigma);
  // الأسدية: خيوط + متوك
  const filaments = [], anthers = []; const filM = tissue('#efe6a8', { kind: 'pore', bumpScale: .3 }), antM = tissue('#c8861e', { kind: 'pore', bumpScale: 2.5, roughness: .7 });
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, r = .55 + (i % 2) * .15, h = 3.0 + (i % 3) * .5; const c = curve([[Math.cos(a) * .3, .9, Math.sin(a) * .3], [Math.cos(a) * r * .9, h * .55, Math.sin(a) * r * .9], [Math.cos(a) * r * 1.6, h, Math.sin(a) * r * 1.6]]); const f = mesh(new THREE.TubeGeometry(c, 20, .035, 8), filM); root.add(f); filaments.push(f); const an = mesh(new THREE.CapsuleGeometry(.11, .32, 6, 12), antM); an.position.copy(c.getPoint(1)); an.lookAt(c.getPoint(1).add(c.getTangent(1))); an.rotateX(Math.PI / 2); root.add(an); anthers.push(an); }
  // حبوب اللقاح والنحلة
  const pollen = new Flow(root, '#ffd400', .06, 40); pollen.on = false; pollen.rate = 6;
  anthers.forEach(an => pollen.addPath(curve([an.position, an.position.clone().add(V(.4, .8, .3)), V(.6, 5.0, .4), V(.12, 4.45, 0)]), .45));
  const tubeFlow = new Flow(root, '#ffef7a', .045, 20); tubeFlow.on = false; tubeFlow.rate = 1.5; tubeFlow.addPath(curve([[0.12, 4.35, 0], [0.05, 3.6, 0.02], [0, 2.6, 0.02], [0, 1.4, 0], [0, 1.0, 0]]), .3);
  const bee = new THREE.Group(); const body = mesh(new THREE.SphereGeometry(.35, 20, 14), mat('#f2b51c'), null, null, [1, .8, 1.5]); bee.add(body);
  for (let k = -1; k <= 1; k++) bee.add(mesh(new THREE.TorusGeometry(.33, .05, 6, 20), mat('#222'), [0, 0, k * .22], null, [1, .8, 1]));
  const wings = [mesh(new THREE.CircleGeometry(.35, 16), glass('#e8f6ff', .6, { side: 2 }), [.3, .3, 0]), mesh(new THREE.CircleGeometry(.35, 16), glass('#e8f6ff', .6, { side: 2 }), [-.3, .3, 0])]; bee.add(...wings); bee.visible = false; root.add(bee);
  let petalOff = 0, sectionOn = false;
  function setPetals(k) { petalOff = k; petals.forEach(({ pv, pm }, i) => { pm.rotation.x = k * 1.3; pm.position.z = k * 2.4; pm.position.y = -k * 2.8; pm.material.opacity = 1 - k * .9; pm.material.transparent = k > 0; pm.visible = k < .98; }); }
  function setSection(on) { sectionOn = on; root.remove(ovary); ovary = new THREE.Mesh(new THREE.LatheGeometry(ovProf, 40, on ? Math.PI * .5 : 0, on ? Math.PI * 1.5 : Math.PI * 2), ovM); ovary.position.y = .4; root.add(ovary); parts.find(p => p.id === 'ovary').objs = [ovary]; parts.find(p => p.id === 'carpel').objs = [ovary, style, stigma]; ovules.visible = on; }
  const parts = [
    { id: 'stigma', name: 'الميسم', info: 'الكربلة هي الجزء الأنثوي في الزهرة، ويتكوّن من الميسم والقلم والمبيض. وعند التلقيح تنتقل حبوب اللقاح من السداة إلى الكربلة.', objs: [stigma], at: anchor(root, [0.12, 4.6, 0]) },
    { id: 'style', name: 'القلم', info: 'القلم جزء من الكربلة. وبحدوث التلقيح تنتقل الخلايا الجنسية الذكرية الموجودة في الكربلة عبر القلم إلى المبيض.', objs: [style], at: anchor(root, [0.05, 3.0, .1]) },
    { id: 'ovary', name: 'المبيض', info: 'تنتج الخلايا الجنسية الأنثوية في المبيض.', objs: [ovary], at: anchor(root, [0.45, 1.1, .2]) },
    { id: 'ovule', name: 'البويضة', info: 'تنتج الخلايا الجنسية الأنثوية في المبيض، وتتحد معها الخلايا الجنسية الذكرية فيحدث الإخصاب.', objs: ovules.children, at: anchor(root, [0, 1.2, 0]), hidden: () => !sectionOn },
    { id: 'carpel', name: 'الكربلة', info: 'الكربلة هي الجزء الأنثوي في الزهرة، ويتكوّن من الميسم والقلم والمبيض.', objs: [ovary, style, stigma], at: anchor(root, [-0.25, 2.2, 0]) },
    { id: 'anther', name: 'المتك', info: 'السداة هي الجزء الذكري في الزهرة، وينتهي بالمتك، وفيه تنتج حبوب اللقاح. وحبوب اللقاح مسحوق أصفر يحوي خلايا جنسية ذكرية.', objs: anthers, at: anchor(anthers[0], [0, 0, 0]) },
    { id: 'filament', name: 'الخيط', info: 'الخيط جزء من السداة يحمل المتك. والسداة هي الجزء الذكري في الزهرة.', objs: filaments, at: anchor(root, [1.0, 2.0, 0.3]) },
    { id: 'stamen', name: 'السداة', info: 'السداة هي الجزء الذكري في الزهرة، وينتهي بالمتك، وفيه تنتج حبوب اللقاح.', objs: [...filaments, ...anthers], at: anchor(root, [-1.2, 3.4, -.5]) },
    { id: 'petal', name: 'البتلة', info: 'تُحاط الأسدية والكرابل بالبتلات والسبلات. وتساعد ألوان البتلات الزاهية، وأشكالها الرائعة، والروائح العطرة على جذب الملقّحات.', objs: petals.map(p => p.pm), at: anchor(petals[1].pm, [0, 1.8, 0]), hidden: () => petalOff > .9 },
    { id: 'sepal', name: 'السبلة', info: 'تُحاط الأسدية والكرابل بالبتلات والسبلات.', objs: sepals, at: anchor(root, [0.9, 0.0, .6]) }
  ];
  let bt = -1;
  return {
    root, parts,
    update(dt, t) {
      pollen.update(dt); tubeFlow.update(dt);
      if (bt >= 0) { bt += dt; const k = bt / 4; bee.visible = k < 1; const p = curve([[4, 6, 2], [1.6, 4.0, 1], [0.6, 4.9, .5], [-1.2, 4.2, 1], [-4, 6, 2]]).getPointAt(clamp(k)); bee.position.copy(p); bee.rotation.y = -1.4; wings.forEach((w, i) => w.rotation.z = Math.sin(t * 60) * .6 * (i ? 1 : -1)); if (k > .25 && k < .7) pollen.on = true; else pollen.on = false; if (k > .6) tubeFlow.on = true; if (k > 2.5) { tubeFlow.on = false; bt = -1; } }
    },
    cam: { pos: [3.6, 3.4, 8.2], target: [0, 1.4, 0] }, inpage: { pos: [0, 2.2, 8.4], target: [0, 1.6, 0] },
    controls: [
      { type: 'slider', label: 'انزع البتلات', min: 0, max: 10, step: 1, value: 0, fmt: v => v ? (v * 10) + '٪' : 'كاملة', on: v => setPetals(v / 10) },
      { type: 'button', label: 'مقطع في المبيض', toggle: true, on: on => { setSection(on); api.refreshParts(); } },
      { type: 'button', label: 'شغّل التلقيح', on: () => { bt = 0; api.toast('تحصل الملقّحات على الرحيق، فتلتصق حبوب اللقاح بجسمها، ثم تسقط على الميسم فيحدث التلقيح، وتنتقل الخلايا الجنسية الذكرية عبر القلم إلى المبيض.'); } }
    ],
    quiz: [
      { q: 'المس الجزء الذي تنتج فيه حبوب اللقاح.', a: 'anther' },
      { q: 'المس الجزء الذي تنتج فيه الخلايا الجنسية الأنثوية.', a: 'ovary' },
      { q: 'المس الجزء الذي تسقط عليه حبوب اللقاح في أعلى الكربلة.', a: 'stigma' },
      { q: 'أيّ أجزاء الزهرة يجذب الملقّحات بألوانه الزاهية؟', a: 'petal' },
      { q: 'المس الجزء الذي يحمل المتك.', a: 'filament' }
    ]
  };
}

/* ───────────── ص ٧٤: دورة حياة النبات الزهري ───────────── */
export function cycleModel(api) {
  const root = new THREE.Group();
  const base = mesh(new THREE.CylinderGeometry(6, 6, .25, 96), mat('#f8f1cf', { roughness: .9 }), [0, -0.15, 0]); base.scale.z = .62; root.add(base);
  const st = [V(0.6, 0, -2.6), V(3.8, 0, 0.3), V(1.4, 0, 2.6), V(-2.2, 0, 2.4), V(-4.0, 0, -0.6)];
  // سهم دائري
  const ringC = new THREE.CatmullRomCurve3([V(0, .1, -3.3), V(4.6, .1, -1.6), V(4.4, .1, 1.8), V(0, .1, 3.4), V(-4.6, .1, 1.6), V(-4.7, .1, -1.8)], true);
  root.add(mesh(new THREE.TubeGeometry(ringC, 160, .09, 8, true), mat('#7cc24a')));
  const heads = []; for (let i = 0; i < 6; i++) { const t = (i + .5) / 6; const h = mesh(new THREE.ConeGeometry(.28, .6, 16), mat('#7cc24a')); h.position.copy(ringC.getPointAt(t)); h.quaternion.setFromUnitVectors(V(0, 1, 0), ringC.getTangentAt(t)); root.add(h); heads.push(h); }
  const lilyM = mat('#e05bb0', { side: 2, roughness: .5 }), stemM = mat('#4f9e3a'), leafM = mat('#3f8f32', { side: 2 });
  function lily(s) { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const pg = new THREE.PlaneGeometry(.5, 1.6, 4, 8); const p = pg.attributes.position; for (let k = 0; k < p.count; k++) { const y = p.getY(k) + .8; p.setXYZ(k, p.getX(k) * Math.sin(clamp(y / 1.6) * Math.PI), y, -.25 * y * y); } pg.computeVertexNormals(); const pv = new THREE.Group(); pv.rotation.y = i / 6 * 7; const pm = new THREE.Mesh(pg, lilyM); pm.rotation.x = -.9; pv.add(pm); g.add(pv); } for (let i = 0; i < 6; i++) { const a = i / 6 * 7; g.add(tube([[0, 0, 0], [Math.cos(a) * .2, .6, Math.sin(a) * .2], [Math.cos(a) * .45, 1.0, Math.sin(a) * .45]], .02, mat('#f2d14a'), 8, 4)); } g.scale.setScalar(s); return g; }
  function bell(s, cut) { const g = new THREE.Group(); const pr = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pr.push(new THREE.Vector2(.25 + .55 * Math.pow(t, 1.5) + (t > .85 ? (t - .85) * 2 : 0), t * 1.6)); } g.add(new THREE.Mesh(new THREE.LatheGeometry(pr, 40, cut ? Math.PI * .25 : 0, cut ? Math.PI * 1.5 : Math.PI * 2), mat('#9b4fc7', { side: 2, roughness: .5 }))); const car = new THREE.Group(); car.add(mesh(new THREE.SphereGeometry(.22, 16, 12), mat('#4caf50'), [0, .25, 0], null, [1, 1.3, 1]), mesh(new THREE.CylinderGeometry(.05, .05, 1.2, 10), mat('#4caf50'), [0, .9, 0]), mesh(new THREE.SphereGeometry(.1, 12, 8), mat('#c9e04a'), [0, 1.52, 0])); g.add(car); const stm = []; for (let i = 0; i < 5; i++) { const a = i / 5 * 7; const f = tube([[Math.cos(a) * .15, .2, Math.sin(a) * .15], [Math.cos(a) * .3, .9, Math.sin(a) * .3], [Math.cos(a) * .38, 1.35, Math.sin(a) * .38]], .025, mat('#9ac84a'), 10, 4); g.add(f); const an = mesh(new THREE.CapsuleGeometry(.05, .12, 4, 8), mat('#e2d12a'), [Math.cos(a) * .38, 1.42, Math.sin(a) * .38]); g.add(an); stm.push(f, an); } g.userData = { car, stm }; g.scale.setScalar(s); return g; }
  // ١ نبات مكتمل النمو
  const s1 = new THREE.Group(); s1.position.copy(st[0]); root.add(s1);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 7, h = 2.1 + (i % 3) * .3; s1.add(tube([[0, 0, 0], [Math.cos(a) * .3, h * .6, Math.sin(a) * .3], [Math.cos(a) * .75, h, Math.sin(a) * .75]], .05, stemM, 12, 6)); const L = lily(.75); L.position.set(Math.cos(a) * .75, h, Math.sin(a) * .75); L.rotation.set(Math.sin(a) * .5, 0, -Math.cos(a) * .5); s1.add(L); }
  for (let i = 0; i < 5; i++) { const lf = mesh(new THREE.PlaneGeometry(.25, 1.3), leafM, [Math.cos(i) * .3, .7, Math.sin(i) * .3], [0.4, i, 0.6]); s1.add(lf); }
  // ٢ زهرة وسداة
  const s2 = bell(1.1, false); s2.position.copy(st[1]); root.add(s2);
  s2.add(mesh(new THREE.CylinderGeometry(.06, .06, 1, 8), stemM, [0, -.5, 0]));
  // ٣ ملقحات وزهرة أخرى (كربلة)
  const s3 = bell(1.1, true); s3.position.copy(st[2]); root.add(s3); s3.add(mesh(new THREE.CylinderGeometry(.06, .06, 1, 8), stemM, [0, -.5, 0]));
  const bee = new THREE.Group(); bee.add(mesh(new THREE.SphereGeometry(.22, 16, 12), mat('#222'), null, null, [1, .8, 1.6]), mesh(new THREE.TorusGeometry(.2, .04, 6, 16), mat('#f2b51c'), [0, 0, .05], null, [1, .8, 1]), mesh(new THREE.CircleGeometry(.22, 12), glass('#e8f6ff', .7, { side: 2 }), [.2, .2, 0], [0, 0, .6]), mesh(new THREE.CircleGeometry(.22, 12), glass('#e8f6ff', .7, { side: 2 }), [-.2, .2, 0], [0, 0, -.6])); root.add(bee);
  const pollen = new Flow(root, '#ffd400', .05, 40); pollen.rate = 5;
  // ٤ البذرة والثمرة
  const s4 = new THREE.Group(); s4.position.copy(st[3]); root.add(s4);
  const fruit = mesh(new THREE.SphereGeometry(.7, 32, 24, 0, Math.PI * 1.6), mat('#c9a35a', { side: 2 }), [0, .8, 0], [0, 1.9, 0], [1, 1.25, 1]); s4.add(fruit);
  const seed = mesh(new THREE.SphereGeometry(.42, 32, 24), mat('#7cc24a', { roughness: .4 }), [0, .8, 0], null, [1, 1.25, .9]); s4.add(seed);
  // ٥ النبتة الصغيرة
  const s5 = new THREE.Group(); s5.position.copy(st[4]); root.add(s5);
  const soil = mesh(new THREE.CylinderGeometry(1.1, 1.1, .7, 32), mat('#fff', { map: noiseTexture('#7a5b3e', '#5d4129', 3000) }), [0, .35, 0]); s5.add(soil);
  const sprout = new THREE.Group(); s5.add(sprout);
  sprout.add(tube([[0, .4, 0], [0, 1.2, 0], [.05, 2.0, 0]], .05, stemM, 12, 6));
  for (const s of [-1, 1]) { const lf = mesh(new THREE.SphereGeometry(.3, 16, 12), mat('#5fb84a'), [s * .32, 1.9, 0], null, [1.4, .2, .7]); lf.rotation.z = s * .4; sprout.add(lf); }
  const sroots = new THREE.Group(); s5.add(sroots); for (let i = 0; i < 5; i++) { const a = i / 5 * 7; sroots.add(tube([[0, .4, 0], [Math.cos(a) * .2, .1, Math.sin(a) * .2], [Math.cos(a) * .4, -.3, Math.sin(a) * .4]], .02, mat('#cdb48a'), 8, 4)); }
  const steps = [
    { t: 'نبات مكتمل النمو', d: 'النباتات الزهرية هي المجموعة الوحيدة التي تنتج الأزهار والبذور والثمار. فالأزهار هي أعضاء التكاثر التي تنتج الخلايا الجنسية الذكرية (حبوب اللقاح) والخلايا الجنسية الأنثوية.', at: 0 },
    { t: 'السداة وحبوب اللقاح', d: 'السداة هي الجزء الذكري في الزهرة، وينتهي بالمتك، وفيه تنتج حبوب اللقاح.', at: 1 },
    { t: 'الملقّحات والتلقيح', d: 'تبدأ عملية الإخصاب في النباتات المغطاة البذور بعملية التلقيح؛ حيث تنتقل حبوب اللقاح من السداة إلى الكربلة. وتنقل حبوب اللقاح بوسائل تلقيح (ملقّحات) مختلفة، منها النحل والطيور والحيوانات.', at: 2 },
    { t: 'الكربلة والمبيض', d: 'بحدوث التلقيح تنتقل الخلايا الجنسية الذكرية الموجودة في الكربلة عبر القلم إلى المبيض؛ لتتحد مع الخلايا الجنسية الأنثوية، مما يؤدي إلى حدوث الإخصاب.', at: 2 },
    { t: 'البذرة والثمرة', d: 'النباتات الزهرية تنتج الأزهار والبذور والثمار.', at: 3 },
    { t: 'النبتة الصغيرة', d: 'تنمو البذرة فتصبح نبتة صغيرة، ثم نباتًا مكتمل النمو، وتتكرر الدورة.', at: 4 }
  ];
  let step = -1, cross = true, tt = 0;
  const camFor = i => { const p = st[i]; return [[p.x * 1.4, 4.2, p.z * 1.4 + 5.5], [p.x, 1.0, p.z]]; };
  function setStep(i) { step = i; tt = 0; const [cp, ct] = camFor(steps[i].at); api.flyTo(cp, ct); }
  const parts = [
    { id: 'plant', name: 'نبات مكتمل النمو', info: steps[0].d, objs: s1.children, at: anchor(s1, [0, 3.0, 0]) },
    { id: 'stamen', name: 'السداة', info: steps[1].d, objs: s2.userData.stm, at: anchor(s2, [.5, 1.6, .2]) },
    { id: 'poll', name: 'ملقّحات', info: 'تحصل الملقّحات على بعض الأشياء من النبات، ومنها الرحيق، وهو سائل حلو المذاق تنتجه الأزهار لجذب هذه الملقّحات. فتلتصق حبوب اللقاح بجسم النحلة، فإذا انتقلت النحلة إلى زهرة أخرى سقطت حبوب اللقاح الملتصقة بجسمها في كرابل الزهرة الأخرى، فيحدث التلقيح.', objs: bee.children, at: anchor(bee, [0, .4, 0]) },
    { id: 'carpel', name: 'الكربلة', info: 'الكربلة هي الجزء الأنثوي في الزهرة، ويتكوّن من الميسم والقلم والمبيض.', objs: s3.userData.car.children.slice(1), at: anchor(s3, [0, 1.7, .2]) },
    { id: 'ovary', name: 'المبيض', info: 'تنتج الخلايا الجنسية الأنثوية في المبيض.', objs: [s3.userData.car.children[0]], at: anchor(s3, [0.25, .3, .3]) },
    { id: 'seed', name: 'البذرة والثمرة', info: steps[4].d, objs: [fruit, seed], at: anchor(s4, [0, 1.8, 0]) },
    { id: 'sprout', name: 'النبتة الصغيرة', info: steps[5].d, objs: [...sprout.children, soil], at: anchor(s5, [0, 2.4, 0]) }
  ];
  return {
    root, parts,
    update(dt, t) {
      tt += dt; pollen.update(dt);
      const from = cross ? s2.position.clone().add(V(0, 1.7, 0)) : s3.position.clone().add(V(.3, 1.7, 0)), to = s3.position.clone().add(V(0, 1.75, 0));
      const k = (t * .25) % 1; const bp = from.clone().lerp(to, ease(k)).add(V(0, Math.sin(k * Math.PI) * 1.2, 0)); bee.position.copy(bp); bee.lookAt(to); bee.children[2].rotation.y = bee.children[3].rotation.y = Math.sin(t * 50) * .5;
      pollen.paths = [{ c: curve([from, from.clone().lerp(to, .5).add(V(0, 1.2, 0)), to]), speed: .5, weight: 1 }];
      pollen.on = step === -1 || step === 1 || step === 2;
      const g = .85 + .15 * Math.sin(t * 1.2); sprout.scale.setScalar(g); seed.rotation.y += dt * .4;
      heads.forEach((h, i) => { h.material.emissive.set('#3a8a10'); h.material.emissiveIntensity = .3 + .3 * Math.sin(t * 3 - i); });
    },
    cam: { pos: [0, 8.5, 9.5], target: [0, 0.6, 0] }, inpage: { pos: [0, 7.2, 8.8], target: [0, 0.4, 0] },
    controls: [
      { type: 'steps', steps, value: -1, on: setStep },
      { type: 'seg', label: 'نوع التلقيح', options: ['تلقيح خلطي', 'تلقيح ذاتي'], value: 0, on: i => { cross = !i; api.toast(i ? 'التلقيح الذاتي يحدث عندما تلقّح الأجزاء الذكرية في الزهرة الأجزاء الأنثوية فيها.' : 'التلقيح الخلطي يحدث عندما تنتقل حبوب اللقاح من زهرة نبات لتلقّح زهرة نبات آخر.'); } },
      { type: 'button', label: 'منظر الدورة كاملة', on: () => api.flyTo([0, 8.5, 9.5], [0, 0.6, 0]) }
    ],
    quiz: [
      { q: 'المس الملقّحات التي تنقل حبوب اللقاح.', a: 'poll' },
      { q: 'المس البذرة والثمرة.', a: 'seed' },
      { q: 'ما المرحلة التي تأتي بعد البذرة؟ المسها.', a: 'sprout' },
      { q: 'المس الجزء الذي تنتج فيه حبوب اللقاح (الجزء الذكري).', a: 'stamen' }
    ]
  };
}
