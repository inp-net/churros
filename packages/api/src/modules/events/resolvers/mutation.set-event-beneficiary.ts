import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID } from '#modules/global';

builder.mutationField('setEventBeneficiary', (t) =>
  t.prismaField({
    type: EventType,
    args: {
      event: t.arg({ type: LocalID }),
      lydiaAccount: t.arg({ type: LocalID }),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: {
          id: ensureGlobalId(eventId, 'Event'),
        },
        include: canEditEventPrismaIncludes,
      });

      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      await log('events', 'set-beneficiary', args, args.event, user);
      return prisma.event.update({
        ...query,
        where: { id: ensureGlobalId(args.event, 'Event') },
        data: {
          beneficiary: {
            connect: {
              id: ensureGlobalId(args.lydiaAccount, 'LydiaAccount'),
            },
          },
        },
      });
    },
  }),
);
