<script lang="ts">
  import { pushState } from '$app/navigation';
  import { page } from '$app/stores';
  import { graphql } from '$houdini';
  import { colorName } from '$lib/colors';
  import AvatarGroup from '$lib/components/AvatarGroup.houdini.svelte';
  import AvatarStudentAssociation from '$lib/components/AvatarStudentAssociation.svelte';
  import ButtonCopyToClipboard, {
    copyToClipboard,
  } from '$lib/components/ButtonCopyToClipboard.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import GroupMember from '$lib/components/GroupMember.svelte';
  import InputCheckbox from '$lib/components/InputCheckbox.svelte';
  import LoadingText from '$lib/components/LoadingText.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import Submenu from '$lib/components/Submenu.svelte';
  import SubmenuItem from '$lib/components/SubmenuItem.svelte';
  import TreePersons from '$lib/components/TreePersons.svelte';
  import { formatDate } from '$lib/dates';
  import { loaded, loading, mapLoading, onceLoaded } from '$lib/loading';
  import { refroute } from '$lib/navigation';
  import { route } from '$lib/ROUTES';
  import { formatDistanceToNow, isPast, isToday, setYear } from 'date-fns';
  import IconAdd from '~icons/msl/add';
  import IconHandover from '~icons/msl/assignment-outline';
  import IconBirthday from '~icons/msl/cake-outline';
  import IconPhone from '~icons/msl/call-outline';
  import { default as IconCheck, default as IconOpen } from '~icons/msl/check';
  import IconClosed from '~icons/msl/close';
  import IconContributesTo from '~icons/msl/euro';
  import IconGroupRoom from '~icons/msl/home-outline';
  import IconStudentUid from '~icons/msl/id-card-outline';
  import IconEmail from '~icons/msl/mail-outline';
  import IconAddress from '~icons/msl/map-outline';
  import IconOtherEmails from '~icons/msl/stacked-email-outline';
  import IconNickname from '~icons/msl/signature';
  import type { PageData } from './$houdini';

  const formatPhoneNumber = (phone: string) =>
    phone
      .replace(/^(?:\+33|0)(\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '0$1 $2 $3 $4 $5')
      .replace(/^\+(\d{2,3}) ([\d ]+)$/, '+$1 $2');

  function nextBirthdayAt(birthdate: Date) {
    const thisYear = new Date().getFullYear();
    const nextBirthday = setYear(birthdate, thisYear);
    return isPast(nextBirthday) ? setYear(birthdate, thisYear + 1) : nextBirthday;
  }

  function isBirthdayToday(birthdate: Date) {
    return isToday(setYear(birthdate, new Date().getFullYear()));
  }

  const MarkRoomOpen = graphql(`
    mutation MarkRoomOpen($group: UID!) {
      setGoupRoomOpenState(group: $group, open: true) {
        roomIsOpen
      }
    }
  `);

  const MarkRoomClosed = graphql(`
    mutation MarkRoomClosed($group: UID!) {
      setGoupRoomOpenState(group: $group, open: false) {
        roomIsOpen
      }
    }
  `);

  export let data: PageData;
  $: ({ PageProfile } = data);
  $: tab = $page.url.searchParams.get('tab') || 'infos';
</script>

<svelte:window
  on:NAVTOP_COPY_ID={async () => {
    if (!$PageProfile.data?.profile) return;
    if (!('id' in $PageProfile.data.profile)) return;
    const id = loading($PageProfile.data?.profile.id, '');
    if (!id) return;
    await copyToClipboard(id);
  }}
/>

<MaybeError result={$PageProfile} let:data={{ profile }}>
  <div class="contents">
    {#if profile.__typename === 'User' && tab === 'groups'}
      <Submenu>
        {#each profile.memberOf as membership}
          <GroupMember href={refroute('/[uid=uid]', membership.group.uid)} side="group" {membership}
          ></GroupMember>
        {/each}
        <SubmenuItem
          icon={IconAdd}
          clickable
          on:click={() => {
            pushState('', {
              NAVTOP_CREATING_GROUP_MEMBER: true,
            });
          }}>Ajouter à…</SubmenuItem
        >
      </Submenu>
    {:else if profile.__typename === 'User' && tab === 'infos'}
      <Submenu>
        {#if profile.nickname}
          <SubmenuItem icon={IconNickname} subtext="Surnom">
            <LoadingText value={profile.nickname} />
          </SubmenuItem>
        {/if}
        {#if profile.phone}
          <SubmenuItem
            icon={IconPhone}
            subtext={profile.isMe ? 'Uniquement visible par les autres étudiant.e.s' : ''}
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
            subtext={profile.isMe ? 'Uniquement visible par les autres étudiant.e.s' : ''}
          >
            <LoadingText value={profile.postalAddress} />
            <ButtonSecondary
              slot="right"
              href={onceLoaded(
                profile.postalAddress,
                (addr) => `https://google.com/maps?q=${addr}`,
                '',
              )}>Maps</ButtonSecondary
            >
          </SubmenuItem>
        {/if}
        {#if profile.birthday}
          <SubmenuItem icon={IconBirthday}>
            <span
              slot="subtext"
              class="birthday-distance"
              class:today={isBirthdayToday(profile.birthday)}
            >
              {mapLoading(profile.birthday, (date) =>
                isToday(setYear(date, new Date().getFullYear()))
                  ? "Aujourd'hui !"
                  : formatDistanceToNow(nextBirthdayAt(date), {
                      addSuffix: true,
                      includeSeconds: false,
                    }),
              )}
            </span>
            <LoadingText value={mapLoading(profile.birthday, formatDate)} />
          </SubmenuItem>
        {/if}
        {#if profile.email}
          <SubmenuItem icon={IconEmail}>
            <LoadingText value={profile.email} />
            <ButtonSecondary
              slot="right"
              href={onceLoaded(profile.email, (email) => `mailto:${email}`, '')}
              >Contacter</ButtonSecondary
            >
          </SubmenuItem>
        {/if}
        {#if profile.otherEmails && profile.otherEmails.length > 0}
          <SubmenuItem icon={IconOtherEmails}>
            {#each profile.otherEmails as email}
              <LoadingText tag="p" value={email}></LoadingText>
            {/each}
          </SubmenuItem>
        {/if}
        {#if profile.schoolUid}
          <SubmenuItem icon={IconStudentUid} subtext="Identifiant de l'école">
            <LoadingText value={profile.schoolUid} />
            <ButtonCopyToClipboard slot="right" label text={profile.schoolUid} />
          </SubmenuItem>
        {/if}
        {#if profile.contributesTo}
          <SubmenuItem
            icon={IconContributesTo}
            subtext={profile.isMe ? "Visible par toi et l'équipe administrative" : undefined}
          >
            <div class="contributes-for">
              {#if profile.contributesTo.length > 0}
                Cotise pour
                {#each profile.contributesTo as studentAssociation}
                  <AvatarStudentAssociation name {studentAssociation}></AvatarStudentAssociation>
                {/each}
              {:else}
                Non cotisant.e
              {/if}
            </div>
            <ButtonSecondary
              slot="right"
              href={refroute('/users/[uid]/edit/contributions', $page.params.uid)}
            >
              Gérer
            </ButtonSecondary>
          </SubmenuItem>
        {/if}
      </Submenu>
    {:else if profile.__typename === 'User' && tab === 'family'}
      <TreePersons user={profile} />
    {:else if profile.__typename === 'Group' && tab === 'members'}
      <Submenu>
        {#each profile.boardMembers as membership}
          <GroupMember href={refroute('/[uid=uid]', membership.user.uid)} side="user" {membership}
          ></GroupMember>
        {/each}
      </Submenu>
      <section class="see-more-button">
        <ButtonInk href={refroute('/groups/[uid]/members', $page.params.uid)}
          >Voir les <LoadingText value={profile.membersCount}>...</LoadingText> membres</ButtonInk
        >
      </section>
    {:else if profile.__typename === 'Group' && tab === 'infos'}
      <Submenu>
        {#if profile.color}
          <SubmenuItem icon={null} subtext="Couleur">
            <div
              class:skeleton-effect-wave={!loaded(profile.color)}
              class="color-dot"
              slot="icon"
              style:background-color={loading(profile.color, 'black')}
            />
            <LoadingText value={mapLoading(profile.color, colorName)} />
          </SubmenuItem>
        {/if}
        {#if profile.email}
          <SubmenuItem icon={IconEmail}>
            <LoadingText value={profile.email} />
            <ButtonSecondary
              slot="right"
              href={onceLoaded(profile.email, (email) => `mailto:${email}`, '')}
              >Contacter</ButtonSecondary
            >
          </SubmenuItem>
        {/if}
        {#if profile.address}
          <SubmenuItem icon={IconGroupRoom} subtext="Local">
            <LoadingText value={profile.address} />
            <svelte:fragment slot="right">
              {#if profile.canSetGroupRoomOpenState}
                <InputCheckbox
                  label={profile.roomIsOpen ? 'Ouvert' : 'Fermé'}
                  value={profile.roomIsOpen}
                  on:update={async ({ detail }) => {
                    await (detail
                      ? MarkRoomOpen.mutate({ group: $page.params.uid })
                      : MarkRoomClosed.mutate({ group: $page.params.uid }));
                  }}
                />
              {:else if profile.roomIsOpen}
                <IconOpen /> Ouvert
              {:else}
                <IconClosed /> Fermé
              {/if}
            </svelte:fragment>
          </SubmenuItem>
        {/if}
        {#if profile.canEditMembers}
          <SubmenuItem
            icon={IconHandover}
            href={route('GET /groups/[uid]/handover.pdf', $page.params.uid)}
          >
            Fiche de passation
            <!-- FIXME download attr doesn't cause a download -->
            <!-- <ButtonSecondary
              slot="right"
              download="Fiche de passation {$page.params.uid}.pdf"
              href={route('GET /groups/[uid]/handover.pdf', $page.params.uid)}
              >Télécharger</ButtonSecondary
            > -->
          </SubmenuItem>
        {/if}
      </Submenu>
    {:else if profile.__typename === 'Group' && tab === 'see-also'}
      <ul class="avatars big">
        {#each profile.familyChildren.filter((g) => g.uid !== $page.params.uid) as group}
          <li>
            <div class="left">
              <AvatarGroup name {group} />
            </div>
            <div class="right muted">
              {#if group.description}
                <LoadingText value={group.description} />
              {:else if group.selfJoinable}
                <span class="selfjoinable muted">
                  <IconCheck /> Inscription libre
                </span>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
      {#if profile.related.length > 0}
        <h3 class="typo-field-label">Ça pourrait aussi te plaire</h3>
        <ul class="avatars big">
          {#each profile.related as group}
            <li>
              <div class="left"><AvatarGroup name {group} /></div>
              <div class="right muted"><LoadingText value={group.description} /></div>
            </li>
          {/each}
        </ul>
      {/if}
    {/if}
  </div>
</MaybeError>

<style>
  .contents {
    padding: 0 1rem;
  }

  h3 {
    --weight-field-label: 800;

    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  .avatars {
    display: flex;
    flex-direction: column;
  }

  .avatars .left {
    font-size: 1.1em;

    --avatar-size: 2em;
  }

  .avatars li > div {
    max-width: 50%;
    overflow: hidden;
    text-overflow: ellipsis;
    text-wrap: nowrap;
  }

  .avatars li {
    display: flex;
    gap: 2em;
    align-items: center;
    justify-content: space-between;
  }

  .color-dot {
    width: 1em;
    height: 1em;
    padding: 0.5em;
    border-radius: 1000px;
  }

  .contributes-for {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25ch 0.5ch;
    align-items: center;
  }

  .see-more-button {
    display: flex;
    justify-content: center;
  }

  .birthday-distance.today {
    background: linear-gradient(-45deg, #ffb347, #fc3, #ff6f61, #fc3, #ffb347);
    background-clip: text;
    background-size: 200% 200%;
    animation: textgradient 1s linear infinite;
    -webkit-text-fill-color: transparent;
  }

  @keyframes textgradient {
    to {
      background-position: 200% center;
    }
  }
</style>
