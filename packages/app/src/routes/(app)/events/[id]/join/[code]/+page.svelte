<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { mutationErrorMessages, mutationSucceeded } from '$lib/errors';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';

  const Join = graphql(`
    mutation UseTicketInviteCode($code: String!) {
      useTicketInviteCode(code: $code) {
        ...MutationErrors
        ... on MutationUseTicketInviteCodeSuccess {
          data {
            localID
            tickets {
              localID
              invited(code: $code)
              name
            }
          }
        }
      }
    }
  `);

  let errors: string[] = [];

  onMount(async () => {
    const result = await Join.mutate({ code: $page.params.code });
    if (mutationSucceeded('useTicketInviteCode', result)) {
      const thisTicket = result.data.useTicketInviteCode.data.tickets.find((t) => t.invited);
      if (!thisTicket) {
        errors = [
          "Ce code ne t'a pas donné accès au billet car il possède des contraintes que tu ne remplis pas. Vérifie avec l'orga.",
        ];
        return;
      }
      toasts.success('Code utilisé', `Tu as maintenant accès au billet ${thisTicket.name}`);
      await goto(
        route('/events/[id]', result.data.useTicketInviteCode.data.localID, {
          ticket: thisTicket.localID,
        }),
      );
    } else {
      errors = mutationErrorMessages('useTicketInviteCode', result);
    }
  });
</script>

{#if errors.length === 0}
  <LoadingScreen>
    <p>Redirection vers l'évènement…</p>
  </LoadingScreen>
{:else}
  <Alert theme="danger">
    <h1>Ooops!</h1>
    <ul>
      {#each errors as error}
        <li>{error}</li>
      {/each}
    </ul>
  </Alert>
{/if}
