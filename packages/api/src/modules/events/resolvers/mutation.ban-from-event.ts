import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes, EventType } from '#modules/events';
import { LocalID, UIDScalar } from '#modules/global';

builder.mutationField('banFromEvent', (t) =>
  t.prismaField({
    type: EventType,
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
