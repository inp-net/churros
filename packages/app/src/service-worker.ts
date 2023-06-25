/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import * as $serviceWorker from '$service-worker';
const sw = self as unknown as ServiceWorkerGlobalScope;

// can't import from $env/static/public in service worker
const PUBLIC_STORAGE_URL = /* @generated */ 'http://localhost:4000/storage/';

// Create a unique cache name for this deployment
const CACHE = `cache-${$serviceWorker.version}`;

const ASSETS = [
  ...$serviceWorker.build, // the app itself
  ...$serviceWorker.files, // everything in `static`
];

sw.addEventListener('install', async (event) => {
  await fetch(
    new URL(`../log?message=installed-version-${$serviceWorker.version}`, PUBLIC_STORAGE_URL)
  );
  console.log(event);
  // Create a new cache and add all files to it
  const addFilesToCache = async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  };

  event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', (event) => {
  console.log(event);
  // Remove previous cached data from disk
  const deleteOldCaches = async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
  };

  event.waitUntil(deleteOldCaches());
});

sw.addEventListener('push', async (event) => {
  if (!event.data || !event.target) return;
  console.log('logging to server');
  await fetch(
    new URL(
      `../log?message=${encodeURIComponent(`got-push-${JSON.stringify(event.data.json())}`)}`,
      PUBLIC_STORAGE_URL
    )
  );
  console.log('log done');
  const { image, ...notificationData } = event.data.json() as unknown as NotificationOptions & {
    title: string;
  };
  event.waitUntil(
    sw.registration.showNotification(notificationData.title, {
      ...notificationData,
      image: image ? `${PUBLIC_STORAGE_URL}${image}` : undefined,
    })
  );
});

sw.addEventListener('notificationclick', (clickEvent) => {
  console.log(clickEvent);
  const { action } = clickEvent;
  if (action.startsWith('https://')) clickEvent.waitUntil(openURL(action));
});

async function openURL(url: string) {
  const windowClients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of windowClients)
    if (client.url === url && 'focus' in client) return client.focus();

  if ('openWindow' in sw.clients) return sw.clients.openWindow(url);
}

sw.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  const respond = async () => {
    const url = new URL(event.request.url);
    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);
      if (response === undefined) throw new Error('Cache miss in build or files');
      return response;
    }

    // for everything else, try the network first, but
    // fall back to the cache if we're offline
    try {
      const response = await fetch(event.request);

      if (response.status === 200) await cache.put(event.request, response.clone());

      return response;
    } catch {
      const response = await cache.match(event.request);
      if (response === undefined) throw new Error('Cache miss');
      return response;
    }
  };

  event.respondWith(respond());
});
