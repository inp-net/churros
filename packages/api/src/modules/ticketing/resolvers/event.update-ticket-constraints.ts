import { builder, ensureGlobalId, log, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import { TicketType } from '#modules/ticketing/types';
import { ZodError } from 'zod';
import type { BooleanConstraint } from '../types/boolean-constraint.js';
import { TicketConstraintsInput } from '../types/ticket-constraints-input.js';

builder.mutationField('updateTicketConstraints', (t) =>
  t.prismaField({
    type: TicketType,
    errors: { types: [Error, ZodError] },
    args: {
      ticket: t.arg({ type: LocalID }),
      constraints: t.arg({
        description:
          'Contraintes pour limiter la réservation du billet. Les différentes contraintes sont appliquées avec un “ET logique”: il faut que chacune des contraintes spécificées soient remplies par la personne voulant réserver.',
        type: TicketConstraintsInput,
      }),
    },
    async authScopes(_, { ticket: ticketId }, { user }) {
      const event = await prisma.ticket
        .findUniqueOrThrow({
          where: { id: ensureGlobalId(ticketId, 'Ticket') },
        })
        .event({
          include: canEditEventPrismaIncludes,
        });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.ticket, 'Ticket');
      await log('ticketing', 'update-ticket-constraints', args, id, user);
      const { constraints } = args;
      return prisma.ticket.update({
        ...query,
        where: { id },
        data: {
          openToPromotions: constraints.promotions
            ? {
                set: constraints.promotions,
              }
            : undefined,
          openToAlumni: handleBooleanConstraint(constraints.alumni),
          openToExternal: handleBooleanConstraint(constraints.external),
          openToContributors: handleBooleanConstraint(constraints.studentAssociationContributors),
          openToApprentices: handleBooleanConstraint(constraints.apprentices),
          openToMajors: connectByUID(constraints.majors),
          openToGroups: connectByUID(constraints.groupMembers),
          onlyManagersCanProvide: constraints.managersOnly ?? undefined,
        },
      });
    },
  }),
);

function connectByUID(uids: string[] | undefined | null) {
  if (uids === undefined || uids === null) 
    return;
  
  return {
    set: uids.map((uid) => ({ uid })),
  };
}

/**
 * Converts Only to true, Not to false, DontCare to null and null to undefined
 */
function handleBooleanConstraint(
  constraint: typeof BooleanConstraint.$inferType | null | undefined,
): boolean | null | undefined {
  if (constraint === null || constraint === undefined) 
    return undefined;
  
  return {
    Only: true,
    Not: false,
    DontCare: null,
  }[constraint];
}
