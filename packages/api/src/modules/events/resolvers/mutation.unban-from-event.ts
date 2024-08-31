import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID, UIDScalar } from '#modules/global';
import { ZodError } from 'zod';

builder.mutationField('unbanFromEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description:
      "Débannir un·e utilisateur·rice d'un événement. Si l'utilisateur·ice n'était pas banni·e, cette mutation n'aura aucun effet (mais ne fait pas d'erreur).",
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
      await log('events', 'unban', { user, id }, id, me);
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          bannedUsers: {
            disconnect: { id: user.id },
          },
        },
      });
    },
  }),
);
