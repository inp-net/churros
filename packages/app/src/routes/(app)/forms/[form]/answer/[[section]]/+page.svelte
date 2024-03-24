<script context="module" lang="ts">
  export const FORM_SECTION_HIDDEN_INPUT_NAME = '__section__';
</script>

<script lang="ts">
  import { enhance } from '$app/forms';
  import { afterNavigate } from '$app/navigation';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarGroup from '$lib/components/AvatarGroup.svelte';
  import ButtonBack from '$lib/components/ButtonBack.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import IndicatorVisibility from '$lib/components/IndicatorVisibility.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputScale from '$lib/components/InputScale.svelte';
  import InputSelectMultiple from '$lib/components/InputSelectMultiple.svelte';
  import InputSelectOneRadios from '$lib/components/InputSelectOneRadios.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { formatRelative } from 'date-fns';
  import fr from 'date-fns/locale/fr/index.js';
  import type { ActionData, PageData } from './$types';
  import CardQuestion from './CardQuestion.svelte';

  export let data: PageData;
  $: ({
    title,
    descriptionHtml,
    section,
    group,
    closesAt,
    visibility,
    section: { questions },
  } = data.form);

  let submitting = false;
  export let form: ActionData;
  $: serverError = form?.message;
  $: console.log({ form });

  $: alreadyAnswered = questions.every((q) => q.myAnswer !== null);

  afterNavigate(() => {
    submitting = false;
  });

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

<header>
  <h1>
    <ButtonBack />
    <AvatarGroup tooltip="Formulaire créé par {group.name}" href="/groups/{group.uid}" {...group}
    ></AvatarGroup>
    {title}
  </h1>
  <p class="timing">
    <IndicatorVisibility text {visibility}></IndicatorVisibility>
    {#if closesAt}
      · Ouvert aux réponses jusqu'à {formatRelative(closesAt, new Date(), { locale: fr })}
    {/if}
  </p>
</header>
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
    {#each questions as { title, mandatory, anonymous, descriptionHtml, description, type, id, myAnswer, ...question } (id)}
      <CardQuestion {descriptionHtml} {description} {anonymous}>
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
          >
            <svelte:fragment let:option>
              {@const group = data.groups.find((g) => g.name === option)}
              <span class="select-one-option">
                {#if group}
                  <AvatarGroup href={undefined} {...group}></AvatarGroup>
                {/if}
                {option}
              </span>
            </svelte:fragment>
          </InputSelectOneRadios>
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
    {#if serverError}
      <Alert theme="danger">{serverError}</Alert>
    {/if}
    <ButtonPrimary loading={submitting} submits>
      {#if alreadyAnswered}
        Enregistrer
      {:else}
        Continuer
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

  .select-one-option {
    display: flex;
    align-items: center;
    column-gap: 0.5em;
  }

  header {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  h1 {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.5rem;
  }

  p.notice {
    margin-top: 1rem;
  }
</style>
