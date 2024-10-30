import { builder, log, objectValuesFlat, prisma, purgeSessionsUser } from '#lib';
import { LocalID } from '#modules/global';
import { queueNotification } from '#modules/notifications';
import { userIsAdminOf } from '#permissions';
import { Event as NotellaEvent } from '@inp-net/notella';
import { fullName, GodparentRequestType } from '../index.js';

builder.mutationField('answerGodparentRequest', (t) =>
  t.prismaField({
    type: GodparentRequestType,
    errors: {},
    description:
      "Deletes a pending godparent request. If accept is true, the request will be accepted (and the godparent of the requester will be changed), otherwise it will be rejected (the godparent of the requester won't be changed)",
    args: {
      id: t.arg({ type: LocalID }),
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
        await purgeSessionsUser(request.godchild.uid);
        await queueNotification({
          body: `${fullName(request.godparent)} a accepté ta demande de parrainage!`,
          title: `Demande de parrainage acceptée!`,
          action: `/${request.godchild.uid}`,
          event: NotellaEvent.GodchildAccepted,
          object_id: request.id,
        });
      } else {
        await queueNotification({
          body: `${fullName(request.godparent)} a refusé ta demande de parrainage.`,
          title: `Demande de parrainage refusée :/`,
          action: `/${request.godchild.uid}`,
          event: NotellaEvent.GodchildRejected,
          object_id: request.id,
        });
      }

      await log(
        'godparent-request',
        'delete',
        { message: `Godparent request ${accept ? 'accepted' : 'rejected'}` },
        request.id,
        request.godparent,
      );

      return request;
    },
  }),
);
