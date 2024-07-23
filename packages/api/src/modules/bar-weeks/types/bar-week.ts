import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';

export const BarWeekType = builder.prismaNode('BarWeek', {
  id: { field: 'id' },
  fields: (t) => ({
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug', {
      description: 'Un nom lisible sans espaces, adaptés pour des URLs.',
    }),
    groups: t.relation('groups'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
    description: t.exposeString('description'),
    descriptionHtml: t.string({
      resolve: async ({ description }) => toHtml(description),
    }),
  }),
});
