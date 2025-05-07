self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open('story-cache').then(async (cache) => {
      const filesToCache = ['/index.html'];

      for (const file of filesToCache) {
        try {
          await cache.add(file);
          console.log(`✅ Cached: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to cache: ${file}`, error);
        }
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'story-cache') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push event received:', event);

  if (event.data) {
    const pushData = event.data.text();
    console.log('[SW] Received push data as text:', pushData);

    try {
      const notificationData = JSON.parse(pushData);
      console.log('[SW] Push notification data:', notificationData);

      event.waitUntil(
        self.registration.showNotification(
          notificationData.title || '',
          {
            ...notificationData.options,
            tag: 'story-push',
            renotify: false,
            requireInteraction: false,
            data: {
              link: '/#home'
            }
          }
        )
      );
    } catch (e) {
      console.warn('[SW] Failed to parse push data as JSON:', e);
      event.waitUntil(self.registration.showNotification('Notification', {
        body: pushData,
        data: {
          link: '/#home'
        }
      }));
    }
  } else {
    console.log('[SW] No data in push event.');
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.link || '/#home';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
