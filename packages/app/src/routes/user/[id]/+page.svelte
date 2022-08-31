<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import GroupMemberBadge from '$lib/components/badges/GroupMemberBadge.svelte';
  import SchoolBadge from '$lib/components/badges/SchoolBadge.svelte';
  import Card from '$lib/components/cards/Card.svelte';
  import SocialLink from '$lib/components/links/SocialLink.svelte';
  import FlexList from '$lib/components/lists/FlexList.svelte';
  import UserPicture from '$lib/components/pictures/UserPicture.svelte';
  import { formatDate } from '$lib/dates.js';
  import MajesticonsAcademicCap from '~icons/majesticons/academic-cap-line';
  import MajesticonsCake from '~icons/majesticons/cake-line';
  import MajesticonsEdit from '~icons/majesticons/edit-pen-2-line';
  import MajesticonsLocationMarker from '~icons/majesticons/location-marker-line';
  import MajesticonsPhone from '~icons/majesticons/phone-line';
  import type { PageData } from './$types';

  export let data: PageData;

  const formatPhoneNumber = (phone: string) =>
    phone.replace(/^\+33(\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '0$1 $2 $3 $4 $5');
</script>

<div class="placeholder" />

<Card>
  <div class="user-header">
    <div class="user-picture">
      <UserPicture
        src={data.user.pictureFile
          ? `${PUBLIC_STORAGE_URL}${data.user.pictureFile}`
          : 'https://via.placeholder.com/160'}
        alt="{data.user.firstName} {data.user.lastName}"
      />
    </div>
    <div class="user-title">
      <h1 class="my-0">
        {data.user.firstName}
        {data.user.nickname}
        {data.user.lastName}
        <a href="edit/" title="Éditer">
          <MajesticonsEdit aria-label="Éditer" />
        </a>
      </h1>
      <div class="biography">
        {#if data.user.biography}
          {data.user.biography}
        {:else}
          {['👻', '🌵', '🕸️', '💤'][Number(data.user.id) % 4]}
        {/if}
      </div>
      {#if data.user.links.length > 0}
        <div class="flex flex-wrap mt-2 gap-3">
          {#each data.user.links as link}
            <SocialLink {...link} />
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <FlexList>
    <li>
      <MajesticonsAcademicCap aria-label="Filière" />
      {data.user.major.name}
      {data.user.graduationYear}
      <SchoolBadge schools={data.user.major.schools} />
    </li>
    {#if data.user.birthday}
      <li>
        <MajesticonsCake aria-label="Anniversaire" />
        {formatDate(data.user.birthday)}
      </li>
    {/if}
    {#if data.user.address}
      <li>
        <a
          href="https://www.google.com/maps/search/?api=1&{new URLSearchParams({
            query: data.user.address,
          })}"
          target="maps"
        >
          <MajesticonsLocationMarker aria-label="Adresse" />
          {data.user.address}
        </a>
      </li>
    {/if}
    {#if data.user.phone}
      <li>
        <a href="tel:{data.user.phone}">
          <MajesticonsPhone aria-label="Téléphone" />
          {formatPhoneNumber(data.user.phone)}
        </a>
      </li>
    {/if}
  </FlexList>

  <h2 class="mb-1">Groupes</h2>
  <FlexList>
    {#each data.user.groups as groupMember}
      <li>
        <a href="/club/{groupMember.group.id}/">
          <GroupMemberBadge {groupMember} />
        </a>
      </li>
    {/each}
  </FlexList>
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

  .biography {
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
