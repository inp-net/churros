import { builder } from '#lib';

export const LydiaAccountType = builder.prismaObject('LydiaAccount', {
  fields: (t) => ({
    id: t.exposeID('id'),
    groupId: t.exposeID('groupId', { nullable: true }),
    group: t.relation('group', { nullable: true }),
    studentAssociation: t.relation('studentAssociation', { nullable: true }),
    studentAssociationId: t.exposeID('studentAssociationId', { nullable: true }),
    events: t.relation('events'),
    name: t.exposeString('name'),
    // tokens are NOT EXPOSED, they should never quit the backend
  }),
});
