import { env } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';
import * as semver from 'semver';
import { z } from 'zod';

/**
 * @see https://capgo.app/docs/plugin/self-hosted/auto-update/#update-api
 */
const UPDATE_REQUEST_SCHEMA = z
  .object({
    platform: z.enum(['ios', 'android']),
    device_id: z.string().describe('UUID of device, unique by install'),
    app_id: z.string().describe('App ID from Capacitor config'),
    custom_id: z.string().describe('A custom ID, set on the runtime'),
    plugin_version: z.string().describe('Version of @capgo/capacitor-updater'),
    version_build: z.string().describe('Version number from native code'),
    version_code: z.string().describe('Version code from native code'),
    version_name: z.string().describe('Last downloader version, or "builtin"'),
    version_os: z.string().describe('Version of the system OS'),
    is_emulator: z.boolean(),
    is_prod: z.boolean(),
  })
  .partial();

type UpdateRequest = z.infer<typeof UPDATE_REQUEST_SCHEMA>;

export async function POST(event) {
  if (!env.PUBLIC_GITLAB_ORIGIN) {
    return json({
      message: 'No GitLab origin',
      error: 'OTA Updates unavailable',
    });
  }

  if (!env.PUBLIC_GITLAB_PROJECT_ID) {
    return json({
      message: 'No GitLab project ID',
      error: 'OTA Updates unavailable',
    });
  }

  if (!env.PUBLIC_APP_UPDATE_BUNDLE_ASSET_NAME) {
    return json({
      message: 'No update bundle asset name',
      error: 'OTA Updates unavailable',
    });
  }

  let currentVersion = '';
  let log = (message: string) => console.info(`Update request from unknown: ${message}`);
  try {
    const body = await event.request.json();
    const { success, data, error } = UPDATE_REQUEST_SCHEMA.safeParse(body);
    if (!success) {
      log(`Invalid request ${JSON.stringify(body, null, 2)}\n${error}`);
      return json({
        message: error.message,
        error: 'Invalid request',
        version: '',
      });
    }

    log = logger(data);
    log(`Request payload is ${JSON.stringify(data, null, 2)}`);

    if (data.version_name === 'builtin' && data.version_build) {
      log(`Using version_build as current version: ${data.version_build}`);
      currentVersion = data.version_build;
    } else if (data.version_name) {
      log(`Using version_name as current version: ${data.version_name}`);
      currentVersion = data.version_name;
    }

    if (!currentVersion) {
      log(`Missing version_name or version_build: ${JSON.stringify(data, null, 2)}`);
      return json({
        message: 'Missing version_name',
        error: 'Invalid request',
        version: '',
      });
    }
  } catch (error) {
    log(`Unexpected error: ${error?.toString()}`);
    return json({
      message: error?.toString() ?? 'Unexpected error',
      error: 'Invalid request',
      version: '',
    });
  }

  // Get latest release
  // Can't use permalink/latest because the redirected URL does not %-encode slashes in the tag name...
  // TODO: open issue in gitlab (and MR to fix it?)
  let {
    success,
    data: releases,
    error,
  } = await fetch(gitlabProjectAPI('releases?order_by=released_at&sort=desc'))
    .then((res) => res.json())
    .catch((error) => ({
      success: false,
      data: undefined,
      error: { message: error?.toString() ?? '' },
    }))
    .then((data) =>
      z
        .array(
          z.object({
            tag_name: z.string(),
            upcoming_release: z.boolean().optional(),
            assets: z.object({
              links: z.array(
                z.object({
                  url: z.string().url(),
                  name: z.string(),
                }),
              ),
            }),
          }),
        )
        .safeParse(data),
    );

  if (!success) {
    log(`Failed to fetch latest release: ${error!.message}`);
    return json({
      message: error!.message,
      error: 'Failed to fetch latest release',
      version: currentVersion,
    });
  }

  // Keep releases of the @churros/app tag that have a update bundle asset and are native-compatible (i.e. same major version number)
  const candidateReleases = releases?.filter(
    ({ tag_name, assets, upcoming_release }) =>
      // Is not an upcoming release
      !upcoming_release &&
      // Is a release of the app
      tag_name.startsWith(`@churros/app@`) &&
      // Has an update bundle asset, with an HTTPS URL (HTTP won't work for capgo live updater)
      assets.links.some(
        ({ name, url }) =>
          name === env.PUBLIC_APP_UPDATE_BUNDLE_ASSET_NAME && url.startsWith('https://'),
      ) &&
      // Is compatible with the current version
      semver.major(versionFromTagName(tag_name)) === semver.major(currentVersion) &&
      // Is later than the current version
      semver.gt(versionFromTagName(tag_name), currentVersion),
  );

  log(
    `Found ${candidateReleases?.length} candidate releases: ${JSON.stringify(candidateReleases, null, 2)}`,
  );

  // Test candidates until we have one where the asset url is reachable
  let latestCompatibleRelease = candidateReleases?.shift();
  while (latestCompatibleRelease) {
    log(`Testing candidate release ${latestCompatibleRelease.tag_name}`);
    const exists = await fetch(updateBundleAsset(latestCompatibleRelease)?.url!).then(
      (res) => res.ok,
    );
    if (exists) {
      break;
    }
    log(`Update bundle asset not reachable for ${latestCompatibleRelease.tag_name}`);
    latestCompatibleRelease = candidateReleases?.shift();
  }

  log(`Latest compatible release: ${JSON.stringify(latestCompatibleRelease, null, 2)}`);

  if (!latestCompatibleRelease) {
    return json({
      message: 'No compatible update available',
      error: 'No compatible update available',
      version: '',
    });
  }

  const response = {
    version: versionFromTagName(latestCompatibleRelease.tag_name),
    url: updateBundleAsset(latestCompatibleRelease)!.url,
  };

  log(`Sending update bundle ${response.version} at ${response.url}`);
  return json(response);
}

function gitlabProjectAPI(...pathSegments: string[]) {
  return new URL(
    ['/api/v4/projects', env.PUBLIC_GITLAB_PROJECT_ID, ...pathSegments].join('/'),
    env.PUBLIC_GITLAB_ORIGIN,
  ).toString();
}

function updateBundleAsset(release: { assets: { links: Array<{ name: string; url: string }> } }) {
  return release.assets.links.find(({ name }) => name === env.PUBLIC_APP_UPDATE_BUNDLE_ASSET_NAME);
}

function versionFromTagName(tagName: string) {
  return tagName.replace(/^@churros\/app@/, '');
}

function logger(payload: UpdateRequest): (message: string) => void {
  return (message: string) => {
    console.info(
      `Update request from ${payload.app_id} v${payload.version_name} on ${payload.platform}: ${message}`,
    );
  };
}
