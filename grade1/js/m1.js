// مجسّمات الصف الأول
import { THREE, mat, glass, mesh, tube, anchor, V, noiseTexture, tree, cloud, arrowTube, organGeo, fbm3, tissue, tissueBump, vessel, twigs, mergeGeos, creature } from './kit.js';
import { txt, setTxt } from './models6a.js';
import { node } from './m4a.js';
const TAU = Math.PI * 2;
function disk(r, c1, c2, y = -.6) { return mesh(new THREE.CylinderGeometry(r, r + .15, .3, 64), mat('#fff', { map: noiseTexture(c1, c2, 3000) }), [0, y, 0]); }
function glow(objs, on, color = '#ffd84a') { objs.forEach(o => o.traverse && o.traverse(m => { if (m.isMesh && m.material && m.material.emissive) { m.material.emissive.set(on ? color : '#000'); m.material.emissiveIntensity = on ? .45 : 0; } })); }
function drops(root, n, box, speed = 3, color = '#7cc4ff') {
  const g = new THREE.Group(); root.add(g); const m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .85 });
  const geo = new THREE.SphereGeometry(.05, 8, 6); const P = [];
  for (let i = 0; i < n; i++) { const d = new THREE.Mesh(geo, m); d.scale.y = 1.6; d.position.set(box[0] + Math.random() * (box[1] - box[0]), box[2] + Math.random() * (box[3] - box[2]), box[4] + Math.random() * (box[5] - box[4])); g.add(d); P.push(d); }
  return { g, update(dt) { if (!g.visible) return; P.forEach(d => { d.position.y -= dt * speed; if (d.position.y < box[2]) d.position.y = box[3]; }); } };
}

/* ═════════ ١) نباتات الصحراء ونباتات الغابة (ص ٣٧–٤٠) ═════════ */
export function twoplacesModel(api) {
  const root = new THREE.Group(); let t = 0, water = [true, true], days = 0, sel = 0;
  const D = new THREE.Group(); D.position.x = 2; root.add(D);
  const F = new THREE.Group(); F.position.x = -2; root.add(F);
  D.add(mesh(new THREE.CylinderGeometry(1.8, 1.9, .3, 48), mat('#fff', { map: noiseTexture('#e8c48a', '#d0a466', 3000) }), [0, -.6, 0]));
  F.add(mesh(new THREE.CylinderGeometry(1.8, 1.9, .3, 48), mat('#fff', { map: noiseTexture('#5a8a3a', '#3e6e28', 3000) }), [0, -.6, 0]));
  // صبّار بأشواك
  const cm = mat('#4f9a42', { roughness: .6 }); const cac = new THREE.Group(); D.add(cac); cac.position.set(0, -.45, 0);
  const body = mesh(new THREE.CapsuleGeometry(.32, 1.4, 8, 20), cm, [0, 1, 0]); cac.add(body);
  const arm1 = mesh(new THREE.CapsuleGeometry(.18, .6, 6, 14), cm, [.5, 1.2, 0]); cac.add(arm1); const arm1b = mesh(new THREE.CylinderGeometry(.18, .18, .4, 14), cm, [.33, .95, 0], [0, 0, Math.PI / 2]); cac.add(arm1b);
  const arm2 = mesh(new THREE.CapsuleGeometry(.15, .5, 6, 14), cm, [-.45, 1.45, 0]); cac.add(arm2); const arm2b = mesh(new THREE.CylinderGeometry(.15, .15, .35, 14), cm, [-.3, 1.2, 0], [0, 0, Math.PI / 2]); cac.add(arm2b);
  const spines = new THREE.Group(); cac.add(spines); const sm = mat('#f4f0d8');
  for (let k = 0; k < 70; k++) { const a = k * 2.39, y = .3 + (k % 14) * .12; const s = mesh(new THREE.ConeGeometry(.018, .16, 4), sm); s.position.set(Math.cos(a) * .33, y, Math.sin(a) * .33); s.lookAt(Math.cos(a) * 2, y, Math.sin(a) * 2); s.rotateX(Math.PI / 2); spines.add(s); }
  const store = mesh(new THREE.CapsuleGeometry(.22, 1.1, 6, 14), new THREE.MeshBasicMaterial({ color: '#4ab0ff', transparent: true, opacity: .0, depthWrite: false }), [0, 1, 0]); cac.add(store);
  const sun = mesh(new THREE.SphereGeometry(.3, 20, 12), mat('#ffd34a', { emissive: '#ffb020', emissiveIntensity: .8 }), [1.2, 2.7, -.6]); D.add(sun);
  // شجرة غابة بأوراق كبيرة
  const ft = new THREE.Group(); F.add(ft); ft.position.y = -.45;
  ft.add(mesh(new THREE.CylinderGeometry(.14, .22, 1.6, 12), mat('#6a4a2c', { map: noiseTexture('#7a5634', '#5a3a20', 900) }), [0, .8, 0]));
  const leafM = mat('#2f8a2a', { side: THREE.DoubleSide, roughness: .5 }); const leaves = new THREE.Group(); ft.add(leaves);
  for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; const l = mesh(new THREE.SphereGeometry(.42, 16, 8), leafM); l.scale.set(1.3, .12, .7); l.position.set(Math.cos(a) * .55, 1.6 + (k % 3) * .25, Math.sin(a) * .55); l.rotation.set(.4 * Math.sin(a), -a, .5); leaves.add(l); }
  const rain = drops(F, 40, [-1.5, 1.5, -.4, 3, -1.2, 1.2], 3.5); const rainD = drops(D, 4, [-1.5, 1.5, -.4, 3, -1.2, 1.2], 3.5);
  const drip = drops(F, 10, [-1, 1, -.4, 1.6, -1, 1], 1.6, '#5aa8ff');
  const lD = txt('الصحراء: مكانٌ جافّ', .3, '#8a5a10'), lF = txt('الغابة: مكانٌ رطب', .3, '#1a5a1a'); lD.position.set(2, 3.2, 0); lF.position.set(-2, 3.2, 0); root.add(lD); root.add(lF);
  const info = txt('', .26, '#333'); info.position.set(0, -1.35, 1.6); root.add(info);
  function apply() {
    store.material.opacity = sel === 1 ? .55 : 0; glow([spines], sel === 1); glow([leaves], sel === 2, '#9aff6a');
    setTxt(info, sel === 1 ? 'الأشواكُ تساعدُ نباتَ الصحراءِ على الاحتفاظِ بالماء' : sel === 2 ? 'الأوراقُ الكبيرةُ تتخلّصُ من الماءِ الزائد' : 'تعيشُ النباتاتُ في الأماكنِ التي تجدُ فيها حاجاتِها');
  }
  apply();
  const parts = [
    { id: 'cactus', name: 'نباتُ الصحراء', info: 'الصحراءُ مكانٌ جافٌّ قليلُ النباتات. نباتاتُ الصحراءِ لها أشواكٌ تساعدُها على الاحتفاظِ بالماء.', objs: [body, arm1, arm2], at: anchor(cac, [0, 2, 0]) },
    { id: 'spines', name: 'الأشواك', info: 'تساعدُ نباتَ الصحراءِ على الاحتفاظِ بالماء.', objs: spines.children, at: anchor(cac, [.4, 1.3, .3]) },
    { id: 'leaves', name: 'أوراقُ الغابةِ الكبيرة', info: 'الغابةُ مكانٌ رطبٌ فيه نباتاتٌ كثيرة. نباتاتُ الغابةِ لها أوراقٌ كبيرةٌ تساعدُها على التخلّصِ من الماءِ الزائد.', objs: leaves.children, at: anchor(ft, [0, 2.2, 0]) }
  ];
  return {
    root, parts,
    update(dt) { t += dt; rain.update(dt); rainD.update(dt); drip.update(dt); sun.scale.setScalar(1 + Math.sin(t * 3) * .06); leaves.children.forEach((l, k) => l.rotation.z = .5 + Math.sin(t * 2 + k) * .06); },
    cam: { pos: [0, 2.6, 7.4], target: [0, 1, 0] }, inpage: { pos: [0, 2.6, 7.6], target: [0, 1, 0] },
    controls: [{ type: 'seg', label: 'أبرزْ', options: ['الكل', 'الأشواك', 'الأوراق الكبيرة'], value: 0, on: k => { sel = k; apply(); } }],
    legend: [['#7cc4ff', 'المطر: كثيرٌ في الغابة، قليلٌ في الصحراء']],
    quiz: [{ q: 'المس الجزءَ الذي يساعدُ نباتَ الصحراءِ على الاحتفاظِ بالماء.', a: 'spines' }, { q: 'المس أوراقَ نباتِ الغابة.', a: 'leaves' }]
  };
}

/* ═════════ ٢) أجزاء السمكة (ص ٥٤) ═════════ */
export function fishModel(api) {
  const root = new THREE.Group(); let t = 0, sel = 0, swim = true;
  const bowl = mesh(new THREE.SphereGeometry(2.4, 48, 32, 0, TAU, .35, Math.PI - .35), glass('#bfe6ff', .18), [0, .4, 0]); root.add(bowl);
  const water = mesh(new THREE.SphereGeometry(2.3, 48, 32, 0, TAU, Math.PI * .38, Math.PI * .62), new THREE.MeshPhysicalMaterial({ color: '#5ab0e8', transparent: true, opacity: .35, roughness: .1, depthWrite: false }), [0, .4, 0]); root.add(water);
  for (let k = 0; k < 40; k++) { const a = k * 2.4, r = (k % 7) * .25; root.add(mesh(new THREE.SphereGeometry(.12, 8, 6), mat(['#3a6ad0', '#2aa0c0', '#e0e0e0'][k % 3]), [Math.cos(a) * r, -1.62, Math.sin(a) * r])); }
  const fish = new THREE.Group(); root.add(fish);
  const om = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .25, clearcoat: 1, clearcoatRoughness: .15, sheen: .6, sheenColor: new THREE.Color('#fff0a0'), iridescence: .3, bumpMap: tissueBump('pore', 31), bumpScale: .8, emissive: '#000' });
  const bg = organGeo(.7, v => { if (v.x < 0) { const k = 1 + v.x / .7 * .45; v.y *= k; v.z *= k; } v.y *= 1 + Math.max(0, v.y) * .25; }, 64, 48); { const P = bg.attributes.position, col = new Float32Array(P.count * 3), c = new THREE.Color(); for (let i = 0; i < P.count; i++) { const y = P.getY(i), x = P.getX(i); c.set('#ff7a10').lerp(new THREE.Color('#ffd040'), THREE.MathUtils.smoothstep(-y, -.1, .5)).lerp(new THREE.Color('#ff5a00'), THREE.MathUtils.smoothstep(y, .3, .6) * .5); col.set([c.r, c.g, c.b], i * 3); } bg.setAttribute('color', new THREE.BufferAttribute(col, 3)); }
  const body = mesh(bg, om); body.scale.set(1.25, .85, .55); fish.add(body);
  const scales = new THREE.Group(); fish.add(scales); for (let k = 0; k < 30; k++) { const x = -.6 + (k % 6) * .22, y = -.3 + Math.floor(k / 6) * .15; const s = mesh(new THREE.SphereGeometry(.07, 12, 8), new THREE.MeshPhysicalMaterial({ color: '#ffd070', roughness: .15, clearcoat: 1, transparent: true, opacity: .35, iridescence: .5 })); s.scale.z = .3; s.position.set(x, y, .36 * Math.sqrt(Math.max(0, 1 - (x / .9) ** 2 - (y / .6) ** 2)) + .02); scales.add(s); }
  const finM = new THREE.MeshPhysicalMaterial({ color: '#ffa040', side: THREE.DoubleSide, transparent: true, opacity: .72, roughness: .3, sheen: 1, sheenColor: new THREE.Color('#fff0c0'), bumpMap: tissueBump('vein', 32), bumpScale: .7, depthWrite: false });
  const tail = new THREE.Group(); tail.position.x = -.85; fish.add(tail); const tsh = new THREE.Shape(); tsh.moveTo(0, .05); tsh.bezierCurveTo(-.4, .3, -.9, .85, -1.2, .7); tsh.bezierCurveTo(-1.0, .4, -.85, .15, -.95, 0); tsh.bezierCurveTo(-.85, -.15, -1.0, -.4, -1.2, -.7); tsh.bezierCurveTo(-.9, -.85, -.4, -.3, 0, -.05); const tg = new THREE.ShapeGeometry(tsh, 24); { const P = tg.attributes.position; for (let i = 0; i < P.count; i++) P.setZ(i, Math.sin(P.getY(i) * 6) * .04 * -P.getX(i)); tg.computeVertexNormals(); } tail.add(new THREE.Mesh(tg, finM));
  const dorsal = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-.4, 0), new THREE.Vector2(0, .55), new THREE.Vector2(.35, 0)])), finM); dorsal.position.set(0, .5, 0); fish.add(dorsal);
  const side = new THREE.Group(); side.position.set(.2, -.2, .32); fish.add(side); const sideFin = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-.45, -.25), new THREE.Vector2(-.35, .05)])), finM); side.add(sideFin);
  const bottom = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(-.3, 0), new THREE.Vector2(-.05, -.4), new THREE.Vector2(.2, 0)])), finM); bottom.position.set(-.2, -.5, 0); fish.add(bottom);
  const gill = mesh(new THREE.TorusGeometry(.3, .03, 8, 24, Math.PI * .9), mat('#c84a1a', { emissive: '#000' }), [.45, 0, .33], [0, .35, -Math.PI * .45]); fish.add(gill);
  const gillIn = mesh(new THREE.SphereGeometry(.2, 16, 10), mat('#e04a5a'), [.48, -.02, .26]); gillIn.scale.set(.5, 1, .3); fish.add(gillIn);
  for (const s of [1]) { fish.add(mesh(new THREE.SphereGeometry(.12, 12, 8), mat('#fff'), [.62, .15, s * .3])); fish.add(mesh(new THREE.SphereGeometry(.07, 10, 8), mat('#111'), [.66, .16, s * .37])); }
  const bub = new THREE.Group(); root.add(bub); const bm = glass('#ffffff', .5); for (let k = 0; k < 8; k++) bub.add(mesh(new THREE.SphereGeometry(.05 + (k % 3) * .02, 10, 8), bm, [0, k * .3, 0]));
  const plant = new THREE.Group(); plant.position.set(-1.2, -1.6, -.6); root.add(plant); for (let k = 0; k < 7; k++) plant.add(tube([[0, 0, 0], [Math.sin(k) * .2, .8, Math.cos(k) * .15], [Math.sin(k) * .1, 1.6 + (k % 3) * .3, 0]], .04, mat('#3aa04a'), 16, 6));
  const info = txt('', .26, '#14456a'); info.position.set(0, 2.9, 0); root.add(info);
  const finsAll = [tail, dorsal, side, bottom];
  function apply() { glow(finsAll, sel === 1); glow([gill], sel === 2, '#ff5a5a'); glow([scales], sel === 3); bub.visible = sel === 0 || sel === 2; setTxt(info, ['السمكةُ تعيشُ في الماء', 'الزعانفُ والذيلُ تساعدُها على السباحة', 'الخياشيمُ تساعدُها على التنفّسِ في الماء', 'القشورُ تغطّي جسمَها'][sel]); }
  apply();
  const parts = [
    { id: 'fins', name: 'الزعانف والذيل', info: 'للأسماكِ زعانفُ وذيلٌ تساعدُها على السباحةِ في الماء.', objs: finsAll.flatMap(f => f.isMesh ? [f] : f.children), at: anchor(fish, [0, 1.1, 0]) },
    { id: 'gills', name: 'الخياشيم', info: 'الخياشيمُ تساعدُ الأسماكَ على التنفّسِ في الماء.', objs: [gill, gillIn], at: anchor(fish, [.5, .35, .4]) },
    { id: 'scales', name: 'القشور', info: 'الأسماكُ حيواناتٌ تعيشُ في الماء، ويغطّي أجسامَها قشور.', objs: [body, ...scales.children], at: anchor(fish, [-.2, .3, .45]) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; if (swim) { fish.position.set(Math.sin(t * .5) * .9, .3 + Math.sin(t * 1.3) * .2, Math.cos(t * .5) * .5); fish.rotation.y = Math.cos(t * .5) > 0 ? 0 : 0; fish.rotation.y = -Math.atan2(Math.cos(t * .5) * .45, -Math.sin(t * .5) * .25) * 0 + Math.sin(t * .5) * -.4; }
      tail.rotation.y = Math.sin(t * 8) * .45; side.rotation.y = Math.sin(t * 6) * .4;
      bub.position.copy(fish.position).add(V(.8, .2, .3)); bub.children.forEach((b, k) => { b.position.y = ((t * .8 + k * .3) % 2.4); b.position.x = Math.sin(t * 3 + k) * .05; });
      plant.children.forEach((p, k) => p.rotation.z = Math.sin(t * 1.5 + k) * .08);
    },
    cam: { pos: [0, 1.4, 6.4], target: [0, .3, 0] }, inpage: { pos: [0, 1.4, 6.6], target: [0, .3, 0] },
    controls: [
      { type: 'seg', label: 'أبرزْ', options: ['الكل', 'الزعانف', 'الخياشيم', 'القشور'], value: 0, on: k => { sel = k; apply(); } },
      { type: 'button', label: '⏸️ أوقفْ السمكة', toggle: true, on: v => { swim = !v; if (v) { fish.position.set(0, .3, 0); fish.rotation.y = 0; } } }
    ],
    quiz: [{ q: 'المس الجزءَ الذي يساعدُ السمكةَ على التنفّس.', a: 'gills' }, { q: 'المس الأجزاءَ التي تساعدُ السمكةَ على السباحة.', a: 'fins' }, { q: 'المس ما يغطّي جسمَ السمكة.', a: 'scales' }]
  };
}

/* ═════════ ٣) أسنان آكلات الأعشاب وآكلات اللحوم (ص ٦١–٦٣) ═════════ */
export function teethModel(api) {
  const root = new THREE.Group(); let t = 0, chew = true, sel = 0;
  const boneM = mat('#f2ead6', { roughness: .55 });
  function jaw(x, kind) {
    const g = new THREE.Group(); g.position.x = x; g.rotation.x = .45; root.add(g);
    const upper = new THREE.Group(), lower = new THREE.Group(); g.add(upper); g.add(lower);
    const gumM = tissue('#e07a8a', { kind: 'pore', bumpScale: .8 }), bM = tissue('#efe4c8', { kind: 'pore', bumpScale: .6, clearcoat: .2 });
    const toothM = new THREE.MeshPhysicalMaterial({ color: '#fbf6e8', roughness: .25, clearcoat: 1, clearcoatRoughness: .2, sheen: .3 });
    const A = u => V(u * .85, 0, .55 * (1 - u * u) - .25), arch = Array.from({ length: 21 }, (_, i) => A(-1 + i / 10));
    for (const [grp, s] of [[upper, -1], [lower, 1]]) { grp.add(vessel(arch.map(p => [p.x, s * -.3, p.z]), .13, .13, gumM, 60, 12, .02)); grp.add(vessel(arch.map(p => [p.x * 1.08, s * -.5, p.z * 1.05 - .03]), .17, .17, bM, 60, 12, .03)); }
    const T = [];
    const place = (m, u, grp, s) => { const p = A(u), tg = A(Math.min(1, u + .01)).sub(A(Math.max(-1, u - .01))).normalize(); m.position.set(p.x, s * -.2, p.z); m.rotation.y = Math.atan2(-tg.z, tg.x); if (s < 0) m.rotation.z += Math.PI; grp.add(m); T.push(m); };
    for (const [grp, s] of [[upper, -1], [lower, 1]]) {
      if (kind === 'herb') {
        for (let i = 0; i < 6; i++) { const u = (i - 2.5) * .085; const inc = mesh(organGeo(1, v => { v.x *= .045; v.z *= .03; v.y *= .14; v.y += .1; if (v.y > .18) v.x *= 1.3; }), toothM); place(inc, u, grp, s); }
        for (const side of [-1, 1]) for (let i = 0; i < 6; i++) { const u = side * (.52 + i * .085); const mo = new THREE.Group(); mo.add(mesh(new THREE.BoxGeometry(.13, .2, .16), toothM, [0, .1, 0])); for (let r = 0; r < 3; r++) mo.add(mesh(new THREE.TorusGeometry(.035, .008, 6, 16), mat('#c9bd9a'), [(r - 1) * .035, .2, 0], [Math.PI / 2, 0, 0], [1, 1.6, 1])); place(mo, u, grp, s); }
      } else {
        for (let i = 0; i < 6; i++) { const u = (i - 2.5) * .07; place(mesh(new THREE.ConeGeometry(.03, .12, 10), toothM, [0, .06, 0]), u, grp, s); }
        for (const side of [-1, 1]) { const can = new THREE.Group(); can.add(vessel([[0, 0, 0], [0, .22, .02], [0, .42, -.04]], .065, .008, toothM, 16, 12, 0)); place(can, side * .3, grp, s);
          for (let i = 0; i < 4; i++) { const u = side * (.5 + i * .13), b = mesh(new THREE.ConeGeometry(.08, .22 - i * .02, 4), toothM, [0, .11, 0], [0, Math.PI / 4, 0], [1.4, 1, .5]); place(b, u, grp, s); } }
      }
    }
    return { g, upper, lower, T };
  }
  const H = jaw(1.6, 'herb'), C = jaw(-1.6, 'carn');
  const fH = node(root, '🌿', [1.6, -1.3, .6], .7, null), fC = node(root, '🍖', [-1.6, -1.3, .6], .7, null);
  const aH = node(root, '🐴', [1.6, 1.5, 0], .9, 'rgba(255,255,255,.9)'), aC = node(root, '🐯', [-1.6, 1.5, 0], .9, 'rgba(255,255,255,.9)');
  const lH = txt('آكلاتُ الأعشاب: أسنانٌ مسطّحة', .24, '#1a6a2a'), lC = txt('آكلاتُ اللحوم: أسنانٌ حادّة', .24, '#a02020'); lH.position.set(1.6, 2.3, 0); lC.position.set(-1.6, 2.3, 0); root.add(lH); root.add(lC);
  const claws = new THREE.Group(); claws.position.set(-1.6, -1.2, -.6); root.add(claws); for (let k = 0; k < 4; k++) { const c = mesh(new THREE.ConeGeometry(.06, .4, 8), mat('#444'), [(k - 1.5) * .18, 0, 0], [0, 0, Math.PI * .9]); claws.add(c); }
  function apply() { glow(H.T, sel === 1, '#7aff7a'); glow(C.T, sel === 2, '#ff6a6a'); glow([claws], sel === 3, '#ff6a6a'); }
  apply();
  const parts = [
    { id: 'flat', name: 'الأسنانُ المسطّحة', info: 'آكلاتُ الأعشابِ (مثلُ الحصانِ والأرنب) لها أسنانٌ مسطّحةٌ تساعدُها على مضغِ النباتاتِ وطحنِها.', objs: H.T, at: anchor(H.g, [0, .8, .3]) },
    { id: 'sharp', name: 'الأسنانُ الحادّة', info: 'آكلاتُ اللحومِ (مثلُ النمرِ والأسد) لها أسنانٌ حادّةٌ تساعدُها على تقطيعِ اللحمِ وتمزيقِه.', objs: C.T, at: anchor(C.g, [0, .9, .3]) },
    { id: 'claws', name: 'المخالبُ الحادّة', info: 'بعضُ آكلاتِ اللحومِ لها مخالبُ حادّةٌ تساعدُها على تناولِ طعامِها.', objs: claws.children, at: anchor(claws, [0, .4, 0]) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt; const o = chew ? Math.abs(Math.sin(t * 2.5)) * .35 : .2;
      H.upper.position.y = o * .5; H.lower.position.y = -o * .5; H.lower.position.x = chew ? Math.sin(t * 5) * .08 : 0;
      C.upper.position.y = o * .6; C.lower.position.y = -o * .6;
      fH.g.rotation.z = Math.sin(t * 2) * .1; fC.g.rotation.z = Math.sin(t * 2 + 1) * .1;
    },
    cam: { pos: [0, 1.2, 6.4], target: [0, .3, 0] }, inpage: { pos: [0, 1.2, 6.6], target: [0, .3, 0] },
    controls: [
      { type: 'seg', label: 'أبرزْ', options: ['الكل', 'مسطّحة', 'حادّة', 'المخالب'], value: 0, on: k => { sel = k; apply(); if (k) api.toast(parts[k - 1].info); } },
      { type: 'button', label: '⏸️ أوقفْ المضغ', toggle: true, on: v => { chew = !v; } }
    ],
    quiz: [{ q: 'المس أسنانَ الحيوانِ الذي يأكلُ الأعشاب.', a: 'flat' }, { q: 'المس الأسنانَ التي تقطّعُ اللحم.', a: 'sharp' }]
  };
}

/* ═════════ ٤) الموارد الطبيعية (ص ٩٠–٩٣) ═════════ */
export function resourcesModel(api) {
  const root = new THREE.Group(); let t = 0, mode = 0;
  root.add(disk(4.3, '#a8d47a', '#8cc060'));
  const R = [
    { id: 'tree', n: 'الأشجار', live: 1, use: '🪑', u: 'الخشب: الكراسي والبيوت', p: [-2.6, 0, -1.4] },
    { id: 'sheep', n: 'الأغنام', live: 1, use: '🧶', u: 'الصوف: الملابس', p: [-1, 0, 1.3] },
    { id: 'palm', n: 'النخيل', live: 1, use: '🌴', u: 'التمر: الغذاء', p: [-3, 0, .7] },
    { id: 'rock', n: 'الصخور', live: 0, use: '🧱', u: 'بناء الجدران ورصف الطرق', p: [2.4, 0, -1.3] },
    { id: 'soil', n: 'التربة', live: 0, use: '☕', u: 'الطين: الأكواب والأطباق', p: [1.2, 0, 1.4] },
    { id: 'water', n: 'الماء', live: 0, use: '🚰', u: 'الشرب والوضوء', p: [2.9, 0, .6] },
    { id: 'air', n: 'الهواء', live: 0, use: '🫁', u: 'التنفّس', p: [0, 1.6, -1.6] }
  ];
  const S = R.map(r => {
    const g = new THREE.Group(); g.position.set(...r.p); root.add(g); let obj;
    if (r.id === 'tree') { obj = tree(1.3, '#3f8f32'); obj.position.y = -.45; g.add(obj); }
    else if (r.id === 'palm') { obj = new THREE.Group(); obj.position.y = -.45; obj.add(mesh(new THREE.CylinderGeometry(.08, .12, 1.6, 8), mat('#8a6a3a'), [0, .8, 0])); for (let k = 0; k < 7; k++) { const l = mesh(new THREE.SphereGeometry(.4, 10, 6), mat('#3a8a2a', { side: THREE.DoubleSide })); l.scale.set(1.4, .08, .35); l.position.set(Math.cos(k / 7 * TAU) * .45, 1.55, Math.sin(k / 7 * TAU) * .45); l.rotation.set(0, -k / 7 * TAU, -.4); obj.add(l); } g.add(obj); }
    else if (r.id === 'sheep') { obj = node(g, '🐑', [0, 0, 0], .9, null).g; }
    else if (r.id === 'rock') { obj = new THREE.Group(); for (let k = 0; k < 4; k++) obj.add(mesh(new THREE.DodecahedronGeometry(.32 + k * .05, 0), mat('#b8a888', { flatShading: true }), [(k % 2) * .5 - .25, -.25 + Math.floor(k / 2) * .4, 0])); g.add(obj); }
    else if (r.id === 'soil') { obj = mesh(new THREE.SphereGeometry(.6, 24, 12, 0, TAU, 0, Math.PI / 2), mat('#fff', { map: noiseTexture('#8a5a32', '#6a4020', 1200) }), [0, -.45, 0]); obj.scale.y = .5; g.add(obj); }
    else if (r.id === 'water') { obj = mesh(new THREE.CylinderGeometry(.75, .75, .06, 32), mat('#4aa3e8', { roughness: .1, transparent: true, opacity: .9 }), [0, -.42, 0]); g.add(obj); }
    else { obj = cloud(.8); g.add(obj); }
    const u = node(g, r.use, [0, 1.6, 0], .55, 'rgba(255,255,255,.95)'); u.g.visible = false;
    const l = txt(r.n, .26, r.live ? '#1a6a1a' : '#5a4a2a'); l.position.set(0, r.id === 'air' ? .7 : 1.05, 0); g.add(l);
    const pick = new THREE.Mesh(new THREE.SphereGeometry(.7, 10, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })); pick.position.y = .2; g.add(pick);
    return { r, g, u, pick, base: r.p[1] };
  });
  const info = txt('', .28, '#333'); info.position.set(0, 3, 0); root.add(info);
  function apply() {
    S.forEach(s => { const on = mode === 0 || mode === 3 || (mode === 1 && s.r.live) || (mode === 2 && !s.r.live); s.g.scale.setScalar(on ? 1 : .55); s.u.g.visible = mode === 3; });
    setTxt(info, ['المواردُ الطبيعيّة: أشياءُ نحصلُ عليها من الأرضِ ونستخدمُها', 'مواردُ حيّة: الحيواناتُ والنباتات', 'مواردُ غيرُ حيّة: الصخورُ والتربةُ والماءُ والهواء', 'كيف نستخدمُ كلَّ مورد؟'][mode]);
  }
  apply();
  return {
    root, parts: S.map(s => ({ id: s.r.id, name: s.r.n + (s.r.live ? ' (موردٌ حيّ)' : ' (موردٌ غيرُ حيّ)'), info: 'نستخدمُه في: ' + s.r.u + '.', objs: [s.pick], at: anchor(s.g, [0, 1.3, 0]) })),
    update(dt) { t += dt; S.forEach((s, i) => { if (s.r.id === 'air') s.g.position.x = Math.sin(t * .4) * .8; if (s.u.g.visible) s.u.g.position.y = 1.6 + Math.sin(t * 2 + i) * .06; }); },
    cam: { pos: [0, 4, 7.2], target: [0, .3, 0] }, inpage: { pos: [0, 4, 7.4], target: [0, .3, 0] },
    controls: [{ type: 'seg', label: 'أظهرْ', options: ['الكل', 'الموارد الحيّة', 'غير الحيّة', 'الاستخدامات'], value: 0, on: k => { mode = k; apply(); } }],
    quiz: [{ q: 'المس موردًا نصنعُ من صوفِه الملابس.', a: 'sheep' }, { q: 'المس موردًا نصنعُ منه الأكوابَ الطينيّة.', a: 'soil' }, { q: 'المس موردًا غيرَ حيٍّ نبني به الجدران.', a: 'rock' }]
  };
}

/* ═════════ ٥) التلوّث ونظافة الأرض (ص ٩٦–٩٩) ═════════ */
export function pollutionModel(api) {
  const root = new THREE.Group(); let t = 0, dirty = false, cleaning = 0;
  root.add(disk(4.3, '#9ccc6a', '#80b04e'));
  const lake = mesh(new THREE.CylinderGeometry(1.8, 1.8, .06, 48), mat('#3a9ae0', { roughness: .1, transparent: true, opacity: .92 }), [.8, -.42, .6]); lake.scale.z = .7; root.add(lake);
  const fac = new THREE.Group(); fac.position.set(-2.4, -.45, -1.4); root.add(fac);
  fac.add(mesh(new THREE.BoxGeometry(1.4, .9, .9), mat('#9aa0a8'), [0, .45, 0])); fac.add(mesh(new THREE.BoxGeometry(1.45, .1, .95), mat('#6a7078'), [0, .92, 0]));
  const chim = mesh(new THREE.CylinderGeometry(.14, .17, 1.4, 14), mat('#b85a3a'), [.4, 1.5, 0]); fac.add(chim);
  const smoke = new THREE.Group(); fac.add(smoke); const smM = new THREE.MeshStandardMaterial({ color: '#555', transparent: true, opacity: .6, depthWrite: false });
  for (let k = 0; k < 12; k++) smoke.add(mesh(new THREE.SphereGeometry(.25, 12, 8), smM, [.4, 2.3 + k * .25, 0]));
  const trash = new THREE.Group(); root.add(trash);
  const TR = [['🥤', .2, .5], ['🛍️', 1.3, .9], ['🍾', .9, .1], ['🧴', 1.8, .6], ['📦', -.4, 1.4], ['🥫', -1, .2]];
  const T = TR.map(([e, x, z]) => node(trash, e, [x, -.2, z], .45, null));
  const fishN = [node(root, '🐟', [.5, -.3, .6], .5, null), node(root, '🐟', [1.4, -.3, .3], .45, null)];
  const bird = node(root, '🦢', [2.4, -.15, .9], .7, null);
  const kid = node(root, '🧒', [-1.2, .1, 1.8], .8, null); const bin = node(root, '🗑️', [-2, -.05, 1.6], .6, null); kid.g.visible = bin.g.visible = false;
  const tree1 = tree(1.2, '#3f8f32'); tree1.position.set(2.8, -.45, -1.4); root.add(tree1);
  const haze = new THREE.Group(); root.add(haze); const hzM = new THREE.MeshBasicMaterial({ color: '#7a7a6a', transparent: true, opacity: .22, depthWrite: false }); for (let k = 0; k < 6; k++) haze.add(mesh(new THREE.SphereGeometry(.9, 12, 8), hzM, [-2.5 + k, 2.2 + (k % 2) * .3, -1.6], 0, [1.6, .5, 1]));
  const sky = { material: { set opacity(v) { haze.visible = v > 0; } } };
  const info = txt('', .28, '#333'); info.position.set(0, 3.4, 0); root.add(info);
  function apply() {
    trash.visible = dirty; smoke.visible = dirty; sky.material.opacity = dirty ? .3 : 0;
    lake.material.color.set(dirty ? '#5a7a5a' : '#3a9ae0'); kid.g.visible = bin.g.visible = false; cleaning = 0;
    fishN.forEach(f => f.g.scale.setScalar(1)); bird.g.scale.setScalar(1);
    setTxt(info, dirty ? 'التلوّث: أشياءُ ضارّةٌ في اليابسةِ والماءِ والهواء' : 'الماءُ والهواءُ النظيفانِ ضروريّانِ لحياةِ المخلوقات');
  }
  apply();
  const parts = [
    { id: 'smoke', name: 'دخانُ المصانع', info: 'دخانُ المصانعِ يلوّثُ الهواء. التلوّثُ يسبّبُ المرضَ للإنسانِ وللمخلوقاتِ الحيّةِ الأخرى.', objs: [chim, ...smoke.children], at: anchor(fac, [.4, 2.4, 0]) },
    { id: 'trash', name: 'النفايات', info: 'عندما يلوّثُ الناسُ الماءَ واليابسةَ بالنفاياتِ فإنّ ذلك يضرُّ بالحيوانات.', objs: T.map(n => n.p), at: anchor(root, [.8, .5, .6]) },
    { id: 'lake', name: 'الماء', info: 'الماءُ ضروريٌّ لحياةِ جميعِ المخلوقاتِ الحيّة؛ لذا يجبُ أن نحافظَ على نظافتِه.', objs: [lake], at: anchor(root, [1.4, -.2, 1.2]) },
    { id: 'animals', name: 'الحيوانات', info: 'تمرضُ الحيواناتُ إذا عاشتْ في ماءٍ أو هواءٍ ملوّث.', objs: [...fishN.map(f => f.p), bird.p], at: anchor(bird.g, [0, .5, 0]) }
  ];
  return {
    root, parts,
    update(dt) {
      t += dt;
      if (smoke.visible) smoke.children.forEach((s, k) => { const y = ((t * .6 + k * .25) % 3); s.position.set(.4 + y * .5, 2.2 + y, Math.sin(k) * .2); s.scale.setScalar(.6 + y * .5); });
      fishN.forEach((f, k) => { f.g.position.x = .9 + Math.sin(t * (dirty ? .3 : .9) + k * 2) * .9; f.g.rotation.z = dirty ? .5 : 0; });
      bird.g.position.y = -.15 + Math.sin(t * 1.5) * .04;
      if (cleaning > 0) { cleaning += dt; T.forEach((n, k) => { const p = Math.min(1, Math.max(0, (cleaning - k * .5) / .8)); n.g.position.lerp(V(-2, -.05, 1.6), p * .15); n.g.scale.setScalar(1 - p); }); kid.g.position.x = -1.2 + Math.sin(t * 2) * .5; if (cleaning > 4.5) { dirty = false; trash.visible = false; lake.material.color.set('#3a9ae0'); cleaning = -1; setTxt(info, 'أحسنت! نظّفْنا المكان؛ نرمي النفاياتِ في سلّةِ المهملات'); } }
    },
    cam: { pos: [0, 3.6, 7.2], target: [0, .6, 0] }, inpage: { pos: [0, 3.6, 7.4], target: [0, .6, 0] },
    controls: [
      { type: 'seg', label: 'المكان', options: ['نظيف', 'ملوّث'], value: 0, on: k => { dirty = !!k; T.forEach((n, i) => { n.g.position.set(TR[i][1], -.2, TR[i][2]); n.g.scale.setScalar(1); }); apply(); } },
      { type: 'button', label: '🧹 نظّفْ المكان', on: () => { if (!dirty) { api.toast('المكانُ نظيف! اختر «ملوّث» أوّلًا.'); return; } kid.g.visible = bin.g.visible = true; smoke.visible = false; sky.material.opacity = 0; cleaning = .01; api.toast('نحافظُ على نظافةِ الأرض: نرمي النفاياتِ في سلّةِ المهملات.'); } }
    ],
    quiz: [{ q: 'اختر «ملوّث»، ثم المس ما يلوّثُ الهواء.', a: 'smoke' }, { q: 'المس الماءَ الذي يجبُ أن نحافظَ على نظافتِه.', a: 'lake' }]
  };
}
