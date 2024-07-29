import { builder, log, prisma, publish } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { ZodError } from 'zod';
import { AnnouncementType, canManageAnnouncements } from '../index.js';

builder.mutationField('upsertAnnouncement', (t) =>
  t.prismaField({
    type: AnnouncementType,
    errors: { types: [Error, ZodError] },
    args: {
      id: t.arg.id({ required: false }),
      title: t.arg.string(),
      body: t.arg.string(),
      startsAt: t.arg({ type: DateTimeScalar }),
      endsAt: t.arg({ type: DateTimeScalar }),
      warning: t.arg.boolean(),
    },
    authScopes(_, __, { user }) {
      return canManageAnnouncements(user);
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

      await log(
        'announcements',
        id ? 'update' : 'create',
        { message: `Announcement ${announcement.id} ${id ? 'updated' : 'created'}: ${title}` },
        announcement.id,
        user,
      );

      publish(announcement.id, id ? 'updated' : 'created', announcement);

      return announcement;
    },
  }),
);
