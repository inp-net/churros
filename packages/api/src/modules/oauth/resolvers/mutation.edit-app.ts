import { builder, prisma } from '#lib';

import { userCanEditApp } from '#permissions';
import { log } from '../../../lib/logger.js';

// TODO rename update-third-party-app

builder.mutationField('editApp', (t) =>
  t.prismaField({
    description: "Update a third-party app's details",
    type: 'ThirdPartyApp',
    args: {
      id: t.arg.id({
        description: "The app's ID",
      }),
      website: t.arg.string({ required: false }),
      name: t.arg.string({ required: false }),
      description: t.arg.string({ required: false }),
      allowedRedirectUris: t.arg.stringList({
        required: false,
        validate: { items: { url: true } },
      }),
      ownerGroupUid: t.arg.string({ required: false }),
    },
    authScopes: userCanEditApp,
    async resolve(query, _, { id, ...data }, { user }) {
      await log('third-party apps', 'edit', data, id, user);
      const { allowedRedirectUris: oldAllowedRedirectUris, website: oldWebsite } =
        await prisma.thirdPartyApp.findUniqueOrThrow({ where: { id } });

      const allowedURIsWillChange =
        data.allowedRedirectUris !== undefined &&
        data.allowedRedirectUris !== null &&
        !(
          oldAllowedRedirectUris.every((uri) => data.allowedRedirectUris!.includes(uri)) &&
          oldAllowedRedirectUris.length === data.allowedRedirectUris.length
        );

      // eslint-disable-next-line unicorn/no-null
      const websiteWillChange = ![undefined, null, oldWebsite].includes(data.website);

      return prisma.thirdPartyApp.update({
        ...query,
        where: { id },
        data: {
          allowedRedirectUris: data.allowedRedirectUris ?? undefined,
          description: data.description ?? undefined,
          name: data.name ?? undefined,
          website: data.website ?? undefined,
          owner: data.ownerGroupUid ? { connect: { uid: data.ownerGroupUid } } : undefined,
          active: allowedURIsWillChange ? false : undefined,
          faviconUrl: websiteWillChange ? '' : undefined,
        },
      });
    },
  }),
);
