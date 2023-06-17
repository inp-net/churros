<script lang="ts">
  import EventForm from '$lib/components/forms/EventForm.svelte';
  import { me } from '$lib/session';
  import { Selector, zeus } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;

  let availableLydiaAccounts = [];
  $: $zeus
    .query({
      lydiaAccountsOfGroup: [
        { uid: data.event.group.uid },
        Selector('LydiaAccount')({ id: true, name: true })
      ]
    })
    .then(({ lydiaAccountsOfGroup }) => {
      availableLydiaAccounts = lydiaAccountsOfGroup;
    })
    .catch(console.error);
</script>

<EventForm
  availableGroups={data.groups.filter((g) =>
    $me?.groups.some(({ group, canEditArticles }) => canEditArticles && group.id === g.id)
  )}
  {availableLydiaAccounts}
  bind:event={data.event}
/>
