import './assets/styles/main.css';
import Router from './router';
import { subscribeToPush, handleServiceWorkerUpdates, serviceWorkerState } from './utils/serviceWorkerUtils';
document.addEventListener('DOMContentLoaded', async () => {
  Router();

  setTimeout(() => {
    const notificationBtn = document.getElementById('notification-btn');
    if (notificationBtn) {
      console.log('Notification button found!');
      notificationBtn.addEventListener('click', async () => {
        console.log('Notification button clicked!');
        await subscribeToPush();
        notificationBtn.classList.toggle('active', serviceWorkerState.isSubscribed);
      });
    } else {
      console.error('Notification button not found!');
    }
  }, 100); // Wait 100ms to ensure DOM elements are fully loaded

  if ('serviceWorker' in navigator && 'PushManager' in window) {
    // Optional: Check if user is already subscribed on load
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      serviceWorkerState.isSubscribed = true;
    }
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

  handleServiceWorkerUpdates();
  if ('Notification' in window) {
    requestNotificationPermission();
  }
});
