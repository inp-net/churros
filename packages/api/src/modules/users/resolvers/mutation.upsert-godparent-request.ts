import { builder, log, objectValuesFlat, prisma } from '#lib';
import { queueNotification } from '#modules/notifications';
import { userIsAdminOf } from '#permissions';
import { Event as NotellaEvent } from '@inp-net/notella';
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
    async authScopes(_, { godchildUid }, { user }) {
      const studentAssociations = objectValuesFlat(
        await prisma.user.findUniqueOrThrow({
          where: { uid: godchildUid },
          select: {
            major: {
              select: {
                schools: {
                  select: {
                    studentAssociations: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      );
      if (godchildUid !== user?.uid) return Boolean(userIsAdminOf(user, studentAssociations));
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
        await queueNotification({
          body: `${fullName(godchild)} veut devenir votre filleul·e !`,
          title: `Demande de parrainage reçue`,
          action: `/users/${godparentUid}/edit/family`,
          object_id: godchild.id,
          event: NotellaEvent.GodchildRequest,
        });
      }

      const godParentRequest = await prisma.godparentRequest.upsert({
        ...query,
        where: { id: id ?? '' },
        create: upsertData,
        update: upsertData,
      });
      await log(
        'godparent-request',
        id ? 'update' : 'create',
        { message: `Godparent request ${id ? 'updated' : 'created'}` },
        godParentRequest.id,
        user,
      );
      return godParentRequest;
    },
  }),
);
