<script lang="ts">
  import type { DateRangeInput } from '$houdini';
  import InputDateTime from '$lib/components/InputDateTime.svelte';
  import { loaded, type MaybeLoading } from '$lib/loading';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ update: DateRangeInput | null }>();

  type StartValue = $$Generic<MaybeLoading<Date | null>>;
  type EndValue = $$Generic<MaybeLoading<Date | null>>;

  export let resourceId: MaybeLoading<string> = '';
  export let start: StartValue;
  export let end: EndValue;
  export let variant: 'ghost' | 'box';

  let updatedDates:
    | {
        start: Date | null;
        end: Date | null;
      }
    | undefined;

  $: if (!updatedDates && loaded(start) && loaded(end)) {
    updatedDates = {
      start: start as Date | null,
      end: end as Date | null,
    };
  }

  export const reset = () => {
    resetStartsAtInput?.();
    resetEndsAtInput?.();
  };

  let resetStartsAtInput: () => void;
  let resetEndsAtInput: () => void;

  function updateEventDates(key: 'start' | 'end') {
    return async ({
      detail: { value, timePart, datePart },
    }: CustomEvent<{
      value: Date | null | undefined;
      datePart: Date | null | undefined;
      timePart: string;
    }>) => {
      if (!loaded(resourceId)) return;
      if (timePart && !datePart) return;
      if (!timePart && datePart) return;
      if (!loaded(end) || !loaded(start)) return;
      if (!updatedDates) return;

      if (key === 'start') updatedDates.start = value ?? null;
      else updatedDates.end = value ?? null;

      if (!updatedDates.start && updatedDates.end) return;
      if (updatedDates.start && !updatedDates.end) return;

      dispatch(
        'update',
        updatedDates.start && updatedDates.end ? (updatedDates as DateRangeInput) : null,
      );
    };
  }
</script>

<slot name="start" {updateEventDates} update={updateEventDates('start')} value={start}>
  <InputDateTime
    {variant}
    bind:reset={resetEndsAtInput}
    on:blur={updateEventDates('start')}
    on:clear={updateEventDates('start')}
    label="Début"
    value={start}
  ></InputDateTime>
</slot>
<slot name="end" {updateEventDates} update={updateEventDates('end')} value={end}>
  <InputDateTime
    {variant}
    bind:reset={resetStartsAtInput}
    on:blur={updateEventDates('end')}
    on:clear={updateEventDates('end')}
    label="Fin"
    value={end}
  ></InputDateTime>
</slot>
