import { builder, prisma } from '#lib';
import { prismaQueryAccessibleArticles, prismaQueryVisibleEvents } from '#permissions';

import { GroupType } from '../index.js';

builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { uid: t.arg.string() },
    async resolve(query, _, { uid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        ...query,
        where: { uid },
        include: {
          articles: {
            where: {
              AND: [
                prismaQueryAccessibleArticles(user, 'wants'),
                {
                  OR: [
                    { eventId: null },
                    {
                      AND: [{ eventId: { not: null } }, { event: prismaQueryVisibleEvents(user) }],
                    },
                  ],
                },
              ],
            },
          },
        },
      });
      return group;
    },
  }),
);
