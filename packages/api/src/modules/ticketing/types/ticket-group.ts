import { builder } from '#lib';

export const TicketGroupType = builder.prismaNode('TicketGroup', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    eventId: t.exposeID('eventId'),
    event: t.relation('event'),
    capacity: t.exposeInt('capacity'),
    tickets: t.relation('tickets'),
  }),
});
