<script lang="ts">
  import { enhance } from '$app/forms';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import NavigationTabs from '$lib/components/NavigationTabs.svelte';
  import { toasts } from '$lib/toasts';
  import { QuestionKind, zeus } from '$lib/zeus';
  import omit from 'lodash.omit';
  import { queryParam } from 'sveltekit-search-params';
  import FormBasicDetails from '../../FormBasicDetails.svelte';
  import type { PageData } from './$types';
  import { _questionQuery } from './+page';
  import FormQuestion from './FormQuestion.svelte';

  export let data: PageData;

  let creatingQuestion = false;
  let basicInfosCollapsed = true;

  /**
   * The local id of the section we're currently looking at.
   */
  const editingSectionId = queryParam('section', {
    encode: (v) => v || sections[0].localId,
    decode: (v) => v,
  });

  $: ({ title, sections } = data.form);
  $: editingSection =
    $editingSectionId === 'new'
      ? undefined
      : sections.find((s) => s.localId === $editingSectionId) ?? sections[0];

  const EMPTY_QUESTION = {
    id: undefined,
    title: '',
    description: '',
    mandatory: true,
    anonymous: false,
    type: QuestionKind.SelectOne,
    options: [],
    allowOptionsOther: false,
    __typename: 'QuestionSelectOne' as
      | 'QuestionSelectOne'
      | 'QuestionSelectMultiple'
      | 'QuestionScale'
      | 'QuestionScalar',
    minimum: 1,
    maximum: 10,
    minimumLabel: '',
    maximumLabel: '',
  };

  async function createQuestion() {
    const { upsertQuestion } = await $zeus.mutate({
      upsertQuestion: [
        {
          input: {
            ...omit(
              newQuestion,
              '__typename',
              'minimum',
              'maximum',
              'minimumLabel',
              'maximumLabel',
              'allowOptionsOther',
            ),
            allowOptionOther: newQuestion.allowOptionsOther,
            options: newQuestion.options.map((o) => ({ value: o })),
            default: [],
            sectionId: editingSection?.id,
            formId: data.form.id,
            ...(newQuestion.__typename === 'QuestionScale'
              ? {
                  scale: {
                    minimum: newQuestion.minimum,
                    maximum: newQuestion.maximum,
                    minimumLabel: newQuestion.minimumLabel,
                    maximumLabel: newQuestion.maximumLabel,
                  },
                }
              : {}),
          },
        },
        _questionQuery,
      ],
    });

    data.form.sections = data.form.sections.map((section) => {
      if (section?.id === editingSection?.id) {
        return {
          ...section,
          questions: [...section.questions, upsertQuestion],
        };
      }
      return section;
    });

    newQuestion = structuredClone(EMPTY_QUESTION);
  }

  function invalidQuestionMessage(question: typeof newQuestion): string {
    if (question.title.trim() === '') return 'Le titre de la question ne peut pas être vide';
    if (question.__typename.startsWith('QuestionSelect') && question.options.length === 0)
      return 'Il faut au moins une option pour une question à choix';
    return '';
  }

  let newQuestion = structuredClone(EMPTY_QUESTION);
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

  <form class="section-details" use:enhance method="post" action="?/upsertSection">
    {#if editingSection}
      <input type="hidden" name="section-id" value={editingSection.id} />
    {/if}
    <div class="title-and-type">
      <InputText
        value={editingSection?.title ?? ''}
        label=""
        placeholder="Titre de la section (optionnel)"
        name="title"
      ></InputText>
    </div>
    <InputLongText
      rows={3}
      value={editingSection?.description ?? ''}
      label="Description"
      name="description"
    ></InputLongText>
    <section class="submit">
      <ButtonPrimary submits>
        {#if $editingSectionId === 'new'}
          Créer
        {:else}
          Enregistrer
        {/if}
      </ButtonPrimary>
    </section>
  </form>

  {#if $editingSectionId !== 'new'}
    <section class="questions">
      {#each editingSection?.questions ?? [] as question (question.id)}
        <FormQuestion bind:question />
      {/each}

      <hr />
      <FormQuestion
        bind:question={newQuestion}
        on:submit={async () => {
          creatingQuestion = true;
          try {
            await createQuestion();
          } catch (error) {
            toasts.error('Erreur lors de la création de la question', error?.toString());
          } finally {
            creatingQuestion = false;
          }
        }}
      >
        <h2 slot="header">Nouvelle question</h2>
        <section class="submit" slot="footer-end">
          <ButtonPrimary
            help={invalidQuestionMessage(newQuestion)}
            disabled={Boolean(invalidQuestionMessage(newQuestion))}
            loading={creatingQuestion}
            submits>Ajouter</ButtonPrimary
          >
        </section>
      </FormQuestion>
    </section>
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .section-details {
    margin: 2rem 0;
  }

  .section-details .submit {
    display: flex;
    justify-content: end;
    margin-top: 1rem;
  }

  .questions,
  .section-details {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .questions section.submit {
    display: flex;
    justify-content: flex-end;
  }
</style>
