import { builder } from '#lib';

type StringToIntMapping = { key: string; value: number };
export const StringToIntMappingType = builder
  .objectRef<StringToIntMapping>('StringToIntMapping')
  .implement({
    description: 'Associe une clé à une valeur de type nombre entier',
    fields: (t) => ({
      key: t.exposeString('key', { description: 'Clé de la paire' }),
      value: t.exposeInt('value', { description: 'Valeur de la paire' }),
    }),
  });
