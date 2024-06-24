import type { Major, School } from '@centraverse/db/prisma';

/**
 * Resolve a mail into its school mail. Retun null if the given mail is not a valid school email address for the given major.
 * @param mail input mail
 * @param major the major we are trying to resolve the mail for
 */
export function resolveSchoolMail(
  mail: string,
  major: Major & { schools: School[] },
): string | null {
  for (const school of major.schools) {
    const resolvedMail = resolveSchoolMailForSchool(mail, school);
    if (resolvedMail) return resolvedMail;
  }

  return null;
}

function resolveSchoolMailForSchool(mail: string, school: School): string | null {
  if (mailDomainsMatch(mail, school.studentMailDomain)) return mail;

  if (school.aliasMailDomains.some((alias) => mailDomainsMatch(mail, alias)))
    return replaceMailDomainPart(mail, school.studentMailDomain);

  return null;
}

function replaceMailDomainPart(mail: string, newDomain: string): string {
  return mail.split('@')[0] + '@' + newDomain;
}

function mailDomainsMatch(email: string, domain: string) {
  return mailDomain(email) === domain.toLowerCase().trim();
}

function mailDomain(mail: string): string {
  const domain = mail.split('@')[1];
  if (!domain) throw new Error(`Invalid email address: ${mail}`);

  return domain.toLowerCase().trim();
}
