import slug from 'slug';
import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
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
    args: {
      id: t.arg.id({ required: false }),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      description: t.arg.string(),
      groupsUids: t.arg({ type: ['String'] }),
    },

    async resolve(query, _, { id, startsAt, endsAt, description, groupsUids }) {
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
