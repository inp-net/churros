import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import { TicketType } from '#modules/ticketing/types';
import { ticketCanBeSafelyDeleted } from '#modules/ticketing/utils';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('deleteTicket', (t) =>
  t.prismaField({
    type: TicketType,
    errors: {
      types: [Error, ZodError],
      result: {
        fields: (t) => ({
          softDeleted: t.string({
            nullable: true,
            resolve: (_, __, { caveats }) => caveats.at(0) || null,
            description:
              "Message d'explication si le billet n'a pas pu être supprimé mais qu'une autre action a été effectuée à la place",
          }),
        }),
      },
    },
    args: {
      id: t.arg({ type: LocalID }),
      force: t.arg.boolean({
        defaultValue: false,
        description: "Supprimer le billet même s'il existe des réservations",
      }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.ticket
        .findUniqueOrThrow({ where: { id: ensureGlobalId(id, 'Ticket') } })
        .event({ include: canEditEventPrismaIncludes });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { caveats, user }) {
      const id = ensureGlobalId(args.id, 'Ticket');
      if (!args.force && !(await ticketCanBeSafelyDeleted(id))) {
        const { onlyManagersCanProvide } = await prisma.ticket.findUniqueOrThrow({
          where: { id },
          select: {
            onlyManagersCanProvide: true,
          },
        });
        if (onlyManagersCanProvide)
          throw new GraphQLError('Il existe des réservations pour ce billet');

        caveats.unshift(
          'Il existe des réservations pour ce billet. Le billet a été passé en "Managers seulement"',
        );
        await log('tickets', 'delete/soft', args, id, user);
        return prisma.ticket.update({
          ...query,
          where: { id },
          data: {
            onlyManagersCanProvide: true,
          },
        });
      }

      const result = prisma.ticket.delete({
        ...query,
        where: { id },
      });
      await log('tickets', 'delete', { args, result }, id, user);
      return result;
    },
  }),
);
