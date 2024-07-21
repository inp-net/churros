<script lang="ts">
  import { page } from '$app/stores';
  import FormEvent from '$lib/components/FormEvent.svelte';
  import { me } from '$lib/session';
  import { EventFrequency, Visibility } from '$lib/zeus';
  import type { PageData } from './$types';

  export let data: PageData;
  let event = {
    id: '',
    localID: '',
    uid: '',
    ticketGroups: [],
    tickets: [],
    group: data.group,
    description: '',
    endsAt: undefined,
    groupUid: $page.params.uid,
    contactMail: data.group?.email,
    beneficiary:
      data.lydiaAccounts.filter((l) => l.group?.uid === data.group?.uid).length === 1
        ? data.lydiaAccounts.find((l) => l.group?.uid === data.group?.uid)
        : undefined,
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
    includeInKiosk: false,
    showPlacesLeft: true,
    frequency: EventFrequency.Once,
    recurringUntil: undefined,
    pictureFile: '',
    coOrganizers: [],
    bannedUsers: [],
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

  <FormEvent {redirectAfterSave} bind:event availableLydiaAccounts={data.lydiaAccounts} />
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
