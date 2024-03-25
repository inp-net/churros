<script lang="ts">
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { queryParam } from 'sveltekit-search-params';
  import FormBasicDetails from '../../FormBasicDetails.svelte';
  import Card from '$lib/components/Card.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  /**
   * The local id of the section we're currently looking at.
   */
  let editingSectionId = queryParam('section', {
    encode: (v) => v || sections[0].localId,
    decode: (v) => v,
  });

  $: ({ title, sections } = data.form);
  $: editingSection = sections.find((s) => s.localId === $editingSectionId) ?? sections[0];
</script>

<svelte:head>
  <title>{title} — Modification du formulaire</title>
</svelte:head>

<h1>Modifier {title}</h1>

<FormBasicDetails
  collapsed
  collapsible
  data={data.form}
  availableGroups={data.me.boardMemberships.map((g) => g.group)}
></FormBasicDetails>

{#if sections.length > 1}
  <NavigationTabs
    tabs={sections.map((section) => ({
      href:
        ($editingSectionId ?? sections[0].localId) === section.localId
          ? '.'
          : './?' + new URLSearchParams({ section: section.localId }).toString(),
      name: section.title || `Section ${section.order}`,
    }))}
  ></NavigationTabs>
{/if}

<header class="section-details">
  <InputText
    value={editingSection?.title ?? ''}
    label=""
    placeholder="Titre de la section (optionnel)"
    name="new-section.title"
  ></InputText>
  <InputLongText
    rows={3}
    value={editingSection?.description ?? ''}
    label="Description"
    name="new-section.description"
  ></InputLongText>
</header>

{#each editingSection?.questions ?? [] as { id, title, description, order } (id)}
  <Card element="form" method="post">
    <header>
      <h2>
        <InputText
          required
          label=""
          name="{id}.title"
          placeholder="Titre de la question"
          value={title}
        ></InputText>
      </h2>
      <InputLongText rows={2} value={description} label="Description" name="{id}.description"
      ></InputLongText>
    </header>
  </Card>
{/each}

<hr>
<h2>Nouvelle question</h2>
<Card element="form" method="post">
  <header>
    <h2>
      <InputText
        required
        label=""
        name="new-question.title"
        placeholder="Nouvelle question…"
        value=""
      ></InputText>
    </h2>
    <InputLongText rows={2} value="" label="Description" name="new-question.description"
    ></InputLongText>
  </header>
</Card>

<style>
  .section-details {
    margin: 2rem 0;
  }
</style>
