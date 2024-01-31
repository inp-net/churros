import { builder, prisma, removeIdPrefix } from '#lib';
import {} from '#modules/global';
import { LogoScrape } from '@lyuboslavlyubenov/logo-scrape';
import { ThirdPartyCredentialType } from '@prisma/client';
import { CLIENT_SECRET_LENGTH } from '../index.js';

export const ThirdPartyApp = builder.prismaObject('ThirdPartyApp', {
  description: 'A third-party OAuth2 client',
  fields: (t) => ({
    id: t.exposeID('id'),
    clientId: t.string({
      resolve({ id }) {
        return removeIdPrefix(id);
      },
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
    name: t.exposeString('name'),
    secretLength: t.int({
      resolve() {
        return CLIENT_SECRET_LENGTH;
      },
    }),
    usersCount: t.int({
      async resolve({ id }) {
        const tokens = await prisma.thirdPartyCredential.findMany({
          where: {
            clientId: id,
            type: ThirdPartyCredentialType.AccessToken,
            expiresAt: { gt: new Date() },
          },
          select: {
            ownerId: true,
          },
        });
        return new Set(tokens.map((token) => token.ownerId)).size;
      },
    }),
    description: t.exposeString('description'),
    website: t.exposeString('website'),
    active: t.exposeBoolean('active'),
    faviconUrl: t.string({
      async resolve({ website, id }) {
        if (!website) return '';

        const app = await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });
        if (app.faviconUrl) return app.faviconUrl;
        console.info(`Fetching favicon for ${website}`);
        // TODO store them locally
        let favicons = (await LogoScrape.getLogos(website)) as Array<{
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
    allowedRedirectUris: t.exposeStringList('allowedRedirectUris'),
    owner: t.relation('owner'),
  }),
});
