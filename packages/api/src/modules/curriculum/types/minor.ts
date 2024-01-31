import { builder } from '#lib';

export const MinorType = builder.prismaNode('Minor', {
  id: { field: 'id' },
  fields: (t) => ({
    name: t.exposeString('name'),
    shortName: t.exposeString('shortName'),
    uid: t.exposeString('uid'),
    yearTier: t.exposeInt('yearTier'),
    subjects: t.relation('subjects'),
    majors: t.relation('majors'),
    users: t.relation('users'),
  }),
});
