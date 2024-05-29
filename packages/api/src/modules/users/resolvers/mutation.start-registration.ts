import { builder, findSchoolUser, fromYearTier, prisma, sendMail } from '#lib';

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
    },
    resolve: async (_, { email }) => register(email),
  }),
);

export const register = async (email: string): Promise<boolean> => {
  const schoolUser = await findSchoolUser({ email });

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
        create: { email, token: nanoid() },
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
