import { prisma } from '#lib';
import {
  CredentialType,
  type Major,
  type School,
  type User,
  type UserCandidate,
} from '@prisma/client';
import { createTransport } from 'nodemailer';
import { createUid } from './uid.js';

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
      major: majorId ? { connect: { id: majorId } } : undefined,
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
      canAccessDocuments: Boolean(majorId), // TODO behavior should be different for ensat
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
  await createTransport(process.env.SMTP_URL).sendMail({
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

export const completeRegistration = async (
  candidate: UserCandidate,
): Promise<(User & { major?: null | (Major & { ldapSchool?: School | null }) }) | undefined> => {
  // If the user has no school email, it must be manually accepted, except if the account is marked as external (i.e. no major given)
  if (!candidate.schoolEmail && candidate.majorId) return undefined;

  return saveUser(candidate);
};
