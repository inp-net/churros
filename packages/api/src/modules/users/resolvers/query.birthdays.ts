import { builder, prisma, yearTier } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { addDays } from 'date-fns';
import { UserType } from '../index.js';

/** Gets the people that were born today */
builder.queryField('birthdays', (t) =>
  t.withAuth({ student: true }).prismaField({
    type: [UserType],
    args: {
      now: t.arg({ type: DateTimeScalar, required: false }),
      activeOnly: t.arg({ type: 'Boolean', required: false }),
      width: t.arg({ type: 'Int', required: false }),
    },
    async resolve(query, _, { now, activeOnly, width }, { user }) {
      now = now ?? new Date();
      activeOnly = activeOnly ?? true;
      width = width ?? 1;

      async function usersBornOn(date: Date): Promise<Array<{ uid: string }>> {
        return prisma.$queryRaw`SELECT uid from "User" WHERE EXTRACT(DAY FROM "birthday") = EXTRACT(DAY FROM ${date}) AND EXTRACT(MONTH FROM "birthday") = EXTRACT(MONTH FROM ${date})`;
      }

      function dateRangeAround(center: Date, width: number): Date[] {
        width = Math.ceil(width / 2) * 2;
        const result = [];
        for (
          let date = addDays(center, -width / 2);
          date <= addDays(center, width / 2);
          date = addDays(date, 1)
        )
          result.push(date);

        return result;
      }

      const usersNonflat = await Promise.all(
        dateRangeAround(now, width).flatMap(async (d) => usersBornOn(d)),
      );

      const users = await prisma.user.findMany({
        ...query,
        where: {
          uid: { in: usersNonflat.flat().map((u) => u.uid) },
          major: {
            schools: {
              some: {
                uid: {
                  in: user.major?.schools.map((s) => s.uid) ?? [],
                  not: 'inp',
                },
              },
            },
          },
        },
      });

      if (activeOnly)
        return users.filter(({ graduationYear }) => [1, 2, 3].includes(yearTier(graduationYear)));
      return users;
    },
  }),
);
