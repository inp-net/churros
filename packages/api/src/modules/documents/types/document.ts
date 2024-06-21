import { builder, prisma, toHtml } from '#lib';
import { CommentType, CommentableInterface, CommentsConnectionType } from '#modules/comments';
import { DateTimeScalar } from '#modules/global';
import { ReactableInterface } from '#modules/reactions';
import { DocumentTypeEnum } from '../index.js';

export const DocumentType = builder.prismaNode('Document', {
  id: { field: 'id' },
  interfaces: [
    // @ts-expect-error dunno why it complainnns
    CommentableInterface,
    // @ts-expect-error dunno why it complainnns
    ReactableInterface,
  ],
  fields: (t) => ({
    uid: t.exposeString('uid'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    schoolYear: t.exposeInt('schoolYear'),
    title: t.exposeString('title'),
    description: t.exposeString('description'),
    descriptionHtml: t.string({
      resolve: async ({ description }) => toHtml(description),
    }),
    subject: t.relation('subject', { nullable: true }),
    subjectId: t.exposeID('subjectId', { nullable: true }),
    type: t.expose('type', { type: DocumentTypeEnum }),
    paperPaths: t.exposeStringList('paperPaths', {
      description:
        'Liste de chemins vers les fichiers représentant le sujet (ou la fiche de révision)',
    }),
    solutionPaths: t.exposeStringList('solutionPaths', {
      description: 'Liste de chemins vers les fichiers représentant la correction.',
    }),
    uploader: t.relation('uploader', { nullable: true }),
    uploaderId: t.exposeID('uploaderId', { nullable: true }),
    comments: t.relatedConnection(
      'comments',
      {
        cursor: 'id',
        type: CommentType,
        query: {
          orderBy: { createdAt: 'asc' },
        },
      },
      CommentsConnectionType,
    ),
    reacted: t.boolean({
      args: { emoji: t.arg.string() },
      async resolve({ id }, { emoji }, { user }) {
        if (!user) return false;
        return Boolean(
          await prisma.reaction.findFirst({
            where: {
              documentId: id,
              emoji,
              authorId: user.id,
            },
          }),
        );
      },
    }),
    reactions: t.int({
      args: { emoji: t.arg.string() },
      async resolve({ id }, { emoji }) {
        return prisma.reaction.count({
          where: {
            documentId: id,
            emoji,
          },
        });
      },
    }),
  }),
});
