import { precacheAndRoute, matchPrecache } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute(self.__WB_MANIFEST);

const url = new URL(self.location.href);
if (url.port !== '7878') {
  console.warn('❌ SW not allowed on this port:', url.port);
  self.skipWaiting();
  self.close();
} else {

  registerRoute(
    ({ request, url }) =>
      request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.hash.startsWith('#'), 
    async ({ event }) => {
      try {
        return await fetch(event.request);
      } catch {
        return await matchPrecache('/offline.html');
      }
    }
  );

  // ⚙️ Cache JS & CSS
  registerRoute(
    ({ request }) => ['script', 'style'].includes(request.destination),
    new StaleWhileRevalidate({ cacheName: 'static-resources' })
  );

  // 🖼️ Cache gambar (di server sendiri)
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'image-cache',
      plugins: [new ExpirationPlugin({ maxEntries: 50 })],
    })
  );

  // 📷 Cache gambar dari story-api (Dicoding)
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

  registerRoute(
    ({ url }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith('/stories'),
    new NetworkFirst({
      cacheName: 'stories-api-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }),
      ],
    })
  );

  // Push Notification
  self.addEventListener('push', (event) => {
    if (event.data) {
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
}

self.addEventListener('message', (event) => {
  const trustedOrigins = [self.location.origin];

  if (!trustedOrigins.includes(event.origin)) {
    console.warn('🚨 Untrusted message origin:', event.origin);
    return;
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
