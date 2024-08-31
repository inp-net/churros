import { builder } from '#lib';
import { GraphQLError } from 'graphql';
import { phone } from 'phone';

export const PhoneNumber = builder.scalarType('PhoneNumber', {
  description:
    'Numéro de téléphone, au format international (E.164, avec préfixes “+”), ou au format local français (10 chiffres, sans préfixe).',
  parseValue(s: unknown): string {
    if (typeof s !== 'string') throw new GraphQLError('Invalid phone number: must be a string');
    let { isValid, phoneNumber } = phone(s, { country: 'FRA' });
    if (isValid && phoneNumber) return phoneNumber;
    ({ isValid, phoneNumber } = phone(s));
    if (!isValid || !phoneNumber) {
      throw new GraphQLError(
        'Numéro de téléphone invalide: il faut 10 chiffres (numéro français) ou le format international (+XX ou +XXX ...)',
      );
    }
    return phoneNumber;
  },
  // TODO format with spaces
  serialize: (s: string) => s,
});
