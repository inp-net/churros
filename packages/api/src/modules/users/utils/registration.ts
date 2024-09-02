import { log, prisma, sendMail } from '#lib';
import {
  CredentialType,
  type Major,
  type Prisma,
  type QuickSignup,
  type School,
  type User,
  type UserCandidate,
} from '@churros/db/prisma';
import { upsertLdapUser } from '@inp-net/ldap7/user';
import omit from 'lodash.omit';
import { quickSignupIsValidFor } from './quick-signup.js';
import { isSchoolEmailForMajor, resolveSchoolMail, schoolDetails } from './school.js';

export const saveUser = async (
  {
    id,
    uid,
    email,
    firstName,
    lastName,
    majorId,
    graduationYear,
    churrosPassword,
    ldapPassword,
    birthday,
    apprentice,
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
      uid,
      email: resolvedStudentEmail ?? email,
      ...(await schoolDetails(email, major)),
      graduationYear: graduationYear!,
      firstName,
      lastName,
      major: majorId ? { connect: { id: majorId } } : undefined,
      birthday,
      cededImageRightsToTVn7,
      apprentice,
      credentials: { create: { type: CredentialType.Password, value: churrosPassword } },
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

  try {
    await upsertLdapUser({
      uid: uid,
      firstName: firstName,
      lastName: lastName,
      email: [email],
      password: ldapPassword,
    });
  } catch (error) {
    console.error('Failed to create LDAP user', error);
    log(
      'signups',
      'ldap/save-user',
      { error, user: omit(user, 'churrosPassword', 'ldapPassword') },
      user.id,
    );
  }

  await prisma.userCandidate.delete({ where: { id } });

  await sendMail(
    'welcome',
    email,
    { url: new URL('/welcome/', process.env.PUBLIC_FRONTEND_ORIGIN).toString() },
    {},
  );

  return user;
};

export const completeRegistration = async (
  candidate: UserCandidate & {
    usingQuickSignup: null | (QuickSignup & { school: School & { majors: Major[] } });
    major: null | (Major & { schools: School[] });
  },
): Promise<(User & { major?: null | (Major & { ldapSchool?: School | null }) }) | undefined> => {
  if (needsManualValidation(candidate)) return undefined;
  return saveUser(candidate);
};

/**
 *
 * @param candidate the candidate
 * @throws if the email is not validated yet (answering this question as no meaning at this point)
 */
export function needsManualValidation(
  candidate: UserCandidate & {
    usingQuickSignup: (QuickSignup & { school: School & { majors: Major[] } }) | null;
    major: (Major & { schools: School[] }) | null;
  },
): boolean {
  if (!candidate.emailValidated) throw new Error('Email not validated yet');
  if (!candidate.major) return false;
  if (isSchoolEmailForMajor(candidate.email, candidate.major)) return false;
  if (
    candidate.usingQuickSignup &&
    quickSignupIsValidFor(candidate.usingQuickSignup, candidate.major.id)
  )
    return false;
  return true;
}
