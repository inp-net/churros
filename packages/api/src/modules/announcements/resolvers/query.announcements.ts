import { builder, prisma } from "#lib";
import { AnnouncementType } from "#modules";

// from old.ts
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
  }),
);
