<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/user/[uid]/edit/$types';
  import ButtonSecondary from './ButtonSecondary.svelte';
  import InputSelectMultiple from './InputSelectMultiple.svelte';

  export let data: PageData;

  let { admin, canEditGroups, canEditUsers } = data.userPermissions;

  function getSelectedPermissions({
    admin,
    canEditGroups,
    canEditUsers,
  }: {
    admin: boolean;
    canEditGroups: boolean;
    canEditUsers: boolean;
  }): Array<'admin' | 'canEditGroups' | 'canEditUsers'> {
    return ['admin', 'canEditGroups', 'canEditUsers'].filter(
      (p) => ({ admin, canEditGroups, canEditUsers }?.[p] ?? false)
    ) as Array<'admin' | 'canEditGroups' | 'canEditUsers'>;
  }

  let selectedPermissions = getSelectedPermissions({ admin, canEditGroups, canEditUsers });
  $: {
    admin = selectedPermissions.includes('admin');
    canEditGroups = selectedPermissions.includes('canEditGroups');
    canEditUsers = selectedPermissions.includes('canEditUsers');
  }

  let loading = false;
  const updateUserPermissions = async () => {
    loading = true;
    try {
      const { updateUserPermissions } = await $zeus.mutate({
        updateUserPermissions: [
          { uid: data.user.uid, admin, canEditGroups, canEditUsers },
          { admin: true, canEditGroups: true, canEditUsers: true },
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
      admin: 'Administrateur',
      canEditGroups: 'Édition des groupes',
      canEditUsers: 'Édition des utilisateurs',
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
