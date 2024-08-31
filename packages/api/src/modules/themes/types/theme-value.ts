import { builder } from '#lib';
import { ThemeType, ThemeVariableType } from '#modules/themes';
import { ThemeVariantType } from './theme-variant.js';

export const ThemeValueType = builder.prismaNode('ThemeValue', {
  id: { field: 'id' },
  description: "Définit la valeur d'une variable du thème",
  fields: (t) => ({
    variable: t.expose('variable', { type: ThemeVariableType }),
    value: t.exposeString('value'),
    theme: t.relation('theme', { type: ThemeType }),
    variant: t.expose('variant', { type: ThemeVariantType }),
  }),
});
