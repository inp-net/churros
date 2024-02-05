import { builder } from '#lib';

export enum TicketMove {
  MoveAfter,
  MoveBefore,
  MoveToGroup,
}

export const TicketMoveType = builder.enumType(TicketMove, {
  name: 'TicketMove',
  values: {
    MoveAfter: { description: 'placer après un autre billet' },
    MoveBefore: { description: 'placer avant un autre billet' },
  },
});
