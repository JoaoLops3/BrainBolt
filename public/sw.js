/**
 * BRAIN BOLT - Service Worker Avançado
 * PWA Offline-First com Cache Inteligente
 */

const VERSION = '2.0.0';
const CACHE_PREFIX = 'brainbolt';
const CACHE_NAME = `${CACHE_PREFIX}-v${VERSION}`;
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}`;
const DYNAMIC_CACHE = `${CACHE_PREFIX}-dynamic-v${VERSION}`;
const IMAGE_CACHE = `${CACHE_PREFIX}-images-v${VERSION}`;
const API_CACHE = `${CACHE_PREFIX}-api-v${VERSION}`;

// Cache duration (in milliseconds)
const CACHE_DURATION = {
  static: 30 * 24 * 60 * 60 * 1000,  // 30 dias
  dynamic: 7 * 24 * 60 * 60 * 1000,   // 7 dias
  api: 5 * 60 * 1000,                 // 5 minutos
  images: 30 * 24 * 60 * 60 * 1000,  // 30 dias
};

// Assets estáticos críticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/Brain-Bolt-Logo.png',
  '/manifest.json',
  '/placeholder.svg',
];

// Rotas da API para cache
const API_ROUTES = [
  '/api/profiles',
  '/api/questions',
  '/api/game-sessions',
  '/api/classrooms',
];

// ==================================================
// INSTALL - Cachear assets essenciais
// ==================================================
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing version ${VERSION}...`);

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// ==================================================
// ACTIVATE - Limpar caches antigas
// ==================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith(CACHE_PREFIX) && name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== IMAGE_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activated');
        return self.clients.claim();
      })
  );
});

// ==================================================
// FETCH - Estratégias de cache
// ==================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar chrome extensions e requests externos específicos
  if (url.protocol === 'chrome-extension:' || url.hostname === 'localhost') {
    return;
  }

  // Determinar estratégia baseada no tipo de request
  if (isImageRequest(url)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  } else if (isNavigationRequest(request)) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request, DYNAMIC_CACHE));
  }
});

// ==================================================
// ESTRATÉGIAS DE CACHE
// ==================================================

/**
 * Cache First - Tenta cache primeiro, depois network
 * Ideal para: Imagens, fontes, CSS, JS
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Verificar se o cache ainda é válido
      const cachedDate = new Date(cachedResponse.headers.get('date'));
      const now = new Date();
      const age = now - cachedDate;
      
      if (age < CACHE_DURATION.static) {
        return cachedResponse;
      }
    }

    // Se não há cache ou está expirado, buscar da rede
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Se falhar, tentar retornar do cache mesmo expirado
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar fallback se disponível
    return getOfflineFallback(request);
  }
}

/**
 * Network First - Tenta network primeiro, depois cache
 * Ideal para: API calls, dados dinâmicos
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Serving from cache (offline):', request.url);
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

/**
 * Stale While Revalidate - Serve cache e atualiza em background
 * Ideal para: Conteúdo que pode estar levemente desatualizado
 */
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const networkFetch = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const cache = caches.open(cacheName);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => null);
  
  return cachedResponse || networkFetch;
}

// ==================================================
// HELPERS
// ==================================================

function isImageRequest(url) {
  return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i);
}

function isStaticAsset(url) {
  return url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|otf)$/i);
}

function isAPIRequest(url) {
  return url.pathname.includes('/api/') || 
         url.hostname.includes('supabase.co') ||
         API_ROUTES.some(route => url.pathname.startsWith(route));
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

async function getOfflineFallback(request) {
  if (request.destination === 'document') {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/index.html');
  }
  
  if (isImageRequest(new URL(request.url))) {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/placeholder.svg');
  }
  
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

// ==================================================
// BACKGROUND SYNC
// ==================================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-game-data') {
    event.waitUntil(syncGameData());
  } else if (event.tag === 'sync-profile') {
    event.waitUntil(syncProfile());
  }
});

async function syncGameData() {
  try {
    console.log('[SW] Syncing game data...');
    
    // Buscar dados pendentes do IndexedDB
    const pendingData = await getPendingData('game-sessions');
    
    if (pendingData && pendingData.length > 0) {
      // Enviar para API
      const response = await fetch('/api/game-sessions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingData),
      });
      
      if (response.ok) {
        await clearPendingData('game-sessions');
        console.log('[SW] Game data synced successfully');
        
        // Notificar cliente
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              data: 'game-data',
            });
          });
        });
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync game data:', error);
  }
}

async function syncProfile() {
  try {
    console.log('[SW] Syncing profile...');
    const pendingData = await getPendingData('profile');
    
    if (pendingData) {
      const response = await fetch('/api/profiles/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pendingData),
      });
      
      if (response.ok) {
        await clearPendingData('profile');
        console.log('[SW] Profile synced successfully');
      }
    }
  } catch (error) {
    console.error('[SW] Failed to sync profile:', error);
  }
}

// ==================================================
// PUSH NOTIFICATIONS
// ==================================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {
    title: 'Brain Bolt',
    body: 'Nova notificação!',
    icon: '/Brain-Bolt-Logo.png',
  };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/Brain-Bolt-Logo.png',
    badge: '/Brain-Bolt-Logo.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'open',
        title: 'Abrir',
      },
      {
        action: 'close',
        title: 'Fechar',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// ==================================================
// MESSAGE HANDLER
// ==================================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => {
        return Promise.all(
          names.map((name) => {
            if (name.startsWith(CACHE_PREFIX)) {
              return caches.delete(name);
            }
          })
        );
      })
    );
  }
});

// ==================================================
// INDEXEDDB HELPERS (para Background Sync)
// ==================================================
async function getPendingData(storeName) {
  // TODO: Implementar leitura do IndexedDB
  // Por enquanto retorna null
  return null;
}

async function clearPendingData(storeName) {
  // TODO: Implementar limpeza do IndexedDB
  return;
}

console.log(`[SW] Brain Bolt Service Worker v${VERSION} loaded`);
