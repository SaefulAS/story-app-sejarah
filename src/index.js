import './assets/styles/main.css';
import Router from './router';
import { requestNotificationPermission } from './utils/notification';
import { handleServiceWorkerUpdates } from './utils/serviceWorkerUtils';
import { handleSkipLink } from './utils/skipLink';
document.addEventListener('DOMContentLoaded', async () => {
  const swFile =
    process.env.NODE_ENV === 'development'
      ? '/webpush-sw.dev.js'
      : `${process.env.PUBLIC_URL}/webpush-sw.js`;
console.log('Register service worker at:', swFile);

  try {
    await navigator.serviceWorker.register(swFile);
  } catch (err) {
    console.error('❌ Failed to register SW:', err);
  }

  Router();
  window.addEventListener('hashchange', Router);
  handleSkipLink();
  handleServiceWorkerUpdates();

  if ('Notification' in window) {
    requestNotificationPermission();
  }
});
