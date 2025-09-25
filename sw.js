self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: self.SW_APP_VERSION });
  }
});
const CACHE_NAME = 'gh-uni-guide-v6';
self.SW_APP_VERSION = CACHE_NAME;
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/assets/index.js',
  '/assets/index.css',
  '/data/universities.json',
  '/data/programs.json', 
  '/data/requirements.json',
  '/data/scholarships.json',
  '/manifest.json'
];

// Install event - cache all static resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  console.log('[ServiceWorker] Fetch', event.request.url);
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response from cache
        if (response) {
          console.log('[ServiceWorker] Found in cache', event.request.url);
          return response;
        }

        // Cache miss - fetch from network and cache the response
        return fetch(event.request).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      }).catch(() => {
        // If both cache and network fail, show offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Handle background sync for when connectivity returns
self.addEventListener('sync', event => {
  console.log('[ServiceWorker] Background sync', event.tag);
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform any background sync tasks here
      console.log('[ServiceWorker] Background sync completed')
    );
  }
});

// Handle push notifications (if needed later)
self.addEventListener('push', event => {
  console.log('[ServiceWorker] Push received');
  const options = {
    body: 'New university programs available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore Programs',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Ghana University Guide', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/search')
    );
  }
});