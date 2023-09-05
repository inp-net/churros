import {
  CredentialType,
  type Major,
  NotificationType,
  type School,
  type User,
  type UserCandidate,
} from '@prisma/client';
import dichotomid from 'dichotomid';
import { nanoid } from 'nanoid';
import { createTransport } from 'nodemailer';
import { prisma } from '../prisma.js';
import { findSchoolUser } from './ldap-school.js';
import slug from 'slug';
import { queryLdapUser } from './ldap.js';
import { fromYearTier } from '../date.js';

const transporter = createTransport(process.env.SMTP_URL);

export const register = async (email: string): Promise<boolean> => {
  const schoolUser = await findSchoolUser(email);

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

  await transporter.sendMail({
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
  const n = await dichotomid(async (n) => {
    let exist = !(await prisma.user.findFirst({ where: { uid: `${base}${n > 1 ? n : ''}` } }));
    if (!exist) {
      const ldapUser = await queryLdapUser(`${base}${n > 1 ? n : ''}`);
      exist = Boolean(ldapUser);
    }

    return exist;
  });
  return `${base}${n > 1 ? n : ''}`;
};

export const completeRegistration = async (
  candidate: UserCandidate
): Promise<(User & { major?: null | (Major & { ldapSchool?: School | null }) }) | undefined> => {
  // If the user has no school email, it must be manually accepted.
  if (!candidate.schoolEmail) return undefined;

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
  apprentice,
  schoolServer,
  schoolUid,
  cededImageRightsToTVn7,
}: UserCandidate): Promise<
  undefined | (User & { major?: null | (Major & { ldapSchool?: School | null }) })
> => {
  // Create a user profile
  const user = await prisma.user.create({
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
      cededImageRightsToTVn7,
      apprentice,
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
    include: {
      major: {
        include: {
          ldapSchool: true,
        },
      },
    },
  });

  await prisma.userCandidate.delete({ where: { id } });

  const url = new URL('/welcome/', process.env.FRONTEND_ORIGIN);
  await transporter.sendMail({
    subject: `Bienvenue sur Churros!`,
    to: email,
    from: process.env.PUBLIC_SUPPORT_EMAIL,
    html: `
<p>
  <a href="${url.toString()}">Bienvenue sur Churros!</a>
</p>
`,
    text: `Bienvenue sur Churros ! Ça se passe ici : ${url.toString()}`,
  });

  return user;
};
