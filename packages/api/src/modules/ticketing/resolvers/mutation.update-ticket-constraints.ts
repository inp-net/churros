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
    errors: {
      types: [Error, ZodError],
      result: {
        fields: (t) => ({
          constraintsWereSimplified: t.string({
            nullable: true,
            description:
              "Les contraintes de billet n'ont pas été enregistrées tel quel mais on été simplifiées. La valeur est un message d'explication.",
            resolve: (_, __, { caveats }) => caveats.at(0) || null,
          }),
        }),
      },
    },
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
    async resolve(query, _, args, { user, caveats }) {
      const id = ensureGlobalId(args.ticket, 'Ticket');
      await log('ticketing', 'update-ticket-constraints', args, id, user);
      const { constraints } = args;
      const ticket = await prisma.ticket.update({
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

      // Some de-duplication logic here:
      // If we don't allow external users, and
      // the openToMajors constraint is exactly all majors of the organizer group's school,
      // the openToMajors constraint is redundant: the fact that we don't allow external users already restricts to the group's school
      if (constraints.majors || constraints.external) {
        const schoolOfEvent = await prisma.ticket
          .findUniqueOrThrow({
            where: { id },
          })
          .event()
          .group()
          .studentAssociation()
          .school({
            include: { majors: true },
          });

        const { openToMajors } = await prisma.ticket.findUniqueOrThrow({
          where: { id },
          select: {
            openToMajors: { select: { id: true, schools: true } },
          },
        });

        // All openToMajors' majors are in the event's school, and openToMajors includes all majors of the school
        if (
          schoolOfEvent.majors
            .filter((m) => !m.discontinued)
            .every((major) => openToMajors.some((m) => m.id === major.id)) &&
          openToMajors.every((major) =>
            major.schools.some((school) => school.id === schoolOfEvent.id),
          )
        ) {
          caveats.unshift(
            `La contrainte sur les filières a été supprimée car redondante: vu que les extés ne sont pas autorisés, il y a déjà limitation à ${schoolOfEvent.name}`,
          );
          return prisma.ticket.update({
            ...query,
            where: { id },
            data: {
              openToMajors: {
                set: [],
              },
            },
          });
        }
      }
      return ticket;
    },
  }),
);

function connectByUID(uids: string[] | undefined | null) {
  if (uids === undefined || uids === null) return;

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
  if (constraint === null || constraint === undefined) return undefined;

  return {
    Only: true,
    Not: false,
    DontCare: null,
  }[constraint];
}
