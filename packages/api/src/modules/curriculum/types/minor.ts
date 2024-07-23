import { builder } from '#lib';

export const MinorType = builder.prismaNode('Minor', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug', {
      description: 'Un nom lisible sans espaces, adaptés pour des URLs.',
    }),
    yearTier: t.exposeInt('yearTier'),
    subjects: t.relation('subjects', {
      query: {
        orderBy: [{ nextExamAt: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
      },
    }),
    majors: t.relation('majors'),
    users: t.relation('users'),
  }),
});
