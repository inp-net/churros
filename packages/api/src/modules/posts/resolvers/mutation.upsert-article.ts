import { builder, ensureGlobalId, log, prisma, publish } from '#lib';
import { DateTimeScalar, UIDScalar, VisibilityEnum } from '#modules/global';
import { canCreatePostsOn } from '#modules/groups';
import { queueNotification } from '#modules/notifications';
import { Visibility } from '@churros/db/prisma';
import { Event as NotellaEvent } from '@inp-net/notella';
import { differenceInDays } from 'date-fns';
import { GraphQLError } from 'graphql';
import slug from 'slug';
import { ZodError } from 'zod';
import { ArticleType } from '../index.js';
import { canEditArticle } from '../utils/permissions.js';

builder.mutationField('upsertArticle', (t) =>
  t.prismaField({
    type: ArticleType,
    description: 'Crée ou met à jour un post',
    errors: { types: [Error, ZodError] },
    deprecationReason: 'Use upsertArticleV2 instead',
    args: {
      id: t.arg.id({ required: false }),
      group: t.arg({ type: UIDScalar }),
      title: t.arg.string({ validate: { minLength: 1 } }),
      body: t.arg.string(),
      publishedAt: t.arg({ type: DateTimeScalar, required: false }),
      event: t.arg.id({ required: false }),
      visibility: t.arg({ type: VisibilityEnum }),
    },
    validate: [
      [
        ({ publishedAt, id }) =>
          Boolean(id || !publishedAt || differenceInDays(publishedAt, new Date()) <= 1),
        { message: 'Impossible de créer un post publié dans le passé.' },
      ],
    ],
    async authScopes(_, { id, group: groupUid }, { user, group: groupFromToken }) {
      const creating = !id;
      if (groupFromToken) return groupFromToken.uid === groupUid;

      if (creating) {
        const group = await prisma.group.findUnique({
          where: { uid: groupUid },
          include: canCreatePostsOn.prismaIncludes,
        });
        if (!group) throw new GraphQLError('Groupe non trouvé');
        return canCreatePostsOn(user, group);
      }

      const article = await prisma.article.findUniqueOrThrow({
        where: { id },
        include: canEditArticle.prismaIncludes,
      });
      if (!article) throw new GraphQLError('Post non trouvé');

      const group = await prisma.group.findUnique({
        where: { uid: groupUid },
        include: canCreatePostsOn.prismaIncludes,
      });
      if (!group) throw new GraphQLError('Groupe non trouvé');

      return canEditArticle(article, { authorId: user?.id ?? null, group }, user);
    },
    async resolve(
      query,
      _,
      { id, event: eventId, visibility, group: groupUid, title, body, publishedAt },
      { user },
    ) {
      eventId = eventId ? ensureGlobalId(eventId, 'Event') : null;
      const group = await prisma.group.findUniqueOrThrow({ where: { uid: groupUid } });
      publishedAt ??= new Date();
      const data = {
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
          slug: slug(title),
          event: eventId ? { connect: { id: eventId } } : undefined,
        },
        update: {
          ...data,
          event: eventId ? { connect: { id: eventId } } : { disconnect: true },
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
      if (!id) {
        await queueNotification({
          object_id: result.id,
          event: NotellaEvent.NewPost,
          action: `/posts/${result.id}`,
          title: `Nouveau post de ${result.group.name}`,
          body: result.title,
        });
      }
      return result;
    },
  }),
);
