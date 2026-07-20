const CACHE = "smartfarm-shell-v1";
const ASSETS = ["/", "/index.html", "/offline.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() =>
      self.clients.claim()
    )
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          if (req.url.startsWith(self.location.origin)) {
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(async () => {
          if (req.mode === "navigate") {
            const off = await caches.match("/offline.html");
            if (off) return off;
          }
          return caches.match("/index.html");
        });
    })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "smartfarm-sync") {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener("push", (event) => {
  const data = event.data?.text() || "Smart Farm — නව තොරතුරක් 🌾";
  event.waitUntil(self.registration.showNotification("Smart Farm AI", { body: data }));
});
