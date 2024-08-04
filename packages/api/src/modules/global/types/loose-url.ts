import { builder } from '#lib';
import { GraphQLError } from 'graphql';
import isValidDomain from 'is-valid-domain';
import { ALLOWED_URL_PROTOCOLS } from './url.js';

export const LooseURL = builder.scalarType('LooseURL', {
  description: `Une adresse internet (URL). Si le protocole n'est pas spécifié, https:// sera ajouté (par exemple, net7.dev est valide en entrée et est interprété comme https://net7.dev). Les éventuels espaces autours de l'URL sont ignorés. Les protocoles autorisés sont: ${ALLOWED_URL_PROTOCOLS.join(', ')}`,
  serialize(value) {
    return new URL(value).toString();
  },
  parseValue: (value) => {
    if (typeof value !== 'string') throw new GraphQLError('URL invalide');

    let maybeURL = value.trim();

    if (URL.canParse(maybeURL)) {
      const parsed = new URL(maybeURL);
      if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol)) {
        throw new GraphQLError(
          `URL invalide, protocole ${parsed.protocol} non autorisé (les protocoles autorisés sont ${ALLOWED_URL_PROTOCOLS.join(', ')})`,
        );
      }
      return parsed.toString();
    }

    if (!isValidDomain(maybeURL.split('/').at(0) ?? '')) throw new GraphQLError('URL invalide');
    maybeURL = `https://${maybeURL}`;
    if (!URL.canParse(maybeURL)) throw new GraphQLError('URL invalide');

    return new URL(maybeURL).toString();
  },
});
