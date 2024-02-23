import { builder } from '#lib';

export const TicketGroupInput = builder.inputType('TicketGroupInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    name: t.string(),
    capacity: t.int({ validate: { min: 0 } }),
  }),
});
