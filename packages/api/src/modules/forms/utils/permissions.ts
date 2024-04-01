import { isWithinPartialInterval, type Context } from '#lib';
import { userCanAccessEvent, userCanManageEvent, userIsOnBoardOf } from '#permissions';
import {
  Visibility,
  type Contribution,
  type ContributionOption,
  type Form,
  type Group,
  type Prisma,
  type StudentAssociation,
} from '@prisma/client';
import { GraphQLError } from 'graphql';

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

export function canCreateForm(
  associatedGroup: null | { uid: string },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!user) return false;
  if (user.admin) return true;
  if (associatedEvent && !userCanManageEvent(associatedEvent, user, { canEdit: true }))
    return false;
  if (associatedGroup && !userIsOnBoardOf(user, associatedGroup.uid)) return false;
  return true;
}

export function canSeeAllAnswers(
  form: { createdById: string | null; group: null | { uid: string } },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!user) return false;
  if (canEditForm(form, associatedEvent, user)) return true;
  if (form.group && userIsOnBoardOf(user, form.group.uid)) return true;
  return false;
}

export function canAnswerForm(
  form: Form & { group: Group | null },
  associatedEvent: Parameters<typeof userCanAccessEvent>[0] | null,
  user: Context['user'],
  userContributions: Array<
    Contribution & { option: ContributionOption & { paysFor: StudentAssociation[] } }
  >,
) {
  if (user?.admin) return true;
  if (
    form.restrictToPromotions.length > 0 &&
    (!user || !form.restrictToPromotions.includes(user.graduationYear))
  ) {
    console.error(
      `${user?.uid} cannot modify ${form.id}: graduationYear check failed: ${user?.graduationYear} not in ${form.restrictToPromotions}`,
    );
    return false;
  }
  if (form.contributorsOnly) {
    if (!form.group) throw new GraphQLError('Cannot have a contributorsOnly form without a group');

    if (
      !userContributions.some((c) =>
        c.option.paysFor.some((p) => p.id === form.group?.studentAssociationId),
      )
    ) {
      console.error(
        `${user?.uid} cannot answer ${form.id}: not a contributor of ${form.group?.studentAssociationId}`,
      );
      return false;
    }
  }

  return (
    isWithinPartialInterval(new Date(), { start: form.opensAt, end: form.closesAt }) &&
    (!associatedEvent || userCanAccessEvent(associatedEvent, user))
  );
}

export function canModifyFormAnswers(
  form: Form & { group: Group | null },
  associatedEvent: Parameters<typeof userCanAccessEvent>[0] | null,
  user: Context['user'],
  userContributions: Array<
    Contribution & { option: ContributionOption & { paysFor: StudentAssociation[] } }
  >,
) {
  if (!form.allowEditingAnswers) return false;
  if (!canAnswerForm(form, associatedEvent, user, userContributions)) return false;
  return true;
}

export function canSeeForm(
  form: {
    createdById: string | null;
    visibility: Visibility;
    group: null | { id: string; studentAssociation: null | { schoolId: string } };
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
    form.group &&
    !user?.groups?.some((g) => g.group.id === form.group?.id)
  )
    return false;

  // When the form is schoolrestricted, only members of the school can see it
  if (
    form.visibility === Visibility.SchoolRestricted &&
    form.group &&
    !user?.major?.schools.some((s) => form.group?.studentAssociation?.schoolId === s.id)
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

export function canSetFormAnswerCheckboxes(
  form: Form & { group: Group | null },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!form.enableAnswersCompletionCheckbox) return false;
  return canSeeAllAnswers(form, associatedEvent, user);
}
