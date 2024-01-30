import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import slug from 'slug';
import { toHtml } from '../services/markdown.js';
import { userIsOnBoardOf } from './groups.js';
import { DateTimeScalar } from './scalars.js';

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
  }),
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
  }),
);

builder.queryField('barWeeks', (t) =>
  t.prismaField({
    type: [BarWeekType],
    resolve: async (query) => prisma.barWeek.findMany(query),
  }),
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
      const foyGroupsUids = process.env['FOY_GROUPS']?.split(',') ?? [];
      return Boolean(user?.admin || foyGroupsUids.some((uid) => userIsOnBoardOf(user, uid)));
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
        uid: slug(`${groupsUids.join('-')}-${startsAt.getFullYear()}-${startsAt.getMonth() + 1}`),
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
      await prisma.logEntry.create({
        data: {
          area: 'bar-week',
          action: id ? 'update' : 'create',
          target: barWeek.id,
          message: `Bar week ${barWeek.id} upserted: ${barWeek.description}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return barWeek;
    },
  }),
);

builder.mutationField('deleteBarWeek', (t) =>
  t.field({
    type: 'Boolean',
    args: { id: t.arg.id() },
    authScopes(_, {}, { user }) {
      // Only members of a certain group(s) can upsert a bar week
      const foyGroupsUids = process.env['FOY_GROUPS']?.split(',') ?? [];
      return Boolean(user?.admin || foyGroupsUids.some((uid) => userIsOnBoardOf(user, uid)));
    },
    async resolve(_, { id }, { user }) {
      await prisma.barWeek.delete({ where: { id } });
      await prisma.logEntry.create({
        data: {
          area: 'bar-week',
          action: 'delete',
          target: id,
          message: `Bar week ${id} deleted`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
      return true;
    },
  }),
);