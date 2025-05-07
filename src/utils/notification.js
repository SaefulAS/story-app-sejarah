export async function requestNotificationPermission() {
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

export async function sendSubscriptionToBackend(subscription) {
  if (
    !subscription ||
    !subscription.endpoint ||
    !subscription.getKey('p256dh') ||
    !subscription.getKey('auth')
  ) {
    console.error('Missing subscription data.');
    return;
  }

  const p256dh = btoa(
    String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))
  );
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
        Authorization: `Bearer ${localStorage.getItem('token')}`,
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
