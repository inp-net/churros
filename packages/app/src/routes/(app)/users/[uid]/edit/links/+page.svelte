<script lang="ts">
  import AreaEditLinks from '$lib/components/AreaEditLinks.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';
  export let data: PageData;

  $: ({ PageUserEditLinks } = data);
</script>

<MaybeError result={$PageUserEditLinks} let:data={{ user }}>
  <div class="contents">
    <AreaEditLinks resource={user} />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
