<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import FormShopItem from '$lib/components/FormShopItem.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';

  export let data: PageData;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    });
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="header">
  <BackButton go="../." />
  <h1>Nouvel article</h1>
</div>

<FormShopItem bind:data={data.shopItem} availableLydiaAccounts={data.lydiaAccounts} />

<style>
  .header {
    display: flex;
    gap: 1em;
    align-items: center;
  }
</style>
