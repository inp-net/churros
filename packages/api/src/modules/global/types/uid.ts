import { builder } from '#lib';
import { GraphQLError, Kind } from 'graphql';

// Scalar must allow 2-chars UIDs because we have some UIDs with 2 chars already.
export const UID_REGEX_PATTERN = /^[\w-]{2,255}$/;

export const UIDScalar = builder.scalarType('UID', {
  description: `Un nom d'utilisateur·ice unique permettant d'identifier un groupe, une personne, une AE, etc. Doit correspondre à l'expression régulière ${UID_REGEX_PATTERN}`,
  serialize(value) {
    if (value !== null && !UID_REGEX_PATTERN.test(value)) 
      throw new GraphQLError(`Identifiant "${value}" invalide`);
    
    return value.toLowerCase();
  },
  parseValue(value) {
    if (!value || !UID_REGEX_PATTERN.test(value.toString()))
      throw new GraphQLError(`Identifiant "${value}" invalide`);
    return value.toString().toLowerCase();
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError(`Can only validate strings as ${name} but got a: ${ast.kind}`, {
        nodes: [ast],
      });
    }

    return ast.value;
  },
});
