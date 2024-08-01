import { builder } from '#lib';
import { GraphQLError } from 'graphql';

export const MarkdownScalar = builder.scalarType('Markdown', {
  description: 'Du texte au format Markdown. (https://commonmark.org/help/)',
  parseValue(s) {
    if (typeof s !== 'string') throw new GraphQLError('Invalid markdown string');
    return s;
  },
  serialize: (s) => s,
});
