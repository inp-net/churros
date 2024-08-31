import { builder } from '#lib';
import { PicturedInterface } from '#modules/global';

export const MajorType = builder.prismaObject('Major', {
  description:
    "Une filière (division de premier niveau du cursus scolaire d'une école). Peut être reliée à plusieurs écoles",
  interfaces: [PicturedInterface],
  fields: (t) => ({
    id: t.exposeID('id'),
    fullName: t.exposeString('name'),
    uid: t.exposeString('uid'),
    name: t.exposeString('shortName'),
    shortName: t.exposeString('shortName', {
      deprecationReason: "Use 'name' instead",
    }),
    schools: t.relation('schools', { query: { orderBy: { name: 'asc' } } }),
    ldapSchool: t.relation('ldapSchool', { nullable: true }),
    minors: t.relation('minors', { query: { orderBy: { name: 'asc' } } }),
    discontinued: t.exposeBoolean('discontinued', {
      description: "Ancienne filière n'existant plus dans les cursus actuels",
    }),
  }),
});
