// مجسّمات الصف الثالث (٢): الأنظمة البيئية وصحة الإنسان
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, proxy, noiseTexture, tree, pine, cloud, arrowTube, house } from './kit.js';
import { emo, txt, setTxt } from './models6a.js';
import { node } from './m4a.js';
const TAU = Math.PI * 2;
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

/* ═════════ ١) نظام بيئي في بركة (ص ١٠٠–١٠٢) ═════════ */
export function pondModel(api) {
  const root = new THREE.Group(); let mode = 0, t = 0;
  const ground = mesh(new THREE.CylinderGeometry(4.2, 4.4, .6, 64), mat('#8a6a3e', { map: noiseTexture('#8f6d40', '#6a4c28', 3500) }), [0, -.6, 0]); root.add(ground);
  const water = mesh(new THREE.CylinderGeometry(2.6, 2.6, .1, 64), mat('#3f8fc8', { roughness: .15, metalness: .1, transparent: true, opacity: .85 }), [.3, -.25, .2]); water.scale.z = .75; root.add(water);
  const reeds = new THREE.Group(); for (let i = 0; i < 40; i++) { const a = Math.random() * TAU, r = 3.1 + Math.random() * .8; const h = .6 + Math.random() * .7; reeds.add(mesh(new THREE.CylinderGeometry(.015, .025, h, 4), mat('#8aa040'), [Math.cos(a) * r, -.3 + h / 2, Math.sin(a) * r * .8])); } root.add(reeds);
  const pads = new THREE.Group(); for (const [x, z] of [[.9, .6], [1.5, -.2], [-.2, .9], [1.1, 1.2]]) { pads.add(mesh(new THREE.CircleGeometry(.32, 20, .3, TAU - .5), mat('#4a9a3a', { side: THREE.DoubleSide }), [x, -.18, z], [-Math.PI / 2, 0, 0])); } pads.add(mesh(new THREE.SphereGeometry(.12, 12, 8), mat('#fff', { emissive: '#ffe0f0', emissiveIntensity: .3 }), [.9, -.1, .6])); root.add(pads);
  const rocks = new THREE.Group(); for (const [x, z, s] of [[-2.4, -1.2, .4], [-2, -1.6, .3], [2.8, -1.4, .35]]) rocks.add(mesh(new THREE.DodecahedronGeometry(s, 0), mat('#8a8a8a', { flatShading: true }), [x, -.2, z])); root.add(rocks);
  const sun = node(root, '☀️', [-3, 3, -1], 1.2, null);
  const B = [['duck', '🦆', 'البطّة', [-1.8, .2, .3]], ['frog', '🐸', 'الضفدع', [1.5, 0, -.2]], ['turtle', '🐢', 'السلحفاة', [2.9, 0, .6]], ['fish', '🐟', 'الأسماك', [.2, -.15, 0]], ['worm', '🪱', 'الديدان', [-2.6, -.1, 1.4]], ['bug', '🐛', 'الحشرات', [-1, -.05, 2.3]]];
  const bio = B.map(([id, e, n, p]) => ({ id, n, nd: node(root, e === '🪱' ? '🐛' : e, p, .75) }));
  const abioInfo = { water: 'الماء: عاملٌ لاحيويّ؛ يحتاجُ إليه الضفدعُ ليتنفّسَ ويضعَ بيضَه، وهو موطنٌ للأسماك.', rocks: 'الصخورُ والتربة: عواملُ لاحيويةٌ في النظامِ البيئيّ.', sun: 'ضوءُ الشمسِ والمناخ: عواملُ لاحيويةٌ؛ تعتمدُ عليها النباتاتُ لصنعِ غذائها.', ground: 'التربة: عاملٌ لاحيويّ، تعيشُ فيها الديدانُ وتنمو فيها النباتات.' };
  const tagB = txt('عوامل حيوية', .32, '#1a6a2a', 'rgba(220,255,220,.95)'); tagB.position.set(-2, 2.4, 0); root.add(tagB); const tagA = txt('عوامل لاحيوية', .32, '#1a3a7a', 'rgba(220,235,255,.95)'); tagA.position.set(2, 2.4, 0); root.add(tagA);
  function apply() {
    const showB = mode !== 2, showA = mode !== 1; bio.forEach(b => b.nd.g.scale.setScalar(showB ? 1 : .35)); pads.visible = reeds.visible = showB || mode === 0;
    water.material.emissive = new THREE.Color(mode === 2 ? '#2266aa' : '#000'); water.material.emissiveIntensity = mode === 2 ? .5 : 0; rocks.children.forEach(r => { r.material.emissive = new THREE.Color(mode === 2 ? '#3355aa' : '#000'); r.material.emissiveIntensity = mode === 2 ? .5 : 0; });
    sun.g.scale.setScalar(showA ? 1 : .4); tagB.visible = mode !== 2; tagA.visible = mode !== 1;
  }
  const parts = [
    ...bio.map(b => ({ id: b.id, name: b.n + ' (عامل حيوي)', info: b.n + ': مخلوقٌ حيٌّ في نظامِ البركة؛ ' + (b.id === 'frog' ? 'جماعةُ الضفادعِ جزءٌ من مجتمعِ البركة، وتحتاجُ إلى الماءِ لتتنفّسَ وتضعَ بيضَها.' : 'وجميعُ أفرادِ نوعِه في البركةِ تكوّنُ جماعةً حيوية.'), objs: [b.nd.p], at: anchor(b.nd.g, [0, .5, 0]) })),
    { id: 'lily', name: 'زنابق الماء (عامل حيوي)', info: 'نباتاتٌ في البركة؛ جميعُ زنابقِ الماءِ فيها تكوّنُ جماعةً حيوية.', objs: pads.children, at: anchor(pads, [1, .1, .7]) },
    { id: 'water', name: 'الماء (عامل لاحيوي)', info: abioInfo.water, objs: [water], at: anchor(root, [-.6, -.1, -.4]) },
    { id: 'rocks', name: 'الصخور (عامل لاحيوي)', info: abioInfo.rocks, objs: rocks.children, at: anchor(rocks, [-2.2, .2, -1.4]) },
    { id: 'sun', name: 'ضوء الشمس (عامل لاحيوي)', info: abioInfo.sun, objs: [sun.p], at: anchor(sun.g, [0, .7, 0]) },
    { id: 'soil', name: 'التربة (عامل لاحيوي)', info: abioInfo.ground, objs: [ground], at: anchor(root, [-3, -.3, 1.6]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; bio[3].nd.g.position.x = .2 + Math.sin(t * .8) * 1.2; bio[0].nd.g.position.y = .2 + Math.sin(t * 2) * .05; bio[1].nd.g.position.y = Math.abs(Math.sin(t * 2.2)) * .25; },
    cam: { pos: [0, 4.4, 7.6], target: [0, 0, 0] }, inpage: { pos: [0, 4.4, 7.6], target: [0, 0, 0] },
    controls: [{ type: 'seg', label: 'أبرز', options: ['الكل', 'العوامل الحيوية', 'العوامل اللاحيوية'], value: 0, on: k => { mode = k; apply(); api.toast(['النظامُ البيئيّ: تفاعلُ العواملِ الحيويةِ مع العواملِ اللاحيوية.', 'العواملُ الحيوية: جميعُ المخلوقاتِ الحيّةِ في البيئة.', 'العواملُ اللاحيوية: الماءُ والصخورُ والتربةُ والضوءُ والمناخ.'][k]); } }],
    quiz: [{ q: 'المس عاملًا لاحيويًّا يحتاجُ إليه الضفدعُ ليضعَ بيضَه.', a: 'water' }, { q: 'المس مخلوقًا حيًّا يعيشُ في التربة.', a: 'worm' }, { q: 'المس عاملًا لاحيويًّا تحتاجُ إليه النباتاتُ لصنعِ غذائها.', a: 'sun' }]
  };
}

/* ═════════ ٢) المناطق الحيوية (ص ١٠٣) ═════════ */
export function biomesModel(api) {
  const root = new THREE.Group(); let sel = 0, t = 0;
  const D = [
    { id: 'desert', n: 'الصحراء', c: '#e8c88a', temp: .95, rain: .1, soil: 'رمليةٌ جافّة', tt: 'متقلّبةٌ جدًّا', rr: 'نادر' },
    { id: 'grass', n: 'المناطق العشبية', c: '#b8d070', temp: .6, rain: .5, soil: 'خصبة', tt: 'معتدلةُ البرودةِ شتاءً، دافئةٌ إلى حارّةٍ صيفًا', rr: 'معتدل' },
    { id: 'forest', n: 'منطقة الغابات', c: '#6aa050', temp: .4, rain: .9, soil: 'خصبة', tt: 'باردةٌ إلى معتدلةٍ شتاءً، دافئةٌ صيفًا', rr: 'على مدارِ السنة' }
  ];
  const S = D.map((d, i) => {
    const g = new THREE.Group(); const a = (i - 1) * 2.15; g.position.set(Math.sin(a) * 2.6, 0, Math.cos(a) * 1.4 - .8); g.rotation.y = a * .3; root.add(g);
    const base = mesh(new THREE.CylinderGeometry(1.6, 1.7, .4, 40), mat(d.c, { map: noiseTexture(d.c, '#00000022', 1500) }), [0, -.2, 0]); g.add(base);
    if (i === 0) { for (const [x, z, s] of [[-.6, .3, .5], [.5, -.4, .6]]) { const dn = mesh(new THREE.SphereGeometry(s, 20, 10, 0, TAU, 0, Math.PI / 2), mat('#e2b870'), [x, 0, z]); dn.scale.y = .4; g.add(dn); } const cac = new THREE.Group(); const cm = mat('#3f8f4a'); cac.add(mesh(new THREE.CapsuleGeometry(.1, .7, 6, 10), cm, [0, .45, 0])); cac.add(mesh(new THREE.CapsuleGeometry(.06, .25, 6, 8), cm, [.15, .55, 0], [0, 0, -.6])); cac.add(mesh(new THREE.CapsuleGeometry(.06, .2, 6, 8), cm, [-.14, .45, 0], [0, 0, .6])); cac.position.set(.4, 0, .5); g.add(cac); node(g, '🐪', [-.5, .55, .5], .7, null); }
    if (i === 1) { for (let k = 0; k < 70; k++) { const r = Math.random() * 1.5, a2 = Math.random() * TAU; g.add(mesh(new THREE.ConeGeometry(.04, .3, 4), mat('#8ab040'), [Math.cos(a2) * r, .15, Math.sin(a2) * r])); } g.add(tree(.6, '#7a9a3a').translateX(.9)); node(g, '🐃', [-.3, .5, .4], .8, null); }
    if (i === 2) { const cs = ['#d8742a', '#e8a83a', '#c84a2a', '#6a9a3a', '#e8c23a']; for (let k = 0; k < 9; k++) { const a2 = k / 9 * TAU; g.add(tree(.75 + Math.random() * .3, cs[k % 5]).translateX(Math.cos(a2) * 1.1).translateZ(Math.sin(a2) * 1.1)); } node(g, '🦌', [0, .5, .3], .8, null); }
    return { d, g, base };
  });
  const bars = new THREE.Group(); bars.position.set(0, 1.9, -2.2); root.add(bars);
  const tBar = mesh(new THREE.BoxGeometry(.4, 1, .4), mat('#e8584a'), [-.6, 0, 0]); const rBar = mesh(new THREE.BoxGeometry(.4, 1, .4), mat('#3a8ad8'), [.6, 0, 0]); bars.add(tBar, rBar);
  const tl = txt('الحرارة', .24, '#a02a1a'); tl.position.set(-.6, -.35, .3); const rl = txt('الأمطار', .24, '#1a4a8a'); rl.position.set(.6, -.35, .3); bars.add(tl, rl);
  const tgt = { t: D[0].temp, r: D[0].rain };
  function apply() { S.forEach((s, i) => s.g.scale.setScalar(i === sel ? 1.15 : .85)); tgt.t = D[sel].temp; tgt.r = D[sel].rain; }
  apply();
  const parts = S.map(s => ({ id: s.d.id, name: s.d.n, info: `درجةُ الحرارة: ${s.d.tt}. سقوطُ الأمطار: ${s.d.rr}. التربة: ${s.d.soil}.`, objs: [s.base, ...s.g.children.filter(c => c.isMesh)], at: anchor(s.g, [0, 1.3, 0]) }));
  return {
    root, parts,
    update(dt) { t += dt; const k = Math.min(1, dt * 3); const ht = lerp(tBar.scale.y, tgt.t * 1.6, k), hr = lerp(rBar.scale.y, tgt.r * 1.6, k); tBar.scale.y = Math.max(.05, ht); tBar.position.y = tBar.scale.y / 2; rBar.scale.y = Math.max(.05, hr); rBar.position.y = rBar.scale.y / 2; },
    cam: { pos: [0, 3.6, 7.6], target: [0, .2, -.4] }, inpage: { pos: [0, 3.6, 7.8], target: [0, .2, -.4] },
    controls: [{ type: 'seg', label: 'المنطقة الحيوية', options: D.map(d => d.n), value: 0, on: k => { sel = k; apply(); api.toast(parts[k].name + ': ' + parts[k].info); } }],
    legend: [['#e8584a', 'متوسط درجة الحرارة'], ['#3a8ad8', 'متوسط هطول الأمطار']],
    quiz: [{ q: 'المس المنطقةَ الحيويةَ التي يقعُ فيها معظمُ الوطنِ العربيّ.', a: 'desert' }, { q: 'المس المنطقةَ التي فيها أشجارٌ أكثر.', a: 'forest' }]
  };
}

/* ═════════ ٣) الأدوار في النظام البيئي (ص ١١٠–١١١) ═════════ */
export function rolesModel(api) {
  const root = new THREE.Group(); let mode = 0, t = 0;
  const rows = [['المنتجات', '#7cbf4a', -1.4], ['المستهلكات', '#e8a83a', .2], ['المحلّلات', '#8a6a4a', 1.8]];
  rows.forEach(([n, c, z]) => { const p = mesh(new THREE.BoxGeometry(6.4, .12, 1.3), mat(c, { roughness: .8 }), [0, -1, z]); root.add(p); const l = txt(n, .3, '#222'); l.position.set(-3.6, -.7, z); root.add(l); });
  const sun = node(root, '☀️', [0, 2.6, -2.6], 1.2, null);
  const E = [
    ['grass', '🌿', 'الأعشاب', 'prod', [-2, -.55, -1.4]], ['tree', '🌳', 'الأشجار', 'prod', [0, -.45, -1.4]], ['algae', '🌱', 'الطحالب', 'prod', [2, -.55, -1.4]],
    ['deer', '🦌', 'الغزال', 'herb', [-2.4, -.45, .2]], ['rabbit', '🐇', 'الأرنب', 'herb', [-1.3, -.5, .2]], ['raccoon', '🦝', 'الراكون', 'omni', [-.1, -.5, .2]], ['bear', '🐻', 'الدب', 'omni', [1, -.45, .2]], ['tiger', '🐅', 'النمر', 'carn', [2.2, -.45, .2]],
    ['worm', '🐛', 'الديدان', 'dec', [-1.8, -.55, 1.8]], ['mush', '🍄', 'الفطريات', 'dec', [0, -.55, 1.8]], ['bac', '🦠', 'البكتيريا', 'dec', [1.8, -.55, 1.8]]
  ];
  const nds = E.map(([id, e, n, k, p]) => ({ id, n, k, nd: node(root, e, p, .8) }));
  const rays = new Flow(root, '#ffd23a', .05, 30); [[-2, -.3, -1.4], [0, -.2, -1.4], [2, -.3, -1.4]].forEach(p => rays.addPath(curve([[0, 2.4, -2.6], [p[0] * .6, 1, -2], p]), .5)); rays.rate = 6;
  const KI = { prod: 'منتج: يصنعُ غذاءه بنفسِه مستخدمًا طاقةَ الشمس.', herb: 'مستهلك – آكلُ أعشاب: يأكلُ المنتجاتِ فقط.', omni: 'مستهلك – قارت: يتغذّى على المنتجاتِ والمستهلكات.', carn: 'مستهلك – آكلُ لحوم: يتغذّى على آكلاتِ الأعشابِ والقوارت.', dec: 'محلّل: يحلّلُ الموادَّ الميّتةَ ويعيدُها إلى النظامِ البيئيِّ موادَّ مغذّية.' };
  const filters = [null, 'prod', 'herb', 'omni', 'carn', 'dec'];
  function apply() { const f = filters[mode]; nds.forEach(x => x.nd.g.scale.setScalar(!f || x.k === f ? (f ? 1.3 : 1) : .55)); }
  const parts = [...nds.map(x => ({ id: x.id, name: x.n, info: KI[x.k], objs: [x.nd.p], at: anchor(x.nd.g, [0, .5, 0]) })), { id: 'sun', name: 'الشمس', info: 'مصدرُ الطاقةِ في النظامِ البيئيّ؛ تلتقطُ المنتجاتُ طاقتَها لتصنعَ الغذاء.', objs: [sun.p], at: anchor(sun.g, [0, .7, 0]) }];
  return {
    root, parts,
    update(dt) { t += dt; rays.update(dt); nds.forEach((x, i) => { if (x.k !== 'prod') x.nd.g.position.y = -.5 + Math.abs(Math.sin(t * 2 + i)) * .08; }); },
    cam: { pos: [0, 4.2, 7.4], target: [0, -.4, .2] }, inpage: { pos: [0, 4.4, 7.4], target: [0, -.4, .2] },
    controls: [{ type: 'seg', label: 'أبرز', options: ['الكل', 'المنتجات', 'آكلات الأعشاب', 'القوارت', 'آكلات اللحوم', 'المحلّلات'], value: 0, on: k => { mode = k; apply(); if (k) api.toast(KI[filters[k]]); } }],
    legend: [['#ffd23a', 'طاقة الشمس']],
    quiz: [{ q: 'المس حيوانًا قارتًا.', a: 'raccoon' }, { q: 'المس آكلَ لحوم.', a: 'tiger' }, { q: 'المس محلّلًا ينمو على الطعامِ الرطب.', a: 'mush' }, { q: 'المس المنتجاتِ الرئيسةَ في البحيرات.', a: 'algae' }]
  };
}

/* ═════════ ٤) السلسلة الغذائية على اليابسة وفي البركة (ص ١١٢–١١٣) ═════════ */
export function chainModel(api) {
  const root = new THREE.Group(); let v = 0, step = -1, t = 0;
  const SETS = [
    { n: 'على اليابسة', c: '#c8a870', items: [['☀️', 'الشمس', 'مصدرُ الطاقةِ في النظامِ البيئيّ.'], ['🌿', 'نبات الشوك (منتج)', 'يصنعُ غذاءه بالبناءِ الضوئيّ ويخزّنُ طاقةَ الشمس.'], ['🐛', 'اليرقة (مستهلك)', 'تأكلُ أوراقَ النبات فتنتقلُ إليها الطاقة.'], ['🦗', 'السرعوف (مستهلك)', 'حشرةٌ مفترسةٌ تتغذّى على اليرقة.'], ['🦎', 'السحلية (مستهلك)', 'تتغذّى على السرعوف.'], ['🦉', 'البومة (مستهلك)', 'تصطادُ السحلية، وهي في نهايةِ السلسلة.'], ['🍄', 'المحلّلات', 'عندما تموتُ المستهلكاتُ تحلّلُ المحلّلاتُ أنسجتَها إلى موادَّ أساسيةٍ تستعملُها المخلوقاتُ من جديد.']] },
    { n: 'في البركة', c: '#5aa0d0', items: [['☀️', 'الشمس', 'مصدرُ الطاقة.'], ['🌱', 'الطحالب (منتج)', 'تلتقطُ طاقةَ الشمسِ بالبناءِ الضوئيِّ وتخزّنُها في الخلايا على شكلِ سكّر.'], ['🦟', 'الذبابة المائية (آكل أعشاب)', 'تتغذّى على الطحالب، وتستخدمُ الأكسجينَ لإطلاقِ الطاقةِ المخزونة.'], ['🐟', 'سمكة الشمس (آكل لحوم)', 'تقفزُ لالتقاطِ الحشرات، فتستفيدُ من الطاقةِ المخزونةِ في أجسامِها.'], ['🦢', 'مالك الحزين (آكل لحوم)', 'طائرٌ يصطادُ الأسماك؛ فيصلُ إليه جزءٌ من الطاقةِ الشمسية.'], null, ['🦠', 'المحلّلات', 'تحلّلُ بقايا المخلوقاتِ الميّتةِ في قاعِ البركة.']] }
  ];
  const base = mesh(new THREE.CylinderGeometry(4.2, 4.2, .2, 56), mat('#c8a870'), [0, -1.6, 0]); root.add(base);
  const G = new THREE.Group(); root.add(G); let N = [], flows = [];
  const pos = [[-3.3, 2, -.5], [-2.4, -.9, .6], [-1, -.3, 1.2], [.4, .5, .9], [1.8, 1.1, .4], [3, 1.9, -.2], [.6, -1.1, 2.3]];
  function build() {
    G.clear(); N = []; flows = []; const S = SETS[v]; base.material.color.set(S.c);
    S.items.forEach((it, i) => { if (!it) { N.push(null); return; } N.push(node(G, it[0], pos[i], i === 0 ? 1.1 : .9, i === 0 ? null : 'rgba(255,255,255,.88)')); });
    const ids = S.items.map((x, i) => x ? i : -1).filter(i => i >= 0 && i < 6);
    for (let k = 0; k < ids.length - 1; k++) { const A = N[ids[k]].g.position, B = N[ids[k + 1]].g.position; const mid = A.clone().add(B).multiplyScalar(.5).add(V(0, .5, .3)); const ar = arrowTube([A.toArray(), mid.toArray(), B.clone().lerp(A, .22).toArray()], .04, '#f2a22a', .25); G.add(ar); const f = new Flow(G, '#ffd23a', .06, 18); f.addPath(ar.userData.curve, .5); flows.push({ ar, f }); }
    const last = N[ids[ids.length - 1]].g.position, dec = N[6].g.position; const ar = arrowTube([last.toArray(), last.clone().add(dec).multiplyScalar(.5).add(V(.5, -.2, .5)).toArray(), dec.clone().lerp(last, .2).toArray()], .035, '#8a6a4a', .22); G.add(ar); const f = new Flow(G, '#c0a080', .05, 12); f.addPath(ar.userData.curve, .5); flows.push({ ar, f });
    api.refreshParts && api.refreshParts();
  }
  build();
  function hi() { flows.forEach((x, i) => { x.ar.visible = step < 0 || i === step; x.f.rate = (step < 0 || i === step) ? 3 : 0; }); }
  const parts = []; for (let i = 0; i < 7; i++) parts.push({ id: 'n' + i, get name() { const it = SETS[v].items[i]; return it ? it[1] : ''; }, get info() { const it = SETS[v].items[i]; return it ? it[2] : ''; }, get objs() { return N[i] ? [N[i].p] : []; }, at: new THREE.Object3D(), hidden: () => !N[i] });
  parts.forEach((p, i) => { root.add(p.at); });
  return {
    root, parts,
    update(dt) { t += dt; flows.forEach(x => x.f.update(dt)); parts.forEach((p, i) => { if (N[i]) p.at.position.copy(N[i].g.position).add(V(0, .6, 0)); }); if (N[2]) N[2].g.position.y = pos[2][1] + Math.abs(Math.sin(t * 3)) * .1; },
    cam: { pos: [0, 2.2, 8.6], target: [0, .1, 0] }, inpage: { pos: [0, 2, 8.8], target: [0, .1, 0] },
    controls: [
      { type: 'seg', label: 'السلسلة', options: SETS.map(s => s.n), value: 0, on: k => { v = k; step = -1; build(); hi(); } },
      { type: 'steps', value: -1, steps: ['الشمس ← المنتج', 'المنتج ← المستهلك الأول', 'المستهلك الأول ← الثاني', 'المستهلك الثاني ← الثالث', 'المستهلك الثالث ← الرابع', 'المستهلكات ← المحلّلات'].map((s, i) => ({ t: (i + 1) + '- ' + s, d: 'تنتقلُ الطاقةُ في اتّجاهِ السهمِ من مخلوقٍ إلى آخر.' })), on: i => { step = i; hi(); } }
    ],
    legend: [['#ffd23a', 'انتقال الطاقة']],
    quiz: [{ q: 'المس المنتجَ في السلسلة.', a: 'n1' }, { q: 'المس المخلوقَ الذي يحلّلُ بقايا المخلوقاتِ الميّتة.', a: 'n6' }, { q: 'المس مصدرَ الطاقةِ في النظامِ البيئيّ.', a: 'n0' }]
  };
}

/* ═════════ ٥) كيف يغيّر الناس النظام البيئي (ص ١٢٤–١٢٥) ═════════ */
export function ecoModel(api) {
  const root = new THREE.Group(); let cut = false, poll = false, plant = false, t = 0;
  const ground = mesh(new THREE.BoxGeometry(8, .3, 4.4), mat('#7aa04a', { map: noiseTexture('#7fa64e', '#5f8a3a', 3000) }), [0, -1.2, 0]); root.add(ground);
  const forest = new THREE.Group(); root.add(forest); const trees = [], stumps = [];
  for (let i = 0; i < 14; i++) { const x = -3.6 + (i % 7) * .55, z = -1.4 + Math.floor(i / 7) * .9; const tr = tree(.9 + Math.random() * .3); tr.position.set(x, -1.05, z); forest.add(tr); trees.push(tr); const st = mesh(new THREE.CylinderGeometry(.08, .1, .12, 10), mat('#a0703a'), [x, -1, z]); st.visible = false; forest.add(st); stumps.push(st); }
  const animals = [node(root, '🦌', [-2.4, -.5, 1.3], .7), node(root, '🐿️', [-1.4, -.6, 1.4], .55), node(root, '🦉', [-3, .6, -1], .55)];
  const factory = new THREE.Group(); factory.add(mesh(new THREE.BoxGeometry(1.4, .8, 1), mat('#9a9aa8'), [0, .4, 0])); const chim = mesh(new THREE.CylinderGeometry(.12, .15, 1.2, 12), mat('#7a6a6a'), [.4, 1.2, 0]); factory.add(chim); factory.position.set(2.4, -1.05, -1); root.add(factory);
  const houses = new THREE.Group(); for (let i = 0; i < 3; i++) { const h = house(.6); h.position.set(1 + i * .8, -1.05, .9); houses.add(h); } root.add(houses);
  const smoke = new Flow(root, '#555', .12, 40); smoke.addPath(curve([[2.8, .9, -1], [3, 1.8, -1.2], [2.6, 2.8, -1.6], [1.8, 3.4, -2]]), .4); smoke.rate = 0;
  const trash = new THREE.Group(); for (let i = 0; i < 14; i++) trash.add(mesh(new THREE.BoxGeometry(.12, .06, .08), mat(['#e84a4a', '#4aa0e8', '#f2f2f2', '#e8c84a'][i % 4]), [-.8 + Math.random() * 1.8, -1.02, .5 + Math.random() * 1.4], [0, Math.random() * 3, 0])); trash.visible = false; root.add(trash);
  const seedl = new THREE.Group(); for (let i = 0; i < 8; i++) { const s = tree(.35, '#5ac83a'); s.position.set(-3.4 + (i % 4) * .6, -1.05, -1.4 + Math.floor(i / 4) * .9); seedl.add(s); } seedl.visible = false; root.add(seedl);
  const sky = txt('', .3, '#333'); sky.position.set(0, 2.6, 0); root.add(sky);
  function apply() {
    trees.forEach((tr, i) => tr.visible = !cut); stumps.forEach(s => s.visible = cut); seedl.visible = cut && plant; animals.forEach(a => a.g.visible = !cut || plant);
    smoke.rate = poll ? 14 : 0; trash.visible = poll && !plant;
    setTxt(sky, cut && !plant ? 'إزالةُ الغاباتِ تدمّرُ مواطنَ المخلوقاتِ ومصادرَ غذائها' : poll ? 'التلوّث: غازاتٌ ونفاياتٌ ضارّةٌ في الهواءِ والتربةِ والماء' : plant ? 'زراعةُ الأشجارِ وإعادةُ التدويرِ تحمي النظامَ البيئيّ' : 'نظامٌ بيئيٌّ متوازن', cut && !plant || poll ? '#a02020' : '#1a6a2a');
    api.refreshParts && api.refreshParts();
  }
  apply();
  const parts = [
    { id: 'forest', name: 'الغابة', info: 'موطنٌ لمخلوقاتٍ كثيرة؛ يقطعُ الإنسانُ الأشجارَ لبناءِ البيوتِ وصناعةِ الأثاثِ فيدمّرُ مساكنَها ومصادرَ غذائها.', objs: trees.flatMap(t => t.children), at: anchor(root, [-2.6, .6, -1]), hidden: () => cut },
    { id: 'factory', name: 'المصنع', info: 'الغازاتُ المنبعثةُ من المصانعِ والسيّاراتِ تلوّثُ الهواءَ الذي نستنشقُه.', objs: factory.children, at: anchor(factory, [0, 2, 0]) },
    { id: 'houses', name: 'المساكن (الاكتظاظ السكاني)', info: 'كلّما ازدادَ عددُ الناسِ ازدادتِ الحاجةُ إلى المكانِ والماءِ والمصادر.', objs: houses.children.flatMap(h => h.children), at: anchor(houses, [1.8, .3, .9]) },
    { id: 'animals', name: 'حيوانات الغابة', info: 'تفقدُ مواطنَها عندَ إزالةِ الغابات، فتهاجرُ أو تموت.', objs: animals.map(a => a.p), at: anchor(root, [-2.4, 0, 1.3]), hidden: () => cut && !plant }
  ];
  return {
    root, parts,
    update(dt) { t += dt; smoke.update(dt); },
    cam: { pos: [0, 3.4, 7.8], target: [0, -.4, 0] }, inpage: { pos: [0, 3.6, 7.8], target: [0, -.4, 0] },
    controls: [
      { type: 'button', label: '🪓 قطع أشجار الغابة', toggle: true, on: on => { cut = on; apply(); } },
      { type: 'button', label: '🏭 التلوّث', toggle: true, on: on => { poll = on; apply(); } },
      { type: 'button', label: '🌱 زراعة الأشجار وإعادة التدوير', toggle: true, on: on => { plant = on; apply(); } }
    ],
    quiz: [{ q: 'المس مصدرًا لتلوّثِ الهواء.', a: 'factory' }, { q: 'المس ما يدلُّ على الاكتظاظِ السكّانيّ.', a: 'houses' }]
  };
}

/* ═════════ ٦) مسبّبات الأمراض: فيروسات وبكتيريا وفطريات (ص ١٤٣–١٤٥) ═════════ */
export function germsModel(api) {
  const root = new THREE.Group(); let sel = -1, t = 0;
  // فيروس
  const vir = new THREE.Group(); const vc = mesh(new THREE.IcosahedronGeometry(.75, 3), mat('#c84a6a', { roughness: .5 })); vir.add(vc);
  const sp = []; const gIco = new THREE.IcosahedronGeometry(1, 1); const pa = gIco.attributes.position; const seen = new Set(); for (let i = 0; i < pa.count; i++) { const p = V(pa.getX(i), pa.getY(i), pa.getZ(i)).normalize(); const k = p.toArray().map(x => x.toFixed(2)).join(); if (seen.has(k)) continue; seen.add(k); const s = mesh(new THREE.CylinderGeometry(.03, .03, .3, 6), mat('#e8a0b0'), p.clone().multiplyScalar(.88).toArray()); s.quaternion.setFromUnitVectors(V(0, 1, 0), p); const b = mesh(new THREE.SphereGeometry(.08, 10, 8), mat('#f0c040'), p.clone().multiplyScalar(1.05).toArray()); vir.add(s, b); sp.push(s, b); }
  vir.position.set(-2.8, .4, 0); root.add(vir);
  // بكتيريا
  const bacG = new THREE.Group(); const bacs = []; for (let i = 0; i < 9; i++) { const c = mesh(new THREE.CapsuleGeometry(.16, .7, 8, 14), mat('#e8843a', { roughness: .4 }), [(i % 3 - 1) * .55, (Math.floor(i / 3) - 1) * .5, Math.sin(i) * .3], [0, i, Math.PI / 2 + i * .4]); bacG.add(c); bacs.push(c); for (let k = 0; k < 3; k++) bacG.add(tube([[c.position.x, c.position.y, c.position.z], [c.position.x + .3 + k * .05, c.position.y - .2, c.position.z + .1], [c.position.x + .55, c.position.y + .05 * k, c.position.z]], .01, mat('#c06020'), 8, 4)); } bacG.position.set(0, .4, 0); root.add(bacG);
  // فطريات
  const fun = new THREE.Group(); fun.add(mesh(new THREE.CylinderGeometry(.18, .25, 1, 16), mat('#f5ecd8'), [0, -.2, 0])); fun.add(mesh(new THREE.SphereGeometry(.75, 28, 14, 0, TAU, 0, Math.PI / 2), mat('#c0392b'), [0, .25, 0])); for (let k = 0; k < 8; k++) fun.add(mesh(new THREE.SphereGeometry(.08, 8, 6), mat('#fff'), [Math.cos(k) * .45, .25 + .45, Math.sin(k) * .45]));
  for (let k = 0; k < 6; k++) fun.add(tube([[0, -.7, 0], [Math.cos(k) * .5, -.85, Math.sin(k) * .5], [Math.cos(k) * .9, -.8, Math.sin(k) * .9]], .02, mat('#e8e0d0'), 10, 4));
  fun.position.set(2.8, .3, 0); root.add(fun);
  const L = [[vir, 'الفيروسات', '#c84a6a'], [bacG, 'البكتيريا', '#e8843a'], [fun, 'الفطريات', '#a0302a']]; 
  const ex = txt('', .26, '#333'); ex.position.set(0, 2.2, 0); root.add(ex);
  const EX = ['أمثلة: كورونا المستجدّ، الزكام، الإنفلونزا، الحصبة', 'نافعة: بكتيريا اللبن والهضم — ضارّة: السلّ، الكوليرا، التهاب الحلق', 'نافعة: الكمأة — ضارّة: القدم الرياضي، الطفح الجلدي'];
  function apply() { L.forEach(([g], i) => g.scale.setScalar(sel < 0 ? 1 : i === sel ? 1.3 : .6)); setTxt(ex, sel < 0 ? 'مسبّباتُ الأمراضِ المعدية' : EX[sel]); }
  apply();
  const parts = [
    { id: 'virus', name: 'الفيروس', info: 'يسلكُ سلوكَ المخلوقاتِ الحيّةِ أحيانًا وسلوكَ الأشياءِ غيرِ الحيّةِ أحيانًا أخرى؛ يلتصقُ بخليةٍ من جسمِ المخلوقِ الحيِّ ويدخلُ إليها ويسبّبُ المرض.', objs: [vc, ...sp], at: anchor(vir, [0, 1.2, 0]) },
    { id: 'bact', name: 'البكتيريا', info: 'مخلوقاتٌ حيّةٌ وحيدةُ الخليةِ مجهرية، توجدُ في التربةِ والهواءِ والماءِ وداخلَ أجسامِنا؛ منها النافعُ ومنها الضارّ.', objs: bacs, at: anchor(bacG, [0, 1.1, 0]) },
    { id: 'fungi', name: 'الفطريات', info: 'مخلوقاتٌ حيّةٌ واسعةُ الانتشار؛ منها الكبيرُ الذي يُرى بالعينِ ومنها الدقيقُ الذي لا يُرى إلّا بالمجهر. تنتشرُ في الأماكنِ الدافئةِ الرطبة.', objs: fun.children, at: anchor(fun, [0, 1.3, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; vir.rotation.y += dt * .5; vir.rotation.x = Math.sin(t * .5) * .3; bacs.forEach((b, i) => { b.rotation.y += dt * (.3 + i * .05); }); fun.rotation.y = Math.sin(t * .4) * .4; },
    cam: { pos: [0, 1.2, 8.4], target: [0, .2, 0] }, inpage: { pos: [0, 1, 8.6], target: [0, .2, 0] },
    controls: [{ type: 'seg', label: 'المسبّب', options: ['الكل', 'الفيروسات', 'البكتيريا', 'الفطريات'], value: 0, on: k => { sel = k - 1; apply(); } }],
    quiz: [{ q: 'المس المسبّبَ الذي يلتصقُ بالخليةِ ويدخلُ إليها.', a: 'virus' }, { q: 'المس المسبّبَ الرئيسَ لمرضِ القدمِ الرياضيّ.', a: 'fungi' }, { q: 'المس مخلوقاتٍ وحيدةَ الخليةِ منها بكتيريا اللبن.', a: 'bact' }]
  };
}

/* ═════════ ٧) انتقال العدوى بالرذاذ (ص ١٤٣ و١٥٣) ═════════ */
function person(c, skin = '#e8c09a') { const g = new THREE.Group(); g.add(mesh(new THREE.CapsuleGeometry(.38, 1.1, 8, 16), mat(c), [0, .9, 0])); g.add(mesh(new THREE.SphereGeometry(.3, 20, 16), mat(skin), [0, 2.05, 0])); g.add(mesh(new THREE.SphereGeometry(.3, 20, 10, 0, TAU, 0, Math.PI / 2.3), mat('#2a1a10'), [0, 2.12, 0])); return g; }
export function spreadModel(api) {
  const root = new THREE.Group(); let dist = 1, cover = false, t = 0, burst = 0;
  const floor = mesh(new THREE.BoxGeometry(8, .1, 3), mat('#e8e2d4'), [0, -.05, 0]); root.add(floor);
  const A = person('#f4f4f4'); A.position.x = -1; A.rotation.y = Math.PI / 2; root.add(A); const B = person('#f4f4f4'); B.rotation.y = -Math.PI / 2; root.add(B);
  const hand = mesh(new THREE.SphereGeometry(.13, 12, 10), mat('#e8c09a'), [.3, 2, 0]); hand.visible = false; A.add(hand);
  const N = 120; const drops = []; const dM = mat('#4ab0e8', { transparent: true, opacity: .8, emissive: '#2a80c0', emissiveIntensity: .4 });
  for (let i = 0; i < N; i++) { const d = mesh(new THREE.SphereGeometry(.035, 6, 4), dM); d.visible = false; root.add(d); drops.push({ d, v: V(0, 0, 0), life: 0 }); }
  const ruler = new THREE.Group(); root.add(ruler); const rl = mesh(new THREE.BoxGeometry(1, .03, .03), mat('#333')); ruler.add(rl); const rlab = txt('', .28, '#333'); ruler.add(rlab);
  const risk = txt('', .36, '#a02020'); risk.position.set(0, 3.1, 0); root.add(risk);
  function apply() {
    const half = dist * .9; A.position.x = -half; B.position.x = half; hand.visible = cover;
    rl.scale.x = half * 2; ruler.position.set(0, .3, 1.1); rlab.position.set(0, .25, 0); setTxt(rlab, AR(dist.toFixed(1)) + ' م');
    const hi = dist < 2 && !cover; setTxt(risk, hi ? 'خطورةٌ عالية لانتقالِ الفيروس' : 'خطورةٌ منخفضة لانتقالِ الفيروس', hi ? '#c0201a' : '#1a8a3a');
  }
  apply();
  function sneeze() { burst = 1; const o = A.position.clone().add(V(.25, 2, 0)); drops.forEach(p => { p.d.position.copy(o); const sp = cover ? .4 : 1; p.v.set((1.6 + Math.random() * 2.2) * sp, (Math.random() - .3) * 1.2 * sp, (Math.random() - .5) * 1.4 * sp); p.life = cover ? .25 + Math.random() * .2 : 1.6 + Math.random() * .6; p.d.visible = true; }); }
  const parts = [
    { id: 'sick', name: 'الشخص المصاب', info: 'عندما يسعلُ أو يعطسُ الشخصُ المصاب، ينتقلُ الرذاذُ في الهواءِ لمسافات، ويمكنُ أن تصلَ مسبّباتُ الأمراضِ إلى عينِ أو أنفِ أو فمِ الشخصِ المقابل.', objs: A.children, at: anchor(A, [0, 2.6, 0]) },
    { id: 'healthy', name: 'الشخص السليم', info: 'يمكنُ أن يصابَ بالعدوى إذا كان قريبًا من المصاب؛ لذا نبتعدُ مسافةَ ٢ متر تقريبًا ونتجنّبُ الأماكنَ المزدحمة.', objs: B.children, at: anchor(B, [0, 2.6, 0]) },
    { id: 'drops', name: 'الرذاذ', info: 'قطراتٌ صغيرةٌ تحملُ مسبّباتِ الأمراض. تغطيةُ الفمِ والأنفِ بمنديلٍ أو بالمرفقِ عندَ العطاسِ تقلّلُ انتشارَه.', objs: [rl], at: anchor(root, [0, 2.2, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; let hit = 0; drops.forEach(p => { if (!p.d.visible) return; p.life -= dt; p.v.y -= dt * 1.5; p.d.position.addScaledVector(p.v, dt); if (p.d.position.y < .05) p.v.set(0, 0, 0); if (p.life <= 0) p.d.visible = false; if (Math.abs(p.d.position.x - B.position.x) < .3 && p.d.position.y > 1.6) hit++; }); },
    cam: { pos: [0, 2.6, 7.4], target: [0, 1.2, 0] }, inpage: { pos: [0, 2.4, 7.6], target: [0, 1.2, 0] },
    controls: [
      { type: 'slider', label: 'المسافة بين الشخصين', min: .5, max: 3, step: .5, value: 1, fmt: v => AR((+v).toFixed(1)) + ' م', on: v => { dist = +v; apply(); } },
      { type: 'button', label: '🤧 عطاس', on: () => sneeze() },
      { type: 'button', label: '🤚 غطِّ فمك عند العطاس', toggle: true, on: on => { cover = on; apply(); api.toast(on ? 'تغطيةُ الفمِ والأنفِ تمنعُ انتشارَ الرذاذِ إلى الآخرين.' : 'دونَ تغطيةٍ ينتشرُ الرذاذُ مسافاتٍ بعيدة.'); } }
    ],
    quiz: [{ q: 'المس الشخصَ الذي قد يصابُ بالعدوى.', a: 'healthy' }, { q: 'المس الشخصَ المصاب.', a: 'sick' }]
  };
}

/* ═════════ ٨) خلايا الدم البيضاء والمناعة (ص ١٥٤–١٥٦) ═════════ */
export function immuneModel(api) {
  const root = new THREE.Group(); let vacc = false, t = 0, eaten = 0;
  const vessel = mesh(new THREE.CylinderGeometry(2.2, 2.2, 9, 40, 1, true), mat('#8a1a24', { side: THREE.BackSide, roughness: .8 }), [0, 0, 0], [0, 0, Math.PI / 2]); root.add(vessel);
  const rbcM = mat('#d42a2a', { roughness: .5 }); const rbcs = []; const rg = new THREE.TorusGeometry(.22, .12, 12, 24);
  for (let i = 0; i < 26; i++) { const r = mesh(rg, rbcM, [-4 + Math.random() * 8, (Math.random() - .5) * 2.6, (Math.random() - .5) * 2.6], [Math.random() * 3, Math.random() * 3, 0]); root.add(r); rbcs.push(r); }
  const wbc = new THREE.Group(); const wb = mesh(new THREE.IcosahedronGeometry(.75, 3), mat('#f4f0ea', { roughness: .7 })); wbc.add(wb); for (let i = 0; i < 40; i++) { const p = V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(); wbc.add(mesh(new THREE.SphereGeometry(.12, 8, 6), mat('#ece6dc'), p.multiplyScalar(.72).toArray())); } wbc.add(mesh(new THREE.SphereGeometry(.3, 14, 10), mat('#b8a0d8', { transparent: true, opacity: .8 }), [.15, .1, .3])); root.add(wbc);
  const germs = []; const gM = mat('#5ac83a', { roughness: .4 });
  function addGerms(n = 6) { for (let i = 0; i < n; i++) { const g = new THREE.Group(); g.add(mesh(new THREE.SphereGeometry(.16, 12, 10), gM)); for (let k = 0; k < 8; k++) { const p = V(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(); const cn = mesh(new THREE.ConeGeometry(.04, .14, 5), gM, p.clone().multiplyScalar(.18).toArray()); cn.quaternion.setFromUnitVectors(V(0, 1, 0), p); g.add(cn); } g.position.set(1 + Math.random() * 3, (Math.random() - .5) * 2.4, (Math.random() - .5) * 2.4); root.add(g); germs.push({ g, alive: true }); } }
  addGerms();
  const lab = txt('', .3, '#fff', 'rgba(0,0,0,.45)'); lab.position.set(0, 1.9, 0); root.add(lab);
  function upd() { const left = germs.filter(g => g.alive).length; setTxt(lab, left ? `مسبّباتُ أمراضٍ في الدم: ${AR(left)}` : 'قضتْ خلايا الدمِ البيضاءُ على مسبّباتِ الأمراض ✔', left ? '#fff' : '#bfffbf'); }
  upd();
  const parts = [
    { id: 'wbc', name: 'خلية الدم البيضاء', info: 'تتجوّلُ باستمرارٍ في الجسمِ بحثًا عن مسبّباتِ الأمراض، فتهاجمُها وتقضي عليها؛ وهي المسؤولةُ عن حمايةِ الجسمِ ومحاربةِ الجراثيم.', objs: [wb], at: anchor(wbc, [0, 1, 0]) },
    { id: 'rbc', name: 'خلايا الدم الحمراء', info: 'تنقلُ الأكسجينَ والغذاءَ إلى أنسجةِ الجسم، وفي فقرِ الدمِ لا يوجدُ منها ما يكفي.', objs: rbcs, at: anchor(root, [-3, 1.2, 0]) },
    { id: 'germ', name: 'مسبّب المرض', info: 'فيروساتٌ أو بكتيريا ضارّةٌ دخلتِ الجسم. التطعيمُ يدرّبُ الجهازَ المناعيَّ على التعرّفِ عليها بسرعة.', objs: [], at: anchor(root, [2.5, 1.2, 0]), hidden: () => !germs.some(g => g.alive) }
  ];
  Object.defineProperty(parts[2], 'objs', { get: () => germs.filter(g => g.alive).flatMap(g => g.g.children) });
  return {
    root, parts,
    update(dt) {
      t += dt; rbcs.forEach((r, i) => { r.position.x += dt * .8; if (r.position.x > 4.4) r.position.x = -4.4; r.rotation.x += dt; });
      const target = germs.find(g => g.alive); const speed = vacc ? 2.2 : .8;
      if (target) { const d = target.g.position.clone().sub(wbc.position); const L = d.length(); if (L < .7) { target.alive = false; target.g.visible = false; upd(); api.refreshParts && api.refreshParts(); } else wbc.position.addScaledVector(d.normalize(), Math.min(L, speed * dt)); }
      else wbc.position.lerp(V(0, 0, 0), dt);
      wbc.rotation.y += dt * .5; wb.scale.setScalar(1 + Math.sin(t * 3) * .04);
      germs.forEach(g => { if (g.alive) { g.g.rotation.y += dt; g.g.position.x += Math.sin(t + g.g.position.y) * dt * .2; } });
    },
    cam: { pos: [0, .4, 6.4], target: [0, 0, 0] }, inpage: { pos: [0, .3, 6.6], target: [0, 0, 0] },
    controls: [
      { type: 'button', label: '🦠 أدخل مسبّبات أمراض', on: () => { addGerms(5); upd(); api.refreshParts && api.refreshParts(); } },
      { type: 'button', label: '💉 جسم حصل على التطعيم', toggle: true, on: on => { vacc = on; api.toast(on ? 'التطعيمُ يكوّنُ مناعةً اصطناعية؛ فيتعرّفُ الجسمُ على المسبّبِ ويقضي عليه بسرعة.' : 'دونَ تطعيمٍ تكونُ الاستجابةُ أبطأ.'); } }
    ],
    quiz: [{ q: 'المس الخليةَ التي تهاجمُ مسبّباتِ المرض.', a: 'wbc' }, { q: 'المس الخلايا التي تنقلُ الأكسجين.', a: 'rbc' }]
  };
}

/* ═════════ ٩) غسل اليدين (ص ١٦٦) ═════════ */
export function hygieneModel(api) {
  const root = new THREE.Group(); let washing = 0, t = 0;
  const skin = mat('#e8b890', { roughness: .6 });
  const hand = new THREE.Group(); hand.add(mesh(new THREE.BoxGeometry(1.2, 1.3, .35), skin, [0, 0, 0])); for (let i = 0; i < 4; i++) { hand.add(mesh(new THREE.CapsuleGeometry(.13, .7 - Math.abs(i - 1.5) * .12, 6, 10), skin, [-.42 + i * .28, 1.05 - Math.abs(i - 1.5) * .06, 0])); } hand.add(mesh(new THREE.CapsuleGeometry(.14, .5, 6, 10), skin, [.75, .1, .05], [0, 0, -.8])); hand.add(mesh(new THREE.CylinderGeometry(.45, .5, 1, 20), skin, [0, -1.1, 0])); hand.position.set(0, .3, 0); root.add(hand);
  const germs = []; const gm = mat('#4ac83a', { emissive: '#2a8a1a', emissiveIntensity: .4 }); for (let i = 0; i < 26; i++) { const g = mesh(new THREE.IcosahedronGeometry(.06, 0), gm, [(Math.random() - .5) * 1.1, (Math.random() - .5) * 1.2 + (Math.random() < .4 ? .9 : 0), .2]); hand.add(g); germs.push(g); }
  const tap = new THREE.Group(); tap.add(mesh(new THREE.CylinderGeometry(.1, .1, 1.2, 12), mat('#c8ccd4', { metalness: .8, roughness: .2 }), [0, 0, 0], [0, 0, Math.PI / 2])); tap.add(mesh(new THREE.CylinderGeometry(.09, .09, .4, 12), mat('#c8ccd4', { metalness: .8, roughness: .2 }), [.55, -.2, 0])); tap.position.set(-.6, 2.7, 0); root.add(tap);
  const water = new Flow(root, '#8ad0ff', .05, 40); water.addPath(curve([[-.05, 2.45, 0], [-.05, 1.6, 0], [0, .8, .1]]), .8); water.rate = 0;
  const bubbles = []; for (let i = 0; i < 30; i++) { const b = mesh(new THREE.SphereGeometry(.05 + Math.random() * .07, 10, 8), glass('#ffffff', .6)); b.visible = false; root.add(b); bubbles.push(b); }
  const lab = txt('', .3, '#333'); lab.position.set(1.4, 2.3, .5); root.add(lab);
  function upd() { const left = germs.filter(g => g.visible).length; setTxt(lab, washing > 0 ? 'أغسلُ يديَّ بالماءِ والصابونِ مدّةً كافية...' : left ? `جراثيمُ على اليد: ${AR(left)}` : 'يدٌ نظيفة ✔', left ? '#a02020' : '#1a7a2a'); }
  upd();
  const parts = [
    { id: 'hand', name: 'اليد', info: 'تنتقلُ الأوساخُ إلى أيدينا، وتسبّبُ لنا الأمراضَ عندَ ملامستِنا للأشياءِ غيرِ النظيفة؛ لذا نغسلُ اليدينِ باستمرار، وبعدَ مسكِ الأشياءِ الملوّثة، وقبلَ الطعامِ وبعدَه.', objs: hand.children.filter(c => !germs.includes(c)), at: anchor(hand, [0, 1.6, 0]) },
    { id: 'germs', name: 'الجراثيم', info: 'مسبّباتُ أمراضٍ دقيقةٌ لا نراها بالعين؛ يزيلُها الماءُ والصابون.', objs: germs, at: anchor(hand, [.5, .3, .3]), hidden: () => !germs.some(g => g.visible) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; water.update(dt);
      if (washing > 0) { washing -= dt; hand.rotation.y = Math.sin(t * 8) * .25; const vis = germs.filter(g => g.visible); if (vis.length && Math.random() < dt * 8) { vis[0].visible = false; upd(); } bubbles.forEach(b => { if (!b.visible) { b.visible = true; b.position.set((Math.random() - .5) * 1.4, Math.random() * 1.6 - .4, .3); } b.position.y += dt * .4; if (b.position.y > 1.6) b.visible = false; }); if (washing <= 0) { water.rate = 0; hand.rotation.y = 0; bubbles.forEach(b => b.visible = false); upd(); api.refreshParts && api.refreshParts(); } }
    },
    cam: { pos: [0, .8, 6], target: [0, .5, 0] }, inpage: { pos: [0, .6, 6.2], target: [0, .5, 0] },
    controls: [
      { type: 'button', label: '🧼 اغسل يديك بالماء والصابون', on: () => { washing = 4; water.rate = 25; upd(); } },
      { type: 'button', label: '🖐️ المس أشياء متّسخة', on: () => { germs.forEach(g => g.visible = true); upd(); api.refreshParts && api.refreshParts(); } }
    ],
    quiz: [{ q: 'المس الجراثيمَ على اليد.', a: 'germs' }]
  };
}

/* ═════════ ١٠) الغذاء المتوازن: مجموعات المواد الغذائية (ص ١٧٤–١٧٧) ═════════ */
export function plateModel(api) {
  const root = new THREE.Group(); let sel = -1, t = 0;
  const plate = mesh(new THREE.CylinderGeometry(3, 2.6, .25, 64), mat('#f8f8f4', { roughness: .3 }), [0, -.6, 0]); root.add(plate); root.add(mesh(new THREE.TorusGeometry(2.85, .08, 10, 64), mat('#e8e8e0'), [0, -.47, 0], [Math.PI / 2, 0, 0]));
  const GR = [
    { id: 'carb', n: 'الكربوهيدرات', c: '#f2d27a', e: ['🍞', '🍚', '🥔', '🌽'], f: 'المصدرُ الرئيسُ للطاقةِ في الجسمِ غالبًا.', s: 'رقائقُ الذرة، الحبوب، الخبز، التمر، البطاطس، الأرز' },
    { id: 'prot', n: 'البروتينات', c: '#f2a08a', e: ['🍗', '🐟', '🥚', '🥩'], f: 'تساعدُ الجسمَ على النموِّ وتعويضِ الخلايا التالفة.', s: 'البقوليات، اللحوم، الأسماك، الدواجن، البيض، الجبن، الحليب' },
    { id: 'fat', n: 'الدهون', c: '#f8e8a0', e: ['🧈', '🥑', '🥜'], f: 'تساعدُ الخلايا على العمل، وتزوّدُ الجسمَ بالطاقةِ والدفء، والإكثارُ منها يسبّبُ السمنةَ وأمراضَ القلب.', s: 'اللحوم، زيوت الأسماك، الزيوت النباتية' },
    { id: 'vit', n: 'الفيتامينات', c: '#a8e08a', e: ['🍎', '🍊', '🥦', '🥕'], f: 'تحافظُ على صحّةِ الجسم، وتبني خلايا جديدة، وتقي من الأمراض، مثل فيتامين ج وفيتامين د.', s: 'الحبوب، الفواكه، الخضروات، الحليب' },
    { id: 'min', n: 'الأملاح المعدنية', c: '#d0c8f0', e: ['🥛', '🧀', '🥬'], f: 'تساعدُ على تكوينِ العظامِ وخلايا الدمِ الجديدة، ومنها الكالسيومُ والحديد.', s: 'اللحوم، منتجات الألبان، الخضروات، الحبوب' },
    { id: 'water', n: 'الماء', c: '#a8d8f8', e: ['💧', '🥤'], f: 'يشكّلُ ثلثَي جسمِ الإنسان، ويساعدُ على الهضمِ والتخلّصِ من الفضلاتِ ويحافظُ على درجةِ حرارةِ الجسمِ ثابتة.', s: 'الماء النقي، العصيرات، الحليب، الخضروات والفواكه' }
  ];
  const secs = GR.map((g, i) => { const a0 = i / 6 * TAU, a1 = (i + 1) / 6 * TAU; const m = mesh(new THREE.CylinderGeometry(2.5, 2.5, .08, 24, 1, false, a0 + .03, a1 - a0 - .06), mat(g.c, { roughness: .6 }), [0, -.44, 0]); root.add(m); const grp = new THREE.Group(); const am = (a0 + a1) / 2; grp.position.set(Math.sin(am) * 1.55, 0, Math.cos(am) * 1.55); root.add(grp); g.e.forEach((ch, k) => { const s = emo(ch, .6); s.position.set((k - (g.e.length - 1) / 2) * .38 * Math.cos(am), .05 + (k % 2) * .25, -(k - (g.e.length - 1) / 2) * .38 * Math.sin(am)); grp.add(s); }); return { m, grp }; });
  function apply() { secs.forEach((s, i) => { s.m.position.y = -.44 + (i === sel ? .25 : 0); s.grp.position.y = i === sel ? .35 : 0; s.grp.scale.setScalar(sel < 0 || i === sel ? 1 : .6); }); }
  const parts = GR.map((g, i) => ({ id: g.id, name: g.n, info: g.f + ' مصادرُها: ' + g.s + '.', objs: [secs[i].m], at: anchor(secs[i].grp, [0, .8, 0]) }));
  return {
    root, parts,
    update(dt) { t += dt; root.rotation.y = Math.sin(t * .2) * .2; },
    cam: { pos: [0, 4.6, 5.6], target: [0, -.4, 0] }, inpage: { pos: [0, 5, 5.2], target: [0, -.4, 0] },
    controls: [{ type: 'seg', label: 'المجموعة', options: ['الكل', ...GR.map(g => g.n)], value: 0, on: k => { sel = k - 1; apply(); if (sel >= 0) api.toast(GR[sel].n + ': ' + GR[sel].f); else api.toast('الوجبةُ المتوازنةُ تحتوي على جميعِ أنواعِ الغذاءِ بكميّاتٍ مناسبة.'); } }],
    quiz: [{ q: 'المس المصدرَ الرئيسَ للطاقة.', a: 'carb' }, { q: 'المس ما يساعدُ على النموِّ وتعويضِ الخلايا التالفة.', a: 'prot' }, { q: 'المس ما يشكّلُ ثلثَي جسمِ الإنسان.', a: 'water' }, { q: 'المس المجموعةَ التي منها الكالسيومُ والحديد.', a: 'min' }]
  };
}

/* ═════════ ١١) الهرم الغذائي (ص ١٧٨) ═════════ */
export function foodpyrModel(api) {
  const root = new THREE.Group(); let lvl = -1, t = 0;
  const LV = [
    { id: 'grain', n: 'مجموعة الحبوب', c: '#e8c87a', e: ['🍞', '🍚', '🥔', '🌽', '🥖'], d: 'في قاعدةِ الهرم: نتناولُ منها الكميّةَ الأكبر؛ فهي المصدرُ الرئيسُ للطاقة.' },
    { id: 'veg', n: 'مجموعة الخضروات والفواكه', c: '#9ad46a', e: ['🥦', '🥕', '🍎', '🍌'], d: 'غنيّةٌ بالفيتاميناتِ والأملاحِ المعدنية؛ نتناولُ منها كميّاتٍ كبيرةً يوميًّا.' },
    { id: 'meat', n: 'مجموعة اللحوم والأسماك', c: '#f29a8a', e: ['🍗', '🐟', '🥚'], d: 'مصدرٌ للبروتيناتِ التي تساعدُ على النموِّ وتعويضِ الخلايا.' },
    { id: 'milk', n: 'مجموعة الحليب ومشتقاته', c: '#e8eef8', e: ['🥛', '🧀'], d: 'غنيّةٌ بالكالسيومِ والبروتينات؛ مهمّةٌ لبناءِ العظامِ والأسنان.' },
    { id: 'fat', n: 'مجموعة الدهون', c: '#f8e08a', e: ['🧈'], d: 'في قمّةِ الهرم: نتناولُ منها كميّاتٍ قليلةً فقط.' }
  ];
  const H = .8; const lv = LV.map((l, i) => { const r0 = 2.8 - i * .52, r1 = 2.8 - (i + 1) * .52; const m = mesh(new THREE.CylinderGeometry(Math.max(.05, r1) * .75, r0 * .75, H, 4), mat(l.c, { roughness: .6 }), [0, -1.8 + i * H + H / 2, 0], [0, Math.PI / 4, 0]); root.add(m); const g = new THREE.Group(); g.position.set(0, -1.8 + i * H + H / 2, r0 * .5); l.e.forEach((ch, k) => { const s = emo(ch, .5); s.position.set((k - (l.e.length - 1) / 2) * .5, 0, .1); g.add(s); }); root.add(g); return { m, g }; });
  const lab = txt('', .3, '#333'); lab.position.set(0, 2.6, 0); root.add(lab);
  function apply() { lv.forEach((x, i) => { x.m.position.x = i === lvl ? .0 : 0; x.m.scale.setScalar(i === lvl ? 1.08 : 1); x.m.material.emissive = new THREE.Color(i === lvl ? '#664400' : '#000'); x.m.material.emissiveIntensity = i === lvl ? .25 : 0; x.g.scale.setScalar(lvl < 0 || i === lvl ? 1 : .7); }); setTxt(lab, lvl < 0 ? 'الهرمُ الغذائيّ: خمسُ مجموعاتٍ رئيسة' : LV[lvl].n); }
  apply();
  const parts = LV.map((l, i) => ({ id: l.id, name: l.n, info: l.d, objs: [lv[i].m], at: anchor(root, [-(2.6 - i * .5) * .62, -1.8 + i * H + H * .7, .3]) }));
  return {
    root, parts,
    update(dt) { t += dt; root.rotation.y = Math.sin(t * .3) * .25; },
    cam: { pos: [0, 1.4, 7.6], target: [0, -.1, 0] }, inpage: { pos: [0, 1.2, 7.8], target: [0, -.1, 0] },
    controls: [{ type: 'steps', value: -1, steps: LV.map((l, i) => ({ t: (i + 1) + '- ' + l.n, d: l.d })), on: i => { lvl = i; apply(); } }],
    quiz: [{ q: 'المس المجموعةَ التي في قاعدةِ الهرم.', a: 'grain' }, { q: 'المس المجموعةَ التي نتناولُ منها أقلَّ كميّة.', a: 'fat' }, { q: 'المس مجموعةً غنيّةً بالكالسيومِ لبناءِ العظام.', a: 'milk' }]
  };
}
