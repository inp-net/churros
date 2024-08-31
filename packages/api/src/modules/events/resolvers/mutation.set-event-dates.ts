import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { DateRangeInput, LocalID } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('setEventDates', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description: "Définir les dates d'un évènement",
    args: {
      id: t.arg({ type: LocalID }),
      dates: t.arg({
        type: DateRangeInput,
        required: false,
        description: "Dates de l'évènement. Null pour supprimer les dates",
      }),
    },
    async authScopes(_, args, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(args.id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.id, 'Event');
      const { visibility } = await prisma.event.findUniqueOrThrow({
        where: { id },
        select: { visibility: true },
      });
      if (!['Private', 'Unlisted'].includes(visibility) && !args.dates)
        throw new GraphQLError('Seul les évènements privés ou non listés peuvent être sans dates');

      await log('events', 'setDates', { args }, id, user);
      return prisma.event.update({
        ...query,
        where: { id },
        data: args.dates
          ? {
              startsAt: args.dates.start,
              endsAt: args.dates.end,
            }
          : {
              startsAt: null,
              endsAt: null,
            },
      });
    },
  }),
);
