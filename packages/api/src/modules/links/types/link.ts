import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const LinkType = builder.prismaNode('Link', {
  id: { field: 'id' },
  description:
    "Un lien avec un texte à afficher. Pour changer les liens d'une ressource, voir la mutation `setLinks` (valable pour tout les types implémentant `HasLinks`)",
  fields: (t) => ({
    name: t.exposeString('name', { deprecationReason: 'Use `text` instead.' }),
    text: t.exposeString('name'),
    value: t.exposeString('value', { deprecationReason: 'Use `rawURL` instead.' }),
    rawURL: t.exposeString('value'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
  }),
});
