// يعمل الكتاب دون إنترنت: كلُّ ملفٍّ يُحفظ في الذاكرة المؤقتة ويُقدَّم منها
const CACHE = 'math6-book-v1';
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./precache.json", "./fonts/tajawal.css", "./index.html", "./js/addons/controls/OrbitControls.js", "./js/app.js", "./js/data.js", "./js/kit.js", "./js/lesson.js", "./js/offline.js", "./js/practice.js", "./js/three.module.min.js", "./lessons/fonts/tajawal.css", "./lessons/index.html", "./lessons/js/algebra.js", "./lessons/js/app.js", "./lessons/js/ch1.js", "./lessons/js/ch2.js", "./lessons/js/ch3.js", "./lessons/js/ch4.js", "./lessons/js/ch5.js", "./lessons/js/engine.js", "./lessons/js/mathkit.js", "./lessons/js/problems.js", "./lessons/js/stats.js", "./lessons/js/toc.js"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(CORE.map(u => c.add(u)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(hit => hit || fetch(r).then(res => {
    if (res && res.ok && new URL(r.url).origin === location.origin) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => r.mode === 'navigate' ? caches.match('./index.html') : Response.error())));
});
