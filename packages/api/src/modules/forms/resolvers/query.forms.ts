import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { FormType } from '../types/form.js';

builder.queryField('forms', (t) =>
  t.prismaConnection({
    type: FormType,
    cursor: 'id',
    authScopes: { loggedIn: true },
    description: "Récupère les formulaires visibles par l'utilisateur·ice connecté·e.",
    async resolve(query, _, {}, { user }) {
      if (!user) throw new GraphQLError("Vous n'êtes pas connecté·e");

      return prisma.form.findMany({
        ...query,
        where: {
          OR: [
            {
              visibility: 'Public',
            },
            {
              visibility: 'SchoolRestricted',
              group: {
                studentAssociation: {
                  school: {
                    majors: {
                      some: {
                        uid: user.major?.uid ?? '',
                      },
                    },
                  },
                },
              },
            },
            {
              visibility: 'GroupRestricted',
              group: {
                members: {
                  some: {
                    memberId: user.id,
                  },
                },
              },
            },
            {
              createdBy: {
                id: user.id,
              },
            },
            {
              group: {
                members: {
                  some: {
                    memberId: user.id,
                    canEditArticles: true,
                  },
                },
              },
            },
          ],
        },
      });
    },
  }),
);
