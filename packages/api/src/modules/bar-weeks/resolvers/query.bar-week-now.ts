import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { BarWeekType } from '../index.js';

builder.queryField('barWeekNow', (t) =>
  t.prismaField({
    type: BarWeekType,
    nullable: true,
    args: {
      now: t.arg({ type: DateTimeScalar }),
    },
    resolve: async (query, _, { now }) =>
      prisma.barWeek.findFirst({
        ...query,
        where: {
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        orderBy: { startsAt: 'desc' },
      }),
  }),
);
