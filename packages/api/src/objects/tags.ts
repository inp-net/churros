import { builder } from '../builder.js';

export const TagType = builder.prismaObject('Tag', {
  fields: (t) => ({
    id: t.exposeID('id'),
    uid: t.exposeString('uid'),
    name: t.exposeString('name'),
    color: t.exposeString('color'),
    description: t.exposeString('description'),
    groups: t.relation('groups', { nullable: true }),
  }),
});
