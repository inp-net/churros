<script lang="ts">
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ListManageCustomPages from '$lib/components/ListManageCustomPages.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageStudentAssociationListPages } = data);
</script>

<div class="content">
  <h1>
    <ButtonBack go="../.." />
    Gérer les pages
  </h1>

  {#if $PageStudentAssociationListPages.data}
    {@const studentAssociation = $PageStudentAssociationListPages.data.studentAssociation}
    <ListManageCustomPages {studentAssociation} />
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
    align-items: center;
    flex-wrap: wrap;
    column-gap: 1rem;
  }

  ul :global(.card-content) {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
  }
</style>
