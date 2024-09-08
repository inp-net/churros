import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import { TicketGroupType } from '../index.js';

builder.mutationField('upsertTicketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    errors: {},
    args: {
      id: t.arg({ type: LocalID, required: false }),
      name: t.arg.string({ required: false }),
      capacity: t.arg.int({ validate: { min: 0 }, required: false }),
      event: t.arg({ type: LocalID, required: false, description: "Ne sert qu'à la création." }),
    },
    validate: [
      [
        ({ event, id }) => Boolean(event || id),
        { message: "L'évènement ou l'identifiant du groupe de billets est requis" },
      ],
      [
        ({ id, name, capacity }) => Boolean(id || (name !== null && capacity !== null)),
        { message: 'Il faut préciser la capacité du groupe et le nom pour le créer' },
      ],
    ],
    async authScopes(_, args, { user }) {
      if (
        args.event &&
        !canEditEvent(
          await prisma.event.findUniqueOrThrow({
            where: {
              id: ensureGlobalId(args.event, 'Event'),
            },
            include: canEditEventPrismaIncludes,
          }),
          user,
        )
      )
        return false;

      if (args.id) {
        return canEditEvent(
          await prisma.ticketGroup
            .findUniqueOrThrow({
              where: { id: ensureGlobalId(args.id, 'TicketGroup') },
            })
            .event({
              include: canEditEventPrismaIncludes,
            }),
          user,
        );
      }

      return true;
    },
    async resolve(query, _, args, { user }) {
      await log('ticketing', 'upsert-ticket-group', args, args.id, user);
      if (args.id) {
        return prisma.ticketGroup.update({
          ...query,
          where: {
            id: ensureGlobalId(args.id, 'TicketGroup'),
          },
          data: {
            name: args.name ?? undefined,
            capacity: args.capacity ?? undefined,
          },
        });
      }

      return prisma.ticketGroup.create({
        ...query,
        data: {
          eventId: ensureGlobalId(args.event!, 'Event'),
          name: args.name!,
          capacity: args.capacity!,
        },
      });
    },
  }),
);
