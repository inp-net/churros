import { builder, prisma } from '#lib';

import { notify } from '#modules/notifications';
import { NotificationChannel } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { GodparentRequestType, fullName, getFamilyTree } from '../index.js';

builder.mutationField('upsertGodparentRequest', (t) =>
  t.prismaField({
    type: GodparentRequestType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      godchildUid: t.arg.string(),
      godparentUid: t.arg.string(),
    },
    authScopes(_, { godchildUid }, { user }) {
      if (godchildUid !== user?.uid) return Boolean(user?.admin || user?.canEditUsers);
      return Boolean(user);
    },
    async resolve(query, _, { id, godparentUid, godchildUid }, { user }) {
      if (!user) throw new GraphQLError('Not logged in');
      const godparent = await prisma.user.findUniqueOrThrow({ where: { uid: godparentUid } });
      const godchild = await prisma.user.findUniqueOrThrow({ where: { uid: godchildUid } });

      const family = await getFamilyTree({ id: godchild.id, godparentId: godparent.id });
      if (family.users.some((u) => u.uid === godparentUid))
        throw new GraphQLError('Acceptance would create a cycle');

      const upsertData = {
        godchild: { connect: { uid: godchildUid } },
        godparent: { connect: { uid: godparentUid } },
      };
      if (!id) {
        await notify([godparent], {
          body: `${fullName(godchild)} veut devenir votre filleul·e !`,
          title: `Demande de parrainage reçue`,
          data: {
            goto: `/users/${godparentUid}/edit`,
            group: undefined,
            channel: NotificationChannel.GodparentRequests,
          },
        });
      }

      const godParentRequest = await prisma.godparentRequest.upsert({
        ...query,
        where: { id: id ?? '' },
        create: upsertData,
        update: upsertData,
      });
      await prisma.logEntry.create({
        data: {
          area: 'godparent-request',
          action: id ? 'update' : 'create',
          target: godParentRequest.id,
          message: `Godparent request ${id ? 'updated' : 'created'}`,
          user: { connect: { id: user.id } },
        },
      });
      return godParentRequest;
    },
  }),
);
