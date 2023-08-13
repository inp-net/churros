import { builder } from '../builder.js';
import { prisma } from '../prisma.js';
import { toHtml } from '../services/markdown.js';
import { DateTimeScalar } from './scalars.js';

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

builder.queryField('announcements', (t) =>
  t.prismaConnection({
    type: AnnouncementType,
    cursor: 'id',
    authScopes() {
      return true;
    },
    async resolve(query) {
      return prisma.announcement.findMany({
        ...query,
        orderBy: { startsAt: 'desc' },
      });
    },
  })
);

builder.queryField('announcementsNow', (t) =>
  t.prismaField({
    type: [AnnouncementType],
    authScopes() {
      return true;
    },
    args: {
      now: t.arg({ type: DateTimeScalar }),
    },
    async resolve(query, _, { now }) {
      return prisma.announcement.findMany({
        ...query,
        where: {
          startsAt: { lte: now },
          endsAt: { gte: now },
        },
        orderBy: { startsAt: 'desc' },
      });
    },
  })
);

builder.queryField('announcement', (t) =>
  t.prismaField({
    type: AnnouncementType,
    args: {
      id: t.arg.id(),
    },
    authScopes() {
      return true;
    },
    async resolve(query, _, { id }) {
      return prisma.announcement.findUniqueOrThrow({
        ...query,
        where: { id },
      });
    },
  })
);

builder.mutationField('upsertAnnouncement', (t) =>
  t.prismaField({
    type: AnnouncementType,
    args: {
      id: t.arg.id({ required: false }),
      title: t.arg.string(),
      body: t.arg.string(),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      warning: t.arg.boolean(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(query, _, { id, title, body, startsAt, endsAt, warning }, { user }) {
      const upsertData = {
        title,
        body,
        startsAt,
        endsAt,
        warning,
        by: { connect: { uid: user?.uid } },
      };
      return prisma.announcement.upsert({
        ...query,
        where: { id: id ?? '' },
        create: upsertData,
        update: upsertData,
      });
    },
  })
);

builder.mutationField('deleteAnnouncement', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id(),
    },
    authScopes(_, {}, { user }) {
      return Boolean(user?.admin);
    },
    async resolve(_, { id }) {
      await prisma.announcement.delete({
        where: { id },
      });
      return true;
    },
  })
);
