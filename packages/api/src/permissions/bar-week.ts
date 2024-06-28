import { prisma } from '#lib';
import type { Major, User } from '@churros/db/prisma';
import { userIsStudentOfSchool } from './school.js';

export const userCanSeeBarWeek = (
  user: User,
  group: {
    studentAssociation?: { school: { majors: Major[] } };
  },
): boolean => {
  if (!group.studentAssociation) return false;
  return userIsStudentOfSchool(user, group.studentAssociation.school);
};

export async function getFoyGroups() {
  return prisma.group.findMany({
    where: {
      uid: {
        in: FOY_GROUPS_UIDS,
      },
    },
  });
}

export const FOY_GROUPS_UIDS = process.env['FOY_GROUPS']?.split(',') ?? [];
