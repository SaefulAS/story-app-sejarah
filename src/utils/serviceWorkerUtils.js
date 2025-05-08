import { urlBase64ToUint8Array } from './urlBase64ToUint8Array';
import { sendSubscriptionToBackend } from './notification';

export const serviceWorkerState = {
    isSubscribed: false,
    hasRefreshed: false
  };

export async function subscribeToPush() {
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
      serviceWorkerState.isSubscribed = false;
    } else {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY),
      });
      
      if (subscription?.getKey('p256dh') && subscription?.getKey('auth')) {
        await sendSubscriptionToBackend(subscription);
        console.log('✅ Subscribed to push notifications');
        serviceWorkerState.isSubscribed = true;
      } else {
        console.error('❌ Subscription keys are missing.');
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Push registration aborted. Possible cause: blocked by browser or invalid VAPID.');
    } else {
      console.error('❌ Unexpected error during push subscription:', error);
    }
  }
}

export function handleServiceWorkerUpdates() {
  navigator.serviceWorker.ready.then((registration) => {
    if (registration.waiting && !serviceWorkerState.hasRefreshed) {
        serviceWorkerState.hasRefreshed = true;
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !serviceWorkerState.hasRefreshed) {
            serviceWorkerState.hasRefreshed = true;
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
}
