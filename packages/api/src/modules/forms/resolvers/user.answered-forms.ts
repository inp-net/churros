import { builder, prisma } from '#lib';
import { UserType } from '#modules/users';
import { FormType } from '../types/form.js';

builder.prismaObjectField(UserType, 'answeredForms', (t) =>
  t.prismaConnection({
    cursor: 'id',
    type: FormType,
    description: "Formulaires complètement répondus par l'utilisateur",
    authScopes({ id }, {}, { user }) {
      return user?.admin || user?.id === id;
    },
    resolve(query, { id }) {
      // FIXME does not work since some sections could be skipped for this user
      return prisma.form.findMany({
        ...query,
        where: {
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
      });
    },
  }),
);
