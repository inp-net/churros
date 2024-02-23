import { builder, prisma } from '#lib';
import { SubjectType } from '../index.js';
builder.queryField('subjects', (t) =>
  t.prismaField({
    type: [SubjectType],
    authScopes: () => true,
    async resolve(query) {
      return prisma.subject.findMany({
        ...query,
      });
    },
  }),
);
