// from old.ts
import { builder, prisma } from '#lib';
import { BarWeekType } from '../index.js';

builder.queryField('barWeeks', (t) =>
  t.prismaField({
    type: [BarWeekType],
    resolve: async (query) => prisma.barWeek.findMany(query),
  }),
);
