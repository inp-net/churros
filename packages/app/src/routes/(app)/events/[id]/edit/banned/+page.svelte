<script lang="ts">
  import { graphql } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import { loading, LoadingText } from '$lib/loading';
  import { mutate } from '$lib/mutations';
  import { toasts } from '$lib/toasts';
  import IconRemove from '~icons/msl/do-not-disturb-on-outline';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageEventEditBanned } = data);

  let newBanUid = '';

  const Ban = graphql(`
    mutation BanFromEvent($user: UID!, $event: LocalID!) {
      banFromEvent(user: $user, id: $event) {
        ... on MutationBanFromEventSuccess {
          data {
            id
            banned {
              ...AvatarUser
              fullName
              uid
            }
          }
        }
        ...MutationErrors
      }
    }
  `);

  const Unban = graphql(`
    mutation UnbanFromEvent($user: UID!, $event: LocalID!) {
      unbanFromEvent(user: $user, id: $event) {
        ... on MutationUnbanFromEventSuccess {
          data {
            id
            banned {
              ...AvatarUser
              fullName
              uid
            }
          }
        }
        ...MutationErrors
      }
    }
  `);
</script>

<MaybeError result={$PageEventEditBanned} let:data={{ event }}>
  <div class="contents">
    <ul class="managers nobullet">
      <li class="new">
        <form
          on:submit|preventDefault={async () => {
            if (event.banned.some((u) => u.uid === newBanUid)) {
              toasts.error(`${newBanUid} est déjà banni·e`);
              return;
            }
            const result = await mutate(Ban, {
              event: event.id,
              user: newBanUid,
            });
            if (
              toasts.mutation(
                result,
                'banFromEvent',
                `${newBanUid} est banni·e`,
                `Impossible de bannir ${newBanUid}`,
              )
            )
              newBanUid = '';
          }}
        >
          <div class="inputs">
            <InputTextGhost
              required
              placeholder="@ de la personne"
              label="Nom d'utilsateur·ice"
              bind:value={newBanUid}
            ></InputTextGhost>
            <ButtonPrimary danger submits>Bannir</ButtonPrimary>
          </div>
        </form>
      </li>
      {#each event.banned as user}
        <li>
          <div class="left">
            <AvatarUser {user} />
            <LoadingText value={user.fullName} />
          </div>
          <div class="right">
            <ButtonGhost
              on:click={async () => {
                const result = await mutate(Unban, {
                  event: event.id,
                  user: user.uid,
                });
                toasts.mutation(
                  result,
                  'unbanFromEvent',
                  `${loading(user.uid, 'cette personne')} n'est plus banni·e`,
                  `Impossible de débannir ${loading(user.uid, 'cette personne')}`,
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

  li:not(.new) {
    justify-content: space-between;
  }

  li:not(.new),
  li.new .inputs {
    column-gap: 2rem;
  }
</style>
