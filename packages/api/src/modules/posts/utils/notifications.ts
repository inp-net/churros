import { clearScheduledNotifications, queueNotification } from '#modules/notifications';
import { type Prisma } from '@churros/db/prisma';
import { Event } from '@inp-net/notella';
import { scheduleNewArticleNotification } from './notifications.old.js';

export async function schedulePostNotification(
  post: Prisma.ArticleGetPayload<{ include: { group: true } }>,
) {
  // remove when notella confirmed
  void scheduleNewArticleNotification(post, { eager: true });
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
