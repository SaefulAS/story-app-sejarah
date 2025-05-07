import './assets/styles/main.css';
import Router from './router';

import { urlBase64ToUint8Array } from './utils/urlBase64ToUint8Array';
import { sendSubscriptionToBackend, requestNotificationPermission } from './utils/notification';

async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.register('/webpush-sw.js');

    if (!registration.active && registration.installing) {
      registration.installing.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          console.log('✅ Service Worker activated.');
        }
      });
    }

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe();
      await fetch(`${process.env.API_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: existingSubscription.endpoint }),
      });
      console.log('❌ Unsubscribed from push notifications');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY),
    });

    if (subscription?.getKey('p256dh') && subscription?.getKey('auth')) {
      await sendSubscriptionToBackend(subscription);
      console.log('✅ Subscribed to push notifications');
    } else {
      console.error('❌ Subscription keys are missing.');
    }
  } catch (error) {
    console.error('❌ Error during push subscription:', error);
  }
}

let hasRefreshed = false;

navigator.serviceWorker.ready.then((registration) => {
  if (registration.waiting && !hasRefreshed) {
    hasRefreshed = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !hasRefreshed) {
          hasRefreshed = true;
          window.location.reload();
        }
      });
    }
  });
});

if (location.hostname === 'localhost') {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      const port = new URL(registration.scope).port;
      if (port !== '7878') {
        registration.unregister().then(() => {
          console.log(`🧹 Unregistered SW from port: ${port}`);
        });
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  Router();

  // const notificationBtn = document.getElementById('notification-btn');
  // if (notificationBtn) {
  //   notificationBtn.addEventListener('click', async () => {
  //     // Call subscribeToPush to handle subscription logic when the user clicks the bell
  //     await subscribeToPush();
  //     notificationBtn.classList.toggle('active');
  //   });
  // }
  
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    subscribeToPush();
  }

  const skipLink = document.getElementById('skip-link');

  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();

      setTimeout(() => {
        const currentHash = location.hash.slice(1).replace(/^\//, '');
        const targetMap = {
          home: 'stories-section',
          'add-story': 'add-story-skip',
          login: 'login-skip',
          register: 'register-skip',
        };

        const targetId = targetMap[currentHash];
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 100);
    });
  }

  window.addEventListener('hashchange', Router);
});

if ('Notification' in window) {
  requestNotificationPermission();
}
