import { builder } from '#lib';

interface Shareable {
  shares: number;
  id: string;
}

export const ShareableInterface = builder.interfaceRef<Shareable>('Shareable').implement({
  description: 'Ressource dont le nombre de partages est compté',
  fields: (t) => ({
    id: t.exposeID('id'),
    shares: t.exposeInt('shares', {
      description: 'Nombre de partages',
    }),
  }),
});
