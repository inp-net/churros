<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import GroupMemberBadge from '$lib/components/BadgeGroupMember.svelte';
  import SchoolBadge from '$lib/components/BadgeSchool.svelte';
  import Card from '$lib/components/Card.svelte';
  import SocialLink from '$lib/components/SocialLink.svelte';

  import PictureUser from '$lib/components/PictureUser.svelte';
  import { formatDate } from '$lib/dates.js';
  import { me } from '$lib/session.js';
  import IconAcademicCap from '~icons/mdi/school';
  import IconCake from '~icons/mdi/cake';
  import IconEdit from '~icons/mdi/pencil';
  import IconLocationMarker from '~icons/mdi/map-marker-outline';
  import IconPhone from '~icons/mdi/phone-outline';
  import type { PageData } from './$types';
  import { byMemberGroupTitleImportance } from '$lib/sorting';

  export let data: PageData;

  $: ({ user } = data);

  const formatPhoneNumber = (phone: string) =>
    phone.replace(/^\+33(\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '0$1 $2 $3 $4 $5');
</script>

<div class="placeholder" />

<Card>
  <div class="user-header">
    <div class="user-picture">
      <PictureUser
        src={user.pictureFile
          ? `${PUBLIC_STORAGE_URL}${user.pictureFile}`
          : 'https://via.placeholder.com/160'}
        alt="{user.firstName} {user.lastName}"
      />
    </div>
    <div class="user-title">
      <h1 class="my-0">
        {user.firstName}
        {user.nickname}
        {user.lastName}
        {#if user.uid === $me?.uid || $me?.canEditUsers}
          <a href="edit/" title="Éditer">
            <IconEdit aria-label="Éditer" />
          </a>
        {/if}
      </h1>
      <div class="description">
        {#if user.description}
          {user.description}
        {:else}
          {['👻', '🌵', '🕸️', '💤'][user.createdAt.getTime() % 4]}
        {/if}
      </div>
      {#if user.links.length > 0}
        <div class="flex flex-wrap mt-2 gap-3">
          {#each user.links as link}
            <SocialLink {...link} />
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <ul>
    <li>
      <IconAcademicCap aria-label="Filière" />
      {user.major.name}
      {user.graduationYear}
      <SchoolBadge schools={user.major.schools} />
    </li>
    {#if user.birthday}
      <li>
        <IconCake aria-label="Anniversaire" />
        {formatDate(user.birthday)}
      </li>
    {/if}
    {#if user.address}
      <li>
        <a
          href="https://www.google.com/maps/search/?api=1&{new URLSearchParams({
            query: user.address,
          })}"
          target="maps"
        >
          <IconLocationMarker aria-label="Adresse" />
          {user.address}
        </a>
      </li>
    {/if}
    {#if user.phone}
      <li>
        <a href="tel:{user.phone}">
          <IconPhone aria-label="Téléphone" />
          {formatPhoneNumber(user.phone)}
        </a>
      </li>
    {/if}
  </ul>

  <h2 class="mb-1">Groupes</h2>
  <ul>
    {#each user.groups.sort(byMemberGroupTitleImportance) as groupMember (groupMember.group.uid)}
      <li>
        <a href="/club/{groupMember.group.uid}/" class="no-underline">
          <GroupMemberBadge {groupMember} />
        </a>
      </li>
    {/each}
  </ul>
</Card>

<style lang="scss">
  .placeholder {
    height: 5rem;
  }

  .user-header {
    margin-top: 5rem;
    margin-bottom: 1rem;
  }

  .user-picture {
    position: absolute;
    transform: translateY(-100%);
  }

  .user-title {
    flex: 1;
    padding-block: 0.5rem;
  }

  .description {
    color: var(--muted);
  }

  @media (min-width: $breakpoint-mobile) {
    .placeholder {
      height: 0;
    }

    .user-header {
      display: flex;
      gap: 1rem;
      align-items: center;
      margin-top: 1rem;
    }

    .user-picture {
      position: static;
      transform: none;
    }

    .user-title {
      padding-block: 0;
    }
  }
</style>
