/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import * as $serviceWorker from '$service-worker';
import type { PushNotification } from '@churros/api/src/modules/notifications/utils/push-notification';
import { UAParser as parseUserAgent } from 'ua-parser-js';
const sw = self as unknown as ServiceWorkerGlobalScope;

// can't import from $env/dynamic/public in service worker
const PUBLIC_STORAGE_URL = `https://${sw.location.hostname}/storage`;

// Create a unique cache name for this deployment
const CACHE = `cache-${$serviceWorker.version}`;

const ASSETS = [
  ...$serviceWorker.build, // the app itself
  ...$serviceWorker.files, // everything in `static`
];

async function log(message: string) {
  const ua = parseUserAgent(sw.navigator.userAgent);
  const messageWithMetadata = `[${new Date(
    Number.parseInt($serviceWorker.version, 10),
  ).toISOString()} on ${ua.device.type ?? 'unknown device type'} ${
    ua.device.model && ua.device.vendor
      ? `${ua.device.vendor} ${ua.device.model}`
      : 'unknown device'
  } ${ua.browser.name ?? 'unknown'}/${ua.browser.version ?? '?'} ${ua.os.name ?? 'unkown OS'}/${
    ua.os.version ?? '?'
  }] ${message}`;
  try {
    await fetch(
      new URL(`../log?message=${encodeURIComponent(messageWithMetadata)}`, PUBLIC_STORAGE_URL),
    );
  } catch (error) {
    console.info(messageWithMetadata);
  }
}

sw.addEventListener('install', async (event) => {
  await log('installed');
  // Create a new cache and add all files to it
  const addFilesToCache = async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  };

  event.waitUntil(addFilesToCache());
});

sw.addEventListener('activate', async (event) => {
  await log('activated');
  // Remove previous cached data from disk
  const deleteOldCaches = async () => {
    for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
  };

  event.waitUntil(deleteOldCaches());
});

const emptyPromise: () => Promise<void> = async () =>
  new Promise((resolve) => {
    resolve();
  });

sw.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      await log('got push');
      if (!event.data || !event.target) return emptyPromise();
      const { image, ...notificationData } = event.data.json() as unknown as PushNotification;
      await log(
        `push data on ${notificationData.data.subscriptionName ?? '(unknown)'} is ${JSON.stringify(
          notificationData,
        )}`,
      );
      return sw.registration.showNotification(notificationData.title, {
        ...notificationData,
        image: image ? `${PUBLIC_STORAGE_URL}${image}` : undefined,
      });
    })(),
  );
});

sw.addEventListener('notificationclick', (clickEvent) => {
  clickEvent.waitUntil(
    (async () => {
      await log('clicked notification');

      const { action, notification } = clickEvent;
      notification.close();

      if (action.startsWith('https://')) await openURL(action);

      const data = notification.data as PushNotification['data'];
      if (data.goto) await openURL(data.goto);
    })(),
  );
});

async function openURL(urlString: string) {
  const windowClients = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of windowClients)
    if (client.url === urlString && 'focus' in client) return client.focus();

  const url = new URL(urlString, sw.location.href);
  url.searchParams.set('utm_source', 'notification');
  if ('openWindow' in sw.clients) return sw.clients.openWindow(url.toString());
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
      if (response !== undefined) return response;
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
