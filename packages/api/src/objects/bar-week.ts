import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { DateTimeScalar } from './scalars.js';

export const BarWeekType = builder.prismaNode('BarWeek', {
  id: { field: 'id' },
  fields: (t) => ({
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
    args: { id: t.arg.id() },
    resolve: async (query, {}, { id }) =>
      prisma.barWeek.findFirstOrThrow(...query, { where: { id } }),
  })
);

builder.mutationField('createBarWeek', (t) =>
  t.prismaField({
    type: BarWeekType,
    args: {
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      description: t.arg.string(),
      groups: t.arg({ type: ['String'] }),
    },
    resolve: async (query, {}, { startsAt, endsAt, description }) =>
      prisma.barWeek.create(...query, {
        data: {
          startsAt,
          endsAt,
          description,
          groups: {},
        },
      }),
  })
);
