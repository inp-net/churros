import { PUBLIC_STORAGE_URL } from '$env/static/public';
import * as $serviceWorker from '$service-worker';
import type { PushNotification as NotificationData } from '@centraverse/api/src/services/notifications';

// Create a unique cache name for this deployment
const CACHE = `cache-${$serviceWorker.version}`;

const ASSETS = [
  ...$serviceWorker.build, // the app itself
  ...$serviceWorker.files, // everything in `static`
];

self.addEventListener('install', (event) => {
  console.log(event);
  // Create a new cache and add all files to it
  const addFilesToCache = async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  };

  event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
  console.log(event);
  // Remove previous cached data from disk
  const deleteOldCaches = async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
  };

  event.waitUntil(deleteOldCaches());
});

self.addEventListener('push', async (event) => {
  const { image, ...notificationData } = event.data!.json() as unknown as NotificationData;
  const registration = event.target.registration as unknown as ServiceWorkerRegistration;
  await registration.showNotification(notificationData.title, {
    ...notificationData,
    image: image ? `${PUBLIC_STORAGE_URL}${image}` : undefined,
  });
});

self.addEventListener('notificationclick', (clickEvent) => {
  console.log(clickEvent);
  const { action } = clickEvent;
  if (action.startsWith('https://')) clickEvent.waitUntil(clients.openWindow(action));
});

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  const respond = async () => {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) return cache.match(url.pathname);

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      if (response.status === 200) await cache.put(event.request, response.clone());

      return response;
    } catch {
      return cache.match(event.request);
    }
  };

  event.respondWith(respond());
});
