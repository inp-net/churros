<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ListManageCustomPages from '$lib/components/ListManageCustomPages.svelte';
  import ModalCreateCustomPage from '$lib/components/ModalCreateCustomPage.svelte';
  import IconAdd from '~icons/mdi/plus';
  import type { PageData } from './$houdini';
  import { page } from '$app/stores';

  export let data: PageData;
  $: ({ PageStudentAssociationListPages } = data);

  let newPageDialog: HTMLDialogElement;
</script>

<ModalCreateCustomPage
  parentResource="studentAssociation"
  parentResourceUid={$page.params.uid}
  bind:element={newPageDialog}
/>

<div class="content">
  <h1>
    <ButtonBack go="../.." />
    Gérer les pages
    <ButtonSecondary icon={IconAdd} on:click={() => newPageDialog.showModal()}
      >Créer</ButtonSecondary
    >
  </h1>

  {#if $PageStudentAssociationListPages.data}
    {@const studentAssociation = $PageStudentAssociationListPages.data.studentAssociation}
    <ListManageCustomPages {newPageDialog} {studentAssociation} />
  {:else if $PageStudentAssociationListPages.errors}
    <h2>Ooops!</h2>
    <ul>
      {#each $PageStudentAssociationListPages.errors as error}
        <li>{error.message}</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  ul :global(.card-content) {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }
</style>
