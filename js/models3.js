// مجسّمات الوحدة الثانية: دورة الماء، دورة الكربون، دورة النيتروجين، التعاقب الأولي
import { THREE, mat, glass, mesh, tube, curve, anchor, V, Flow, lerp, clamp, ease, terrain, strataTexture, proxy, smooth, fbm, tree, pine, cloud, arrowTube, house, deer, noiseTexture } from './kit.js';

/* ───────────── ص ١١٧: دورة الماء ───────────── */
export function waterModel(api) {
  const root = new THREE.Group();
  const W = 12, D = 7;
  const mountain = (x, z) => 3.6 * Math.exp(-((x + 4.3) ** 2 / 2.2 + (z + 1.2) ** 2 / 4)) + 2.2 * Math.exp(-((x + 2.8) ** 2 / 1.5 + (z + 2.4) ** 2 / 2));
  const h = (x, z) => { const base = 0.55 - smooth(1.2, 3.0, x + .3 * Math.sin(z)) * 1.6; return base + mountain(x, z) + (fbm(x * .9 + 3, z * .9) - .5) * .35 * (1 - smooth(1, 2.6, x)); };
  const col = (x, z, y) => y > 2.7 ? '#f4f6f8' : y > 1.5 ? '#8a7a6a' : y < 0.05 ? '#d8c690' : (x > -2.2 && x < 1.6) ? '#2f6a35' : '#5f9a45';
  const st = strataTexture([['#7a5636', 2], ['#8d6a45', 2], ['#9a7a52', 2], ['#6e4b2e', 1]]);
  const land = terrain({ w: W, d: D, nx: 140, nz: 80, h, color: col, bottom: -2.2, top: 4, sideTex: st }); root.add(land);
  // البحر
  const sea = mesh(new THREE.BoxGeometry(W / 2 - 1.6, 2.2, D), glass('#2f86c9', .62, { depthWrite: false }), [W / 4 + .8, -1.1, 0]); root.add(sea);
  const seaTop = mesh(new THREE.PlaneGeometry(W / 2 - 1.6, D), mat('#2d7fc1', { transparent: true, opacity: .85, roughness: .15, metalness: .1 }), [W / 4 + .8, 0.001, 0], [-Math.PI / 2, 0, 0]); root.add(seaTop);
  // الأشجار
  const forest = new THREE.Group(); root.add(forest);
  for (let i = 0; i < 70; i++) { const x = -2.2 + Math.random() * 3.6, z = -3.2 + Math.random() * 6.4, y = h(x, z); if (y < .15 || y > 1.4) continue; const t = pine(.55 + Math.random() * .35); t.position.set(x, y, z); forest.add(t); }
  // النهر (مياه جارية)
  const rpts = []; for (let i = 0; i <= 24; i++) { const t = i / 24, x = lerp(-3.3, 2.6, t), z = lerp(-.3, 1.6, t) + Math.sin(t * 9) * .35; rpts.push(V(x, h(x, z) + .04, z)); }
  const river = tube(rpts, .09, mat('#4aa3e0', { roughness: .2, emissive: '#1d6aa8', emissiveIntensity: .2 }), 80, 6); river.scale.y = .4; river.position.y = rpts[0].y * .6 * 0; root.add(river);
  const riverC = curve(rpts);
  // بحيرة صغيرة (مياه سطحية)
  const lake = mesh(new THREE.CircleGeometry(.6, 32), mat('#4aa3e0', { roughness: .15 }), [-1.2, h(-1.2, -1.6) + .05, -1.6], [-Math.PI / 2, 0, 0]); lake.scale.set(1.5, 1, 1); root.add(lake);
  // الشمس والسحابة
  const sun = mesh(new THREE.SphereGeometry(.55, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffd23a' }), [5.2, 5.4, -2]); root.add(sun);
  const glow = mesh(new THREE.SphereGeometry(.9, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffe680', transparent: true, opacity: .3 }), [5.2, 5.4, -2]); root.add(glow);
  const cl = cloud(1.3); cl.position.set(-.6, 4.6, -.6); root.add(cl);
  // المياه الجوفية (مسار في باطن الأرض على الوجه الأمامي)
  const gw = mesh(new THREE.BoxGeometry(7.5, .5, .02), glass('#3aa0ff', .35), [-1.4, -1.0, D / 2 + .02]); root.add(gw);
  // الجسيمات
  const evap = new Flow(root, '#9ad7ff', .07, 160), trans = new Flow(root, '#b6f0c0', .06, 80), rain = new Flow(root, '#3a8fe0', .05, 200), run = new Flow(root, '#2f86d9', .07, 80), ground = new Flow(root, '#4aa3ff', .06, 60);
  for (let i = 0; i < 8; i++) { const x = 2.6 + Math.random() * 3, z = -3 + Math.random() * 6; evap.addPath(curve([[x, .05, z], [x - .3, 1.6, z * .7], [x - 1.8, 3.2, z * .4], [-.2 + Math.random(), 4.4, -.6 + Math.random() * .6]]), .28); }
  forest.children.forEach((t, i) => { if (i % 4) return; const p = t.position; trans.addPath(curve([[p.x, p.y + 1, p.z], [p.x, p.y + 2.2, p.z * .8], [-.6 + Math.random(), 4.3, -.6]]), .3); });
  for (let i = 0; i < 14; i++) { const x = -2.8 + Math.random() * 3.6, z = -2.4 + Math.random() * 3.8; rain.addPath(curve([[x, 4.2, z], [x + .2, h(x, z) + .05, z]]), .9); }
  run.addPath(riverC, .14);
  ground.addPath(curve([[-3.6, -.2, D / 2 + .03], [-2.6, -.9, D / 2 + .03], [-.4, -1.05, D / 2 + .03], [1.8, -1.0, D / 2 + .03], [2.8, -.8, D / 2 + .03]]), .12);
  let temp = 6, cloudAmt = .4, snow = false, focus = null;
  const rainM = rain.mat;
  function rates() { evap.rate = temp * 1.6; trans.rate = temp * .45; glow.scale.setScalar(.5 + temp / 9); }
  rates();
  const parts = [
    { id: 'evap', name: 'تبخّر', info: 'الماء في المحيطات والبحار والبحيرات والبرك والأنهار يمتص حرارة الشمس التي تسرّع عملية تبخره. ويُقصد بالتبخر تحول الماء من الحالة السائلة إلى الحالة الغازية، فيصبح على شكل بخار ماء يرتفع في الغلاف الجوي.', objs: [proxy(root, [4, 1.6, 0], [2.4, 2.6, 3])], at: anchor(root, [4.2, 2.4, 1]) },
    { id: 'cond', name: 'تكثّف', info: 'عندما يبرد بخار الماء يتكثف على شكل قطرات. والتكثّف هو تحول المادة من الحالة الغازية إلى الحالة السائلة. وتتجمع قطرات الماء وتشكل السحب.', objs: cl.children, at: anchor(cl, [0, .9, 0]) },
    { id: 'precip', name: 'هطول', info: 'عندما تصبح القطرات ثقيلة بحيث تعجز السحب عن حملها تسقط على شكل هطول. ويكون الهطول عادة في ثلاثة أشكال: البرَد، والثلج، والمطر.', objs: [proxy(root, [-1.2, 3.0, -.4], [3, 1.6, 2.5])], at: anchor(root, [-1.4, 3.2, .8]) },
    { id: 'surface', name: 'مياه سطحية', info: 'تستمر دورة الماء بعد أن يعود إلى سطح الأرض؛ حيث يتجمع جزء منه على سطح الأرض، ويجري عبر المنحدرات. وتُعرف المياه التي تتجمع فوق سطح الأرض بالمياه السطحية.', objs: [lake], at: anchor(lake, [0, 0, .3]) },
    { id: 'runoff', name: 'مياه جارية', info: 'يتدفق الماء الذي لا تمتصه التربة على شكل أودية وأنهار قبل أن يصب في المحيطات والبحار. وتسمى هذه المياه المياه الجارية.', objs: [river], at: anchor(root, [.6, h(.6, 1.2) + .2, 1.2]) },
    { id: 'ground', name: 'مياه جوفية', info: 'أما الجزء الآخر من الماء فيدخل إلى جوف الأرض، ويسمّى المياه الجوفية التي تُختزن في مسامات التربة والصخور.', objs: [gw], at: anchor(root, [-2.6, -.8, D / 2 + .05]) },
    { id: 'trans', name: 'نتح', info: 'تسهم النباتات والحيوانات في دورة الماء؛ فجذور النباتات تمتص الماء من التربة وتطلقه في الغلاف الجوي في عملية النتح. وتستهلك الحيوانات الماء وتطلقه في الغلاف الجوي في أثناء عملية التنفس.', objs: forest.children.flatMap(t => t.children), at: anchor(root, [.2, 1.6, -1.6]) }
  ];
  const steps = [['تبخّر', 'evap'], ['تكثّف', 'cond'], ['هطول', 'precip'], ['مياه سطحية', 'surface'], ['مياه جارية', 'runoff'], ['مياه جوفية', 'ground'], ['نتح', 'trans']].map(([t, id]) => ({ t, d: parts.find(p => p.id === id).info, id }));
  return {
    root, parts,
    update(dt, t) {
      cloudAmt = clamp(cloudAmt + (evap.items.length * .0025 + trans.items.length * .0015) * dt - (rain.on ? .09 * dt : 0), .15, 1.2);
      cl.scale.setScalar(.9 + cloudAmt * .9); cl.userData.mat.color.set(cloudAmt > .8 ? '#9aa6b4' : '#ffffff');
      if (cloudAmt > .85) rain.on = true; if (cloudAmt < .35) rain.on = false;
      rain.rate = rain.on ? 22 : 0; snow = temp < 3; rainM.color.set(snow ? '#ffffff' : '#3a8fe0'); rainM.emissive.set(snow ? '#ffffff' : '#3a8fe0');
      rain.paths.forEach(p => p.speed = snow ? .35 : .9);
      run.rate = rain.on ? 6 : 2; ground.rate = rain.on ? 2.5 : .6;
      [evap, trans, rain, run, ground].forEach(f => f.update(dt));
      if (focus) { const pp = .25 + .25 * Math.sin(t * 5); }
    },
    cam: { pos: [2, 6.5, 11.5], target: [0, 1.0, 0] }, inpage: { pos: [1.2, 5.2, 11.5], target: [0, .8, 0] },
    controls: [
      { type: 'steps', steps, value: -1, on: i => { api.select(steps[i].id); } },
      { type: 'slider', label: 'حرارة الشمس', min: 0, max: 10, step: 1, value: 6, fmt: v => v < 3 ? 'باردة' : v < 7 ? 'معتدلة' : 'حارة', on: v => { temp = v; rates(); api.toast(v >= 8 ? 'كلما زادت الحرارة زاد معدل التبخر؛ فالماء الساخن أعلى معدل تبخر من الماء البارد.' : v < 3 ? 'الجو بارد: يقلّ التبخر، ويسقط الهطول على شكل ثلج.' : ''); } },
      { type: 'button', label: 'أمطري الآن', on: () => { cloudAmt = 1.1; } }
    ],
    legend: [['#9ad7ff', 'بخار ماء'], ['#b6f0c0', 'نتح'], ['#3a8fe0', 'هطول وماء جارٍ']],
    quiz: [
      { q: 'المس المرحلة التي يتحول فيها الماء من الحالة السائلة إلى الحالة الغازية.', a: 'evap' },
      { q: 'أين يتحول بخار الماء إلى قطرات تتجمع وتشكل السحب؟', a: 'cond' },
      { q: 'المس المياه التي تُختزن في مسامات التربة والصخور.', a: 'ground' },
      { q: 'المس المياه التي تتدفق على شكل أودية وأنهار لتصب في البحار.', a: 'runoff' },
      { q: 'المس ما تطلق به النباتات الماء في الغلاف الجوي.', a: 'trans' }
    ]
  };
}

/* ───────────── ص ١١٨–١١٩: دورة الكربون ───────────── */
export function carbonModel(api, variant = 0) {
  const root = new THREE.Group();
  const W = 14, D = 6;
  const h = (x, z) => { const hill = 1.8 * Math.exp(-((x + 3) ** 2 / 9 + (z + 2.6) ** 2 / 3)); const shore = smooth(3.4, 5.2, x); return .45 + hill + (fbm(x * .6, z * .6) - .5) * .25 - shore * 1.3; };
  const col = (x, z, y) => y < .02 ? '#c8b07a' : y < .2 ? '#cdbb85' : '#6aa84a';
  const st = strataTexture([['#3a2a1c', 1.2], ['#7a5a3a', .8], ['#5b4a3a', .3], ['#141414', .7], ['#a0805a', .9], ['#8a6a46', .5], ['#b08f62', .6], ['#7a5a3a', .4]]);
  const land = terrain({ w: W, d: D, nx: 140, nz: 60, h, color: col, bottom: -4, top: 2.2, sideTex: st }); root.add(land);
  const sea = mesh(new THREE.BoxGeometry(2.6, 1.0, D), glass('#2f86c9', .6), [W / 2 - 1.3, -.5, 0]); root.add(sea);
  const seaTop = mesh(new THREE.PlaneGeometry(2.6, D), mat('#2f80c4', { transparent: true, opacity: .85, roughness: .1 }), [W / 2 - 1.3, .001, 0], [-Math.PI / 2, 0, 0]); root.add(seaTop);
  // طبقات الفحم والنفط والغاز على الوجه الأمامي
  const FZ = D / 2 + .015;
  const coalS = new THREE.Shape(); coalS.moveTo(-5.5, -1.5); coalS.bezierCurveTo(-3, -1.25, -1, -1.6, 1.5, -1.45); coalS.lineTo(1.4, -2.0); coalS.bezierCurveTo(-1, -2.2, -3, -1.9, -5.6, -2.05);
  const coal = mesh(new THREE.ShapeGeometry(coalS), mat('#0f0f0f', { roughness: .4, metalness: .2 }), [0, 0, FZ]); root.add(coal);
  const oilS = new THREE.Shape(); oilS.moveTo(-6.9, -3.0); oilS.bezierCurveTo(-3, -2.8, 0, -3.25, 3.5, -3.0); oilS.lineTo(3.4, -3.5); oilS.bezierCurveTo(0, -3.7, -3, -3.4, -6.9, -3.55);
  const oil = mesh(new THREE.ShapeGeometry(oilS), mat('#2a2018', { roughness: .3, metalness: .3 }), [0, 0, FZ]); root.add(oil);
  const gasS = new THREE.Shape(); gasS.moveTo(4.2, -2.3); gasS.bezierCurveTo(5, -2.0, 6.2, -2.4, 7.0, -2.2); gasS.lineTo(7, -2.9); gasS.bezierCurveTo(6, -3.0, 5, -2.8, 4.1, -2.75);
  const gas = mesh(new THREE.ShapeGeometry(gasS), mat('#3d3a35', { roughness: .5 }), [0, 0, FZ]); root.add(gas);
  const marS = new THREE.Shape(); marS.moveTo(4.4, -1.0); marS.lineTo(7, -1.0); marS.lineTo(7, -1.4); marS.lineTo(4.6, -1.35);
  const marine = mesh(new THREE.ShapeGeometry(marS), mat('#6a5a3e'), [0, 0, FZ]); root.add(marine);
  const rocksS = new THREE.Shape(); rocksS.moveTo(3.6, -1.6); rocksS.lineTo(7, -1.6); rocksS.lineTo(7, -2.1); rocksS.lineTo(3.8, -2.2);
  const rocks = mesh(new THREE.ShapeGeometry(rocksS), mat('#9a8a72'), [0, 0, FZ]); root.add(rocks);
  // الكائنات والمنشآت
  const trees = new THREE.Group(); root.add(trees);
  const treeSpots = [[-2.4, -.6], [-1.6, .4], [-2.9, .9], [-1.0, -1.3], [1.6, -.9], [2.6, 1.2], [-.4, 1.7], [-3.6, -1.6], [.6, .2], [3.2, -1.6]];
  treeSpots.forEach(([x, z], i) => { const t = tree(.9 + (i % 3) * .2, i % 2 ? '#4f8f3a' : '#9aa83a'); t.position.set(x, h(x, z), z); trees.add(t); });
  const deers = new THREE.Group(); root.add(deers); for (const [x, z, s, c] of [[-5.2, .6, 1, '#9a6a3d'], [-4.6, 1.4, .8, '#7a6a5a']]) { const d = deer(s, c); d.position.set(x, h(x, z), z); d.rotation.y = .6; deers.add(d); }
  const hs = house(1.1); hs.position.set(1.6, h(1.6, .6), .6); root.add(hs);
  const smokeSrc = hs.position.clone().add(hs.userData.chimney);
  const sun = mesh(new THREE.SphereGeometry(.5, 24, 16), new THREE.MeshBasicMaterial({ color: '#ffd23a' }), [-6, 5.4, -2.4]); root.add(sun);
  // ثاني أكسيد الكربون في الهواء: ضباب رمادي
  const airM = new THREE.MeshBasicMaterial({ color: '#8f8f8f', transparent: true, opacity: .18, depthWrite: false });
  const air = mesh(new THREE.SphereGeometry(1.4, 24, 16), airM, [-2, 5.2, 0]); air.scale.set(2.4, .7, 1.3); root.add(air);
  // الأسهم (كما في الكتاب: البرتقالي إلى الهواء، الأزرق من الهواء)
  const arrows = new THREE.Group(); root.add(arrows);
  const aResp = arrowTube([[-5, 1.6, .8], [-5.6, 3.6, .5], [-3.6, 4.8, 0]], .08, '#f28c28');
  const aPhoto = arrowTube([[-1.2, 4.7, 0], [-1.4, 3.6, .3], [-1.8, 2.3, .2]], .08, '#2a7fd4');
  const aComb = arrowTube([[smokeSrc.x, smokeSrc.y + .2, smokeSrc.z], [2.6, 4, .3], [.4, 5.2, 0]], .08, '#f28c28');
  const aDec = arrowTube([[-2.2, .3, FZ + .02], [-1.6, -.8, FZ + .02], [-.3, -1.5, FZ + .02]], .07, '#efe8dc');
  const aFuel = arrowTube([[-4, -3.2, FZ + .02], [-1, -2.6, FZ + .02], [1.4, .2, FZ + .02]], .07, '#efe8dc');
  const aSea = arrowTube([[2.4, 5.2, 0], [5.4, 3.8, 0], [5.8, .3, 0]], .08, '#f28c28');
  const aMar = arrowTube([[5.6, -1.4, FZ + .02], [5.3, -2.0, FZ + .02], [5.2, -2.5, FZ + .02]], .06, '#efe8dc');
  arrows.add(aResp, aPhoto, aComb, aDec, aFuel, aSea, aMar);
  // الجسيمات
  const resp = new Flow(root, '#7d7d7d', .07, 60), photo = new Flow(root, '#7d7d7d', .07, 60), comb = new Flow(root, '#555555', .08, 120), dec = new Flow(root, '#4a3a2a', .06, 40), fuel = new Flow(root, '#1a1a1a', .07, 40), dis = new Flow(root, '#7d7d7d', .06, 40);
  resp.addPath(aResp.userData.curve, .25); photo.addPath(aPhoto.userData.curve, .3); comb.addPath(aComb.userData.curve, .25); dec.addPath(aDec.userData.curve, .2); fuel.addPath(aFuel.userData.curve, .2); dis.addPath(aSea.userData.curve, .2);
  let burn = 4, nTrees = 10, animals = true, co2 = .5;
  function apply() {
    trees.children.forEach((t, i) => t.visible = i < nTrees);
    resp.rate = animals ? 2.5 : 0; deers.visible = animals; aResp.visible = animals;
    photo.rate = nTrees * .5; comb.rate = burn * 1.4; fuel.rate = burn * .4; aComb.visible = burn > 0; dec.rate = 1.2; dis.rate = 1.2;
  }
  apply();
  const parts = [
    { id: 'co2', name: 'ثاني أكسيد الكربون في الهواء', info: 'يعدّ الكربون عنصرًا مهمًّا للمخلوقات الحية؛ فهو يشكّل حوالي ٥/١ جسمك. ويوجد الكربون في الغلاف الجوي على شكل غاز ثاني أكسيد الكربون. ويعرف انتقال الكربون بين المخلوقات الحية وغيرها بشكل مستمر بدورة الكربون.', objs: [air], at: anchor(root, [-2, 5.9, .4]) },
    { id: 'photo', name: 'البناء الضوئي', info: 'تقوم النباتات وبعض المخلوقات الحية الأخرى بعملية البناء الضوئي، فتأخذ ثاني أكسيد الكربون من الهواء، وتعمل على اتحاده مع الماء؛ لتنتج السكر ومركبات أخرى، منها الدهون والبروتين. وتتغذى آكلات الأعشاب على هذه المواد الغنية بعنصر الكربون، ومنها ينتقل إلى آكلات اللحوم.', objs: [...trees.children.flatMap(t => t.children), ...aPhoto.children], at: anchor(root, [-1.4, 2.8, .4]) },
    { id: 'resp', name: 'تنفّس', info: 'تقوم النباتات والحيوانات في أثناء عملية التنفس بحرق الغذاء الغني بالكربون للحصول على الطاقة، وينتج عن عملية التنفس غاز ثاني أكسيد الكربون، الذي يعود إلى الجو ليبدأ دورته من جديد.', objs: [...deers.children.flatMap(d => d.children), ...aResp.children], at: anchor(root, [-5, 2.0, .9]), hidden: () => !animals },
    { id: 'dec', name: 'تحلّل', info: 'تعمل المحلّلات – ومنها البكتيريا – على تفكيك النباتات والحيوانات الميتة، وتؤدي هذه العملية إلى إطلاق المزيد من الكربون المختزن في النباتات والحيوانات إلى الجو أيضًا.', objs: aDec.children, at: anchor(root, [-1.7, -.6, FZ + .1]) },
    { id: 'coal', name: 'فحم', info: 'تتحلل بعض النباتات والحيوانات الميتة المدفونة عميقًا في باطن الأرض، ومع مرور الوقت، ونتيجة تعرضها للضغط الشديد من طبقات الأرض العليا تتحول إلى وقود أحفوري، مثل الغاز الطبيعي والفحم والنفط.', objs: [coal], at: anchor(root, [-2.4, -1.65, FZ + .05]) },
    { id: 'oil', name: 'نفط', info: 'النفط وقود أحفوري تكوّن من النباتات والحيوانات الميتة المدفونة عميقًا بفعل الضغط الشديد مع مرور الوقت.', objs: [oil], at: anchor(root, [-2.6, -3.15, FZ + .05]) },
    { id: 'comb', name: 'احتراق طبيعي واحتراق بفعل الإنسان', info: 'عندما يقوم الإنسان بحرق هذا الوقود للحصول على الطاقة يعود الكربون المختزن فيه إلى الغلاف الجوي على شكل غاز ثاني أكسيد الكربون.', objs: [...hs.children, ...aComb.children], at: anchor(root, [2.5, 3.4, .4]), hidden: () => burn === 0 },
    { id: 'dissolved', name: 'ثاني أكسيد الكربون ذائب في الماء', info: 'يذوب جزء من ثاني أكسيد الكربون الموجود في الهواء في ماء البحار والمحيطات.', objs: [sea, seaTop, ...aSea.children], at: anchor(root, [5.7, .5, 1.2]) },
    { id: 'marine', name: 'بقايا طحالب بحرية وعوالق', info: 'تترسب بقايا الطحالب البحرية والعوالق في قاع البحر، فيُحتجز الكربون فيها.', objs: [marine], at: anchor(root, [5.8, -1.15, FZ + .05]) },
    { id: 'rocks', name: 'صخور', info: 'يمكن أن يُحتجز الكربون ويبقى بعيدًا عن الجو فترة طويلة من الزمن في الصخور والوقود الأحفوري.', objs: [rocks], at: anchor(root, [5.4, -1.85, FZ + .05]) },
    { id: 'gas', name: 'غاز طبيعي', info: 'الغاز الطبيعي وقود أحفوري تكوّن تحت الضغط الشديد من طبقات الأرض العليا، ويختزن فيه الكربون.', objs: [gas], at: anchor(root, [5.6, -2.55, FZ + .05]) }
  ];
  const pageBox = variant ? [3.2, -4, -3, 7.1, 5.6, 3.1] : null;
  return {
    root, parts, pageBox,
    update(dt) {
      const target = clamp(.35 + burn * .07 + (animals ? .08 : 0) - nTrees * .03, .05, 1); co2 = lerp(co2, target, dt * .8);
      airM.opacity = .08 + co2 * .45; air.scale.set(2.4 + co2, .7 + co2 * .4, 1.3);
      [resp, photo, comb, dec, fuel, dis].forEach(f => f.update(dt));
    },
    cam: { pos: variant ? [6.5, 3.5, 11] : [0, 5.5, 13], target: variant ? [3.5, -.5, 0] : [0, .6, 0] },
    inpage: variant ? { pos: [6.5, 1.4, 10], target: [5.2, -.6, 0] } : { pos: [-1, 4.2, 13], target: [-.6, .4, 0] },
    controls: [
      { type: 'slider', label: 'حرق الوقود (احتراق بفعل الإنسان)', min: 0, max: 10, step: 1, value: 4, fmt: v => v ? (v < 4 ? 'قليل' : v < 8 ? 'متوسط' : 'كثير') : 'متوقف', on: v => { burn = v; apply(); if (v >= 8) api.toast('كلما زاد حرق الوقود الأحفوري زادت كمية ثاني أكسيد الكربون التي تعود إلى الغلاف الجوي.'); } },
      { type: 'slider', label: 'عدد الأشجار', min: 0, max: 10, step: 1, value: 10, fmt: v => v, on: v => { nTrees = v; apply(); if (v === 0) api.toast('بلا أشجار يتوقف البناء الضوئي الذي يأخذ ثاني أكسيد الكربون من الهواء، فتزداد كميته.'); } },
      { type: 'button', label: 'أزل الحيوانات', toggle: true, on: on => { animals = !on; apply(); api.toast(on ? 'هل تتوقف دورة الكربون في حالة عدم وجود الحيوانات؟ لاحظ: ما زالت النباتات تتنفس، والمحلّلات تعمل، والوقود يحترق.' : ''); } }
    ],
    legend: [['#f28c28', 'إلى الهواء'], ['#2a7fd4', 'من الهواء'], ['#7d7d7d', 'ثاني أكسيد الكربون']],
    quiz: [
      { q: 'المس العملية التي تأخذ فيها النباتات ثاني أكسيد الكربون من الهواء.', a: 'photo' },
      { q: 'أين يمكن أن يُحتجز الكربون ويبقى بعيدًا عن الجو فترة طويلة؟ المس الفحم.', a: 'coal' },
      { q: 'المس العملية التي تعيد فيها الحيوانات ثاني أكسيد الكربون إلى الجو.', a: 'resp' },
      { q: 'المس الغاز الطبيعي.', a: 'gas' },
      { q: 'المس ثاني أكسيد الكربون الذائب في الماء.', a: 'dissolved' }
    ]
  };
}

/* ───────────── ص ١٢٠: دورة النيتروجين ───────────── */
export function nitrogenModel(api) {
  const root = new THREE.Group();
  const W = 12, D = 6;
  const h = (x, z) => .4 + 1.3 * Math.exp(-((x - 2) ** 2 / 12 + (z + 2.6) ** 2 / 2)) + (fbm(x * .7, z * .7) - .5) * .2;
  const col = (x, z, y) => x < -4.2 ? ((Math.floor(z * 3) % 2) ? '#7a9a3a' : '#8a6a3a') : '#8aa84a';
  const st = strataTexture([['#7a5a38', 1], ['#9a7a52', 1], ['#8a6a46', 1], ['#a88a5e', 1]]);
  const land = terrain({ w: W, d: D, nx: 120, nz: 60, h, color: col, bottom: -3, top: 2, sideTex: st }); root.add(land);
  const FZ = D / 2 + .03;
  // المصنع، البرق، الشجرة، الأرنب، النبات البقولي
  const fac = new THREE.Group(); fac.position.set(-2.8, h(-2.8, -1.6), -1.6); root.add(fac);
  fac.add(mesh(new THREE.BoxGeometry(1.8, .7, 1), mat('#c9c9cc'), [0, .35, 0])); for (const x of [-.4, .2]) fac.add(mesh(new THREE.CylinderGeometry(.14, .17, 1.6, 12), mat('#6a6a6e'), [x, 1.3, -.2]));
  const bolt = tube([[0, 4.6, -1.2], [-.3, 3.8, -1.2], [.15, 3.4, -1.2], [-.25, 2.4, -1.2], [.1, 1.9, -1.2], [-.2, 1.0, -1.2]], .05, new THREE.MeshBasicMaterial({ color: '#fffbe0', transparent: true, opacity: .25 }), 30, 6); root.add(bolt);
  const tr = tree(2.2, '#5f9a3a'); tr.position.set(.6, h(.6, -.6), -.6); root.add(tr);
  const leafMats = []; tr.traverse(o => { if (o.isMesh && o.material.color.getHexString() === '5f9a3a') leafMats.push(o.material); });
  const rabbit = new THREE.Group(); rabbit.add(mesh(new THREE.SphereGeometry(.18, 12, 10), mat('#8a6a4a'), [0, .18, 0], null, [1.3, 1, 1])); rabbit.add(mesh(new THREE.SphereGeometry(.1, 10, 8), mat('#8a6a4a'), [.22, .32, 0])); for (const z of [-.04, .04]) rabbit.add(mesh(new THREE.CapsuleGeometry(.025, .16, 3, 6), mat('#8a6a4a'), [.22, .5, z])); rabbit.position.set(2.0, h(2, .4), .4); root.add(rabbit);
  const legume = new THREE.Group(); legume.position.set(-5, h(-5, 1.6), 1.6); root.add(legume);
  for (let i = 0; i < 5; i++) { const x = (i - 2) * .3; legume.add(tube([[x, 0, 0], [x, .4, .05], [x + .05, .8, 0]], .025, mat('#4f8f2a'), 8, 5)); legume.add(mesh(new THREE.SphereGeometry(.12, 10, 8), mat('#5fa83a'), [x + .05, .85, 0], null, [1.2, .6, 1])); }
  // الجذور تحت الأرض (على الوجه الأمامي)
  const roots = new THREE.Group(); root.add(roots);
  for (let i = 0; i < 9; i++) { const a = -.9 + i * .22; roots.add(tube([[.6, .2, FZ], [.6 + Math.sin(a) * .5, -.4, FZ], [.6 + Math.sin(a) * 1.0, -1.0 - Math.random() * .3, FZ]], .04, mat('#d9c39a'), 12, 5)); }
  // المحطات الكيميائية: دوائر مكبّرة كما في الكتاب
  function lens(pos, color, bugColor) { const g = new THREE.Group(); g.position.set(...pos); g.add(mesh(new THREE.CircleGeometry(.55, 32), mat(color)), mesh(new THREE.TorusGeometry(.55, .05, 8, 40), mat('#f5f0e0'))); for (let i = 0; i < 9; i++) g.add(mesh(new THREE.CapsuleGeometry(.05, .16, 3, 8), mat(bugColor), [(Math.random() - .5) * .7, (Math.random() - .5) * .7, .05], [0, 0, Math.random() * 3])); root.add(g); return g; }
  function node(pos, color, r = .28) { const m = mesh(new THREE.SphereGeometry(r, 24, 16), mat(color, { emissive: color, emissiveIntensity: .35, roughness: .3 }), pos); root.add(m); return m; }
  const fixB = lens([-5.0, -1.0, FZ], '#e88aa0', '#8a2a6a');
  const soilB = lens([-2.2, -2.2, FZ], '#e8a0a0', '#9a3a5a');
  const deniB = lens([4.4, -1.1, FZ], '#f4c070', '#e8a020');
  const nAmm = node([-3.3, -1.6, FZ], '#f2f2f2'), nNit = node([-1.2, -1.5, FZ], '#ffcf6a'), nNat = node([.2, -1.2, FZ], '#7ad06a');
  const airN = mesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshBasicMaterial({ color: '#c8dcff', transparent: true, opacity: .22, depthWrite: false }), [0, 4.4, 0]); airN.scale.set(4, .7, 1.6); root.add(airN);
  const aFix = arrowTube([[-1.5, 4.3, 0], [-3.8, 3.8, .3], [-4.8, 1.0, 1], [-4.6, -.6, FZ]], .1, '#f2e24a');
  const aDeni = arrowTube([[4.4, -.5, FZ], [4.8, 1.8, 1.5], [3.6, 4, .2], [1.8, 4.5, 0]], .1, '#ee6a4a');
  const aDec = arrowTube([[-4.4, .4, FZ], [-3.6, -.6, FZ], [-3.4, -1.3, FZ]], .07, '#ffffff');
  const aA2N = arrowTube([[-3.0, -1.7, FZ], [-1.5, -1.55, FZ]], .06, '#ffffff', .25);
  const aN2N = arrowTube([[-.9, -1.45, FZ], [-.1, -1.25, FZ]], .06, '#ffffff', .25);
  const aAbs = arrowTube([[.45, -1.05, FZ], [.6, -.5, FZ]], .06, '#ffffff', .2);
  const aBot = arrowTube([[-1.8, -2.6, FZ], [1.5, -2.6, FZ], [4.1, -1.6, FZ]], .07, '#ffffff');
  [aFix, aDeni, aDec, aA2N, aN2N, aAbs, aBot].forEach(a => root.add(a));
  const flow = new Flow(root, '#4a7aff', .07, 160); flow.rate = 5;
  const segs = { fix: [aFix, .2], dec: [aDec, .3], a2n: [aA2N, .45], n2n: [aN2N, .5], abs: [aAbs, .6], deni: [aBot, .25], up: [aDeni, .2] };
  let bact = 7, flash = 0, nitrate = .7;
  function setFlows() { flow.paths = []; for (const [k, [a, s]] of Object.entries(segs)) { let w = 1; if (k === 'a2n' || k === 'n2n') w = bact / 7; flow.addPath(a.userData.curve, s, w); } }
  setFlows();
  const parts = [
    { id: 'airN', name: 'غاز النيتروجين في الهواء', info: 'يشكّل النيتروجين ٧٨٪ من الهواء. إلا أن القليل من المخلوقات الحية تستطيع الاستفادة منه في شكله الغازي.', objs: [airN], at: anchor(root, [1.2, 4.9, .6]) },
    { id: 'fix', name: 'تثبيت النيتروجين', info: 'يتم تثبيت النيتروجين عن طريق كلٍّ من النشاط البركاني، والبرق. كما تقوم بذلك بعض أنواع البكتيريا الموجودة في التربة.', objs: [...aFix.children, bolt], at: anchor(root, [-3.9, 3.6, .4]) },
    { id: 'fixB', name: 'بكتيريا مثبتة للنيتروجين', info: 'البكتيريا المثبتة للنيتروجين الموجودة على العقد الجذرية في البقوليات تؤدي دورًا مهمًّا في دورة هذا العنصر؛ إذ تقوم بتحويل غاز النيتروجين إلى مادة الأمونيا.', objs: fixB.children, at: anchor(fixB, [0, .6, 0]) },
    { id: 'amm', name: 'أمونيا', info: 'تتحول الأمونيا بعد ذلك بمساعدة نوعين من بكتيريا التربة إلى مادة تستطيع النباتات استعمالها.', objs: [nAmm], at: anchor(nAmm, [0, .3, 0]) },
    { id: 'nitrite', name: 'نيتريت', info: 'يقوم النوع الأول من البكتيريا بتحويل الأمونيا إلى نتريت.', objs: [nNit], at: anchor(nNit, [0, .3, 0]) },
    { id: 'nitrate', name: 'نترات', info: 'يقوم النوع الآخر بتحويل النتريت إلى نترات تمتصها النباتات في أثناء نموها، وتستعمل النيتروجين الموجود فيها في صنع البروتينات.', objs: [nNat], at: anchor(nNat, [0, .3, 0]) },
    { id: 'abs', name: 'امتصاص', info: 'تمتص النباتات النترات في أثناء نموها، وتستعمل النيتروجين الموجود فيها في صنع البروتينات. وتحصل الحيوانات على النيتروجين عندما تأكل النباتات.', objs: [...roots.children, ...aAbs.children], at: anchor(root, [1.1, -.5, FZ]) },
    { id: 'dec', name: 'تحلّل', info: 'تحصل الحيوانات على النيتروجين عندما تأكل النباتات، ثم تخرجه مع فضلاتها، فيعود مرة أخرى إلى التربة، فتقوم المحللات بتحويله إلى أمونيا من جديد.', objs: aDec.children, at: anchor(root, [-3.7, .1, FZ + .1]) },
    { id: 'soilB', name: 'بكتيريا التربة', info: 'نوعان من بكتيريا التربة: يحوّل الأول الأمونيا إلى نتريت، ويحوّل الآخر النتريت إلى نترات.', objs: soilB.children, at: anchor(soilB, [0, -.65, 0]) },
    { id: 'deniB', name: 'بكتيريا مزيلة للنيتروجين', info: 'تتم إعادة النيتروجين إلى الجو مرة أخرى عن طريق البكتيريا المزيلة للنيتروجين، التي تعمل على تحويل النيتروجين الموجود في النترات إلى غاز مرة أخرى، وهكذا تستمر دورة النيتروجين في الطبيعة.', objs: deniB.children, at: anchor(deniB, [0, -.65, 0]) },
    { id: 'deni', name: 'إزالة النيتروجين', info: 'تحوّل البكتيريا المزيلة للنيتروجين النيتروجين الموجود في النترات إلى غاز يعود إلى الهواء.', objs: aDeni.children, at: anchor(root, [4.9, 2.2, 1.4]) }
  ];
  const steps = [['غاز النيتروجين في الهواء', 'airN'], ['تثبيت النيتروجين', 'fix'], ['بكتيريا مثبتة للنيتروجين', 'fixB'], ['أمونيا', 'amm'], ['نيتريت', 'nitrite'], ['نترات', 'nitrate'], ['امتصاص', 'abs'], ['تحلّل', 'dec'], ['إزالة النيتروجين', 'deni']].map(([t, id]) => ({ t, id, d: parts.find(p => p.id === id).info }));
  return {
    root, parts,
    update(dt, t) {
      flow.update(dt);
      if (flash > 0) { flash -= dt; bolt.material.opacity = Math.random() > .3 ? 1 : .2; } else bolt.material.opacity = .15;
      nitrate = lerp(nitrate, bact / 10, dt * .5); nNat.scale.setScalar(.4 + nitrate); nNit.scale.setScalar(.4 + bact / 12);
      const c = new THREE.Color('#c9b43a').lerp(new THREE.Color('#4f9a3a'), clamp(nitrate * 1.4)); leafMats.forEach(m => m.color.copy(c));
    },
    cam: { pos: [0, 4.8, 12], target: [0, .4, 0] }, inpage: { pos: [0, 4.0, 11.5], target: [0, .2, 0] },
    controls: [
      { type: 'steps', steps, value: -1, on: i => api.select(steps[i].id) },
      { type: 'button', label: '⚡ برق', on: () => { flash = .8; for (let i = 0; i < 14; i++) flow.spawn(); api.toast('يثبّت البرق جزءًا من غاز النيتروجين في الهواء فيصل إلى التربة.'); } },
      { type: 'slider', label: 'كمية بكتيريا التربة', min: 0, max: 10, step: 1, value: 7, fmt: v => v ? (v < 4 ? 'قليلة' : 'كثيرة') : 'لا توجد', on: v => { bact = v; setFlows(); if (v === 0) api.toast('بلا بكتيريا التربة لا تتحول الأمونيا إلى نترات، فلا تجد النباتات النيتروجين الذي تصنع منه البروتينات؛ لهذا يحتاج الإنسان إلى بكتيريا التربة.'); } }
    ],
    quiz: [
      { q: 'المس البكتيريا التي تعيد النيتروجين إلى الجو.', a: 'deniB' },
      { q: 'المس المادة التي تمتصها النباتات في أثناء نموها.', a: 'nitrate' },
      { q: 'إلى أي مادة تحوّل البكتيريا المثبتة غاز النيتروجين؟ المسها.', a: 'amm' },
      { q: 'المس البكتيريا الموجودة على العقد الجذرية للبقوليات.', a: 'fixB' },
      { q: 'المس المادة التي تتحول إليها الأمونيا أولًا.', a: 'nitrite' }
    ]
  };
}

/* ───────────── ص ١٣٢: مراحل التعاقب الأولي ───────────── */
export function successionModel(api) {
  const root = new THREE.Group();
  const S = 6;
  let stage = 0, moist = 8, soilD = 0;
  // قاعدة الصخر
  const bed = mesh(new THREE.BoxGeometry(S, 1.4, S), mat('#fff', { map: noiseTexture('#8f8a80', '#6a655c', 4000, 256, 256, 6), roughness: .95 }), [0, -.7, 0]); root.add(bed);
  const cobbles = new THREE.Group(); root.add(cobbles);
  for (let i = 0; i < 40; i++) { const r = .22 + Math.random() * .3; const c = mesh(new THREE.DodecahedronGeometry(r, 0), mat(['#a8a296', '#8e887c', '#b8b2a6'][i % 3], { flatShading: true }), [(Math.random() - .5) * (S - .6), r * .5, (Math.random() - .5) * (S - .6)], [Math.random() * 3, Math.random() * 3, 0]); c.userData.r = r; cobbles.add(c); }
  const soilM = mat('#fff', { map: noiseTexture('#5a3e26', '#3e2a18', 3000), roughness: 1 });
  const soil = mesh(new THREE.BoxGeometry(S, 1, S), soilM, [0, 0, 0]); root.add(soil);
  const lichens = new THREE.Group(); root.add(lichens);
  cobbles.children.forEach(c => { for (let k = 0; k < 3; k++) { const d = mesh(new THREE.CircleGeometry(.08 + Math.random() * .1, 10), mat(['#c9d23a', '#e0a83a', '#6aa04a'][k], { side: 2 })); const n = V(Math.random() - .5, .8, Math.random() - .5).normalize(); d.position.copy(c.position).add(n.clone().multiplyScalar(c.userData.r * .85)); d.lookAt(d.position.clone().add(n)); lichens.add(d); } });
  const grass = new THREE.Group(); root.add(grass); const gM = mat('#7cb342'), gM2 = mat('#a5c24a');
  for (let i = 0; i < 260; i++) grass.add(mesh(new THREE.ConeGeometry(.04, .3 + Math.random() * .25, 4), i % 2 ? gM : gM2, [(Math.random() - .5) * (S - .2), .15, (Math.random() - .5) * (S - .2)]));
  const flowers = new THREE.Group(); root.add(flowers); for (let i = 0; i < 30; i++) flowers.add(mesh(new THREE.SphereGeometry(.05, 6, 5), mat(['#f2d14a', '#e85a8a', '#ffffff'][i % 3]), [(Math.random() - .5) * (S - .4), .38, (Math.random() - .5) * (S - .4)]));
  const shrubs = new THREE.Group(); root.add(shrubs); for (let i = 0; i < 22; i++) shrubs.add(mesh(new THREE.IcosahedronGeometry(.25 + Math.random() * .2, 1), mat(i % 2 ? '#5f8f3a' : '#7a9a42', { flatShading: true }), [(Math.random() - .5) * (S - .6), .25, (Math.random() - .5) * (S - .6)]));
  const young = new THREE.Group(); root.add(young); for (let i = 0; i < 9; i++) { const t = i % 2 ? pine(1.2) : tree(1.1, '#4f8f3a'); t.position.set((Math.random() - .5) * (S - 1), 0, (Math.random() - .5) * (S - 1)); young.add(t); }
  const forest = new THREE.Group(); root.add(forest); for (let i = 0; i < 12; i++) { const t = tree(2.4 + Math.random() * .6, ['#2f6e2f', '#3d7f34', '#2a5f2a'][i % 3]); t.position.set(((i % 4) - 1.5) * 1.35 + (Math.random() - .5) * .4, 0, (Math.floor(i / 4) - 1) * 1.8 + (Math.random() - .5) * .4); forest.add(t); }
  const ash = mesh(new THREE.BoxGeometry(S, .02, S), mat('#3a3330'), [0, .01, 0]); ash.visible = false; root.add(ash);
  function vis(g, k) { g.visible = k > .01; g.children.forEach((c, i) => { const thr = (i / g.children.length) * .7; const s = clamp((k - thr) / .3); c.visible = s > 0; c.scale.setScalar(Math.max(.001, s) * (c.userData.s0 ??= c.scale.x)); }); }
  let burnt = 0;
  function apply() {
    const cap = moist >= 5 ? 4 : 2.6; const s = Math.min(stage, cap);
    soilD = clamp((s - .8) / 2.6) * .45; soil.scale.y = Math.max(.001, soilD); soil.position.y = soilD / 2; soil.visible = soilD > .005;
    cobbles.children.forEach((c, i) => { const k = 1 - clamp(s / 3) * .75; c.scale.setScalar(k * (c.userData.s0 ??= 1)); c.visible = k > .27 || i % 3 === 0; c.position.y = c.userData.r * .5 * k + soilD * .3; });
    vis(lichens, clamp(s - .3) * (s < 3.2 ? 1 : clamp(4 - s)));
    const lift = soilD;
    [grass, flowers, shrubs, young, forest].forEach(g => g.position.y = lift);
    vis(grass, clamp((s - 1.4) / .8) * (s > 3.6 ? clamp((4.4 - s) / .8) * .6 + .2 : 1));
    vis(flowers, clamp((s - 1.7) / .6) * (s > 3.4 ? .3 : 1));
    vis(shrubs, clamp((s - 1.9) / .7));
    vis(young, clamp((s - 2.6) / .8) * (s > 3.7 ? clamp((4.6 - s)) : 1));
    vis(forest, clamp((s - 3.3) / .7));
    ash.visible = burnt > 0; ash.position.y = lift + .01;
    if (stage > cap + .05 && moist < 5) api.toast('المنطقة جافة: لا تنمو الأشجار الصغيرة إلا إذا كانت المنطقة رطبة بشكل كافٍ.');
  }
  const stageNames = ['صخور جرداء', 'أشنات وحزازيات', 'نباتات صغيرة، أعشاب وشجيرات', 'أشجار وشجيرات صغيرة', 'أشجار الغابة (مجتمع الذروة)'];
  const parts = [
    { id: 'rock', name: 'صخور جرداء', info: 'لقد تكوّن النظام البيئي أول الأمر من الصخور ودقائق الغبار، وبعض البذور التي جاءت من بيئة أخرى مجاورة.', objs: cobbles.children, at: anchor(root, [-1.6, .7, 1.6]), hidden: () => stage > 3.2 },
    { id: 'lichen', name: 'أشنات وحزازيات (الأنواع الرائدة)', info: 'تلا ذلك ظهور الأنواع الرائدة، وهي مخلوقات حية مكوّنة من الأشنات وبعض النباتات التي تنمو فوق الصخور؛ حيث تتمكن هذه المخلوقات مع المخلوقات المجهرية الدقيقة من بناء مجتمع الروّاد الحيوي.', objs: lichens.children, at: anchor(root, [1.4, .7, -1.2]), hidden: () => stage < .5 || stage > 3.4 },
    { id: 'soil', name: 'التربة', info: 'ثم تكسّرت الصخور في أثناء نمو مخلوقات الأنواع الرائدة، فتكوّنت التربة. وبعد موت هذه المخلوقات عملت البكتيريا الموجودة في التربة على تحليلها، وبذلك توافرت كميات إضافية من المواد الضرورية للتربة، مما أدى إلى نمو النباتات بشكل أفضل.', objs: [soil], at: anchor(root, [S / 2, .15, S / 2]), hidden: () => soilD < .05 },
    { id: 'grass', name: 'نباتات صغيرة، أعشاب وشجيرات', info: 'ويؤدي التغيّر في أنواع النباتات في مجتمع إلى التغيّر في أنواع الحيوانات. وسرعان ما تجذب النباتات الزهرية ناقلي حبوب اللقاح إلى المنطقة، ومنها الحشرات والطيور والثدييات الصغيرة.', objs: [...grass.children, ...shrubs.children], at: anchor(root, [.4, .9, 2]), hidden: () => stage < 1.9 || stage > 3.9 },
    { id: 'young', name: 'أشجار وشجيرات صغيرة (المجتمع الوسيط)', info: 'وإذا كانت المنطقة رطبة بشكل كافٍ فإن الأشجار الصغيرة تأخذ في النمو. وبعد مدة تحجب أوراقها أشعة الشمس، مما يسمح بنمو النباتات الصغيرة التي تحتاج إلى كمية أقل من ضوء الشمس.', objs: young.children.flatMap(t => t.children), at: anchor(root, [-1.5, 2.2, -1]), hidden: () => stage < 2.8 || stage > 3.9 || moist < 5 },
    { id: 'climax', name: 'أشجار الغابة (مجتمع الذروة)', info: 'وعندما تملأ الأشجار المنطقة تصبح غابة أو مجتمع الذروة، وهي المرحلة الأخيرة من التعاقب. وما لم تحدث كارثة طبيعية أو تدخّل جائر من قبل الإنسان فإن المجتمع الحيوي يحافظ على ذروته.', objs: forest.children.flatMap(t => t.children), at: anchor(root, [0, 4.6, 0]), hidden: () => stage < 3.6 || moist < 5 }
  ];
  apply();
  let auto = -1;
  return {
    root, parts,
    update(dt) { if (auto >= 0) { auto += dt; stage = Math.min(4, auto * .6); apply(); api.setControl(1, Math.round(stage * 10) / 10); if (stage >= 4) auto = -1; } },
    cam: { pos: [7, 6.5, 8], target: [0, 1.2, 0] }, inpage: { pos: [6.5, 5.5, 7.5], target: [0, 1.3, 0] },
    controls: [
      { type: 'steps', steps: stageNames.map((t, i) => ({ t: (i + 1) + '- ' + t, d: [parts[0].info, parts[1].info, parts[3].info, parts[4].info, parts[5].info][i] })), value: 0, on: i => { stage = i; burnt = 0; apply(); api.setControl(1, i); } },
      { type: 'slider', label: 'مرور الزمن (مئات السنين)', min: 0, max: 4, step: .1, value: 0, fmt: v => stageNames[Math.min(4, Math.round(v))], on: v => { stage = v; burnt = 0; apply(); } },
      { type: 'slider', label: 'رطوبة المنطقة', min: 0, max: 10, step: 1, value: 8, fmt: v => v < 5 ? 'جافة' : 'رطبة', on: v => { moist = v; apply(); } },
      { type: 'button', label: '▶ شغّل التعاقب', on: () => { auto = 0; burnt = 0; } },
      { type: 'button', label: '🔥 حريق في المنطقة', on: () => { if (stage < 2) return api.toast('لا يوجد غطاء نباتي يحترق بعد.'); burnt = 1; stage = 1.9; apply(); api.setControl(1, 1.9); api.toast('احترق الغطاء النباتي وبقيت التربة، فيبدأ التعاقب من جديد بالأعشاب، دون انتظار تكوّن التربة من الصخور.'); } }
    ],
    quiz: [
      { q: 'حرّك الزمن إلى البداية، ثم المس الصخور الجرداء.', a: 'rock' },
      { q: 'المس الأنواع الرائدة (أشنات وحزازيات). (حرّك الزمن إن لزم)', a: 'lichen' },
      { q: 'المس التربة التي تكوّنت من تكسّر الصخور.', a: 'soil' },
      { q: 'حرّك الزمن إلى النهاية، ثم المس مجتمع الذروة.', a: 'climax' }
    ]
  };
}
