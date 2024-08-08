<script lang="ts">
  import {
    Alert,
    InputField,
    InputRadios,
    InputToggle,
    Submenu,
    SubmenuItem,
    MaybeError,
  } from '$lib/components';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import { onceAllLoaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconKioskMode from '~icons/msl/tv-outline';
  import { ChangeEventVisibility, SetEventKioskModeInclusion } from '../mutations';
  import type { PageData } from './$houdini';
  export let data: PageData;

  $: ({ PageEventEditVisibility } = data);
  // HINT: Don't forget to add an entry in $lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageEventEditVisibility} let:data={{ event }}>
  <div class="contents">
    {#if onceAllLoaded([event.startsAt, event.endsAt], (s, e) => !s || !e, false)}
      <Alert theme="warning">
        L'évènement ne peut pas être passé en visiblité autre que Privé ou Non répertorié tant que
        les dates ne sont pas définies
      </Alert>
    {/if}
    <InputField label="Visibilité">
      <InputRadios
        value={event.visibility}
        options={DISPLAY_VISIBILITIES}
        on:change={async ({ detail }) => {
          const result = await mutate(ChangeEventVisibility, {
            event: event.id,
            visibility: detail,
          });
          toasts.mutation(result, 'setEventVisibility', '', 'Impossible de changer la visibilité');
        }}
      >
        <div slot="label" class="visibility-label label" let:label let:option>
          <p class="main">{label}</p>
          <p class="muted">{HELP_VISIBILITY[option]}</p>
        </div>
      </InputRadios>
    </InputField>
    <Submenu>
      <SubmenuItem label icon={IconKioskMode} subtext="Pour par exemple afficher sur des télés">
        Inclure dans le mode kioske
        <InputToggle
          slot="right"
          on:update={async ({ detail }) => {
            const result = await mutate(SetEventKioskModeInclusion, {
              event: event.id,
              includeInKiosk: detail,
            });
            toasts.mutation(
              result,
              'updateEvent',
              '',
              `Impossible ${detail ? "d'inclure" : "d'exclure"} du mode kiosque`,
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
