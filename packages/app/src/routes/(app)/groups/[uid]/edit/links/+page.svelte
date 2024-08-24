<script lang="ts">
  import AreaEditLinks from '$lib/components/AreaEditLinks.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupEditLinks } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageGroupEditLinks} let:data={{ group }}>
  <div class="contents">
    <AreaEditLinks resource={group} />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
