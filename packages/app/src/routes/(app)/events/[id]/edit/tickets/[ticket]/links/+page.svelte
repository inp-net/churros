<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import AreaEditLinks from '$lib/components/AreaEditLinks.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEditEventTicketLinks } = data);
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
