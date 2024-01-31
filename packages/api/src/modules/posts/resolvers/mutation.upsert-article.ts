import { builder, prisma, publish } from '#lib';
import { DateTimeScalar, VisibilityEnum } from '#modules/global';
import { LinkInput } from '#modules/links';
import { Visibility } from '@prisma/client';
import { ArticleType, createUid, scheduleNewArticleNotification } from '../index.js';

builder.mutationField('upsertArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    errors: {},
    args: {
      id: t.arg.id({ required: false }),
      authorId: t.arg.id(),
      groupId: t.arg.id(),
      title: t.arg.string({ validate: { minLength: 1 } }),
      body: t.arg.string(),
      publishedAt: t.arg({ type: DateTimeScalar }),
      links: t.arg({ type: [LinkInput] }),
      eventId: t.arg.id({ required: false }),
      visibility: t.arg({ type: VisibilityEnum }),
    },
    async authScopes(_, { id, authorId, groupId }, { user }) {
      const creating = !id;
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

      return (
        // Spoofing is disallowed
        ((authorId === user.id &&
          // To set their-self or remove the author, the user must be allowed to write articles
          authorId === article.authorId) ||
          user.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          )) &&
        // Who can edit this article?
        // The author
        (user.id === article.authorId ||
          // Other authors of the group
          user.groups.some(
            ({ groupId, canEditArticles }) => canEditArticles && groupId === article.groupId,
          ))
      );
    },
    async resolve(
      query,
      _,
      { id, eventId, visibility, authorId, groupId, title, body, publishedAt, links },
      { user },
    ) {
      const old = await prisma.article.findUnique({ where: { id: id ?? '' } });
      const data = {
        // eslint-disable-next-line unicorn/no-null
        notifiedAt: null,
        author: {
          connect: {
            id: authorId,
          },
        },
        group: {
          connect: {
            id: groupId,
          },
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
