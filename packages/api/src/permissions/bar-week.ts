import { prisma, type Context } from '#lib';
import { userIsOnBoardOf } from '#permissions';
import type { Major, User } from '@prisma/client';
import { userIsStudentOfSchool } from './school.js';

export const userCanEditBarWeeks = (user: Context['user']): boolean =>
  user?.admin || user?.canEditGroups || FOY_GROUPS_UIDS.some((uid) => userIsOnBoardOf(user, uid));

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
