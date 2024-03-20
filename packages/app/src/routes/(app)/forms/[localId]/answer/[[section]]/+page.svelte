<script context="module" lang="ts">
  export const FORM_SECTION_HIDDEN_INPUT_NAME = '__section__';
</script>

<script lang="ts">
  import type { PageData } from './$types';
  import CardQuestion from './CardQuestion.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputSelectOne from '$lib/components/InputSelectOne.svelte';
  import InputSelectMultiple from '$lib/components/InputSelectMultiple.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputScale from '$lib/components/InputScale.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputSelectOneRadios from '$lib/components/InputSelectOneRadios.svelte';
  import { enhance } from '$app/forms';
  import { makeMutation } from '$lib/zeus';
  import { page } from '$app/stores';

  export let data: PageData;
  const {
    title,
    descriptionHtml,
    section,
    section: { questions },
  } = data.form;

  let submitting = false;
  $: serverError = $page.form;
</script>

<form
  method="post"
  action="?/postAnswers"
  use:enhance
  on:submit={() => {
    submitting = true;
  }}
>
  <h1>{title}</h1>
  <div data-user-html="">
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html descriptionHtml}
  </div>
  <section>
    <input type="hidden" name={FORM_SECTION_HIDDEN_INPUT_NAME} value={section.id} />
    {#if section.title || section.description}
      <h2>{section.title}</h2>
      <div data-user-html="">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html section.descriptionHtml}
      </div>
    {/if}
    {#each questions as { title, mandatory, descriptionHtml, description, type, id, ...question } (id)}
      <CardQuestion {descriptionHtml} {description}>
        {#if question.__typename === 'QuestionScalar'}
          {#if type === 'LongText'}
            <InputLongText name={id} value="" label={title} required={mandatory}></InputLongText>
          {:else}
            <InputText name={id} value="" label={title} required={mandatory}></InputText>
          {/if}
        {:else if question.__typename === 'QuestionSelectOne'}
          <InputSelectOneRadios
            label={title}
            required={mandatory}
            name={id}
            options={question.options}
            value=""
            allowOther={question.allowOptionsOther}
          ></InputSelectOneRadios>
        {:else if question.__typename === 'QuestionSelectMultiple'}
          <InputField label={title} required={mandatory}>
            <InputSelectMultiple name={id} options={question.options}></InputSelectMultiple>
          </InputField>
        {:else if question.__typename === 'QuestionFileUpload'}
          <input type="file" name={id} {id} />
        {:else if question.__typename === 'QuestionScale'}
          <InputScale name={id} label={title} required={mandatory} value={0} {...question}
          ></InputScale>
        {:else}
          <p>Question de type inconnu</p>
        {/if}
      </CardQuestion>
    {/each}
  </section>
  <section class="submit">
    <ButtonPrimary submits>Envoyer</ButtonPrimary>
  </section>
</form>

<style>
  section.submit {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
  }
</style>
