import { CredentialType, type UserCandidate } from '@prisma/client';
import dichotomid from 'dichotomid';
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

const createUid = async (email: string) => {
  const base = email.split('@')[0]?.replace(/\W/g, '') ?? 'user';
  const n = await dichotomid(
    async (n) => !(await prisma.user.findFirst({ where: { uid: `${base}${n > 1 ? n : ''}` } }))
  );
  return `${base}${n > 1 ? n : ''}`;
};

export const completeRegistration = async (candidate: UserCandidate): Promise<boolean> => {
  // If the user has no school email, it must be manually accepted.
  if (!candidate.schoolEmail) return false;

  return saveUser(candidate);
};

export const saveUser = async ({
  id,
  email,
  firstName,
  lastName,
  majorId,
  graduationYear,
  password,
  address,
  biography,
  birthday,
  nickname,
  phone,
  pictureFile,
}: UserCandidate): Promise<boolean> => {
  // Create a user profile
  await prisma.user.create({
    data: {
      uid: await createUid(email),
      email,
      graduationYear: graduationYear!,
      firstName,
      lastName,
      majorId: majorId!,
      address,
      biography,
      birthday,
      nickname,
      phone,
      pictureFile,
      credentials: { create: { type: CredentialType.Password, value: password } },
    },
  });

  await prisma.userCandidate.delete({ where: { id } });

  return true;
};
