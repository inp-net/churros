<script lang="ts">
  import FormEvent from '$lib/components/FormEvent.svelte';
  import { Selector, zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import FormPicture from '$lib/components/FormPicture.svelte';
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

<FormPicture objectName="Event" bind:object={data.event} />
<FormEvent
  redirectAfterSave={() => $page.url.searchParams.get('back') || '../'}
  {availableLydiaAccounts}
  bind:event={data.event}
/>
