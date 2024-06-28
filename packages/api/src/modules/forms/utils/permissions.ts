import { isWithinPartialInterval, type Context } from '#lib';
import { userCanAccessEvent, userCanManageEvent, userIsOnBoardOf } from '#permissions';
import {
  Visibility,
  type Contribution,
  type ContributionOption,
  type Form,
  type FormSection,
  type Group,
  type Prisma,
  type Question,
  type StudentAssociation,
} from '@churros/db/prisma';
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
  if (user.admin) return true;
  if (user.id === form.createdById) return true;
  if (associatedEvent && userCanManageEvent(associatedEvent, user, { canEdit: true })) return true;
  return false;
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
  if (
    associatedEvent &&
    !userCanManageEvent(associatedEvent, user, { canVerifyRegistrations: true })
  )
    return false;
  if (form.group && userIsOnBoardOf(user, form.group.uid)) return true;
  if (form.group && user.groups.some((g) => g.group.uid === form.group?.uid && g.canScanEvents))
    return true;
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

  return isOpenForAnswers(form) && (!associatedEvent || userCanAccessEvent(associatedEvent, user));
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

export function canSeeAnswerStats(
  form: Form & { group: Group | null; sections: Array<FormSection & { questions: Question[] }> },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!canSeeAllAnswers(form, associatedEvent, user)) return false;
  // Don't allow showing stats if the form has anonymous questions and is still accepting answers. A "timing attack" could result in someone guessing the answers of a specific person otherwise.
  if (hasAnonymousQuestions(form) && isOpenForAnswers(form)) return false;

  return true;
}

export function canSeeAnswerStatsForQuestion(
  question: Question,
  form: Form & { group: Group | null },
  associatedEvent: Parameters<typeof userCanManageEvent>[0] | null,
  user: Context['user'],
) {
  if (!canSeeAllAnswers(form, associatedEvent, user)) return false;
  // See canSeeAnswerStats for the reasoning behind this
  if (question.anonymous && isOpenForAnswers(form)) return false;
  return true;
}

export function isOpenForAnswers(form: Pick<Form, 'opensAt' | 'closesAt'>) {
  return isWithinPartialInterval(new Date(), { start: form.opensAt, end: form.closesAt });
}

export function hasAnonymousQuestions(form: {
  sections: Array<{ questions: Array<Pick<Question, 'anonymous'>> }>;
}) {
  return form.sections.some((section) => section.questions.some((q) => q.anonymous));
}
