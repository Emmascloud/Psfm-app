// Deliberately does no caching. This app is backed by live auth and a
// live database — caching pages or API responses risks showing someone
// stale or, worse, another person's data. This worker exists only to
// satisfy "installable web app" checks in Chrome/Android; it passes
// every request straight through to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // no-op: let the browser handle the request normally
});
