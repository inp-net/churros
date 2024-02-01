import { builder } from '#lib';

export const MajorType = builder.prismaObject('Major', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    uid: t.exposeString('uid'),
    shortName: t.exposeString('shortName'),
    schools: t.relation('schools', { query: { orderBy: { name: 'asc' } } }),
    ldapSchool: t.relation('ldapSchool', { nullable: true }),
    minors: t.relation('minors', { query: { orderBy: { name: 'asc' } } }),
    subjects: t.relation('subjects', { query: { orderBy: { name: 'asc' } } }),
  }),
});
