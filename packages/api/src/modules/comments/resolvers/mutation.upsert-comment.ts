import {
  ENV,
  TYPENAMES_TO_ID_PREFIXES,
  builder,
  ensureGlobalId,
  localID,
  log,
  prisma,
  publish,
  splitID,
  yearTier,
} from '#lib';
import { LocalID, MarkdownScalar } from '#modules/global';
import { notify } from '#modules/notifications';
import { NotificationChannel, type User } from '@churros/db/prisma';
import { CommentType } from '../index.js';
import { canEditComment } from '../utils/permissions.js';

builder.mutationField('upsertComment', (t) =>
  t.prismaField({
    type: CommentType,
    errors: {},
    args: {
      id: t.arg({ type: LocalID, required: false }),
      body: t.arg({ type: MarkdownScalar, validate: { minLength: 1 } }),
      resource: t.arg.id({ required: false }),
      inReplyTo: t.arg({ type: LocalID, required: false }),
    },
    validate: [
      [
        ({ resource, id }) => Boolean(id || resource),
        {
          message:
            'Vous devez spécifier le commentaire à modifier ou la resource sur laquelle créer le commentaire',
        },
      ],
    ],
    async authScopes(_, { id }, { user }) {
      if (id) {
        const comment = await prisma.comment.findUniqueOrThrow({
          where: { id },
          include: canEditComment.prismaIncludes,
        });
        return canEditComment(user, comment);
      }

      // TODO only allow for articles the user can see
      return Boolean(user);
    },
    async resolve(query, _, { id, body, resource: resourceId, inReplyTo: inReplyToId }, { user }) {
      let connection: undefined | { articleId: string } | { documentId: string };

      inReplyToId = ensureGlobalId(inReplyToId, 'Comment');
      id = ensureGlobalId(id, 'Comment');

      if (resourceId) {
        connection = {
          [splitID(resourceId)[0] === 'Document' ? 'documentId' : 'articleId']: resourceId,
        } as typeof connection;
      }

      await log(
        'comments',
        id ? 'edit' : inReplyToId ? 'reply' : 'comment',
        { id, body, resourceId, inReplyToId, connection },
        resourceId || id || inReplyToId,
        user,
      );

      const comment = await prisma.comment.upsert({
        ...query,
        where: { id: id ?? '' },
        create: {
          body,
          inReplyToId,
          ...connection,
          authorId: user!.id,
        },
        update: {
          body,
          inReplyToId,
          ...connection,
        },
        include: {
          author: true,
          inReplyTo: { include: { author: true } },
          document: {
            include: {
              subject: { include: { majors: true, minors: { include: { majors: true } } } },
              uploader: true,
            },
          },
          article: { include: { group: true, author: true } },
        },
      });
      publish(
        comment.id,
        id ? 'updated' : 'created',
        comment,
        comment.articleId ?? comment.documentId ?? undefined,
      );

      const commentedOn: { title: string; author: User | null } | undefined = comment.document
        ? { title: comment.document.title, author: comment.document.uploader }
        : comment.article
          ? { title: comment.article.title, author: comment.article.author }
          : undefined;

      // TODO factor out code to get URL to the comment (or use /[globalId])
      const documentMajor =
        comment.document?.subject!.majors[0]?.uid ??
        comment.document?.subject!.minors[0]?.majors[0]?.uid ??
        'unknown';
      const commentUrl =
        ENV.PUBLIC_FRONTEND_ORIGIN +
        (comment.document
          ? `/documents/${documentMajor}/${
              comment.document.subject!.minors[0]?.yearTier ??
              yearTier(comment.author?.graduationYear ?? 1)
            }a/${comment.document.subject!.slug}/${comment.document.slug}/`
          : `/posts/${localID(comment.articleId!)}`) +
        `#comment-${comment.id.replace(TYPENAMES_TO_ID_PREFIXES.Comment + ':', '')}`;

      if (
        !id &&
        comment.author &&
        comment.inReplyTo?.author &&
        comment.inReplyTo.author.id !== comment.author.id &&
        commentedOn
      ) {
        await notify([comment.inReplyTo.author], {
          title: `@${comment.author.uid} a répondu à votre commentaire sur ${
            commentedOn?.title ?? '???'
          }`,
          body: comment.body,
          data: {
            group: comment.article?.group.uid ?? undefined,
            channel: NotificationChannel.Comments,
            goto: commentUrl,
          },
        });
      } else if (
        !id &&
        !comment.inReplyTo &&
        commentedOn?.author &&
        commentedOn?.author !== comment.author
      ) {
        await notify([commentedOn.author], {
          title: `@${comment.author?.uid ?? '???'} a commenté sur ${commentedOn.title ?? '???'}`,
          body: comment.body,
          data: {
            group: comment.article?.group.uid ?? undefined,
            channel: NotificationChannel.Comments,
            goto: commentUrl,
          },
        });
      }

      return comment;
    },
  }),
);
