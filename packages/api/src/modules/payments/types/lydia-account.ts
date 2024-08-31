import { builder } from '#lib';

export const LydiaAccountType = builder.prismaNode('LydiaAccount', {
  id: { field: 'id' },
  fields: (t) => ({
    groupId: t.exposeID('groupId', { nullable: true }),
    group: t.relation('group', { nullable: true }),
    studentAssociation: t.relation('studentAssociation', { nullable: true }),
    studentAssociationId: t.exposeID('studentAssociationId', { nullable: true }),
    events: t.relation('events'),
    name: t.exposeString('name'),
    // tokens are NOT EXPOSED, they should never quit the backend
  }),
});
