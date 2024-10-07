<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type ModalGroupMemberDetails } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckboxes from '$lib/components/InputCheckboxes.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { DISPLAY_GROUP_MEMBER_PERMISSIONS } from '$lib/display';
  import { loading } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import { refroute } from '$lib/navigation';
  import { toasts } from '$lib/toasts';
  import { createEventDispatcher } from 'svelte';
  import {
    RemoveGroupMember,
    UpdateGroupMemberCreatedAt,
    UpdateGroupMemberPermissions,
    UpdateGroupMemberRoles,
    UpdateGroupMemberTitle,
  } from './mutations';

  let openGroupMemberEdit: () => void;
  let closeGroupMemberEdit: () => void;
  const dispatch = createEventDispatcher<{ removeFromGroup: undefined }>();

  export let membership: ModalGroupMemberDetails | null;
  $: data = fragment(
    membership,
    graphql(`
      fragment ModalGroupMemberDetails on GroupMember @loading {
        group {
          uid
          ...AvatarGroup
        }
        user {
          uid
          ...AvatarUser
        }
        title
        createdAt
        canBeEdited
        canEditArticles
        canEditMembers
        canScanEvents
        president
        vicePresident
        treasurer
        secretary
      }
    `),
  );

  $: if ($page.state.EDITING_GROUP_MEMBER) openGroupMemberEdit?.();
  $: if (!$page.state.EDITING_GROUP_MEMBER) closeGroupMemberEdit?.();
</script>

<ModalOrDrawer
  tall
  bind:open={openGroupMemberEdit}
  bind:implicitClose={closeGroupMemberEdit}
  let:close
>
  <header slot="header">
    <AvatarUser name user={$data?.user ?? null} />
  </header>
  <section class="main"></section>
  <section class="details">
    <dl>
      <dt>Titre</dt>
      <dd>
        <InputTextGhost
          label="Titre"
          placeholder="Membre"
          readonly={!$data?.canBeEdited}
          value={$data?.title}
          on:blur={async ({ detail }) => {
            await mutateAndToast(UpdateGroupMemberTitle, {
              group: $data?.group.uid,
              user: $data?.user.uid,
              title: detail,
            });
          }}
        ></InputTextGhost>
      </dd>
      <dt>Membre depuis</dt>
      <dd>
        <InputTextGhost
          placeholder=""
          required
          label="Membre depuis"
          type="date"
          readonly={!$data?.canBeEdited}
          value={$data?.createdAt}
          on:blur={async ({ detail }) => {
            const result = await UpdateGroupMemberCreatedAt.mutate({
              group: loading($data?.group.uid, ''),
              user: loading($data?.user.uid, ''),
              createdAt: detail,
            });
            toasts.mutation(
              result,
              'updateGroupMember',
              '',
              "Impossible de changer la date d'adhésion",
            );
          }}
        ></InputTextGhost>
      </dd>
      {#if $data?.canBeEdited}
        <dt>Permissions</dt>
        <dd>
          <InputCheckboxes
            value={Object.entries({
              canEditArticles: $data?.canEditArticles,
              canEditMembers: $data?.canEditMembers,
              canScanEvents: $data?.canScanEvents,
            })
              .filter(([, v]) => v)
              .map(([k]) => k)}
            options={Object.entries(DISPLAY_GROUP_MEMBER_PERMISSIONS)}
            on:change={async ({ detail }) => {
              await mutateAndToast(UpdateGroupMemberPermissions, {
                group: $data?.group.uid,
                user: $data?.user.uid,
                canEditArticles: detail.includes('canEditArticles'),
                canEditMembers: detail.includes('canEditMembers'),
                canScanEvents: detail.includes('canScanEvents'),
              });
            }}
          ></InputCheckboxes>
        </dd>

        <dt>Rôles</dt>
        <dd>
          <InputCheckboxes
            value={Object.entries({
              president: $data?.president,
              vicePresident: $data?.vicePresident,
              treasurer: $data?.treasurer,
              secretary: $data?.secretary,
            })
              .filter(([, v]) => v)
              .map(([k]) => k)}
            options={Object.entries({
              president: 'Président·e',
              vicePresident: 'Vice-président·e',
              treasurer: 'Trésorier·e',
              secretary: 'Secrétaire',
            })}
            on:change={async ({ detail }) => {
              await mutateAndToast(UpdateGroupMemberRoles, {
                group: $data?.group.uid,
                user: $data?.user.uid,
                president: detail.includes('president'),
                vicePresident: detail.includes('vicePresident'),
                treasurer: detail.includes('treasurer'),
                secretary: detail.includes('secretary'),
              });
            }}
          ></InputCheckboxes>
        </dd>
      {/if}
    </dl>
  </section>
  <section class="actions">
    <ButtonSecondary href={refroute('/[uid=uid]', loading($data?.user.uid, ''))}>
      Profil
    </ButtonSecondary>
    {#if $data?.canBeEdited}
      <ButtonSecondary
        danger
        on:click={async () => {
          await mutateAndToast(
            RemoveGroupMember,
            {
              group: $data?.group.uid,
              user: $data?.user.uid,
            },
            {
              error: `Impossible de virer ${loading($data?.user.uid, '…')}`,
              success: `${loading($data?.user.uid, '…')} a été viré·e`,
            },
          );
          close?.();
          dispatch('removeFromGroup');
        }}>Virer</ButtonSecondary
      >
    {/if}
  </section>
</ModalOrDrawer>

<style>
  section {
    padding: 0 1rem;
  }

  header {
    font-size: 1.4em;
  }

  dl dt {
    margin-top: 1rem;
  }

  dl dd {
    margin-bottom: 0.25rem;
  }

  section.actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
