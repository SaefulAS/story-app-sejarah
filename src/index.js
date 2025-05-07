import './assets/styles/main.css';
import Router from './router';

// Fungsi untuk mengonversi VAPID public key ke format Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')  // Mengganti karakter URL-safe menjadi standar
    .replace(/\_/g, '/');  // Mengganti karakter URL-safe menjadi standar

  const rawData = window.atob(base64);  // Meng-decode base64
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

async function requestNotificationPermission() {
  const result = await Notification.requestPermission();
  switch (result) {
    case 'denied':
      console.log('Notification permission denied.');
      break;
    case 'default':
      console.log('Notification permission default action.');
      break;
    case 'granted':
      console.log('Notification permission granted.');
      break;
  }
}

async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.register('/webpush-sw.js');
    console.log('✅ Service Worker registered:', registration);

    if (!registration.active) {
      registration.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          subscribeToPush(); // Retry setelah aktif
        }
      });
      console.log('⏳ Waiting for service worker to activate...');
      return;
    }

    // ⛔ CEK DULU jika sudah pernah subscribe
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('🟡 Unsubscribing from existing push...');
      await existingSubscription.unsubscribe();
    
      // Optional: inform backend untuk hapus endpoint ini
      await fetch(`${process.env.API_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: existingSubscription.endpoint }),
      });
    }    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY),
    });

    console.log('✅ Push Subscription successful:', subscription);

    if (subscription?.getKey('p256dh') && subscription?.getKey('auth')) {
      await sendSubscriptionToBackend(subscription);
    } else {
      console.error('❌ Subscription keys are missing.');
    }
  } catch (error) {
    console.error('❌ Error during push subscription:', error);
  }
}

async function sendSubscriptionToBackend(subscription) {
  if (!subscription || !subscription.endpoint || !subscription.getKey('p256dh') || !subscription.getKey('auth')) {
    console.error('Missing subscription data.');
    return;
  }

  const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh'))));
  const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))));

  const subscriptionData = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh,
      auth,
    },
  };

  try {
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    const data = await response.json();
    if (data.error) {
      console.error('Failed to subscribe to notifications:', data.message);
    } else {
      console.log('Successfully subscribed to notifications:', data);
    }
  } catch (error) {
    console.error('Error sending subscription to backend:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Router();

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('PushManager and ServiceWorker are supported.');
    subscribeToPush();
  } else {
    console.log('PushManager or ServiceWorker is not supported.');
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
