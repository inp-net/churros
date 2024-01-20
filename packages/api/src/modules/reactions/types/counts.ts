// from objects/scalars.ts

import { builder } from '#lib';
import { GraphQLError } from 'graphql';

// TODO rename to reaction-counts
export const CountsScalar = builder.scalarType('Counts', {
  serialize(o) {
    return JSON.stringify(o);
  },
  parseValue(json: unknown) {
    const parsed: unknown = JSON.parse(json as string);
    if (typeof json !== 'object' || json === null)
      throw new GraphQLError('Record must be an object');
    if (Object.getPrototypeOf(parsed) !== Object.prototype)
      throw new GraphQLError('Record must a plain object');
    return parsed as Record<string, number>;
  },
});
