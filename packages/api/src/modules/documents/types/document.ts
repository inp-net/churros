import { builder, prisma, toHtml } from '#lib';
import { CommentType, CommentableInterface, CommentsConnectionType } from '#modules/comments';
import { DateTimeScalar } from '#modules/global';
import { ReactableInterface } from '#modules/reactions';
import { DocumentTypeEnum } from '../index.js';

export const DocumentType = builder.prismaNode('Document', {
  id: { field: 'id' },
  include: { reactions: true },
  interfaces: [
    // @ts-expect-error dunno why it complainnns
    CommentableInterface,
    ReactableInterface,
  ],
  fields: (t) => ({
    uid: t.exposeString('slug', {
      deprecationReason: 'Use `slug` instead. This field was never universally unique.',
    }),
    slug: t.exposeString('slug', {
      description: 'Un nom lisible sans espaces, adaptés pour des URLs.',
    }),
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
    comments: t.prismaConnection(
      {
        cursor: 'id',
        type: CommentType,
        async resolve(query, { id }) {
          return prisma.comment.findMany({
            ...query,
            where: { documentId: id },
            orderBy: { createdAt: 'desc' },
          });
        },
      },
      CommentsConnectionType,
    ),
  }),
});
