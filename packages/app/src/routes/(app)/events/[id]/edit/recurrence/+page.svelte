<script lang="ts">
  import InputDate from '$lib/components/InputDate.svelte';
  import InputRadio from '$lib/components/InputRadios.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { DISPLAY_EVENT_FREQUENCY } from '$lib/display';
  import { loaded, loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconFrequency from '~icons/msl/auto-awesome-motion-outline';
  import IconCalendar from '~icons/msl/calendar-today-outline';
  import IconRecurring from '~icons/msl/refresh';
  import { ChangeEventRecurrence } from '../mutations';
  import type { PageData } from './$houdini';
  import { addYears } from 'date-fns';
  export let data: PageData;

  $: ({ PageEventEditRecurrence } = data);
  // HINT: Don't forget to add an entry in $lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventEditRecurrence} let:data={{ event }}>
  <div class="contents">
    <Submenu>
      <SubmenuItem label icon={IconRecurring}
        >L'évènement a lieu plusieurs fois
        <InputToggle
          slot="right"
          on:change={async ({ currentTarget }) => {
            if (!loaded(event.endsAt)) return;
            if (!(currentTarget instanceof HTMLInputElement)) return;
            const result = await mutate(ChangeEventRecurrence, {
              event: event.id,
              frequency: currentTarget.checked ? 'Weekly' : 'Once',
              recurringUntil: currentTarget.checked
                ? addYears(event.endsAt ?? new Date(), 1)
                : null,
            });
            toasts.mutation(
              result,
              'updateEventRecurrence',
              '',
              `Impossible de désactiver la récurrence`,
            );
          }}
          value={event.frequency !== 'Once'}
        />
      </SubmenuItem>
      {#if loading(event.frequency, 'Once') !== 'Once'}
        <SubmenuItem icon={IconFrequency}>
          Répétition
          <div class="frequency-options" slot="right">
            <InputRadio
              value={event.frequency}
              options={Object.entries(DISPLAY_EVENT_FREQUENCY).filter(([freq]) => freq !== 'Once')}
              on:change={async ({ detail }) => {
                const result = await mutate(ChangeEventRecurrence, {
                  event: event.id,
                  frequency: detail,
                  recurringUntil: event.recurringUntil,
                });
                toasts.mutation(
                  result,
                  'updateEventRecurrence',
                  '',
                  `Impossible de changer la fréquence de répétition`,
                );
              }}
            >
              <div slot="label" class="visibility-label label" let:label>
                <p class="main">{label}</p>
              </div>
            </InputRadio>
          </div>
        </SubmenuItem>
        <SubmenuItem label icon={IconCalendar}>
          Se répète jusqu'au
          <InputDate
            slot="right"
            on:blur={async ({ currentTarget }) => {
              if (!(currentTarget instanceof HTMLInputElement)) return;
              const result = await mutate(ChangeEventRecurrence, {
                event: event.id,
                frequency: event.frequency,
                recurringUntil: new Date(currentTarget.value),
              });
              toasts.mutation(
                result,
                'updateEventRecurrence',
                '',
                `Impossible de changer la date de fin de répétition`,
              );
            }}
            label=""
            value={event.recurringUntil}
          />
        </SubmenuItem>
      {/if}
    </Submenu>
  </div>
</MaybeError>

<style>
  .contents {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    padding: 0 1rem;

    --radio-size: 1.5rem;
    --weight-field-label: 800;
  }

  .label {
    line-height: 1.1;
  }

  .frequency-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
