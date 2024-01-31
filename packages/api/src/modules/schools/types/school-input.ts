import { builder } from '#lib'
import {} from '#modules/global'
import {} from '../index.js'

export const SchoolInput = builder.inputType('SchoolInput', {
  fields: (t) => ({
    id: t.id({ required: false }),
    name: t.string(),
    color: t.string(),
  }),
});
