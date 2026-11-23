// مجسّمات الصف الثالث
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, clamp, lerp, ease, noiseTexture, tree, cloud, arrowTube, house, organGeo, fbm3, tissue, tissueBump, vessel, twigs, mergeGeos, creature } from './kit.js';
import { emo, txt, setTxt } from './models6a.js';
import { node } from './m4a.js';
const TAU = Math.PI * 2;
const AR = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
function ground(r = 4, c1 = '#8fbf5a', c2 = '#6f9f42') { return mesh(new THREE.CylinderGeometry(r, r + .2, .4, 64), mat('#fff', { map: noiseTexture(c1, c2, 3000) }), [0, -.6, 0]); }

/* ═════════ ١) المخلوقات الحية والأشياء غير الحية (ص ٢٨–٢٩) ═════════ */
export function livingModel(api) {
  const root = new THREE.Group(); let t = 0, mode = 0, grow = 0;
  root.add(ground(4.2, '#c9b07a', '#a88f5a'));
  const L = [['giraffe', '🦒', 'الزرافة', [-2.6, .2, -.6], 1], ['tree', '🌳', 'الشجرة', [-1.2, .3, -1.6], 1], ['bird', '🐦', 'الطائر', [-.6, 1.6, -.4], 1], ['lizard', '🦎', 'السحلية', [-2, -.1, 1.2], 1], ['chick', '🐣', 'صغيرُ الدجاج', [-.7, -.1, 1.6], 1],
    ['rock', '🪨', 'الصخرة', [1.4, -.1, -1.2], 0], ['water', '💧', 'الماء', [2.6, -.1, -.2], 0], ['car', '🚗', 'السيّارة', [1.6, -.1, 1.4], 0], ['toy', '🧸', 'اللعبة', [2.9, -.1, 1.4], 0]];
  const N = L.map(([id, e, n, p, live]) => ({ id, n, live, base: p, nd: node(root, e, p, .85, live ? 'rgba(210,255,200,.9)' : 'rgba(225,225,235,.9)') }));
  const tl = txt('مخلوقاتٌ حيّة', .34, '#1a6a2a'); tl.position.set(-1.6, 2.7, 0); root.add(tl);
  const tr = txt('أشياءُ غيرُ حيّة', .34, '#444'); tr.position.set(2, 2.7, 0); root.add(tr);
  const divider = mesh(new THREE.BoxGeometry(.04, .02, 7), mat('#ffffff'), [.5, -.38, 0]); root.add(divider);
  const info = txt('', .28, '#333'); info.position.set(0, -1.4, 2); root.add(info);
  const MODES = ['', 'تنمو: المخلوقاتُ الحيّةُ تكبرُ مع الزمن', 'تستجيب: الطائرُ يطيرُ مبتعدًا عن الخطر', 'تتكاثر: تنتجُ أفرادًا من نوعِها'];
  let babies = [];
  function apply() {
    babies.forEach(b => root.remove(b.g)); babies = [];
    if (mode === 3) N.filter(x => x.live && x.id !== 'chick').forEach(x => { const b = node(root, { giraffe: '🦒', tree: '🌱', bird: '🥚', lizard: '🥚' }[x.id], [x.base[0] + .55, -.15, x.base[2] + .4], .45, null); babies.push(b); });
    setTxt(info, MODES[mode] || 'المخلوقُ الحيُّ ينمو ويستجيبُ ويتكاثر، والشيءُ غيرُ الحيِّ لا يفعلُ ذلك');
    api.refreshParts && api.refreshParts();
  }
  apply();
  const parts = N.map(x => ({ id: x.id, name: x.n + (x.live ? ' (مخلوقٌ حيّ)' : ' (شيءٌ غيرُ حيّ)'), info: x.live ? 'مخلوقٌ حيّ: ينمو ويستجيبُ ويتكاثر، ويحتاجُ إلى الغذاءِ والماءِ والهواءِ والمكان.' : 'شيءٌ غيرُ حيّ: لا يستخدمُ الطاقةَ للنموّ، ولا يستجيبُ ولا يتكاثر.', objs: [x.nd.p], at: anchor(x.nd.g, [0, .55, 0]) }));
  return {
    root, parts,
    update(dt) {
      t += dt; grow = lerp(grow, mode === 1 ? 1 : 0, Math.min(1, dt * 2));
      N.forEach((x, i) => {
        if (!x.live) { x.nd.g.scale.setScalar(1); x.nd.g.position.set(...x.base); return; }
        x.nd.g.scale.setScalar(1 + grow * .45);
        if (mode === 2 && x.id === 'bird') x.nd.g.position.set(x.base[0] - Math.sin(t * 1.5) * .8, x.base[1] + .5 + Math.sin(t * 3) * .3, x.base[2]);
        else if (mode === 2 && x.id === 'lizard') x.nd.g.position.set(x.base[0] - (Math.sin(t * 2) * .5 + .5) * .9, x.base[1], x.base[2]);
        else x.nd.g.position.set(x.base[0], x.base[1] + Math.sin(t * 2 + i) * .04, x.base[2]);
      });
    },
    cam: { pos: [0, 2.8, 6.2], target: [0, .3, 0] }, inpage: { pos: [0, 2.8, 6.4], target: [0, .3, 0] },
    controls: [{ type: 'seg', label: 'الخاصية', options: ['الكل', 'النموّ', 'الاستجابة', 'التكاثر'], value: 0, on: k => { mode = k; apply(); } }],
    legend: [['#d2ffc8', 'مخلوق حي'], ['#e1e1eb', 'شيء غير حي']],
    quiz: [{ q: 'المس شيئًا غيرَ حيٍّ خلقَه الله.', a: 'rock' }, { q: 'المس مخلوقًا حيًّا يتكاثرُ بوضعِ البيوض.', a: 'lizard' }, { q: 'المس شيئًا غيرَ حيٍّ صنعَه الإنسان.', a: 'car' }]
  };
}

/* ═════════ ٢) حاجات المخلوقات الحية (ص ٣٠–٣١) ═════════ */
export function needsModel(api) {
  const root = new THREE.Group(); let t = 0, sel = -1;
  const C = [
    { id: 'food', e: '🍃', n: 'الغذاء', c: '#7cc35a', who: ['🐜', '🦁'], info: 'تحصلُ المخلوقاتُ الحيّةُ على الطاقةِ من الغذاء؛ الحيواناتُ تتغذّى على مخلوقاتٍ أخرى، والنباتاتُ تصنعُ غذاءها بنفسِها.' },
    { id: 'water', e: '💧', n: 'الماء', c: '#4aa8e8', who: ['🦌', '🌱'], info: 'يدخلُ الماءُ في تركيبِ أجسامِ جميعِ المخلوقات؛ لتفكيكِ الطعامِ ونقلِه والتخلّصِ من الفضلات. ﴿وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ﴾.' },
    { id: 'gas', e: '🫧', n: 'الغازات', c: '#b9d8f5', who: ['🐋', '🐟'], info: 'تحتاجُ معظمُ المخلوقاتِ إلى الأكسجين؛ الأسماكُ تأخذُه من الماء، والحوتُ يصعدُ إلى السطحِ ليأخذَه من الهواء، والنباتاتُ تحتاجُ ثانيَ أكسيدِ الكربون.' },
    { id: 'space', e: '🏠', n: 'المكان', c: '#e8b46a', who: ['🦊', '🐇'], info: 'تحتاجُ المخلوقاتُ إلى أماكنَ تحصلُ منها على حاجاتِها؛ فالحوتُ يحتاجُ مكانًا واسعًا، والثعالبُ والأرانبُ تحتاجُ جحورًا آمنة.' }
  ];
  const center = node(root, '🧒', [0, .4, 0], 1.2, 'rgba(255,240,200,.95)');
  const lab = txt('حاجاتُ المخلوقاتِ الحيّة', .32, '#333'); lab.position.set(0, 1.5, 0); root.add(lab);
  const S = C.map((c, i) => {
    const a = i / 4 * TAU + Math.PI / 4, p = [Math.sin(a) * 2.7, .2, Math.cos(a) * 1.9];
    const pad = mesh(new THREE.CylinderGeometry(.9, .9, .15, 40), mat(c.c, { roughness: .6 }), [p[0], -.4, p[2]]); root.add(pad);
    const nd = node(root, c.e, p, 1, 'rgba(255,255,255,.92)');
    const w = c.who.map((e, k) => node(root, e, [p[0] + (k ? .55 : -.55), -.05, p[2] + .5], .5, null));
    const ar = arrowTube([p, [p[0] * .5, .7, p[2] * .5], [p[0] * .18, .45, p[2] * .18]], .035, c.c, .22); root.add(ar);
    const f = new Flow(root, c.c, .06, 10); f.addPath(ar.userData.curve, .5); f.rate = 2;
    const l = txt(c.n, .3, '#222'); l.position.set(p[0], 1.15, p[2]); root.add(l);
    return { c, nd, pad, w, f, ar };
  });
  function apply() { S.forEach((s, i) => { const on = sel < 0 || sel === i; s.nd.g.scale.setScalar(on ? 1.1 : .6); s.ar.visible = on; s.f.rate = on ? 3 : 0; s.w.forEach(x => x.g.visible = on); }); }
  apply();
  const parts = S.map(s => ({ id: s.c.id, name: s.c.n, info: s.c.info, objs: [s.nd.p, s.pad], at: anchor(s.nd.g, [0, .6, 0]) }));
  return {
    root, parts,
    update(dt) { t += dt; S.forEach(s => s.f.update(dt)); center.g.position.y = .4 + Math.sin(t * 2) * .05; },
    cam: { pos: [0, 4.2, 6.8], target: [0, 0, 0] }, inpage: { pos: [0, 4.4, 6.8], target: [0, 0, 0] },
    controls: [{ type: 'seg', label: 'الحاجة', options: ['الكل', ...C.map(c => c.n)], value: 0, on: k => { sel = k - 1; apply(); if (sel >= 0) api.toast(C[sel].info); else api.toast('إذا لم تتوافرْ هذه الحاجاتُ للمخلوقاتِ الحيّةِ فإنّها تموت.'); } }],
    quiz: [{ q: 'المس الحاجةَ التي يصعدُ الحوتُ إلى سطحِ الماءِ ليحصلَ عليها.', a: 'gas' }, { q: 'المس الحاجةَ التي تتمثّلُ في الجحورِ الآمنة.', a: 'space' }, { q: 'المس الحاجةَ التي تمتصُّها الجذورُ من التربة.', a: 'water' }]
  };
}

/* ═════════ ٣) أجزاء النبات (ص ٣٨–٣٩) ═════════ */
export function plantpartsModel(api) {
  const root = new THREE.Group(); let t = 0, xray = true;
  const soil = mesh(new THREE.BoxGeometry(5, 2, 3), mat('#fff', { map: noiseTexture('#7a4a2a', '#5a3218', 3000), transparent: true, opacity: .55 }), [0, -1.3, 0]); root.add(soil);
  const grass = mesh(new THREE.BoxGeometry(5, .06, 3), mat('#6aa84f'), [0, -.27, 0]); root.add(grass);
  const sky = mesh(new THREE.PlaneGeometry(9, 5), mat('#d8eefc', { side: 2 }), [0, 1.5, -1.6]); root.add(sky);
  const rootsG = new THREE.Group(); root.add(rootsG); const rM = mat('#d9b98a');
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; rootsG.add(tube([[0, -.3, 0], [Math.cos(a) * .3, -.9, Math.sin(a) * .3], [Math.cos(a) * .7, -1.6 - Math.random() * .4, Math.sin(a) * .6]], .035, rM, 20, 6)); for (let k = 0; k < 3; k++) rootsG.add(tube([[Math.cos(a) * .4, -1.1 - k * .15, Math.sin(a) * .4], [Math.cos(a + .4) * .7, -1.3 - k * .15, Math.sin(a + .4) * .7]], .012, rM, 8, 4)); }
  const stemM = mat('#4f8f3a'); const stem = tube([[0, -.3, 0], [.05, .5, 0], [-.05, 1.3, 0], [0, 2, 0]], .07, stemM, 30, 10); root.add(stem);
  const leaves = new THREE.Group(); root.add(leaves); const lM = mat('#3f9a3a', { side: 2 });
  const leafGeo = new THREE.SphereGeometry(.35, 16, 8); leafGeo.scale(1.6, .12, .7);
  [[.35, .4, 0, .3], [-.35, .8, .1, -.3], [.38, 1.2, -.1, .2], [-.36, 1.55, 0, -.2]].forEach(([x, y, z, r]) => { const l = new THREE.Mesh(leafGeo, lM); l.position.set(x, y, z); l.rotation.z = r; leaves.add(l); });
  const flower = new THREE.Group(); flower.position.set(0, 2.05, 0); root.add(flower);
  for (let i = 0; i < 6; i++) { const p = mesh(new THREE.SphereGeometry(.22, 14, 8), mat('#c0202a'), [Math.cos(i / 6 * TAU) * .25, 0, Math.sin(i / 6 * TAU) * .25]); p.scale.set(1, .35, 1); flower.add(p); }
  flower.add(mesh(new THREE.SphereGeometry(.12, 12, 8), mat('#f2c230'), [0, .05, 0]));
  const sun = node(root, '☀️', [-2.6, 2.6, -1], 1.1, null);
  const parts = [
    { id: 'roots', name: 'الجذور', info: 'تنمو تحتَ سطحِ التربة؛ تمتصُّ الماءَ والأملاحَ المعدنية، وتثبّتُ النباتَ في التربة.', objs: rootsG.children, at: anchor(root, [.8, -1.3, .5]) },
    { id: 'stem', name: 'الساق', info: 'قوامُ النبات؛ تحملُ الأوراقَ وتنقلُ الماءَ والأملاحَ من الجذورِ إلى الأوراقِ وبقيّةِ الأجزاء.', objs: [stem], at: anchor(root, [0, .9, 0]) },
    { id: 'leaves', name: 'الأوراق', info: 'أجزاءٌ خضراءُ تصنعُ الغذاءَ للنباتِ مستخدمةً طاقةَ الشمس.', objs: leaves.children, at: anchor(root, [.6, 1.25, 0]) },
    { id: 'flower', name: 'الزهرة', info: 'لبعضِ النباتاتِ أزهارٌ وثمارٌ تساعدُها على التكاثر.', objs: flower.children, at: anchor(flower, [0, .35, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; leaves.rotation.y = Math.sin(t * .6) * .15; flower.rotation.y += dt * .3; },
    cam: { pos: [2.4, 1.2, 5.8], target: [0, .2, 0] }, inpage: { pos: [1.6, .9, 6.2], target: [0, .2, 0] },
    controls: [{ type: 'button', label: '👁️ إظهار ما تحت التربة', toggle: true, value: true, on: on => { soil.material.opacity = on ? .55 : 1; soil.material.needsUpdate = true; } }],
    quiz: [{ q: 'المس الجزءَ الذي ينمو تحتَ سطحِ التربة.', a: 'roots' }, { q: 'المس الجزءَ الذي يصنعُ الغذاء.', a: 'leaves' }, { q: 'المس الجزءَ الذي يحملُ الأوراقَ وينقلُ الماء.', a: 'stem' }]
  };
}

/* ═════════ ٤) من البذرة إلى النبتة (ص ٥٤–٥٥) ═════════ */
export function seedModel(api) {
  const root = new THREE.Group(); let stage = 0, t = 0, cut = false;
  const soil = mesh(new THREE.BoxGeometry(4, 2.2, 2.4), mat('#fff', { map: noiseTexture('#5a3a22', '#2e1c10', 3000), transparent: true, opacity: .42, depthWrite: false, bump: false }), [0, -1.4, 0]); root.add(soil);
  const seed = new THREE.Group(); seed.position.set(0, -.8, 0); root.add(seed);
  const coat = mesh(organGeo(.42, v => { if (v.y < 0) v.y *= 1 - .45 * Math.exp(-Math.pow(v.x / .14, 2)); v.y += v.x * v.x * .35; }, 48, 32), new THREE.MeshPhysicalMaterial({ color: '#a8362a', roughness: .25, clearcoat: 1, clearcoatRoughness: .1, transparent: true, opacity: 1, bumpMap: tissueBump('pore', 33), bumpScale: .4 })); coat.scale.set(1.3, .9, .9); seed.add(coat);
  const food = mesh(new THREE.SphereGeometry(.38, 24, 16), mat('#d8e8a0')); food.scale.set(1.25, .85, .85); seed.add(food);
  const embryo = mesh(new THREE.SphereGeometry(.1, 12, 8), mat('#f2e08a', { emissive: '#d0b030', emissiveIntensity: .3 }), [.38, .05, .15]); seed.add(embryo);
  const radicle = tube([[0, -.85, 0], [0, -1.4, 0], [.05, -2, 0]], .045, mat('#f2ecd0'), 20, 8); root.add(radicle);
  const rootsMore = new THREE.Group(); root.add(rootsMore); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; rootsMore.add(tube([[0, -1.3, 0], [Math.cos(a) * .4, -1.7, Math.sin(a) * .3], [Math.cos(a) * .7, -2.3, Math.sin(a) * .5]], .018, mat('#e8dcb8'), 12, 4)); }
  const shoot = tube([[0, -.75, 0], [0, -.2, 0], [0, .5, 0], [0, 1.2, 0]], .05, mat('#c8e070'), 24, 8); root.add(shoot);
  const leaves = new THREE.Group(); leaves.position.set(0, 1.2, 0); root.add(leaves); const lg = organGeo(.3, v => { const t = (v.x / .3 + 1) / 2; v.x *= 1.5; v.y *= .06; v.z *= .8 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.05 + .02)), .8); v.y += v.x * v.x * .25; }, 32, 20);
  [[.35, 0, .3], [-.35, 0, -.3]].forEach(([x, y, r]) => { const l = new THREE.Mesh(lg, mat('#5aa83a', { side: 2, bumpMap: tissueBump('vein', 34), bumpScale: 2 })); l.position.set(x, y, 0); l.rotation.z = r; leaves.add(l); });
  const big = new THREE.Group(); root.add(big); for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(lg, mat('#3f8f32', { side: 2, bumpMap: tissueBump('vein', 34), bumpScale: 2 })); l.position.set((i % 2 ? .45 : -.45), 1.5 + i * .3, 0); l.rotation.z = i % 2 ? .3 : -.3; big.add(l); }
  const pods = new THREE.Group(); root.add(pods); for (let i = 0; i < 3; i++) { const p = mesh(new THREE.CapsuleGeometry(.07, .5, 6, 10), mat('#6ab04a'), [(i - 1) * .35, 1.8 + i * .2, .2], [0, 0, .4 * (i - 1)]); pods.add(p); }
  const lab = txt('', .3, '#333'); lab.position.set(0, 3.1, 0); root.add(lab);
  const ST = ['١- تُزرعُ البذرةُ في التربة', '٢- تمتصُّ الماءَ وتنتفخُ ويبدأُ الجذرُ في النموِّ إلى أسفل', '٣- تطولُ الجذورُ وتندفعُ الساقُ عاليًا فوقَ الأرض', '٤- تنمو الأوراقُ وتبدأُ في صنعِ الغذاء', '٥- يكبرُ النباتُ ويصبحُ قادرًا على إنتاجِ بذورٍ جديدة'];
  const G = { r: 0, rm: 0, sh: 0, lv: 0, bg: 0, sw: 1 };
  function tgt() { return { r: stage >= 1 ? 1 : 0, rm: stage >= 2 ? 1 : 0, sh: stage >= 2 ? 1 : 0, lv: stage >= 3 ? 1 : 0, bg: stage >= 4 ? 1 : 0, sw: stage >= 1 ? 1.15 : 1 }; }
  function apply() { setTxt(lab, ST[stage]); }
  apply();
  const parts = [
    { id: 'coat', name: 'الغلاف', info: 'غلافٌ صلبٌ يحمي الجنينَ وغذاءه.', objs: [coat], at: anchor(seed, [-.4, .45, 0]) },
    { id: 'food', name: 'الغذاء المخزون', info: 'يستمدُّ الجنينُ منه غذاءه لينمو.', objs: [food], at: anchor(seed, [0, .4, .3]) },
    { id: 'embryo', name: 'الجنين', info: 'جزءٌ صغيرٌ في البذرةِ ينمو ليصبحَ نباتًا جديدًا.', objs: [embryo], at: anchor(seed, [.45, .3, .15]) },
    { id: 'root', name: 'الجذر', info: 'أوّلُ ما يخرجُ من البذرةِ وينمو إلى أسفلِ التربة.', objs: [radicle, ...rootsMore.children], at: anchor(root, [.3, -1.8, .2]), hidden: () => stage < 1 },
    { id: 'shoot', name: 'الساق', info: 'تندفعُ عاليًا فوقَ الأرض.', objs: [shoot], at: anchor(root, [.25, .4, 0]), hidden: () => stage < 2 },
    { id: 'leaf', name: 'الأوراق', info: 'تنمو وتبدأُ في صنعِ الغذاءِ للنبات.', objs: leaves.children, at: anchor(leaves, [.6, .2, 0]), hidden: () => stage < 3 }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; const T = tgt(); for (const k in G) G[k] = lerp(G[k], T[k], Math.min(1, dt * 2.5));
      seed.scale.setScalar(G.sw); radicle.scale.set(1, Math.max(.01, G.r), 1); radicle.position.y = (1 - G.r) * -.85 * 0; radicle.visible = G.r > .02;
      rootsMore.visible = G.rm > .05; rootsMore.scale.setScalar(Math.max(.01, G.rm));
      shoot.visible = G.sh > .02; shoot.scale.set(1, Math.max(.01, G.sh), 1); shoot.position.y = -.75 * (1 - G.sh);
      leaves.visible = G.lv > .05; leaves.scale.setScalar(Math.max(.01, G.lv)); leaves.position.y = 1.2 * G.sh;
      big.visible = G.bg > .05; big.scale.setScalar(Math.max(.01, G.bg)); pods.visible = G.bg > .6;
      coat.material.opacity = stage >= 2 ? .35 : 1;
    },
    cam: { pos: [2.2, 1.4, 5.6], target: [0, -.4, 0] }, inpage: { pos: [1.8, 1.2, 5.8], target: [0, -.4, 0] },
    controls: [{ type: 'steps', value: 0, steps: ST.map(s => ({ t: s, d: 'تحتاجُ البذرةُ إلى الماءِ والغذاءِ ودرجةِ حرارةٍ مناسبةٍ لتنبت.' })), on: i => { stage = i; apply(); api.refreshParts && api.refreshParts(); } }],
    quiz: [{ q: 'المس الجزءَ الذي ينمو ليصبحَ نباتًا.', a: 'embryo' }, { q: 'المس الجزءَ الذي يحمي الجنينَ وغذاءه.', a: 'coat' }]
  };
}

/* ═════════ ٥) دورات حياة الحيوانات (ص ٦٤–٦٨) ═════════ */
export function acycleModel(api, variant = 0) {
  const root = new THREE.Group(); let v = variant === 2 ? 2 : 0, t = 0, step = -1;
  const SETS = [
    { n: 'الضفدع', c: '#4aa8d8', bg: '#cfe8f5', meta: true, s: [['🫧', 'البيضة', 'تضعُ أنثى الضفدعِ بيوضَها في الماء.'], ['🐟', 'أبو ذنيبة', 'يفقسُ من البيضة، ويسبحُ ويتنفّسُ بالخياشيمِ كالأسماك.'], ['🦎', 'الضفدع الصغير', 'ينمو أبو ذنيبةَ وتبدأُ الأرجلُ والرئتانِ في التكوّن.'], ['🐸', 'الضفدع المكتمل', 'يشبهُ أبويه، وينتقلُ إلى اليابسة، ويستطيعُ التكاثر.']] },
    { n: 'الخنفساء', c: '#7cc35a', bg: '#e6f5d8', meta: true, s: [['🟡', 'البيضة', 'تبدأُ الخنفساءُ حياتَها من البيضة.'], ['🐛', 'اليرقة', 'تخرجُ عندما تفقسُ البيضة، وتتغذّى على الحشراتِ الصغيرةِ لتنمو.'], ['🫘', 'العذراء', 'تتكوّنُ حولَها قشرةٌ صلبة، وبعدَها تنمو أجنحتُها.'], ['🐞', 'الخنفساء المكتملة', 'لها أجنحةٌ حمراء، وتستطيعُ إناثُها وضعَ البيوض.']] },
    { n: 'السلحفاة البحرية', c: '#8a5ad0', bg: '#ece2f8', meta: false, s: [['🥚', 'البيضة', 'تزحفُ الإناثُ لتضعَ بيوضَها في رملِ الشاطئ.'], ['🐢', 'السلاحف الصغيرة', 'تفقسُ على الشاطئ ثم تزحفُ بسرعةٍ نحوَ ماءِ البحر.'], ['🐢', 'السلحفاة المكتملة', 'تنمو حتى ١٤٠ كجم، وتبقى الإناثُ في البحرِ حتى يحينَ موعدُ وضعِ البيض.']] },
    { n: 'الأسماك', c: '#e85a4a', bg: '#fbe2de', meta: false, s: [['⚪', 'البيضة', 'ينتقلُ بيضُ الأسماكِ عبرَ الماء، أو يستقرُّ في القاع.'], ['🐟', 'الأسماك الصغيرة', 'تفقسُ وتبدأُ البحثَ عن الغذاء.'], ['🐠', 'السمكة المكتملة', 'تستمرُّ في النموِّ خلالَ حياتِها، وتضعُ الإناثُ آلافَ البيوضِ كلَّ سنة.']] },
    { n: 'الدجاجة', c: '#f2a23a', bg: '#fdf0d8', meta: false, s: [['🥚', 'البيضة', 'تبني الطيورُ أعشاشًا وترقدُ على البيضِ حتى يفقس.'], ['🐥', 'الصوص', 'يفقسُ ويشبهُ أبويه، وتعتني به الأمّ.'], ['🐔', 'الدجاجة المكتملة', 'تكبرُ وتصبحُ قادرةً على وضعِ البيض.']] },
    { n: 'الجمل', mam: true, c: '#c8843a', bg: '#f8ead8', meta: false, s: [['🐪', 'حديث الولادة', 'يشبهُ أبويه، ويعتمدُ عليهما في توفيرِ الرعايةِ والغذاء.'], ['🐫', 'الجمل الصغير', 'ينمو ويتعلّمُ تدريجيًّا كيف يعتمدُ على نفسِه.'], ['🐪', 'الجمل المكتمل', 'يعتمدُ على نفسِه، ويصبحُ قادرًا على التكاثر.']] }
  ];
  if (variant) SETS.splice(0, SETS.length,
    { n: 'الماعز', mam: true, c: '#c8843a', bg: '#f8ead8', meta: false, s: [['🐐', 'ماعزٌ حديثُ الولادة', 'يتكوّنُ صغيرُ الماعزِ في بطنِ أمِّه ثم يولد، وترضعُه أمُّه حليبَها حتّى ينمو.'], ['🐐', 'ماعزٌ صغير', 'ينمو ويكبرُ ويشبهُ أبويه.'], ['🐐', 'ماعزٌ مكتملُ النموّ', 'عندما يكبرُ يُنجبُ صغارًا، وتبدأُ دورةُ حياةٍ جديدة.']] },
    { n: 'الدجاجة', c: '#f2a23a', bg: '#fdf0d8', meta: false, s: [['🥚', 'البيضة', 'تضعُ الدجاجةُ بيضًا يفقسُ منه الصوص.'], ['🐣', 'الصوص', 'يفقسُ البيضةَ للخروجِ منها، ويصيرُ قادرًا على الرؤيةِ والمشيِ وإطعامِ نفسِه.'], ['🐔', 'دجاجةٌ مكتملةُ النموّ', 'الصوصُ يكبرُ وينمو ليصبحَ دجاجةً أو ديكًا، وتضعُ الدجاجةُ بيضًا جديدًا.']] },
    { n: 'الفراشة', c: '#4aa8d8', bg: '#e2f0fa', meta: true, s: [['🥚', 'البيضة', 'تبدأُ الفراشةُ حياتَها من بيضةٍ تتكوّنُ داخلَها يرقة.'], ['🐛', 'اليرقة', 'تخرجُ اليرقةُ من البيضة، وتأكلُ النباتات، وتنمو.'], ['🟤', 'العذراء', 'تتوقّفُ اليرقةُ عن الحركة، ويصبحُ جلدُها قشرةً صُلبة، وفي داخلِها تتغيّرُ ببطء.'], ['🦋', 'الفراشة', 'تخرجُ الفراشةُ من القشرة، وتكبرُ وتطير.']] });
  const disk = mesh(new THREE.CylinderGeometry(3.4, 3.4, .2, 64), mat('#fff'), [0, -.8, 0]); root.add(disk);
  const G = new THREE.Group(); root.add(G); let N = [], arrows = [];
  const title = txt('', .36, '#333'); title.position.set(0, 2.5, 0); root.add(title);
  const tag = txt('', .26, '#a02020'); tag.position.set(0, 2.05, 0); root.add(tag);
  function build() {
    G.clear(); N = []; arrows = []; const S = SETS[v]; disk.material.color.set(S.bg);
    const n = S.s.length; S.s.forEach((st, i) => { const a = -i / n * TAU + Math.PI; const p = [Math.sin(a) * 2.2, 0, Math.cos(a) * 1.5]; const sc = SETS[v].mam ? .7 + i * .25 : (i === n - 1 ? 1.15 : .75 + i * .12); const nd = node(G, st[0], p, sc, 'rgba(255,255,255,.92)'); const l = txt(st[1], .26, '#222'); l.position.set(p[0], -.35, p[2] + .5); G.add(l); N.push(nd); });
    for (let i = 0; i < n; i++) { const A = N[i].g.position, B = N[(i + 1) % n].g.position; const mid = A.clone().add(B).multiplyScalar(.5).multiplyScalar(1.25); mid.y = .3; const ar = arrowTube([A.clone().lerp(B, .22).toArray(), mid.toArray(), A.clone().lerp(B, .78).toArray()], .04, S.c, .25); G.add(ar); arrows.push(ar); }
    setTxt(title, 'دورةُ حياةِ ' + S.n); setTxt(tag, S.meta ? 'تمرُّ بمرحلةِ التحوّل' : (SETS[v].mam ? 'تلدُ صغارَها وتعتني بها' : 'لا تمرُّ بالتحوّل؛ يشبهُ الصغيرُ أبويه'), S.meta ? '#a02020' : '#1a6a2a');
    api.refreshParts && api.refreshParts();
  }
  build();
  const parts = [0, 1, 2, 3].map(i => ({ id: 's' + i, get name() { const s = SETS[v].s[i]; return s ? s[1] : ''; }, get info() { const s = SETS[v].s[i]; return s ? s[2] : ''; }, get objs() { return N[i] ? [N[i].p] : []; }, at: new THREE.Object3D(), hidden: () => !N[i] }));
  parts.forEach(p => root.add(p.at));
  return {
    root, parts,
    update(dt) { t += dt; parts.forEach((p, i) => { if (N[i]) p.at.position.copy(N[i].g.position).add(V(0, .6, 0)); }); N.forEach((nd, i) => nd.g.position.y = Math.sin(t * 2 + i) * .06 + (i === step ? .25 : 0)); },
    cam: { pos: [0, 4.2, 6.6], target: [0, .2, 0] }, inpage: { pos: [0, 4.4, 6.6], target: [0, .2, 0] },
    controls: [{ type: 'seg', label: 'الحيوان', options: SETS.map(s => s.n), value: v, on: k => { v = k; step = -1; build(); } }],
    quiz: variant ? [{ q: 'اختر الفراشة، ثم المس مرحلةَ العذراء.', a: 's2' }, { q: 'اختر الدجاجة، ثم المس الصوص.', a: 's1' }, { q: 'اختر الماعز، ثم المس الماعزَ الصغير.', a: 's1' }] : [{ q: 'اختر الضفدع، ثم المس المرحلةَ التي يتنفّسُ فيها بالخياشيم.', a: 's1' }, { q: 'اختر الخنفساء، ثم المس المرحلةَ التي تتكوّنُ فيها قشرةٌ صلبة.', a: 's2' }]
  };
}

/* ═════════ ٦) السلسلة الغذائية على اليابسة (ص ٨٤–٨٥) ═════════ */
export function chain3Model(api) {
  const root = new THREE.Group(); let step = -1, t = 0;
  const I = [['☀️', 'الطاقة الشمسية', 'مصدرُ الطاقة؛ النباتاتُ تحصلُ على الطاقةِ من ضوءِ الشمس.'], ['🌿', 'الأعشاب (منتج)', 'المنتجُ أوّلُ مخلوقٍ في السلسلة؛ يصنعُ غذاءه بنفسِه.'], ['🦗', 'الجراد (مستهلك)', 'الجرادُ يأكلُ الأعشاب.'], ['🐦', 'العصافير (مستهلك)', 'العصافيرُ تأكلُ الجراد.'], ['🐈', 'القطط (مستهلك)', 'القططُ تأكلُ العصافير.'], ['🪱', 'ديدان الأرض (محلّلات)', 'تحلّلُ بقايا النباتاتِ والحيواناتِ بعدَ موتِها، فتضيفُ أملاحًا معدنيةً جديدةً إلى التربة.']];
  root.add(ground(4.2, '#9ac26a', '#7aa24a'));
  const pos = [[-3.2, 2.2, -1], [-2.2, -.1, .4], [-.9, .2, 1], [.5, .6, .8], [1.9, .2, .4], [1.4, -.25, -1.4]];
  const N = I.map((it, i) => node(root, it[0] === '🪱' ? '🐛' : it[0], pos[i], i === 0 ? 1.1 : .9, i === 0 ? null : 'rgba(255,255,255,.9)'));
  const flows = [];
  for (let i = 0; i < 5; i++) { const A = N[i].g.position, B = N[i + 1].g.position; const mid = A.clone().add(B).multiplyScalar(.5).add(V(0, .7, .3)); const ar = arrowTube([A.toArray(), mid.toArray(), B.clone().lerp(A, .25).toArray()], .04, i === 4 ? '#8a6a4a' : '#f2c21a', .25); root.add(ar); const f = new Flow(root, '#ffe04a', .06, 14); f.addPath(ar.userData.curve, .5); flows.push({ ar, f }); }
  function hi() { flows.forEach((x, i) => { x.ar.visible = step < 0 || i === step; x.f.rate = step < 0 || i === step ? 3 : 0; }); }
  hi();
  const parts = I.map((it, i) => ({ id: 'n' + i, name: it[1], info: it[2], objs: [N[i].p], at: anchor(N[i].g, [0, .6, 0]) }));
  return {
    root, parts,
    update(dt) { t += dt; flows.forEach(x => x.f.update(dt)); N[2].g.position.y = pos[2][1] + Math.abs(Math.sin(t * 3)) * .15; },
    cam: { pos: [0, 2.1, 6.4], target: [0, .4, 0] }, inpage: { pos: [0, 2, 6.6], target: [0, .4, 0] },
    controls: [{ type: 'steps', value: -1, steps: ['الشمس ← الأعشاب', 'الأعشاب ← الجراد', 'الجراد ← العصافير', 'العصافير ← القطط', 'القطط ← ديدان الأرض (المحلّلات)'].map((s, i) => ({ t: (i + 1) + '- ' + s, d: 'تنتقلُ الطاقةُ من مخلوقٍ إلى آخرَ في اتّجاهِ السهم.' })), on: i => { step = i; hi(); } }],
    legend: [['#ffe04a', 'انتقال الطاقة']],
    quiz: [{ q: 'المس المنتج.', a: 'n1' }, { q: 'المس المحلّلات.', a: 'n5' }, { q: 'المس المستهلكَ الذي يأكلُ الجراد.', a: 'n3' }]
  };
}

/* ═════════ ٧) تكيف الجمل في الصحراء (ص ٩٢) ═════════ */
export function camelModel(api) {
  const root = new THREE.Group(); let t = 0, walk = true;
  const sand = mesh(new THREE.CylinderGeometry(4.5, 4.6, .3, 64), mat('#fff', { map: noiseTexture('#e8c88a', '#d0a868', 3000) }), [0, -1.35, 0]); root.add(sand);
  for (const [x, z, s] of [[-2.8, -2, 1.2], [2.6, -2.2, 1], [3, 1.6, .7]]) { const d = mesh(new THREE.SphereGeometry(s, 24, 12, 0, TAU, 0, Math.PI / 2), mat('#e2bc78'), [x, -1.2, z]); d.scale.y = .35; root.add(d); }
  const M = mat('#d8b47a', { roughness: .8 }), D = mat('#b8925a');
  const camel = new THREE.Group(); root.add(camel);
  const body = mesh(new THREE.CapsuleGeometry(.55, 1.4, 10, 20), M, [0, .6, 0], [0, 0, Math.PI / 2]); camel.add(body);
  const hump = mesh(new THREE.SphereGeometry(.55, 24, 16), M, [-.1, 1.15, 0]); hump.scale.set(1, .9, .8); camel.add(hump);
  const neck = tube([[.85, .8, 0], [1.25, 1.3, 0], [1.4, 1.9, 0]], .2, M, 20, 12); camel.add(neck);
  const head = mesh(new THREE.CapsuleGeometry(.2, .45, 8, 12), M, [1.65, 1.95, 0], [0, 0, Math.PI / 2 - .2]); camel.add(head);
  const lip = mesh(new THREE.SphereGeometry(.12, 12, 8), D, [1.95, 1.86, 0]); lip.scale.set(1, .6, 1.2); camel.add(lip);
  const split = mesh(new THREE.BoxGeometry(.03, .1, .02), mat('#5a3a1a'), [2.04, 1.84, 0]); camel.add(split);
  camel.add(mesh(new THREE.SphereGeometry(.03, 8, 6), mat('#111'), [1.78, 2.06, .14]));
  const legs = [], pads = [];
  for (const [x, z] of [[-.7, -.25], [-.7, .25], [.7, -.25], [.7, .25]]) { const lg = new THREE.Group(); lg.position.set(x, .3, z); camel.add(lg); lg.add(mesh(new THREE.CylinderGeometry(.09, .07, 1.35, 10), M, [0, -.67, 0])); const pad = mesh(new THREE.CylinderGeometry(.17, .19, .1, 16), D, [0, -1.37, 0]); pad.scale.z = 1.2; lg.add(pad); legs.push(lg); pads.push(pad); }
  camel.add(tube([[-1.05, .8, 0], [-1.2, .3, 0]], .04, M, 8, 6));
  const thorn = new THREE.Group(); thorn.position.set(2.6, -1.2, .9); root.add(thorn); for (let i = 0; i < 6; i++) { const b = tube([[0, 0, 0], [Math.cos(i) * .3, .4, Math.sin(i) * .3], [Math.cos(i) * .5, .8, Math.sin(i) * .5]], .025, mat('#6a8a3a'), 12, 5); thorn.add(b); for (let k = 0; k < 4; k++) thorn.add(mesh(new THREE.ConeGeometry(.015, .12, 4), mat('#c8d8a0'), [Math.cos(i) * .1 * k, .2 * k + .1, Math.sin(i) * .1 * k])); }
  const sun = node(root, '☀️', [-3, 3, -1.5], 1.2, null);
  const parts = [
    { id: 'hump', name: 'السنام', info: 'يخزّنُ الجملُ الدهونَ في سنامِه لتساعدَه على البقاءِ فترةً طويلةً من دونِ غذاء.', objs: [hump], at: anchor(camel, [-.1, 1.75, 0]) },
    { id: 'lip', name: 'الشفة المشقوقة', info: 'تساعدُه على أكلِ النباتاتِ الصحراويةِ ذاتِ الأشواكِ الكثيرة.', objs: [lip, split, head], at: anchor(camel, [2, 2.15, 0]) },
    { id: 'pad', name: 'الخفّ', info: 'يساعدُه على المشيِ فوقَ الرمالِ من دونِ أن يغوصَ فيها أو يشعرَ بحرارتِها.', objs: pads, at: anchor(camel, [.7, -1.05, .45]) },
    { id: 'body', name: 'تحمّل العطش', info: 'للجملِ قدرةٌ على تحمّلِ العطشِ ونقصِ الماءِ في الصحراءِ الحارّة.', objs: [body], at: anchor(camel, [0, .2, .55]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; if (walk) { camel.position.x = Math.sin(t * .4) * .5; legs.forEach((l, i) => l.rotation.z = Math.sin(t * 4 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI / 2 : 0)) * .25); } neck.rotation.z = Math.sin(t) * .03; },
    cam: { pos: [1.4, 1.4, 5.2], target: [.4, .5, 0] }, inpage: { pos: [1, 1.3, 5.4], target: [.4, .5, 0] },
    controls: [{ type: 'button', label: '🐪 يمشي / يقف', toggle: true, value: true, on: on => { walk = on; } }],
    quiz: [{ q: 'المس التركيبَ الذي يخزّنُ الدهون.', a: 'hump' }, { q: 'المس التركيبَ الذي يمنعُ غوصَ الجملِ في الرمال.', a: 'pad' }, { q: 'المس التركيبَ الذي يساعدُه على أكلِ النباتاتِ الشوكية.', a: 'lip' }]
  };
}

/* ═════════ ٨) تكيفات نباتات الصحراء وحيواناتها (ص ٩٤–٩٥) ═════════ */
export function desertModel(api) {
  const root = new THREE.Group(); let night = false, t = 0;
  const sand = mesh(new THREE.BoxGeometry(8, .2, 4), mat('#fff', { map: noiseTexture('#e8c88a', '#d0a868', 3000) }), [0, -.6, 0]); root.add(sand);
  const under = mesh(new THREE.BoxGeometry(8, 2.2, 4), mat('#fff', { map: noiseTexture('#b88a5a', '#8a6038', 3000), transparent: true, opacity: .5 }), [0, -1.8, 0]); root.add(under);
  // شجرة الطلح
  const talh = new THREE.Group(); talh.position.set(-2.2, -.5, 0); root.add(talh);
  talh.add(tube([[0, 0, 0], [.05, .8, 0], [0, 1.3, 0]], .12, mat('#6a4a2a'), 20, 8));
  const canopy = mesh(new THREE.SphereGeometry(1.3, 24, 12), mat('#7a9a4a', { flatShading: true }), [0, 1.6, 0]); canopy.scale.set(1.2, .35, 1); talh.add(canopy);
  const thorns = new THREE.Group(); talh.add(thorns); for (let i = 0; i < 40; i++) { const a = Math.random() * TAU, r = Math.random() * 1.4; thorns.add(mesh(new THREE.ConeGeometry(.02, .16, 4), mat('#f2f2e0'), [Math.cos(a) * r, 1.45 + Math.random() * .2, Math.sin(a) * r * .8])); }
  const talhRoots = new THREE.Group(); talh.add(talhRoots); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; talhRoots.add(tube([[0, 0, 0], [Math.cos(a) * .3, -.8, Math.sin(a) * .3], [Math.cos(a) * .4, -2.1, Math.sin(a) * .3]], .045, mat('#d8c098'), 20, 6)); }
  // الصبار
  const cac = new THREE.Group(); cac.position.set(1.4, -.5, -.3); root.add(cac);
  const cm = mat('#4f9a4a', { roughness: .3, metalness: .05 });
  const pads = [[0, .55, 0, 0], [.35, 1.15, 0, .5], [-.35, 1.05, .1, -.5], [.1, 1.6, 0, .1]].map(([x, y, z, r]) => { const p = mesh(new THREE.SphereGeometry(.4, 20, 14), cm, [x, y, z], [0, 0, r]); p.scale.set(.75, 1, .3); cac.add(p); return p; });
  for (let i = 0; i < 30; i++) { const p = pads[i % 4]; cac.add(mesh(new THREE.ConeGeometry(.012, .1, 4), mat('#fff8d0'), [p.position.x + (Math.random() - .5) * .5, p.position.y + (Math.random() - .5) * .6, .14])); }
  const cacRoots = new THREE.Group(); cac.add(cacRoots); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; cacRoots.add(tube([[0, 0, 0], [Math.cos(a) * .7, -.2, Math.sin(a) * .5], [Math.cos(a) * 1.4, -.35, Math.sin(a) * 1]], .03, mat('#d8c098'), 16, 5)); }
  const bat = node(root, '🦇', [0, 1.5, .5], .8, null); const rabbit = node(root, '🐇', [3, -.1, .8], .8, null); const snake = node(root, '🐍', [-.4, -.35, 1.2], .7, null);
  const sun = node(root, '☀️', [-3.2, 3, -1.5], 1.1, null); const moon = node(root, '🌙', [3.2, 3, -1.5], 1, null);
  const lab = txt('', .3, '#333'); lab.position.set(0, 2.9, 0); root.add(lab);
  function apply() { sun.g.visible = !night; moon.g.visible = night; bat.g.visible = night; snake.g.position.y = night ? -.35 : -.9; sand.material.color.set(night ? '#9a9ab8' : '#ffffff'); setTxt(lab, night ? 'ليلًا: تنشطُ الحيواناتُ عندما يصبحُ الجوُّ باردًا' : 'نهارًا: تختبئُ كثيرٌ من الحيواناتِ من الحرارة', night ? '#2a2a7a' : '#a05a10'); api.refreshParts && api.refreshParts(); }
  apply();
  const parts = [
    { id: 'talhroots', name: 'جذور الطلح الطويلة', info: 'تنمو الجذورُ الطويلةُ تحتَ الأرضِ حيث يمكنُ العثورُ على الماء.', objs: talhRoots.children, at: anchor(talh, [.4, -1.6, .3]) },
    { id: 'thorn', name: 'أشواك الطلح وأوراقه الصغيرة', info: 'الأوراقُ الصغيرةُ تفقدُ كميّاتٍ قليلةً من الماء، والأشواكُ تحمي الشجرةَ من الحيواناتِ الجائعةِ والعطشى.', objs: [canopy, ...thorns.children], at: anchor(talh, [0, 2.1, 0]) },
    { id: 'cactus', name: 'ساق الصبّار السميكة', info: 'تساعدُ الساقُ السميكةُ النباتَ على تخزينِ الماء، والطبقةُ الشمعيةُ تمنعُ تبخّرَه، والأشواكُ تحميه.', objs: pads, at: anchor(cac, [.4, 2, 0]) },
    { id: 'cacroots', name: 'جذور الصبّار السطحية', info: 'جذورٌ سطحيةٌ ممتدّةٌ على مساحةٍ كبيرةٍ لتمتصَّ أكبرَ كميّةٍ ممكنةٍ من ماءِ المطر.', objs: cacRoots.children, at: anchor(cac, [1.2, -.2, .5]) },
    { id: 'bat', name: 'الخفّاش (نشاط ليلي)', info: 'ينشطُ الخفّاشُ ليلًا بحثًا عن الغذاء، وينامُ نهارًا عندَ ارتفاعِ درجةِ الحرارة.', objs: [bat.p], at: anchor(bat.g, [0, .5, 0]), hidden: () => !night },
    { id: 'rabbit', name: 'آذان الأرنب البرّي', info: 'عندما يتدفّقُ دمُها الحارُّ خلالَ الآذانِ الكبيرةِ يفقدُ جزءًا من حرارتِه، فيبقى جسمُها باردًا.', objs: [rabbit.p], at: anchor(rabbit.g, [0, .55, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; if (night) { bat.g.position.x = Math.sin(t) * 1.5; bat.g.position.y = 1.5 + Math.sin(t * 3) * .2; } },
    cam: { pos: [0, 1.5, 6.8], target: [0, .3, 0] }, inpage: { pos: [0, 1.4, 7], target: [0, .3, 0] },
    controls: [{ type: 'seg', label: 'الوقت', options: ['نهار', 'ليل'], value: 0, on: k => { night = k === 1; apply(); } }],
    quiz: [{ q: 'المس التركيبَ الذي يخزّنُ الماءَ في الصبّار.', a: 'cactus' }, { q: 'المس الجذورَ التي تصلُ إلى الماءِ في أعماقِ الأرض.', a: 'talhroots' }, { q: 'المس الحيوانَ الذي تساعدُه آذانُه الكبيرةُ على تبريدِ جسمِه.', a: 'rabbit' }]
  };
}

/* ═════════ ٩) بيئة متغيرة (ص ١٠٨–١٠٩) ═════════ */
export function envstagesModel(api) {
  const root = new THREE.Group(); let stage = 0, t = 0;
  const soil = mesh(new THREE.BoxGeometry(6, 1.2, 3), mat('#fff', { map: noiseTexture('#8a5a32', '#6a3e1e', 3000) }), [0, -1.1, 0]); root.add(soil);
  const top = mesh(new THREE.BoxGeometry(6, .06, 3), mat('#8aa850'), [0, -.47, 0]); root.add(top);
  const seeds = new THREE.Group(); root.add(seeds); for (let i = 0; i < 14; i++) seeds.add(mesh(new THREE.SphereGeometry(.05, 8, 6), mat('#6a4a20'), [(Math.random() - .5) * 5, -.42, (Math.random() - .5) * 2.4]));
  const small = new THREE.Group(); root.add(small); for (let i = 0; i < 18; i++) { const g = new THREE.Group(); g.position.set((Math.random() - .5) * 5, -.45, (Math.random() - .5) * 2.4); g.add(mesh(new THREE.ConeGeometry(.08, .45, 5), mat('#5ab43a'), [0, .22, 0])); if (i % 3 === 0) g.add(mesh(new THREE.SphereGeometry(.07, 8, 6), mat(['#e84a6a', '#f2c23a', '#9a5ae8'][i % 3 === 0 ? (i / 3) % 3 : 0]), [0, .5, 0])); small.add(g); }
  const animals = [node(root, '🐌', [-1.5, -.25, .9], .5, null), node(root, '🦎', [.6, -.25, 1], .55, null), node(root, '🦋', [1.6, .8, .3], .5, null), node(root, '🐦', [-.5, 1.2, -.3], .55, null), node(root, '🐁', [2.2, -.25, -.3], .45, null)];
  const tall = new THREE.Group(); root.add(tall); [[-2, -.9], [.2, -1], [2, -.8]].forEach(([x, z]) => { const tr = tree(2.1, '#3a8a3a'); tr.position.set(x, -.48, z); tall.add(tr); });
  const deerN = node(root, '🦌', [1, -.05, .9], .8, null);
  const lab = txt('', .28, '#333'); lab.position.set(0, 3, 0); root.add(lab);
  const ST = ['١- تسقطُ البذورُ على التربة، فتتغيّرُ البيئةُ عندما تمتصُّ النباتاتُ الماءَ والأملاح', '٢- كلّما نمتِ النباتاتُ تنتقلُ حيواناتٌ إلى البيئةِ فتتّخذُ منها غذاءً ومأوى', '٣- يزدادُ نموُّ النباتات، فتتنافسُ على الماءِ والضوءِ والمكان، وتتنافسُ الحيواناتُ على الغذاء', '٤- تمنعُ الأشجارُ وصولَ الضوءِ إلى النباتاتِ الصغيرة؛ فتموتُ إذا حُجبَ عنها الضوء'];
  const S = { sm: 0, an: 0, tl: 0 };
  function tgt() { return { sm: stage === 0 ? .25 : stage === 3 ? .35 : 1, an: stage >= 1 ? 1 : 0, tl: stage >= 2 ? (stage === 2 ? .6 : 1) : 0 }; }
  setTxt(lab, ST[0]);
  const parts = [
    { id: 'seeds', name: 'البذور', info: 'تسقطُ على التربةِ وتنبتُ فتغيّرُ البيئة.', objs: seeds.children, at: anchor(root, [-2.4, -.2, 1.2]) },
    { id: 'plants', name: 'النباتات الصغيرة', info: 'تمتصُّ الماءَ والأملاحَ من التربة، وتصبحُ غذاءً ومأوًى للحيوانات.', objs: small.children.flatMap(g => g.children), at: anchor(root, [.6, .3, 1.2]) },
    { id: 'trees', name: 'الأشجار الكبيرة', info: 'تتنافسُ مع النباتاتِ الأخرى على الضوءِ والماءِ والمكان، وتحجبُ الضوءَ عن النباتاتِ الصغيرة.', objs: tall.children.flatMap(g => g.children), at: anchor(root, [.2, 2.5, -1]), hidden: () => stage < 2 },
    { id: 'animals', name: 'الحيوانات', info: 'تنتقلُ إلى البيئةِ لتتغذّى على النباتاتِ وتتّخذَها مأوى، وتتنافسُ على الغذاءِ والماء.', objs: animals.map(a => a.p), at: anchor(root, [-1.5, .4, .9]), hidden: () => stage < 1 }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; const T = tgt(); for (const k in S) S[k] = lerp(S[k], T[k], Math.min(1, dt * 2.5));
      small.scale.set(1, Math.max(.02, S.sm), 1); small.children.forEach(g => g.children.forEach(m => m.material.color && (m.material.emissiveIntensity = 0)));
      animals.forEach((a, i) => { a.g.visible = S.an > .1; a.g.scale.setScalar(Math.max(.01, S.an)); }); animals[2].g.position.x = 1.6 + Math.sin(t * 2) * .6;
      tall.visible = S.tl > .03; tall.scale.setScalar(Math.max(.01, S.tl)); deerN.g.visible = stage === 3;
      small.children.forEach(g => g.children[0].material.color.set(stage === 3 ? '#a8a060' : '#5ab43a'));
    },
    cam: { pos: [0, 2.4, 7.6], target: [0, .4, 0] }, inpage: { pos: [0, 2.2, 7.8], target: [0, .4, 0] },
    controls: [{ type: 'steps', value: 0, steps: ST.map(s => ({ t: s, d: 'المخلوقاتُ الحيّةُ تغيّرُ بيئاتِها لتلبيةِ حاجاتِها.' })), on: i => { stage = i; setTxt(lab, ST[i]); api.refreshParts && api.refreshParts(); } }],
    quiz: [{ q: 'انتقل إلى المرحلةِ الرابعة، ثم المس ما يحجبُ الضوءَ عن النباتاتِ الصغيرة.', a: 'trees' }]
  };
}

/* ═════════ ١٠) حماية البيئة: الترشيد والتدوير وإعادة الاستخدام (ص ١١٢) ═════════ */
export function recycleModel(api) {
  const root = new THREE.Group(); let t = 0, sel = -1;
  const floor = mesh(new THREE.BoxGeometry(8, .1, 4), mat('#e8eef2'), [0, -.85, 0]); root.add(floor);
  const B = [['reduce', '💧', 'الترشيد', '#3a9ae8', 'استهلاكُ كميّةٍ أقلَّ من الشيء؛ مثلُ إغلاقِ صنبورِ المياهِ عندَ الانتهاءِ من الشرب.'], ['recycle', '♻️', 'التدوير', '#2aa84a', 'صنعُ منتجاتٍ جديدةٍ من موادَّ قديمة، ويرمزُ إليها بعلامةِ إعادةِ التدوير.'], ['reuse', '🫙', 'إعادة الاستخدام', '#e8a23a', 'استخدامُ الشيءِ أكثرَ من مرّة؛ مثلُ بناءِ منزلٍ بالزجاجاتِ الفارغة.'], ['plant', '🌳', 'التشجير', '#5a9a2a', 'زراعةُ الأشجارِ تنقّي الجوَّ وتوفّرُ المأوى، وتحفظُ التربةَ من الانجراف.']];
  const bins = B.map(([id, e, n, c, info], i) => {
    const x = -2.7 + i * 1.8; const g = new THREE.Group(); g.position.set(x, -.8, 0); root.add(g);
    const box = mesh(new THREE.CylinderGeometry(.6, .5, 1.2, 24, 1, true), mat(c, { side: 2, roughness: .5 }), [0, .6, 0]); g.add(box); g.add(mesh(new THREE.CircleGeometry(.5, 24), mat(c), [0, .02, 0], [-Math.PI / 2, 0, 0]));
    const nd = node(g, e, [0, 1.6, 0], .8, 'rgba(255,255,255,.92)'); const l = txt(n, .26, '#222'); l.position.set(0, -.25, .7); g.add(l);
    return { id, n, info, g, box, nd };
  });
  const items = [['🚿', 0], ['💡', 0], ['📰', 1], ['🧴', 1], ['🥫', 1], ['🛍️', 2], ['🍾', 2], ['🌱', 3]];
  const flying = items.map(([e, b], i) => { const nd = node(root, e, [-3 + i * .85, 2.6, 1], .5, null); return { nd, b, home: V(-3 + i * .85, 2.6, 1), ph: Math.random() * 3 }; });
  const lab = txt('بالطرقِ الثلاثِ تقلُّ النفاياتُ ويقلُّ التلوّث', .28, '#1a6a2a'); lab.position.set(0, 3.4, 0); root.add(lab);
  let sorting = 0;
  const parts = bins.map(b => ({ id: b.id, name: b.n, info: b.info, objs: [b.box, b.nd.p], at: anchor(b.g, [0, 2.2, 0]) }));
  return {
    root, parts,
    update(dt) {
      t += dt; sorting = Math.min(1, sorting + (sel === 9 ? dt * .5 : -dt));
      flying.forEach((f, i) => { const tgt = bins[f.b].g.position.clone().add(V(0, 1 + (i % 2) * .2, .2)); const k = ease(clamp(sorting * 1.6 - i * .08)); f.nd.g.position.lerpVectors(f.home, tgt, k); f.nd.g.position.y += Math.sin(t * 2 + f.ph) * .05 * (1 - k); });
      bins.forEach((b, i) => b.g.scale.setScalar(sel >= 0 && sel < 9 ? (sel === i ? 1.15 : .8) : 1));
    },
    cam: { pos: [0, 2.2, 8], target: [0, .8, 0] }, inpage: { pos: [0, 2, 8.4], target: [0, .8, 0] },
    controls: [
      { type: 'button', label: '🗑️ صنِّفِ الأشياءَ في الطرقِ المناسبة', on: () => { sel = 9; api.toast('كلُّ شيءٍ ذهبَ إلى الطريقةِ المناسبةِ لحمايةِ البيئة.'); } },
      { type: 'seg', label: 'الطريقة', options: ['الكل', ...B.map(b => b[2])], value: 0, on: k => { sel = k ? k - 1 : -1; if (k) api.toast(B[k - 1][4]); } }
    ],
    quiz: [{ q: 'المس الطريقةَ التي تعني استخدامَ الشيءِ أكثرَ من مرّة.', a: 'reuse' }, { q: 'المس الطريقةَ التي تعني صنعَ منتجاتٍ جديدةٍ من موادَّ قديمة.', a: 'recycle' }, { q: 'المس الطريقةَ التي تعني استهلاكَ كميّةٍ أقلّ.', a: 'reduce' }]
  };
}

/* ═════════ ١١) الكوارث الطبيعية واستجابة المخلوقات (ص ١١٨–١٢١) ═════════ */
export function disasterModel(api) {
  const root = new THREE.Group(); let mode = 0, t = 0, k = 0;
  const land = mesh(new THREE.BoxGeometry(8, .4, 4.4), mat('#fff', { map: noiseTexture('#9ac26a', '#7aa24a', 3000) }), [0, -.8, 0]); root.add(land);
  const lake = mesh(new THREE.CylinderGeometry(1.4, 1.4, .1, 40), mat('#3a8ad8', { transparent: true, opacity: .85 }), [1.8, -.55, .4]); lake.scale.z = .7; root.add(lake);
  const cracks = new THREE.Group(); root.add(cracks); for (let i = 0; i < 16; i++) { const a = Math.random() * TAU; cracks.add(mesh(new THREE.BoxGeometry(.9, .02, .03), mat('#5a3a1a'), [(Math.random() - .5) * 7, -.58, (Math.random() - .5) * 3.6], [0, a, 0])); }
  const flood = mesh(new THREE.BoxGeometry(8, .5, 4.4), mat('#8a6a42', { transparent: true, opacity: .75 }), [0, -.4, 0]); root.add(flood);
  const trees = new THREE.Group(); root.add(trees); const TR = []; for (let i = 0; i < 7; i++) { const tr = tree(1 + Math.random() * .3); tr.position.set(-3.4 + (i % 4) * .9, -.6, -1.2 + Math.floor(i / 4) * 1.6); trees.add(tr); TR.push(tr); }
  const flames = new THREE.Group(); root.add(flames); for (let i = 0; i < 18; i++) { const f = mesh(new THREE.ConeGeometry(.15, .6, 8), mat('#ff7a1a', { emissive: '#ff5a00', emissiveIntensity: .9, transparent: true, opacity: .85 }), [-3.4 + Math.random() * 3, -.3, -1.4 + Math.random() * 2.6]); flames.add(f); }
  const smoke = new Flow(root, '#555', .14, 40); smoke.addPath(curve([[-2, 0, 0], [-1.8, 1.5, -.5], [-1.2, 3, -1]]), .5); smoke.rate = 0;
  const sprouts = new THREE.Group(); root.add(sprouts); for (let i = 0; i < 14; i++) sprouts.add(mesh(new THREE.ConeGeometry(.06, .3, 5), mat('#7ad04a'), [-3.4 + Math.random() * 3, -.45, -1.4 + Math.random() * 2.6]));
  const elephant = node(root, '🐘', [1, .1, 1.4], .9, null); const zebra = node(root, '🦓', [2.6, .05, 1.5], .75, null); const frog = node(root, '🐸', [1.4, -.25, -.5], .55, null);
  const lab = txt('', .3, '#333'); lab.position.set(0, 3, 0); root.add(lab);
  const M = ['بيئةٌ طبيعيةٌ متوازنة', 'الفيضان: يغطّي الماءُ الأرضَ فتنجرفُ التربةُ والنباتات، وتفقدُ الحيواناتُ مواطنَها', 'الجفاف: تجفُّ البحيرةُ والتربة؛ فتهاجرُ الفيلةُ والحمرُ الوحشية، ويدفنُ الضفدعُ نفسَه في الطين، وتموتُ النباتات', 'الحريق: تتلفُ النباتاتُ وتتدمّرُ المواطن، ويلوّثُ الدخانُ الهواء', 'بعدَ الحريق: يمكنُ لنباتاتٍ جديدةٍ أن تنموَ'];
  function apply() { setTxt(lab, M[mode], mode === 0 || mode === 4 ? '#1a6a2a' : '#a02020'); smoke.rate = mode === 3 ? 14 : 0; api.refreshParts && api.refreshParts(); }
  apply();
  const parts = [
    { id: 'lake', name: 'البحيرة', info: 'في الجفافِ تجفُّ الأنهارُ والبحيرات، وفي الفيضانِ يفيضُ الماءُ ويغطّي الأرض.', objs: [lake], at: anchor(root, [1.8, -.2, .4]) },
    { id: 'trees', name: 'النباتات', info: 'لا تستطيعُ الانتقالَ من مكانٍ إلى آخر؛ لذا تتعرّضُ للموتِ في الجفافِ والحرائق، وقد تنمو نباتاتٌ جديدةٌ بعدَ الحريق.', objs: TR.flatMap(g => g.children), at: anchor(root, [-2, 1.2, -.4]) },
    { id: 'elephant', name: 'الفيلة (الهجرة)', info: 'تهاجرُ الفيلةُ في موسمِ الجفافِ إلى مواطنَ يتوافرُ فيها ماءٌ وغذاء.', objs: [elephant.p], at: anchor(elephant.g, [0, .6, 0]) },
    { id: 'frog', name: 'الضفدع (التكيّف)', info: 'يدفنُ الضفدعُ نفسَه في الطينِ عندَ حدوثِ الجفاف، ويذهبُ في بياتٍ طويلٍ حتى تصبحَ بيئتُه رطبة.', objs: [frog.p], at: anchor(frog.g, [0, .5, 0]) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; smoke.update(dt);
      const fl = mode === 1 ? 1 : 0, dr = mode === 2 ? 1 : 0, fi = mode === 3 ? 1 : 0, af = mode === 4 ? 1 : 0;
      flood.scale.y = lerp(flood.scale.y, Math.max(.02, fl), dt * 2); flood.visible = flood.scale.y > .05; flood.position.y = -.6 + flood.scale.y * .25;
      lake.scale.x = lerp(lake.scale.x, dr ? .15 : 1, dt * 2); lake.scale.z = lake.scale.x * .7; cracks.visible = dr > 0;
      land.material.color.set(dr ? '#e0c890' : (fi || af) ? '#6a5a4a' : '#ffffff');
      flames.visible = fi > 0; flames.children.forEach((f, i) => f.scale.y = .7 + Math.sin(t * 10 + i) * .3);
      TR.forEach((tr, i) => { tr.visible = !(af || (fi && i < 5)); tr.children.forEach(m => m.material.color && m.geometry.type !== 'CylinderGeometry' && m.material.color.set(dr ? '#a8a050' : fi ? '#3a2a1a' : '#3f8f32')); });
      sprouts.visible = af > 0;
      const away = dr ? 1 : 0; elephant.g.position.x = lerp(elephant.g.position.x, away ? 4.6 : 1, dt); zebra.g.position.x = lerp(zebra.g.position.x, away ? 5.2 : 2.6, dt);
      frog.g.position.y = lerp(frog.g.position.y, dr ? -.75 : -.25, dt * 2);
    },
    cam: { pos: [0, 3, 7.8], target: [0, 0, 0] }, inpage: { pos: [0, 3, 8], target: [0, 0, 0] },
    controls: [{ type: 'seg', label: 'التغيّر', options: ['طبيعي', 'فيضان', 'جفاف', 'حريق', 'بعد الحريق'], value: 0, on: k => { mode = k; apply(); } }],
    quiz: [{ q: 'اختر الجفاف، ثم المس الحيوانَ الذي يتكيّفُ بدفنِ نفسِه في الطين.', a: 'frog' }, { q: 'المس الحيوانَ الذي يهاجرُ بحثًا عن الماءِ والأعشاب.', a: 'elephant' }]
  };
}

/* ═════════ ١٢) التجوية والتعرية والترسيب (ص ١٤٤–١٤٧) ═════════ */
export function erosionModel(api) {
  const root = new THREE.Group(); let t = 0, mode = 0, k = 0;
  const base = mesh(new THREE.BoxGeometry(8, .4, 3.6), mat('#fff', { map: noiseTexture('#d8b07a', '#b88a52', 3000) }), [0, -1, 0]); root.add(base);
  const rock = new THREE.Group(); rock.position.set(-2.6, -.3, 0); root.add(rock);
  const big = mesh(new THREE.DodecahedronGeometry(1.1, 1), mat('#b86a3a', { flatShading: true }), [0, .3, 0]); big.scale.set(1, .9, .9); rock.add(big);
  const crack = mesh(new THREE.BoxGeometry(.05, 1.6, 1.2), mat('#3a2010'), [.1, .4, 0]); rock.add(crack);
  const ice = mesh(new THREE.BoxGeometry(.12, 1.2, 1), glass('#bfe8ff', .8), [.1, .4, 0]); rock.add(ice);
  const shrub = tree(.7, '#3f8f32'); shrub.position.set(.1, 1, 0); rock.add(shrub);
  const frags = []; const fM = mat('#c07a48', { flatShading: true });
  for (let i = 0; i < 40; i++) { const f = mesh(new THREE.DodecahedronGeometry(.08 + Math.random() * .1, 0), fM); const st = V(-2.6 + (Math.random() - .5) * 1.4, -.2 + Math.random() * .9, (Math.random() - .5) * 1.2); const en = V(2 + Math.random() * 1.8, -.75 + Math.random() * .15, (Math.random() - .5) * 2.4); f.position.copy(st); f.userData = { st, en, d: Math.random() * .6 }; f.visible = false; root.add(f); frags.push(f); }
  const river = mesh(new THREE.BoxGeometry(5, .05, .8), mat('#4a9ae8', { transparent: true, opacity: .8 }), [.6, -.78, .9]); root.add(river);
  const water = new Flow(root, '#bfe0ff', .05, 30); water.addPath(curve([[-1.8, -.7, .9], [.6, -.72, .9], [3, -.74, .9]]), .5);
  const wind = new Flow(root, '#ffffff', .03, 30); wind.addPath(curve([[-4, .8, -.5], [-2, .9, -.3], [0, .6, 0], [3, .2, 0]]), .4); wind.rate = 0;
  const dune = mesh(new THREE.SphereGeometry(1.4, 32, 16, 0, TAU, 0, Math.PI / 2), mat('#e8c27a'), [2.8, -.8, -.4]); dune.scale.set(1.2, .01, .8); root.add(dune);
  const lab = txt('', .3, '#333'); lab.position.set(0, 2.6, 0); root.add(lab);
  const M = ['صخرةٌ كبيرة', 'التجوية: تتفتّتُ الصخرةُ بفعلِ الماءِ المتجمّدِ في شقوقِها وجذورِ النباتاتِ والرياح', 'التعرية: تنقلُ المياهُ الجاريةُ والرياحُ والجاذبيةُ الفتاتَ الصخريّ', 'الترسيب: يتجمّعُ الفتاتُ في مكانٍ آخرَ ويشكّلُ كثيبًا رمليًّا'];
  function apply() { setTxt(lab, M[mode]); wind.rate = mode >= 2 ? 10 : 0; frags.forEach(f => f.visible = mode >= 1); }
  apply();
  const parts = [
    { id: 'rock', name: 'الصخرة', info: 'قد يظنُّ البعضُ أنّ الصخورَ لا تتفتّت، لكنّ الصخورَ الكبيرةَ تتفتّتُ ببطءٍ إلى أجزاءٍ أصغر.', objs: [big], at: anchor(rock, [0, 1.5, 0]) },
    { id: 'ice', name: 'الماء المتجمّد في الشقّ', info: 'تتخلّلُ مياهُ الأمطارِ الشقوق، وعندما يتجمّدُ الماءُ داخلَها يزيدُ من تشقّقِها.', objs: [ice, crack], at: anchor(rock, [.1, 1.1, .6]) },
    { id: 'plant', name: 'النبات في شقّ الصخر', info: 'تنمو النباتاتُ في شقوقِ الصخرِ فتفكّكُه؛ فالمخلوقاتُ الحيّةُ يمكنُ أن تسبّبَ التجوية.', objs: shrub.children, at: anchor(rock, [.1, 2, 0]) },
    { id: 'river', name: 'المياه الجارية', info: 'تحملُ مياهُ الأنهارِ والسيولِ فتاتَ الصخورِ وتنقلُه ليتجمّعَ في أماكنَ أخرى.', objs: [river], at: anchor(root, [.6, -.5, .9]) },
    { id: 'dune', name: 'الكثيب الرملي', info: 'تنقلُ الرياحُ الحبيباتِ الصغيرةَ وتترسّبُ مشكّلةً الكثبانَ الرمليةَ التي تميّزُ الصحراء.', objs: [dune], at: anchor(root, [2.8, .2, -.4]), hidden: () => mode < 3 }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; water.update(dt); wind.update(dt);
      const tk = mode === 0 ? 0 : mode === 1 ? .3 : mode === 2 ? .7 : 1; k = lerp(k, tk, dt * 1.2);
      big.scale.setScalar(.9 - k * .35); ice.visible = mode >= 1; ice.scale.x = 1 + Math.sin(t * 2) * .3 * (mode === 1 ? 1 : 0);
      frags.forEach(f => { const s = clamp((k - .25) / .75 * 1.2 - f.userData.d * .3); f.position.lerpVectors(f.userData.st, f.userData.en, ease(s)); if (k < .3) f.position.copy(f.userData.st).add(V(0, Math.sin(t * 3 + f.userData.d * 10) * .02, 0)); });
      dune.scale.y = Math.max(.01, clamp((k - .7) / .3) * .45);
    },
    cam: { pos: [0, 2.2, 7.8], target: [0, 0, 0] }, inpage: { pos: [0, 2, 8], target: [0, 0, 0] },
    controls: [{ type: 'steps', value: 0, steps: M.map((m, i) => ({ t: (i + 1) + '- ' + m.split(':')[0], d: m })), on: i => { mode = i; apply(); api.refreshParts && api.refreshParts(); } }],
    quiz: [{ q: 'المس ما يسبّبُ تشقّقَ الصخرِ عندما يتجمّد.', a: 'ice' }, { q: 'انتقل إلى الترسيب، ثم المس ما تشكّلُه الرياح.', a: 'dune' }]
  };
}

/* ═════════ ١٣) أنواع التربة ونسيجها (ص ١٦٠–١٦١) ═════════ */
export function soiltypesModel(api, variant = 0) {
  const root = new THREE.Group(); let t = 0, pour = 0;
  const T = [
    { id: 'sand', n: 'تربة رملية', c: '#e2c48a', g: .14, keep: .2, info: 'تتكوّنُ من حبيباتٍ كبيرةٍ نسبيًّا تسمّى رملًا؛ تحتفظُ بالقليلِ من الماء.' },
    { id: 'silt', n: 'تربة غرينية', c: '#8a8a5a', g: .09, keep: .5, info: 'حبيباتُها أصغرُ من الرمل.' },
    { id: 'clay', n: 'تربة طينية', c: '#4a3226', g: .05, keep: .9, info: 'حبيباتُها أصغرُ من الغرين؛ تحتفظُ بالكثيرِ من الماء.' },
    { id: 'loam', n: 'تربة طفلية', c: '#9a6a3e', g: .08, keep: .6, info: 'مزيجٌ من الرملِ والغرينِ والطين؛ ليستْ رطبةً جدًّا ولا جافّةً جدًّا، فينمو فيها العديدُ من النباتاتِ جيّدًا.' }
  ];
  if (variant) T.splice(0, T.length,
    { id: 'clay', n: 'تربة طينية', c: '#c8a890', g: .05, keep: .9, info: 'ناعمةٌ فاتحةُ اللون، تصبحُ لزجةً عندما تبتلّ، وتحتفظُ بالكثيرِ من الماء.' },
    { id: 'loam', n: 'تربة زراعية (سطحية)', c: '#4a3226', g: .08, keep: .65, info: 'تربةٌ داكنةٌ يحرثُها المزارعون، فيها بقايا نباتاتٍ وحيواناتٍ متحلّلة، وتحتفظُ بماءٍ أكثر، فتنمو فيها النباتاتُ جيّدًا.' },
    { id: 'sand', n: 'تربة رملية', c: '#d8743a', g: .14, keep: .2, info: 'حبيباتُها كبيرةٌ خشنة، يمرُّ منها الماءُ بسرعةٍ وتحتفظُ بالقليلِ منه، وتوجدُ في الصحراء.' });
  const S = T.map((s, i) => {
    const g = new THREE.Group(); g.position.set((i - (T.length - 1) / 2) * 1.8, 0, 0); root.add(g);
    const pot = mesh(new THREE.CylinderGeometry(.6, .45, 1, 28, 1, true), glass('#ffffff', .25, { side: 2 }), [0, .3, 0]); g.add(pot);
    const soil = mesh(new THREE.CylinderGeometry(.56, .48, .6, 28), mat('#fff', { map: noiseTexture(s.c, '#00000033', 1600, 128, 128, s.g * 40) }), [0, .15, 0]); g.add(soil);
    const grains = new THREE.Group(); g.add(grains); for (let k = 0; k < 14; k++) grains.add(mesh(new THREE.DodecahedronGeometry(s.g, 0), mat(s.c, { flatShading: true }), [(Math.random() - .5) * .8, 1.25 + Math.random() * .2, (Math.random() - .5) * .3]));
    const cup = mesh(new THREE.CylinderGeometry(.42, .38, .5, 24, 1, true), glass('#ffffff', .3, { side: 2 }), [0, -.85, 0]); g.add(cup);
    const wcup = mesh(new THREE.CylinderGeometry(.4, .37, 1, 24), mat('#4a9ae8', { transparent: true, opacity: .8 }), [0, -1.1, 0]); g.add(wcup);
    const drip = new Flow(g, '#7ab8f0', .04, 10); drip.addPath(curve([[0, -.2, 0], [0, -.4, 0], [0, -.75, 0]]), .5); drip.rate = 0;
    if (s.id === 'loam') { const p = tree(.45, '#4fae3a'); p.position.set(0, .45, 0); g.add(p); }
    return { s, g, soil, grains, wcup, drip };
  });
  const lab = txt('اسكبِ الماءَ وقارنْ كميّةَ الماءِ التي تمرُّ عبرَ كلِّ تربة', .26, '#333'); lab.position.set(0, 2.1, 0); root.add(lab);
  const parts = S.map(x => ({ id: x.s.id, name: x.s.n, info: x.s.info, objs: [x.soil, ...x.grains.children], at: anchor(x.g, [0, 1.6, 0]) }));
  return {
    root, parts,
    update(dt) { t += dt; pour = Math.max(0, pour - dt * .25); S.forEach(x => { x.drip.update(dt); x.drip.rate = pour > 0 ? (1 - x.s.keep) * 18 : 0; const lvl = x.wcup.userData.l || 0; const nl = Math.min(1, lvl + (pour > 0 ? dt * (1 - x.s.keep) * .3 : 0)); x.wcup.userData.l = nl; x.wcup.scale.y = Math.max(.01, nl * .45); x.wcup.position.y = -1.1 + nl * .225; x.soil.material.color.set(pour > 0 ? '#c8c8d8' : '#ffffff'); }); },
    cam: { pos: [0, 1.2, 7.2], target: [0, 0, 0] }, inpage: { pos: [0, 1, 7.4], target: [0, 0, 0] },
    controls: [{ type: 'button', label: '💧 اسكب الماء على التربة', on: () => { pour = 1; S.forEach(x => x.wcup.userData.l = 0); api.toast('التربةُ الرمليةُ يمرُّ منها الماءُ بسرعة، والطينيةُ تحتفظُ به.'); } }],
    quiz: [{ q: 'المس التربةَ التي تحتفظُ بأكبرِ كميّةٍ من الماء.', a: 'clay' }, { q: 'المس التربةَ الأنسبَ لنموِّ كثيرٍ من النباتات.', a: 'loam' }, { q: 'المس التربةَ المناسبةَ لنباتِ الصبّار.', a: 'sand' }]
  };
}

/* ═════════ ١٤) أنواع الأحافير (ص ١٦٨–١٦٩) ═════════ */
export function fossiltypesModel(api) {
  const root = new THREE.Group(); let t = 0, step = 0;
  const F = [];
  // الطبعة: لوح طين مع أثر قدم/ورقة
  const imp = new THREE.Group(); imp.position.set(-2.6, 0, 0); root.add(imp);
  const slab = mesh(new THREE.BoxGeometry(1.6, .3, 1.2), mat('#b8a07a', { map: noiseTexture('#b8a07a', '#9a8460', 1500) })); imp.add(slab);
  const foot = new THREE.Group(); foot.position.y = .16; imp.add(foot); [[0, -.1], [-.2, .25], [0, .32], [.2, .25]].forEach(([x, z], i) => { const d = mesh(new THREE.CylinderGeometry(i ? .07 : .2, i ? .07 : .22, .03, 16), mat('#6a5438'), [x, 0, z]); foot.add(d); });
  // الكهرمان
  const amb = new THREE.Group(); amb.position.set(-.85, .2, 0); root.add(amb);
  const amber = mesh(new THREE.SphereGeometry(.6, 28, 18), mat('#e8a020', { transparent: true, opacity: .55, roughness: .1, metalness: .1 })); amber.scale.set(1.2, .8, .9); amb.add(amber);
  const fly = new THREE.Group(); amb.add(fly); fly.add(mesh(new THREE.CapsuleGeometry(.06, .2, 6, 8), mat('#3a2010'), [0, 0, 0], [0, 0, Math.PI / 2])); fly.add(mesh(new THREE.PlaneGeometry(.25, .1), mat('#ffffff', { transparent: true, opacity: .6, side: 2 }), [0, .06, .08], [.4, 0, 0])); fly.add(mesh(new THREE.PlaneGeometry(.25, .1), mat('#ffffff', { transparent: true, opacity: .6, side: 2 }), [0, .06, -.08], [-.4, 0, 0]));
  // الماموث في الجليد
  const ice = new THREE.Group(); ice.position.set(.9, .3, 0); root.add(ice);
  const block = mesh(new THREE.BoxGeometry(1.4, 1.2, 1), glass('#cfefff', .45)); ice.add(block);
  const mam = node(ice, '🦣', [0, 0, 0], .9, null);
  // القالب والنموذج
  const mold = new THREE.Group(); mold.position.set(2.7, 0, 0); root.add(mold);
  const rock = mesh(new THREE.BoxGeometry(1.4, .5, 1.1), mat('#9a9a8a', { map: noiseTexture('#9a9a8a', '#7a7a6a', 1500) })); mold.add(rock);
  const shellGeo = new THREE.SphereGeometry(.35, 24, 12, 0, TAU, 0, Math.PI / 2); shellGeo.scale(1, .45, 1);
  const hollow = mesh(shellGeo, mat('#3a3a32', { side: 2 }), [0, .26, 0], [Math.PI, 0, 0]); mold.add(hollow);
  const cast = new THREE.Group(); cast.position.y = .26; mold.add(cast); for (let i = 0; i < 9; i++) { const r = mesh(new THREE.BoxGeometry(.03, .16, .7), mat('#e8d8b8'), [-.28 + i * .07, .05, 0]); cast.add(r); } cast.add(mesh(shellGeo, mat('#e8d8b8'), [0, 0, 0]));
  const base = mesh(new THREE.BoxGeometry(8, .1, 2.4), mat('#e8e2d4'), [0, -.25, 0]); root.add(base);
  const lab = txt('', .26, '#333'); lab.position.set(0, 1.8, 0); root.add(lab);
  const ST = ['الطبعة: أثرٌ في طينٍ ليّنٍ تصلّبَ وصارَ صخرًا', 'الكهرمان: ذبابةٌ حُفظتْ كاملةً في صمغِ الأشجار', 'الجليد: حُفظَ جسمُ الماموثِ كما هو', 'القالب: تجويفٌ فارغٌ بشكلِ الصدفةِ في الصخر', 'النموذج: معادنُ ملأتِ القالبَ وتصلّبتْ بشكلِه'];
  function apply() { setTxt(lab, ST[step]); cast.visible = step >= 4; hollow.visible = step === 3 || step < 3; [imp, amb, ice, mold].forEach((g, i) => g.scale.setScalar(Math.min(i, 3) === Math.min(step, 3) ? 1.15 : .85)); }
  apply();
  const parts = [
    { id: 'imprint', name: 'الطبعة', info: 'تتركُ المخلوقاتُ الحيّةُ آثارًا في موادَّ ليّنةٍ مثلِ الطين، ومع الزمنِ تتصلّبُ وتصيرُ صخورًا تحفظُ الطبعات.', objs: [slab, ...foot.children], at: anchor(imp, [0, .6, 0]) },
    { id: 'amber', name: 'الأحفورة في الكهرمان', info: 'تحتفظُ بعضُ الأحافيرِ بأجسامِ المخلوقاتِ كاملة؛ فقد حُفظتْ في الكهرمان.', objs: [amber, ...fly.children], at: anchor(amb, [0, .8, 0]) },
    { id: 'icefossil', name: 'الماموث في الجليد', info: 'حُفظَ جسمُ فيلِ الماموثِ كما هو في الجليد.', objs: [block, mam.p], at: anchor(ice, [0, .9, 0]) },
    { id: 'mold', name: 'القالب والنموذج', info: 'القالبُ تجويفٌ فارغٌ في الصخرِ له شكلُ المخلوق، وإذا تسرّبتِ المعادنُ إليه وتصلّبتْ كوّنتْ نموذجًا له شكلُ القالبِ نفسِه.', objs: [rock, hollow, ...cast.children], at: anchor(mold, [0, .8, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; amb.rotation.y += dt * .4; mam.g.rotation.y = Math.sin(t) * .2; },
    cam: { pos: [0, 1.6, 5], target: [0, .3, 0] }, inpage: { pos: [0, 1.5, 5.2], target: [0, .3, 0] },
    controls: [{ type: 'steps', value: 0, steps: ST.map(s => ({ t: s.split(':')[0], d: s })), on: i => { step = i; apply(); } }],
    quiz: [{ q: 'المس الأحفورةَ التي حُفظتْ في صمغِ الأشجار.', a: 'amber' }, { q: 'المس الأحفورةَ التي حُفظتْ في الجليد.', a: 'icefossil' }]
  };
}

/* ═════════ ١٥) موارد الطاقة المتجددة (ص ١٧٢) ═════════ */
export function solarModel(api) {
  const root = new THREE.Group(); let t = 0, sel = 0;
  root.add(ground(4.4, '#e2c88a', '#c8a868'));
  const sun = node(root, '☀️', [-3.2, 3.2, -1.5], 1.3, null);
  const panels = new THREE.Group(); panels.position.set(-1.8, -.3, .4); root.add(panels); const PM = mat('#1a3a7a', { roughness: .2, metalness: .5 });
  for (let i = 0; i < 6; i++) { const p = new THREE.Group(); p.position.set((i % 3) * .9 - .9, 0, Math.floor(i / 3) * .9); p.add(mesh(new THREE.BoxGeometry(.8, .04, .55), PM, [0, .45, 0], [-.6, 0, 0])); p.add(mesh(new THREE.CylinderGeometry(.03, .03, .45, 6), mat('#999'), [0, .2, 0])); panels.add(p); }
  const turbine = new THREE.Group(); turbine.position.set(1.4, -.4, -.8); root.add(turbine); turbine.add(mesh(new THREE.CylinderGeometry(.06, .1, 2.8, 12), mat('#f4f4f4'), [0, 1.4, 0]));
  const rotor = new THREE.Group(); rotor.position.set(0, 2.8, .1); turbine.add(rotor); for (let i = 0; i < 3; i++) { const b = mesh(new THREE.BoxGeometry(.08, 1.1, .02), mat('#ffffff'), [0, .55, 0]); const h = new THREE.Group(); h.rotation.z = i / 3 * TAU; h.add(b); rotor.add(h); }
  const dam = new THREE.Group(); dam.position.set(2.8, -.4, 1.2); root.add(dam); dam.add(mesh(new THREE.BoxGeometry(1, .8, .3), mat('#b8b8b8'), [0, .4, 0])); const wf = new Flow(dam, '#5ab0f0', .05, 20); wf.addPath(curve([[0, .8, .1], [0, .4, .4], [0, .05, .7]]), .4); wf.rate = 10;
  const oil = new THREE.Group(); oil.position.set(-.2, -.4, -1.6); root.add(oil); oil.add(mesh(new THREE.BoxGeometry(.2, 1, .2), mat('#555'), [0, .5, 0])); const arm = mesh(new THREE.BoxGeometry(1.2, .1, .1), mat('#2a5aa8'), [0, 1.05, 0]); oil.add(arm);
  const car = node(root, '🚗', [.2, -.1, 1.6], .7, null);
  const ray = new Flow(root, '#ffe04a', .05, 30); ray.addPath(curve([[-3.2, 3, -1.5], [-2.5, 1.5, -.5], [-1.8, .3, .4]]), .5); ray.rate = 8;
  const lab = txt('', .28, '#333'); lab.position.set(0, 3.4, 0); root.add(lab);
  const L = ['مواردُ الطاقةِ المتجدّدةِ تُستعمَلُ في إنتاجِ الطاقةِ الكهربائية', 'الطاقةُ الشمسية: طاقةٌ نحصلُ عليها من الشمس', 'الرياح: تديرُ التوربيناتِ فتنتجُ الكهرباء', 'المياهُ الجارية: تنتجُ الطاقةَ الكهربائية', 'النفط: وقودٌ أحفوريٌّ غيرُ متجدّدٍ ينفدُ بالاستعمال'];
  function apply() { setTxt(lab, L[sel], sel === 4 ? '#a02020' : '#1a6a2a'); [panels, turbine, dam, oil].forEach((g, i) => g.scale.setScalar(sel === 0 ? 1 : sel - 1 === i ? 1.2 : .75)); }
  apply();
  const parts = [
    { id: 'solar', name: 'الألواح الشمسية', info: 'تحوّلُ الطاقةَ الشمسيةَ إلى طاقةٍ كهربائية؛ مثلُ القريةِ الشمسيةِ بالعيينةِ قربَ الرياض.', objs: panels.children.flatMap(g => g.children), at: anchor(panels, [0, 1, .4]) },
    { id: 'wind', name: 'توربين الرياح', info: 'الرياحُ موردٌ متجدّدٌ لإنتاجِ الطاقةِ الكهربائية.', objs: [...turbine.children, ...rotor.children.flatMap(h => h.children)], at: anchor(turbine, [0, 3.6, 0]) },
    { id: 'water', name: 'المياه الجارية', info: 'من مواردِ الطاقةِ المتجدّدةِ التي يمكنُ استعمالُها في إنتاجِ الكهرباء.', objs: dam.children, at: anchor(dam, [0, 1.1, 0]) },
    { id: 'oil', name: 'بئر النفط', info: 'الوقودُ الأحفوريُّ موردٌ غيرُ متجدّد؛ يحتاجُ ملايينَ السنينِ ليتكوّن، وعندما يستعملُ ينفد.', objs: [...oil.children], at: anchor(oil, [0, 1.5, 0]) },
    { id: 'car', name: 'سيّارة تعمل بالطاقة الشمسية', info: 'قد يأتي يومٌ أقودُ فيه سيّارةً تعملُ بالطاقةِ الشمسية.', objs: [car.p], at: anchor(car.g, [0, .55, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; rotor.rotation.z -= dt * 2.4; wf.update(dt); ray.update(dt); arm.rotation.z = Math.sin(t * 2) * .3; car.g.position.x = .2 + Math.sin(t * .6) * 1.2; },
    cam: { pos: [0, 2.2, 6.2], target: [0, .7, 0] }, inpage: { pos: [0, 2.1, 6.4], target: [0, .7, 0] },
    controls: [{ type: 'seg', label: 'المورد', options: ['الكل', 'الشمس', 'الرياح', 'المياه', 'النفط'], value: 0, on: k => { sel = k; apply(); } }],
    quiz: [{ q: 'المس موردَ طاقةٍ غيرَ متجدّد.', a: 'oil' }, { q: 'المس ما يحوّلُ ضوءَ الشمسِ إلى كهرباء.', a: 'solar' }]
  };
}
