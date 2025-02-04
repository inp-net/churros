import { clearScheduledNotifications, queueNotification } from '#modules/notifications';
import { Visibility, type Prisma } from '@churros/db/prisma';
import { Event } from '@inp-net/notella';
import { scheduleNewArticleNotification } from './notifications.old.js';

export async function schedulePostNotification(
  post: Prisma.ArticleGetPayload<{ include: { group: true } }>,
  old?: Prisma.ArticleGetPayload<{ select: { publishedAt: true; visibility: true } }>,
) {
  // remove when notella confirmed
  const visibilitiesByVerbosity = [
    Visibility.Private,
    Visibility.Unlisted,
    Visibility.GroupRestricted,
    Visibility.SchoolRestricted,
    Visibility.Public,
  ];
  void scheduleNewArticleNotification(post, {
    // Only post the notification immediately if the article was not already published before.
    // This prevents notifications if the content of the article is changed after its publication; but allows to send notifications immediately if the article was previously set to be published in the future and the author changes their mind and decides to publish it now.
    eager:
      !old ||
      old.publishedAt > new Date() ||
      // send new notifications when changing visibility of article to a more public one (e.g. from private to school-restricted)
      visibilitiesByVerbosity.indexOf(post.visibility) >
        visibilitiesByVerbosity.indexOf(old.visibility),
  });
  // end remove when notella confirmed
  await clearScheduledNotifications(post.id);
  await queueNotification({
    body: post.title,
    title: `Post de ${post.group.name}`,
    action: `/posts/${post.id}`,
    object_id: post.id,
    event: Event.NewPost,
    send_at: post.publishedAt,
  });
}
