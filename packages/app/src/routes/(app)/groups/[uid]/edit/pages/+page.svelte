<script lang="ts">
  import { page } from '$app/stores';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ListManageCustomPages from '$lib/components/ListManageCustomPages.svelte';
  import ModalCreateCustomPage from '$lib/components/ModalCreateCustomPage.svelte';
  import IconAdd from '~icons/mdi/plus';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageGroupCustomPageList } = data);

  let newPageDialog: HTMLDialogElement;
</script>

<ModalCreateCustomPage
  parentResource="group"
  parentResourceUid={$page.params.uid}
  bind:element={newPageDialog}
/>

<div class="content">
  <h2>
    Pages du groupe

    <ButtonSecondary icon={IconAdd} on:click={() => newPageDialog.showModal()}
      >Créer une page</ButtonSecondary
    >
  </h2>
  {#if $PageGroupCustomPageList.data?.group}
    {@const group = $PageGroupCustomPageList.data.group}
    <ListManageCustomPages {newPageDialog} {group}></ListManageCustomPages>
  {/if}
</div>

<style>
  h2 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
