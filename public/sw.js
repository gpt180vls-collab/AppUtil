// Service Worker para PWA

const CACHE_NAME = 'curso-ai-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
]

// Instalar e cachear recursos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(() => {
        // Ignorar erros de cache em modo offline
      })
    })
  )
  self.skipWaiting()
})

// Ativar e limpar caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Servir do cache quando disponível
self.addEventListener('fetch', event => {
  // Ignorar requisições não-GET
  if (event.request.method !== 'GET') {
    return
  }

  // Ignorar requisições para API (Claude)
  if (event.request.url.includes('api.anthropic.com')) {
    return
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Se encontrar no cache, retornar
      if (response) {
        return response
      }

      // Caso contrário, fazer fetch normal
      return fetch(event.request).then(response => {
        // Não cachear respostas com erro ou não-200
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clonar a resposta para poder usá-la
        const responseToCache = response.clone()

        // Cachear a resposta
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache)
        })

        return response
      }).catch(() => {
        // Se falhar, tentar servir do cache
        return caches.match(event.request)
      })
    })
  )
})
