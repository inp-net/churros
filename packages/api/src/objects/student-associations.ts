import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { DateTimeScalar } from './scalars.js';

export const StudentAssociationType = builder.prismaObject('StudentAssociation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    schoolId: t.exposeID('schoolId'),
    name: t.exposeString('name'),
    links: t.relation('links'),
    school: t.relation('school'),
    groups: t.relation('groups'),
    contributors: t.relatedConnection('contributors', {
      cursor: 'id',
      authScopes: { canEditUsers: true },
    }),
  }),
});

builder.queryField('studentAssociations', (t) =>
  t.prismaField({
    type: [StudentAssociationType],
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query) {
      return prisma.studentAssociation.findMany({
        ...query,
        orderBy: { updatedAt: 'desc' },
      });
    },
  })
);

builder.queryField('studentAssociation', (t) =>
  t.prismaField({
    type: StudentAssociationType,
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user);
    },
    async resolve(query, _, { id }) {
      return prisma.studentAssociation.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  })
);
