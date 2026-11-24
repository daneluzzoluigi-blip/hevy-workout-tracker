/**
 * Service Worker per Hevy Gym Tracker
 * Network-First per HTML/JS/CSS così gli aggiornamenti su iPhone arrivano subito,
 * con fallback automatico offline su cache.
 */

const CACHE_NAME = "hevy-gym-v3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./css/style.css?v=3",
  "./js/data.js?v=3",
  "./js/anatomy.js?v=3",
  "./js/store.js?v=3",
  "./js/timer.js?v=3",
  "./js/charts.js?v=3",
  "./js/app.js?v=3",
  "./manifest.json",
  "./icons/favicon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn("Alcuni file non sono stati pre-caricati nella cache:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Network-first: prende sempre la versione aggiornata quando c'è rete (iPhone PWA),
  // e salva in cache per l'uso offline in palestra.
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
      })
  );
});
