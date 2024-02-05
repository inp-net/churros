import { builder, log, prisma } from '#lib';
import { TicketMove, TicketMoveType } from '../types/ticket-move.js';

builder.mutationField('moveTicket', (t) =>
  t.int({
    directives: {
      rateLimit: {
        duration: 1,
        limit: 5,
      },
    },
    description: 'Déplacer un billet avant ou apès un autre',
    args: {
      eventId: t.arg.id({ description: "identifiant de l'évènement où sont les billets" }),
      uid: t.arg.string({ description: 'uid du billet à déplacer' }),
      other: t.arg.string({ description: "uid de l'autre billet" }),
      move: t.arg({
        type: TicketMoveType,
        description: "Où placer le billet par rapport à l'autre",
      }),
      inside: t.arg.string({
        required: false,
        description: 'uid du groupe de billet dans lequel placer le billet',
      }),
      outside: t.arg.string({
        required: false,
        description: 'uid du groupe de billet duquel sortir le billet',
      }),
    },
    validate({ inside, outside }) {
      return Boolean(!(inside && outside) || (inside && !outside) || (outside && !inside));
    },
    async resolve(_, { uid, other, move, eventId, outside, inside }, { user }) {
      const otherTicket = await prisma.ticket.findFirstOrThrow({
        where: { uid: other, eventId },
      });
      const ticketToMove = await prisma.ticket.findFirstOrThrow({
        where: { uid, eventId },
      });

      await log('events', 'move-ticket', { uid, other, move, eventId }, eventId, user);

      const groupToDisconnect = outside
        ? await prisma.ticketGroup.findFirstOrThrow({ where: { uid: outside } })
        : undefined;
      const groupToConnect = inside
        ? await prisma.ticketGroup.findFirstOrThrow({ where: { uid: inside } })
        : undefined;

      const orderDeltaByMoveType: Record<TicketMove, number> = {
        [TicketMove.MoveAfter]: 1,
        [TicketMove.MoveBefore]: -1,
        [TicketMove.MoveToGroup]: 0,
      };

      const result = await prisma.ticket.update({
        where: { id: ticketToMove.id },
        data: {
          order: otherTicket.order + orderDeltaByMoveType[move],
          group: groupToDisconnect
            ? { disconnect: { id: groupToDisconnect.id } }
            : groupToConnect
              ? { connect: { id: groupToConnect.id } }
              : undefined,
        },
      });

      return result.order;
    },
  }),
);
