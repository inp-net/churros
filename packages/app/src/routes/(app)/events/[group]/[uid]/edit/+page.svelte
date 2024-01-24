<script lang="ts">
  import FormEvent from '$lib/components/FormEvent.svelte';
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import FormEventBeta from '$lib/components/FormEventBeta.svelte';

  export let data: PageData;
</script>

<div class="content">
  <FormEventBeta bind:event={data.event}></FormEventBeta>
  <!-- <FormEvent
    redirectAfterSave={() => $page.url.searchParams.get('back') || '../'}
    availableLydiaAccounts={data.lydiaAccounts}
    bind:event={data.event}
  /> -->
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    padding: 0 1rem;
  }
</style>
