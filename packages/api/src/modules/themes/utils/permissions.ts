import type { Context } from '#lib';
import { userIsMemberOf, userIsPartOfStudentAssociation } from '#permissions';
import { Prisma, Visibility, type Group, type Theme } from '@churros/db/prisma';
import { isWithinInterval } from 'date-fns';

export function canCreateThemes(
  user: Context['user'],
  group: Group,
  level: 'can' | 'want' = 'can',
  _themeid = '',
): boolean {
  if (!user) return false;
  if (level === 'can' && user.admin) return true;
  if (
    level === 'can' &&
    user.adminOfStudentAssociations.some((s) => s.id === group.studentAssociationId)
  )
    return true;

  return user.groups.some((g) => g.groupId === group.id);
}

export const canCreateThemesPrismaQuery = (user: { id: string }) =>
  ({
    members: {
      some: {
        memberId: user.id,
      },
    },
  }) as const satisfies Prisma.GroupWhereInput;

export function canEditTheme(
  user: Context['user'],
  theme: Prisma.ThemeGetPayload<{ include: typeof canEditTheme.prismaIncludes }>,
  level: 'can' | 'want' = 'can',
) {
  if (!theme.author) return Boolean(user?.admin);
  return canCreateThemes(user, theme.author, level, theme.id);
}

canEditTheme.prismaIncludes = {
  author: true,
} as const satisfies Prisma.ThemeInclude;

export function canSeeTheme(user: Context['user'], theme: Theme & { author: Group | null }) {
  if (user?.admin) return true;
  if (theme.visibility === Visibility.Public) return true;
  if (theme.visibility === Visibility.Unlisted) return true;
  if (theme.author) {
    if (user?.adminOfStudentAssociations.some((sa) => sa.id === theme.author?.studentAssociationId))
      return true;
    if (theme.visibility === Visibility.Private)
      return canCreateThemes(user, theme.author, 'can', theme.id);
    if (theme.visibility === Visibility.GroupRestricted && theme.author)
      return userIsMemberOf(user, theme.author.uid);
    if (theme.visibility === Visibility.SchoolRestricted && theme.author.studentAssociationId)
      return userIsPartOfStudentAssociation(user, theme.author.studentAssociationId);
  }
  return false;
}

export function canListTheme(
  user: Context['user'],
  theme: Theme & { author: Group | null },
  level: 'can' | 'want' = 'can',
) {
  // If you can't see the theme, you can't list it
  if (!canSeeTheme(user, theme)) return false;
  // Everyone that can see a temporary theme that is active can list it
  if (
    theme.startsAt &&
    theme.endsAt &&
    isWithinInterval(new Date(), {
      start: theme.startsAt,
      end: theme.endsAt,
    }) &&
    canSeeTheme(user, theme)
  )
    return true;
  // If the theme isn't active yet, only ones that can edit it can list it
  return canEditTheme(user, theme, level);
}

export function canSetThemeVisibility(
  user: Context['user'],
  theme: Theme & { author: Group | null },
  newVisibility: Visibility,
) {
  if (!theme.author) return Boolean(user?.admin);
  if (newVisibility === Visibility.Public) return Boolean(user?.admin);
  if (newVisibility === Visibility.SchoolRestricted) {
    return Boolean(
      user?.admin ||
        user?.adminOfStudentAssociations.some((sa) => sa.id === theme.author?.studentAssociationId),
    );
  }
  return canEditTheme(user, theme);
}
