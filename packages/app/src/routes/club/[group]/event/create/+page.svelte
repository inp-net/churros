<script lang="ts">
  import { page } from '$app/stores';
  import EventForm from '$lib/components/FormEvent.svelte';
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
    visibility: Visibility.Private,
  };
  export const snapshot: Snapshot = {
    capture: () => ({ event }),
    restore({ event }) {
      $page.params.uid = event.groupUid;
      $page.params.eventUid = event.uid;
      data.group = event.group;
      data.event = event;
    },
  };
  const redirectAfterSave = (uid: string) => $page.url.searchParams.get('back') || `../${uid}`;
</script>

<EventForm {redirectAfterSave} bind:event availableLydiaAccounts={data.lydiaAccountsOfGroup} />
