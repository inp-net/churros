import { builder, ensureGlobalId, log, prisma, UnauthorizedError } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID, UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('setEventCoOrganizers', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description: "Changer les groupes co-organisateurs d'un événement",
    args: {
      id: t.arg({ type: LocalID }),
      coOrganizers: t.arg({ type: [UIDScalar] }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, { id, coOrganizers }, { user }) {
      id = ensureGlobalId(id, 'Event');
      if (!user) throw new UnauthorizedError();

      const { group } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { group: { select: { uid: true } } },
      });
      if (coOrganizers.includes(group.uid)) {
        throw new GraphQLError(
          `Impossible de définir ${group.uid} comme groupe co-organisateur, car c'est déjà le groupe organisateur principal de l'évènement`,
        );
      }

      await log('events', 'set-co-organizers', { coOrganizers, id }, id, user);
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          coOrganizers: {
            set: coOrganizers.map((uid) => ({ uid })),
          },
        },
      });
    },
  }),
);
