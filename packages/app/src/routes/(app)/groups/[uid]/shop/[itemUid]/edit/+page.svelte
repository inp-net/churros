<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import FormShopItem from '$lib/components/FormShopItem.svelte';
  import FormPictureItem from '$lib/components/FormPictureItem.svelte';

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

<h1>Nouvel article</h1>
<FormPictureItem
  itemId={data.shopItem.id}
  groupUid={data.shopItem.group.uid}
  pictures={data.shopItem.pictures}
/>
<FormShopItem data={data.shopItem} availableLydiaAccounts={data.lydiaAccounts} />
