<script lang="ts">
  import { page } from '$app/stores';
  import EventForm from '$lib/components/FormEvent.svelte';
  import { me } from '$lib/session';
  import { EventFrequency, Visibility } from '$lib/zeus';
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
    beneficiary: data.lydiaAccountsOfGroup.length === 1 ? data.lydiaAccountsOfGroup[0] : undefined,
    links: [],
    location: '',
    managers: $me
      ? [
          {
            user: $me,
            canEdit: true,
            canEditPermissions: true,
            canVerifyRegistrations: true,
          },
        ]
      : [],
    slug: '',
    startsAt: undefined,
    title: '',
    visibility: Visibility.Private,
    frequency: EventFrequency.Once,
    recurringUntil: undefined,
    pictureFile: '',
  };
  // export const snapshot: Snapshot = {
  //   capture: () => ({ event }),
  //   restore({ event }) {
  //     $page.params.uid = event.groupUid;
  //     $page.params.eventUid = event.uid;
  //     data.group = event.group;
  //     data.event = event;
  //   },
  // };
  const redirectAfterSave = (uid: string) => $page.url.searchParams.get('back') || `../${uid}`;
</script>

<div class="content">
  <h1>Créer un évènement</h1>

  <EventForm {redirectAfterSave} bind:event availableLydiaAccounts={data.lydiaAccountsOfGroup} />
</div>

<style>
  .content {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    margin-bottom: 3rem;
    text-align: center;
  }
</style>
