<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  import { zeus } from '$lib/zeus';
  import type { PageData } from '../../routes/(app)/users/[uid]/edit/$types';
  import ButtonSecondary from '../../../packages/app/src/lib/components/ButtonSecondary.svelte';
  import InputSelectMultiple from '../../../packages/app/src/lib/components/InputSelectMultiple.svelte';

  export let data: PageData;

  let { canAccessDocuments } = data.userPermissions;

  function getSelectedPermissions({
    canAccessDocuments,
  }: {
    canAccessDocuments: boolean;
  }): Array<'canAccessDocuments'> {
    return ['canAccessDocuments'].filter(
      (p) => ({ canAccessDocuments })?.[p] ?? false,
    ) as Array<'canAccessDocuments'>;
  }

  let selectedPermissions = getSelectedPermissions({
    canAccessDocuments,
  });
  $: {
    canAccessDocuments = selectedPermissions.includes('canAccessDocuments');
  }

  let loading = false;
  const updateUserPermissions = async () => {
    loading = true;
    try {
      const { updateUserPermissions } = await $zeus.mutate({
        updateUserPermissions: [
          { uid: data.user.uid, canAccessDocuments },
          { canAccessDocuments: true },
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
