import { isWithinPartialInterval, type Context } from '#lib';
import { userCanAccessEvent, userCanManageEvent, userIsOnBoardOf } from '#permissions';
import { Visibility, type Prisma } from '@prisma/client';

export const requiredIncludesForPermissions = {
  group: { include: { studentAssociation: true } },
  event: {
    include: {
      managers: { include: { user: true } },
      coOrganizers: true,
      group: { include: { studentAssociation: { include: { school: true } } } },
      tickets: true,
    },
  },
} as const satisfies Prisma.FormInclude;

export function canEditForm(
  form: { createdById: string | null },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!user) return false;
  return (
    user.admin ||
    user.id === form.createdById ||
    !associatedEvent ||
    userCanManageEvent(associatedEvent, user, {
      canEdit: true,
    })
  );
}

export function canSeeAllAnswers(
  form: { createdById: string | null; group: { uid: string } },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!user) return false;
  if (user.admin) return true;
  if (user.id === form.createdById) return true;
  if (associatedEvent && userCanManageEvent(associatedEvent, user, { canEdit: true })) return true;
  if (userIsOnBoardOf(user, form.group.uid)) return true;
  return false;
}

export function canAnswerForm(
  form: { opensAt: Date | null; closesAt: Date | null },
  associatedEvent: Parameters<typeof userCanAccessEvent>[0] | null,
  user: Context['user'],
) {
  if (user?.admin) return true;
  return (
    isWithinPartialInterval(new Date(), { start: form.opensAt, end: form.closesAt }) &&
    (!associatedEvent || userCanAccessEvent(associatedEvent, user))
  );
}

export function canSeeForm(
  form: {
    createdById: string | null;
    visibility: Visibility;
    group: { id: string; studentAssociation: null | { schoolId: string } };
  },
  associatedEvent:
    | (Parameters<typeof userCanAccessEvent>[0] & Parameters<typeof userCanManageEvent>[0])
    | null,
  user: Context['user'],
) {
  // Admins can see everything
  if (user?.admin) return true;
  // Creators can see their own forms
  if (user && user.id === form.createdById) return true;

  // When the form is grouprestricted, only members of the group can see it
  if (
    form.visibility === Visibility.GroupRestricted &&
    !user?.groups?.some((g) => g.group.id === form.group.id)
  )
    return false;

  // When the form is schoolrestricted, only members of the school can see it
  if (
    form.visibility === Visibility.SchoolRestricted &&
    !user?.major?.schools.some((s) => form.group.studentAssociation?.schoolId === s.id)
  )
    return false;

  // When the form has an associated event, check that the user can see the event
  if (
    associatedEvent &&
    !(userCanAccessEvent(associatedEvent, user) || userCanManageEvent(associatedEvent, user, {}))
  )
    return false;

  return true;
}
