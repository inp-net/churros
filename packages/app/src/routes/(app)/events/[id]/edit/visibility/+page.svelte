<script lang="ts">
  import InputField from '$lib/components/InputField.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import InputRadio from '$lib/components/InputRadios.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import type { PageData } from './$houdini';
  import { mutate } from '$lib/mutations';
  import { ChangeEventVisibility, SetEventKioskModeInclusion } from '../mutations';
  import { toasts } from '$lib/toasts';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import IconKioskMode from '~icons/msl/tv-outline';
  export let data: PageData;

  $: ({ PageEventEditVisibility } = data);
  // HINT: Don't forget to add an entry in $lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventEditVisibility} let:data={{ event }}>
  <div class="contents">
    <InputField label="Visibilité">
      <InputRadio
        value={event.visibility}
        options={DISPLAY_VISIBILITIES}
        on:change={async ({ detail }) => {
          const result = await mutate(ChangeEventVisibility, {
            event: event.id,
            visibility: detail,
          });
          if (!result) return;
          toasts.mutation(result, 'setEventVisibility', '', 'Impossible de changer la visibilité');
        }}
      >
        <div slot="label" class="visibility-label label" let:label let:option>
          <p class="main">{label}</p>
          <p class="muted">{HELP_VISIBILITY[option]}</p>
        </div>
      </InputRadio>
    </InputField>
    <Submenu>
      <SubmenuItem label icon={IconKioskMode} subtext="Pour par exemple afficher sur des télés">
        Inclure dans le mode kioske
        <InputToggle
          slot="right"
          on:change={async ({ currentTarget }) => {
            if (!(currentTarget instanceof HTMLInputElement)) return;
            const result = await mutate(SetEventKioskModeInclusion, {
              event: event.id,
              includeInKiosk: currentTarget.checked,
            });
            if (!result) return;
            toasts.mutation(
              result,
              'updateEvent',
              '',
              `Impossible ${currentTarget.checked ? "d'inclure" : "d'exclure"} du mode kiosque`,
            );
          }}
          value={event.includeInKiosk}
        />
      </SubmenuItem>
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

  .label .muted {
    margin-top: 0.2em;
    font-size: 0.8rem;
  }
</style>
