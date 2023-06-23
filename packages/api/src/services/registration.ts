import { CredentialType, NotificationType, type UserCandidate } from '@prisma/client';
import dichotomid from 'dichotomid';
import { nanoid } from 'nanoid';
import { createTransport } from 'nodemailer';
import { prisma } from '../prisma.js';
import { findSchoolUser } from './ldap.js';
import slug from 'slug';

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

  const url = new URL('/register/continue', process.env.FRONTEND_ORIGIN);
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

export const createUid = async ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  const toAscii = (x: string) =>
    slug(x.toLocaleLowerCase(), {
      charmap: {
        é: 'e',
        è: 'e',
        ê: 'e',
        ë: 'e',
        à: 'a',
        â: 'a',
        ä: 'a',
        ô: 'o',
        ö: 'o',
        û: 'u',
        ü: 'u',
        ï: 'i',
        ç: 'c',
      },
    }).replaceAll('-', '');
  const base = toAscii(lastName).slice(0, 16) + toAscii(firstName).charAt(0);
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
  birthday,
  phone,
  schoolEmail,
  schoolServer,
  schoolUid,
}: UserCandidate): Promise<boolean> => {
  // Create a user profile
  await prisma.user.create({
    data: {
      uid: await createUid({ firstName, lastName }),
      email,
      graduationYear: graduationYear!,
      firstName,
      lastName,
      major: { connect: { id: majorId! } },
      address,
      birthday,
      phone,
      schoolEmail,
      schoolServer,
      schoolUid,
      credentials: { create: { type: CredentialType.Password, value: password } },
      links: { create: [] },
      // enable all notifications by default.
      // the consent is still given per-device by the user on the frontend (see notification subscriptions).
      notificationSettings: {
        create: Object.values(NotificationType).map((type) => ({
          type,
          allow: true,
        })),
      },
    },
  });

  await prisma.userCandidate.delete({ where: { id } });

  const url = new URL('/welcome/', process.env.FRONTEND_ORIGIN);
  await transporter.sendMail({
    to: email,
    from: process.env.SUPPORT_EMAIL,
    html: `
<p>
  <a href="${url.toString()}">Bienvenue sur Centraverse !</a>
</p>
`,
    text: `Bienvenue sur Centraverse ! Ça se passe ici : ${url.toString()}`,
  });

  return true;
};
