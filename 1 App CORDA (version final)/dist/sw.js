// CORDA · Service worker mínimo.
// Hace que la app se pueda instalar y muestra los avisos que llegan al teléfono (push).
// No guarda datos de la cuenta: todo lo que no sea la portada va directo a la red.
const SHELL = 'corda-shell-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== SHELL) await caches.delete(k);
    await self.clients.claim();
  })());
});
// Red primero. Si no hay internet y es una navegación, se muestra la última portada guardada.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        const copy = res.clone(); caches.open(SHELL).then(c => c.put('/shell', copy)).catch(() => {});
        return res;
      } catch {
        return (await caches.match('/shell')) || new Response('Sin conexión. Vuelve a abrir CORDA cuando tengas internet.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
  }
});

// ---------- Avisos al teléfono ----------
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: 'CORDA', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'CORDA', {
    body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag,
    icon: '/assets/icons/icon-192.png', badge: '/assets/icons/icon-192.png',
    data: { url: d.url || '/' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil((async () => {
    const wins = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if ('focus' in w) { await w.focus(); w.postMessage({ type: 'aviso', url }); return; }
    }
    return clients.openWindow(url);
  })());
});
