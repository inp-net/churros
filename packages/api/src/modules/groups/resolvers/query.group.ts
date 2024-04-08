import { builder, prisma } from '#lib';
import { prismaQueryAccessibleArticles, userCanAccessEvent } from '#permissions';

import { GroupType } from '../index.js';

builder.queryField('group', (t) =>
  t.prismaField({
    type: GroupType,
    args: { uid: t.arg.string() },
    async resolve(query, _, { uid }, { user }) {
      const group = await prisma.group.findUniqueOrThrow({
        ...query,
        where: { uid },
        include: { articles: { where: prismaQueryAccessibleArticles(user, 'wants') } },
      });

      const articlesToReturn = [];
      for (const article of group.articles) {
        if (article.eventId) {
          const linkedEvent = await prisma.event.findFirstOrThrow({
            where: { id: article.eventId },
            include: {
              coOrganizers: { include: { studentAssociation: { include: { school: true } } } },
              group: { include: { studentAssociation: { include: { school: true } } } },
              managers: { include: { user: true } },
              tickets: true,
            },
          });
          if ((await userCanAccessEvent(linkedEvent, user)) && user) articlesToReturn.push(article);
        }
      }
      group.articles = articlesToReturn;
      return group;
    },
  }),
);
