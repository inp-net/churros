import { builder } from '#lib';
import { GraphQLError } from 'graphql';

export const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'];

export const URLScalar = builder.scalarType('URL', {
  description: `Une adresse internet (URL). Les protocoles autorisés sont: ${ALLOWED_URL_PROTOCOLS.join(', ')}`,
  serialize(value) {
    return new URL(value).toString();
  },
  parseValue: (value) => {
    if (typeof value !== 'string') throw new GraphQLError('URL invalide');

    const maybeURL = value.trim();

    if (URL.canParse(maybeURL)) {
      const parsed = new URL(maybeURL);
      if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
        throw new GraphQLError(
          `URL invalide, protocole ${parsed.protocol} non autorisé (les protocoles autorisés sont ${ALLOWED_URL_PROTOCOLS.join(', ')})`,
        );
      }
      return parsed;
    }
    throw new GraphQLError('URL invalide');
  },
});
