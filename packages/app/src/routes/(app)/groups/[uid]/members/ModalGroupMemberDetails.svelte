<script lang="ts">
  import { page } from '$app/stores';
  import { fragment, graphql, type ModalGroupMemberDetails } from '$houdini';
  import AvatarUser from '$lib/components/AvatarUser.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import InputCheckboxes from '$lib/components/InputCheckboxes.svelte';
  import InputDateTime from '$lib/components/InputDateTime.svelte';
  import InputTextGhost from '$lib/components/InputTextGhost.svelte';
  import ModalOrDrawer from '$lib/components/ModalOrDrawer.svelte';
  import { DISPLAY_GROUP_MEMBER_PERMISSIONS } from '$lib/display';
  import { loading } from '$lib/loading';
  import { refroute } from '$lib/navigation';

  let openGroupMemberEdit: () => void;
  let closeGroupMemberEdit: () => void;

  export let membership: ModalGroupMemberDetails | null;
  $: data = fragment(
    membership,
    graphql(`
      fragment ModalGroupMemberDetails on GroupMember @loading {
        group {
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

<ModalOrDrawer tall bind:open={openGroupMemberEdit} bind:implicitClose={closeGroupMemberEdit}>
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
        ></InputTextGhost>
      </dd>
      <dt>Membre depuis</dt>
      <dd>
        <InputDateTime
          variant="ghost"
          label=""
          value={$data?.createdAt}
          readonly={!$data?.canBeEdited}
        ></InputDateTime>
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
          ></InputCheckboxes>
        </dd>
      {/if}
    </dl>
  </section>
  <section class="actions">
    <ButtonSecondary href={refroute('/[uid=uid]', loading($data?.user.uid, ''))}>
      Profil
    </ButtonSecondary>
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
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
  }
</style>
