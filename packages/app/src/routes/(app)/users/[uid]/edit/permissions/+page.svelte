<script lang="ts">
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import PickStudentAssociation from '$lib/components/PickStudentAssociation.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import { sentenceJoin } from '$lib/i18n';
  import { loading, mapAllLoading } from '$lib/loading';
  import { mutateAndToast } from '$lib/mutations';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageUserEditPermissions } = data);
  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons

  const SetCanAccessDocuments = graphql(`
    mutation SetCanAccessDocuments($uid: UID!, $enabled: Boolean!) {
      updateUserPermissions(user: $uid, canAccessDocuments: $enabled) {
        ...MutationErrors
        ... on MutationUpdateUserPermissionsSuccess {
          data {
            canAccessDocuments
          }
        }
      }
    }
  `);

  const SetGroupEditor = graphql(`
    mutation SetGroupEditor($uid: UID!, $associations: [UID!]!) {
      updateUserPermissions(user: $uid, canEditGroupsOf: $associations) {
        ...MutationErrors
        ... on MutationUpdateUserPermissionsSuccess {
          data {
            groupsEditorOf {
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  `);

  const SetAdminOf = graphql(`
    mutation SetStudentAssociationAdmin($uid: UID!, $associations: [UID!]!) {
      updateUserPermissions(user: $uid, adminOf: $associations) {
        ...MutationErrors
        ... on MutationUpdateUserPermissionsSuccess {
          data {
            adminOf {
              ...AvatarStudentAssociation
            }
          }
        }
      }
    }
  `);
</script>

<MaybeError result={$PageUserEditPermissions} let:data={{ user, studentAssociations }}>
  <div class="contents">
    <Submenu>
      <SubmenuItem icon={null} label subtext="La plateforme de partage de documents"
        >Accès à La Frappe
        <InputToggle
          slot="right"
          value={loading(user.canAccessDocuments, false)}
          on:update={async ({ detail }) => {
            await mutateAndToast(SetCanAccessDocuments, {
              uid: $page.params.uid,
              enabled: detail,
            });
          }}
        ></InputToggle>
      </SubmenuItem>
      <PickStudentAssociation
        value={mapAllLoading(
          user.groupsEditorOf.map((s) => s.uid),
          (...uids) => uids,
        )}
        multiple
        options={studentAssociations}
        on:finish={async ({ detail }) => {
          await mutateAndToast(SetGroupEditor, {
            uid: $page.params.uid,
            associations: detail,
          });
        }}
        let:open
      >
        <SubmenuItem
          icon={null}
          clickable
          on:click={open}
          subtext={mapAllLoading(
            user.groupsEditorOf.map((s) => s.name),
            (...names) => `Peut gérer tout les groupes de ${sentenceJoin(names)}`,
          )}
        >
          Respo clubs de
          <div class="associations" slot="right">
            {#each user.groupsEditorOf as studentAssociation}
              <AvatarStudentAssociation {studentAssociation} />
            {/each}
          </div>
        </SubmenuItem>
      </PickStudentAssociation>
      <PickStudentAssociation
        value={mapAllLoading(
          user.adminOf.map((s) => s.uid),
          (...uids) => uids,
        )}
        multiple
        options={studentAssociations}
        on:finish={async ({ detail }) => {
          await mutateAndToast(SetAdminOf, {
            uid: $page.params.uid,
            associations: detail,
          });
        }}
        let:open
      >
        <SubmenuItem
          icon={null}
          clickable
          on:click={open}
          subtext={mapAllLoading(
            user.adminOf.map((s) => s.name),
            (...names) => `Possède tout les droits sur ${sentenceJoin(names)}`,
          )}
        >
          Administrateur·ice de
          <div class="associations" slot="right">
            {#each user.adminOf as studentAssociation}
              <AvatarStudentAssociation {studentAssociation} />
            {/each}
          </div>
        </SubmenuItem>
      </PickStudentAssociation>
      <SubmenuItem
        icon={null}
        subtext={loading(user.admin, false) ? 'À changer en DB ^^ (table User, colonne admin)' : ''}
      >
        Admin système
        <svelte:element
          this={user.admin ? 'strong' : 'span'}
          slot="right"
          class:success={user.admin}
          class:danger={!user.admin}
        >
          {#if user.admin}Oui{:else}Non{/if}
        </svelte:element>
      </SubmenuItem>
    </Submenu>
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .associations {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
