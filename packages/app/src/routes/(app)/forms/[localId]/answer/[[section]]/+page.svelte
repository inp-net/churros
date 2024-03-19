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

  export let data: PageData;
</script>

{#if !data.form}
  <p>Chargement…</p>
{:else}
  {@const {
    title,
    descriptionHtml,
    section,
    section: { questions },
  } = data.form}
  <form action="">
    <h1>{title}</h1>
    <div data-user-html="">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html descriptionHtml}
    </div>
    <section>
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
              <InputLongText value="" label={title} required={mandatory}></InputLongText>
            {:else}
              <InputText value="" label={title} required={mandatory}></InputText>
            {/if}
          {:else if question.__typename === 'QuestionSelectOne'}
            <InputSelectOne label={title} required={mandatory} options={question.options} value=""
            ></InputSelectOne>
          {:else if question.__typename === 'QuestionSelectMultiple'}
            <InputField label={title} required={mandatory}>
              <InputSelectMultiple options={question.options}></InputSelectMultiple>
            </InputField>
          {:else if question.__typename === 'QuestionFileUpload'}
            <input type="file" name={id} {id} />
          {:else if question.__typename === 'QuestionScale'}
            <InputScale label={title} required={mandatory} value={0} {...question}></InputScale>
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
{/if}

<style>
  section.submit {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2rem;
  }
</style>
