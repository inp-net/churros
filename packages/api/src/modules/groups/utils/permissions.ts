import type { Context } from '#lib';
import { onBoard, userIsAdminOf, userIsGroupEditorOf, userIsMemberOf } from '#permissions';
import { GroupType, Prisma, type Group } from '@churros/db/prisma';

export const requiredPrismaIncludesForPermissions = {
  studentAssociation: true,
  parent: true,
} as const satisfies Prisma.GroupInclude;

export const ALLOWED_SUBGROUP_TYPES: GroupType[] = [
  GroupType.Club,
  GroupType.Association,
  GroupType.Group,
];

/**
 * People that can create a group:
 * - Global admins
 * - People that can edit groups
 * - People that are admins of the new group's student association
 * - People that can edit the parent group, **if the subgroup's type is allowed** (this is to prevent 'regular' users from creating StudentAssociationSections, for example)
 */
export function canCreateGroup(
  user: Context['user'],
  {
    studentAssociationUid,
    parentUid,
    type,
  }: {
    studentAssociationUid?: string | null | undefined;
    /** @deprecated setting parent group is done in another mutation now  */
    parentUid?: string | null | undefined;
    type: GroupType;
  },
): boolean {
  if (!user) return false;
  if (userIsAdminOf(user, studentAssociationUid ?? null)) return true;
  if (userIsGroupEditorOf(user, studentAssociationUid ?? null)) return true;

  if (
    parentUid &&
    ALLOWED_SUBGROUP_TYPES.includes(type) &&
    userIsOnGroupBoard(user, { uid: parentUid })
  )
    return true;

  return false;
}

export function canEditGroup(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{ include: typeof canEditGroup.prismaIncludes }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, group.studentAssociationId)) return true;
  if (userIsOnGroupBoard(user, group)) return true;
  if (
    group.members.some(
      (membership) => membership.memberId === user.id && membership.canEditArticles,
    )
  )
    return true;
  return false;
}

canEditGroup.prismaIncludes = {
  studentAssociation: true,
  parent: true,
  members: true,
} as const satisfies Prisma.GroupInclude;

export function userIsOnGroupBoard(user: Context['user'], group: { uid: string } | { id: string }) {
  return user?.groups.some(
    (membership) => groupsAreTheSame(group, membership.group) && onBoard(membership),
  );
}

export function canEditGroupMembers(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{ include: typeof canEditGroupMembers.prismaIncludes }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, group.studentAssociationId)) return true;
  if (userIsOnGroupBoard(user, group)) return true;
  if (group.members.some((member) => member.memberId === user.id && member.canEditMembers))
    return true;
  return false;
}

canEditGroupMembers.prismaIncludes = {
  members: true,
} as const satisfies Prisma.GroupInclude;

/** Allows passing to function either only the groups' uids or IDs */
function groupsAreTheSame<G extends { id: string } | { uid: string }>(
  group: G,
  otherGroup: G,
): boolean {
  if ('uid' in group && 'uid' in otherGroup) return otherGroup.uid === group.uid;
  if ('id' in group && 'id' in otherGroup) return otherGroup.id === group.id;
  throw new Error('Invalid group comparison: one group has an ID and the other has a UID');
}

export function prismaQueryOnClubBoard(): Prisma.GroupMemberWhereInput {
  return {
    OR: [{ president: true }, { secretary: true }, { vicePresident: true }, { treasurer: true }],
  };
}
export function prismaQueryCanCreatePostsOn(user: { id: string }): Prisma.GroupWhereInput {
  return {
    OR: [
      { studentAssociation: { admins: { some: { id: user.id } } } },
      {
        members: {
          some: {
            memberId: user.id,
            OR: [prismaQueryOnClubBoard(), { canEditArticles: true }, { member: { admin: true } }],
          },
        },
      },
    ],
  };
}

export function canCreatePostsOn(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{ include: typeof canCreatePostsOn.prismaIncludes }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, group.studentAssociationId)) return true;
  if (userIsOnGroupBoard(user, group)) return true;
  if (
    user.groups.some(
      (membership) => groupsAreTheSame(group, membership.group) && membership.canEditArticles,
    )
  )
    return true;
  return false;
}

canCreatePostsOn.prismaIncludes = {
  studentAssociation: true,
} as const satisfies Prisma.GroupInclude;

export function prismaQueryCanCreateEventsOn(user: { id: string }): Prisma.GroupWhereInput {
  return {
    OR: [
      { studentAssociation: { admins: { some: { id: user.id } } } },
      {
        members: {
          some: {
            memberId: user.id,
            OR: [prismaQueryOnClubBoard(), { canEditArticles: true }, { member: { admin: true } }],
          },
        },
      },
    ],
  };
}

export function canSetGroupRoomOpenState(user: Context['user'], group: Group) {
  return (
    userIsAdminOf(user, group.studentAssociationId) ||
    userIsGroupEditorOf(user, group.studentAssociationId) ||
    userIsMemberOf(user, group.uid)
  );
}

export function canSetGroupJoinPolicy(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{
    include: typeof canSetGroupJoinPolicy.prismaIncludes;
  }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, group.studentAssociationId)) return true;
  if (userIsOnGroupBoard(user, group)) return true;
  return false;
}

canSetGroupJoinPolicy.prismaIncludes = {
  studentAssociation: true,
} as const satisfies Prisma.GroupInclude;

export function canChangeGroupType(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{
    include: typeof canChangeGroupType.prismaIncludes;
  }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (user.canEditGroups) return true;
  return false;
}

canChangeGroupType.prismaIncludes = {
  studentAssociation: true,
} as const satisfies Prisma.GroupInclude;

export function canChangeGroupStudentAssociation(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{
    include: typeof canChangeGroupStudentAssociation.prismaIncludes;
  }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (user.canEditGroups) return true;
  return false;
}

canChangeGroupStudentAssociation.prismaIncludes = {
  studentAssociation: true,
} as const satisfies Prisma.GroupInclude;

export function canChangeParentGroup(
  user: Context['user'],
  {
    child,
    parent,
  }: {
    child: Prisma.GroupGetPayload<{
      include: typeof canChangeParentGroup.prismaIncludes;
    }>;
    /** The 'any' value should only be used for UI purposes, and tells us that user can do at least something about the parent group (set it to some group, or maybe remove it) */
    parent:
      | 'any'
      | null
      | Prisma.GroupGetPayload<{
          include: typeof canChangeParentGroup.prismaIncludes;
        }>;
  },
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, child.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, child.studentAssociationId)) return true;
  if (!canEditGroup(user, child)) return false;
  if (parent === 'any') return true;
  if (parent) return canEditGroup(user, parent);
  // Only admins & group editors can unset a parent group
  // Is this the right things to do? idk
  return false;
}

canChangeParentGroup.prismaIncludes = {
  ...canEditGroup.prismaIncludes,
} as const satisfies Prisma.GroupInclude;

export function canEditLydiaAccounts(
  user: Context['user'],
  group: Prisma.GroupGetPayload<{
    include: typeof canEditLydiaAccounts.prismaIncludes;
  }>,
) {
  if (!user) return false;
  if (user.admin) return true;
  if (userIsAdminOf(user, group.studentAssociationId)) return true;
  if (userIsGroupEditorOf(user, group.studentAssociationId)) return true;
  if (userIsOnGroupBoard(user, group)) return true;
  return false;
}

canEditLydiaAccounts.prismaIncludes = {
  studentAssociation: true,
} as const satisfies Prisma.GroupInclude;

export function canCreateGroupAccessToken(user: Context['user'], group: Group) {
  if (!user) return false;
  if (user.admin) return true;
  if (
    user.groups.some(
      (membership) => membership.isDeveloper && groupsAreTheSame(group, membership.group),
    )
  )
    return true;
  return false;
}
