import { builder, prisma } from '#lib';
import { SubjectType } from '../index.js';

builder.queryField('subject', (t) =>
  t.prismaField({
    type: SubjectType,
    args: {
      uid: t.arg.string(),
      yearTier: t.arg.int(),
      forApprentices: t.arg.boolean(),
    },
    authScopes: () => true,
    async resolve(query, _, { uid, yearTier, forApprentices }) {
      return prisma.subject.findFirstOrThrow({
        ...query,
        /* eslint-disable unicorn/no-null */
        where: {
          OR: [
            { uid, yearTier, forApprentices },
            { uid, yearTier: null, forApprentices },
          ],
        },
        /* eslint-enable unicorn/no-null */
      });
    },
  }),
);
