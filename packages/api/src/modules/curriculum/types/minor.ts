import { builder } from '#lib';

export const MinorType = builder.prismaNode('Minor', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug'),
    yearTier: t.exposeInt('yearTier'),
    subjects: t.relation('subjects'),
    majors: t.relation('majors'),
    users: t.relation('users'),
  }),
});
