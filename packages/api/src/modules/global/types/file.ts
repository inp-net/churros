import { builder } from '#lib';
import { GraphQLError } from 'graphql';

export const FileScalar = builder.scalarType('File', {
  serialize() {
    throw new GraphQLError('File cannot be serialized');
  },
});
