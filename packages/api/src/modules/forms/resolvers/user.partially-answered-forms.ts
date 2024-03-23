import { builder, prisma } from '#lib';
import {} from '#modules/global';
import { UserType } from '#modules/users';
import {} from '../index.js';

builder.prismaObjectField(UserType, 'partiallyAnsweredForms', (t) =>
  t.prismaConnection({
    type: 'Form',
    cursor: 'id',
    description: "Formulaires partiellement répondus par l'utilisateur",
    authScopes({ id }, {}, { user }) {
      return user?.admin || user?.id === id;
    },
    async resolve(query, { id }) {
      // FIXME does not work since some sections could be skipped for this user
      return prisma.form.findMany({
        ...query,
        where: {
          AND: [
            {
              sections: {
                some: {
                  questions: {
                    some: {
                      answers: {
                        some: {
                          createdById: id,
                        },
                      },
                    },
                  },
                },
              },
            },
            {
              NOT: {
                sections: {
                  every: {
                    questions: {
                      every: {
                        answers: {
                          some: {
                            createdById: id,
                          },
                        },
                      },
                    },
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
