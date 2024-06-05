import { builder, makeGlobalID, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { QuickSignupType } from '../types/quick-signup.js';

builder.mutationField('deleteQuickSignup', (t) =>
  t.prismaField({
    type: QuickSignupType,
    args: {
      code: t.arg.string(),
    },
    authScopes: { admin: true, studentAssociationAdmin: true },
    async resolve(query, _, { code }, { user }) {
      if (!user) throw new GraphQLError("Tu n'es pas connecté·e");
      return prisma.quickSignup.delete({
        ...query,
        where: {
          id: makeGlobalID('QuickSignup', code),
          school: {
            studentAssociations: {
              some: user.admin
                ? {}
                : {
                    id: {
                      in: user.adminOfStudentAssociations.map(({ id }) => id),
                    },
                  },
            },
          },
        },
      });
    },
  }),
);
