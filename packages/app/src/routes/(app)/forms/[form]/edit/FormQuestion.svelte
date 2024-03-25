<script lang="ts">
  import Card from '$lib/components/Card.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import InputLongText from '$lib/components/InputLongText.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import { tooltip } from '$lib/tooltip';
  import IconQuestionMark from '~icons/mdi/question-mark-circle-outline';

  export let id: string | undefined = undefined;
  export let initial: {
    title: string;
    description: string;
    mandatory: boolean;
    anonymous: boolean;
  } = {
    title: '',
    description: '',
    mandatory: true,
    anonymous: false,
  };

  let data = initial;
</script>

<Card element="form" method="post">
  <header>
    <slot name="header" />
    <InputText
      required
      label=""
      name="{id ?? 'new-question'}.title"
      placeholder="Titre de la question"
      value={data.title}
    ></InputText>
    <InputLongText
      rows={2}
      value={data.description}
      label=""
      placeholder="Ajouter une description… (optionel)"
      name="{id ?? 'new-question'}.description"
    ></InputLongText>
  </header>
  <slot />
  <footer>
    <slot name="footer" />
    <InputCheckbox
      value={data.mandatory}
      label="Obligatoire"
      name="{id ?? 'new-question'}.mandatory"
    ></InputCheckbox>
    <div class="anonymous">
      <InputCheckbox value={data.anonymous} label="Anonyme" name="{id ?? 'new-question'}.anonymous"
      ></InputCheckbox>
      <div
        class="action learn-more"
        use:tooltip={'Personne (excepté le service technique) ne peut connaître les réponses individuelles à des questions anonymes.'}
      >
        <IconQuestionMark></IconQuestionMark>
      </div>
    </div>
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

  footer > div {
    display: flex;
    align-items: center;
    gap: 2em;
  }
</style>
