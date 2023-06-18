import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { DateTimeScalar } from './scalars.js';
import { userIsInBureauOf } from './groups.js';
import { GraphQLError } from 'graphql';

export const BarWeekType = builder.prismaNode('BarWeek', {
  id: { field: 'id' },
  fields: (t) => ({
    uid: t.exposeString('uid'),
    groups: t.relation('groups'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    description: t.exposeString('description'),
    descriptionHtml: t.string({
      resolve: async ({ description }) => toHtml(description),
    }),
  }),
});

builder.queryField('barWeek', (t) =>
  t.prismaField({
    type: BarWeekType,
    args: { uid: t.arg.string() },
    resolve: async (query, {}, { uid }) =>
      prisma.barWeek.findFirstOrThrow({ ...query, where: { uid }, orderBy: { startsAt: 'desc' } }),
  })
);

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
  })
);

builder.queryField('barWeeks', (t) =>
  t.prismaField({
    type: [BarWeekType],
    resolve: async (query) => prisma.barWeek.findMany(query),
  })
);

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
    authScopes(_, {}, { user }) {
      // Only members of a certain group(s) can upsert a bar week
      const foyGroupsUids = process.env.FOY_GROUPS.split(',');
      return Boolean(user?.admin || foyGroupsUids.some((uid) => userIsInBureauOf(user, uid)));
    },
    async resolve(query, _, { id, startsAt, endsAt, description, groupsUids }) {
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
        uid: slug(`${groupsUids.join('-')}-${startsAt.getFullYear()}-${startsAt.getMonth() + 1}`),
      };
      return prisma.barWeek.upsert({
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
    },
  })
);

builder.mutationField('deleteBarWeek', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    authScopes(_, {}, { user }) {
      // Only members of a certain group(s) can upsert a bar week
      const foyGroupsUids = process.env.FOY_GROUPS.split(',');
      return Boolean(user?.admin || foyGroupsUids.some((uid) => userIsInBureauOf(user, uid)));
    },
    async resolve(_, { id }) {
      await prisma.barWeek.delete({ where: { id } });
      return true;
    },
  })
);
