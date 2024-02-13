import { builder, prisma } from '#lib';
import { LogoScrape } from '@lyuboslavlyubenov/logo-scrape';
import { ThirdPartyApp } from '../index.js';

builder.objectField(ThirdPartyApp, 'faviconUrl', (t) =>
  t.string({
    async resolve({ website, id }) {
      if (!website) return '';

      const app = await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });
      if (app.faviconUrl) return app.faviconUrl;
      console.info(`Fetching favicon for ${website}`);
      // TODO store them locally
      let favicons = (await LogoScrape.getLogos(website).catch((error) => {
        console.error(`While fetching favicon for ${website}:`, error);
        return [];
      })) as Array<{
        url: string;
        size?: `${number}x${number}`;
        type: string;
      }>;
      if (favicons.length === 0) return '';

      const height = (size: string | undefined) => {
        if (typeof size === 'string') return Number.parseFloat(size.split('x')[1] ?? '0');
        return 0;
      };

      favicons.sort((a, b) => height(a?.size) - height(b?.size)).reverse();
      // apple-touch-icon.png is usually non-transparent, so we don't want it
      const noAppleTouchIcons = favicons.filter((f) => !f?.url?.endsWith('apple-touch-icon.png'));
      if (noAppleTouchIcons.length > 0) favicons = noAppleTouchIcons;

      const favicon = favicons[0]!;
      await prisma.thirdPartyApp.update({
        where: { id: app.id },
        data: {
          faviconUrl: favicon.url,
        },
      });
      return favicon.url;
    },
  }),
);
