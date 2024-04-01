<script lang="ts">
  import { QuestionKind } from '$lib/zeus';
  import FormQuestionScale from './FormQuestionScale.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import BaseInputText from '$lib/components/BaseInputText.svelte';
  import BaseFormQuestion from './BaseFormQuestion.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import FormQuestionChoices from './FormQuestionChoices.svelte';

  export let question: {
    id: string | undefined;
    title: string;
    description: string;
    mandatory: boolean;
    anonymous: boolean;
    type: QuestionKind;
  } & (
    | {
        __typename: 'QuestionSelectOne' | 'QuestionSelectMultiple';
        options: string[];
        allowOptionsOther: boolean;
      }
    | {
        __typename: 'QuestionScale';
        minimum: number;
        maximum: number;
        minimumLabel: string;
        maximumLabel: string;
      }
    | {
        __typename: 'QuestionScalar' | 'QuestionFileUpload';
      }
  );

  function questionKindToTypename(type: QuestionKind) {
    const typeToQuestionType = {
      Text: 'QuestionScalar',
      LongText: 'QuestionScalar',
      SelectOne: 'QuestionSelectOne',
      SelectMultiple: 'QuestionSelectMultiple',
      FileUpload: 'QuestionFileUpload',
      Scale: 'QuestionScale',
      Number: 'QuestionScalar',
      Date: 'QuestionScalar',
      Time: 'QuestionScalar',
    } as const;

    return typeToQuestionType[type];
  }
</script>

<BaseFormQuestion
  on:submit
  id={question.id}
  initial={question}
  bind:title={question.title}
  bind:description={question.description}
  bind:mandatory={question.mandatory}
  bind:anonymous={question.anonymous}
  on:type-change={({ detail: { to } }) => {
    question.type = to;
    question.__typename = questionKindToTypename(to);
  }}
>
  <slot name="header" slot="header" />
  {#if question.__typename === 'QuestionSelectOne' || question.__typename === 'QuestionSelectMultiple'}
    <input type="hidden" name="{question.id}.options" value={question.options.join(',')} />
    <FormQuestionChoices __typename={question.__typename} bind:options={question.options}
    ></FormQuestionChoices>
  {:else if question.__typename === 'QuestionScale'}
    <FormQuestionScale
      bind:minimum={question.minimum}
      bind:maximum={question.maximum}
      bind:minimumLabel={question.minimumLabel}
      bind:maximumLabel={question.maximumLabel}
    ></FormQuestionScale>
  {:else if question.__typename === 'QuestionScalar'}
    {#if question.type === 'LongText'}
      <InputLongText rows={5} placeholder="Texte long…" label="" disabled value=""></InputLongText>
    {:else}
      <BaseInputText
        placeholder="Texte"
        value={null}
        type={question.type.toLowerCase()}
        disabled
        label=""
      ></BaseInputText>
    {/if}
  {/if}

  <div class="additional-options" slot="footer">
    {#if question.__typename === 'QuestionSelectOne' || question.__typename === 'QuestionSelectMultiple'}
      <InputCheckbox
        value={question.allowOptionsOther}
        label="Autoriser le choix “autres”"
        name="multiple"
      ></InputCheckbox>
    {/if}
  </div>

  <slot name="footer-end" slot="footer-end" />
</BaseFormQuestion>
