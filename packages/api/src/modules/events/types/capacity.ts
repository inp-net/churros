import { builder } from '#lib';
import { GraphQLError } from 'graphql';

export const CapacityScalar = builder.scalarType('Capacity', {
  description: "Un entier positif ou 'Unlimited' pour une capacité sans limite",
  serialize: (value) => {
    if (typeof value === 'number') return value;
    return null;
  },
  parseValue(value) {
    if (typeof value === 'number') {
      if (Math.floor(value) === value && value >= 0) return value;
      throw new GraphQLError('Capacité invalide');
    }
    if (value === 'Unlimited') return null;

    throw new GraphQLError('Capacité invalide');
  },
});
