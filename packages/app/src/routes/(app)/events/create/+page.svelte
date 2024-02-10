<script lang="ts">
  import { page } from '$app/stores';
  import FormEventBeta from '$lib/components/FormEventBeta.svelte';
  import { me } from '$lib/session';
  import { EventFrequency, Visibility } from '$lib/zeus';
  import { addDays } from 'date-fns';

  let event = {
    id: '',
    uid: '',
    ticketGroups: [],
    tickets: [],
    group: undefined,
    description: '',
    groupUid: $page.params.uid,
    contactMail: '',
    beneficiary: undefined,
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
  $: goBackTo = $page.url.searchParams.get('back') || `../${event.uid}`;
</script>

<div class="content">
  <FormEventBeta creating {goBackTo} bind:event />
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
