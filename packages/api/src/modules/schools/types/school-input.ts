import { builder } from '#lib';

export const SchoolInput = builder.inputType('SchoolInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    name: t.string(),
    color: t.string(),
  }),
});
