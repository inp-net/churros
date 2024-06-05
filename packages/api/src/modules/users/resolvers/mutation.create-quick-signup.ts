import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { QuickSignupType } from '../types/quick-signup.js';
import { cleanInvalidQuickSignups } from '../utils/quick-signup.js';

builder.mutationField('createQuickSignup', (t) =>
  t.prismaField({
    type: QuickSignupType,
    description: "Créer un lien d'inscription rapide",
    args: {
      school: t.arg.string({ description: "UID de l'école" }),
      validUntil: t.arg({ type: DateTimeScalar, description: 'Date de validité du lien' }),
    },
    async authScopes(_, { school: schoolUid }, { user }) {
      if (!user) return false;
      if (user.admin) return true;
      const school = await prisma.school.findUnique({ where: { uid: schoolUid } });
      return user.adminOfStudentAssociations.some((a) => a.schoolId === school?.id);
    },
    async resolve(query, _, { validUntil, school }) {
      await cleanInvalidQuickSignups();
      return prisma.quickSignup.create({
        ...query,
        data: {
          school: { connect: { uid: school } },
          validUntil,
        },
      });
    },
  }),
);
