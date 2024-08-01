import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { isBefore } from 'date-fns';

export const DateRangeInput = builder.inputType('DateRangeInput', {
  description: 'Un intervalle valide de dates',
  fields: (t) => ({
    start: t.field({ type: DateTimeScalar, description: "Date de début de l'intervalle" }),
    end: t.field({ type: DateTimeScalar, description: "Date de fin de l'intervalle" }),
  }),
  validate: [
    [
      ({ start, end }) => isBefore(start, end),
      { message: 'La date de début doit être avant la date de fin' },
    ],
  ],
});
