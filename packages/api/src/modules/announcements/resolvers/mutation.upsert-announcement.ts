import { builder, prisma, publish } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { AnnouncementType } from '../index.js';

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

      const announcement = await prisma.announcement.upsert({
        ...query,
        where: { id: id ?? '' },
        create: upsertData,
        update: upsertData,
      });

      await prisma.logEntry.create({
        data: {
          area: 'announcements',
          action: id ? 'update' : 'create',
          target: announcement.id,
          message: `Announcement ${announcement.id} ${id ? 'updated' : 'created'}: ${title}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });

      publish(announcement.id, id ? 'updated' : 'created', announcement);

      return announcement;
    },
  }),
);
