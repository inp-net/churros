<script lang="ts">
  import { CardService_houdini as CardService, MaybeError } from '$lib/components';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageServices } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
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
  .contents {
    padding: 0 1rem;
  }

  ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, 6rem);
    grid-auto-rows: 1fr;
    gap: 1rem;
    justify-content: center;
  }
</style>
