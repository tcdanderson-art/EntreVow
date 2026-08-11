const CACHE_NAME = "entrevow-guest-v1";

// Network-first: always try live data, fall back to the last cached copy
// when the venue has no signal. Only ever touches guest-facing URLs.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isGuestUrl = url.pathname.startsWith("/g/") || url.pathname.startsWith("/api/guest/");
  if (event.request.method !== "GET" || !isGuestUrl) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});
