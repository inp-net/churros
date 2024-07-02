import { builder } from '#lib';

// TODO move to ticketing module once mutation.upsert-event has been split
export const TicketGroupInput = builder.inputType('TicketGroupInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    name: t.string(),
    capacity: t.int({ validate: { min: 0 } }),
  }),
});
