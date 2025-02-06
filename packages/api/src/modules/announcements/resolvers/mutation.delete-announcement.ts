import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import { AnnouncementType, canManageAnnouncements } from '#modules/announcements';
import { LocalID } from '#modules/global';

builder.mutationField('deleteAnnouncement', (t) =>
  t.prismaField({
    errors: {},
    type: AnnouncementType,
    args: {
      id: t.arg({ type: LocalID }),
    },
    authScopes(_, {}, { user }) {
      return canManageAnnouncements(user);
    },
    async resolve(query, _, { id }, { user }) {
      id = ensureGlobalId(id, 'Announcement');
      const ann = await prisma.announcement.delete({
        ...query,
        where: { id },
      });
      await log('announcements', 'delete', { announcemnet: ann }, id, user);
      publish(id, 'deleted', id);
      return ann;
    },
  }),
);
