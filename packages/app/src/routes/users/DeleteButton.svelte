<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import { zeus } from '$lib/zeus.js';
  import { createEventDispatcher } from 'svelte';
  import IconTrashLine from '~icons/mdi/delete';

  export let email: string;

  const dispatch = createEventDispatcher<{ refuse: undefined }>();

  let loading = false;
  const refuseRegistration = async () => {
    if (loading) return;
    try {
      loading = true;
      const { refuseRegistration } = await $zeus.mutate({ refuseRegistration: [{ email }, true] });
      if (refuseRegistration) dispatch('refuse');
    } finally {
      loading = false;
    }
  };
</script>

<Button theme="danger" {loading} on:click={refuseRegistration}><IconTrashLine /></Button>
