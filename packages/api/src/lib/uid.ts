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
  if (await prisma.school.findUnique({ where: { uid } })) return false;
  if (await prisma.studentAssociation.findUnique({ where: { uid } })) return false;
  if (await prisma.major.findUnique({ where: { uid } })) return false;
  if (await prisma.group.findUnique({ where: { uid } })) return false;
  if (await prisma.user.findUnique({ where: { uid } })) return false;
  return true;
}

export const freeUidValidator = [uidIsFree, (uid: string) => `@${uid} est indisponible`] as const;
