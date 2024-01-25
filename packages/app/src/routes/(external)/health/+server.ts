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
      async (eventData, close) => {
        try {
          const freshData = await eventData;
          if ('errors' in freshData) {
            console.error(`websocket vibe check: ` + JSON.stringify(freshData.errors));
            close();
            resolve(false);
            return;
          }
          if (!freshData.announcementsNow) {
            console.error(`websocket vibe check: no data for announcementsNow`);
            close();
            resolve(false);
            return;
          }
          ok = Array.isArray(freshData.announcementsNow);
          if (!ok) {
            console.error(
              `websocket vibe check: announcementsNow is not an array, it's ${JSON.stringify(
                freshData.announcementsNow,
              )}`,
            );
          }
          close();
          resolve(ok);
        } catch (error) {
          console.error(`websocket vibe check: error while parsing data: `);
          console.error(error);
          close();
          resolve(false);
        }
      },
    );
  });
}

export async function GET({ fetch }) {
  const { healthcheck: backendChecks } = await loadQuery(
    {
      healthcheck: {
        database: { prisma: true },
        ldap: { internal: true, school: true },
        mail: { smtp: true },
        redis: { publish: true, subscribe: true },
      },
    },
    { fetch },
  ).catch(() => {
    return {
      healthcheck: {
        database: { prisma: false },
        ldap: { internal: false, school: false },
        mail: { smtp: false },
        redis: { publish: false, subscribe: false },
      },
    };
  });

  const checks = {
    app: true,
    websocket: await vibeCheckDatWebsocket().catch((error) => {
      console.error(error);
      return false;
    }),
    // critical checks only for the api health
    api: backendChecks.database.prisma,
    backend: backendChecks,
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
      status: checks.api ? 200 : 500,
    },
  );
}
