<script lang="ts">
  import type { PageData } from './$types';
  import { onDestroy, onMount } from 'svelte';
  import { toasts } from '$lib/toasts';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ShopItemTable from '$lib/components/ShopItemTable.svelte';
  import BackButton from '$lib/components/ButtonBack.svelte';
  import IconAdd from '~icons/mdi/add';

  export let data: PageData;

  const { shopItems } = data.group;
  const isOnClubBoard = Boolean(
    data.group.boardMembers.some((s) => s.member.uid === data.me?.uid || data.me?.admin),
  );

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
  <h1>Gestion de la boutique</h1>
  {#if isOnClubBoard}
    <ButtonSecondary href="../create/">
      Ajouter un article <IconAdd />
    </ButtonSecondary>
  {/if}
</div>

<div class="content">
  <ShopItemTable {shopItems} />
</div>

<style>
  .header {
    display: flex;
    gap: 1em;
    align-items: center;
  }
</style>
