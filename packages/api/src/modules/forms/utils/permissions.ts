import { isWithinPartialInterval, type Context } from '#lib';
import { userCanAccessEvent, userCanManageEvent } from '#permissions';
import type { Prisma } from '@prisma/client';

export const requiredIncludesForPermissions = {
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
  form: { createdById: string | null },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!user) return false;
  return (
    user.admin ||
    user.id === form.createdById ||
    !associatedEvent ||
    userCanManageEvent(associatedEvent, user, {})
  );
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
  form: { createdById: string | null },
  associatedEvent:
    | (Parameters<typeof userCanAccessEvent>[0] & Parameters<typeof userCanManageEvent>[0])
    | null,
  user: Context['user'],
) {
  return (
    user?.admin ||
    (user && user.id === form.createdById) ||
    !associatedEvent ||
    userCanAccessEvent(associatedEvent, user) ||
    userCanManageEvent(associatedEvent, user, {})
  );
}
