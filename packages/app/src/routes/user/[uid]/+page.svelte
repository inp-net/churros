<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconGear from '~icons/mdi/gear';
  import GroupMemberBadge from '$lib/components/BadgeGroupMember.svelte';
  import SchoolBadge from '$lib/components/BadgeSchool.svelte';
  import Card from '$lib/components/Card.svelte';
  import SocialLink from '$lib/components/SocialLink.svelte';
  import IconWebsite from '~icons/mdi/earth';
  import PictureUser from '$lib/components/PictureUser.svelte';
  import { dateFormatter, formatDate } from '$lib/dates.js';
  import { me } from '$lib/session.js';
  import IconAcademicCap from '~icons/mdi/school';
  import IconCake from '~icons/mdi/cake';
  import IconEdit from '~icons/mdi/pencil';
  import IconLocationMarker from '~icons/mdi/map-marker-outline';
  import IconPhone from '~icons/mdi/phone-outline';
  import type { PageData } from './$types';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import { closestTo } from 'date-fns';
  import IconFacebook from '~icons/mdi/facebook-box';
  import type { SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconMatrix from '~icons/mdi/matrix';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconDiscord from '~icons/mdi/discord';
  import IconSnapchat from '~icons/mdi/snapchat';
  import BadgeGroupMember from '$lib/components/BadgeGroupMember.svelte';

  const NAME_TO_ICON: Record<string, typeof SvelteComponent> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    twitter: IconTwitter,
    matrix: IconMatrix,
    linkedin: IconLinkedin,
    discord: IconDiscord,
    snapchat: IconSnapchat
  };

  export let data: PageData;

  function schoolYearStart(): Date {
    const now = new Date();
    const thisYearSeptemberFirst = new Date(now.getFullYear(), 9, 1);
    if (now > thisYearSeptemberFirst) {
      return thisYearSeptemberFirst;
    }
    return new Date(now.getFullYear() - 1, 9, 1);
  }

  $: ({ user } = data);
  $: roleBadge = user.groups.some(({ president }) => president)
    ? '👑'
    : user.groups.some(({ treasurer }) => treasurer)
    ? '💰'
    : user.groups.some(({ vicePresident }) => vicePresident)
    ? '🌟'
    : user.groups.some(({ secretary }) => secretary)
    ? '📜'
    : '';

  const formatPhoneNumber = (phone: string) =>
    phone.replace(/^\+33(\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, '0$1 $2 $3 $4 $5');
</script>

{#if roleBadge}
  <div class="role-badge">
    {roleBadge}
  </div>
{/if}

<header>
  <img
    src={user.pictureFile ? `${PUBLIC_STORAGE_URL}${user.pictureFile}` : ''}
    alt="{user.firstName} {user.lastName}"
    class="picture"
  />

  <div class="identity">
    <h1>{user.firstName} {user.lastName}</h1>
    <p class="major">
      {schoolYearStart().getFullYear() - user.graduationYear + 2}A ({user.graduationYear}) · {user
        .major.name} · {user.major.schools.map(({ name }) => name).join(', ')}
    </p>
    <ul class="social-links">
      {#each user.links as { name, value }}
        <li>
          <a href={value} title={name}>
            <svelte:component this={NAME_TO_ICON?.[name] ?? IconWebsite} />
          </a>
        </li>
      {/each}
    </ul>
    <p class="bio">{user.description}</p>
  </div>

  {#if $me?.uid === user.uid || $me?.admin || $me?.canEditUsers}
    <a class="edit" href="./edit"><IconGear /></a>
  {/if}
</header>

<section class="info">
  <dl>
    {#if user.nickname}
      <dt>Surnom</dt>
      <dd>{user.nickname}</dd>
    {/if}
    <dt>Email</dt>
    <dd>{user.email}</dd>
    {#if user.birthday}
      <dt>Téléphone</dt>
      <dd>{user.phone}</dd>
    {/if}
    {#if user.birthday}
      <dt>Anniversaire</dt>
      <dd>{dateFormatter.format(user.birthday)}</dd>
    {/if}
    {#if user.address}
      <dt>Adresse</dt>
      <dd>{user.address}</dd>
    {/if}
    <dt>Identifiant</dt>
    <dd>{user.uid}</dd>
  </dl>
</section>

<section class="groups">
  <h2>Groupes</h2>

  <ul>
    {#each user.groups as member}
      <li>
        <BadgeGroupMember groupMember={member} />
      </li>
    {/each}
  </ul>
</section>

<section class="family">
  <h2>Famille</h2>

  TODO
</section>
