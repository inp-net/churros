import { builder, objectValuesFlat, prisma } from '#lib';
import { notify } from '#modules/notifications';
import { userIsAdminOf } from '#permissions';
import { NotificationChannel } from '@churros/db/prisma';
import { fullName } from '../index.js';

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
      const request = await prisma.godparentRequest.findUniqueOrThrow({
        where: { id },
        select: {
          godchildId: true,
          godparentId: true,
          godparent: {
            select: {
              major: {
                select: {
                  schools: {
                    select: {
                      studentAssociations: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!user) return false;
      if (userIsAdminOf(user, objectValuesFlat(request.godparent))) return true;
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
            channel: NotificationChannel.GodparentRequests,
            group: undefined,
          },
        });
      } else {
        await notify([request.godchild], {
          body: `${fullName(request.godparent)} a refusé votre demande de parrainage.`,
          title: `Demande de parrainage refusée :/`,
          data: {
            goto: `/me`,
            channel: NotificationChannel.GodparentRequests,
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
  }),
);
