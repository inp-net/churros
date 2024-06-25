import { builder } from '#lib';

export class AwaitingValidationError extends Error {
  constructor(message?: string) {
    super(message ?? "Ton compte n'a pas encore été validé par l'équipe d'adminstration de ton AE");
    this.name = 'AwaitingValidationError';
  }
}

builder.objectType(AwaitingValidationError, {
  name: 'AwaitingValidationError',
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});
