import type { Context } from '#lib';
import { userIsStudent } from '#permissions';
import type { Prisma, User } from '@churros/db/prisma';

export function canSeeUserProfile(user: Context['user'], targetUser: User) {
  if (user?.admin) return true;
  if (!targetUser.privateProfile) return true;
  if (targetUser.majorId === null) return Boolean(user);
  return userIsStudent(user);
}

canSeeUserProfile.prismaQuery = (user: Context['user']) =>
  (!user
    ? // Logged-out: only public profiles
      { privateProfile: false }
    : // Admins or students: everyone
      user.admin || userIsStudent(user)
      ? {}
      : // External accounts: public profiles & private profiles of other externals
        {
          OR: [{ majorId: null }, { privateProfile: false }],
        }) satisfies Prisma.UserWhereInput;
