<script lang="ts">
  import FormEvent from '$lib/components/FormEvent.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  export let data: PageData;

  let availableLydiaAccounts: Array<{
    name: string;
    id: string;
    group?:
      | {
          pictureFile: string;
          pictureFileDark: string;
          name: string;
        }
      | undefined;
  }> = [];

  onMount(async () => {
    const { lydiaAccounts } = await $zeus.query({
      lydiaAccounts: {
        id: true,
        name: true,
        group: {
          pictureFile: true,
          pictureFileDark: true,
          name: true,
        },
      },
    });
    availableLydiaAccounts = lydiaAccounts;
  });
</script>

<div class="content">
  <FormEvent
    redirectAfterSave={() => $page.url.searchParams.get('back') || '../'}
    {availableLydiaAccounts}
    bind:event={data.event}
  />
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 1rem;
    align-items: center;
    padding: 0 1rem;
  }
</style>
