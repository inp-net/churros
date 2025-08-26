import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { LayoutManageSignupsStore, graphql } from '$houdini';
import { type MaybeLoading, loaded } from '$lib/loading';
import { route } from '$lib/ROUTES';
import { toasts } from '$lib/toasts';
import debounce from 'lodash.debounce';
import { get, writable } from 'svelte/store';

/** Store of signup emails we are currently deciding upon */
export const decidingOn = writable<
  Array<{
    email: string;
    accepted: boolean;
  }>
>([]);

/** Store of signup emails that were decided, that we need to hide. See setDecisionTaken's definition inside shared.ts for an exaplantion of why this is useful */
export const decided = writable<string[]>([]);

export async function reloadCandidates() {
  await new LayoutManageSignupsStore().fetch();
}

// Signup emails that will finish decision once setDecisionTaken is effectively called (and not debounced)
let willDecideOn: Array<{ email: string; accepted: boolean }> = [];

// These are to update the decidionOn/decided stores only after a certain delay
// This allows to quickly decide on multiple signups without the items jumping around
function _setDecisionTaken() {
  decidingOn.update((list) =>
    list.filter((e) => !willDecideOn.some((will) => e.email === will.email)),
  );
  decided.update((list) => [...list, ...willDecideOn.map((e) => e.email)]);
  willDecideOn = [];
  // Don't stay on a page that will have no more info
  if (get(page).route.id === '/(app)/signups/edit/[email]') goto(route('/signups'));
}
const setDecisionTaken = debounce(_setDecisionTaken, 1000);

/** Enum to select the admin decision about a pending UserCandidate */
export type Decision = 'Accept' | 'Drop' | 'Refuse';

export async function decide(
  email: MaybeLoading<string>,
  decision: Decision,
  why = '',
): Promise<void> {
  if (!loaded(email)) return;

  let ok = false;
  decidingOn.update((list) => [...list, { email, accepted: decision === 'Accept' }]);
  switch (decision) {
    case 'Accept':
      {
        const result = await graphql(`
          mutation AcceptUserCandidate($email: String!) {
            acceptUserCandidate(email: $email) {
              ...MutationErrors
              ... on MutationAcceptUserCandidateSuccess {
                data {
                  email
                }
              }
            }
          }
        `).mutate({ email });

        ok = toasts.mutation(
          result,
          'acceptUserCandidate',
          'Inscription acceptée',
          "Impossible d'accepter l'inscription",
        );
      }
      break;

    case 'Drop':
      {
        const result = await graphql(`
          mutation DropUserCandidate($email: String!) {
            dropUserCandidate(email: $email) {
              ...MutationErrors
              ... on MutationDropUserCandidateSuccess {
                data {
                  email
                }
              }
            }
          }
        `).mutate({ email });

        ok = toasts.mutation(
          result,
          'dropUserCandidate',
          'Inscription supprimée',
          "Impossible de supprimer l'inscription",
        );
      }
      break;

    case 'Refuse':
      {
        const result = await graphql(`
          mutation RefuseUserCandidate($email: String!, $why: String!) {
            refuseUserCandidate(email: $email, reason: $why) {
              ...MutationErrors
              ... on MutationRefuseUserCandidateSuccess {
                data {
                  email
                }
              }
            }
          }
        `).mutate({ email, why });

        ok = toasts.mutation(
          result,
          'refuseUserCandidate',
          'Inscription refusée',
          "Impossible de refuser l'inscription",
        );
      }
      break;
  }

  if (ok) {
    willDecideOn.push({
      email,
      accepted: decision === 'Accept',
    });
  } else {
    decidingOn.update((list) => list.filter((e) => e.email !== email));
  }

  setDecisionTaken();
}

export { default as IconRefuse } from '~icons/msl/back-hand-outline';
export { default as IconDrop } from '~icons/msl/delete-forever';
export { default as IconAccept } from '~icons/msl/thumb-up-outline';
