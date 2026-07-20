const CACHE_NAME = "patente-quiz-v1";
const ASSETS_TO_CACHE = [
  "./index.html",
  "./quiz.json",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // картинки знаків (з CDN) — мережа спочатку, кеш як резерв
  if (event.request.url.includes("cdn.jsdelivr.net")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // власні файли сайту — кеш спочатку, мережа як резерв (швидко і працює офлайн)
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
