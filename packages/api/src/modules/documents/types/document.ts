import { builder, toHtml } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { DOCUMENT_TYPES_WITH_SOLUTIONS, DocumentTypeEnum } from '../index.js';

export const DocumentType = builder.prismaNode('Document', {
  id: { field: 'id' },
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
    hasSolution: t.boolean({
      nullable: true,
      description:
        "Vrai si le document a une correction de disponible. Null si cette information n'est pas applicable pour ce document (par exemple, les fiches de révision ne peuvent pas avoir de correction)",
      resolve({ solutionPaths, type }) {
        // eslint-disable-next-line unicorn/no-null
        if (!DOCUMENT_TYPES_WITH_SOLUTIONS.has(type)) return null;
        return solutionPaths.length > 0;
      },
    }),
    uploader: t.relation('uploader', { nullable: true }),
    uploaderId: t.exposeID('uploaderId', { nullable: true }),
  }),
});
