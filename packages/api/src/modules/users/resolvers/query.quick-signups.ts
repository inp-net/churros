import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { QuickSignupType } from '../types/quick-signup.js';

builder.queryField('quickSignups', (t) =>
  t.prismaConnection({
    type: QuickSignupType,
    cursor: 'id',
    authScopes: { admin: true, studentAssociationAdmin: true },
    async resolve(query, _, {}, { user }) {
      if (!user) throw new GraphQLError("Tu n'es pas autorisé à effectuer cette action.");
      return prisma.quickSignup.findMany({
        ...query,
        where: {
          validUntil: {
            gte: new Date(),
          },
          ...(user.admin
            ? {}
            : {
                school: {
                  studentAssociations: {
                    some: {
                      id: {
                        in: user?.adminOfStudentAssociations.map(({ id }) => id),
                      },
                    },
                  },
                },
              }),
        },
      });
    },
  }),
);
