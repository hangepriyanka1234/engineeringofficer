// Service Worker for Engineering Officer BY MH
// Enables Native Android Heads-Up Notifications, Status Bar Alerts, and PWA Features

const SW_VERSION = 'eo-sw-v1.0.2';
const CACHE_NAME = 'eo-cache-v1';

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event - Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for Push Events from Web Push Server
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Engineering Officer BY MH',
    body: 'नवीन परीक्षा सूचना आणि सराव प्रश्न उपलब्ध!',
    icon: '/icon.svg',
    badge: '/badge.svg',
    tag: 'eo-system-alert',
    url: '/#notifications'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (_err) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const notificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/badge.svg',
    vibrate: [250, 100, 250, 100, 250],
    tag: payload.tag || 'eo-push-' + Date.now(),
    renotify: true,
    requireInteraction: false,
    data: {
      url: payload.url || '/#notifications',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open_app', title: 'उघडा (Open Now)' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, notificationOptions)
  );
});

// Listen for Local Messages from frontend client to trigger instant heads-up notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_SYSTEM_NOTIFICATION') {
    const { title, body, icon, badge, url, tag } = event.data.payload;
    const notificationOptions = {
      body: body || 'नवीन सिव्हिल इंजिनिअरिंग अभ्यास अपडेट उपलब्ध!',
      icon: icon || '/icon.svg',
      badge: badge || '/badge.svg',
      vibrate: [250, 100, 250, 100, 250],
      tag: tag || 'eo-local-' + Date.now(),
      renotify: true,
      requireInteraction: false,
      data: {
        url: url || '/#notifications',
        timestamp: Date.now()
      },
      actions: [
        { action: 'open_app', title: 'उघडा (Open App)' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title || 'Engineering Officer BY MH', notificationOptions)
    );
  }
});

// Handle Notification Clicks (Tapping on the Android notification card)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if ('focus' in client) {
          if (targetUrl) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      // If no window is open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
