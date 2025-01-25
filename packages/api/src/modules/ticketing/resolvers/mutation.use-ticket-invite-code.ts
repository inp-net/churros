import { builder, log, prisma, UnauthorizedError } from '#lib';
import { EventType } from '#modules/events';

builder.mutationField('useTicketInviteCode', (t) =>
  t.prismaField({
    type: EventType,
    errors: {},
    description: "Utiliser un code d'invitation pour gagner accès à un billet",
    args: {
      code: t.arg.string(),
    },
    authScopes: { loggedIn: true },
    async resolve(query, _, { code }, { user }) {
      if (!user) throw new UnauthorizedError();

      const ticket = await prisma.ticket.findUnique({ where: { inviteCode: code } });
      if (!ticket) throw new Error(`Code d'invitation "${code}" invalide`);

      const event = await prisma.ticket
        .update({
          where: { inviteCode: code },
          data: {
            invited: { connect: { id: user.id } },
          },
        })
        .event(query);
      await log('ticketing', 'use-ticket-invite', { code, event }, event.id, user);
      return event;
    },
  }),
);
