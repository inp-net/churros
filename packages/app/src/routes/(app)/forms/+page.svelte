<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Card from '$lib/components/Card.svelte';
  import InputSearchQuery from '$lib/components/InputSearchQuery.svelte';
  import { zeus } from '$lib/zeus';
  import throttle from 'lodash.throttle';
  import type { PageData } from './$types';
  import { queryParam } from 'sveltekit-search-params';
  import IconArrowRight from '~icons/mdi/arrow-right';
  import IconList from '~icons/mdi/list-box-outline';

  export let data: PageData;
  let q = queryParam('q', {
    encode: (v) => v || undefined,
    decode: (v) => v ?? '',
  });
  let searchResults: typeof data.allForms.nodes = [];

  async function search(q: string) {
    const { searchForms } = await $zeus.query({
      searchForms: [
        { q },
        { form: { localId: true, id: true, title: true, descriptionHtml: true } },
      ],
    });
    return searchForms.map((result) => result.form);
  }

  const throttledSearch = throttle(search, 500);

  $: if ($q)
    throttledSearch($q)?.then((results) => {
      searchResults = results;
    });
</script>

<section class="search">
  <h1>Formulaires</h1>
  <InputSearchQuery bind:q={$q} on:search={async () => {}} />
</section>

<ul class="forms nobullet">
  {#each $q ? searchResults : data.allForms.nodes as form (form.id)}
    <Card element="li">
      <h2>{form.title}</h2>
      <div data-user-html>
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html form.descriptionHtml}
      </div>
      <section class="links">
        <ButtonSecondary icon={IconList} href="/forms/{form.localId}/answers"
          >Réponses</ButtonSecondary
        >
        <ButtonSecondary icon={IconArrowRight} href="/forms/{form.localId}/answer"
          >Répondre</ButtonSecondary
        >
      </section>
    </Card>
  {:else}
    <p class="nothing">Aucun formulaire</p>
  {/each}
</ul>

<style>
  .forms {
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
  }

  .links {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5em 1em;
  }

  .search {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5em 1em;
    max-width: 600px;
    margin: 0 auto;
    margin-bottom: 2rem;
  }
</style>
