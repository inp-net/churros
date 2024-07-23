import { builder, prisma } from '#lib';
import { BarWeekType } from '../index.js';

builder.queryField('barWeek', (t) =>
  t.prismaField({
    type: BarWeekType,
    args: {
      slug: t.arg.string(),
    },
    resolve: async (query, {}, { slug }) =>
      prisma.barWeek.findFirstOrThrow({
        ...query,
        where: { slug },
        orderBy: { startsAt: 'desc' },
      }),
  }),
);
