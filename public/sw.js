const CACHE_NAME = 'facility-hub-v1.0.0';
const urlsToCache = [
  '/',
  '/dashboard',
  '/devices',
  '/rooms',
  '/tasks',
  '/documents',
  '/import',
  '/notifications',
  '/analytics',
  '/qr-generator',
  '/manifest.json',
  // Add static assets
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Sync offline data when connection is restored
      syncOfflineData()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Bạn có thông báo mới từ Facility Hub',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Xem',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Đóng',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Facility Hub', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  }
});

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB or localStorage
    const offlineData = localStorage.getItem('offline-actions');
    if (offlineData) {
      const actions = JSON.parse(offlineData);
      // Process offline actions when online
      for (const action of actions) {
        await processOfflineAction(action);
      }
      // Clear offline data after sync
      localStorage.removeItem('offline-actions');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function processOfflineAction(action) {
  // Process different types of offline actions
  switch (action.type) {
    case 'CREATE_DEVICE':
      // Handle device creation
      break;
    case 'UPDATE_DEVICE':
      // Handle device update
      break;
    case 'CREATE_WORK_ORDER':
      // Handle work order creation
      break;
    default:
      console.log('Unknown offline action:', action);
  }
}
