<script lang="ts">
  import { page } from '$app/stores';
  import FormEvent from '$lib/components/FormEvent.svelte';
  import FormEventBeta from '$lib/components/FormEventBeta.svelte';
  import { me } from '$lib/session';
  import { EventFrequency, Visibility } from '$lib/zeus';
  import { addDays } from 'date-fns';
  import type { PageData } from './$types';

  export let data: PageData;
  let event = {
    id: '',
    uid: '',
    ticketGroups: [],
    tickets: [],
    group: data.group,
    description: '',
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
    startsAt: new Date(),
    endsAt: addDays(new Date(), 1),
    title: 'test',
    visibility: Visibility.Private,
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
  <FormEventBeta bind:event group={event.group} />
</div>

<style>
  :global(main) {
    height: 100%;
  }
  .content {
    max-width: 1200px;
    height: 100%;
    margin: 0 auto;
  }
</style>
