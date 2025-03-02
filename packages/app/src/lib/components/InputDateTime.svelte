<script lang="ts" context="module">
  export type ValueDetail = { value: Date | null; datePart: Date | null; timePart: string };
</script>

<script lang="ts">
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputText from '$lib/components/InputText.svelte';
  import InputDate from '$lib/components/InputDate.svelte';
  import IconClear from '~icons/msl/backspace-outline';
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { nanoid } from 'nanoid';
  import { createEventDispatcher } from 'svelte';
  import { format } from 'date-fns';
  import { tooltip } from '$lib/tooltip';

  export let variant: 'ghost' | 'box';

  /** Pour afficher une tooltip */
  export let help = '';

  /** Pour afficher une tooltip sur le bouton d'effacement */
  export let clearHelp = '';

  export let readonly = false;

  const dispatch = createEventDispatcher<{
    blur: ValueDetail;
    clear: ValueDetail;
  }>();

  export let value: null | undefined | MaybeLoading<Date | null | undefined>;

  const defaultName = `input-${nanoid()}`;
  export let name: string | undefined = undefined;
  $: name ??= defaultName;

  export let label: string;
  export let required = false;
  export const reset = () => {
    if (!loaded(value)) return;
    _valueDate = datePart(value);
    _valueTime = timePart(value);
  };

  let _valueDate: Date | null;
  let _valueTime: string;

  function timePart(value: Date | null | undefined) {
    return value ? format(value, 'HH:mm') : '';
  }
  function datePart(value: Date | null | undefined) {
    return value ? new Date(value) : null;
  }

  $: if (loaded(value) && _valueDate === undefined) _valueDate = datePart(value);
  $: if (loaded(value) && _valueTime === undefined) _valueTime = timePart(value);

  function combineParts(_valueDate: Date | null, _valueTime: string) {
    if (
      _valueDate === null ||
      _valueTime === '' ||
      _valueTime.split(':').length !== 2 ||
      _valueTime.split(':').some((v) => Number.isNaN(Number.parseInt(v)))
    )
      return null;

    const combined = new Date(_valueDate);
    const [hours, minutes] = _valueTime.split(':').map((v) => Number.parseInt(v));
    combined.setHours(hours);
    combined.setMinutes(minutes);
    return combined;
  }
</script>

<InputField {label} {required} aria-label={help && !label ? help : ''}>
  <div class="date-time-input" use:tooltip={help}>
    <label for="{name}-date">
      {#if variant === 'ghost'}
        <InputTextGhost
          on:blur={() => {
            dispatch('blur', {
              value: combineParts(_valueDate, _valueTime),
              datePart: _valueDate,
              timePart: _valueTime,
            });
          }}
          id="{name}-date"
          {required}
          {readonly}
          type="date"
          placeholder="Date"
          label="Date"
          bind:value={_valueDate}
        />
      {:else}
        <InputDate
          on:blur={() => {
            dispatch('blur', {
              value: combineParts(_valueDate, _valueTime),
              datePart: _valueDate,
              timePart: _valueTime,
            });
          }}
          id="{name}-date"
          {required}
          {readonly}
          type="date"
          placeholder="Date"
          label=""
          bind:value={_valueDate}
        />
      {/if}
    </label>
    <label for="{name}-time">
      {#if variant === 'ghost'}
        <InputTextGhost
          on:blur={() => {
            dispatch('blur', {
              value: combineParts(_valueDate, _valueTime),
              datePart: _valueDate,
              timePart: _valueTime,
            });
          }}
          id="{name}-time"
          {required}
          {readonly}
          placeholder="Heure"
          label="Heure"
          type="time"
          bind:value={_valueTime}
        ></InputTextGhost>
      {:else}
        <InputText
          on:blur={() => {
            dispatch('blur', {
              value: combineParts(_valueDate, _valueTime),
              datePart: _valueDate,
              timePart: _valueTime,
            });
          }}
          id="{name}-time"
          {required}
          {readonly}
          placeholder="Heure"
          label=""
          type="time"
          bind:value={_valueTime}
        />
      {/if}
    </label>
    {#if !required && !readonly}
      <ButtonGhost
        help={clearHelp}
        on:click={() => {
          _valueDate = null;
          _valueTime = '';
          dispatch('clear', {
            value: null,
            datePart: null,
            timePart: '',
          });
        }}><IconClear></IconClear></ButtonGhost
      >
    {/if}
  </div>
</InputField>

<style>
  .date-time-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
