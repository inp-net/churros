<script lang="ts">
  import { DISPLAY_EVENT_FREQUENCY } from '$lib/display';
  import { EventFrequency } from '$lib/zeus';
  import FormEventBetaPreviewCard from './FormEventBetaPreviewCard.svelte';
  import InputCheckbox from './InputCheckbox.svelte';
  import InputDate from './InputDate.svelte';
  import InputDateRange from './InputDateRange.svelte';
  import InputSelectOne from './InputSelectOne.svelte';
  import InputText from './InputText.svelte';

  export let title: string;
  export let description: string;
  export let startsAt: Date | undefined = undefined;
  export let endsAt: Date | undefined = undefined;
  export let location: string;
  export let frequency: EventFrequency;
  export let recurringUntil: Date | undefined = undefined;
</script>

<section class="inputs">
  <InputText label="Lieu" bind:value={location}></InputText>
  <InputDateRange time required label="Date" bind:start={startsAt} bind:end={endsAt}
  ></InputDateRange>
  <section class="recurrence">
    <h2>Récurrence</h2>
    <InputCheckbox
      on:change={() => {
        frequency = frequency === EventFrequency.Once ? EventFrequency.Weekly : EventFrequency.Once;
      }}
      label="L'évènement se répète"
      value={frequency !== EventFrequency.Once}
    ></InputCheckbox>
    <div class="recurrence-options" class:disabled={frequency === EventFrequency.Once}>
      <InputSelectOne
        required={frequency !== EventFrequency.Once}
        label="Répétition"
        options={Object.entries(DISPLAY_EVENT_FREQUENCY).filter(
          ([k]) => k !== EventFrequency.Once.toString(),
        )}
        bind:value={frequency}
      ></InputSelectOne>
      <InputDate
        required={frequency !== EventFrequency.Once}
        bind:value={recurringUntil}
        label="Jusqu'à"
      ></InputDate>
    </div>
  </section>
</section>

<section class="preview">
  <FormEventBetaPreviewCard
    {...{ title, description, startsAt, endsAt, recurringUntil, frequency, location }}
  ></FormEventBetaPreviewCard>
</section>

<style>
  .inputs section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
  }

  .inputs {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: start;
  }

  .inputs .recurrence-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: start;
  }

  .inputs .recurrence-options.disabled {
    opacity: 0.5;
  }
</style>
