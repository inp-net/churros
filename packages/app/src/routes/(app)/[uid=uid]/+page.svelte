<script lang="ts">
  import { MaybeError } from '$lib/components';
  import type { PageData } from './$houdini';
  import Header from './Header.svelte';

  export let data: PageData;
  $: ({ ProfilePage } = data);
</script>

<MaybeError result={$ProfilePage} let:data={{ profile }}>
  <div class="contents">
    <Header {profile} />
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }
</style>
