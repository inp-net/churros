import { builder, log, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { userIsAdminOf, userIsOnBoardOf } from '#permissions';
import { GraphQLError } from 'graphql';
import slug from 'slug';
import { BarWeekType } from '../index.js';

builder.mutationField('upsertBarWeek', (t) =>
  t.prismaField({
    type: BarWeekType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      description: t.arg.string(),
      groupsUids: t.arg({ type: ['String'] }),
    },
    async authScopes(_, { groupsUids }, { user }) {
      // Only members of a certain group(s) can upsert a bar week
      const foyGroupsUids = process.env['FOY_GROUPS']?.split(',') ?? [];

      // get studentAssociationId from group
      const groups = await prisma.group.findMany({
        where: { uid: { in: groupsUids } },
        select: { studentAssociationId: true },
      });
      const studentAssociationIds = groups.flatMap(
        (group) => group.studentAssociationId,
      ) as string[];

      return Boolean(
        userIsAdminOf(user, studentAssociationIds) ||
          foyGroupsUids.some((uid) => userIsOnBoardOf(user, uid)),
      );
    },
    async resolve(query, _, { id, startsAt, endsAt, description, groupsUids }, { user }) {
      // Check if ends at date is after starts at date
      if (endsAt < startsAt) throw new GraphQLError('Bar week ends before it starts.');
      // Check for overlaps in the bar week dates
      const overlaps = await prisma.barWeek.findMany({
        where: {
          id: { not: { equals: id ?? '' } },
          OR: [
            { startsAt: { lte: startsAt }, endsAt: { gte: startsAt } },
            { startsAt: { lte: endsAt }, endsAt: { gte: endsAt } },
            { startsAt: { gte: startsAt }, endsAt: { lte: endsAt } },
          ],
        },
      });
      if (overlaps.length > 0) throw new GraphQLError('Bar week overlaps with another bar week.');
      const data = {
        startsAt,
        endsAt,
        description,
        slug: slug(`${groupsUids.join('-')}-${startsAt.getFullYear()}-${startsAt.getMonth() + 1}`),
      };
      const barWeek = await prisma.barWeek.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          ...data,
          groups: {
            connect: groupsUids.map((uid) => ({ uid })),
          },
        },
        update: {
          ...data,
          groups: {
            set: groupsUids.map((uid) => ({ uid })),
          },
        },
      });
      await log(
        'bar-week',
        id ? 'update' : 'create',
        { message: `Bar week ${barWeek.id} upserted: ${barWeek.description}` },
        barWeek.id,
        user,
      );
      return barWeek;
    },
  }),
);
