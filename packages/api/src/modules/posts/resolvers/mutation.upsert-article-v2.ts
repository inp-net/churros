import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import { LocalID, UIDScalar } from '#modules/global';
import { canCreatePostsOn } from '#modules/groups';
import { Visibility } from '@churros/db/prisma';
import { isFuture } from 'date-fns';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';
import { ArticleType, scheduleNewArticleNotification } from '../index.js';
import { PostInput } from '../types/post-input.js';
import { canEditArticle } from '../utils/permissions.js';

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
      const group = groupUid
        ? await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } })
        : undefined;
      const old = await prisma.article.findUnique({ where: { id: id ?? '' } });

      publishedAt ??= new Date();

      const result = await prisma.article.upsert({
        include: {
          ...query.include,
          group: query.include?.group || true,
        },
        where: { id: id ?? '' },
        create: {
          notifiedAt: null,
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
      await log(
        'article',
        id ? 'update' : 'create',
        { message: `Article ${id ? 'updated' : 'created'}` },
        result.id,
        user,
      );
      const visibilitiesByVerbosity = [
        Visibility.Private,
        Visibility.Unlisted,
        Visibility.GroupRestricted,
        Visibility.SchoolRestricted,
        Visibility.Public,
      ];
      void scheduleNewArticleNotification(result, {
        // Only post the notification immediately if the article was not already published before.
        // This prevents notifications if the content of the article is changed after its publication; but allows to send notifications immediately if the article was previously set to be published in the future and the author changes their mind and decides to publish it now.
        eager:
          !old ||
          old.publishedAt > new Date() ||
          // send new notifications when changing visibility of article to a more public one (e.g. from private to school-restricted)
          visibilitiesByVerbosity.indexOf(result.visibility) >
            visibilitiesByVerbosity.indexOf(old.visibility),
      });
      return result;
    },
  }),
);
