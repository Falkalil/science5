// مجسّماتٌ خاصّةٌ بكتاب العلوم للصف الرابع — مطابقةٌ لأشكالِ الكتاب
import { THREE, mesh, anchor, V, tissue, vessel, organGeo, fbm3, twigs, mergeGeos, reseed, srnd, tissueBump, ArrowFlow, badge, creature, noise3 } from './kit.js';
import { txt } from './models6a.js';

const RED = '#c0121f', BLUE = '#2a45a8';
const vcMat = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ vertexColors: true, roughness: .38, clearcoat: .7, clearcoatRoughness: .25, sheen: .4, bumpMap: tissueBump('vein', 3), bumpScale: .8 }, o));
function paint(geo, fn) { const P = geo.attributes.position, c = new Float32Array(P.count * 3), v = new THREE.Vector3(), k = new THREE.Color(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); k.copy(fn(v)); c.set([k.r, k.g, k.b], i * 3); } geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo; }
const C = c => new THREE.Color(c);
function label(parent, str, pos, color, s = .2) { const t = txt(str, s, color, 'rgba(255,255,255,.85)'); t.position.set(...pos); parent.add(t); return t; }
function plate(parent, x, w, color) { const s = new THREE.Shape(), h = 3.3, r = .25, x0 = -w / 2, y0 = -.6; s.moveTo(x0 + r, y0); s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r); s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h); s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .08, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 3 }), new THREE.MeshPhysicalMaterial({ color, roughness: .8, sheen: .3 })); m.position.set(x, 0, -.9); m.receiveShadow = true; parent.add(m); return m; }

/* ═════════ الجهازُ الدورانيُّ والتنفسيّ: الأرنبُ والسمكة (ص ٨١) ═════════ */
export function compareHeartModel(api) {
  const root = new THREE.Group(); let beat = 0, rate = 1; reseed(21);
  const red = tissue(RED, { kind: 'pore', bumpScale: .4 }), blue = tissue(BLUE, { kind: 'pore', bumpScale: .4 });
  plate(root, -1.95, 3.6, '#f3e9a0'); plate(root, 1.95, 3.6, '#cfe6b2');
  label(root, 'السَّمكةُ', [-1.95, 2.95, -.7], '#b8560f', .3); label(root, 'الأرنبُ', [1.95, 2.95, -.7], '#2f7a2a', .3);
  /* ── الأرنب ── */
  const R = new THREE.Group(); R.position.set(1.95, 0, 0); root.add(R);
  const rab = creature('🐇', 1.15); rab.position.set(1.15, 2.1, -.55); rab.rotation.y = -1.9; R.add(rab);
  const rHeart = new THREE.Group(); rHeart.position.set(-.05, 1.05, .25); rHeart.rotation.set(.15, 0, .25); R.add(rHeart);
  const hShape = v => { const y = v.y; const s = y < 0 ? 1 + y * .55 : 1 - y * y * .08; v.x *= s * 1.05; v.z *= s * .9; v.y *= 1.25; v.multiplyScalar(1 + fbm3(v.x * 3 + 1, v.y * 3, v.z * 3) * .05); return v; };
  const hg = paint(organGeo(.32, hShape, 80, 60), v => C('#3646a0').lerp(C('#b3202a'), THREE.MathUtils.smoothstep(v.x, -.06, .06)));
  rHeart.add(new THREE.Mesh(hg, vcMat())); rHeart.add(mesh(new THREE.SphereGeometry(.15, 32, 24), tissue('#3a3f9a'), [-.24, .32, .02], null, [1, .8, .9]), mesh(new THREE.SphereGeometry(.15, 32, 24), tissue('#a51d2a'), [.22, .32, .02], null, [1, .8, .9]));
  const sept = mesh(new THREE.BoxGeometry(.015, .5, .5), tissue('#e6c7a0'), [0, .02, .02]); rHeart.add(sept); sept.visible = false;
  const lungM = tissue('#e9918a', { kind: 'vein', transparent: true, opacity: .82, bumpScale: 1.4, roughness: .5 }); const rl = [];
  for (const s of [-1, 1]) { const g = organGeo(.4, v => { const t = v.y + .4; v.x *= (.55 + t * .25) * (v.x * s < 0 ? .7 : 1.1); v.z *= .75; v.y *= 2 - (v.y > 0 ? v.y * .9 : 0); v.multiplyScalar(1 + fbm3(v.x * 5 + s, v.y * 5, v.z * 5) * .07); }, 64, 48); const m = new THREE.Mesh(g, lungM); m.position.set(.62 * s, 1.25, -.05); R.add(m); rl.push(m); }
  const trM = tissue('#ecd6c6', { kind: 'pore' }); const tr = vessel([[0, 2.35, -.2], [0, 1.9, -.2], [0, 1.72, -.2]], .05, .045, trM, 16, 10); R.add(tr); for (const s of [-1, 1]) R.add(vessel([[0, 1.72, -.2], [.25 * s, 1.6, -.18], [.5 * s, 1.45, -.12]], .038, .025, trM, 14, 8));
  const rv = []; const add = (pts, r0, r1, m) => { const o = vessel(pts, r0, r1, m); R.add(o); rv.push(o); return o.userData.curve; };
  const cBodyIn1 = add([[-.32, 2.4, .25], [-.32, 1.85, .28], [-.25, 1.45, .28]], .065, .06, blue), cBodyIn2 = add([[-.3, .1, .3], [-.3, .5, .3], [-.25, .8, .3]], .065, .06, blue);
  const cToLung = [1, -1].map(s => add([[-.05, 1.4, .42], [-.02, 1.72, .42], [.2 * s, 1.75, .3], [.45 * s, 1.6, .15]], .05, .035, blue));
  const cFromLung = [1, -1].map(s => add([[.52 * s, 1.15, .1], [.3 * s, 1.15, .25], [.15, 1.32, .3]], .035, .045, red));
  const cAorta = add([[.08, 1.4, .3], [.1, 1.95, .3], [.32, 2.1, .2], [.45, 1.9, .05], [.4, 1.2, -.02], [.35, .2, 0]], .075, .065, red); const cUp = add([[.22, 2.04, .26], [.3, 2.45, .25]], .04, .035, red);
  const rA1 = new ArrowFlow(R, [cBodyIn1, cBodyIn2, ...cToLung].map(c => c.getPoints(30).map(p => [p.x, p.y, p.z + .1])), '#36c24a', .8);
  const rA2 = new ArrowFlow(R, [...cFromLung, cAorta, cUp].map(c => c.getPoints(30).map(p => [p.x, p.y, p.z + .1])), '#36c24a', .8);
  const rLbl = [label(R, 'منَ الجسمِ', [-.75, 2.35, .3], BLUE), label(R, 'منَ الجسمِ', [-.75, .15, .3], BLUE), label(R, 'إلى الرِّئةِ', [.05, 2.05, .55], BLUE), label(R, 'منَ الرِّئةِ', [.95, 1.0, .4], RED), label(R, 'إلى الجسمِ', [.85, 2.5, .3], RED), label(R, 'إلى الجسمِ', [.85, .2, .3], RED)];
  /* ── السمكة ── */
  const F = new THREE.Group(); F.position.set(-1.95, 0, 0); root.add(F);
  const fish = creature('🐠', 1.4); fish.position.set(.35, 2.25, -.5); fish.rotation.y = .25; F.add(fish);
  const gills = new THREE.Group(); gills.position.set(-.85, .95, .1); F.add(gills); const gillM = tissue('#c2454a', { kind: 'vein', bumpScale: 1.2 }), filM = tissue('#d9686a', { kind: 'pore' });
  const fil = [];
  for (let i = 0; i < 4; i++) { const z = (i - 1.5) * .13, pts = []; for (let k = 0; k <= 10; k++) { const a = -1.2 + k / 10 * 2.2; pts.push(V(Math.cos(a) * .18 + i * .03, Math.sin(a) * .62, z)); } gills.add(vessel(pts, .03, .03, gillM, 40, 8, .01));
    for (let k = 1; k < 22; k++) { const p = new THREE.CatmullRomCurve3(pts).getPointAt(k / 22), d = V(p.x - .4, 0, 0).normalize(); fil.push(new THREE.CylinderGeometry(.012, .006, .26, 5).rotateZ(Math.PI / 2).translate(p.x - .13, p.y, p.z)); } }
  gills.add(new THREE.Mesh(mergeGeos(fil), filM));
  const fHeart = new THREE.Group(); fHeart.position.set(.55, .1, .25); F.add(fHeart);
  const ven = mesh(organGeo(.2, v => { v.x *= 1.25; v.y *= .95; v.multiplyScalar(1 + fbm3(v.x * 4, v.y * 4, v.z * 4) * .06); if (v.x < 0) v.y *= 1 + v.x; }), tissue('#b8282a', { bumpScale: .9 })), atr = mesh(organGeo(.13, v => { v.multiplyScalar(1 + fbm3(v.x * 5, v.y * 5, v.z * 5) * .08); }), tissue('#8a2a4a'), [.2, .17, -.05]);
  fHeart.add(ven, atr);
  const fv = []; const addF = (pts, r0, r1, m) => { const o = vessel(pts, r0, r1, m); F.add(o); fv.push(o); return o.userData.curve; };
  const cFin = addF([[1.25, .55, .2], [.95, .45, .2], [.82, .3, .2]], .045, .05, blue), cHG = addF([[.33, .1, .25], [-.1, -.1, .2], [-.55, -.2, .15], [-.8, .2, .1]], .055, .045, blue), cGB = addF([[-.75, 1.55, .1], [-.3, 1.4, .15], [.3, 1.25, .2], [1.1, 1.3, .2]], .04, .045, red);
  const fA1 = new ArrowFlow(F, [cFin, cHG].map(c => c.getPoints(30).map(p => [p.x, p.y, p.z + .09])), '#36c24a', .8), fA2 = new ArrowFlow(F, [cGB.getPoints(30).map(p => [p.x, p.y, p.z + .09])], '#36c24a', .8);
  const fLbl = [label(F, 'منَ الجسمِ', [1.15, .78, .3], BLUE), label(F, 'إلى الخياشيمِ', [-.35, -.42, .3], BLUE), label(F, 'إلى الجسمِ', [.55, 1.5, .3], RED)];
  /* ── إثراء: عددُ الحجرات ── */
  const ex = new THREE.Group(); ex.visible = false; root.add(ex); label(ex, 'إثراء: ٤ حجرات — دورتان', [1.95, -.35, .5], '#6a2a8a', .17); label(ex, 'إثراء: حجرتان — دورةٌ واحدة', [-1.95, -.35, .5], '#6a2a8a', .17);
  const groups = { r1: [rA1.g, ...rLbl.slice(0, 3)], r2: [rA2.g, ...rLbl.slice(3)], f1: [fA1.g, ...fLbl.slice(0, 2)], f2: [fA2.g, fLbl[2]] };
  function show(keys) { for (const k in groups) groups[k].forEach(o => o.visible = !keys || keys.includes(k)); }
  const parts = [
    { id: 'rheart', name: 'القلب (الأرنب)', info: 'يضخُّ قلبُ الأرنبِ الدمَ إلى الرئتين ليأخذَ الأكسجين، ثم يضخُّه إلى الجسم. (إثراء: قلبُ الثدييّاتِ أربعُ حجراتٍ تفصلُ الدمَ المؤكسجَ عن غيرِ المؤكسج.)', objs: [rHeart], at: anchor(R, [-.05, .55, .5]) },
    { id: 'rlung', name: 'الرئة (الأرنب)', info: 'يتنفّسُ الأرنبُ بالرئتين: يدخلُ الأكسجينُ من الهواءِ إلى الدم، ويخرجُ ثاني أكسيدِ الكربون.', objs: rl, at: anchor(R, [-.85, 1.6, .2]) },
    { id: 'rvessels', name: 'الأوعية الدموية (الأرنب)', info: 'تحملُ الأوعيةُ الدمَ: الأزرقُ دمٌ غيرُ مؤكسجٍ عائدٌ من الجسم، والأحمرُ دمٌ مؤكسجٌ قادمٌ من الرئتين.', objs: rv, at: anchor(R, [.42, 1.6, .2]) },
    { id: 'fgills', name: 'الخياشيم (السمكة)', info: 'تتنفّسُ السمكةُ بالخياشيم: يمرُّ الماءُ عليها فيأخذُ الدمُ الأكسجينَ الذائبَ فيه. (إثراء: خيوطُ الخياشيمِ الرقيقةُ الكثيرةُ تزيدُ مساحةَ تبادلِ الغازات.)', objs: [gills], at: anchor(F, [-1.05, 1.35, .2]) },
    { id: 'fheart', name: 'القلب (السمكة)', info: 'يضخُّ قلبُ السمكةِ الدمَ القادمَ من الجسمِ إلى الخياشيم، ومنها يذهبُ إلى الجسمِ مباشرة. (إثراء: قلبُ السمكةِ حجرتان: أذينٌ وبطين.)', objs: [fHeart], at: anchor(F, [.55, -.2, .4]) },
    { id: 'fvessels', name: 'الأوعية الدموية (السمكة)', info: 'تنقلُ الدمَ بين القلبِ والخياشيمِ وأجزاءِ الجسم.', objs: fv, at: anchor(F, [-.1, 1.15, .3]) },
    { id: 'animals', name: 'الأرنب والسمكة', info: 'كلاهما من الفقاريّات، ولكلٍّ منهما قلبٌ وأوعيةٌ دمويّةٌ ودم. يختلفانِ في عضوِ التنفّس: رئتانِ للأرنب، وخياشيمُ للسمكة.', objs: [rab, fish], at: anchor(root, [0, 2.4, -.4]) }];
  const pose = { pos: [0, 1.25, 7.6], target: [0, 1.15, 0] };
  return {
    root, parts, pageBox: [-3.8, -.65, -.9, 3.8, 3.1, .7], cam: pose, inpage: pose,
    update(dt) { beat += dt * rate * 1.3; const ph = beat % 1, p = Math.exp(-Math.pow((ph - .1) / .06, 2)) * .07; rHeart.scale.setScalar(1 + p); fHeart.scale.setScalar(1 + p * .8); gills.rotation.y = Math.sin(beat * 1.2) * .05;
      [rA1, rA2, fA1, fA2].forEach(a => a.update(dt, .35 * rate)); },
    controls: [
      { type: 'steps', value: -1, steps: [
        { t: '١- الأرنب: منَ الجسمِ إلى الرئتين', d: 'يعودُ الدمُ غيرُ المؤكسجِ منَ الجسمِ إلى القلب، فيضخُّه القلبُ إلى الرئتين.' },
        { t: '٢- الأرنب: منَ الرئتينِ إلى الجسم', d: 'يأخذُ الدمُ الأكسجينَ في الرئتين، ثم يعودُ إلى القلبِ الذي يضخُّه إلى أجزاءِ الجسم.' },
        { t: '٣- السمكة: منَ الجسمِ إلى الخياشيم', d: 'يعودُ الدمُ منَ الجسمِ إلى القلب، فيضخُّه القلبُ إلى الخياشيم.' },
        { t: '٤- السمكة: منَ الخياشيمِ إلى الجسم', d: 'يأخذُ الدمُ الأكسجينَ منَ الماءِ في الخياشيم، ثم يتدفّقُ إلى أجزاءِ الجسم.' },
        { t: '٥- المقارنة', d: 'المشترك: القلبُ والأوعيةُ الدمويّةُ والدم. المختلف: الأرنبُ يتنفّسُ بالرئتين، والسمكةُ بالخياشيم.' }],
        on: i => { show([['r1'], ['r2'], ['f1'], ['f2'], null][i]); api.select && api.select(['rlung', 'rheart', 'fgills', 'fvessels', 'animals'][i]); } },
      { type: 'button', label: '▶ المسار كاملًا', on: () => { show(null); api.setStep && api.setStep(-1); } },
      { type: 'button', label: '💡 إثراء: حجرات القلب', toggle: true, on: v => { ex.visible = v; sept.visible = v; } },
      { type: 'slider', label: 'سرعة النبض', min: .5, max: 2, step: .1, value: 1, fmt: v => '×' + v.toFixed(1), on: v => { rate = v; } }],
    legend: [[BLUE, 'دم غير مؤكسج'], [RED, 'دم مؤكسج'], ['#36c24a', 'اتجاه جريان الدم']],
    quiz: [{ q: 'المس العضوَ الذي تتنفّسُ به السمكة.', a: 'fgills' }, { q: 'المس العضوَ الذي يتنفّسُ به الأرنب.', a: 'rlung' }, { q: 'المس قلبَ السمكة.', a: 'fheart' }]
  };
}

/* ═════════ الجهازُ الهيكليُّ والعضليّ: رجلُ الضفدع (ص ٧٨) ═════════ */
export function frogLegModel(api) {
  const root = new THREE.Group(); let t = .55, target = .55, jump = -1; reseed(5);
  const skinCol = v => { const n = noise3(v.x * 7, v.y * 7, v.z * 7); return n > .42 ? C('#3a2a14') : C('#6aa83a').lerp(C('#d8d890'), THREE.MathUtils.smoothstep(-v.y, .05, .3)); };
  const skinM = vcMat({ roughness: .25, clearcoat: 1, bumpMap: tissueBump('pore', 4), bumpScale: .5 });
  const boneM = tissue('#efe2bf', { kind: 'pore', bumpScale: .3, roughness: .5, clearcoat: .3 }), musM = () => tissue('#d42a24', { kind: 'vein', bumpScale: .9, roughness: .4 }), tenM = tissue('#f2ecd8', { kind: 'vein', bumpScale: .8, roughness: .3 });
  // ورقةُ زنبقِ الماء
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, .04, 64, 1, false, .25, Math.PI * 2 - .5), new THREE.MeshPhysicalMaterial({ color: '#4f9a3a', roughness: .35, clearcoat: .8, bumpMap: tissueBump('vein', 8), bumpScale: 2 })); pad.position.set(.2, -1.55, 0); pad.receiveShadow = true; root.add(pad);
  const water = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.MeshPhysicalMaterial({ color: '#8ec8d8', roughness: .1, transmission: .2, transparent: true, opacity: .55 })); water.rotation.x = -Math.PI / 2; water.position.y = -1.58; root.add(water);
  // الجسم
  const frog = new THREE.Group(); root.add(frog);
  const body = new THREE.Mesh(paint(organGeo(.5, v => { v.x *= 1.5; v.y *= .7; v.z *= .9; if (v.x > 0) { v.y *= 1 - v.x * .35; v.z *= 1 - v.x * .25; } v.multiplyScalar(1 + fbm3(v.x * 3, v.y * 3, v.z * 3) * .04); }, 72, 54), skinCol), skinM); frog.add(body);
  for (const s of [-1, 1]) { frog.add(mesh(new THREE.SphereGeometry(.11, 24, 18), tissue('#6aa83a', { kind: 'pore', bumpScale: .4 }), [.5, .28, s * .2])); const e = mesh(new THREE.SphereGeometry(.075, 20, 16), new THREE.MeshPhysicalMaterial({ color: '#d8a020', roughness: .05, clearcoat: 1 }), [.55, .32, s * .25]); frog.add(e); frog.add(mesh(new THREE.SphereGeometry(.04, 12, 10), new THREE.MeshPhysicalMaterial({ color: '#111', roughness: .05, clearcoat: 1 }), [.61, .33, s * .29])); }
  for (const s of [-1, 1]) { const arm = vessel([[.35, -.2, s * .3], [.55, -.55, s * .4], [.45, -.85, s * .42]], .07, .05, skinM.clone(), 20, 10); arm.geometry = paint(arm.geometry, () => C('#6aa83a')); frog.add(arm); }
  // الرجلُ الخلفية: سلسلةُ مفاصل (ورك ← ركبة ← كاحل)
  function leg(side, open) { const hip = new THREE.Group(); hip.position.set(-.65, -.05, side * .38); frog.add(hip); const knee = new THREE.Group(); knee.position.y = -.75; hip.add(knee); const ank = new THREE.Group(); ank.position.y = -.8; knee.add(ank);
    const L = { hip, knee, ank, bones: [], mus: [], ten: [], skin: [] };
    if (open) { L.bones.push(mesh(boneShape(.75, .05), boneM), mesh(boneShape(.8, .045), boneM), mesh(boneShape(.45, .03), boneM)); hip.add(L.bones[0]); knee.add(L.bones[1]); ank.add(L.bones[2]);
      for (let k = 0; k < 4; k++) { const toe = mesh(boneShape(.3, .015), boneM, [0, -.45, 0], [0, (k - 1.5) * .25, 0]); toe.rotation.z = (k - 1.5) * .05; ank.add(toe); toe.rotation.order = 'YXZ'; toe.rotation.x = (k - 1.5) * .35; L.bones.push(toe); }
      const joint = (g, y) => { const j = mesh(new THREE.SphereGeometry(.07, 20, 16), tissue('#f6efd8', { roughness: .25, clearcoat: 1 }), [0, y, 0]); g.add(j); return j; }; L.joints = [joint(knee, 0), joint(ank, 0), joint(hip, 0)];
      const mus = (g, len, r, x, y0) => { const m = new THREE.Mesh(organGeo(1, v => { v.y *= len / 2; const k = Math.pow(1 - Math.pow(Math.abs(v.y) / (len / 2), 2), .6); v.x *= r * Math.max(.12, k); v.z *= r * Math.max(.12, k) * .85; }, 40, 40), musM()); m.position.set(x, y0 - len / 2, 0); m.userData.rest = [1, 1]; g.add(m); return m; };
      L.mus.push(mus(hip, .64, .095, -.065, -.04), mus(hip, .6, .085, .07, -.07), mus(knee, .66, .085, -.06, -.04), mus(knee, .55, .055, .05, -.1));
      L.ten.push(vessel([[-.07, -.68, 0], [-.04, -.8, 0], [0, -.85, 0]], .02, .015, tenM, 10, 8)); knee.add(L.ten[0]); L.ten.push(vessel([[-.08, -.64, 0], [-.04, -.75, 0], [0, -.78, 0]], .02, .015, tenM, 10, 8)); hip.add(L.ten[1]);
      const sk = new THREE.MeshPhysicalMaterial({ color: '#8ac04a', roughness: .3, transparent: true, opacity: .16, depthWrite: false, clearcoat: 1 });
      L.skin.push(mesh(boneShape(.75, .17, 1.1), sk), mesh(boneShape(.8, .14, 1.1), sk)); hip.add(L.skin[0]); knee.add(L.skin[1]); L.skin.forEach(s => s.renderOrder = 3);
    } else { const sm = skinM.clone(); const seg = (g, len, r) => { const o = new THREE.Mesh(paint(boneShape(len, r, 1.1), v => C('#5f9a35')), sm); g.add(o); }; seg(hip, .75, .16); seg(knee, .8, .13); seg(ank, .45, .06); }
    const foot = new THREE.Mesh(paint(organGeo(1, v => { v.y = v.y * .3 - .3; v.x *= .05; v.z *= .22; v.z *= 1 + (-v.y - .3) * 1.5; v.y *= 1.4; }, 32, 24), () => C(open ? '#e0b860' : '#c8a850')), new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .35, clearcoat: .8, transparent: !!open, opacity: open ? .55 : 1 })); foot.position.y = -.42; ank.add(foot);
    return L; }
  function boneShape(len, r, ends = 1.6) { const P = []; for (let i = 0; i <= 18; i++) { const u = i / 18, k = Math.pow(Math.abs(u - .5) * 2, 5); P.push(new THREE.Vector2(Math.max(.002, r * (.85 + (ends - .85) * k) * Math.sin(Math.min(1, u * 12, (1 - u) * 12) * Math.PI / 2)), -u * len)); } return new THREE.LatheGeometry(P, 20); }
  const near = leg(1, true), far = leg(-1, false);
  // الأوضاع: t=0 مثنيّة (جاثمة) ← t=1 ممدودة (قفزة)
  function pose(v) { const e = v * v * (3 - 2 * v); for (const L of [near, far]) { L.hip.updateMatrix(); L.hip.rotation.z = THREE.MathUtils.lerp(1.15, -1.75, e); L.knee.rotation.z = THREE.MathUtils.lerp(-2.55, .25, e); const rz = THREE.MathUtils.lerp(.05, .55, e), fa = e < .62 ? 1.5 : THREE.MathUtils.lerp(1.5, -.4, (e - .62) / .38); L.ank.rotation.z = fa - rz - L.hip.rotation.z - L.knee.rotation.z; L.hip.updateMatrix(); L.knee.updateMatrix(); L.ank.updateMatrix(); }
    frog.rotation.z = THREE.MathUtils.lerp(.05, .55, e); frog.position.set(THREE.MathUtils.lerp(-.1, .45, e), 0, 0);
    // تبقى القدمُ على الورقةِ حتى تنطلقَ القفزة
    const tip = V(0, -.42, 0).applyMatrix4(near.ank.matrix).applyMatrix4(near.knee.matrix).applyMatrix4(near.hip.matrix).applyAxisAngle(V(0, 0, 1), frog.rotation.z); frog.position.y = -1.5 - tip.y + Math.max(0, e - .72) * 3.2;
    // العضلاتُ تعملُ أزواجًا: إحداهما تنقبضُ (تقصرُ وتنتفخ) والأخرى تنبسط
    const c = [e, 1 - e, e, 1 - e]; near.mus.forEach((m, i) => { const k = c[i]; m.scale.set(1 + k * .3, 1 - k * .12, 1 + k * .3); m.material.emissive.set(k > .55 ? '#5a0000' : '#000000'); m.material.emissiveIntensity = (k - .55) * 1.5; }); }
  pose(t);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.9, 32), new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: .15, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.52; root.add(shadow);
  const parts = [
    { id: 'bones', name: 'العظام', info: 'عظامُ الرجلِ جزءٌ منَ الهيكلِ العظميّ؛ تدعمُ الجسمَ وتعطيه شكلَه، وتتحرّكُ عندما تسحبُها العضلات.', objs: near.bones, at: anchor(near.knee, [.05, -.45, .2]) },
    { id: 'muscleA', name: 'العضلة (تنقبض)', info: 'تنقبضُ العضلةُ فتقصرُ وتسحبُ العظمَ المتّصلَ بها، فتنمدُّ الرجلُ ويقفزُ الضفدع. العضلاتُ تسحبُ ولا تدفع.', objs: [near.mus[0], near.mus[2]], at: anchor(near.hip, [-.25, -.35, .2]) },
    { id: 'muscleB', name: 'العضلة المقابلة (تنبسط)', info: 'تعملُ العضلاتُ أزواجًا: عندما تنقبضُ عضلةٌ تنبسطُ العضلةُ المقابلةُ لها، وعندما تنقبضُ الثانيةُ تنثني الرجلُ مرّةً أخرى.', objs: [near.mus[1], near.mus[3]], at: anchor(near.hip, [.3, -.3, .2]) },
    { id: 'joint', name: 'المفصل (إثراء)', info: 'إثراء: المفصلُ مكانُ التقاءِ عظمين، مثلُ الركبةِ والكاحلِ والورك؛ وهو الذي يسمحُ للرجلِ بالانثناءِ والامتداد.', objs: near.joints, at: anchor(near.knee, [0, .05, .2]) },
    { id: 'tendon', name: 'الوتر (إثراء)', info: 'إثراء: الأوتارُ أنسجةٌ قويّةٌ تربطُ العضلاتِ بالعظام، فتنقلُ قوّةَ انقباضِ العضلةِ إلى العظم.', objs: near.ten, at: anchor(near.knee, [-.15, -.78, .2]) },
    { id: 'frog', name: 'الضفدع', info: 'يستعملُ الضفدعُ عضلاتِ رجليه الخلفيّتينِ القويّتينِ ليقفز، وتعملُ العضلاتُ معَ الهيكلِ العظميِّ لتحريكِ الجسم.', objs: [body], at: anchor(frog, [.2, .45, .2]) }];
  const cam = { pos: [-.4, -.1, 6.2], target: [-.4, -.35, 0] };
  return {
    root, parts, pageBox: [-2.2, -1.6, -1, 1.6, 1.3, 1], cam, inpage: cam,
    update(dt) { if (jump >= 0) { jump += dt * .7; const ph = jump; t = ph < .35 ? .55 * (1 - ph / .35) : ph < .55 ? (ph - .35) / .2 : ph < 1 ? 1 - (ph - .55) / .45 * .45 : .55; if (ph >= 1) { jump = -1; t = .55; } target = t; } else t += (target - t) * Math.min(1, dt * 6); pose(t); shadow.scale.setScalar(1 - t * .3); },
    controls: [
      { type: 'steps', value: -1, steps: [
        { t: '١- الرجلُ مثنيّة', d: 'يجثمُ الضفدعُ وقد ثنى رجليه الخلفيّتين، وتكونُ العضلةُ المقابلةُ منقبضة.' },
        { t: '٢- العضلةُ تنقبض', d: 'تنقبضُ عضلاتُ الفخذِ والساقِ فتقصرُ وتسحبُ العظام، فتنمدُّ الرجلُ بقوّة.' },
        { t: '٣- القفزة', d: 'تدفعُ الرجلانِ الممدودتانِ الأرضَ فيقفزُ الضفدع؛ العضلاتُ تعملُ معَ الهيكلِ العظميّ.' }],
        on: i => { target = [0, .75, 1][i]; jump = -1; api.select && api.select(['muscleB', 'muscleA', 'bones'][i]); } },
      { type: 'button', label: '🐸 اقفز!', on: () => { jump = 0; } },
      { type: 'slider', label: 'ثني الرجل ↔ مدّها', min: 0, max: 1, step: .01, value: .55, fmt: v => v < .35 ? 'مثنيّة' : v > .75 ? 'ممدودة' : 'بينهما', on: v => { jump = -1; target = v; } },
      { type: 'button', label: '🟢 إظهار/إخفاء جلد الرجل', toggle: true, on: v => near.skin.forEach(s => { s.material.opacity = v ? .85 : .16; s.material.depthWrite = v; }) }],
    legend: [['#d42a24', 'عضلات'], ['#efe2bf', 'عظام'], ['#f2ecd8', 'أوتار (إثراء)']],
    quiz: [{ q: 'المس العظمَ في رجلِ الضفدع.', a: 'bones' }, { q: 'المس العضلةَ التي تنقبضُ لتمدَّ الرجل.', a: 'muscleA' }, { q: 'المس المفصلَ الذي تنثني عنده الرجل.', a: 'joint' }]
  };
}
