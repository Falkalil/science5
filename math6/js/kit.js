// أدوات مشتركة لبناء المجسّمات
import * as THREE from 'three';
export { THREE };

export function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6, metalness: 0.0 }, o));
}
export function glass(color, opacity = 0.35, o = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ color, transparent: true, opacity, roughness: 0.2, depthWrite: false }, o));
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
export function tree(s = 1, leaf = '#3f8f32', trunk = '#7a5230') {
  const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.06, .09, .6, 8), mat(trunk), [0, .3, 0]));
  g.add(mesh(new THREE.IcosahedronGeometry(.42, 1), mat(leaf, { flatShading: true }), [0, .85, 0]));
  g.add(mesh(new THREE.IcosahedronGeometry(.3, 1), mat(leaf, { flatShading: true }), [.2, 1.05, .1]));
  g.scale.setScalar(s); return g;
}
export function pine(s = 1, leaf = '#2f6e34') { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(.05, .07, .4, 6), mat('#6b4a2e'), [0, .2, 0])); for (let i = 0; i < 3; i++) g.add(mesh(new THREE.ConeGeometry(.38 - i * .09, .55, 8), mat(leaf, { flatShading: true }), [0, .55 + i * .3, 0])); g.scale.setScalar(s); return g; }
export function cloud(s = 1, color = '#ffffff') { const g = new THREE.Group(); const m = mat(color, { roughness: 1, transparent: true, opacity: .95 }); for (const [x, y, z, r] of [[0, 0, 0, .7], [.7, -.1, .1, .55], [-.7, -.1, 0, .55], [.3, .35, -.1, .5], [-.3, .3, .1, .5], [1.2, -.2, 0, .4], [-1.2, -.2, -.1, .4]]) g.add(mesh(new THREE.SphereGeometry(r, 16, 12), m, [x, y, z])); g.scale.setScalar(s); g.userData.mat = m; return g; }
export function arrowTube(points, r, color, headLen = .35) {
  const g = new THREE.Group(); const c = curve(points); const m = mat(color, { roughness: .5, emissive: color, emissiveIntensity: .15 });
  g.add(new THREE.Mesh(new THREE.TubeGeometry(c, 40, r, 10), m));
  const end = c.getPoint(1), tan = c.getTangent(1); const h = new THREE.Mesh(new THREE.ConeGeometry(r * 2.6, headLen, 16), m); h.position.copy(end); h.quaternion.setFromUnitVectors(V(0, 1, 0), tan); g.add(h);
  g.userData.curve = c; return g;
}
export function house(s = 1) { const g = new THREE.Group(); g.add(mesh(new THREE.BoxGeometry(1, .7, .8), mat('#f2efe6'), [0, .35, 0])); const roof = mesh(new THREE.ConeGeometry(.82, .45, 4), mat('#2f7f8a'), [0, .92, 0], [0, Math.PI / 4, 0]); roof.scale.set(1, 1, .85); g.add(roof); g.add(mesh(new THREE.BoxGeometry(.14, .4, .14), mat('#9a5b3a'), [.28, 1.05, 0])); g.add(mesh(new THREE.BoxGeometry(.22, .3, .02), mat('#7a4a2a'), [0, .15, .41])); for (const x of [-.3, .3]) g.add(mesh(new THREE.BoxGeometry(.18, .16, .02), mat('#8ec5e8'), [x, .45, .41])); g.scale.setScalar(s); g.userData.chimney = V(.28 * s, 1.25 * s, 0); return g; }
export function deer(s = 1, c = '#9a6a3d') { const g = new THREE.Group(); const m = mat(c); g.add(mesh(new THREE.CapsuleGeometry(.16, .45, 4, 10), m, [0, .55, 0], [0, 0, Math.PI / 2])); for (const [x, z] of [[-.2, -.08], [-.2, .08], [.2, -.08], [.2, .08]]) g.add(mesh(new THREE.CylinderGeometry(.03, .025, .45, 6), m, [x, .22, z])); g.add(mesh(new THREE.CylinderGeometry(.05, .07, .3, 8), m, [.3, .8, 0], [0, 0, -.6])); g.add(mesh(new THREE.SphereGeometry(.09, 10, 8), m, [.42, .95, 0], null, [1.4, 1, 1])); g.scale.setScalar(s); return g; }
