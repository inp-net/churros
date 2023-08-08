<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import IconAdd from '~icons/mdi/plus';
  import IconPeople from '~icons/mdi/account-group';
  import IconGear from '~icons/mdi/gear-outline';
  import IconJoinGroup from '~icons/mdi/account-plus';
  import { me } from '$lib/session.js';
  import type { PageData } from './$types';
  import { zeus } from '$lib/zeus';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import IconFacebook from '~icons/mdi/facebook-box';
  import type { SvelteComponent } from 'svelte';
  import IconInstagram from '~icons/mdi/instagram';
  import IconTwitter from '~icons/mdi/twitter';
  import IconMatrix from '~icons/mdi/matrix';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconDiscord from '~icons/mdi/discord';
  import IconSnapchat from '~icons/mdi/snapchat';
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

  $: clubBoard = group.members?.filter(
    ({ president, vicePresident, treasurer, secretary }) =>
      president || vicePresident || treasurer || secretary
  );

  $: onClubBoard = Boolean(clubBoard?.some(({ member }) => member.uid === $me?.uid));

  $: myPermissions = $me?.groups.find(({ group: { uid } }) => uid === group.uid);

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
        src="{PUBLIC_STORAGE_URL}{$isDark && group.pictureFileDark
          ? group.pictureFileDark
          : group.pictureFile}"
        alt={group.name}
      />
    </div>

    <div class="identity">
      <h1>
        {group.name}

        {#if $me?.groups.find(({ group: { uid } }) => uid === group.uid)}
          <Badge theme="success">Membre</Badge>
        {:else if group.selfJoinable}
          <ButtonSecondary icon={IconJoinGroup} on:click={async () => joinGroup(group.uid)}
            >Rejoindre</ButtonSecondary
          >
        {/if}

        <ButtonShare />
        {#if canEditDetails}
          <ButtonSecondary icon={IconGear} href="./edit">Modifier</ButtonSecondary>
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
            <a href={value} title={name}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <section class="description">
    {@html group.longDescriptionHtml}
  </section>

  <section class="board">
    <h2>
      Bureau {#if canEditMembers}
        <ButtonSecondary href="./edit/members" icon={IconGear}>Gérer</ButtonSecondary>{/if}
    </h2>

    {#if clubBoard}
      <ul class="nobullet">
        {#each clubBoard as { member, title, ...permissions } (member.uid)}
          <li>
            <AvatarPerson role={title} {...member} href="/user/{member.uid}" />
          </li>
        {/each}
      </ul>

      <div class="more">
        <ButtonInk icon={IconPeople} href="./members">Voir tout les membres</ButtonInk>
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
      Posts {#if canEditArticles}<ButtonSecondary href="./write" icon={IconAdd}
          >Nouveau</ButtonSecondary
        >{/if}
    </h2>

    <ul class="nobullet">
      {#each group.articles.slice(0, 3) as { uid, ...article } (uid)}
        <CardArticle hideGroup {group} href="./post/{uid}" {...article} />
      {/each}
    </ul>
  </section>

  <section class="events">
    <h2>
      Évènements {#if canEditEvents}
        <ButtonSecondary href="./event/create" icon={IconAdd}>Nouveau</ButtonSecondary>
      {/if}
    </h2>

    <ul class="nobullet">
      {#each group.events.slice(0, 3) as { uid, ...event } (uid)}
        <!-- TODO CardEvent -->
        <CardArticle
          hideGroup
          {group}
          href="./event/{uid}"
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
    max-width: 600px;
    margin: 0 auto;
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
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    text-align: center;
  }

  .board ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .board .more {
    display: flex;
    justify-content: center;
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

      p {
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
