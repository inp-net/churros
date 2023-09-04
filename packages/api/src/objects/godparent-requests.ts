import { NotificationType } from '@prisma/client';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { notify } from '../services/notifications.js';
import { DateTimeScalar } from './scalars.js';
import { GraphQLError } from 'graphql';
import { getFamilyTree } from '../godchildren-tree.js';
import { fullName } from './users.js';

export const GodparentRequestType = builder.prismaObject('GodparentRequest', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    godchild: t.relation('godchild'),
    godparent: t.relation('godparent'),
  }),
});

builder.queryField('godparentRequests', (t) =>
  t.prismaField({
    type: [GodparentRequestType],
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin || user?.canEditUsers);
    },
    async resolve(query) {
      return prisma.godparentRequest.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  })
);

builder.queryField('godparentRequest', (t) =>
  t.prismaField({
    type: GodparentRequestType,
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      const request = await prisma.godparentRequest.findUnique({
        where: { id },
      });
      if (!request) return false;
      return Boolean(
        user.admin ||
          user.canEditUsers ||
          [request.godchildId, request.godparentId].includes(user.id)
      );
    },
    async resolve(query, _, { id }) {
      return prisma.godparentRequest.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  })
);

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
            type: NotificationType.GodparentRequestReceived,
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
  })
);

builder.mutationField('deleteGodparentRequest', (t) =>
  t.prismaField({
    type: 'GodparentRequest',
    description:
      "Deletes a pending godparent request. If accept is true, the request will be accepted (and the godparent of the requester will be changed), otherwise it will be rejected (the godparent of the requester won't be changed)",
    args: {
      id: t.arg.id(),
      accept: t.arg.boolean(),
    },
    async authScopes(_, { id, accept }, { user }) {
      if (!user) return false;
      if (user.admin || user.canEditUsers) return true;
      const request = await prisma.godparentRequest.findUnique({
        where: {
          id,
        },
      });
      if (!request) return false;
      if (accept) {
        // Only the godparent can accept requests from godchildren
        return request.godparentId === user.id;
      }

      // Both of them can refuse (/cancel) requests
      return [request.godchildId, request.godparentId].includes(user.id);
    },
    async resolve(_query, _, { id, accept }) {
      const request = await prisma.godparentRequest.delete({
        where: { id },
        include: { godchild: true, godparent: true },
      });
      if (accept) {
        await prisma.user.update({
          where: { id: request.godchildId },
          data: {
            godparent: {
              connect: { id: request.godparentId },
            },
          },
        });
        await notify([request.godchild], {
          body: `${fullName(request.godparent)} a accepté votre demande de parrainage!`,
          title: `Demande de parrainage acceptée!`,
          data: {
            goto: `/me`,
            type: NotificationType.GodparentRequestAccepted,
            group: undefined,
          },
        });
      } else {
        await notify([request.godchild], {
          body: `${fullName(request.godparent)} a refusé votre demande de parrainage.`,
          title: `Demande de parrainage refusée :/`,
          data: {
            goto: `/me`,
            type: NotificationType.GodparentRequestRefused,
            group: undefined,
          },
        });
      }

      await prisma.logEntry.create({
        data: {
          area: 'godparent-request',
          action: 'delete',
          target: request.id,
          message: `Godparent request ${accept ? 'accepted' : 'rejected'}`,
          user: { connect: { id: request.godparentId } },
        },
      });
      return request;
    },
  })
);
