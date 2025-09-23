const CACHE_NAME = 'perguntados-v1.0.0';
const STATIC_CACHE = 'perguntados-static-v1.0.0';
const DYNAMIC_CACHE = 'perguntados-dynamic-v1.0.0';

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/public/characters/Brain%20Bolt%20Logo.png',
  '/manifest.json',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/questions/,
  /\/api\/profiles/,
  /\/api\/game-sessions/,
  /\/api\/multiplayer/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else if (isAPIRequest(request)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isPageRequest(request)) {
    event.respondWith(handlePageRequest(request));
  } else {
    event.respondWith(handleOtherRequest(request));
  }
});

// Check if request is for static assets
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

// Check if request is for API
function isAPIRequest(request) {
  const url = new URL(request.url);
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Check if request is for a page
function isPageRequest(request) {
  const url = new URL(request.url);
  return url.pathname === '/' || url.pathname.endsWith('.html');
}

// Handle static assets
async function handleStaticAsset(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Error handling static asset', error);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle API requests
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Try network first for API requests
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (networkError) {
      console.log('Service Worker: Network failed, trying cache', networkError);
    }
    
    // Fallback to cache if network fails
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(JSON.stringify({
      error: 'Offline',
      message: 'This feature requires an internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Service Worker: Error handling API request', error);
    return new Response('API not available offline', { status: 503 });
  }
}

// Handle page requests
async function handlePageRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Error handling page request', error);
    // Return offline page
    return caches.match('/index.html');
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Error handling other request', error);
    return new Response('Resource not available offline', { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'game-session-sync') {
    event.waitUntil(syncGameSessions());
  } else if (event.tag === 'multiplayer-sync') {
    event.waitUntil(syncMultiplayerData());
  }
});

// Sync game sessions when back online
async function syncGameSessions() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/game-sessions')) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.error('Service Worker: Failed to sync game session', error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing game sessions', error);
  }
}

// Sync multiplayer data when back online
async function syncMultiplayerData() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/multiplayer')) {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (error) {
          console.error('Service Worker: Failed to sync multiplayer data', error);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Error syncing multiplayer data', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Perguntados!',
    icon: '/public/characters/Brain%20Bolt%20Logo.png',
    badge: '/public/characters/Brain%20Bolt%20Logo.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Jogar Agora',
        icon: '/public/characters/Brain%20Bolt%20Logo.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/public/characters/Brain%20Bolt%20Logo.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Perguntados', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Loaded successfully');
