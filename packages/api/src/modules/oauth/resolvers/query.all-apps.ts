import { builder, prisma } from '#lib';
import { ThirdPartyApp, ThirdPartyAppsConnection } from '../index.js';

// TODO rename to all-third-party-apps

builder.queryField('allApps', (t) =>
  t.prismaConnection(
    {
      cursor: 'id',
      description: 'Get all OAuth2 clients. Only admins can do this.',
      type: ThirdPartyApp,
      authScopes: { admin: true },
      args: {
        mine: t.arg.boolean({
          required: false,
          description:
            "Vrai pour renvoyer seulement les applications de l'utilisateur courant, faux pour renvoyer uniquement les autres application, null pour renvoyer tout",
        }),
      },
      resolve: (query, _, { mine }, { user }) =>
        prisma.thirdPartyApp.findMany({
          ...query,
          where:
            mine === null
              ? undefined
              : mine
                ? { ownerId: user?.id }
                : { ownerId: { not: user?.id } },
        }),
    },
    ThirdPartyAppsConnection,
  ),
);
