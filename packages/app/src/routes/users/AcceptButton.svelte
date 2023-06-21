<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import { zeus } from '$lib/zeus';
  import { createEventDispatcher } from 'svelte';
  import IconCheckLine from '~icons/mdi/check';

  export let email: string;

  const dispatch = createEventDispatcher<{ accept: undefined }>();

  let loading = false;
  const acceptRegistration = async () => {
    if (loading) return;
    try {
      loading = true;
      const { acceptRegistration } = await $zeus.mutate({ acceptRegistration: [{ email }, true] });
      if (acceptRegistration) dispatch('accept');
    } finally {
      loading = false;
    }
  };
</script>

<Button theme="primary" {loading} on:click={acceptRegistration}><IconCheckLine /></Button>
