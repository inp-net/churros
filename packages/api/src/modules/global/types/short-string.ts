import { builder } from '#lib';
import { GraphQLError } from 'graphql';
import stringLength from 'string-length';

export const ShortString = builder.scalarType('ShortString', {
  description: 'Du texte de 200 caractères maximum',
  parseValue(s) {
    if (typeof s !== 'string') throw new GraphQLError('Texte invalide');
    if (stringLength(s) > 200) throw new GraphQLError('200 caractères maximum');

    return s;
  },
  serialize: (s) => s,
});
