import { builder } from '#lib';
import { ThemeVariant } from '@churros/db/prisma';

export const ThemeVariantType = builder.enumType(ThemeVariant, {
  name: 'ThemeVariant',
  description: 'Différentes variantes pour un même thème',
  values: {
    Light: {
      description: 'Variante claire',
    },
    Dark: {
      description: 'Variante sombre',
    },
  },
});
