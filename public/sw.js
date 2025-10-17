// Service Worker per notifiche push e funzionalità offline
const CACHE_NAME = 'rapporti-consegne-v1';
const urlsToCache = [
  '/',
  '/rapporto',
  '/admin',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercettazione delle richieste
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Restituisce la risposta dalla cache se disponibile
        if (response) {
          return response;
        }
        // Altrimenti fa la richiesta alla rete
        return fetch(event.request);
      })
  );
});

// Gestione notifiche push
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'È ora di inviare il rapporto giornaliero!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Apri Form',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Chiudi',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Rapporto Giornaliero', options)
  );
});

// Gestione click sulle notifiche
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    // Apre l'app o il form
    event.waitUntil(
      clients.openWindow('/rapporto')
    );
  }
});

// Gestione notifiche di background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sincronizza i dati quando torna online
      console.log('Background sync triggered')
    );
  }
});
