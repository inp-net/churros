<script lang="ts">
  import CardService from '$lib/components/CardService.houdini.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { isMobile } from '$lib/mobile';
  import type { PageData } from './$houdini';

  const mobile = isMobile();

  export let data: PageData;
  $: ({ PageServices } = data);
</script>

<MaybeError result={$PageServices} let:data={{ services }}>
  <div class="contents">
    <p class="typo-details muted">
      {#if mobile}Reste appuyé{:else}Clic-droit{/if} sur un service pour l'épingler ;)
    </p>
    <ul class="services">
      {#each services as service}
        <CardService reloadListOnPinChange {service} />
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
    grid-auto-rows: 1fr;

    /* Used to prevent double borders on cards, see https://stackoverflow.com/a/66458873 */
    gap: var(--border-block);
    width: 100%;
  }

  p {
    margin-bottom: 1rem;
    font-weight: normal;
    text-align: center;
  }
</style>
