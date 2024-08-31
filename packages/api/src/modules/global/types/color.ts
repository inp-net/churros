import { builder } from '#lib';
import { Colord } from 'colord';
import { GraphQLError } from 'graphql';

export const ColorScalar = builder.scalarType('Color', {
  description:
    "Une couleur. En entrée, un code héxadécimal avec '#', ou un nom de couleur CSS. En sortie, un code héxadécimal avec '#' présent. La transparence n'est pas supportée.",
  serialize: (s) => s,
  parseValue(s: unknown): string {
    // TODO accept french color names as inputs too?
    if (typeof s !== 'string') throw new GraphQLError('Invalid color: must be a string');

    try {
      const color = new Colord(s);
      color.alpha(1);
      return color.toHex();
    } catch {
      throw new GraphQLError('Couleur invalide. Utiliser un code héxadécimal');
    }
  },
});
