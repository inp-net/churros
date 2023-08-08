<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import IconGear from '~icons/mdi/gear-outline';
  import IconAdmin from '~icons/mdi/security';
  import IconWebsite from '~icons/mdi/earth';
  import { dateFormatter, yearTier } from '$lib/dates.js';
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
  import TreePersons from '$lib/components/TreePersons.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';

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

  type Nesting = [string, Nesting[]];
  $: familyNesting = JSON.parse(data.user.familyTree.nesting) as Nesting;
  type UserTree = typeof data.user.familyTree.users[number] & { children: UserTree[] };
  function makeFamilyTree(nesting: Nesting): UserTree {
    const findUser = (uid: string) => data.user.familyTree.users.find((u) => u.uid === uid);

    const [rootUid, children] = nesting;
    return {
      ...findUser(rootUid)!,
      children: children.map((child) =>
        typeof child === 'string' ? { ...findUser(child)!, children: [] } : makeFamilyTree(child)
      ),
    };
  }

  $: familyTree = makeFamilyTree(familyNesting);

  $: ({ user } = data);

  function rolesBadge({
    president,
    treasurer,
    vicePresident,
    secretary,
  }: {
    president: boolean;
    treasurer: boolean;
    vicePresident: boolean;
    secretary: boolean;
  }): string {
    return president ? '👑' : treasurer ? '💰' : vicePresident ? '🌟' : secretary ? '📜' : '';
  }

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

  $: pictureFile = user.pictureFile ? `${PUBLIC_STORAGE_URL}${user.pictureFile}` : '';
</script>

<div class="content">
  <header>
    <div class="picture">
      {#if roleBadge}
        <div class="role-badge">
          {roleBadge}
        </div>
      {/if}

      <img src={pictureFile} alt={user.fullName} />
    </div>

    <div class="identity">
      <h1>
        {user.firstName}
        {user.lastName}
        {#if user.admin}<Badge title="Possède tout les droits" theme="info"
            ><IconAdmin /> ADMIN</Badge
          >
        {/if}

        <ButtonShare />
        {#if $me?.uid === user.uid || $me?.admin || $me?.canEditUsers}
          <ButtonGhost href="./edit"><IconGear /></ButtonGhost>
        {/if}
      </h1>
      <p class="major">
        {yearTier(user.graduationYear)}A ({user.graduationYear}) ·
        <abbr title={user.major.name}>{user.major.shortName}</abbr>
        · {user.major.schools.map(({ name }) => name).join(', ')}
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
      <div class="info">
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
      </div>
    </div>
  </header>

  <section class="groups">
    <h2>Groupes</h2>

    <CarouselGroups
      groups={user.groups.map(({ group, title, ...roles }) => ({
        ...group,

        role: `${rolesBadge(roles)} ${title}`,
      }))}
    />
  </section>

  {#if data.user.familyTree.users.length >= 2}
    <section class="family">
      <h2>Famille</h2>

      <div class="tree">
        <TreePersons user={familyTree} highlightUid={user.uid} />
      </div>
    </section>
  {/if}

  <section class="articles">
    <h2>Posts</h2>

    <ul class="nobullet">
      {#each data.user.articles.edges.map(({ node }) => node) as article}
        <li>
          <CardArticle href="/club/{article.group.uid}/post/{article.uid}" {...article} />
        </li>
      {:else}
        <li>Aucun article</li>
      {/each}
    </ul>
  </section>
</div>

<style>
  section {
    margin-bottom: 5rem;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  h1 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
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

  .info {
    display: flex;
    flex-flow: column wrap;
  }

  dl {
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }

  @media (max-width: 600px) {
    dl {
      grid-template-columns: 1fr;
    }

    dd {
      margin-bottom: 1rem;
    }
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

  .content {
    margin: 0 1rem;
  }

  .groups {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
  }

  .family {
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    justify-content: center;
    overflow: auto;
  }

  .articles {
    max-width: 600px;
    margin: 0 auto;
  }

  @media (min-width: 1000px) {
    .content {
      display: grid;
      grid-template-areas: 'header header' 'groups groups' 'family articles';
      grid-template-columns: 50% 50%;
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      grid-area: header;
    }

    section.groups {
      grid-area: groups;
    }

    section.family {
      grid-area: family;
    }

    section.articles {
      grid-area: articles;
    }
  }
</style>
