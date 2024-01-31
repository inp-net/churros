import { builder, findSchoolUser, fromYearTier, prisma } from '#lib';

import { nanoid } from 'nanoid';
import { createTransport } from 'nodemailer';
import { ZodError } from 'zod';
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

  await createTransport(process.env.SMTP_URL).sendMail({
    to: email,
    from: process.env.PUBLIC_SUPPORT_EMAIL,
    subject: `Finaliser mon inscription sur Churros`,
    html: `
<p>
  <a href="${url.toString()}">Finaliser mon inscription</a>
</p>
`,
    text: `Finaliser mon inscription sur ${url.toString()}`,
  });

  return true;
};
