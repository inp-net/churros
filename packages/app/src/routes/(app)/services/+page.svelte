<script lang="ts">
  import CardService from '$lib/components/CardService.houdini.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageServices } = data);
</script>

<MaybeError result={$PageServices} let:data={{ services }}>
  <div class="contents">
    <ul class="services">
      {#each services as service}
        <CardService {service} />
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    grid-auto-rows: 1fr;

    /* Used to prevent double borders on cards, see https://stackoverflow.com/a/66458873 */
    gap: var(--border-block);
    width: 100%;
  }
</style>
