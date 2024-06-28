import { builder, prisma, splitID } from '#lib';
import type { ThirdPartyApp as ThirdPartyAppPrisma } from '@churros/db/prisma';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import * as https from 'node:https';
import * as path from 'node:path';
import { ThirdPartyApp } from '../types/third-party-app.js';

builder.objectField(ThirdPartyApp, 'faviconUrl', (t) =>
  t.string({
    async resolve({ website, id, owner }) {
      if (!website) return owner.pictureFile;

      const app = await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });
      if (app.faviconUrl) return app.faviconUrl;
      console.info(`Fetching favicon for ${website}`);
      return fetchFavicon(new URL(website), app);
    },
  }),
);

async function fetchFavicon(website: URL, app: ThirdPartyAppPrisma): Promise<string> {
  const upstreamUrl = new URL(
    `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${website}&size=128`,
  );
  try {
    const faviconUrl = await downloadFavicon(upstreamUrl, app);
    await prisma.thirdPartyApp.update({
      where: { id: app.id },
      data: {
        faviconUrl,
      },
    });
    return faviconUrl;
  } catch {
    return upstreamUrl.toString();
  }
}

/** Download the favicon of the website to /storage/third-party-apps/{id}/logo.png */
async function downloadFavicon(faviconUrl: URL, app: ThirdPartyAppPrisma): Promise<string> {
  const relativePath = path.join('third-party-apps', splitID(app.id)[1], 'logo.png');
  const destination = path.join(new URL(process.env.STORAGE).pathname, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  // Download app.faviconUrl to destination
  https.get(faviconUrl, (response) => {
    const file = createWriteStream(destination);
    response.pipe(file);
    file.on('finish', () => {
      file.close();
    });
  });

  const finalURL = new URL(process.env.PUBLIC_STORAGE_URL);
  finalURL.pathname = path.join(finalURL.pathname, relativePath);
  // Bust cache when website the favicon is from changes
  finalURL.searchParams.set('src', app.website);

  return finalURL.toString();
}
