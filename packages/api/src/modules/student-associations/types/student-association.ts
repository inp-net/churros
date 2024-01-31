import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const StudentAssociationType = builder.prismaObject('StudentAssociation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid', { nullable: true }),
    description: t.exposeString('description'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    schoolId: t.exposeID('schoolId'),
    name: t.exposeString('name'),
    links: t.relation('links'),
    school: t.relation('school'),
    groups: t.relation('groups'),
    contributionOptions: t.relation('contributionOptions'),
  }),
});
