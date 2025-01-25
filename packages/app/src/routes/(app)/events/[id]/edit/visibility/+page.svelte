<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import InputField from '$lib/components/InputField.svelte';
  import InputRadios from '$lib/components/InputRadios.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { DISPLAY_VISIBILITIES, HELP_VISIBILITY } from '$lib/display';
  import { loading, onceAllLoaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import IconKioskMode from '~icons/msl/tv-outline';
  import { ChangeEventVisibility, SetEventKioskModeInclusion } from '../mutations';
  import type { PageData } from './$houdini';
  export let data: PageData;

  $: ({ PageEventEditVisibility } = data);
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
        isDisabled={(option) => event.allowedVisibilities.some((v) => loading(v, '') === option)}
        on:change={async ({ detail }) => {
          const result = await mutate(ChangeEventVisibility, {
            event: event.id,
            visibility: detail,
          });
          toasts.mutation(result, 'setEventVisibility', '', 'Impossible de changer la visibilité');
        }}
      >
        <div
          slot="label"
          class="visibility-label label"
          let:label
          let:option
          let:disabled
          class:disabled
          use:tooltip={disabled ? loading(event.visibilitiesRestrictedWhy, '') : ''}
        >
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
    {#if loading(event.visibilitiesRestrictedWhy, '')}
      <Alert theme="warning">
        <h3>Certains niveaux de visibilité sont indisponibles</h3>
        {event.visibilitiesRestrictedWhy}
      </Alert>
    {/if}
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

  .label.disabled p {
    opacity: 0.5;
  }
</style>
