<script lang="ts">
  import InputField from '$lib/components/InputField.svelte';
  import type { MaybeLoading } from '$lib/loading';
  import { nanoid } from 'nanoid';

  export let value: null | undefined | MaybeLoading<Date | null | undefined>;

  const defaultName = `input-${nanoid()}`;
  export let name: string | undefined = undefined;
  $: name ??= defaultName;

  export let label: string;
  export let required = false;

  let _valueDate: Date | null = null;
  let _valueTime: string = '';

  function updateValue(_valueDate: Date | null, _valueTime: string) {
    if (
      _valueDate === null ||
      _valueTime === '' ||
      _valueTime.split(':').length !== 2 ||
      _valueTime.split(':').some((v) => Number.isNaN(Number.parseInt(v)))
    ) {
      value = null;
      return;
    }

    const updatedDate = new Date(_valueDate);
    const [hours, minutes] = _valueTime.split(':').map((v) => Number.parseInt(v));
    updatedDate.setHours(hours);
    updatedDate.setMinutes(minutes);
    value = updatedDate;
  }

  $: updateValue(_valueDate, _valueTime);
</script>

<InputField {label} {required}>
  <label for="{name}-date">
    <input id="{name}-date" {required} type="date" bind:value={_valueDate} />
  </label>
  <label for="{name}-time">
    <input id="{name}-time" {required} type="time" bind:value={_valueTime} />
  </label>
</InputField>
