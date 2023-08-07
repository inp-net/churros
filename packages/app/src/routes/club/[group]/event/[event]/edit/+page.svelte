<script lang="ts">
  import FormEvent from '$lib/components/FormEvent.svelte';
  import { Selector, zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { page } from '$app/stores';

  export let data: PageData;

  let availableLydiaAccounts: Array<{ name: string; id: string }> = [];
  $: $zeus
    .query({
      lydiaAccountsOfGroup: [
        { uid: data.event.group.uid },
        Selector('LydiaAccount')({ id: true, name: true }),
      ],
    })
    .then(({ lydiaAccountsOfGroup }) => {
      availableLydiaAccounts = lydiaAccountsOfGroup;
    })
    .catch(console.error);
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
  }
</style>
