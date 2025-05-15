importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

if (!workbox) {
  console.error('❌ Workbox failed to load.');
} else {
  workbox.setConfig({ debug: false });

  const url = new URL(self.location.href);
  if (url.port !== '7878') {
    console.warn('❌ SW not allowed on this port:', url.port);
    self.skipWaiting();
    self.close();
  }

  // Caching strategi ringan (boleh dipertahankan seperti punyamu sekarang)
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({ cacheName: 'dev-html-cache' })
  );

  // Caching JS/CSS
  workbox.routing.registerRoute(
    ({ request }) => ['script', 'style'].includes(request.destination),
    new workbox.strategies.StaleWhileRevalidate({ cacheName: 'dev-static-resources' })
  );


  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'image-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 50 }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === 'https://story-api.dicoding.dev' &&
      url.pathname.startsWith('/v1/stories'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'dicoding-story-api-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith('/stories'),
    new workbox.strategies.NetworkFirst({
      cacheName: 'stories-api-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({ statuses: [0, 200] }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match('/offline.html'))
      );
    }
  });
  

  self.addEventListener('push', (event) => {
    if (!event.data) return;

    const pushData = event.data.text();
    try {
      const notificationData = JSON.parse(pushData);
      event.waitUntil(
        self.registration.showNotification(notificationData.title || '', {
          ...notificationData.options,
          tag: 'story-push',
          renotify: false,
          requireInteraction: false,
          data: { link: '/#home' },
        })
      );
    } catch (e) {
      event.waitUntil(
        self.registration.showNotification('Notification', {
          body: pushData,
          data: { link: '/#home' },
        })
      );
    }
  });

  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.link || '/#home';

    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url.includes(url) && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
    );
  });

  self.addEventListener('message', (event) => {
    const trustedOrigins = [self.location.origin];
    if (!trustedOrigins.includes(event.origin)) return;

    if (event.data?.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
}
