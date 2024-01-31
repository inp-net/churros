import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';

// from old.ts
export const AnnouncementType = builder.prismaNode('Announcement', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    by: t.relation('by', { nullable: true }),
    userId: t.exposeID('userId', { nullable: true }),
    title: t.exposeString('title'),
    body: t.exposeString('body'),
    bodyHtml: t.field({
      type: 'String',
      async resolve({ body }) {
        return toHtml(body);
      },
    }),
    warning: t.exposeBoolean('warning'),
    startsAt: t.expose('startsAt', { type: DateTimeScalar }),
    endsAt: t.expose('endsAt', { type: DateTimeScalar }),
  }),
});
