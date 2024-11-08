import { graphql } from '$houdini';
import { mutationErrorMessages, mutationSucceeded } from '$lib/errors.js';

const UseInvite = graphql(`
  mutation UseEventManagerInvite($code: String!) {
    useEventManagerInvite(code: $code) {
      ... on MutationUseEventManagerInviteSuccess {
        data {
          event {
            localID
            title
          }
          ...List_EventManagers_insert
        }
      }
      ...MutationErrors
    }
  }
`);

export async function load(event) {
  const result = await UseInvite.mutate({ code: event.params.code }, { event });

  if (mutationSucceeded('useEventManagerInvite', result)) {
    return {
      error: null,
      manager: result.data,
    };
  }

  return {
    error: mutationErrorMessages('useEventManagerInvite', result).join('\n\n'),
    manager: null,
  };
}
