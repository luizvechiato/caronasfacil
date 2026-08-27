// Caronas Fácil — Service Worker v1.0
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyBLiObW7HniFnJGcGt5xPFQNdtSXuZxQjw",
  authDomain:        "caronas-lhpv.firebaseapp.com",
  databaseURL:       "https://caronas-lhpv-default-rtdb.firebaseio.com",
  projectId:         "caronas-lhpv",
  storageBucket:     "caronas-lhpv.firebasestorage.app",
  messagingSenderId: "159548357201",
  appId:             "1:159548357201:web:91b0a892071daef103d670"
});

// Recebe pushes do FCM quando o app está fechado/em background
try {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || payload?.data?.title || 'Caronas Fácil';
    const body  = payload?.notification?.body  || payload?.data?.body  || '';
    const url   = payload?.data?.url || '/index.html';
    self.registration.showNotification(title, {
      body,
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      data: { url }
    });
  });
} catch (e) { /* messaging indisponível (ex: navegador sem suporte) */ }

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || '/index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) { if (c.url.includes(url) && 'focus' in c) return c.focus(); }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

const CACHE = 'caronas-v1';
const ASSETS = [
  '/index.html',
  '/event.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first para Firebase/APIs, cache-first para assets estáticos
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Ignora Firebase, analytics e cross-origin
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('google') ||
      url.hostname.includes('gstatic') ||
      url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
