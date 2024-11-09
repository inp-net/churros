<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { mutationErrorMessages } from '$lib/errors';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';

  let error: string | null = null;

  const UseInvite = graphql(`
    mutation UseEventManagerInvite($code: String!) {
      useEventManagerInvite(code: $code) {
        ... on MutationUseEventManagerInviteSuccess {
          alreadyManager
          data {
            event {
              localID
              title
            }
          }
        }
        ...MutationErrors
      }
    }
  `);

  onMount(async () => {
    const result = await UseInvite.mutate({ code: $page.params.code });

    if (result.data?.useEventManagerInvite?.__typename === 'MutationUseEventManagerInviteSuccess') {
      const {
        data: { event },
        alreadyManager,
      } = result.data.useEventManagerInvite;
      if (alreadyManager) toasts.info(alreadyManager);
      else toasts.success('Et voilà!', `Tu es maintenant manager de ${event.title}`);
      goto(route('/events/[id]', event.localID), {});
    } else {
      error = mutationErrorMessages('useEventManagerInvite', result).join('\n\n');
    }
  });
</script>

<div class="contents">
  {#if error}
    <h1>Woops!</h1>
    <Alert theme="danger">Impossible d'utiliser cette invitation: {error}</Alert>
  {:else}
    <LoadingScreen>Redirection vers l'évènement</LoadingScreen>
  {/if}
</div>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
  }
</style>
