// Service Worker per notifiche push e funzionalità offline
const CACHE_NAME = 'rapport-consegne-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/install',
  '/icon-192x192.png',
  '/icon-512x512.png'
]

// Installazione del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error)
      })
  )
  self.skipWaiting()
})

// Attivazione del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Intercetta le richieste di rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - restituisci la risposta dalla cache
        if (response) {
          return response
        }

        // Clone della richiesta
        const fetchRequest = event.request.clone()

        return fetch(fetchRequest).then((response) => {
          // Controlla se è una risposta valida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }

          // Clone della risposta
          const responseToCache = response.clone()

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache)
            })

          return response
        })
      })
      .catch(() => {
        // Se offline, mostra una pagina di fallback
        return caches.match('/')
      })
  )
})

// Gestione delle notifiche push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')

  let data = {
    title: 'Rapport Consegne',
    body: 'Hai una nuova notifica',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: {}
  }

  if (event.data) {
    try {
      const pushData = event.data.json()
      data = { ...data, ...pushData }
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: true,
    tag: 'rapport-notification'
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Gestione del click sulla notifica
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Cerca una finestra già aperta
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }

        // Se non c'è una finestra aperta, aprila
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Gestione della chiusura della notifica
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notification closed', event.notification.tag)
})

// Background Sync per invio rapporti offline
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sync event', event.tag)
  
  if (event.tag === 'sync-rapporti') {
    event.waitUntil(syncRapporti())
  }
})

// Funzione per sincronizzare i rapporti salvati offline
async function syncRapporti() {
  try {
    // Apri il database IndexedDB (da implementare se necessario)
    console.log('Service Worker: Syncing rapporti...')
    
    // Qui potresti recuperare i rapporti salvati offline
    // e inviarli al server quando la connessione è ristabilita
    
    return Promise.resolve()
  } catch (error) {
    console.error('Service Worker: Sync failed', error)
    return Promise.reject(error)
  }
}

// Gestione messaggi dal client
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CHECK_ALARMS') {
    // Trigger check allarmi
    fetch('/api/alarms/check', { method: 'POST' })
      .then(response => response.json())
      .then(data => {
        console.log('Service Worker: Alarms checked', data)
      })
      .catch(error => {
        console.error('Service Worker: Alarm check failed', error)
      })
  }
})

console.log('Service Worker: Loaded successfully')
