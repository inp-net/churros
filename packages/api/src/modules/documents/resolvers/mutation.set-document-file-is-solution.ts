import { builder, objectValuesFlat, prisma } from '#lib';
import { userIsAdminOf } from '#permissions';

// TODO find a better name, idk what

builder.mutationField('setDocumentFileIsSolution', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      documentId: t.arg.id({ required: true }),
      filename: t.arg.string({ required: true }),
      isSolution: t.arg.boolean({ required: true }),
    },
    async authScopes(_, { documentId }, { user }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
        include: {
          subject: {
            select: {
              majors: {
                select: { schools: { select: { studentAssociations: { select: { id: true } } } } },
              },
            },
          },
        },
      });
      return Boolean(
        userIsAdminOf(user, objectValuesFlat(document.subject)) || document.uploaderId === user?.id,
      );
    },
    async resolve(_, { documentId, filename, isSolution }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
      });
      await prisma.document.update({
        where: { id: documentId },
        data: isSolution
          ? {
              paperPaths: {
                set: document.paperPaths.filter((p) => p !== filename),
              },
              // Don't create duplicates
              ...(document.solutionPaths.includes(filename)
                ? {}
                : {
                    solutionPaths: {
                      push: filename,
                    },
                  }),
              // The other way around
            }
          : {
              // Don't create duplicates
              ...(document.paperPaths.includes(filename)
                ? {}
                : {
                    paperPaths: {
                      push: filename,
                    },
                  }),
              solutionPaths: {
                set: document.solutionPaths.filter((p) => p !== filename),
              },
            },
      });
      return true;
    },
  }),
);
