<script lang="ts">
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Card from '$lib/components/Card.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import { zeus } from '$lib/zeus';
  import throttle from 'lodash.throttle';
  import { queryParam } from 'sveltekit-search-params';
  import IconArrowRight from '~icons/mdi/arrow-right';
  import IconList from '~icons/mdi/list-box-outline';
  import type { PageData } from './$types';
  import { _formNodeQuery } from './+page';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import IconEdit from '~icons/mdi/pencil-outline';

  export let data: PageData;
  const q = queryParam('q', {
    encode: (v) => v || undefined,
    decode: (v) => v ?? '',
  });
  let searchResults: typeof data.forms = [];

  async function search(q: string) {
    const { searchForms } = await $zeus.query({
      searchForms: [{ q }, { form: _formNodeQuery }],
    });
    return searchForms.map((result) => result.form);
  }

  const throttledSearch = throttle(search, 500);

  $: if ($q) {
    throttledSearch($q)?.then((results) => {
      searchResults = results;
    });
  }
</script>

<section class="search">
  <h1>Mes formulaires</h1>
  <InputSearchQuery bind:q={$q} on:search={async () => {}} />
</section>

<section class="new">
  <ButtonPrimary href="/forms/create">Créer</ButtonPrimary>
</section>

<ul class="forms nobullet">
  {#each $q ? searchResults : data.forms as form (form.id)}
    <Card element="li">
      <h2>
        {#if form.group}
          <AvatarGroup href={undefined} {...form.group}></AvatarGroup>
        {/if}
        {form.title}
      </h2>
      <div data-user-html>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html form.descriptionHtml}
      </div>
      <section class="links">
        <ButtonSecondary icon={IconArrowRight} href="/forms/{form.localId}/answer"
          >Répondre</ButtonSecondary
        >
        {#if form.canSeeAnswers}
          <ButtonSecondary icon={IconList} href="/forms/{form.localId}/answers"
            >Réponses</ButtonSecondary
          >
        {/if}
        {#if form.canEdit}
          <ButtonSecondary icon={IconEdit} href="/forms/{form.localId}/edit"
            >Modifier</ButtonSecondary
          >
        {/if}
      </section>
    </Card>
  {:else}
    <p class="nothing">Aucun formulaire</p>
  {/each}
</ul>

<style>
  .forms {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em 1em;
    align-items: center;
  }

  section.new {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5em 1em;
    align-items: center;
    justify-content: center;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 2rem;
  }

  h2 {
    display: flex;
    column-gap: 0.5em;
    align-items: center;
  }
</style>
