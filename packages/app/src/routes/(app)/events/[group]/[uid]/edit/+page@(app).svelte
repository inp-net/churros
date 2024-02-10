<script lang="ts">
  import { page } from '$app/stores';
  import { fullsizePage } from '$lib/../routes/(app)/+layout.svelte';
  import FormEventBeta from '$lib/components/FormEventBeta.svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  onMount(() => {
    $fullsizePage = true;

    return () => {
      $fullsizePage = false;
    };
  });
</script>

<div class="content">
  <FormEventBeta
    currentStep={$page.url.searchParams.get('step') ?? 'details'}
    creating={false}
    goBackTo=".."
    bind:event={data.event}
  ></FormEventBeta>
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    padding: 0 1rem;
    flex-grow: 1;
  }
</style>
