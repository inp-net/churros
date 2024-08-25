import { builder, prisma } from '#lib';
import { StudentAssociationType } from '#modules/student-associations/types';
import { UserType } from '#modules/users';

builder.prismaObjectField(UserType, 'canContributeTo', (t) =>
  t.prismaField({
    type: [StudentAssociationType],
    description: 'Les AEs pour lesquelles la personne peut cotiser',
    authScopes: { loggedIn: true },
    async resolve(query, { id }) {
      return prisma.studentAssociation.findMany({
        ...query,
        where: {
          contributionOptions: {
            some: {
              offeredIn: {
                majors: {
                  some: {
                    students: {
                      some: { id },
                    },
                  },
                },
              },
            },
          },
        },
      });
    },
  }),
);
