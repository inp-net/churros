import { builder, log, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';

builder.mutationField('deleteTicket', (t) =>
  t.boolean({
    description:
      'Supprimer un billet. Attention, seul un·e administrateur·ice peut supprimer un billet ayant déjà des réservations',
    args: {
      id: t.arg.id({ description: "L'identifiant du billet" }),
    },
    async authScopes(_, { id }, { user }) {
      const ticket = await prisma.ticket.findUnique({
        where: { id },
        include: { event: { include: { managers: { include: { user: true } } } } },
      });
      if (!ticket) return false;
      return userCanManageEvent(ticket.event, user, { canEdit: true });
    },
    async resolve(_, { id }, { user }) {
      const ticket = await prisma.ticket.delete({ where: { id } });
      await log('events', 'delete-ticket', { ticket }, id, user);
      // Remove ticket groups that are empty
      const deletedTicketGroups = await prisma.ticketGroup.deleteMany({
        where: { eventId: ticket.eventId, tickets: { none: {} } },
      });
      await log('events', 'cleanup-empty-ticket-groups', { deletedTicketGroups }, id, user);
      return true;
    },
  }),
);
