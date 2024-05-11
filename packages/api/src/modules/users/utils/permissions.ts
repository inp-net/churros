import type { Context } from '#lib';

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
