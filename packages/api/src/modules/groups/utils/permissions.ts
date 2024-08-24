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

/**
 * Group edition: board members can edit the group if the student association stays the same.
 * When the student association changes, we check that the user could create a new group with the new student association and could also create the group under the old student association.
 * Otherwise, they are the same permissions as if we tried to create a new group with the info given in `newGroup`.
 */
export function canEditGroup(
  user: Context['user'],
  existingGroup: Prisma.GroupGetPayload<{ include: typeof canEditGroup.prismaIncludes }>,
  newGroup:
    | {
        studentAssociationUid?: string | null | undefined;
        studentAssociationId?: string | null | undefined;
        type: GroupType;
        parentUid?: string | null | undefined;
      }
    | undefined
    | null = null,
  newParentGroup: null | Prisma.GroupGetPayload<{
    include: typeof canEditGroup.prismaIncludes;
  }> = null,
) {
  if (!user) return false;

  if (newGroup === undefined) {
    newGroup = {
      studentAssociationId: existingGroup.studentAssociation?.id,
      studentAssociationUid: existingGroup.studentAssociation?.uid,
      type: existingGroup.type,
      parentUid: existingGroup.parent?.uid,
    };
  }

  if (
    userIsAdminOf(user, existingGroup.studentAssociationId) &&
    userIsAdminOf(user, newGroup?.studentAssociationId)
  )
    return true;

  if (
    userIsGroupEditorOf(user, existingGroup.studentAssociationId) &&
    userIsGroupEditorOf(user, newGroup?.studentAssociationId)
  )
    return true;

  if (
    userIsOnGroupBoard(user, existingGroup) &&
    // Regular club members cannot change the student association
    equalOrBothNotProvided(
      existingGroup.studentAssociation?.uid,
      newGroup?.studentAssociationUid,
    ) &&
    // Either the parent group stayed the same
    (equalOrBothNotProvided(existingGroup.parent?.uid, newGroup?.parentUid) ||
      // Or we removed it
      !newGroup?.parentUid ||
      // Or we changed it, but the user can edit the new parent group
      (newParentGroup && canEditGroup(user, newParentGroup)))
  )
    return true;

  if (
    newGroup &&
    canCreateGroup(user, newGroup) &&
    canCreateGroup(user, {
      studentAssociationUid: existingGroup.studentAssociation?.uid,
      parentUid: existingGroup.parent?.uid,
      type: existingGroup.type,
    })
  )
    return true;

  return false;
}

canEditGroup.prismaIncludes = {
  studentAssociation: true,
  parent: true,
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

/**
 * Silly function to check if a and b are both null or undefined, or equal to the same value
 */
function equalOrBothNotProvided<T>(a: T | null | undefined, b: T | null | undefined): boolean {
  return a === null || a === undefined ? b === null || b === undefined : a === b;
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
