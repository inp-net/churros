import { builder, prisma } from '#lib';
import { BarWeekType } from '../index.js';

builder.queryField('barWeek', (t) =>
  t.prismaField({
    type: BarWeekType,
    args: { uid: t.arg.string() },
    resolve: async (query, {}, { uid }) =>
      prisma.barWeek.findFirstOrThrow({ ...query, where: { uid }, orderBy: { startsAt: 'desc' } }),
  }),
);
