import { builder } from '#lib';
import { EmailAddressResolver } from 'graphql-scalars';

export const Email = builder.addScalarType('Email', EmailAddressResolver, {
  description: 'Adresse e-mail',
});
