<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconGear from '~icons/mdi/gear';
  import IconWebsite from '~icons/mdi/earth';
  import { dateFormatter } from '$lib/dates.js';
  import { me } from '$lib/session.js';
  import type { PageData } from './$types';
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
    snapchat: IconSnapchat,
  };

  export let data: PageData;

  function schoolYearStart(): Date {
    const now = new Date();
    const thisYearSeptemberFirst = new Date(now.getFullYear(), 9, 1);
    if (now > thisYearSeptemberFirst) return thisYearSeptemberFirst;

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

<div class="content">
  <header>
    <div class="picture">
      {#if roleBadge}
        <div class="role-badge">
          {roleBadge}
        </div>
      {/if}

      <img
        src={user.pictureFile ? `${PUBLIC_STORAGE_URL}${user.pictureFile}` : ''}
        alt="{user.firstName} {user.lastName}"
      />
    </div>

    <div class="identity">
      <h1>{user.firstName} {user.lastName}</h1>
      <p class="major">
        {schoolYearStart().getFullYear() - user.graduationYear + 4}A ({user.graduationYear}) · {user
          .major.name} · {user.major.schools.map(({ name }) => name).join(', ')}
      </p>
      <ul class="social-links nobullet">
        {#each user.links as { name, value }}
          <li>
            <a href={value} title={name}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
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
      <dd>
        <a href="mailto:{user.email}">{user.email}</a>
      </dd>
      {#if user.phone}
        <dt>Téléphone</dt>
        <dd>
          <a href="tel:{user.phone}">{formatPhoneNumber(user.phone)}</a>
        </dd>
      {/if}
      {#if user.birthday}
        <dt>Anniversaire</dt>
        <dd>{dateFormatter.format(user.birthday)}</dd>
        <!-- TODO add to agenda -->
      {/if}
      {#if user.address}
        <dt>Adresse</dt>
        <dd>{user.address}</dd>
        <!-- TODO go here with gmaps? -->
      {/if}
      <dt>Identifiant</dt>
      <dd>{user.uid}</dd>
    </dl>
  </section>

  <section class="groups">
    <h2>Groupes</h2>

    <ul class="nobullet">
      {#each user.groups as member}
        <li>
          <BadgeGroupMember href="/club/{member.group.uid}" groupMember={member} />
        </li>
      {/each}
    </ul>
  </section>

  <section class="family">
    <h2>Famille</h2>

    TODO
  </section>

  <section class="articles">
    <h2>Posts</h2>

    TODO
  </section>
</div>

<style>
  section {
    margin-bottom: 5rem;
  }

  header {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .picture {
    --size: 7rem;

    position: relative;
    z-index: -1;
    flex-shrink: 0;
    width: var(--size);
    height: var(--size);
  }

  .picture img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    border-radius: 50%;
    object-fit: cover;
  }

  .picture .role-badge {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(var(--size) / 3);
    height: calc(var(--size) / 3);
    font-size: 1.25rem;
    background: var(--bg);
    border: var(--border-block) solid var(--border);
    border-radius: 50%;
  }

  .social-links {
    display: flex;
    gap: 0.5rem;
    font-size: 1.25em;
  }

  .identity {
    display: flex;
    flex-flow: column wrap;
    flex-grow: 1;
    gap: 0.5rem;
  }

  .edit {
    font-size: 1.5em;
  }

  .info {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
  }

  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }

  dt {
    font-weight: bold;
  }

  dd {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    margin-left: 0;
  }

  section h2 {
    margin-bottom: 2rem;
    text-align: center;
  }

  .groups ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .content {
    margin: 0 1rem;
  }
</style>
