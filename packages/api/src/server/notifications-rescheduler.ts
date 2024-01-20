import { prisma } from '#lib';
import { scheduleShotgunNotifications } from '#modules/events';
import { scheduleNewArticleNotification } from '#modules/posts';

export async function rescheduleNotifications({ dryRun = false }) {
  const unnotifiedEvents = await prisma.event.findMany({
    // eslint-disable-next-line unicorn/no-null
    where: { notifiedAt: null },
    include: { tickets: true },
  });

  const unnotifiedArticles = await prisma.article.findMany({
    // eslint-disable-next-line unicorn/no-null
    where: { notifiedAt: null },
  });

  console.info(
    `Rescheduling notifications for ${unnotifiedEvents.length} events and ${unnotifiedArticles.length} articles`,
  );

  await Promise.all([
    ...unnotifiedEvents.map(async (event) => scheduleShotgunNotifications(event, { dryRun })),
    ...unnotifiedArticles.map(async (article) =>
      scheduleNewArticleNotification(article, { eager: true, dryRun }),
    ),
  ]);
}
