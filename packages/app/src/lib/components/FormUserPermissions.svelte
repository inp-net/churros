<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/users/[uid]/edit/$types';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputSelectMultiple from './InputSelectMultiple.svelte';

  export let data: PageData;

  let { canEditGroups, canEditUsers, canAccessDocuments } = data.userPermissions;

  function getSelectedPermissions({
    canEditGroups,
    canEditUsers,
    canAccessDocuments
  }: {
    canEditGroups: boolean;
    canEditUsers: boolean;
    canAccessDocuments: boolean;
  }): Array<'canEditGroups' | 'canEditUsers' | 'canAccessDocuments'> {
    return ['canEditGroups', 'canEditUsers', 'canAccessDocuments'].filter(
      (p) => ({ canEditGroups, canEditUsers, canAccessDocuments }?.[p] ?? false)
    ) as Array<'canEditGroups' | 'canEditUsers' | 'canAccessDocuments'>;
  }

  let selectedPermissions = getSelectedPermissions({ canEditGroups, canEditUsers, canAccessDocuments });
  $: {
    canEditGroups = selectedPermissions.includes('canEditGroups');
    canEditUsers = selectedPermissions.includes('canEditUsers');
    canAccessDocuments = selectedPermissions.includes('canAccessDocuments');
  }

  let loading = false;
  const updateUserPermissions = async () => {
    loading = true;
    try {
      const { updateUserPermissions } = await $zeus.mutate({
        updateUserPermissions: [
          { uid: data.user.uid, canEditGroups, canEditUsers, canAccessDocuments },
          { canEditGroups: true, canEditUsers: true, canAccessDocuments: true },
        ],
      });

      // Soft refresh because the user's permissions might have changed
      await invalidateAll();

      // Because some permissions set others, we need to update the values
      selectedPermissions = getSelectedPermissions(updateUserPermissions);
    } finally {
      loading = false;
    }
  };
</script>

<form on:submit|preventDefault={updateUserPermissions}>
  <InputSelectMultiple
    options={{
      canEditGroups: 'Édition des groupes',
      canEditUsers: 'Édition des utilisateurs',
      canAccessDocuments: 'Accès à La Frappe',
    }}
    bind:selection={selectedPermissions}
  />

  <section class="submit"><ButtonSecondary {loading} submits>Sauvegarder</ButtonSecondary></section>
</form>

<style>
  form {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;

    /* align-items: center; */
  }

  form > :global(fieldset) {
    display: flex;
    flex-wrap: wrap;

    /* justify-content: center; */
  }
</style>
