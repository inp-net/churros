import { builder, ensureGlobalId, prisma } from '#lib';
import { AnnouncementType } from '../index.js';

builder.queryField('announcement', (t) =>
  t.prismaField({
    type: AnnouncementType,
    args: {
      id: t.arg.id({ description: 'ID local ou global' }),
    },
    authScopes() {
      return true;
    },
    async resolve(query, _, { id }) {
      return prisma.announcement.findUniqueOrThrow({
        ...query,
        where: { id: ensureGlobalId(id, 'Announcement') },
      });
    },
  }),
);
