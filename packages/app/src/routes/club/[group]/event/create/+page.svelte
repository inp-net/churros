<script lang="ts">
  import { page } from '$app/stores';
  import EventForm from '$lib/components/forms/EventForm.svelte';
  import { Visibility } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;
  let event = {
    id: '',
    uid: '',
    ticketGroups: [],
    tickets: [],
    group: data.group,
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
    visibility: Visibility.Private
  };
</script>

<EventForm bind:event availableLydiaAccounts={data.lydiaAccountsOfGroup} availableGroups={[]} />
