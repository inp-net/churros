import { builder, prisma } from '#lib';

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
      });
      return Boolean(user?.admin || document.uploaderId === user?.id);
    },
    async resolve(_, { documentId, filename, isSolution }) {
      const document = await prisma.document.findUniqueOrThrow({
        where: { id: documentId },
      });
      await prisma.document.update({
        where: { id: documentId },
        data: {
          // If marking as solution, remove from paperPaths and add to solutionPaths
          ...(isSolution
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
              }),
        },
      });
      return true;
    },
  }),
);
