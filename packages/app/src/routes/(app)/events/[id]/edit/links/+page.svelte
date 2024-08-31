<script lang="ts">
  import AreaEditLinks from '$lib/components/AreaEditLinks.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';
  export let data: PageData;

  $: ({ PageEventEditLinks } = data);
</script>

<MaybeError result={$PageEventEditLinks} let:data={{ event }}>
  <div class="contents">
    <AreaEditLinks resource={event} />
    {#if event.tickets.length === 0}
      <section class="explainer">
        Nomme un lien "Billetterie" pour indiquer une billetterie externe
      </section>
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
