import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import { LocalID, UIDScalar } from '#modules/global';
import { canCreatePostsOn } from '#modules/groups';
import {
  ArticleType,
  canEditArticle,
  isMoreVisible,
  PostInput,
  schedulePostNotification,
} from '#modules/posts';
import { addSeconds, isFuture } from 'date-fns';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('upsertArticleV2', (t) =>
  t.prismaField({
    type: ArticleType,
    description: 'Crée ou met à jour un post',
    errors: { types: [Error, ZodError] },
    args: {
      id: t.arg({ type: LocalID, required: false }),
      group: t.arg({ type: UIDScalar, required: false }),
      input: t.arg({ type: PostInput }),
    },
    validate: [
      [
        ({ id, group }) => Boolean((id && !group) || (!id && group)),
        {
          message:
            'Il faut soit donner un id pour mettre à jour un post, soit un groupe pour en créer un nouveau',
        },
      ],
    ],
    async authScopes(_, { id, group: groupUid }, { user, group: groupFromToken }) {
      if (id) id = ensureGlobalId(id, 'Article');
      const creating = !id;
      if (groupFromToken) return groupFromToken.uid === groupUid;

      if (creating) {
        if (!groupUid) throw new GraphQLError('Il faut donner un groupe pour créer un post');
        const group = await prisma.group.findUnique({
          where: { uid: groupUid },
          include: canCreatePostsOn.prismaIncludes,
        });
        if (!group) throw new GraphQLError('Groupe non trouvé');
        return canCreatePostsOn(user, group);
      }

      const article = await prisma.article.findUniqueOrThrow({
        where: { id: id ?? '' },
        include: canEditArticle.prismaIncludes,
      });
      if (!article) throw new GraphQLError('Post non trouvé');

      return canEditArticle(article, { authorId: user?.id ?? null, group: null }, user);
    },
    async resolve(
      query,
      _,
      { id, group: groupUid, input: { event: eventId, visibility, title, body, publishedAt } },
      { user },
    ) {
      if (id) id = ensureGlobalId(id, 'Article');
      eventId = eventId ? ensureGlobalId(eventId, 'Event') : null;
      const old = id ? await prisma.article.findUnique({ where: { id } }) : null;
      const group = groupUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } })
        : undefined;

      // gives the code a little time to run, so that the publishedAt date is still in the future when it reaches notella
      publishedAt ??= addSeconds(new Date(), 0.5);

      const result = await prisma.article.upsert({
        include: {
          ...query.include,
          group: query.include?.group || true,
        },
        where: { id: id ?? '' },
        create: {
          body: body ?? '',
          title: title ?? '',
          slug: '',
          visibility: visibility ?? 'Private',
          publishedAt: publishedAt,
          published: publishedAt ? isFuture(publishedAt) : false,
          author: { connect: { id: user?.id ?? '' } },
          group: { connect: { id: group?.id ?? '' } },
          event: eventId ? { connect: { id: eventId } } : undefined,
        },
        update: {
          body: body ?? undefined,
          title: title ?? undefined,
          visibility: visibility ?? undefined,
          publishedAt: publishedAt ?? undefined,
          event: eventId ? { connect: { id: eventId } } : undefined,
        },
      });

      publish(result.id, id ? 'updated' : 'created', result);

      await log('article', id ? 'update' : 'create', { old, result }, result.id, user);

      // This "if" is important to prevent sending duplicate notifications.
      // We only schedule a notification if:
      // 1. We're creating a new post.
      //    We don't create duplicates because well there was never a post to begin with.
      // 2. We were going to publish the post in the future.
      //    in that case we clear the old scheduled notification, and enqueue a new one.
      //    We don't create duplicates because the notification was never sent yet.
      // 3. We're making the post more visible.
      //    We *can* actually create "duplicate" notifications here, but it's indented: it's to reach a wider audience.
      //    This also accounts for the common case were the post is created empty as Private,
      //    then actually published when the user chooses a more public visibility.
      if (!old || isFuture(old.publishedAt) || isMoreVisible(result.visibility, old.visibility))
        await schedulePostNotification(result);

      return result;
    },
  }),
);
