import { urlBase64ToUint8Array } from './urlBase64ToUint8Array';
import { sendSubscriptionToBackend } from './notification';
import { setFlag, getFlag, clearFlag } from './db';

export const serviceWorkerState = {
  isSubscribed: false,
  hasRefreshed: false,
};

export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    const existingSubscription = await registration.pushManager.getSubscription();
    const flagSubscribed = await getFlag('subscribed');

    if (existingSubscription && flagSubscribed) {
      await existingSubscription.unsubscribe();
      await fetch(`${process.env.API_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: existingSubscription.endpoint }),
      });
      await clearFlag('subscribed');
      serviceWorkerState.isSubscribed = false;
    } else {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY),
      });

      if (subscription?.getKey('p256dh') && subscription?.getKey('auth')) {
        await sendSubscriptionToBackend(subscription);
        await setFlag('subscribed', true);
        serviceWorkerState.isSubscribed = true;
      } else {
        console.error('❌ Subscription keys are missing.');
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error during push subscription:', error);
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
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller &&
            !serviceWorkerState.hasRefreshed
          ) {
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
            console.warn(`🧹 Unregistered SW from port ${port}`);
          });
        }
      });
    });
  }
}

export async function syncSubscriptionState() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    serviceWorkerState.isSubscribed = !!subscription;
    return subscription;
  }
  return null;
}
