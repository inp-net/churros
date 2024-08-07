<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import Card from '$lib/components/Card.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputPickObjects from '$lib/components/InputPickObjects.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { tooltip } from '$lib/tooltip';
  import { QuestionKind } from '$lib/zeus';
  import { createEventDispatcher, type SvelteComponent } from 'svelte';
  import IconDate from '~icons/mdi/calendar-outline';
  import IconCheckbox from '~icons/mdi/checkbox-outline';
  import IconTime from '~icons/mdi/clock-outline';
  import IconFile from '~icons/mdi/file-outline';
  import IconNumber from '~icons/mdi/numeric';
  import IconQuestionMark from '~icons/mdi/question-mark-circle-outline';
  import IconRadioButton from '~icons/mdi/radiobox-marked';
  import IconLinearScale from '~icons/mdi/ray-start-vertex-end';
  import IconTextLong from '~icons/mdi/text-long';
  import IconTextShort from '~icons/mdi/text-short';

  const dispatch = createEventDispatcher<{
    'type-change': { from: QuestionKind; to: QuestionKind };
  }>();

  export let id: string | undefined = undefined;
  export let initial: {
    title: string;
    description: string;
    mandatory: boolean;
    anonymous: boolean;
    type: QuestionKind;
  } = {
    title: '',
    description: '',
    mandatory: true,
    anonymous: false,
    type: QuestionKind.SelectOne,
  };

  const questionTypeNames: Array<{ id: QuestionKind; label: string }> = [
    { id: QuestionKind.SelectOne, label: 'Choix unique' },
    { id: QuestionKind.SelectMultiple, label: 'Cases à cocher' },
    { id: QuestionKind.LongText, label: 'Texte long' },
    { id: QuestionKind.Text, label: 'Texte court' },
    { id: QuestionKind.Scale, label: 'Échelle linéaire' },
    { id: QuestionKind.Date, label: 'Date' },
    { id: QuestionKind.Time, label: 'Heure' },
    { id: QuestionKind.FileUpload, label: 'Fichier' },
    { id: QuestionKind.Number, label: 'Nombre' },
  ] as const;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionTypeIcons: Record<QuestionKind, typeof SvelteComponent<any>> = {
    SelectOne: IconRadioButton,
    SelectMultiple: IconCheckbox,
    LongText: IconTextLong,
    Text: IconTextShort,
    Scale: IconLinearScale,
    Date: IconDate,
    Time: IconTime,
    FileUpload: IconFile,
    Number: IconNumber,
  };

  export let title = initial.title;
  export let description = initial.description;
  export let mandatory = initial.mandatory;
  export let anonymous = initial.anonymous;
  export let type = initial.type;

  let currentTypename = questionTypeNames.find((t) => t.id === type);

  $: if (currentTypename) {
    dispatch('type-change', {
      from: type,
      to: currentTypename.id,
    });
    type = currentTypename.id;
  }
</script>

<Card element="form" method="post" on:submit>
  <header>
    <slot name="header" />
    <div class="title-and-type">
      <InputText
        required
        label=""
        name="{id ?? 'new-question'}.title"
        placeholder="Titre de la question"
        bind:value={title}
      ></InputText>
      <InputPickObjects bind:value={currentTypename} options={questionTypeNames}>
        <div
          class:selected={item.id === currentTypename?.id}
          class="question-type-choice"
          slot="item"
          let:item
        >
          <svelte:component this={questionTypeIcons[item.id]}></svelte:component>
          {item.label}
        </div>
        <div class="typename-picker-open" slot="input" let:value let:openPicker>
          <ButtonSecondary on:click={openPicker}>
            {#if value}
              <svelte:component this={questionTypeIcons[value.id]}></svelte:component>
              {value.label}
            {:else}
              Choisir le type
            {/if}
          </ButtonSecondary>
        </div>
      </InputPickObjects>
    </div>
    <InputLongText
      rows={2}
      bind:value={description}
      label=""
      placeholder="Ajouter une description… (optionel)"
      name="{id ?? 'new-question'}.description"
    ></InputLongText>
  </header>
  <slot />
  <footer>
    <slot name="footer" />
    <InputCheckbox
      bind:value={mandatory}
      label="Obligatoire"
      name="{id ?? 'new-question'}.mandatory"
    ></InputCheckbox>
    <div class="anonymous">
      <InputCheckbox bind:value={anonymous} label="Anonyme" name="{id ?? 'new-question'}.anonymous"
      ></InputCheckbox>
      <div
        class="action learn-more"
        use:tooltip={'Personne (excepté le service technique) ne peut connaître les réponses individuelles à des questions anonymes.'}
      >
        <IconQuestionMark></IconQuestionMark>
      </div>
    </div>
    <slot name="footer-end" />
  </footer>
</Card>

<style>
  header {
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    border-bottom: var(--border-block) dashed var(--muted-border);
  }

  footer {
    display: flex;
    flex-direction: column;
    row-gap: 0.5rem;
    padding-top: 1rem;
    margin-top: 1rem;
    border-top: var(--border-block) dashed var(--muted-border);
  }

  .question-type-choice {
    --size: 7rem;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    text-align: center;
  }

  .question-type-choice.selected {
    color: var(--primary);
    background-color: var(--primary-bg);
    border-radius: var(--radius-block);
  }

  footer > div {
    display: flex;
    gap: 2em;
    align-items: center;
  }

  .title-and-type {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
