import type { Context } from '#lib';
import { userIsAdminOf } from '#permissions';
import type { Prisma } from '@churros/db/prisma';

export const prismaIncludesForStudentAssociationAdmins = {
  schools: {
    include: {
      studentAssociations: {
        include: {
          admins: true,
        },
      },
    },
  },
} as const;

export function prismaUserFilterForStudentAssociationAdmins(user: NonNullable<Context['user']>) {
  if (user.admin) return {};
  return {
    major: {
      schools: {
        some: {
          studentAssociations: {
            some: {
              admins: {
                some: {
                  id: user.id,
                },
              },
            },
          },
        },
      },
    },
  } as const;
}

export function prismaGroupFilterForStudentAssociationAdmins(user: NonNullable<Context['user']>) {
  if (user.admin) return {};
  return {
    studentAssociation: {
      admins: {
        some: {
          id: user.id,
        },
      },
    },
  } as const;
}

export function prismaGroupFilterForStudentAssociationGroupsEditors(
  user: NonNullable<Context['user']>,
) {
  if (user.admin) return {};
  return {
    studentAssociation: {
      groupsEditors: {
        some: {
          id: user.id,
        },
      },
    },
  } as const;
}

export function canBeEdited(
  user: {
    id: string;
    major: { schools: Array<{ studentAssociations: Array<{ id: string }> }> } | null;
  },
  me: NonNullable<Context['user']>,
) {
  return (
    me.admin ||
    user.id === me.id ||
    me.adminOfStudentAssociations.some((a) =>
      user.major?.schools.some((s) => s.studentAssociations.some((sa) => sa.id === a.id)),
    )
  );
}

/**
 * Whether we can edit the profile of a user. This means information that the user should be able to edit themselves (meaning not contributions, not curriculum-related info)
 * @param user the logged-in user
 * @param targetUser the user we want to edit
 * @returns can we edit it?
 */
export function canEditProfile(
  user: Context['user'],
  targetUser: Prisma.UserGetPayload<{ include: typeof canEditProfile.prismaIncludes }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (user.id === targetUser.id) return true;
  if (
    userIsAdminOf(
      user,
      targetUser.major?.schools.flatMap((s) => s.studentAssociations.map((s) => s.id)),
    )
  )
    return true;
  return false;
}

canEditProfile.prismaIncludes = {
  major: {
    include: {
      schools: {
        include: {
          studentAssociations: {
            include: {
              admins: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.UserInclude;

/**
 * Can edit things that can potentially change what tickets the user is elligible to: major, apprenticeship, graduation year
 * @param user
 * @param targetUser
 * @returns
 */
export function canEditCurriculum(
  user: Context['user'],
  targetUser: Prisma.UserGetPayload<{ include: typeof canEditCurriculum.prismaIncludes }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (
    userIsAdminOf(
      user,
      targetUser.major?.schools.flatMap((s) => s.studentAssociations.map((s) => s.id)),
    )
  )
    return true;
  return false;
}

canEditCurriculum.prismaIncludes = {
  major: {
    include: {
      schools: {
        include: {
          studentAssociations: {
            include: {
              admins: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.UserInclude;

export function canEditUserPermissions(
  user: Context['user'],
  targetUser: Prisma.UserGetPayload<{ include: typeof canEditUserPermissions.prismaIncludes }>,
) {
  if (!user) return false;
  if (targetUser.admin) return false;
  if (user.admin) return true;
  return userIsAdminOf(
    user,
    targetUser.major?.schools.flatMap((s) => s.studentAssociations.map((s) => s.id)),
  );
}

canEditUserPermissions.prismaIncludes = {
  major: {
    include: {
      schools: {
        include: {
          studentAssociations: true,
        },
      },
    },
  },
} as const satisfies Prisma.UserInclude;
