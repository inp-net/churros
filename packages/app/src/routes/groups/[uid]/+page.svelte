<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import IconAdd from '~icons/mdi/plus';
  import IconPeople from '~icons/mdi/account-group';
  import IconGear from '~icons/mdi/gear-outline';
  import IconJoinGroup from '~icons/mdi/account-plus';
  import { me } from '$lib/session.js';
  import type { PageData } from './$types';
  import { zeus } from '$lib/zeus';
  import { env } from '$env/dynamic/public';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import IconFacebook from '~icons/mdi/facebook-box';
  import type { SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconAnilist from '~icons/simple-icons/anilist';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconGithub from '~icons/mdi/github';
  import IconHackernews from '~icons/mdi/hackernews';
  import IconDiscord from '~icons/mdi/discord';
  import IconWebsite from '~icons/mdi/earth';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import TreeGroups from '$lib/components/TreeGroups.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Badge from '$lib/components/Badge.svelte';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import { isDark } from '$lib/theme';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import { roleEmojis } from '$lib/permissions';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import { tooltip } from '$lib/tooltip';

  const NAME_TO_ICON: Record<string, typeof SvelteComponent<any>> = {
    facebook: IconFacebook,
    instagram: IconInstagram,
    discord: IconDiscord,
    twitter: IconTwitter,
    linkedin: IconLinkedin,
    github: IconGithub,
    hackernews: IconHackernews,
    anilist: IconAnilist,
  };

  const DISPLAY_SOCIAL_NETWORK: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    hackernews: 'Hacker News',
    anilist: 'AniList',
    discord: 'Discord',
  };

  export let data: PageData;

  $: clubBoard = group.members?.filter(
    ({ president, vicePresident, treasurer, secretary }) =>
      president || vicePresident || treasurer || secretary
  );

  $: onClubBoard = Boolean(clubBoard?.some(({ member }) => member.uid === $me?.uid));

  $: myPermissions = $me ? $me.groups.find(({ group: { uid } }) => uid === group.uid) : undefined;

  $: ({ group } = data);

  $: canEditDetails = Boolean(
    $me?.admin || clubBoard?.some(({ member }) => member.uid === $me?.uid) || $me?.canEditGroups
  );
  $: canEditArticles = Boolean($me?.admin || myPermissions?.canEditArticles || onClubBoard);
  $: canEditEvents = canEditArticles;
  $: canEditMembers = Boolean(
    $me?.admin ||
      myPermissions?.canEditMembers ||
      onClubBoard ||
      $me?.canEditGroups ||
      $me?.canEditUsers
  );

  const joinGroup = async (groupUid: string) => {
    if (!$me) return goto(`/login?${new URLSearchParams({ to: $page.url.pathname }).toString()}`);
    try {
      await $zeus.mutate({
        selfJoinGroup: [{ groupUid, uid: $me.uid }, { groupId: true }],
      });
      window.location.reload();
    } catch (error: unknown) {
      console.error(error);
    }
  };
</script>

<div class="content">
  <header>
    <div class="picture">
      <img
        src="{env.PUBLIC_STORAGE_URL}{$isDark && group.pictureFileDark
          ? group.pictureFileDark
          : group.pictureFile}"
        alt={group.name}
      />
    </div>

    <div class="identity">
      <h1>
        {group.name}

        <ButtonShare />
        {#if canEditDetails}
          <ButtonGhost help="Modifier les infos" href="./edit"><IconGear /></ButtonGhost>
        {/if}

        {#if group.members?.find(({ member: { uid } }) => uid === $me?.uid)}
          <Badge theme="success">Membre</Badge>
        {:else if group.selfJoinable}
          <ButtonSecondary icon={IconJoinGroup} on:click={async () => joinGroup(group.uid)}
            >Rejoindre</ButtonSecondary
          >
        {/if}
      </h1>

      <p>
        {DISPLAY_GROUP_TYPES[group.type]}
        {#if group.school}· {group.school?.name}{/if}
      </p>

      <dl>
        {#if group.address}
          <dt>Salle</dt>
          <dd>{group.address}</dd>
        {/if}
        {#if group.email}
          <dt>Email</dt>
          <dd><a href="mailto:{group.email}">{group.email}</a></dd>
        {/if}
      </dl>

      <ul class="social-links nobullet">
        {#each group.links.filter(({ value }) => Boolean(value)) as { name, value }}
          <li>
            <a href={value} use:tooltip={DISPLAY_SOCIAL_NETWORK[name]}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <section class="description">
    {#if group.longDescriptionHtml.trim().length}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html group.longDescriptionHtml}
    {:else}
      {group.description}
    {/if}
  </section>

  <section class="board">
    <h2>
      Bureau {#if canEditMembers}
        <ButtonSecondary href="./edit/members" icon={IconGear}>Gérer</ButtonSecondary>{/if}
    </h2>

    {#if clubBoard}
      <ul class="nobullet">
        {#each clubBoard.sort(byMemberGroupTitleImportance) as { member, title, ...permissions } (member.uid)}
          <li>
            <span class="emojis">{roleEmojis(permissions)}</span>
            <AvatarPerson role={title} {...member} href="/users/{member.uid}" />
          </li>
        {/each}
      </ul>

      <div class="more">
        <ButtonInk icon={IconPeople} href="./members">Voir tous les membres</ButtonInk>
      </div>
    {:else if !$me}
      <Alert theme="warning"
        >Connectez-vous pour voir les membres du groupe <ButtonSecondary
          insideProse
          href="/login?{new URLSearchParams({ to: $page.url.pathname }).toString()}"
          >Se connecter</ButtonSecondary
        >
      </Alert>
    {/if}
  </section>

  {#if group.root && (group.root.children.length ?? 0) > 0}
    <section class="subgroups">
      <h2>Sous-groupes</h2>

      <TreeGroups highlightUid={group.uid} group={group.root} />
    </section>
  {/if}

  <section class="posts">
    <h2>
      Posts {#if canEditArticles}<ButtonSecondary href="/posts/{group.uid}/create/" icon={IconAdd}
          >Nouveau</ButtonSecondary
        >{/if}
    </h2>

    <ul class="nobullet">
      {#each group.articles.slice(0, 3) as { uid, ...article } (uid)}
        <CardArticle hideGroup {group} href="/posts/{group.uid}/{uid}" {...article} />
      {/each}
    </ul>
  </section>

  <section class="events">
    <h2>
      Évènements {#if canEditEvents}
        <ButtonSecondary href="/events/{group.uid}/create/" icon={IconAdd}>Nouveau</ButtonSecondary>
      {/if}
    </h2>

    <ul class="nobullet">
      {#each group.events.slice(0, 3) as { uid, ...event } (uid)}
        <!-- TODO CardEvent -->
        <CardArticle
          hideGroup
          {group}
          href="/events/{group.uid}/{uid}"
          {...event}
          publishedAt={event.startsAt}
          bodyHtml={event.descriptionHtml}
        />
      {/each}
    </ul>
  </section>

  {#if group.related?.length > 0}
    <section class="related">
      <h2>Voir aussi</h2>

      <CarouselGroups groups={group.related} />
    </section>
  {/if}
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
    padding: 0 1rem;
    margin: 0 auto;
  }

  section {
    max-width: min(100%, 600px);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
  }

  header .picture img {
    --size: 7rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    object-fit: contain;
  }

  header dt {
    font-weight: bold;
  }

  header dl {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }

  header dd {
    margin-left: 0;
  }

  header .social-links {
    display: flex;
    gap: 0.5rem;
    font-size: 1.25em;
  }

  section h2 {
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .board ul {
    display: flex;
    flex-flow: column wrap;
    gap: 0.25rem;
  }

  .board li {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .board li .emojis {
    font-size: 1.2em;
  }

  .board .more {
    display: flex;
    margin-top: 1rem;
  }

  @media (min-width: 1000px) {
    section h2 {
      justify-content: start;
      text-align: left;
    }

    section {
      margin: 0;
    }

    .content {
      display: grid;
      grid-template-areas: 'header header' 'description posts' 'board posts' 'subgroups events' 'related events';
      grid-template-columns: 50% 50%;
      column-gap: 5rem;
      justify-content: start;
      max-width: 1200px;
      margin: 0 auto;
    }

    header {
      grid-area: header;
    }

    section.description {
      grid-area: description;
      justify-content: start;

      :global(p) {
        text-align: left;
      }
    }

    section.posts {
      grid-area: posts;
    }

    section.board {
      grid-area: board;

      ul {
        justify-content: start;
      }
    }

    section.related {
      grid-area: related;
    }

    section.events {
      grid-area: events;
    }

    section.subgroups {
      grid-area: subgroups;
    }
  }
</style>
