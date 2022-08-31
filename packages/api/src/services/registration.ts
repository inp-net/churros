import { nanoid } from 'nanoid';
import { createTransport } from 'nodemailer';
import { prisma } from '../prisma.js';
import { findSchoolUser } from './ldap.js';

const transporter = createTransport(process.env.SMTP_URL);

export const register = async (email: string): Promise<boolean> => {
  const schoolUser = await findSchoolUser(email);

  const { token } = schoolUser
    ? await prisma.userCandidate.upsert({
        where: { email },
        create: { ...schoolUser, email, token: nanoid() },
        update: { ...schoolUser },
      })
    : await prisma.userCandidate.upsert({
        where: { email },
        create: { email, token: nanoid() },
        update: {},
      });

  const url = new URL('/register/continue', process.env.FRONTEND_URL);
  url.searchParams.append('token', token);

  await transporter.sendMail({
    to: email,
    from: process.env.SUPPORT_EMAIL,
    html: `
<p>
  <a href="${url.toString()}">Finaliser mon inscription</a>
</p>
`,
    text: `Finaliser mon inscription sur ${url.toString()}`,
  });

  return true;
};
