<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type PageEventEditManagers_ItemManager } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { DISPLAY_MANAGER_PERMISSION_LEVELS } from '$lib/display';
  import { loading, mapAllLoading, mapLoading, onceLoaded } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';

  export let manager: PageEventEditManagers_ItemManager | null;
  $: data = fragment(
    manager,
    graphql(`
      fragment PageEventEditManagers_ItemManager on EventManagerMaybeInherited {
        __typename
        ... on EventManager {
          power
          user {
            uid
            ...AvatarUser
          }
        }
        ... on InheritedEventManager {
          power
          groupMember {
            group {
              uid
            }
          }
          user {
            uid
            ...AvatarUser
          }
        }
      }
    `),
  );

  $: readonly = Boolean(
    $data && onceLoaded($data.__typename, (typ) => typ === 'InheritedEventManager', false),
  );

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

<li>
  <div class="left">
    <AvatarUser
      href={$data
        ? mapAllLoading([$data], ({ user, ...d }) => {
            if (d.__typename === 'InheritedEventManager')
              {return (
                refroute('/groups/[uid]/members', d.groupMember.group.uid ?? '') +
                `#${user.uid ?? ''}`
              );}
            return refroute('/[uid=uid]', user.uid ?? '');
          })
        : ''}
      name
      user={$data?.user ?? null}
    />
  </div>
  <div class="right">
    {#if readonly}
      <LoadingText
        class="muted"
        value={mapLoading(
          $data?.power,
          (pow) => DISPLAY_MANAGER_PERMISSION_LEVELS[pow ?? 'ReadOnly'],
        )}
      />
    {:else}
      <InputSelectOneDropdown
        value={$data?.power ?? 'ReadOnly'}
        label=""
        on:input={async ({ detail }) => {
          const result = await mutate(UpdateEventManager, {
            event: $page.params.id,
            user: $data?.user.uid,
            power: detail,
          });
          toasts.mutation(
            result,
            'upsertEventManager',
            '',
            `Impossible de mettre à jour ${loading($data?.user.uid, 'cette personne')}`,
          );
        }}
        options={DISPLAY_MANAGER_PERMISSION_LEVELS}
      ></InputSelectOneDropdown>
    {/if}
    {#if !readonly}
      <ButtonGhost
        on:click={async () => {
          const result = await mutate(RemoveEventManager, {
            event: $page.params.id,
            user: $data?.user.uid,
          });
          toasts.mutation(
            result,
            'removeEventManager',
            `${loading($data?.user.uid, 'cette personne')} n'est plus manager`,
            `Impossible de retirer ${loading($data?.user.uid, 'cette personne')} des managers`,
          );
        }}><IconRemove></IconRemove></ButtonGhost
      >
    {/if}
  </div>
</li>

<style>
  li,
  li .left,
  li .right {
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

  li {
    justify-content: space-between;
  }
</style>
