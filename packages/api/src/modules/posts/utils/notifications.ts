import { queueNotification } from '#modules/notifications';
import { type Prisma } from '@churros/db/prisma';
import { Event } from '@inp-net/notella';

export async function schedulePostNotification(
  post: Prisma.ArticleGetPayload<{ include: { group: true } }>,
) {
  await queueNotification({
    body: post.title,
    title: `Post de ${post.group.name}`,
    action: `/posts/${post.id}`,
    object_id: post.id,
    event: Event.NewPost,
    send_at: post.publishedAt,
    clear_schedule: true,
  });
}
