import { builder } from '#lib';
import { PositiveIntResolver } from 'graphql-scalars';

export const PositiveInt = builder.addScalarType('PositiveInt', PositiveIntResolver, {
  description: 'Entier positif',
});
