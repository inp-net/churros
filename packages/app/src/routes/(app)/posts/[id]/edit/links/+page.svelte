<script lang="ts">
  import type { PageData } from './$houdini';
  import { page } from '$app/stores';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { route } from '$lib/ROUTES';
  import { refroute } from '$lib/navigation';
  import { mutate } from '$lib/mutations';
  import { onceLoaded, mapLoading, LoadingText } from '$lib/loading';
  import AreaEditLinks from '$lib/components/AreaEditLinks.svelte';

  export let data: PageData;
  $: ({ PagePostEditLinks } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PagePostEditLinks} let:data={{ post }}>
  <div class="contents">
    <AreaEditLinks resource={post} />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
