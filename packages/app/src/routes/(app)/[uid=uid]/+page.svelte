<script lang="ts">
  import { MaybeError, SubmenuItem } from '$lib/components';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MemberRoleEmoji from '$lib/components/MemberRoleEmoji.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import { refroute } from '$lib/navigation';
  import IconBirthday from '~icons/msl/cake-outline';
  import IconPhone from '~icons/msl/call-outline';
  import IconAddress from '~icons/msl/map-outline';
  import type { PageData } from './$houdini';
  // import IconStudent
  import { page } from '$app/stores';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import TreePersons from '$lib/components/TreePersons.svelte';
  import { formatDate } from '$lib/dates';
  import { mapLoading, onceLoaded } from '$lib/loading';
  import { formatDistanceToNow, isPast, setYear } from 'date-fns';

  const formatPhoneNumber = (phone: string) =>
    phone
      .replace(/^(?:\+33|0)(\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '0$1 $2 $3 $4 $5')
      .replace(/^\+(\d{2,3}) ([\d ]+)$/, '+$1 $2');

  function nextBirthdayAt(birthdate: Date) {
    const thisYear = new Date().getFullYear();
    const nextBirthday = setYear(birthdate, thisYear);
    return isPast(nextBirthday) ? setYear(birthdate, thisYear + 1) : nextBirthday;
  }

  export let data: PageData;
  $: ({ PageProfile } = data);
  $: tab = $page.url.searchParams.get('tab') || 'infos';

  // HINT: Don't forget to add an entry in packages/app/src/lib/navigation.ts for the top navbar's title and/or action buttons
</script>

<MaybeError result={$PageProfile} let:data={{ profile, me }}>
  {@const mine = $page.params.uid === me?.uid}
  <div class="contents">
    {#if profile.__typename === 'User' && tab === 'groups'}
      <ul class="groups">
        {#each profile.memberOf as membership}
          <li>
            <div class="left">
              <AvatarGroup name group={membership.group} />
            </div>
            <div class="right">
              <LoadingText value={membership.title} />
              <MemberRoleEmoji {membership} />
            </div>
          </li>
        {/each}
      </ul>
    {:else if profile.__typename === 'User' && tab === 'infos'}
      <Submenu>
        {#if profile.phone}
          <SubmenuItem
            icon={IconPhone}
            subtext={mine ? 'Uniquement visible par les autres étudiant.e.s' : ''}
          >
            <LoadingText value={mapLoading(profile.phone, formatPhoneNumber)} />
            <ButtonSecondary
              slot="right"
              href={onceLoaded(profile.phone, (phone) => `tel:${phone}`, '')}
              >Appeler</ButtonSecondary
            >
          </SubmenuItem>
        {/if}
        {#if profile.postalAddress}
          <SubmenuItem
            icon={IconAddress}
            subtext={mine ? 'Uniquement visible par les autres étudiant.e.s' : ''}
          >
            <LoadingText value={profile.postalAddress} />
            <ButtonSecondary
              slot="right"
              href={onceLoaded(
                profile.postalAddress,
                (addr) => `https://google.com/maps?&q=${addr}`,
                '',
              )}>Maps</ButtonSecondary
            >
          </SubmenuItem>
        {/if}
        {#if profile.birthday}
          <SubmenuItem
            icon={IconBirthday}
            subtext={mapLoading(profile.birthday, (date) =>
              formatDistanceToNow(nextBirthdayAt(date), {
                addSuffix: true,
                includeSeconds: false,
              }),
            )}
          >
            <LoadingText value={mapLoading(profile.birthday, formatDate)} />
          </SubmenuItem>
        {/if}
      </Submenu>
    {:else if profile.__typename === 'User' && tab === 'family'}
      <TreePersons user={profile} />
    {:else if profile.__typename === 'Group' && tab === ''}
      <ButtonInk href={refroute('/groups')}
        >Voir les <LoadingText value={profile.membersCount}>...</LoadingText> membres</ButtonInk
      >
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  .groups {
    display: flex;
    flex-direction: column;
  }

  .groups .left {
    font-size: 1.2em;

    --avatar-size: 2em;
  }

  .groups li {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
