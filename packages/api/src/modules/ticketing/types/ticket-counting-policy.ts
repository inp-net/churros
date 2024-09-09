import { builder } from '#lib';
import { TicketCountingPolicy } from '@churros/db/prisma';

export const TicketCountingPolicyEnum = builder.enumType(TicketCountingPolicy, {
  name: 'TicketCountingPolicy',
  description:
    "Politique de comptage des places pour un billet. Permet de décider quand est-ce que l'on compte un billet dans le calcul des places restantes",
  values: {
    OnBooked: {
      description: "On compte le billet dès qu'il est réservé",
    },
    OnPaid: {
      description: 'On compte le billet seulement une fois payé',
    },
  },
});
