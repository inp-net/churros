<script lang="ts">
  import { page } from '$app/stores';
  import {
    cache,
    fragment,
    graphql,
    PageEventEditManagersStore,
    type PageEventEditManagers_ItemManager,
  } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import InputSelectOneDropdown from '$lib/components/InputSelectOneDropdown.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import { DISPLAY_MANAGER_PERMISSION_LEVELS } from '$lib/display';
  import { mutationSucceeded } from '$lib/errors';
  import {
    allLoaded,
    loaded,
    loading,
    mapAllLoading,
    mapLoading,
    onceLoaded,
    type MaybeLoading,
  } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';

  export let highlightedInviteId = '';

  export let manager: PageEventEditManagers_ItemManager | null;
  $: data = fragment(
    manager,
    graphql(`
      fragment PageEventEditManagers_ItemManager on EventManagerMaybeInherited {
        __typename
        ... on EventManager {
          power
          usedInvite {
            id
            localID
          }
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
          lastManagerPowerlevelChanged
          data {
            id @EventManager_delete
            usedInvite {
              usesLeft
              unusable
            }
          }
        }
        ...MutationErrors
      }
    }
  `);

  /** Get the invitation code. Since websocket requests are not authenticated, updates to the manager list would cause the invite code to be "null". Here, we get the code from houdini's cache, as the event manager invite should've been loaded by the page load anyway. If the code is not found in the cache, we simply tell the user that the manager got here from *an* invitation link, without displaying the code */
  function inviteCode(id: MaybeLoading<string>): string | null {
    if (!loaded(id)) return null;
    return (
      cache.get('EventManagerInvite', { id })?.read({
        fragment: graphql(`
          fragment EventManagerInviteCodeFromId on EventManagerInvite {
            code
          }
        `),
      }).data?.code ?? null
    );
  }
</script>

<li>
  <div class="left">
    <AvatarUser
      href={$data
        ? mapAllLoading([$data], ({ user, ...d }) => {
            if (d.__typename === 'InheritedEventManager') {
              return (
                refroute('/groups/[uid]/members', d.groupMember.group.uid ?? '') +
                `#${user.uid ?? ''}`
              );
            }
            return refroute('/[uid=uid]', user.uid ?? '');
          })
        : ''}
      name
      user={$data?.user ?? null}
    />
    {#if allLoaded($data) && $data?.__typename === 'EventManager' && $data.usedInvite}
      <button
        class="used-invite"
        use:tooltip={`${$data.user.uid} a rejoint avec un lien d'invitation`}
        on:click={() => {
          if (!$data.usedInvite) return;
          highlightedInviteId = $data.usedInvite.id;
        }}
      >
        via {inviteCode($data.usedInvite.id) ?? 'invitation'}
      </button>
    {/if}
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
          if (
            mutationSucceeded('removeEventManager', result) &&
            result.data.removeEventManager.lastManagerPowerlevelChanged
          ) {
            toasts.info(result.data.removeEventManager.lastManagerPowerlevelChanged);
            await new PageEventEditManagersStore().fetch({
              variables: { id: $page.params.id },
            });
          }
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

  .used-invite {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    border-bottom: var(--border-inline) dashed transparent;
  }

  .used-invite:hover,
  .used-invite:focus-visible {
    border-bottom-color: var(--muted);
  }
</style>
