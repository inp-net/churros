<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import FormShopItem from '../../../../../../../../src.old/lib/components/FormShopItem.svelte';
  import FormPictureItem from '$lib/components/FormPictureItem.svelte';

  export let data: PageData;

  let warningToastId: string;

  onMount(() => {
    warningToastId = toasts.warn('Page en bêta', 'Les boutiques sont en phase de test', {
      lifetime: Number.POSITIVE_INFINITY,
    })!;
  });

  onDestroy(async () => {
    await toasts.remove(warningToastId);
  });
</script>

<div class="header">
  <BackButton go="../." />
  <h1>Modifier un article de {data.group.name}</h1>
</div>
<FormPictureItem
  itemId={data.group.shopItem.id}
  groupUid={data.group.uid}
  pictures={data.group.shopItem.pictures}
/>
<FormShopItem data={data.group.shopItem} availableLydiaAccounts={data.group.lydiaAccounts} />

<style>
  .header {
    display: flex;
    gap: 1em;
    align-items: center;
  }
</style>
