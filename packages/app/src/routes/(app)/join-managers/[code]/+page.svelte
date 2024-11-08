<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import Alert from '$lib/components/Alert.svelte';
  import LoadingChurros from '$lib/components/LoadingChurros.svelte';
  import { mutationErrorMessages } from '$lib/errors';
  import { route } from '$lib/ROUTES';
  import { toasts } from '$lib/toasts';
  import { onMount } from 'svelte';

  let error: string | null = null;

  const UseInvite = graphql(`
    mutation UseEventManagerInvite($code: String!) {
      useEventManagerInvite(code: $code) {
        ... on MutationUseEventManagerInviteSuccess {
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
      const { event } = result.data.useEventManagerInvite.data;
      toasts.success('Et voilà!', `Tu es maintenant manager de ${event.title}`);
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
    <LoadingChurros />
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
