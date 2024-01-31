import { builder, prisma } from '#lib'
import { BarWeekType, DateTimeScalar } from '#modules'

builder.queryField('barWeekNow', (t) =>
  t.prismaField({
    type: BarWeekType,
    args: {
      now: t.arg({ type: DateTimeScalar }),
    },
    async resolve(query, _, { now }) {
      return (
        (await prisma.barWeek.findFirst({
          ...query,
          where: {
            startsAt: { lte: now },
            endsAt: { gte: now },
          },
          orderBy: { startsAt: 'desc' },
        })) ?? {
          description: '',
          endsAt: new Date(),
          startsAt: new Date(),
          groups: [],
          id: '',
          uid: '',
        }
      );
    },
  }),
);
