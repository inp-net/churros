<script context="module" lang="ts">
  export const FORM_SECTION_HIDDEN_INPUT_NAME = '__section__';
</script>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputScale from '$lib/components/InputScale.svelte';
  import InputSelectMultiple from '$lib/components/InputSelectMultiple.svelte';
  import InputSelectOneRadios from '$lib/components/InputSelectOneRadios.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import type { PageData } from './$types';
  import CardQuestion from './CardQuestion.svelte';

  export let data: PageData;
  const {
    title,
    descriptionHtml,
    section,
    section: { questions },
  } = data.form;

  let submitting = false;
  $: serverError = $page.form;

  $: alreadyAnswered = questions.every((q) => q.myAnswer !== null);

  function myAnswerNumber(myAnswer: (typeof questions)[number]['myAnswer']) {
    if (myAnswer?.__typename === 'AnswerScale') {
      // @ts-expect-error see +page.ts for explanation
      return myAnswer.number as number;
    }
    return 0;
  }
  function myAnswerSelection(myAnswer: (typeof questions)[number]['myAnswer']) {
    if (myAnswer?.__typename === 'AnswerSelectMultiple') {
      //@ts-expect-error see +page.ts for explanation
      return myAnswer.selection as string[];
    }
    return [];
  }
</script>

<h1>
  <ButtonBack />
  {title}
</h1>
<div data-user-html="">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html descriptionHtml}
</div>

<form
  method="post"
  action="?/postAnswers"
  use:enhance
  on:submit={() => {
    submitting = true;
  }}
>
  <section class="questions">
    <input type="hidden" name={FORM_SECTION_HIDDEN_INPUT_NAME} value={section.id} />
    {#if section.title || section.description}
      <h2>{section.title}</h2>
      <div data-user-html="">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html section.descriptionHtml}
      </div>
    {/if}
    {#each questions as { title, mandatory, descriptionHtml, description, type, id, myAnswer, ...question } (id)}
      <CardQuestion {descriptionHtml} {description}>
        {#if question.__typename === 'QuestionScalar'}
          {#if type === 'LongText'}
            <InputLongText
              name={id}
              value={myAnswer?.answerString ?? ''}
              label={title}
              required={mandatory}
            ></InputLongText>
          {:else}
            <InputText
              name={id}
              value={myAnswer?.answerString ?? ''}
              label={title}
              required={mandatory}
            ></InputText>
          {/if}
        {:else if question.__typename === 'QuestionSelectOne'}
          <InputSelectOneRadios
            label={title}
            required={mandatory}
            name={id}
            options={question.options}
            value={myAnswer?.answerString}
            allowOther={question.allowOptionsOther}
          ></InputSelectOneRadios>
        {:else if question.__typename === 'QuestionSelectMultiple'}
          <InputField label={title} required={mandatory}>
            <InputSelectMultiple
              selection={myAnswerSelection(myAnswer)}
              name={id}
              options={question.options}
            ></InputSelectMultiple>
          </InputField>
        {:else if question.__typename === 'QuestionFileUpload'}
          <input type="file" name={id} {id} />
        {:else if question.__typename === 'QuestionScale'}
          <InputScale
            name={id}
            label={title}
            required={mandatory}
            value={myAnswerNumber(myAnswer)}
            {...question}
          ></InputScale>
        {:else}
          <p>Question de type inconnu</p>
        {/if}
      </CardQuestion>
    {/each}
  </section>
  <section class="submit">
    <ButtonPrimary loading={submitting} submits>
      {#if alreadyAnswered}
        Modifier mes réponses
      {:else}
        Envoyer
      {/if}
    </ButtonPrimary>
    {#if data.form.linkedGoogleSheetUrl}
      <p class="notice typo-details">
        Tes réponses seront également transmises à Google, pour les afficher dans un Google Sheet.
      </p>
    {/if}
  </section>
</form>

<style>
  section.questions {
    max-width: 600px;
    margin: 0 auto;
  }

  section.submit {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
    flex-direction: column;
  }

  p.notice {
    margin-top: 1rem;
  }
</style>
