import { builder, ensureHasIdPrefix, prisma, publish } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { LinkInput } from '#modules/links';
import { Visibility } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { ArticleType, createUid, scheduleNewArticleNotification } from '../index.js';
import { canEditArticle } from '../utils/permissions.js';

builder.mutationField('upsertArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      authorId: t.arg.id({ required: false }),
      groupId: t.arg.id(),
      title: t.arg.string({ validate: { minLength: 1 } }),
      body: t.arg.string(),
      publishedAt: t.arg({ type: DateTimeScalar }),
      links: t.arg({ type: [LinkInput] }),
      eventId: t.arg.id({ required: false }),
      visibility: t.arg({ type: VisibilityEnum }),
    },
    async authScopes(_, { id, authorId, groupId }, { user, token, client }) {
      const creating = !id;
      if (token && !user && client) return client.ownerId === groupId;

      if (!user) return false;
      if (user.canEditGroups) return true;

      if (creating) {
        if (!groupId) return false;
        return Boolean(
          user.groups.some(
            ({ group: { id }, canEditArticles }) => canEditArticles && groupId === id,
          ),
        );
      }

      const article = await prisma.article.findUniqueOrThrow({ where: { id } });
      if (!article) throw new GraphQLError('Post non trouvé');

      return canEditArticle(article, { authorId: authorId ?? user.id, groupId }, user);
    },
    async resolve(
      query,
      _,
      { id, eventId, visibility, groupId, title, body, publishedAt, links },
      { user },
    ) {
      eventId = eventId ? ensureHasIdPrefix(eventId, 'Event') : null;
      const group = await prisma.group.findUniqueOrThrow({ where: { id: groupId } });
      const old = await prisma.article.findUnique({ where: { id: id ?? '' } });
      publishedAt ??= new Date();
      const data = {
        // eslint-disable-next-line unicorn/no-null
        notifiedAt: null,
        author: user
          ? {
              connect: {
                id: user.id,
              },
            }
          : undefined,
        group: {
          connect: { id: group.id },
        },
        title,
        body,
        visibility: Visibility[visibility],
        publishedAt,
        published: publishedAt <= new Date(),
      };
      const result = await prisma.article.upsert({
        include: {
          ...query.include,
          group: query.include?.group || true,
        },
        where: { id: id ?? '' },
        create: {
          ...data,
          uid: await createUid({ title, groupId }),
          links: { create: links },
          event: eventId ? { connect: { id: eventId } } : undefined,
        },
        update: {
          ...data,
          links: { deleteMany: {}, createMany: { data: links } },
          event: eventId ? { connect: { id: eventId } } : { disconnect: true },
        },
      });
      publish(result.id, id ? 'updated' : 'created', result);
      await prisma.logEntry.create({
        data: {
          area: 'article',
          action: id ? 'update' : 'create',
          target: result.id,
          message: `Article ${id ? 'updated' : 'created'}`,
          user: user ? { connect: { id: user.id } } : undefined,
        },
      });
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
