import { builder } from '../builder';

export const StudentAssociationType = builder.prismaObject('StudentAssociation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
  }),
});
