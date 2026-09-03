const CACHE_NAME = 'bible-tracker-v1.1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// 1. Установка: кэшируем ресурсы и сразу просим SW вступить в силу
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Активация: удаляем старые версии кэша и захватываем управление
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Перехват запросов
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Игнорируем API GitHub, чтобы запросы синхронизации всегда шли напрямую в сеть
  if (url.origin.includes('api.github.com')) {
    return;
  }

  // Стратегия Cache First для локальных статических ресурсов
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request);
    })
  );
});