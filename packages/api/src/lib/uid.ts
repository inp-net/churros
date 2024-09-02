import { prisma } from '#lib';

export const RESERVED_UIDS = new Set([
  'uid',
  'admin',
  'mod',
  'moderator',
  'moderateur',
  'modérateur',
  'moderatrice',
  'modératrice',
  'system',
]);

/**
 * Ensure that a given uid is free to use (exists nowhere in the database)
 * @param uid the uid to check
 */
export async function uidIsFree(uid: string): Promise<boolean> {
  // performance optimization: check the tables with the least rows first
  // estimate about the tables that _should_ in a normal use-case be the least filled to the most filled.
  // counting the total rows before might or might not result in better performance, idk tbh.
  // should be fast anyway because all uids are indexed
  const clause = { uid: { equals: uid, mode: 'insensitive' } } as const;
  if (await prisma.school.findFirst({ where: clause })) return false;
  if (await prisma.studentAssociation.findFirst({ where: clause })) return false;
  if (await prisma.major.findFirst({ where: clause })) return false;
  if (await prisma.group.findFirst({ where: clause })) return false;
  if (await prisma.userCandidate.findFirst({ where: clause })) return false;
  if (await prisma.user.findFirst({ where: clause })) return false;
  if (await prisma.blockedUid.findFirst({ where: clause })) return false;
  return true;
}

export const freeUidValidator = [
  [(uid: string) => uid.length >= 3, () => '3 caractères minimum'],
  [uidIsFree, (uid: string) => `@${uid} est indisponible`],
] as const;
