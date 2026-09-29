// Offline support: keeps a copy of the app and the Folios on the phone.
// On every release: bump the number here AND the ?v= on style.css and app.js in index.html.
const VERSION = 'retia-4';
const SHELL = [
  './', 'index.html', 'style.css?v=4', 'app.js?v=4', 'manifest.webmanifest',
  'assets/splash.jpg', 'assets/icon-192.png', 'assets/icon-512.png', 'assets/apple-touch-icon.png', 'assets/icon-32.png',
];
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', (event) => {
  // cache: 'reload' skips the browser's short-term copy so a new version really gets the new files
  const requests = SHELL.map((u) => new Request(u, { cache: 'reload' }));
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(requests)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname === 'api.github.com') return; // the app keeps its own copy of the Folio list

  const sameSite = url.origin === self.location.origin;
  if (sameSite && url.pathname.includes('/packs/')) {
    event.respondWith(networkFirst(req)); // new Folio text when online, saved copy when not
  } else if (sameSite || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirstThenUpdate(req)); // open instantly, refresh in the background
  }
});

async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS)),
    ]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (e) {
    const saved = await cache.match(req, { ignoreSearch: true });
    if (saved) return saved;
    throw e;
  }
}

async function cacheFirstThenUpdate(req) {
  const cache = await caches.open(VERSION);
  const saved = await cache.match(req, { ignoreSearch: true });
  const fresh = fetch(req)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
      return res;
    })
    .catch(() => saved);
  return saved || fresh;
}
