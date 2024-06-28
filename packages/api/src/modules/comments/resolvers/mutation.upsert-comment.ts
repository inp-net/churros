import {
  TYPENAMES_TO_ID_PREFIXES,
  builder,
  log,
  objectValuesFlat,
  prisma,
  publish,
  splitID,
  yearTier,
} from '#lib';
import { notify } from '#modules/notifications';
import { userIsAdminOf } from '#permissions';
import { NotificationChannel, type User } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { CommentType } from '../index.js';

builder.mutationField('upsertComment', (t) =>
  t.prismaField({
    type: CommentType,
    args: {
      id: t.arg.id({ required: false }),
      body: t.arg.string({ validate: { minLength: 1 } }),
      resourceId: t.arg.id({ required: false }),
      inReplyToId: t.arg.id({ required: false }),
    },
    validate: [
      [
        ({ resourceId, id }) => Boolean(id || resourceId),
        {
          message:
            'Vous devez spécifier le commentaire à modifier ou la resource sur laquelle créer le commentaire',
        },
      ],
    ],
    async authScopes(_, { id }, { user }) {
      if (!user) return false;
      if (user.admin) return true;

      if (id) {
        const comment = await prisma.comment.findUnique({
          where: { id },
          select: {
            author: {
              select: {
                id: true,
                major: {
                  select: {
                    schools: { select: { studentAssociations: { select: { id: true } } } },
                  },
                },
              },
            },
            article: { select: { group: { select: { studentAssociationId: true } } } },
            document: {
              select: {
                subject: {
                  select: {
                    minors: {
                      select: {
                        majors: {
                          select: {
                            schools: { select: { studentAssociations: { select: { id: true } } } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // Who can edit this commment?
        if (!comment) throw new GraphQLError('Commentaire introuvable');
        // - The author
        if (comment.author?.id === user.id) return true;
        // - Student association admins of the author or the resource on which the comment is
        if (userIsAdminOf(user, objectValuesFlat(comment))) return true;
        return false;
      }

      // TODO only allow for articles the user can see
      return true;
    },
    async resolve(query, _, { id, body, resourceId, inReplyToId }, { user }) {
      const connection: {} | { articleId: string } | { documentId: string } = resourceId
        ? {
            [splitID(resourceId)[0] === 'Document' ? 'documentId' : 'articleId']: resourceId,
          }
        : {};

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
        process.env.FRONTEND_ORIGIN +
        (comment.document
          ? `/documents/${documentMajor}/${
              comment.document.subject!.minors[0]?.yearTier ??
              yearTier(comment.author?.graduationYear ?? 1)
            }a/${comment.document.subject!.uid}/${comment.document.uid}/`
          : `/posts/${comment.article!.group.uid}/${comment.article!.uid}`) +
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
