import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { DateRangeInput, LocalID } from '#modules/global';
import { TicketType } from '#modules/ticketing/types';
import { isWithinInterval } from 'date-fns';
import { ZodError } from 'zod';

builder.mutationField('createTicket', (t) =>
  t.prismaField({
    type: TicketType,
    errors: { types: [Error, ZodError] },
    description: 'Créer un nouveau billet sur un évènement existant',
    args: {
      event: t.arg({ type: LocalID }),
      shotgun: t.arg({ type: DateRangeInput }),
      name: t.arg.string({ required: false }),
      group: t.arg({
        type: LocalID,
        required: false,
        description: 'Groupe de billet dans lequel mettre ce billet',
      }),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(eventId, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.event, 'Event');
      await log('events', 'create-ticket', args, id, user);
      return prisma.ticket.create({
        ...query,
        data: {
          event: { connect: { id } },
          opensAt: args.shotgun.start,
          closesAt: args.shotgun.end,
          name: args.name ?? '',
          description: '',
          slug: '',
          minimumPrice: 0,
          maximumPrice: 0,
          group: args.group
            ? { connect: { id: ensureGlobalId(args.group, 'TicketGroup') } }
            : undefined,
          // Prevent creating new tickets that become immediately available to anyone with no limits
          onlyManagersCanProvide: isWithinInterval(new Date(), args.shotgun),
        },
      });
    },
  }),
);
