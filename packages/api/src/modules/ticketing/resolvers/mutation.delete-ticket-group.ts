import { builder, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';

builder.mutationField('deleteTicketGroup', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    async authScopes(_, { id }, { user }) {
      // Make sure that the tickets added to that group all exists and are part of events managed by the user
      const ticketGroup = await prisma.ticketGroup.findFirst({
        where: { id },
        include: {
          event: {
            include: {
              managers: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!ticketGroup) return false;

      return userCanManageEvent(ticketGroup.event, user, {
        canEdit: true,
      });
    },
    async resolve(_, { id }) {
      await prisma.ticketGroup.delete({ where: { id } });
      return true;
    },
  }),
);
