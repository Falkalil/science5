// مجسّمات الصف الثاني
import { THREE, mat, glass, mesh, tube, anchor, V, Flow, lerp, clamp, noiseTexture, tree, pine, cloud, arrowTube, deer, organGeo, fbm3, tissue, tissueBump, vessel, twigs, mergeGeos, creature } from './kit.js';
import { emo, txt, setTxt } from './models6a.js';
import { node } from './m4a.js';
const TAU = Math.PI * 2;
function disk(r, c1, c2, y = -.6) { return mesh(new THREE.CylinderGeometry(r, r + .15, .3, 64), mat('#fff', { map: noiseTexture(c1, c2, 3000) }), [0, y, 0]); }
function glow(objs, on, color = '#ffd84a') { objs.forEach(o => o.traverse && o.traverse(m => { if (m.isMesh && m.material && m.material.emissive) { m.material.emissive.set(on ? color : '#000'); m.material.emissiveIntensity = on ? .45 : 0; } })); }
// صخرة مشوّهة بشكل ثابت
function rockGeo(r = 1, seed = 1, detail = 1, amp = .22) {
  const g = new THREE.IcosahedronGeometry(r, detail); const p = g.attributes.position; let s = seed * 9301;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const map = new Map();
  for (let i = 0; i < p.count; i++) { const k = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3); if (!map.has(k)) map.set(k, 1 + (rnd() - .5) * 2 * amp); const f = map.get(k); p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); }
  g.computeVertexNormals(); return g;
}
// قطرات/ندف تتساقط
function fall(root, n, color, size, box, speed, shape = 'drop') {
  const g = new THREE.Group(); root.add(g); const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8 });
  const geo = shape === 'drop' ? new THREE.CylinderGeometry(size * .3, size * .3, size * 3, 4) : new THREE.SphereGeometry(size, 6, 4);
  const P = []; for (let i = 0; i < n; i++) { const d = new THREE.Mesh(geo, m); d.position.set(box[0] + Math.random() * (box[1] - box[0]), box[2] + Math.random() * (box[3] - box[2]), box[4] + Math.random() * (box[5] - box[4])); g.add(d); P.push(d); }
  return { g, update(dt) { if (!g.visible) return; P.forEach((d, i) => { d.position.y -= dt * speed; if (shape !== 'drop') d.position.x += Math.sin(d.position.y * 3 + i) * dt * .2; if (d.position.y < box[2]) d.position.y = box[3]; }); } };
}

/* ═════════ ١) مجموعات الحيوانات (ص ٥٤–٥٥) ═════════ */
export function groupsModel(api) {
  const root = new THREE.Group(); let t = 0, filt = 0;
  const G = [
    { id: 'mam', n: 'الثدييات', c: '#f0c27a', e: ['🐪', '🐇'], v: 1, info: 'يغطّي جسمَها الشعرُ أو الفرو، وتتنفّسُ بالرئتين، وأنثاها ترضعُ صغارَها الحليب. مثل: الجملِ والأرنب.' },
    { id: 'bird', n: 'الطيور', c: '#f6a8c0', e: ['🦩', '🐦'], v: 1, info: 'الحيواناتُ الوحيدةُ التي يغطّي جسمَها الريش؛ لها رجلانِ وجناحانِ ومنقار، وتضعُ بيضًا يفقسُ منه الصغار.' },
    { id: 'fish', n: 'الأسماك', c: '#7cc4ee', e: ['🐟', '🐠'], v: 1, info: 'تغطّي أجسامَها قشور، وتعيشُ في الماء، وتتنفّسُ بالخياشيم، وتسبحُ بالزعانف. مثل: الهامورِ والكنعد.' },
    { id: 'amph', n: 'البرمائيات', c: '#9ad46a', e: ['🐸'], v: 1, info: 'تبدأُ معظمُها حياتَها في الماء، وجلدُها رطبٌ يساعدُها على العيشِ على اليابسةِ وفي الماء. مثل: الضفدعِ والسلمندر.' },
    { id: 'rept', n: 'الزواحف', c: '#d8b862', e: ['🦎', '🐍'], v: 1, info: 'جلدُها خشنٌ مغطًّى بالحراشفِ لحمايتِها. مثل: الضبِّ والسحليّةِ والثعبان.' },
    { id: 'inv', n: 'اللافقاريات', c: '#c4b2f0', e: ['🐞', '🦋', '🐌'], v: 0, info: 'ليسَ لها عمودٌ فقريّ، وهي أكثرُ من الفقاريّات. منها الحشراتُ (لها ستُّ أرجل) وقناديلُ البحرِ ودودةُ الأرضِ وجرادُ البحر.' }
  ];
  root.add(disk(4.3, '#e9f2dc', '#d4e4c0'));
  const S = G.map((g, i) => {
    const a = i / G.length * TAU + Math.PI / 6, p = [Math.sin(a) * 2.9, 0, Math.cos(a) * 1.9];
    const grp = new THREE.Group(); grp.position.set(...p); root.add(grp);
    const pad = mesh(new THREE.CylinderGeometry(.95, .95, .16, 40), mat(g.c, { roughness: .6 }), [0, -.38, 0]); grp.add(pad);
    if (g.v) for (let k = 0; k < 6; k++) grp.add(mesh(new THREE.CylinderGeometry(.06, .06, .08, 10), mat('#fbf7ee'), [-.5 + k * .2, -.26, .7]));
    const N = g.e.map((e, k) => node(grp, e, [(k - (g.e.length - 1) / 2) * .62, .25, 0], g.e.length > 2 ? .55 : .7, 'rgba(255,255,255,.9)'));
    const l = txt(g.n, .3, '#222'); l.position.set(0, 1.05, 0); grp.add(l);
    return { g, grp, pad, N, base: p };
  });
  const vt = txt('', .3, '#1a5a8a'); vt.position.set(0, 2.2, 0); root.add(vt);
  function apply() {
    S.forEach(s => { const on = filt === 0 || (filt === 1 && s.g.v) || (filt === 2 && !s.g.v); s.grp.scale.setScalar(on ? 1 : .55); });
    setTxt(vt, ['الحيواناتُ نوعان: فقاريّاتٌ ولافقاريّات', 'الفقاريّات: لها عمودٌ فقريّ', 'اللافقاريّات: ليسَ لها عمودٌ فقريّ'][filt]);
  }
  apply();
  const parts = S.map(s => ({ id: s.g.id, name: s.g.n, info: s.g.info, objs: [s.pad, ...s.N.map(n => n.p)], at: anchor(s.grp, [0, .9, 0]) }));
  return {
    fitPop: innerWidth < 700 ? 1 : .8,
    root, parts,
    update(dt) { t += dt; S.forEach((s, i) => s.N.forEach((n, k) => { const id = s.g.id; n.g.position.y = .25 + (id === 'bird' ? Math.abs(Math.sin(t * 3 + k)) * .25 : Math.sin(t * 2 + i + k) * .05); if (id === 'fish') n.g.position.x = (k - .5) * .62 + Math.sin(t * 1.5 + k * 2) * .12; })); },
    cam: { pos: [0, 3.6, 5.6], target: [0, .1, 0] }, inpage: { pos: [0, 4.4, 6.6], target: [0, 0, 0] },
    controls: [{ type: 'seg', label: 'أبرزْ', options: ['الكل', 'الفقاريات', 'اللافقاريات'], value: 0, on: k => { filt = k; apply(); api.toast(['صنّفَ العلماءُ الحيواناتِ إلى مجموعتينِ رئيستين: فقاريّاتٍ ولافقاريّات.', 'الفقاريّاتُ لها عمودٌ فقريّ: الثدييّاتُ والطيورُ والأسماكُ والبرمائيّاتُ والزواحف.', 'اللافقاريّاتُ ليسَ لها عمودٌ فقريّ، وهي أكثرُ عددًا من الفقاريّات.'][k]); } }],
    legend: [['#fbf7ee', 'الخرزاتُ البيضاءُ = عمودٌ فقريّ']],
    quiz: [{ q: 'المس المجموعةَ التي يغطّي جسمَها الريش.', a: 'bird' }, { q: 'المس المجموعةَ التي تتنفّسُ بالخياشيم.', a: 'fish' }, { q: 'المس المجموعةَ التي ترضعُ صغارَها الحليب.', a: 'mam' }, { q: 'المس المجموعةَ التي ليسَ لها عمودٌ فقريّ.', a: 'inv' }]
  };
}

/* ═════════ ٢) الخنفساء: حشرة (ص ٥٦) ═════════ */
export function insectModel(api) {
  const root = new THREE.Group(); let t = 0, walk = false, sel = 0, wx = 0;
  const leaf = mesh(new THREE.SphereGeometry(3, 40, 16), mat('#6fb04a', { roughness: .8, map: noiseTexture('#79b850', '#5c9a3c', 2000) }), [0, -.62, 0]); leaf.scale.set(1.1, .06, 1.5); root.add(leaf);
  const bug = new THREE.Group(); root.add(bug);
  const shellM = mat('#e8742a', { roughness: .35, map: noiseTexture('#f08236', '#d0581e', 1200) });
  const shell = mesh(new THREE.SphereGeometry(1, 40, 24), shellM, [0, .25, -.15]); shell.scale.set(.95, .5, 1.3); bug.add(shell);
  const spots = new THREE.Group(); bug.add(spots); for (const [x, z] of [[.35, .3], [-.35, .3], [.45, -.35], [-.45, -.35], [.2, -.85], [-.2, -.85], [0, .05]]) { const s = mesh(new THREE.SphereGeometry(.12, 12, 8), mat('#1a1a1a'), [x, .25 + .5 * Math.sqrt(Math.max(0, 1 - (x / .95) ** 2 - ((z + .15) / 1.3) ** 2)) - .02, z]); s.scale.y = .35; spots.add(s); }
  bug.add(mesh(new THREE.BoxGeometry(.03, .04, 2.2), mat('#3a1a0a'), [0, .74, -.2]));
  const head = mesh(new THREE.SphereGeometry(.42, 24, 16), mat('#2a1a12', { roughness: .4 }), [0, .2, 1.25]); bug.add(head);
  for (const s of [-1, 1]) bug.add(mesh(new THREE.SphereGeometry(.09, 12, 8), mat('#111', { roughness: .1 }), [s * .25, .33, 1.52]));
  const antM = mat('#3a2a1a'); const ants = new THREE.Group(); bug.add(ants);
  for (const s of [-1, 1]) { ants.add(tube([[s * .15, .45, 1.55], [s * .5, .95, 2.1], [s * .95, 1.15, 2.75]], .03, antM, 24, 6)); ants.add(mesh(new THREE.SphereGeometry(.06, 10, 8), antM, [s * .95, 1.15, 2.75])); }
  const legM = mat('#c8381a', { roughness: .45 }); const legs = [];
  for (const s of [-1, 1]) for (const [k, z] of [[0, .65], [1, 0], [2, -.65]]) { const lg = new THREE.Group(); lg.position.set(s * .7, .12, z); lg.add(tube([[0, 0, 0], [s * .6, .35, .08], [s * 1.05, -.62, .2 + (k - 1) * .15]], .045, legM, 20, 6)); bug.add(lg); legs.push({ lg, s, k }); }
  const legsG = legs.map(l => l.lg);
  const lb = txt('٦ أرجل', .3, '#a02020'); lb.position.set(1.9, .5, 0); root.add(lb);
  const P = [
    { id: 'ant', name: 'قرنا الاستشعار', info: 'يساعدانِ الحشراتِ على الإحساسِ والتذوّقِ والشمّ.', objs: ants.children, at: anchor(bug, [.6, 1.2, 2.5]), g: [ants] },
    { id: 'shell', name: 'الغطاءُ الخارجيُّ الصلب', info: 'يوفّرُ للحشرةِ الحمايةَ والأمان.', objs: [shell, ...spots.children], at: anchor(bug, [0, .85, -.2]), g: [shell] },
    { id: 'legs', name: 'الأرجل (ستُّ أرجل)', info: 'تساعدُ الحشرةَ على المشيِ والتسلّق. للحشرةِ ستُّ أرجل.', objs: legsG.flatMap(l => l.children), at: anchor(bug, [-1.6, .2, 0]), g: legsG },
    { id: 'head', name: 'الرأس', info: 'فيه العينانِ وقرنا الاستشعارِ والفم.', objs: [head], at: anchor(bug, [0, .75, 1.3]), g: [head] }
  ];
  function apply() { P.forEach((p, i) => glow(p.g, sel === i + 1)); lb.visible = sel === 0 || sel === 3; }
  apply();
  return {
    fitPop: innerWidth < 700 ? 1 : .85,
    root, parts: P.map(({ g, ...p }) => p),
    update(dt) { t += dt; if (walk) { wx += dt * .5; bug.position.z = Math.sin(wx) * .9; legs.forEach(l => { l.lg.rotation.y = Math.sin(t * 9 + l.k * 2 + (l.s > 0 ? 0 : Math.PI)) * .3; }); } else { legs.forEach(l => l.lg.rotation.y *= .9); } ants.rotation.x = Math.sin(t * 2) * .05; },
    cam: { pos: [2.9, 2.6, 3.7], target: [0, .3, .4] }, inpage: { pos: [3.4, 3, 4.6], target: [0, .2, .3] },
    controls: [
      { type: 'seg', label: 'أبرزْ', options: ['الكل', 'قرنا الاستشعار', 'الغطاء الصلب', 'الأرجل'], value: 0, on: k => { sel = k; apply(); if (k) api.toast(P[k - 1].info); } },
      { type: 'button', label: '🚶 اجعلْها تمشي', toggle: true, on: v => { walk = v; if (!v) bug.position.z = 0; } }
    ],
    quiz: [{ q: 'المس الجزءَ الذي يساعدُ الحشرةَ على الشمِّ والتذوّق.', a: 'ant' }, { q: 'المس الجزءَ الذي يوفّرُ للحشرةِ الحمايةَ والأمان.', a: 'shell' }, { q: 'المس الأجزاءَ التي تساعدُها على المشيِ والتسلّق.', a: 'legs' }]
  };
}

/* ═════════ ٣) أنواع المواطن (ص ٧٨–٧٩) ═════════ */
export function habitatsModel(api) {
  const root = new THREE.Group(); let t = 0, sel = -1;
  const H = [
    { id: 'hot', n: 'حارٌّ وجافّ', c1: '#e8c48a', c2: '#d4a868', a: ['🦎', '🦂'], info: 'موطنٌ حارٌّ قليلُ الأمطار، تربتُه رمليّةٌ وصخريّة. يعيشُ فيه الضبُّ والعقربُ ونباتُ الصبّار.' },
    { id: 'warm', n: 'عشبيٌّ ودافئ', c1: '#9ccc5a', c2: '#80b048', a: ['🦓', '🦓'], info: 'موطنٌ تغطّيه الأعشابُ وجوُّه دافئ، تعيشُ فيه الحميرُ الوحشيّةُ وتتغذّى على الأعشاب.' },
    { id: 'wet', n: 'عشبيٌّ ورطب', c1: '#7cb85a', c2: '#5e9a42', a: ['🦩', '🐸'], info: 'موطنٌ رطبٌ كثيرُ الماءِ والأعشاب، تعيشُ فيه طيورُ الماءِ والضفادع.' },
    { id: 'cold', n: 'باردٌ وفيه ثلوج', c1: '#f4f8fc', c2: '#dfe8f0', a: ['🐻‍❄️', '🐻‍❄️'], info: 'موطنٌ باردٌ تغطّيه الثلوج، يعيشُ فيه الدبُّ القطبيُّ الذي له فراءٌ أبيضُ سميكٌ يدفّئه.' }
  ];
  const S = H.map((h, i) => {
    const g = new THREE.Group(); const x = (i % 2 ? -1 : 1) * 1.65, z = (i < 2 ? -1 : 1) * 1.25; g.position.set(x, 0, z); root.add(g);
    const base = mesh(new THREE.BoxGeometry(3.1, .4, 2.3), mat('#fff', { map: noiseTexture(h.c1, h.c2, 2500) }), [0, -.4, 0]); g.add(base);
    const N = h.a.map((e, k) => node(g, e, [(k ? -.7 : .55), .15, k ? -.3 : .35], .75, null));
    const l = txt(h.n, .3, '#222'); l.position.set(0, 1.5, -.6); g.add(l);
    return { h, g, base, N, x, z };
  });
  // تفاصيل كل موطن
  const hot = S[0].g; const cac = new THREE.Group(); const cm = mat('#4f9a42'); cac.add(mesh(new THREE.CapsuleGeometry(.14, .7, 6, 12), cm, [0, .35, 0])); cac.add(mesh(new THREE.CapsuleGeometry(.08, .3, 6, 10), cm, [.2, .45, 0], [0, 0, -.6])); cac.position.set(-1, -.2, .5); hot.add(cac);
  for (const [x, z, s] of [[.9, -.6, .25], [-.2, -.7, .18]]) hot.add(mesh(rockGeo(s, x * 10 + 3), mat('#b08a5a', { flatShading: true }), [x, -.15, z]));
  const sun = mesh(new THREE.SphereGeometry(.3, 20, 12), mat('#ffd34a', { emissive: '#ffb020', emissiveIntensity: .8 }), [1.1, 1.3, -.8]); hot.add(sun);
  const warm = S[1].g; for (let k = 0; k < 60; k++) { const r = Math.random(); warm.add(mesh(new THREE.ConeGeometry(.04, .28, 4), mat('#6a9a30'), [(Math.random() - .5) * 2.8, -.08, (Math.random() - .5) * 2])); } warm.add(tree(.8, '#4f8f32').translateX(1).translateZ(-.6).translateY(-.2));
  const wet = S[2].g; const pond = mesh(new THREE.CylinderGeometry(.9, .9, .05, 32), mat('#4aa3d8', { roughness: .15, transparent: true, opacity: .85 }), [-.3, -.18, .1]); pond.scale.z = .7; wet.add(pond); for (let k = 0; k < 40; k++) wet.add(mesh(new THREE.ConeGeometry(.03, .4, 4), mat('#3f7a28'), [(Math.random() - .5) * 2.8, -.02, (Math.random() - .5) * 2]));
  const rain = fall(wet, 40, '#9fd0ff', .03, [-1.4, 1.4, -.2, 1.8, -1, 1], 3);
  const cold = S[3].g; for (const [x, z] of [[1, -.5], [-1.1, -.6]]) { const p = pine(.9, '#2f6e34'); p.position.set(x, -.2, z); cold.add(p); p.add(mesh(new THREE.ConeGeometry(.2, .2, 8), mat('#ffffff'), [0, 1.35, 0])); }
  const snow = fall(cold, 50, '#ffffff', .035, [-1.4, 1.4, -.2, 1.8, -1, 1], .6, 'snow');
  function apply() { S.forEach((s, i) => { const on = sel < 0 || sel === i; s.g.scale.setScalar(on ? (sel === i ? 1.12 : 1) : .7); s.g.position.y = sel === i ? .2 : 0; }); }
  const parts = S.map(s => ({ id: s.h.id, name: 'موطنٌ ' + s.h.n, info: s.h.info, objs: [s.base, ...s.N.map(n => n.p)], at: anchor(s.g, [0, .8, 0]) }));
  return {
    fitPop: innerWidth < 700 ? 1 : .85,
    root, parts,
    update(dt) { t += dt; rain.update(dt); snow.update(dt); sun.scale.setScalar(1 + Math.sin(t * 3) * .06); S.forEach((s, i) => s.N.forEach((n, k) => n.g.position.y = .15 + Math.abs(Math.sin(t * 2 + i + k)) * .06)); S[1].N[0].g.position.x = .55 + Math.sin(t * .6) * .3; },
    cam: { pos: [0, 4.6, 5.8], target: [0, 0, 0] }, inpage: { pos: [0, 5.4, 6.4], target: [0, 0, 0] },
    controls: [{ type: 'seg', label: 'الموطن', options: ['الكل', ...H.map(h => h.n)], value: 0, on: k => { sel = k - 1; apply(); api.toast(sel < 0 ? 'الموطنُ مكانٌ تعيشُ فيه المخلوقاتُ الحيّة، وتجدُ فيه ما تحتاجُ إليه من مأوًى وغذاءٍ وماء.' : H[sel].info); } }],
    quiz: [{ q: 'المس الموطنَ الذي يعيشُ فيه الدبُّ القطبيّ.', a: 'cold' }, { q: 'المس الموطنَ الذي يعيشُ فيه الضبّ.', a: 'hot' }, { q: 'المس الموطنَ الذي تعيشُ فيه طيورُ الماء.', a: 'wet' }]
  };
}

/* ═════════ ٤) كيف تستخدم المخلوقات مواطنها؟ (ص ٨٠) ═════════ */
export function homesModel(api) {
  const root = new THREE.Group(); let t = 0, mode = 0;
  root.add(disk(4.2, '#8cc45a', '#70a844'));
  // شجرة كبيرة وعشّ السنجاب
  const big = new THREE.Group(); big.position.set(1.8, -.45, -1); root.add(big);
  big.add(mesh(new THREE.CylinderGeometry(.28, .42, 3.2, 14), mat('#6a4a2c', { map: noiseTexture('#7a5634', '#5a3a20', 1500) }), [0, 1.6, 0]));
  big.add(tube([[0, 2.2, 0], [-.6, 2.7, .2], [-1.2, 2.9, .3]], .1, mat('#6a4a2c'), 16, 8));
  for (const [x, y, z, r] of [[0, 3.6, 0, 1.1], [-.9, 3.3, .3, .8], [.8, 3.3, -.2, .8], [-1.3, 3, .4, .55]]) big.add(mesh(new THREE.IcosahedronGeometry(r, 1), mat('#3f8f32', { flatShading: true }), [x, y, z]));
  const nest = mesh(new THREE.TorusGeometry(.28, .12, 8, 20), mat('#a07a40', { map: noiseTexture('#b08a48', '#80602a', 600) }), [-1.15, 2.95, .35], [Math.PI / 2, 0, 0]); big.add(nest);
  const squ = node(big, '🐿️', [-1.1, 3.25, .4], .6, null);
  const nut = node(big, '🌰', [-.3, .1, .9], .35, null);
  // صخور وحشرات تحتها
  const rocks = new THREE.Group(); rocks.position.set(-1.6, -.45, -.6); root.add(rocks);
  for (const [x, z, s, sd] of [[0, 0, .6, 1], [.7, .2, .45, 2], [-.5, .4, .4, 3], [.2, -.5, .5, 4]]) rocks.add(mesh(rockGeo(s, sd), mat('#a89a80', { flatShading: true }), [x, s * .45, z]));
  const bugs = [node(rocks, '🐜', [.3, .1, .85], .3, null), node(rocks, '🐞', [-.6, .1, .8], .3, null)];
  const snake = node(rocks, '🐍', [1, .25, .9], .6, null);
  // جحر الأرنب
  const hole = mesh(new THREE.CylinderGeometry(.45, .45, .02, 30), mat('#2a1a0e'), [.2, -.44, 1.6]); root.add(hole);
  const mound = mesh(new THREE.SphereGeometry(.6, 24, 12, 0, TAU, 0, Math.PI / 2), mat('#8a6a42', { map: noiseTexture('#8a6a42', '#6a4a2a', 800) }), [.2, -.45, 1.15]); mound.scale.y = .4; root.add(mound);
  const rab = node(root, '🐇', [.2, -.1, 1.6], .6, null);
  const grass = node(root, '🌿', [-.6, -.2, 1.9], .5, null);
  const info = txt('', .28, '#333'); info.position.set(0, 3.2, 1.5); root.add(info);
  const M = ['المخلوقاتُ الحيّةُ تستخدمُ مواطنَها للغذاءِ والاختباءِ والنوم', 'الغذاء: السنجابُ يأكلُ الجوز، والأرنبُ يأكلُ النباتات، والثعبانُ يصطادُ', 'الاختباء: الأرنبُ يحفرُ جحرًا، والحشراتُ تختبئُ تحتَ الصخور', 'النوم: السنجابُ ينامُ في عشِّه على الشجرة'];
  function apply() { setTxt(info, M[mode]); }
  apply();
  const parts = [
    { id: 'squ', name: 'السنجاب', info: 'يبني عشَّه في الشجرةِ لينامَ ويختبئَ فيه، ويجدُ الجوزَ غذاءً له.', objs: [squ.p, nest], at: anchor(big, [-1.1, 3.7, .4]) },
    { id: 'rab', name: 'الأرنب', info: 'يحفرُ جحرًا في التربةِ للاختباء، ويتغذّى على النباتاتِ التي تنمو في موطنِه.', objs: [rab.p, mound], at: anchor(root, [.2, .5, 1.6]) },
    { id: 'bugs', name: 'الحشرات', info: 'بعضُ الحشراتِ تبني بيوتَها تحتَ الصخور.', objs: [...bugs.map(b => b.p), ...rocks.children.filter(c => c.isMesh)], at: anchor(rocks, [0, 1, .3]) },
    { id: 'snake', name: 'الثعبان', info: 'يختبئُ بينَ الصخور، ويتغذّى على حيواناتٍ أخرى في الموطنِ نفسِه.', objs: [snake.p], at: anchor(rocks, [1, .8, .9]) }
  ];
  return {
    fitPop: innerWidth < 700 ? 1 : .85,
    root, parts,
    update(dt) {
      t += dt;
      const hide = mode === 2 ? (Math.sin(t * 1.2) * .5 + .5) : 0; rab.g.position.y = -.1 - hide * .7; rab.g.visible = hide < .9;
      bugs.forEach((b, i) => { b.g.position.x = (i ? -.6 : .3) + (mode === 2 ? -hide * .3 : Math.sin(t * 2 + i) * .1); b.g.position.z = (mode === 2 ? .85 - hide * .5 : .85); });
      squ.g.position.y = 3.25 + (mode === 1 ? Math.abs(Math.sin(t * 2)) * .2 : 0); squ.g.scale.setScalar(mode === 3 ? .45 : 1);
      if (mode === 1) { nut.g.position.y = .1 + Math.abs(Math.sin(t * 2)) * .1; grass.g.scale.setScalar(.5 + Math.abs(Math.sin(t * 3)) * .15); }
      snake.g.position.x = 1 + Math.sin(t * .8) * .25;
    },
    cam: { pos: [0, 3, 6.2], target: [0, 1, 0] }, inpage: { pos: [0, 3.4, 7.2], target: [0, 1, 0] },
    controls: [{ type: 'seg', label: 'تستخدمُ الحيواناتُ موطنَها في', options: ['الكل', 'الغذاء', 'الاختباء', 'النوم'], value: 0, on: k => { mode = k; apply(); } }],
    quiz: [{ q: 'المس الحيوانَ الذي يبني عشَّه في الشجرة.', a: 'squ' }, { q: 'المس الحيوانَ الذي يحفرُ جحرًا في التربة.', a: 'rab' }, { q: 'المس المخلوقاتِ التي تبني بيوتَها تحتَ الصخور.', a: 'bugs' }]
  };
}

/* ═════════ ٥) سلاسل الغذاء (ص ٨٦–٨٨) ═════════ */
function seahorse() {
  const g = new THREE.Group(); const m = mat('#e8b830', { roughness: .5 });
  g.add(tube([[0, .55, 0], [.12, .3, 0], [.05, 0, 0], [-.1, -.25, 0], [0, -.45, 0], [.15, -.42, 0], [.12, -.3, 0]], .09, m, 40, 8));
  g.add(mesh(new THREE.SphereGeometry(.13, 16, 12), m, [0, .6, 0])); g.add(mesh(new THREE.CylinderGeometry(.035, .05, .3, 8), m, [-.2, .62, 0], [0, 0, Math.PI / 2]));
  g.add(mesh(new THREE.SphereGeometry(.03, 8, 6), mat('#111'), [-.02, .65, .11])); return g;
}
export function chain2Model(api, variant = 0) {
  const root = new THREE.Group(); let v = variant, step = -1, t = 0;
  const SETS = [
    { n: 'على اليابسة', bg: ['#ecd29a', '#d8bc80'], I: [['☀️', 'الشمس', 'الشمسُ تساعدُ النباتَ على النموّ.'], ['🌼', 'النبات', 'يصنعُ النباتُ غذاءه بمساعدةِ ضوءِ الشمس.'], ['🐞', 'الحشرة', 'الحشرةُ تأكلُ النبات.'], ['🦎', 'السحليّة', 'السحليّةُ تأكلُ الحشرة.'], ['🐍', 'الأفعى', 'الأفعى تأكلُ السحليّة.'], ['🦅', 'الصقر', 'الصقرُ يأكلُ الأفعى.']] },
    { n: 'في الماء', bg: ['#5aa8dc', '#3a88c0'], I: [['☀️', 'الشمس', 'الشمسُ تساعدُ العوالقَ البحريّةَ على النموّ.'], ['🦠', 'العوالق البحرية', 'مخلوقاتٌ صغيرةٌ جدًّا تطفو في الماء.'], ['🦐', 'الروبيان', 'الروبيانُ يأكلُ العوالقَ البحريّة.'], ['SH', 'حصان البحر', 'حصانُ البحرِ يأكلُ الروبيان.'], ['🐟', 'التونة', 'الأسماكُ الكبيرة – ومنها التونة – تأكلُ حصانَ البحر.'], ['🦈', 'سمك القرش', 'سمكُ القرشِ يأكلُ الأسماكَ الكبيرة.']] },
    { n: 'في الصحراء', bg: ['#f0d6a0', '#d8b478'], I: [['☀️', 'الشمس', 'تحتاجُ النباتاتُ إلى ضوءِ الشمسِ لتصنعَ غذاءها.'], ['🌿', 'النباتات', 'تصنعُ النباتاتُ غذاءها بنفسِها.'], ['🐇', 'الأرنب', 'يأكلُ الأرنبُ النباتات؛ فهو فريسةٌ للصقر.'], ['🦅', 'الصقر', 'يأكلُ الصقرُ الأرنب؛ فهو مفترس.']] }
  ];
  const base = disk(4.2, '#fff', '#eee'); root.add(base);
  const G = new THREE.Group(); root.add(G); let N = [], flows = [];
  const title = txt('', .36, '#333'); title.position.set(0, 2.6, 0); root.add(title);
  const tagA = txt('', .26, '#a02020'), tagB = txt('', .26, '#1a6a2a'); root.add(tagA); root.add(tagB);
  function build() {
    G.clear(); N = []; flows.forEach(f => f.f.clear()); flows = []; const S = SETS[v];
    base.material.map = noiseTexture(S.bg[0], S.bg[1], 3000); base.material.needsUpdate = true;
    const n = S.I.length;
    S.I.forEach((it, i) => {
      const x = 3.2 - i * 6.4 / (n - 1), z = Math.sin(i / (n - 1) * Math.PI) * 1.2 - .3, y = i === 0 ? 1.6 : .2;
      let nd;
      if (it[0] === 'SH') { const g = new THREE.Group(); g.position.set(x, y, z); G.add(g); const sh = seahorse(); g.add(sh); const p = new THREE.Mesh(new THREE.SphereGeometry(.45, 12, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); g.add(p); nd = { g, p }; }
      else nd = node(G, it[0], [x, y, z], i === 0 ? 1 : .85, i === 0 ? null : 'rgba(255,255,255,.92)');
      if (it[0] === 'SH') G.add(nd.g);
      const l = txt(it[1], .24, '#222'); l.position.set(x, y - .72, z); G.add(l);
      N.push(nd);
    });
    for (let i = 0; i < n - 1; i++) { const A = N[i].g.position, B = N[i + 1].g.position; const mid = A.clone().add(B).multiplyScalar(.5).add(V(0, .75, .2)); const ar = arrowTube([A.clone().lerp(B, .2).toArray(), mid.toArray(), A.clone().lerp(B, .8).toArray()], .04, i === 0 ? '#f2c21a' : '#3a8ad0', .25); G.add(ar); const f = new Flow(G, '#ffe04a', .06, 12); f.addPath(ar.userData.curve, .5); flows.push({ ar, f }); }
    setTxt(title, 'سلسلةٌ غذائيّةٌ ' + S.n); hi(); api.refreshParts && api.refreshParts();
  }
  function hi() {
    flows.forEach((x, i) => { x.ar.visible = step < 0 || i === step; x.f.rate = step < 0 || i === step ? 3 : 0; });
    N.forEach((nd, i) => nd.g.scale.setScalar(step < 0 || i === step || i === step + 1 ? 1 : .7));
    tagA.visible = tagB.visible = step >= 1;
    if (step >= 1 && N[step + 1]) { const a = N[step].g.position, b = N[step + 1].g.position; tagA.position.set(a.x, a.y + .75, a.z); tagB.position.set(b.x, b.y + .75, b.z); setTxt(tagA, step === 1 ? 'غذاء' : 'فريسة', '#a02020'); setTxt(tagB, 'مفترس', '#1a6a2a'); if (step === 1) setTxt(tagB, 'يأكلُ النبات', '#1a6a2a'); }
  }
  const parts = [0, 1, 2, 3, 4, 5].map(i => ({ id: 'n' + i, get name() { const s = SETS[v].I[i]; return s ? s[1] : ''; }, get info() { const s = SETS[v].I[i]; return s ? s[2] : ''; }, get objs() { return N[i] ? [N[i].p] : []; }, at: new THREE.Object3D(), hidden: () => !N[i] }));
  parts.forEach(p => root.add(p.at));
  build();
  const stepsOf = () => SETS[v].I.slice(0, -1).map((it, i) => ({ t: (i + 1) + '- ' + it[1] + ' ← ' + SETS[v].I[i + 1][1], d: SETS[v].I[i + 1][2] }));
  return {
    fitPop: innerWidth < 700 ? 1 : .8,
    root, parts,
    update(dt) { t += dt; flows.forEach(x => x.f.update(dt)); parts.forEach((p, i) => { if (N[i]) p.at.position.copy(N[i].g.position).add(V(0, .6, 0)); }); N.forEach((nd, i) => { if (i) nd.g.position.y = .2 + Math.sin(t * 2 + i) * .05; else nd.g.rotation.z = t * .3; }); },
    cam: { pos: [0, 2.2, 5.6], target: [0, .5, 0] }, inpage: { pos: [0, 2.6, 7.2], target: [0, .5, 0] },
    controls: [
      { type: 'seg', label: 'السلسلة', options: SETS.map(s => s.n), value: variant, on: k => { v = k; step = -1; build(); api.toast('تبدأُ معظمُ سلاسلِ الغذاءِ بالشمس، ويشيرُ السهمُ إلى المخلوقِ الذي يأكل.'); } },
      { type: 'button', label: '⏭️ الخطوة التالية', on: () => { const n = SETS[v].I.length - 1; step = step + 1 >= n ? -1 : step + 1; hi(); const s = stepsOf()[step]; api.toast(s ? s.t + ': ' + s.d : 'السلسلةُ الغذائيّةُ توضّحُ التتابعَ الذي تحصلُ به المخلوقاتُ الحيّةُ على الغذاء.'); } }
    ],
    legend: [['#ffe04a', 'انتقالُ الغذاء (السهمُ يشيرُ إلى مَن يأكل)']],
    quiz: [{ q: 'المس بدايةَ السلسلةِ الغذائيّة.', a: 'n0' }, { q: 'المس آخرَ مفترسٍ في السلسلة.', a: variant === 2 ? 'n3' : 'n5' }, { q: 'المس المخلوقَ الذي يصنعُ غذاءه بنفسِه أو ينمو بمساعدةِ الشمس.', a: 'n1' }]
  };
}

/* ═════════ ٦) المنطقة القطبية (ص ١٠٠–١٠١) ═════════ */
export function polarModel(api) {
  const root = new THREE.Group(); let t = 0, wind = false, filt = 0;
  root.add(disk(4.2, '#f6fafe', '#e2ecf4'));
  for (const [x, z, s] of [[2.2, -1.4, .9], [-2.6, -1.2, .7], [.4, -2.2, .6]]) { const ice = mesh(rockGeo(s, x * 7 + 11, 1, .15), mat('#e8f4fc', { flatShading: true, roughness: .2 }), [x, -.35 + s * .2, z]); ice.scale.y = .5; root.add(ice); }
  const A = [
    { id: 'bear', e: '🐻‍❄️', n: 'الدبّ القطبي', p: [-1.6, .1, .3], info: 'له فراءٌ أبيضُ سميكٌ يمنحُه الدفءَ ويساعدُه على الاختباءِ بينَ الثلوج.' },
    { id: 'fox', e: '🦊', n: 'الثعلب القطبي', p: [1.3, .1, 1.3], info: 'فراؤه أبيضُ سميكٌ يمنحُه الدفءَ ويساعدُه على الاختباء.' },
    { id: 'deer', e: '🦌', n: 'غزال الرنّة', p: [-.2, .35, -1.2], info: 'يعيشُ في المنطقةِ القطبيّة، ويتغذّى على النباتاتِ الصغيرة.' },
    { id: 'seal', e: '🦭', n: 'الفقمة', p: [2.2, .25, -1.2], info: 'تستلقي الفقمةُ على الثلج.' }
  ];
  const N = A.map(a => ({ a, nd: node(root, a.e, a.p, .9, a.id === 'fox' ? 'rgba(255,255,255,.95)' : null) }));
  const plants = new THREE.Group(); root.add(plants);
  for (let k = 0; k < 26; k++) { const a = k * 2.4, r = 1 + (k % 5) * .55; const g = new THREE.Group(); g.position.set(Math.cos(a) * r, -.42, Math.sin(a) * r * .7 + .6); g.add(mesh(new THREE.SphereGeometry(.1, 8, 6), mat('#5a8a3a'), [0, .04, 0], 0, [1.4, .45, 1.4])); g.add(mesh(new THREE.SphereGeometry(.045, 8, 6), mat(k % 2 ? '#e05ab0' : '#a05ae0'), [0, .1, 0])); plants.add(g); }
  const snow = fall(root, 60, '#ffffff', .04, [-4, 4, -.4, 3, -3, 3], .5, 'snow');
  const winds = new THREE.Group(); root.add(winds); for (let k = 0; k < 6; k++) winds.add(arrowTube([[3.6, .3 + k * .35, -1 + k * .4], [1.5, .45 + k * .35, -1 + k * .4], [-.5, .3 + k * .35, -1 + k * .4]], .02, '#9ac8f0', .2)); winds.visible = false;
  const tl = txt('', .28, '#1a4a7a'); tl.position.set(0, 2.6, 0); root.add(tl);
  function apply() { N.forEach(x => x.nd.g.scale.setScalar(filt === 2 ? .6 : 1)); plants.scale.setScalar(filt === 1 ? .7 : (filt === 2 ? 1.6 : 1)); setTxt(tl, filt === 2 ? 'نباتاتٌ قصيرةٌ قريبةٌ من الأرضِ أوراقُها صغيرة' : filt === 1 ? 'حيواناتٌ لها فراءٌ سميكٌ يمنحُها الدفء' : 'المنطقةُ القطبيّة: صحراءُ باردةٌ جافّة'); }
  apply();
  const parts = [...N.map(x => ({ id: x.a.id, name: x.a.n, info: x.a.info, objs: [x.nd.p], at: anchor(x.nd.g, [0, .6, 0]) })),
    { id: 'plants', name: 'نباتات المنطقة القطبية', info: 'صغيرةٌ وقصيرة، تنمو قريبةً من سطحِ الأرضِ لتحتميَ من الرياحِ الباردة، ولها أوراقٌ صغيرةٌ وجذورٌ سطحيّة. وموسمُ نموِّها قصيرٌ جدًّا فتزهرُ معًا.', objs: plants.children.flatMap(g => g.children), at: anchor(root, [1, -.1, 2]) }];
  return {
    fitPop: innerWidth < 700 ? 1 : .72,
    root, parts,
    update(dt) { t += dt; snow.update(dt); N.forEach((x, i) => x.nd.g.position.y = x.a.p[1] + Math.sin(t * 1.5 + i) * .04); N[1].nd.g.position.x = 1.3 + Math.sin(t * .5) * .5; if (wind) winds.children.forEach((w, k) => w.position.x = ((t * 2 + k * .7) % 3) - 1.5); plants.children.forEach((g, k) => g.rotation.z = wind ? Math.sin(t * 6 + k) * .05 : 0); },
    cam: { pos: [0, 3, 5.6], target: [0, .2, 0] }, inpage: { pos: [0, 3.6, 6.8], target: [0, .2, 0] },
    controls: [
      { type: 'seg', label: 'أبرزْ', options: ['الكل', 'الحيوانات', 'النباتات'], value: 0, on: k => { filt = k; apply(); } },
      { type: 'button', label: '🌬️ رياحٌ باردة', toggle: true, on: v => { wind = v; winds.visible = v; if (v) api.toast('تنمو النباتاتُ قريبةً من سطحِ الأرضِ لتحتميَ من الرياحِ الباردة.'); } }
    ],
    quiz: [{ q: 'المس الحيوانَ الذي يستلقي على الثلج.', a: 'seal' }, { q: 'المس النباتاتِ التي تنمو قريبةً من الأرض.', a: 'plants' }, { q: 'المس غزالَ الرنّة.', a: 'deer' }]
  };
}

/* ═════════ ٧) الغابة والغابة المطيرة (ص ١٠٦–١٠٧) ═════════ */
let _barkM = null;
export function forestModel(api, variant = 0) {
  const root = new THREE.Group(); let t = 0, night = false, autumn = false, rainOn = true, filt = 0;
  root.add(disk(4.3, variant ? '#4f8a32' : '#7cb04a', variant ? '#3a7024' : '#5e9438'));
  const leafMs = []; const trees = new THREE.Group(); root.add(trees);
  const spots = variant ? [[-2.6, -1.4, 1.5], [2.5, -1.3, 1.6], [0, -2.4, 1.7], [-1.2, -.2, 1.3], [1.4, -.3, 1.25], [-3.2, .8, 1.1], [3.1, .9, 1.1]] : [[-2.4, -1.4, 1.1], [2.4, -1.2, 1.15], [0, -2.2, 1.2], [-3, .6, .9], [3, .7, .95]];
  spots.forEach(([x, z, s], i) => {
    const g = new THREE.Group(); g.position.set(x, -.45, z); trees.add(g);
    const H = variant ? 4.2 * s : 2.4 * s;
    g.add(vessel([[0, 0, 0], [.04 * s, H * .45, 0], [-.03 * s, H * .9, .02], [0, H + .2, 0]], .2 * s, .07 * s, _barkM || (_barkM = tissue('#6a4a2c', { kind: 'vein', bumpScale: 3, roughness: .9, clearcoat: 0, sheen: .1 })), 30, 12, .05)); { const tw = []; for (let k = 0; k < 3; k++) twigs(tw, V(0, H * (.7 + k * .1), 0), V(Math.cos(k * 2.1 + i), .9, Math.sin(k * 2.1 + i)), .5 * s, .05 * s, 2, .8); g.add(new THREE.Mesh(mergeGeos(tw), _barkM)); }
    const lm = new THREE.MeshPhysicalMaterial({ color: variant ? '#2f8a2a' : '#3f8f32', roughness: .75, sheen: .7, sheenColor: new THREE.Color('#e0f0b0'), bumpMap: tissueBump('pore', 4), bumpScale: 4 }); leafMs.push(lm);
    if (variant) { for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; const l = mesh(organGeo(.7 * s, v => v.multiplyScalar(1 + fbm3(v.x * 3 + k, v.y * 3, v.z * 3) * .3), 32, 22), lm, [Math.cos(a) * .6 * s, H + .1, Math.sin(a) * .6 * s]); l.scale.y = .45; g.add(l); } }
    else for (const [dx, dy, dz, r] of [[0, H + .3, 0, .8], [-.45, H, .2, .55], [.45, H, -.15, .55]]) g.add(mesh(organGeo(r * s, v => v.multiplyScalar(1 + fbm3(v.x * 2.5 + dx * 3, v.y * 2.5, v.z * 2.5) * .3), 32, 22), lm, [dx * s, dy, dz * s]));
  });
  // أوراق متساقطة في الخريف
  const fallen = new THREE.Group(); root.add(fallen); for (let k = 0; k < 40; k++) { const l = mesh(new THREE.CircleGeometry(.06, 6), mat(k % 2 ? '#e0782a' : '#d8a82a', { side: THREE.DoubleSide }), [(Math.random() - .5) * 7, 2 + Math.random() * 1.5, -2 + Math.random() * 3]); fallen.add(l); } fallen.visible = false;
  const nightDome = mesh(new THREE.SphereGeometry(12, 24, 12), new THREE.MeshBasicMaterial({ color: '#0a1430', transparent: true, opacity: .55, side: THREE.BackSide, depthWrite: false })); nightDome.visible = false; root.add(nightDome);
  let A;
  if (!variant) A = [
    { id: 'owl', e: '🦉', n: 'البومة', p: [-2.4, 1.8, -1], info: 'لها عينانِ كبيرتان؛ يصطادُ البومُ في الليلِ مستخدمًا حاسّتَي السمعِ والبصر.' },
    { id: 'wood', e: '🐦', n: 'نقّار الخشب', p: [2.15, 1.3, -1], info: 'له منقارٌ طويلٌ حادٌّ ينقرُ به الأشجارَ بحثًا عن الحشراتِ ليأكلَها.' },
    { id: 'squ', e: '🐿️', n: 'السنجاب', p: [.4, -.05, .9], info: 'له خدودٌ كبيرةٌ تساعدُه على حملِ الكثيرِ من الجوز.' },
    { id: 'deer', e: '', n: 'الغزال المنقّط', p: [-1, -.45, 1.2], info: 'جلدُ الغزالِ المنقّطُ يساعدُه على التخفّي في الغابة.' }
  ]; else A = [
    { id: 'parrot', e: '🦜', n: 'الببغاء', p: [1.2, 4.6, -1.2], info: 'تعيشُ على قممِ الأشجار، وتأكلُ الثمارَ والبذورَ من الأشجارِ العالية.', top: 1 },
    { id: 'bat', e: '🦇', n: 'الخفّاش', p: [-1.6, 4.9, -1.4], info: 'تعيشُ الخفافيشُ على قممِ الأشجارِ في الغابةِ المطيرة.', top: 1 },
    { id: 'bird', e: '🐦', n: 'الطيور الملوّنة', p: [-.2, 5.3, -2.2], info: 'تعيشُ الطيورُ الملوّنةُ على قممِ الأشجار.', top: 1 },
    { id: 'tiger', e: '🐅', n: 'النمر', p: [.6, .1, 1.2], info: 'يعيشُ النمرُ على الأرضِ ويبحثُ عن غذائه عليها.', top: 0 },
    { id: 'ant', e: '🐜', n: 'الحشرات وآكلات النمل', p: [-1.4, -.1, 1.4], info: 'تعيشُ آكلاتُ النملِ على أرضِ الغابة، وتتغذّى على النملِ والحشرات.', top: 0 }
  ];
  const N = A.map(a => { if (!a.e) { const d = deer(1.1, '#b07a42'); d.position.set(...a.p); root.add(d); for (let k = 0; k < 10; k++) d.add(mesh(new THREE.SphereGeometry(.03, 8, 6), mat('#f6ecd8'), [(k % 5) * .09 - .22, .62 + (k % 2) * .05, (k < 5 ? 1 : -1) * .13])); const p = new THREE.Mesh(new THREE.SphereGeometry(.55, 12, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); p.position.y = .6; d.add(p); return { a, nd: { g: d, p } }; } return { a, nd: node(root, a.e, a.p, .8, null) }; });
  const rain = fall(root, 80, '#9fd0ff', .03, [-4, 4, -.4, 6, -3, 3], 5); rain.g.visible = !!variant;
  const tl = txt(variant ? 'الغابةُ المطيرة: أمطارٌ كلَّ يومٍ تقريبًا' : 'الغابة: تتوافرُ فيها الأمطارُ وضوءُ الشمس', .28, '#1a4a2a'); tl.position.set(0, variant ? 6.4 : 4, 0); root.add(tl);
  function apply() {
    leafMs.forEach((m, i) => m.color.set(autumn ? (i % 2 ? '#e0782a' : '#d8a82a') : (variant ? '#2f8a2a' : '#3f8f32'))); if (!variant && autumn) leafMs[2].color.set('#3f8f32');
    fallen.visible = autumn; nightDome.visible = night;
    if (variant) N.forEach(x => x.nd.g.scale.setScalar(filt === 0 || (filt === 1 && x.a.top) || (filt === 2 && !x.a.top) ? 1.15 : .6));
  }
  apply();
  const parts = N.map(x => ({ id: x.a.id, name: x.a.n, info: x.a.info, objs: [x.nd.p], at: anchor(x.nd.g, [0, x.a.e ? .6 : 1.3, 0]) }));
  const controls = variant ? [
    { type: 'seg', label: 'أينَ يعيش؟', options: ['الكل', 'على قمم الأشجار', 'على الأرض'], value: 0, on: k => { filt = k; apply(); api.toast(['في الغابةِ المطيرةِ تعيشُ أنواعٌ كثيرةٌ من النباتاتِ والحيوانات.', 'الخفافيشُ والحشراتُ والطيورُ الملوّنةُ تعيشُ على قممِ الأشجار.', 'النمورُ وآكلاتُ النملِ تعيشُ على الأرض.'][k]); } },
    { type: 'button', label: '🌧️ المطر', toggle: true, on: v => { rain.g.visible = !v; } }
  ] : [
    { type: 'seg', label: 'الفصل', options: ['الصيف', 'الخريف'], value: 0, on: k => { autumn = !!k; apply(); if (k) api.toast('معظمُ الأشجارِ يتغيّرُ لونُ أوراقِها وتتساقطُ في فصلِ الخريف، وهناكَ أشجارٌ تبقى أوراقُها خضراءَ طوالَ السنة.'); } },
    { type: 'button', label: '🌙 الليل', toggle: true, on: v => { night = v; apply(); if (v) api.toast('يصطادُ البومُ في الليلِ مستخدمًا عينيه الكبيرتينِ وسمعَه.'); } }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; rain.update(dt);
      if (autumn) fallen.children.forEach((l, k) => { l.position.y -= dt * .4; l.rotation.x += dt * 2; l.position.x += Math.sin(t + k) * dt * .2; if (l.position.y < -.4) l.position.y = 3.2; });
      if (!variant) { const owl = N[0].nd.g; if (night) { owl.position.set(-2.4 + Math.sin(t * .8) * 2.2, 1.9 + Math.sin(t * 1.6) * .3, -1 + Math.cos(t * .8) * 1.2); } else owl.position.set(-2.4, 1.8, -1); N[1].nd.g.position.x = 2.15 + Math.abs(Math.sin(t * 8)) * .08; N[2].nd.g.position.y = -.05 + Math.abs(Math.sin(t * 3)) * .12; }
      else { N.forEach((x, i) => { if (x.a.top) { x.nd.g.position.x = x.a.p[0] + Math.sin(t * .7 + i) * .4; x.nd.g.position.y = x.a.p[1] + Math.sin(t * 2 + i) * .1; } }); N[3].nd.g.position.x = .6 + Math.sin(t * .5) * .8; }
    },
    cam: variant ? { pos: [0, 3.4, 8.2], target: [0, 2.3, 0] } : { pos: [0, 2.8, 6.4], target: [0, 1, 0] },
    inpage: variant ? { pos: [0, 3.6, 9.6], target: [0, 2.2, 0] } : { pos: [0, 3, 7.6], target: [0, 1, 0] },
    controls,
    quiz: variant ? [{ q: 'المس حيوانًا يأكلُ الثمارَ والبذورَ من الأشجارِ العالية.', a: 'parrot' }, { q: 'المس حيوانًا يبحثُ عن غذائه على الأرض.', a: 'tiger' }] : [{ q: 'المس الحيوانَ الذي يصطادُ ليلًا بعينيه الكبيرتين.', a: 'owl' }, { q: 'المس الحيوانَ الذي يتخفّى بجلدِه المنقّط.', a: 'deer' }, { q: 'المس الحيوانَ الذي يحملُ الجوزَ في خدودِه.', a: 'squ' }]
  };
}

/* ═════════ ٨) الكرة الأرضية: الأغلفة والخريطة والماء (ص ١١٨–١٢٨) ═════════ */
const LANDS = [
  [[-17, 21], [-16, 12], [-8, 4], [6, 4], [9, -1], [13, -12], [12, -18], [18, -34], [26, -34], [35, -24], [40, -15], [40, -3], [51, 11], [43, 12], [33, 28], [32, 31], [20, 32], [10, 37], [-6, 36], [-10, 30]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [5, 58], [10, 63], [20, 70], [40, 68], [60, 70], [80, 73], [100, 77], [140, 72], [180, 68], [180, 62], [160, 58], [142, 52], [140, 40], [127, 35], [122, 30], [120, 22], [108, 20], [105, 10], [100, 2], [98, 10], [92, 22], [80, 15], [77, 8], [72, 20], [66, 25], [57, 26], [59, 22], [52, 15], [43, 13], [35, 28], [35, 36], [28, 41], [26, 38], [22, 37], [12, 44], [15, 40], [8, 44], [3, 43]],
  [[-168, 66], [-140, 70], [-110, 72], [-80, 73], [-62, 60], [-55, 50], [-66, 44], [-76, 35], [-81, 25], [-90, 30], [-97, 26], [-97, 18], [-88, 15], [-80, 8], [-85, 11], [-92, 15], [-105, 20], [-112, 30], [-117, 33], [-124, 40], [-125, 49], [-135, 58], [-150, 60], [-165, 60]],
  [[-50, 60], [-40, 62], [-20, 70], [-20, 80], [-45, 83], [-65, 78], [-55, 70]],
  [[-80, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-73, -40], [-71, -18], [-81, -5]],
  [[114, -22], [122, -18], [131, -12], [137, -12], [142, -11], [146, -19], [153, -26], [150, -37], [140, -38], [132, -32], [115, -34]],
  [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]], [[-5, 50], [1, 51], [-2, 56], [-5, 58], [-6, 54]], [[130, 31], [135, 34], [141, 36], [142, 43], [140, 41], [133, 35]],
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], [[95, 5], [98, 4], [106, -6], [102, -4]], [[166, -46], [174, -41], [178, -38], [172, -40]]
];
function earthTex(mode) {
  const W = 1024, H = 512, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const X = lo => (lo + 180) / 360 * W, Y = la => (90 - la) / 180 * H;
  const sea = mode === 1 ? '#5a6878' : '#2f7fd0', land = mode === 2 ? '#7a7a7a' : '#5aa83a';
  g.fillStyle = sea; g.fillRect(0, 0, W, H);
  if (mode !== 1) { for (let k = 0; k < 300; k++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .05})`; g.fillRect(Math.random() * W, Math.random() * H, 30, 2); } }
  g.fillStyle = land; LANDS.forEach(P => { g.beginPath(); P.forEach(([lo, la], i) => i ? g.lineTo(X(lo), Y(la)) : g.moveTo(X(lo), Y(la))); g.closePath(); g.fill(); });
  g.fillRect(0, Y(-66), W, H - Y(-66));
  if (mode !== 2) {
    const ell = (lo, la, rx, ry, col) => { g.fillStyle = col; g.beginPath(); g.ellipse(X(lo), Y(la), rx / 360 * W, ry / 180 * H, 0, 0, TAU); g.fill(); };
    ell(12, 23, 24, 8, '#e8cc6a'); ell(46, 22, 8, 6, '#e8cc6a'); ell(132, -25, 11, 6, '#e8cc6a'); ell(-112, 35, 6, 5, '#e8cc6a'); ell(62, 40, 8, 4, '#e8cc6a');
    ell(85, 31, 14, 4, '#9a6a3a'); ell(-112, 45, 4, 12, '#9a6a3a'); ell(-70, -20, 3, 22, '#9a6a3a'); ell(42, 40, 8, 3, '#9a6a3a');
    g.fillStyle = '#f4f8fc'; g.fillRect(0, Y(-68), W, H - Y(-68)); g.fillRect(0, 0, W, Y(80));
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function lonlat(lo, la, r) { const ph = (lo + 180) / 360 * TAU, th = (90 - la) / 180 * Math.PI; return V(-r * Math.cos(ph) * Math.sin(th), r * Math.cos(th), r * Math.sin(ph) * Math.sin(th)); }
export function globeModel(api, variant = 0) {
  const root = new THREE.Group(); let t = 0, mode = 0, spin = true, targetRy = null;
  const R = 1.9; const tex = [earthTex(0), earthTex(1), earthTex(2)];
  const earth = new THREE.Group(); earth.position.set(variant === 1 ? 0 : -.9, .3, 0); earth.rotation.x = .25; root.add(earth);
  const spinG = new THREE.Group(); earth.add(spinG);
  const ball = mesh(new THREE.SphereGeometry(R, 64, 40), new THREE.MeshStandardMaterial({ map: tex[0], roughness: .7 })); spinG.add(ball);
  const atm = mesh(new THREE.SphereGeometry(R * 1.12, 48, 32), glass('#8ac8ff', .16)); earth.add(atm);
  const clouds = new THREE.Group(); spinG.add(clouds); for (let k = 0; k < 14; k++) { const p = lonlat(k * 47 % 360 - 180, (k * 37 % 120) - 60, R * 1.025); const c = mesh(new THREE.SphereGeometry(.13 + (k % 3) * .04, 10, 8), mat('#ffffff', { transparent: true, opacity: .7 }), p.toArray()); c.lookAt(0, 0, 0); c.scale.set(1.8, 1, .25); clouds.add(c); }
  // علامات الخريطة
  const marks = [['continent', 'قارّة', 25, 15], ['island', 'جزيرة', 47, -19], ['ocean', 'محيط', 75, -20]].map(([id, n, lo, la]) => { const p = lonlat(lo, la, R * 1.02); const dot = mesh(new THREE.SphereGeometry(.07, 12, 8), mat('#e02020', { emissive: '#e02020', emissiveIntensity: .5 }), p.toArray()); spinG.add(dot); const l = txt(n, .28, '#a01010'); l.material.depthTest = true; l.position.copy(lonlat(lo, la, R * 1.25)); spinG.add(l); return { id, n, lo, la, dot, l }; });
  marks.forEach(m => { m.dot.visible = m.l.visible = variant === 1; });
  // رسم دائري: أربعة أجزاء
  const pie = new THREE.Group(); pie.position.set(2.6, .4, .3); pie.rotation.x = .3; root.add(pie); pie.visible = variant !== 1;
  const q = []; for (let k = 0; k < 4; k++) { const s = mesh(new THREE.CylinderGeometry(.9, .9, .14, 32, 1, false, k * TAU / 4, TAU / 4 - .04), mat(k === 3 ? '#5aa83a' : '#2f7fd0', { roughness: .5 })); s.rotation.x = -Math.PI / 2; pie.add(s); q.push(s); }
  const pl = txt('٣ أجزاءٍ ماء + جزءٌ يابسة', .24, '#1a4a7a'); pl.position.set(2.6, -.9, .3); root.add(pl); pl.visible = pie.visible;
  const fresh = mesh(new THREE.CylinderGeometry(.92, .92, .16, 32, 1, false, 0, .18), mat('#9ae0ff', { emissive: '#4ac0ff', emissiveIntensity: .3 })); fresh.rotation.x = -Math.PI / 2; fresh.visible = false; pie.add(fresh);
  const ship = node(spinG, '🚢', lonlat(65, 5, R * 1.08).toArray(), .45, null); const dol = node(spinG, '🐬', lonlat(-30, 10, R * 1.08).toArray(), .4, null); ship.g.visible = dol.g.visible = variant === 2;
  const tl = txt('', .28, '#1a4a7a'); tl.position.set(0, 2.85, 0); root.add(tl);
  const MODES = variant === 0 ? ['الأرضُ: غلافٌ جوّيٌّ وصخريٌّ ومائيّ', 'الغلافُ الجوّيّ: الغازاتُ المحيطةُ بالأرض', 'الغلافُ الصخريّ: اليابسة (جزءٌ صغير)', 'الغلافُ المائيّ: الماء (الجزءُ الأكبر)']
    : variant === 1 ? ['البنّيّ جبال، الأخضرُ سهول، الأصفرُ صحارى، الأزرقُ ماء', 'القارّة: جزءٌ كبيرٌ من اليابسة', 'الجزيرة: يابسةٌ يحيطُ بها الماء', 'المحيط: ماءٌ مالحٌ واسعٌ عميق']
    : ['يغطّي الماءُ ثلاثةَ أجزاءٍ من أربعة', 'الماءُ المالح: في البحارِ والمحيطات', 'الماءُ العذب: نسبةٌ قليلة (أنهارٌ وبحيراتٌ وجليد)'];
  function apply() {
    let ti = 0; atm.material.opacity = .16;
    if (variant === 0) { ti = mode === 2 ? 1 : mode === 3 ? 2 : 0; atm.material.opacity = mode === 1 ? .45 : mode ? .05 : .16; q.forEach((s, k) => s.scale.setScalar((mode === 2 && k === 3) || (mode === 3 && k < 3) ? 1.15 : 1)); }
    if (variant === 2) { ti = mode === 1 ? 2 : 0; fresh.visible = mode === 2; q.forEach((s, k) => s.material.color.set(mode === 2 && k < 3 ? '#1a5a9a' : (k === 3 ? '#5aa83a' : '#2f7fd0'))); }
    if (variant === 1) { marks.forEach((m, k) => { const on = mode === 0 || mode === k + 1; m.l.visible = m.dot.visible = on; }); if (mode) { const m = marks[mode - 1]; const p = lonlat(m.lo, m.la, 1); targetRy = -Math.atan2(p.x, p.z); spin = false; } else spin = true; }
    ball.material.map = tex[ti]; ball.material.needsUpdate = true; setTxt(tl, MODES[mode]);
  }
  apply();
  const parts = variant === 1 ? marks.map(m => ({ id: m.id, name: m.n, info: { continent: 'القارّاتُ أجزاءٌ كبيرةٌ من اليابسة، وهي محاطةٌ بالمحيطات.', island: 'الجزيرةُ جزءٌ صغيرٌ من اليابسةِ يحيطُ به الماءُ من جميعِ الجهات.', ocean: 'المحيطُ تجمّعٌ كبيرٌ وعميقٌ من الماءِ المالح.' }[m.id], objs: [m.dot], at: anchor(m.dot, [0, .1, 0]) }))
    : [{ id: 'atm', name: 'الغلاف الجوّي', info: 'الغازاتُ المحيطةُ بالكرةِ الأرضيّة.', objs: [atm], at: anchor(earth, [0, R * 1.15, 0]) },
      { id: 'water', name: variant === 2 ? 'المحيطات (ماءٌ مالح)' : 'الغلاف المائي', info: variant === 2 ? 'تغطّي المحيطاتُ معظمَ سطحِ الأرض، وماؤها مالحٌ لا يصلحُ للشرب.' : 'نسبةُ الماءِ على الأرض، ويشكّلُ الجزءَ الأكبرَ من مساحتِها.', objs: [ball, ...q.slice(0, 3)], at: anchor(earth, [R * .7, -R * .6, R * .3]) },
      { id: 'land', name: 'الغلاف الصخري (اليابسة)', info: 'نسبةُ اليابسةِ على الأرض، وتشكّلُ جزءًا صغيرًا من مساحتِها.', objs: [q[3]], at: anchor(pie, [0, -.3, -.6]) }];
  if (variant === 2) parts.push({ id: 'ship', name: 'السفن', info: 'تبحرُ السفنُ الكبيرةُ في المحيط، وتنقلُ الناسَ والبضائعَ من مكانٍ إلى آخر.', objs: [ship.p], at: anchor(ship.g, [0, .3, 0]) }, { id: 'dol', name: 'الدلافين', info: 'تعيشُ معظمُ الدلافينِ في الماءِ المالح.', objs: [dol.p], at: anchor(dol.g, [0, .3, 0]) });
  const opts = variant === 0 ? ['الكل', 'الجوّي', 'الصخري', 'المائي'] : variant === 1 ? ['ألوان الخريطة', 'قارّة', 'جزيرة', 'محيط'] : ['الماء على الأرض', 'الماء المالح', 'الماء العذب'];
  return {
    root, parts,
    update(dt) {
      t += dt; if (spin) spinG.rotation.y += dt * .18; else if (targetRy !== null) { let d = targetRy - spinG.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); spinG.rotation.y += d * Math.min(1, dt * 3); }
      clouds.rotation.y += dt * .05; marks.forEach(m => m.dot.scale.setScalar(1 + Math.sin(t * 5) * .25));
      if (variant === 2) { ship.g.position.copy(lonlat(65 + Math.sin(t * .3) * 15, 5, R * 1.08)); dol.g.position.copy(lonlat(-30, 10, R * (1.08 + Math.abs(Math.sin(t * 2)) * .06))); }
    },
    cam: { pos: [0, 1.2, 6.6], target: [variant === 1 ? 0 : .5, .2, 0] }, inpage: { pos: [0, 1.4, 7.8], target: [variant === 1 ? 0 : .5, .2, 0] },
    controls: [
      { type: 'seg', label: variant === 1 ? 'أظهرْ' : 'أبرزْ', options: opts, value: 0, on: k => { mode = k; apply(); } },
      { type: 'button', label: '⏸️ إيقاف الدوران', toggle: true, on: v => { spin = !v; targetRy = null; } }
    ],
    legend: variant === 1 ? [['#9a6a3a', 'جبال'], ['#5aa83a', 'سهول'], ['#e8cc6a', 'صحارى'], ['#2f7fd0', 'ماء']] : [['#2f7fd0', 'ماء'], ['#5aa83a', 'يابسة']],
    quiz: variant === 1 ? [{ q: 'المس الجزيرة.', a: 'island' }, { q: 'المس المحيط.', a: 'ocean' }, { q: 'المس القارّة.', a: 'continent' }] : [{ q: 'المس الغلافَ الذي يشكّلُ الجزءَ الأكبرَ من مساحةِ الأرض.', a: 'water' }, { q: 'المس الغازاتِ المحيطةَ بالأرض.', a: 'atm' }, { q: 'المس الجزءَ الذي يمثّلُ اليابسةَ في الرسمِ الدائريّ.', a: 'land' }]
  };
}

/* ═════════ ٩) الصخور والمعادن (ص ١٤٠–١٤٣) ═════════ */
export function rocksModel(api, variant = 0) {
  const root = new THREE.Group(); let t = 0, mode = 0;
  const table = mesh(new THREE.BoxGeometry(7.4, .25, 4.2), mat('#c8a878', { map: noiseTexture('#d0b080', '#b89868', 1500) }), [0, -.62, 0]); root.add(table);
  const tl = txt('', .28, '#4a2a10'); tl.position.set(0, 2.2, 0); root.add(tl);
  if (!variant) {
    const R = [
      { id: 'r1', n: 'صخرةٌ كبيرةٌ رماديّةٌ خشنة', c: '#8a8a8a', s: .62, rough: 1, col: 0, size: 2, sd: 1 },
      { id: 'r2', n: 'حصاةٌ صغيرةٌ بيضاءُ ناعمة', c: '#f2efe6', s: .26, rough: 0, col: 1, size: 0, sd: 2 },
      { id: 'r3', n: 'صخرةٌ حمراءُ متوسّطةٌ خشنة', c: '#b84a32', s: .42, rough: 1, col: 2, size: 1, sd: 3 },
      { id: 'r4', n: 'صخرةٌ سوداءُ لامعةٌ ناعمة', c: '#222428', s: .38, rough: 0, col: 3, size: 1, sd: 4 },
      { id: 'r5', n: 'صخرةٌ رمليّةٌ صفراءُ كبيرة', c: '#d8a85a', s: .58, rough: 1, col: 4, size: 2, sd: 5 },
      { id: 'r6', n: 'حصاةٌ رماديّةٌ صغيرةٌ ناعمة', c: '#9a9a9a', s: .24, rough: 0, col: 0, size: 0, sd: 6 },
      { id: 'r7', n: 'صخرةٌ حمراءُ صغيرةٌ ناعمة', c: '#c05a40', s: .27, rough: 0, col: 2, size: 0, sd: 7 },
      { id: 'r8', n: 'صخرةٌ بيضاءُ كبيرةٌ خشنة', c: '#e8e2d4', s: .55, rough: 1, col: 1, size: 2, sd: 8 }
    ];
    const S = R.map((r, i) => { const m = mesh(rockGeo(r.s, r.sd, r.rough ? 1 : 3, r.rough ? .28 : .08), mat(r.c, { flatShading: !!r.rough, roughness: r.rough ? .95 : .25, metalness: r.id === 'r4' ? .3 : 0, map: r.rough ? noiseTexture(r.c, '#00000033', 900) : null }), [0, 0, 0]); m.scale.y = r.rough ? .8 : .6; root.add(m); const home = [-2.9 + (i % 4) * 1.9, -.5 + r.s * .55, i < 4 ? -.8 : .9]; m.position.set(...home); return { r, m, home, to: V(...home) }; });
    const heads = new THREE.Group(); root.add(heads);
    const GROUPS = [null, ['رماديّ', 'أبيض', 'أحمر', 'أسود', 'أصفر'], ['صغير', 'متوسّط', 'كبير'], ['ناعم', 'خشن']];
    function apply() {
      heads.clear(); const key = [null, 'col', 'size', 'rough'][mode];
      if (!key) S.forEach(s => s.to.set(...s.home));
      else { const L = GROUPS[mode]; const cnt = L.map(() => 0); L.forEach((n, k) => { const x = (L.length === 1 ? 0 : -3 + k * 6 / (L.length - 1)); const h = txt(n, .26, '#333'); h.position.set(x, 1.1, -1.4); heads.add(h); }); S.forEach(s => { const k = s.r[key]; const x = -3 + k * 6 / (L.length - 1); s.to.set(x, -.5 + s.r.s * .55, -.8 + cnt[k]++ * 1.05); }); }
      setTxt(tl, ['الصخورُ تختلفُ في الشكلِ والحجمِ واللونِ والملمس', 'صنّفْتُ الصخورَ حسبَ اللون', 'صنّفْتُ الصخورَ حسبَ الحجم', 'صنّفْتُ الصخورَ حسبَ الملمس'][mode]);
    }
    apply();
    return {
      root, parts: S.map(s => ({ id: s.r.id, name: s.r.n, info: s.r.n + '. الصخورُ أشياءُ غيرُ حيّةٍ موجودةٌ في الأرض، أغلبُها صُلبة.', objs: [s.m], at: anchor(s.m, [0, s.r.s + .2, 0]) })),
      update(dt) { t += dt; S.forEach((s, i) => { s.m.position.lerp(s.to, Math.min(1, dt * 3)); s.m.rotation.y = Math.sin(t * .4 + i) * .3; }); },
      cam: { pos: [0, 3.2, 5.4], target: [0, -.2, 0] }, inpage: { pos: [0, 3.8, 6.2], target: [0, -.2, 0] },
      controls: [{ type: 'seg', label: 'صنّفْ حسبَ', options: ['بلا تصنيف', 'اللون', 'الحجم', 'الملمس'], value: 0, on: k => { mode = k; apply(); } }],
      quiz: [{ q: 'المس صخرةً سوداءَ لامعة.', a: 'r4' }, { q: 'المس أصغرَ حصاةٍ بيضاء.', a: 'r2' }, { q: 'المس صخرةً رمليّةً صفراء.', a: 'r5' }]
    };
  }
  // المعادن واستعمالاتها
  const M = [
    { id: 'graph', n: 'الجرافيت', use: '✏️', u: 'أقلام الرصاص', c: '#3a3c40', met: .6, shape: 'rock' },
    { id: 'magn', n: 'المجناتيت', use: '🧲', u: 'المغناطيس', c: '#2a2a2e', met: .5, shape: 'oct' },
    { id: 'fluo', n: 'الفلورايت', use: '🪥', u: 'معجون الأسنان', c: '#8a5ad0', met: 0, shape: 'cube' },
    { id: 'turq', n: 'التركواز', use: '💍', u: 'الحليّ', c: '#2ab4d8', met: 0, shape: 'round' }
  ];
  const S = M.map((m, i) => {
    const g = new THREE.Group(); g.position.set(-2.7 + i * 1.8, 0, .4); root.add(g);
    g.add(mesh(new THREE.CylinderGeometry(.45, .5, .3, 24), mat('#f4efe4'), [0, -.35, 0]));
    const geo = m.shape === 'oct' ? new THREE.OctahedronGeometry(.42) : m.shape === 'cube' ? new THREE.BoxGeometry(.5, .5, .5) : m.shape === 'round' ? rockGeo(.38, 9, 3, .1) : rockGeo(.4, 5, 1, .25);
    const spec = mesh(geo, m.shape === 'cube' ? new THREE.MeshPhysicalMaterial({ color: m.c, roughness: .1, transmission: .3, transparent: true, opacity: .85 }) : mat(m.c, { metalness: m.met, roughness: m.met ? .3 : .45, flatShading: m.shape === 'rock' }), [0, .15, 0]); g.add(spec);
    if (m.shape === 'cube') { const s2 = spec.clone(); s2.scale.setScalar(.6); s2.position.set(.25, .05, .2); s2.rotation.set(.4, .5, 0); g.add(s2); }
    const u = node(g, m.use, [0, 1.15, 0], .6, 'rgba(255,255,255,.95)'); const ar = arrowTube([[0, .55, 0], [0, .7, 0], [0, .82, 0]], .03, '#888', .12); g.add(ar);
    const l = txt(m.n, .24, '#222'); l.position.set(0, -.75, .6); g.add(l);
    return { m, g, spec, u };
  });
  const granite = new THREE.Group(); granite.position.set(0, 0, -1.4); root.add(granite);
  const gr = mesh(rockGeo(.62, 12, 1, .2), mat('#fff', { map: noiseTexture('#e8b8a8', '#3a3a3a', 4000, 256, 256, 6), flatShading: true }), [0, 0, 0]); gr.scale.y = .7; granite.add(gr);
  const gl = txt('الجرانيت: صخرةٌ من معادنَ مختلفة', .22, '#5a2a1a'); gl.position.set(0, .8, 0); granite.add(gl);
  let lens = false;
  function apply() { S.forEach((s, i) => { const on = mode === 0 || mode === i + 1; s.g.scale.setScalar(on ? (mode ? 1.25 : 1) : .7); }); granite.scale.setScalar(mode === 5 ? 1.5 : 1); setTxt(tl, mode === 0 ? 'المعادنُ أجزاءٌ صُلبةٌ غيرُ حيّةٍ تتكوّنُ منها الصخور' : mode === 5 ? 'تتكوّنُ صخرةُ الجرانيتِ من معادنَ مختلفة' : 'من ' + M[mode - 1].n + ' نصنعُ ' + M[mode - 1].u); }
  apply();
  const parts = [...S.map(s => ({ id: s.m.id, name: s.m.n, info: 'معدنٌ نستخدمُه في صنعِ ' + s.m.u + '.', objs: [s.spec, s.u.p], at: anchor(s.g, [0, .7, 0]) })), { id: 'granite', name: 'صخرة الجرانيت', info: 'تتكوّنُ صخرةُ الجرانيتِ من معادنَ مختلفة؛ فالصخورُ قد تتكوّنُ من معدنٍ واحدٍ أو أكثر.', objs: [gr], at: anchor(granite, [0, .5, 0]) }];
  return {
    root, parts,
    update(dt) { t += dt; S.forEach((s, i) => { s.spec.rotation.y += dt * (lens ? 1.2 : .4); s.u.g.position.y = 1.15 + Math.sin(t * 2 + i) * .05; s.spec.scale.setScalar(lens ? 1.5 : 1); }); gr.rotation.y += dt * .2; },
    cam: { pos: [0, 2.6, 5.6], target: [0, .1, 0] }, inpage: { pos: [0, 3, 6.6], target: [0, .1, 0] },
    controls: [
      { type: 'seg', label: 'المعدن', options: ['الكل', ...M.map(m => m.n), 'الجرانيت'], value: 0, on: k => { mode = k; apply(); } },
      { type: 'button', label: '🔍 عدسةٌ مكبّرة', toggle: true, on: v => { lens = v; if (v) api.toast('ألاحظُ المعادنَ بالعدسةِ المكبّرة: كلٌّ منها يختلفُ في لونِه ولمعانِه وشكلِه.'); } }
    ],
    quiz: [{ q: 'المس المعدنَ الذي نصنعُ منه أقلامَ الرصاص.', a: 'graph' }, { q: 'المس المعدنَ الذي نصنعُ منه الحليّ.', a: 'turq' }, { q: 'المس المعدنَ الذي يدخلُ في صنعِ معجونِ الأسنان.', a: 'fluo' }]
  };
}
