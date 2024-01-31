import { prisma } from '#lib';
import { scheduleNotification } from '#modules/notifications';
import { NotificationChannel, Visibility } from '@prisma/client';
import { mappedGetAncestors } from 'arborist';
import type Cron from 'croner';

export async function scheduleNewArticleNotification(
  {
    id,
    publishedAt,
    notifiedAt,
  }: {
    id: string;
    publishedAt: Date;
    notifiedAt: Date | null;
  },
  {
    eager,
    dryRun = false,
  }: {
    eager: boolean;
    dryRun?: boolean;
  },
): Promise<Cron | boolean> {
  if (notifiedAt) return false;

  return scheduleNotification(
    async (user) => {
      const article = await prisma.article.findUnique({
        where: { id },
        include: {
          group: {
            include: {
              studentAssociation: {
                include: {
                  school: true,
                },
              },
            },
          },
        },
      });

      // If the article does not exist anymore
      if (!article) return;
      // If the article was set to private or unlisted
      if (article.visibility === Visibility.Unlisted || article.visibility === Visibility.Private)
        return;
      // If the article's group is not in a school the user is in
      if (
        article.visibility === Visibility.SchoolRestricted &&
        !user.major?.schools.some(
          (school) => school.id === article.group.studentAssociation?.school.id,
        )
      )
        return;
      // If the article was set to grouprestricted and/or the user is not in the group anymore
      if (article.visibility === Visibility.GroupRestricted) {
        // Get the user's groups and their ancestors
        const ancestors = await prisma.group
          // Get all groups in the same family as the user's groups
          .findMany({
            where: { familyId: { in: user.groups.map(({ group }) => group.familyId ?? group.id) } },
            select: { id: true, parentId: true, uid: true },
          })
          // Get all ancestors of the groups
          .then((groups) => mappedGetAncestors(groups, user.groups, { mappedKey: 'groupId' }))
          // Flatten the ancestors into a single array
          .then((groups) => groups.flat());

        if (!ancestors.some(({ uid }) => uid === article.group.uid)) return;
      }

      return {
        title: `Nouveau post de ${article.group.name}`,
        body: article.title,
        data: {
          group: article.group.uid,
          channel: NotificationChannel.Articles,
          goto: `/posts/${article.group.uid}/${article.uid}`,
        },
        async afterSent() {
          console.info(
            `[${new Date().toISOString()}] Setting notifiedAt for article ${article.id}`,
          );
          await prisma.article.update({
            where: { id: article.id },
            data: {
              notifiedAt: new Date(),
            },
          });
        },
      };
    },
    {
      at: publishedAt,
      eager,
      dryRun,
    },
  );
}
