import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes, EventType } from '#modules/events';
import { LocalID, UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('banFromEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description:
      "Bannir un·e utilisateur·rice d'un événement. Iel ne pourra plus prendre de place (que ce soit pour iel ou pour une autre personne, dans le cas des billets à parrainages)",
    args: {
      id: t.arg({ type: LocalID }),
      user: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, { id, user: userUid }, { user: me }) {
      id = ensureGlobalId(id, 'Event');
      const user = await prisma.user.findUniqueOrThrow({ where: { uid: userUid } });
      const { bannedUsers } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: {
          bannedUsers: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!bannedUsers.some((m) => m.id === user.id) && bannedUsers.length >= 50)
        throw new GraphQLError('Impossible de bannir plus de 50 personnes');

      await log('events', 'ban', { user, id }, id, me);
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          bannedUsers: {
            connect: { id: user.id },
          },
          // Goofy ahh situation
          managers: {
            deleteMany: { userId: user.id },
          },
        },
      });
    },
  }),
);
