import { getFlag } from './db';
import {
  subscribeToPush,
  serviceWorkerState,
  syncSubscriptionState,
} from './serviceWorkerUtils';

export async function initNotificationButton() {
  const notificationBtn = document.getElementById('notification-btn');
  if (!notificationBtn) return;

  const subscription = await syncSubscriptionState();
  const wasSubscribed = await getFlag('subscribed');

  if (subscription && wasSubscribed) {
    serviceWorkerState.isSubscribed = true;
    notificationBtn.classList.add('active');
  } else {
    serviceWorkerState.isSubscribed = false;
    notificationBtn.classList.remove('active');
  }

  console.log('🔔 Notification button found');
  notificationBtn.addEventListener('click', async () => {
    console.log('🔔 Notification button clicked');
    await subscribeToPush();
    notificationBtn.classList.toggle('active', serviceWorkerState.isSubscribed);
  });
}
