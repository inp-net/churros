<script lang="ts">
  import { PendingValue } from '$houdini';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { formatDate } from '$lib/dates';
  import { allLoaded, loaded, loading } from '$lib/loading';
  import { subDays } from 'date-fns';
  import IconDelete from '~icons/mdi/delete-outline';
  import type { PageData } from './$houdini';
  export let data: PageData;
  $: ({ PageGroupCustomPageEdit } = data);
  let title = '';
  let body = '';

  $: if (
    $PageGroupCustomPageEdit.data &&
    allLoaded($PageGroupCustomPageEdit.data) &&
    $PageGroupCustomPageEdit.data.group.page
  ) 
    ({ title, body } = $PageGroupCustomPageEdit.data.group.page);
  
</script>

<div class="content">
  {#if $PageGroupCustomPageEdit.data?.group.page}
    {@const page = $PageGroupCustomPageEdit.data.group.page}
    <h1>
      <ButtonBack></ButtonBack>
      {#if loaded(page.title)}
        <InputText bind:value={title} label="Titre"></InputText>
      {:else}
        <LoadingText>Lorem ipsum dolor sit amet, consequitur jsp</LoadingText>
      {/if}
    </h1>

    <section class="metadata">
      <p class="muted">
        Dernière modification le <LoadingText
          value={loaded(page.updatedAt) ? formatDate(page.updatedAt) : PendingValue}
        >
          {formatDate(subDays(new Date(), 5))}
        </LoadingText>
        {#if loading(page.canBeEdited, false) && allLoaded(page.lastAuthor) && page.lastAuthor}
          par <AvatarPerson inline small href="/users/{page.lastAuthor.uid}" {...page.lastAuthor}
          ></AvatarPerson>
        {/if}
      </p>
    </section>

    <div>
      {#if loaded(page.body)}
        <InputLongText bind:value={body} label="Contenu"></InputLongText>
      {:else}
        <LoadingText lines={20}></LoadingText>
      {/if}
    </div>

    <section class="actions">
      {#if loaded(page.group.uid) && loaded(page.path)}
        <ButtonGhost help="Supprimer" href="/groups/{page.group.uid}/pages/delete/{page.path}">
          <IconDelete></IconDelete>
        </ButtonGhost>
      {/if}
      <!-- <div class="to-right"></div>
      <ButtonPrimary -->
    </section>
  {:else if $PageGroupCustomPageEdit.errors}
    <h1>Oops!</h1>
    <ul>
      {#each $PageGroupCustomPageEdit.errors as { message }}
        <li>{message}</li>
      {/each}
    </ul>
  {:else}
    <!-- TODO handle in +page.ts by throwing error(404) instead -->
    Cette page n'existe pas (ou plus)
  {/if}
</div>

<style>
  h1 {
    display: flex;
    align-items: center;
  }

  section.actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-top: 1rem;
  }

  section.metadata {
    margin-bottom: 2rem;
  }

  section.metadata p {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.5ch;
    align-items: center;
  }
</style>
