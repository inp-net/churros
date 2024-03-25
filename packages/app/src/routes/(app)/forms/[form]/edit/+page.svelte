<script lang="ts">
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { queryParam } from 'sveltekit-search-params';
  import FormBasicDetails from '../../FormBasicDetails.svelte';
  import Card from '$lib/components/Card.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import type { PageData } from './$types';
  import FormQuestion from './FormQuestion.svelte';
  import FormQuestionSelectOne from './FormQuestionSelectOne.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';

  export let data: PageData;

  let basicInfosCollapsed = true;

  /**
   * The local id of the section we're currently looking at.
   */
  let editingSectionId = queryParam('section', {
    encode: (v) => v || sections[0].localId,
    decode: (v) => v,
  });

  $: ({ title, sections } = data.form);
  $: editingSection =
    $editingSectionId === 'new'
      ? undefined
      : sections.find((s) => s.localId === $editingSectionId) ?? sections[0];
</script>

<svelte:head>
  <title>{title} — Modification du formulaire</title>
</svelte:head>

<div class="content">
  <FormBasicDetails
    bind:collapsed={basicInfosCollapsed}
    collapsible
    data={data.form}
    availableGroups={data.me.boardMemberships.map((g) => g.group)}
  >
    <div slot="header-when-collapsible">
      <h1>Modifier {title}</h1>
    </div>
  </FormBasicDetails>

  {#if sections.length > 1}
    <NavigationTabs
      tabs={[...sections, { title: 'Nouvelle section', localId: 'new', order: -1 }].map(
        (section) => ({
          href:
            ($editingSectionId ?? sections[0].localId) === section.localId
              ? '.'
              : `./?section=${section.localId}`,
          name: section.title || `Section ${section.order}`,
        }),
      )}
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
  <section class="questions">
    {#each editingSection?.questions ?? [] as question (question.id)}
      <FormQuestion id={question.id} initial={question}>
        {#if question.__typename === 'QuestionSelectOne'}
          <input type="hidden" name="{question.id}.options" value={question.options.join(',')} />
          <FormQuestionSelectOne bind:options={question.options}></FormQuestionSelectOne>
        {/if}

        <div class="additional-options" slot="footer">
          {#if question.__typename === 'QuestionSelectOne'}
            <InputCheckbox
              value={question.allowOptionsOther}
              label="Autoriser le choix “autres”"
              name="multiple"
            ></InputCheckbox>
          {/if}
        </div>
      </FormQuestion>
    {/each}

    <hr />
    <FormQuestion>
      <h2 slot="header">Nouvelle question</h2>
    </FormQuestion>
  </section>
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }
  .section-details {
    margin: 2rem 0;
  }

  .questions,
  .section-details {
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }
</style>
