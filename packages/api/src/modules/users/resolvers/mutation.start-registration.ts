import { builder, findSchoolUser, fromYearTier, makeGlobalID, prisma, sendMail } from '#lib';

import { nanoid } from 'nanoid';
import { ZodError } from 'zod';
import { fullName } from '../utils/names.js';
/** Registers a new user. */
builder.mutationField('startRegistration', (t) =>
  t.field({
    type: 'Boolean',
    errors: { types: [ZodError] },
    args: {
      email: t.arg.string({
        validate: {
          minLength: 1,
          maxLength: 255,
          email: true,
          refine: [
            async (email) => !(await prisma.user.findUnique({ where: { email } })),
            { message: 'Ce compte existe déjà.' },
          ],
        },
      }),
      quickSignupCode: t.arg.string({
        required: false,
        description:
          "Code d'inscription rapide, pour s'inscrire sans mail étudiant et sans validation manuelle. Voir QuickSignupType.",
      }),
    },
    resolve: async (_, { email, quickSignupCode }) => register(email, quickSignupCode ?? undefined),
  }),
);

export const register = async (email: string, quickSignupCode?: string): Promise<boolean> => {
  const quickSignup = quickSignupCode
    ? await prisma.quickSignup.findUnique({
        where: {
          id: makeGlobalID('QuickSignup', quickSignupCode),
        },
      })
    : undefined;

  const schoolUser = await findSchoolUser({ email }).catch(() => null);

  const major = await prisma.major.findFirst({
    where: {
      shortName: schoolUser?.major,
    },
  });

  delete schoolUser?.major;

  const { token } = schoolUser
    ? await prisma.userCandidate.upsert({
        where: { email },
        create: {
          ...schoolUser,
          email,
          token: nanoid(),
          major: major ? { connect: { id: major.id } } : undefined,
          graduationYear: schoolUser.graduationYear ?? fromYearTier(0),
        },
        update: { ...schoolUser, major: major ? { connect: { id: major.id } } : undefined },
      })
    : await prisma.userCandidate.upsert({
        where: { email },
        create: {
          email,
          token: nanoid(),
          usingQuickSignup: quickSignup ? { connect: { id: quickSignup.id } } : undefined,
        },
        update: {},
      });

  await prisma.logEntry.create({
    data: {
      action: 'start',
      area: 'signups',
      message: `Inscription de ${email} démarrée. schoolUser: ${JSON.stringify(schoolUser)}`,
      target: `token ${token}`,
    },
  });

  const url = new URL('/register/continue', process.env.FRONTEND_ORIGIN);
  url.searchParams.append('token', token);

  await sendMail(
    'signup-verify-mail',
    email,
    {
      fullName: fullName({
        firstName: schoolUser?.firstName ?? '',
        lastName: schoolUser?.lastName ?? '',
      }).trim(),
      url: url.toString(),
    },
    {},
  );

  return true;
};
