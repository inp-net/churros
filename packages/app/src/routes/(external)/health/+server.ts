import { CURRENT_VERSION } from '$lib/buildinfo.js';
import { _suscribeWithToken } from '$lib/subscriptions';
import { loadQuery } from '$lib/zeus';
import WebSocket from 'ws';

function PromiseWithTimeout<T>(
  timeout: number,
  callback: (resolve: (value: T) => void, reject: (error: Error) => void) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    // Set up the timeout
    const timer = setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeout} ms`));
    }, timeout);

    // Set up the real work
    callback(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function vibeCheckDatWebsocket() {
  return PromiseWithTimeout(4000, (resolve) => {
    let ok = false;
    _suscribeWithToken(undefined, WebSocket)(
      {
        announcementsNow: {
          __typename: true,
        },
      },
      async (eventData) => {
        try {
          const freshData = await eventData;
          if ('errors' in freshData) return;
          if (!freshData.announcementsNow) return;
          ok = Array.isArray(freshData.announcementsNow);
          resolve(ok);
        } catch {
          resolve(false);
        }
      },
    );
  });
}

export async function GET({ fetch }) {
  const { homepage } = await loadQuery(
    {
      homepage: [{ first: 1 }, { __typename: true }],
    },
    { fetch },
  );

  const checks = {
    app: true,
    api: homepage.__typename === 'QueryHomepageConnection',
    websocket: await vibeCheckDatWebsocket().catch(() => false),
  };

  return new Response(
    JSON.stringify({
      version: CURRENT_VERSION,
      checks,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      status: Object.values(checks).every(Boolean) ? 200 : 500,
    },
  );
}
