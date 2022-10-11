import { builder } from '../builder.js';

export const LinkCollectionType = builder.prismaNode('LinkCollection', {
  id: { field: 'id' },
  fields: (t) => ({
    links: t.relation('links'),
  }),
});
