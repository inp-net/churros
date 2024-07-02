import { builder, prisma } from '#lib';
import { SubjectType } from '../index.js';

// TODO move to one "id" arg

builder.queryField('subject', (t) =>
  t.prismaField({
    type: SubjectType,
    args: {
      slug: t.arg.string(),
      yearTier: t.arg.int(),
      forApprentices: t.arg.boolean(),
    },
    authScopes: () => true,
    async resolve(query, _, { slug, yearTier, forApprentices }) {
      return prisma.subject.findFirstOrThrow({
        ...query,
        /* eslint-disable unicorn/no-null */
        where: {
          OR: [
            { slug, yearTier, forApprentices },
            { slug, yearTier: null, forApprentices },
          ],
        },
        /* eslint-enable unicorn/no-null */
      });
    },
  }),
);
