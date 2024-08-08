<script lang="ts">
  import type { PageData } from './$houdini';
  import { MaybeError, ButtonSecondary, AreaEditLinks, Alert } from '$lib/components';
  import { route } from '$lib/ROUTES';
  import { refroute } from '$lib/navigation';
  import { mutate } from '$lib/mutations';
  import { onceLoaded, mapLoading, LoadingText } from '$lib/loading';

  export let data: PageData;
  $: ({ PageEditEventTicketLinks } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEditEventTicketLinks} let:data={{ event }}>
  <div class="contents">
    {#if event.ticket}
      <AreaEditLinks resource={event.ticket} />
    {:else}
      <Alert theme="danger">
        <p>Billet introuvable</p>
      </Alert>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
