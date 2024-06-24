import { builder, prisma } from '#lib';
import { hashPassword } from '#modules/users/utils';
import { UserType } from '../types/user.js';

builder.mutationField('createBot', (t) =>
  t.prismaField({
    type: UserType,
    args: {
      major: t.arg.string({ description: 'UID de la filière', required: false }),
      uid: t.arg.string({ description: 'UID du compte bot' }),
      name: t.arg.string({ description: 'Nom du compte bot' }),
      password: t.arg.string({ description: 'Mot de passe du compte bot' }),
    },
    async authScopes(_, { major }, { user }) {
      if (!user) return false;
      if (user.admin) return true;
      if (!major) return false;
      const majorStudentAssociations = await prisma.studentAssociation.findMany({
        where: {
          school: {
            majors: {
              some: {
                uid: major,
              },
            },
          },
        },
      });

      return user.adminOfStudentAssociations.some((a) =>
        majorStudentAssociations.some((m) => m.id === a.id),
      );
    },
    async resolve(query, _, { major, uid, name, password }) {
      return prisma.user.create({
        ...query,
        data: {
          uid,
          firstName: name,
          lastName: '',
          bot: true,
          major: major ? { connect: { uid: major } } : undefined,
          email: `${uid}@local`,
          graduationYear: 0,
          credentials: {
            create: {
              type: 'Password',
              value: await hashPassword(password),
            },
          },
        },
      });
    },
  }),
);
