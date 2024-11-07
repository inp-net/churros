import { builder, CapacityUnlimitedValue } from '#lib';
import { GraphQLError } from 'graphql';

export const CapacityScalar = builder.scalarType('Capacity', {
  description: `Un entier positif ou '${CapacityUnlimitedValue}' pour une capacité sans limite`,
  serialize: (value) => value,
  parseValue(value) {
    if (typeof value === 'number') {
      if (Math.floor(value) === value && value >= 0) return value;
      throw new GraphQLError('Capacité invalide');
    }
    if (value === CapacityUnlimitedValue) return CapacityUnlimitedValue;

    throw new GraphQLError('Capacité invalide');
  },
});
