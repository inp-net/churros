<script lang="ts">
  import { graphql, type EventManagerPowerLevel$options } from '$houdini';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { DISPLAY_MANAGER_PERMISSION_LEVELS } from '$lib/display';
  import { loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import type { PageData } from './$houdini';
  import ItemManager from './ItemManager.svelte';

  export let data: PageData;
  $: ({ PageEventEditManagers } = data);

  let newManager = {
    uid: '',
    power: 'ScanTickets' as EventManagerPowerLevel$options,
  };

  const AddEventManager = graphql(`
    mutation AddEventManager($user: UID!, $event: LocalID!, $power: EventManagerPowerLevel!) {
      upsertEventManager(user: $user, event: $event, powerlevel: $power) {
        ... on MutationUpsertEventManagerSuccess {
          data {
            id
            ...List_EventManagers_insert
          }
        }
        ...MutationErrors
      }
    }
  `);
</script>

<MaybeError result={$PageEventEditManagers} let:data={{ event }}>
  <div class="contents">
    <section class="new">
      <form
        on:submit|preventDefault={async () => {
          if (!newManager.uid) return;
          if (event.managers.some((m) => m.user.uid === newManager.uid)) {
            toasts.error(`${newManager.uid} est déjà manager de l'évènement`);
            return;
          }
          const result = await mutate(AddEventManager, {
            event: event.id,
            user: newManager.uid,
            power: newManager.power,
          });
          if (
            toasts.mutation(
              result,
              'upsertEventManager',
              `${newManager.uid} est maintenant manager`,
              `Impossible d'ajouter ${newManager.uid} comme manager`,
            )
          ) {
            newManager = {
              uid: '',
              power: 'ScanTickets',
            };
          }
        }}
      >
        <div class="inputs">
          <InputTextGhost
            placeholder="@ de la personne"
            required
            label="Nom d'utilsateur·ice"
            bind:value={newManager.uid}
          ></InputTextGhost>
          <InputSelectOneDropdown
            bind:value={newManager.power}
            label=""
            options={DISPLAY_MANAGER_PERMISSION_LEVELS}
          ></InputSelectOneDropdown>
          <ButtonPrimary submits>Ajouter</ButtonPrimary>
        </div>
      </form>
    </section>
    <h2 class="typo-field-label">Managers</h2>
    <ul class="managers nobullet">
      {#each event.managers as manager}
        <ItemManager {manager} />
      {:else}
        <li class="muted">Aucun manager ajouté</li>
      {/each}
    </ul>
    <h2 class="typo-field-label">
      Managers par permissions sur <AvatarGroup group={event.organizer} name />
    </h2>
    <p class="explain muted">
      Ces personnes sont managers de l'évènement par leur permissions en tant que membre du groupe
      organisateur. <ButtonInk
        insideProse
        href={refroute('/groups/[uid]/members', loading(event.organizer.uid, ''))}
        >Gérer les membres</ButtonInk
      >
    </p>
    <ul class="managers nobullet">
      {#each event.inheritedManagers as manager}
        <ItemManager {manager} />
      {:else}
        <li class="muted">Aucun membre du groupe n'est manager par permissions</li>
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  h2 {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1ch;
    align-items: center;
    margin-top: 2rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .new {
    margin-bottom: 3rem;
  }

  .new .inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 2rem;
    justify-content: center;
  }

  .explain {
    margin-top: 0.5em;
    font-size: 0.85em;
  }
</style>
