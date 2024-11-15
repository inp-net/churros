import { browser } from '$app/environment';
import { env } from '$env/dynamic/public';
import { CURRENT_VERSIONS } from '$lib/buildinfo';
import { Capacitor } from '@capacitor/core';
import { z } from 'zod';

export const serverManifestSchema = z.object({
  version: z.string().regex(/^(dev|(\d+\.\d+\.\d+))$/),
  urls: z.object({
    auth: z.string().url(),
    api: z.string().url(),
  }),
  oauth: z
    .object({
      enabled: z.boolean(),
      logoutUrl: z.string().url().optional(),
      authorizeUrl: z.string().url().optional(),
      clientId: z.string().optional(),
      tokenUrl: z.string().url().optional(),
      userInfoUrl: z.string().url().optional(),
      scopes: z.string(),
    })
    .refine(({ enabled, authorizeUrl, clientId, tokenUrl, userInfoUrl }) => {
      if (!enabled) return true;
      return authorizeUrl && clientId && tokenUrl && userInfoUrl;
    }),
  emails: z.object({
    support: z.string().email().optional(),
    contact: z.string().email().optional(),
  }),
});

// if (dev) {
//   const { writeFileSync } = await import('node:fs');
//   const { zodToJsonSchema } = await import('zod-to-json-schema');
//   writeFileSync(
//     '../../server-manifest.schema.json',
//     JSON.stringify(zodToJsonSchema(serverManifestSchema), null, 2),
//   );
// }

const SERVER_MANIFEST_LOCAL_STORAGE_KEY = 'serverManifest';

export type ServerManifest = z.infer<typeof serverManifestSchema>;

export function getServerManifest(): ServerManifest {
  if (!browser) return defaultServerManifest();
  const manifest = localStorage.getItem(SERVER_MANIFEST_LOCAL_STORAGE_KEY);
  const defaultManifest = defaultServerManifest();

  if (!manifest) return defaultManifest;

  try {
    return serverManifestSchema.parse(JSON.parse(manifest));
  } catch (error: unknown) {
    console.error(`Invalid server manifest, falling back to default values: ${error}`);
    localStorage.removeItem(SERVER_MANIFEST_LOCAL_STORAGE_KEY);
    return defaultManifest;
  }
}

function assertApiVersionsCompatible(manifest: ServerManifest) {
  if (CURRENT_VERSIONS.api === 'dev') return;

  const [majorServer] = manifest.version.split('.');
  const [majorClient] = CURRENT_VERSIONS.api.split('.');
  if (majorServer !== majorClient) {
    throw new Error(
      `Ce serveur est à la version ${manifest.version} de l'API de Churros, qui est incompatible avec la tienne (${CURRENT_VERSIONS.api})`,
    );
  }
}

function defaultServerManifest(): ServerManifest {
  const overrides = new Map<string, string>([
    ['web', env.PUBLIC_API_ORIGIN_WEB],
    ['android', env.PUBLIC_API_ORIGIN_ANDROID],
    ['ios', env.PUBLIC_API_ORIGIN_IOS],
  ]);

  const replaceOrigin = (url: string) =>
    url.replace(
      env.PUBLIC_API_ORIGIN_WEB,
      overrides.get(Capacitor.getPlatform()) ?? env.PUBLIC_API_ORIGIN_WEB,
    );

  return {
    version: CURRENT_VERSIONS.api,
    urls: {
      auth: replaceOrigin(env.PUBLIC_API_AUTH_URL),
      api: replaceOrigin(env.PUBLIC_API_URL),
    },
    oauth: {
      enabled: env.PUBLIC_OAUTH_ENABLED === '1',
      logoutUrl: replaceOrigin(env.PUBLIC_OAUTH_LOGOUT_URL),
      authorizeUrl: replaceOrigin(env.PUBLIC_OAUTH_AUTHORIZE_URL),
      clientId: env.PUBLIC_OAUTH_CLIENT_ID,
      tokenUrl: replaceOrigin(env.PUBLIC_OAUTH_TOKEN_URL),
      userInfoUrl: replaceOrigin(env.PUBLIC_OAUTH_USER_INFO_URL),
      scopes: env.PUBLIC_OAUTH_SCOPES,
    },
    emails: {
      support: env.PUBLIC_EMAIL_SUPPORT,
      contact: env.PUBLIC_EMAIL_CONTACT,
    },
  };
}

export function saveServerManifest(manifest: ServerManifest) {
  localStorage.setItem(SERVER_MANIFEST_LOCAL_STORAGE_KEY, JSON.stringify(manifest));
}

/** Get a server manifest from domain/.well-known/churros.app/server.json, and store it in localStorage */
export async function fetchServerManifest(domain: string): Promise<ServerManifest> {
  const response = await fetch(new URL('/.well-known/churros.app/server.json', domain).toString());
  if (!response.ok) throw new Error(`Failed to fetch server manifest: ${response.status}`);
  const manifest = serverManifestSchema.parse(await response.json());
  assertApiVersionsCompatible(manifest);
  return manifest;
}

/** Asks the user to upload a JSON file to set the server manifest manually */
export async function uploadServerManifest(): Promise<ServerManifest> {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.click();

  return new Promise((resolve, reject) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return reject('Aucun fichier sélectionné');

      const reader = new FileReader();
      reader.addEventListener('load', async () => {
        try {
          const manifest = serverManifestSchema.parse(JSON.parse(reader.result as string));
          assertApiVersionsCompatible(manifest);
          resolve(manifest);
        } catch (error: unknown) {
          reject(`Manifeste invalide: ${error}`);
        }
      });
      reader.readAsText(file, 'utf8');
    });
  });
}
