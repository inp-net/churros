import { areSetsEqual, builder, prisma } from '#lib';
import { EventType } from '../index.js';
// TODO move all permission functions to src/permissions/(module).ts
import { canSeeAllBookings } from '#modules/ticketing/utils';
import type { PromotionType } from '@churros/db/prisma';

builder.prismaObjectField(EventType, 'enabledSpecialOffers', (t) =>
  t.field({
    type: ['PromotionType'],
    nullable: true,
    description:
      "Liste des promotions activées pour tout les billets de l'évènement. Si certains billets ont des promotions activées différentes, renvoie `null`. Si l'évènement n'a pas de billets, renvoie `[]`.",
    authScopes(event, _, { user }) {
      return canSeeAllBookings(event, user);
    },
    async resolve({ id }) {
      const tickets = await prisma.ticket.findMany({
        where: { eventId: id },
        select: {
          subjectToPromotions: {
            select: { type: true },
          },
        },
      });
      // Gather enabled promotion types for each ticket - we use a set because the order doesn't matter
      const promotions: Array<Set<PromotionType>> = [];
      for (const ticket of tickets) 
        promotions.push(new Set(ticket.subjectToPromotions.map((p) => p.type)));
      
      if (promotions.length === 0) 
        return [];
      
      // Check if all tickets have the same promotions
      if (promotions.some((p) => !areSetsEqual(p, promotions[0]!))) 
        return null;
      
      return Array.from(promotions[0]!);
    },
  }),
);
