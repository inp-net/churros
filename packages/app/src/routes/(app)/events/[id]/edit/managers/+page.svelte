<script lang="ts">
  import { graphql, type EventManagerPowerLevel$options } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { DISPLAY_MANAGER_PERMISSION_LEVELS } from '$lib/display';
  import { loading } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditManagers } = data);

  let newManager = {
    uid: '',
    power: 'ScanTickets' as EventManagerPowerLevel$options,
  };

  const UpdateEventManager = graphql(`
    mutation UpdateEventManager($user: UID!, $event: LocalID!, $power: EventManagerPowerLevel!) {
      upsertEventManager(user: $user, event: $event, powerlevel: $power) {
        ... on MutationUpsertEventManagerSuccess {
          data {
            power
          }
        }
        ...MutationErrors
      }
    }
  `);

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

  const RemoveEventManager = graphql(`
    mutation RemoveEventManager($user: UID!, $event: LocalID!) {
      removeEventManager(user: $user, event: $event) {
        ... on MutationRemoveEventManagerSuccess {
          data {
            id @EventManager_delete
          }
        }
        ...MutationErrors
      }
    }
  `);
</script>

<MaybeError result={$PageEventEditManagers} let:data={{ event }}>
  <div class="contents">
    <p class="explainer">
      Les managers avec le niveau de permission "Scanner les billets" ou supérieur n'ont pas besoin
      de respecter les contraintes pour prendre une place sur un billet, et peuvent également
      prendre une place pour quelqu'un d'autre, peut importe la limite de parrainages définie.
    </p>
    <ul class="managers nobullet">
      <li class="new">
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
      </li>
      {#each event.managers as manager}
        <li>
          <div class="left">
            <AvatarUser name user={manager.user} />
          </div>
          <div class="right">
            <InputSelectOneDropdown
              value={manager.power}
              label=""
              on:input={async ({ detail }) => {
                const result = await mutate(UpdateEventManager, {
                  event: event.id,
                  user: manager.user.uid,
                  power: detail,
                });
                toasts.mutation(
                  result,
                  'upsertEventManager',
                  '',
                  `Impossible de mettre à jour ${loading(manager.user.uid, 'cette personne')}`,
                );
              }}
              options={DISPLAY_MANAGER_PERMISSION_LEVELS}
            ></InputSelectOneDropdown>
            <ButtonGhost
              on:click={async () => {
                const result = await mutate(RemoveEventManager, {
                  event: event.id,
                  user: manager.user.uid,
                });
                toasts.mutation(
                  result,
                  'removeEventManager',
                  `${loading(manager.user.uid, 'cette personne')} n'est plus manager`,
                  `Impossible de retirer ${loading(manager.user.uid, 'cette personne')} des managers`,
                );
              }}><IconRemove></IconRemove></ButtonGhost
            >
          </div>
        </li>
      {/each}
    </ul>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  li.new {
    margin-bottom: 3rem;
  }

  li:not(.new),
  li .left,
  li .right,
  li.new .inputs {
    display: flex;
    align-items: center;
  }

  li .left,
  li .right {
    column-gap: 1rem;
  }

  li .right :global(select) {
    width: min-content;
  }

  li .left {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  li:not(.new) {
    justify-content: space-between;
  }

  li:not(.new),
  li.new .inputs {
    column-gap: 2rem;
  }

  li.new .inputs {
    flex-wrap: wrap;
    row-gap: 1rem;
    justify-content: center;
  }
</style>
