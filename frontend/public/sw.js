// Service worker de la PWA. Sin él Chrome no ofrece instalar la web y, instalada, abriría en blanco
// sin conexión. Es deliberadamente corto: solo guarda lo que no cambia sin cambiar de nombre.
//
// - /assets/* (JS, CSS e imágenes con hash en el nombre): caché primero, nunca caducan.
// - Navegación: red primero, pero con un límite de 3 s: si la red tarda (el arranque en frío de una app
//   instalada en el iPhone) o no hay red, se abre la última portada guardada, y la red actualiza la copia.
// - /api/ y /posts/ no se tocan: el contenido del CMS debe verse siempre al día.
// v2: al subir de versión el service worker nuevo borra la caché anterior (activate).
const CACHE = 'valle-del-bucle-v2'
const NAVIGATION_TIMEOUT_MS = 3000
const SHELL = '/'
const DEV_HOSTS = ['localhost', '127.0.0.1', '[::1]']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function networkFirstShell(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(SHELL)
  // La SPA sirve el mismo index.html en todas las rutas: se guarda una sola copia
  const network = fetch(request).then((response) => {
    if (response.ok) cache.put(SHELL, response.clone())
    return response
  })
  // Sin copia guardada no hay alternativa: se espera a la red.
  if (!cached) return network
  // Con copia, la red tiene un tiempo; si se pasa (o falla), se abre la copia y la red sigue actualizándola.
  network.catch(() => {})
  const timeout = new Promise((resolve) => setTimeout(() => resolve(cached), NAVIGATION_TIMEOUT_MS))
  return Promise.race([network, timeout]).catch(() => cached)
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  // En desarrollo se deja pasar todo a la red: Vite ya gestiona su propia caché y HMR
  if (DEV_HOSTS.includes(url.hostname)) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstShell(request))
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request))
  }
})
