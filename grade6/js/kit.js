// أدوات مشتركة لبناء المجسّمات
import * as THREE from 'three';
export { THREE };

/* ── واقعيّة: خريطةُ نتوءاتٍ دقيقةٍ مشتركة + بيئةُ إضاءةِ استوديو ── */
let _bump = null;
export function microBump() { if (_bump) return _bump; const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), im = g.createImageData(S, S);
  const h = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
  const n = (x, y) => { const X = Math.floor(x), Y = Math.floor(y), fx = x - X, fy = y - Y, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = 16; const H = (a, b) => h(((a % w) + w) % w, ((b % w) + w) % w);
    return H(X, Y) * (1 - u) * (1 - v) + H(X + 1, Y) * u * (1 - v) + H(X, Y + 1) * (1 - u) * v + H(X + 1, Y + 1) * u * v; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const x = i / S * 16, y = j / S * 16; const v = n(x, y) * .55 + n(x * 2, y * 2) * .3 + n(x * 4, y * 4) * .15; const k = (j * S + i) * 4; im.data[k] = im.data[k + 1] = im.data[k + 2] = v * 255; im.data[k + 3] = 255; }
  g.putImageData(im, 0, 0); _bump = new THREE.CanvasTexture(c); _bump.wrapS = _bump.wrapT = THREE.RepeatWrapping; return _bump; }
let _env = null;
/** بيئةُ استوديو (صورةٌ بانوراميّة) تُحوَّلُ تلقائيًّا لكلِّ مُصيِّر؛ تعطي انعكاساتٍ وإضاءةً ناعمة */
export function studioEnv() { if (_env) return _env; const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#c9d3e2'); gr.addColorStop(.45, '#8a93a3'); gr.addColorStop(.55, '#6b6458'); gr.addColorStop(1, '#2e2a26'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  const box = (x, y, w, h, col, blur) => { g.filter = `blur(${blur}px)`; g.fillStyle = col; g.fillRect(x, y, w, h); g.filter = 'none'; };
  box(200, 18, 120, 40, '#ffffff', 6); box(40, 70, 60, 70, '#fff1e0', 8); box(400, 60, 70, 80, '#dfe9ff', 8); box(0, 120, 512, 10, '#f4f4f4', 10);
  _env = new THREE.CanvasTexture(c); _env.mapping = THREE.EquirectangularReflectionMapping; _env.colorSpace = THREE.SRGBColorSpace; return _env; }
export function realRenderer(r) { r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.12; r.outputColorSpace = THREE.SRGBColorSpace; return r; }
export function realScene(scene) { scene.environment = studioEnv(); scene.environmentIntensity = .9; return scene; }

export function mat(color, o = {}) {
  const base = { color, roughness: 0.55, metalness: 0.0, clearcoat: .18, clearcoatRoughness: .45, sheen: .25, sheenRoughness: .6, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .5) };
  if (!o.flatShading && !o.map && !o.vertexColors && o.bump !== false) { base.bumpMap = microBump(); base.bumpScale = .35; }
  const q = Object.assign({}, o); delete q.bump;
  return new THREE.MeshPhysicalMaterial(Object.assign(base, q));
}
export function glass(color, opacity = 0.35, o = {}) {
  return new THREE.MeshPhysicalMaterial(Object.assign({ color, transparent: true, opacity, roughness: 0.12, clearcoat: 1, clearcoatRoughness: .1, depthWrite: false }, o));
}
export function mesh(geo, material, pos, rot, scale) {
  const m = new THREE.Mesh(geo, material);
  if (pos) m.position.set(...pos);
  if (rot) m.rotation.set(...rot);
  if (scale) (typeof scale === 'number') ? m.scale.setScalar(scale) : m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
export function tube(points, r, material, seg = 48, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new THREE.Vector3(...p)));
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, radial, false), material);
  m.castShadow = true; m.userData.curve = curve;
  return m;
}
export function curve(points) {
  return new THREE.CatmullRomCurve3(points.map(p => p.isVector3 ? p : new THREE.Vector3(...p)));
}
export function anchor(parent, pos) {
  const a = new THREE.Object3D(); a.position.set(...pos); parent.add(a); return a;
}
export const V = (x, y, z) => new THREE.Vector3(x, y, z);

// نسيج خلايا مرسوم للطبقات
export function cellTexture(base, line, cols = 8, rows = 8, jitter = 0.25, w = 256, h = 256) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.strokeStyle = line; g.lineWidth = 2;
  const cw = w / cols, ch = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const off = (j % 2) * cw * 0.5;
    const x = i * cw + off + (Math.random() - .5) * cw * jitter, y = j * ch + (Math.random() - .5) * ch * jitter;
    g.beginPath(); g.ellipse(x, y, cw * 0.48, ch * 0.46, 0, 0, Math.PI * 2); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
export function noiseTexture(c1, c2, n = 2500, w = 256, h = 256, size = 5) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.fillStyle = c1; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { g.fillStyle = Math.random() < .5 ? c2 : c1; g.globalAlpha = Math.random() * .5; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, Math.random() * size + 1, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// جسيمات تتحرك على مسارات (ماء، سكر، حبوب لقاح...)
export class Flow {
  constructor(parent, color, radius = 0.04, max = 80) {
    this.items = []; this.parent = parent; this.rate = 1; this.acc = 0; this.on = true;
    this.geo = new THREE.SphereGeometry(radius, 10, 8);
    this.mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.45, roughness: .3 });
    this.max = max; this.paths = [];
  }
  addPath(c, speed = 0.25, weight = 1) { this.paths.push({ c, speed, weight }); return this; }
  spawn() {
    if (!this.paths.length || this.items.length >= this.max) return;
    const tot = this.paths.reduce((s, p) => s + p.weight, 0); let r = Math.random() * tot, p = this.paths[0];
    for (const q of this.paths) { r -= q.weight; if (r <= 0) { p = q; break; } }
    const m = new THREE.Mesh(this.geo, this.mat); m.userData = { p, t: 0 };
    this.parent.add(m); this.items.push(m);
  }
  update(dt) {
    if (this.on) { this.acc += dt * this.rate; while (this.acc > 1) { this.acc -= 1; this.spawn(); } }
    for (let i = this.items.length - 1; i >= 0; i--) {
      const m = this.items[i], u = m.userData; u.t += dt * u.p.speed;
      if (u.t >= 1) { this.parent.remove(m); this.items.splice(i, 1); continue; }
      m.position.copy(u.p.c.getPointAt(u.t));
    }
  }
  clear() { for (const m of this.items) this.parent.remove(m); this.items = []; }
}

export function lerp(a, b, t) { return a + (b - a) * t; }
export function clamp(x, a = 0, b = 1) { return Math.max(a, Math.min(b, x)); }
export function ease(t) { t = clamp(t); return t * t * (3 - 2 * t); }

// ── تضاريس: سطح بارتفاعات وألوان، مع جوانب طبقات ──
export function strataTexture(bands, w = 64, h = 512) {
  // bands: [[color, thickness], ...] من الأسفل إلى الأعلى
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const tot = bands.reduce((s, b) => s + b[1], 0); let y = h;
  for (const [col, t] of bands) { const hh = t / tot * h; g.fillStyle = col; g.fillRect(0, y - hh, w, hh + 1); y -= hh; }
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * .12})`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 8, 1); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; return t;
}
export function terrain({ w, d, nx = 120, nz = 80, h, color, bottom = -2, top = 4, sideTex = null, sideColor = '#8b6a46', sides = [true, true, true, true] }) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, d, nx, nz); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position, cols = new Float32Array(p.count * 3), col = new THREE.Color();
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = h(x, z); p.setY(i, y); col.set(color(x, z, y)); cols.set([col.r, col.g, col.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3)); geo.computeVertexNormals();
  const surf = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, flatShading: false })); surf.receiveShadow = true; g.add(surf);
  const sm = sideTex ? new THREE.MeshStandardMaterial({ map: sideTex, roughness: .95, side: THREE.DoubleSide }) : new THREE.MeshStandardMaterial({ color: sideColor, roughness: .95, side: THREE.DoubleSide });
  const edges = [[-w / 2, -d / 2, w / 2, -d / 2, nx], [w / 2, -d / 2, w / 2, d / 2, nz], [w / 2, d / 2, -w / 2, d / 2, nx], [-w / 2, d / 2, -w / 2, -d / 2, nz]];
  edges.forEach(([x0, z0, x1, z1, n], k) => {
    if (!sides[k]) return; const pos = [], uv = [], idx = [];
    for (let i = 0; i <= n; i++) { const t = i / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t, y = h(x, z); pos.push(x, y, z, x, bottom, z); uv.push(t * 4, (y - bottom) / (top - bottom), t * 4, 0); if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); sg.setIndex(idx); sg.computeVertexNormals();
    g.add(new THREE.Mesh(sg, sm));
  });
  const bot = new THREE.Mesh(new THREE.PlaneGeometry(w, d), sm); bot.rotation.x = Math.PI / 2; bot.position.y = bottom; g.add(bot);
  g.userData.surf = surf; return g;
}
// جسم غير مرئي تقريبًا لتحديد منطقة يمكن لمسها
export function proxy(parent, pos, size, shape = 'sphere') {
  const geo = shape === 'box' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(.5, 20, 14);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  m.position.set(...pos); m.scale.set(...size); parent.add(m); return m;
}
export function smooth(e0, e1, x) { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); }
export function hash2(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
export function vnoise(x, z) { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi; const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
export function fbm(x, z, o = 4) { let s = 0, a = .5, f = 1; for (let i = 0; i < o; i++) { s += a * vnoise(x * f, z * f); a *= .5; f *= 2; } return s; }
const _gc = {}; const _G = (k, f) => _gc[k] || (_gc[k] = f());
export function tree(s = 1, leaf = '#3f8f32', trunk = '#7a5230') {
  const g = new THREE.Group(); const bark = _G('barkM' + trunk, () => tissue(trunk, { kind: 'vein', bumpScale: 2.2, roughness: .9, clearcoat: 0, sheen: 0 }));
  g.add(mesh(_G('trunk', () => vesselGeo([[0, 0, 0], [.02, .3, 0], [-.02, .62, .01]], .1, .055, 16, 10, .08)), bark));
  const lm = (() => new THREE.MeshPhysicalMaterial({ color: leaf, roughness: .75, sheen: .8, sheenColor: new THREE.Color(leaf).lerp(new THREE.Color('#ffffcc'), .5), bumpMap: tissueBump('pore', 4), bumpScale: 3 }))();
  const lm2 = lm.clone(); lm2.color = new THREE.Color(leaf).multiplyScalar(.78);
  const blob = k => _G('crown' + k, () => organGeo(1, v => v.multiplyScalar(1 + fbm3(v.x * 2.3 + k, v.y * 2.3, v.z * 2.3) * .28), 28, 20));
  [[0, .88, 0, .42, 0], [.22, 1.06, .1, .32, 1], [-.2, 1.0, -.08, .3, 2], [.02, 1.2, -.1, .27, 1], [-.08, .82, .22, .26, 2]].forEach(([x, y, z, r, k], i) => g.add(mesh(blob(k), i % 2 ? lm2 : lm, [x, y, z], null, [r, r * .92, r])));
  g.scale.setScalar(s); return g;
}
export function pine(s = 1, leaf = '#2f6e34') { const g = new THREE.Group(); g.add(mesh(_G('ptrunk', () => vesselGeo([[0, 0, 0], [0, .45, 0]], .07, .04, 8, 8, .06)), _G('pbark', () => tissue('#6b4a2e', { kind: 'vein', bumpScale: 2, roughness: .9, clearcoat: 0, sheen: 0 })))); const lm = _G('pleaf' + leaf, () => new THREE.MeshPhysicalMaterial({ color: leaf, roughness: .8, sheen: .6, sheenColor: new THREE.Color('#d8f0c0'), bumpMap: tissueBump('vein', 6), bumpScale: 3 })); for (let i = 0; i < 4; i++) g.add(mesh(_G('pcone' + i, () => { const c = new THREE.ConeGeometry(.4 - i * .08, .5, 20, 6), P = c.attributes.position, v = new THREE.Vector3(); for (let k = 0; k < P.count; k++) { v.fromBufferAttribute(P, k); const r = Math.hypot(v.x, v.z); if (r > .01) { const f = 1 + fbm3(v.x * 6 + i, v.y * 6, v.z * 6) * .25 + Math.sin(Math.atan2(v.z, v.x) * 9) * .06; v.x *= f; v.z *= f; } if (v.y < -.2) v.y -= r * .25; P.setXYZ(k, v.x, v.y, v.z); } c.computeVertexNormals(); return c; }), lm, [0, .5 + i * .26, 0])); g.scale.setScalar(s); return g; }
export function cloud(s = 1, color = '#ffffff') { const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color, roughness: 1, transparent: true, opacity: .93, sheen: 1, sheenColor: new THREE.Color('#ffffff'), depthWrite: false }); const geo = _G('cloud', () => organGeo(1, v => v.multiplyScalar(1 + fbm3(v.x * 2.5, v.y * 2.5, v.z * 2.5) * .18), 32, 22)); for (const [x, y, z, r] of [[0, 0, 0, .7], [.7, -.1, .1, .55], [-.7, -.1, 0, .55], [.3, .35, -.1, .5], [-.3, .3, .1, .5], [1.2, -.2, 0, .4], [-1.2, -.2, -.1, .4]]) g.add(mesh(geo, m, [x, y, z], null, [r, r * .85, r])); g.scale.setScalar(s); g.userData.mat = m; return g; }
export function arrowTube(points, r, color, headLen = .35) {
  const g = new THREE.Group(); const c = curve(points); const m = mat(color, { roughness: .5, emissive: color, emissiveIntensity: .15 });
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, r, 10), m));
  const end = c.getPoint(1), tan = c.getTangent(1); const h = new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, headLen, 16), m); h.position.copy(end); h.quaternion.setFromUnitVectors(V(0, 1, 0), tan); g.add(h);
  g.userData.curve = c; return g;
}
export function house(s = 1) { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(1, .7, .8), mat('#f2efe6'), [0, .35, 0])); const roof = mesh(new THREE.ConeGeometry(.82, .45, 4), mat('#2f7f8a'), [0, .92, 0], [0, Math.PI / 4, 0]); roof.scale.set(1, 1, .85); g.add(roof); g.add(mesh(new THREE.BoxGeometry(.14, .4, .14), mat('#9a5b3a'), [.28, 1.05, 0])); g.add(mesh(new THREE.BoxGeometry(.22, .3, .02), mat('#7a4a2a'), [0, .15, .41])); for (const x of [-.3, .3]) g.add(mesh(new THREE.BoxGeometry(.18, .16, .02), mat('#8ec5e8'), [x, .45, .41])); g.scale.setScalar(s); g.userData.chimney = V(.28 * s, 1.25 * s, 0); return g; }
export function deer(s = 1, c = '#9a6a3d') { const g = new THREE.Group(); const m = mat(c); g.add(mesh(new THREE.CapsuleGeometry(.16, .45, 4, 10), m, [0, .55, 0], [0, 0, Math.PI / 2])); for (const [x, z] of [[-.2, -.08], [-.2, .08], [.2, -.08], [.2, .08]]) g.add(mesh(new THREE.CylinderGeometry(.03, .025, .45, 6), m, [x, .22, z])); g.add(mesh(new THREE.CylinderGeometry(.05, .07, .3, 8), m, [.3, .8, 0], [0, 0, -.6])); g.add(mesh(new THREE.SphereGeometry(.09, 10, 8), m, [.42, .95, 0], null, [1.4, 1, 1])); g.scale.setScalar(s); return g; }

/* ═════════ أدواتُ المجسّماتِ الواقعيّة ═════════ */
const _h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
export function noise3(x, y, z) { const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), fx = x - X, fy = y - Y, fz = z - Z, u = f => f * f * (3 - 2 * f);
  let r = 0; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) r += _h3(X + i, Y + j, Z + k) * (i ? u(fx) : 1 - u(fx)) * (j ? u(fy) : 1 - u(fy)) * (k ? u(fz) : 1 - u(fz)); return r * 2 - 1; }
export const fbm3 = (x, y, z) => noise3(x, y, z) * .6 + noise3(x * 2.1, y * 2.1, z * 2.1) * .28 + noise3(x * 4.3, y * 4.3, z * 4.3) * .12;
const _tex = {};
/** خريطةُ نسيجٍ عضويّ (عروقٌ دقيقةٌ أو مسامّ) */
export function tissueBump(kind = 'vein', seed = 1) { const key = kind + seed; if (_tex[key]) return _tex[key]; const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), img = x.createImageData(S, S), w = 8;
  const T = (a, b, s) => { const P = (p, q) => _h3(((p % w) + w) % w, ((q % w) + w) % w, s); const A = Math.floor(a), B = Math.floor(b), fa = a - A, fb = b - B, ua = fa * fa * (3 - 2 * fa), ub = fb * fb * (3 - 2 * fb); return P(A, B) * (1 - ua) * (1 - ub) + P(A + 1, B) * ua * (1 - ub) + P(A, B + 1) * (1 - ua) * ub + P(A + 1, B + 1) * ua * ub; };
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) { const u = i / S * w, v = j / S * w; let n = T(u, v, seed) * .6 + T(u * 2, v * 2, seed) * .3 + T(u * 4, v * 4, seed) * .1;
    if (kind === 'vein') n = Math.max(n * .7, 1 - Math.abs(T(u * 1.5 % w, v * 1.5 % w, seed + 3) - .5) * 10); if (kind === 'pore') n = n > .62 ? .2 : n;
    const k = (j * S + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = n * 255; img.data[k + 3] = 255; }
  x.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return (_tex[key] = t); }
/** خامةٌ عضويّةٌ رطبة (أنسجة، أعضاء) */
export function tissue(color, o = {}) { return new THREE.MeshPhysicalMaterial(Object.assign({ color, roughness: .38, clearcoat: .7, clearcoatRoughness: .25, sheen: .5, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .55), bumpMap: tissueBump(o.kind || 'vein', o.seed || 1), bumpScale: .8 }, o.kind ? Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'kind' && k !== 'seed')) : o)); }
/** وعاءٌ أو أنبوبٌ عضويٌّ يضيقُ تدريجيًّا */
export function vesselGeo(pts, r0, r1, seg = 60, rad = 14, wob = .05) { const c = new THREE.CatmullRomCurve3(pts.map(p => p.isVector3 ? p : new THREE.Vector3(...p)), false, 'centripetal'); const g = new THREE.TubeGeometry(c, seg, 1, rad, false), P = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) { const t = i / seg, ctr = c.getPointAt(t), r = (r0 + (r1 - r0) * Math.pow(t, .8)) * (1 + wob * Math.sin(t * 37 + r0 * 50));
    for (let j = 0; j <= rad; j++) { const k = i * (rad + 1) + j; v.fromBufferAttribute(P, k).sub(ctr).multiplyScalar(r).add(ctr); P.setXYZ(k, v.x, v.y, v.z); } }
  g.computeVertexNormals(); g.userData = { curve: c }; return g; }
export function vessel(pts, r0, r1, material, seg, rad, wob) { const g = vesselGeo(pts, r0, r1, seg, rad, wob), m = new THREE.Mesh(g, material); m.castShadow = true; m.userData.curve = g.userData.curve; return m; }
/** دمجُ أشكالٍ كثيرةٍ في شكلٍ واحد */
export function mergeGeos(geos) { let n = 0, ni = 0; geos.forEach(g => { if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]); n += g.attributes.position.count; ni += g.index.count; }); const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), idx = new Uint32Array(ni); let o = 0, oi = 0;
  geos.forEach(g => { pos.set(g.attributes.position.array, o * 3); if (!g.attributes.normal) g.computeVertexNormals(); nor.set(g.attributes.normal.array, o * 3); const I = g.index.array; for (let i = 0; i < I.length; i++) idx[oi + i] = I[i] + o; o += g.attributes.position.count; oi += I.length; });
  const G = new THREE.BufferGeometry(); G.setAttribute('position', new THREE.BufferAttribute(pos, 3)); G.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); G.setIndex(new THREE.BufferAttribute(idx, 1)); return G; }
let _rs = 7; export const srnd = () => (_rs = (_rs * 16807) % 2147483647) / 2147483647; export const reseed = s => { _rs = s; };
/** تفرّعاتٌ عضويّة (شعيرات، أعصاب، جذور) تُضافُ إلى قائمةِ أشكال */
export function twigs(list, from, dir, len, r, depth, spread = 1.1, seg = 8) { if (depth <= 0 || r < .004) return; const n = 2 + (srnd() < .4 ? 1 : 0), R = () => new THREE.Vector3(srnd() - .5, srnd() - .5, srnd() - .5);
  for (let i = 0; i < n; i++) { const d = dir.clone().add(R().multiplyScalar(spread)).normalize(), l = len * (.6 + srnd() * .5);
    const mid = from.clone().addScaledVector(d, l * .5).add(R().multiplyScalar(l * .25)), end = from.clone().addScaledVector(d, l);
    list.push(vesselGeo([from, mid, end], r, r * .55, seg, 6)); twigs(list, end, d, len * .7, r * .62, depth - 1, spread, seg); } }
/** شكلٌ كرويٌّ مُشوَّهٌ بدالّة (لصنعِ الأعضاء) */
export function organGeo(r, fn, ws = 64, hs = 48) { const g = new THREE.SphereGeometry(r, ws, hs), P = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); fn(v); P.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }
/** رقمٌ أخضرُ في دائرةٍ صفراء (كما في الكتاب) */
export function badge(n, size = .26, fill = '#ffe94a', ring = '#3cb44a', ink = '#1d6b27') { const cv = document.createElement('canvas'); cv.width = cv.height = 96; const x = cv.getContext('2d'); x.fillStyle = fill; x.beginPath(); x.arc(48, 48, 44, 0, 7); x.fill(); x.lineWidth = 7; x.strokeStyle = ring; x.stroke();
  x.fillStyle = ink; x.font = '700 54px Tahoma'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]), 48, 52);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); sp.scale.setScalar(size); sp.renderOrder = 11; sp.userData.glow = true; return sp; }
/** أسهمٌ متحرّكةٌ على مسار (مخروطاتٌ تنزلق) */
export class ArrowFlow { constructor(parent, paths, color = '#36c24a', size = 1) { this.g = new THREE.Group(); parent.add(this.g); this.items = []; const m = new THREE.MeshPhysicalMaterial({ color, emissive: color, emissiveIntensity: .35, roughness: .3, clearcoat: 1 }); const geo = new THREE.ConeGeometry(.045 * size, .12 * size, 18); geo.rotateX(Math.PI / 2);
    paths.forEach(p => { const c = p.isCurve ? p : new THREE.CatmullRomCurve3(p.map(q => new THREE.Vector3(...q))), L = c.getLength(), n = Math.max(3, Math.round(L / (.22 * size)));
      const line = new THREE.Mesh(new THREE.TubeGeometry(c, 40, .012 * size, 8, false), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .5 })); line.renderOrder = 6; line.userData.glow = true; this.g.add(line);
      for (let i = 0; i < n; i++) { const a = new THREE.Mesh(geo, m); a.renderOrder = 6; a.userData.glow = true; this.g.add(a); this.items.push({ a, c, t: i / n }); } }); }
  update(dt, sp = .25) { if (!this.g.visible) return; const f = new THREE.Vector3(0, 0, 1); for (const it of this.items) { it.t = (it.t + dt * sp) % 1; it.a.position.copy(it.c.getPointAt(it.t)); it.a.quaternion.setFromUnitVectors(f, it.c.getTangentAt(it.t)); it.a.scale.setScalar(Math.min(it.t / .08, (1 - it.t) / .08, 1)); } } }
/** خلايا دمٍ (أقراصٌ مقعّرة) تجري داخلَ أوعية: flows = [{c, r0, r1}] */
export class CellFlow { constructor(parent, flows, color, n) { const g = new THREE.SphereGeometry(1, 16, 10), P = g.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); const r = Math.hypot(v.x, v.z); v.y *= .35 * (.55 + r * r * .9); P.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals();
    this.im = new THREE.InstancedMesh(g, new THREE.MeshPhysicalMaterial({ color, roughness: .3, clearcoat: 1, emissive: color, emissiveIntensity: .4 }), n); this.im.userData.glow = true; this.d = []; this.o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const f = flows[i % flows.length]; this.d.push({ ...f, t: srnd(), off: new THREE.Vector3(srnd() - .5, srnd() - .5, srnd() - .5), rot: new THREE.Euler(srnd() * 6, srnd() * 6, 0), k: .8 + srnd() * .3 }); } parent.add(this.im); }
  update(dt, sp = .5) { if (!this.im.visible) return; const o = this.o; this.d.forEach((d, i) => { d.t = (d.t + dt * sp / d.c.getLength()) % 1; const r = d.r0 + (d.r1 - d.r0) * Math.pow(d.t, .8);
    o.position.copy(d.c.getPointAt(d.t)).addScaledVector(d.off, r * .9); o.rotation.copy(d.rot); o.rotation.x += d.t * 20; o.scale.setScalar(d.hide && d.hide() ? 0 : Math.min(.045, r * .45) * d.k); o.updateMatrix(); this.im.setMatrixAt(i, o.matrix); }); this.im.instanceMatrix.needsUpdate = true; } }
