<script lang="ts">
  import { page } from '$app/stores';
  import EventForm from '$lib/components/forms/EventForm.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;
  let event = {
    ticketGroups: [],
    tickets: [],
    authorUid: $me?.uid || '',
    description: '',
    endsAt: undefined,
    groupUid: $page.params.uid,
    contactMail: data.group.email,
    lydiaAccountId: undefined,
    links: [],
    location: '',
    managers: [],
    slug: '',
    startsAt: undefined,
    title: '',
    visibility: 'Private' as 'Private' | 'Public' | 'Restricted' | 'Unlisted',
  };
</script>

<EventForm
  bind:event
  availableLydiaAccounts={data.lydiaAccountsOfGroup.edges.map(({ node }) => node)}
  availableGroups={[]}
/>
