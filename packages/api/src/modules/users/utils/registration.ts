import { prisma, sendMail } from '#lib';
import {
  CredentialType,
  type Major,
  type Prisma,
  type School,
  type User,
  type UserCandidate,
} from '@centraverse/db/prisma';
import { quickSignupIsValidFor } from './quick-signup.js';
import { resolveSchoolMail } from './school-emails.js';
import { createUid } from './uid.js';

export const saveUser = async (
  {
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
  }: UserCandidate,
  returnPrismaQuery: {
    include?: Prisma.UserCandidateInclude;
    select?: Prisma.UserCandidateSelect;
  } = {},
): Promise<User & { major?: null | (Major & { ldapSchool?: School | null }) }> => {
  const major = majorId
    ? await prisma.major.findUniqueOrThrow({ where: { id: majorId }, include: { schools: true } })
    : null;
  // Create a user profile
  const resolvedStudentEmail = major ? resolveSchoolMail(email, major) : null;
  const user = await prisma.user.create({
    ...returnPrismaQuery,
    data: {
      uid: await createUid({ firstName, lastName }),
      email: resolvedStudentEmail ?? email,
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

  await sendMail(
    'welcome',
    email,
    { url: new URL('/welcome/', process.env.FRONTEND_ORIGIN).toString() },
    {},
  );

  return user;
};

export const completeRegistration = async (
  candidate: UserCandidate,
): Promise<(User & { major?: null | (Major & { ldapSchool?: School | null }) }) | undefined> => {
  // If the user has no school email, it must be manually accepted, except
  // if the account is marked as external (i.e. no major given) or
  // if the quickSignup used is valid for that major
  if (!candidate.schoolEmail && candidate.majorId) {
    if (!candidate.quickSignupId) return undefined;
    const quickSignup = await prisma.quickSignup.findUnique({
      where: { id: candidate.quickSignupId },
      include: {
        school: { include: { majors: true } },
      },
    });
    if (!quickSignup) return undefined;
    if (!quickSignupIsValidFor(quickSignup, candidate.majorId)) return undefined;
  }

  return saveUser(candidate);
};
