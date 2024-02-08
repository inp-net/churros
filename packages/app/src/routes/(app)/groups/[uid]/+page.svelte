<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Alert from '$lib/components/Alert.svelte';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import Badge from '$lib/components/Badge.svelte';
  import ButtonGhost from '$lib/components/ButtonGhost.svelte';
  import ButtonInk from '$lib/components/ButtonInk.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import ButtonShare from '$lib/components/ButtonShare.svelte';
  import CardArticle from '$lib/components/CardArticle.svelte';
  import CardFeedEvent from '$lib/components/CardFeedEvent.svelte';
  import CarouselGroups from '$lib/components/CarouselGroups.svelte';
  import InputToggle from '$lib/components/InputToggle.svelte';
  import Modal from '$lib/components/Modal.svelte';
  import TreeGroups from '$lib/components/TreeGroups.svelte';
  import { DISPLAY_GROUP_TYPES } from '$lib/display';
  import { groupLogoSrc } from '$lib/logos';
  import { isOnClubBoard, roleEmojis } from '$lib/permissions';
  import { me } from '$lib/session.js';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import { isDark } from '$lib/theme';
  import { toasts } from '$lib/toasts';
  import { tooltip } from '$lib/tooltip';
  import { zeus } from '$lib/zeus';
  import { onMount, type SvelteComponent } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { queryParam } from 'sveltekit-search-params';
  import IconQuitGroup from '~icons/mdi/account-cancel-outline';
  import IconPeople from '~icons/mdi/account-group';
  import IconJoinGroup from '~icons/mdi/account-plus';
  import IconCheck from '~icons/mdi/check';
  import IconDiscord from '~icons/mdi/discord';
  import IconWebsite from '~icons/mdi/earth';
  import IconFacebook from '~icons/mdi/facebook-box';
  import IconGear from '~icons/mdi/gear-outline';
  import IconGithub from '~icons/mdi/github';
  import IconHackernews from '~icons/mdi/hackernews';
  import IconInstagram from '~icons/mdi/instagram';
  import IconLinkedin from '~icons/mdi/linkedin';
  import IconAdd from '~icons/mdi/plus';
  import IconTwitter from '~icons/mdi/twitter';
  import IconAnilist from '~icons/simple-icons/anilist';
  import type { PageData } from './$types';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  let confirmingGroupQuit = false;
  const promptJoinGroup = queryParam<boolean>('join', {
    decode: (v) => v !== null,
    encode: (v) => (v ? '' : undefined),
  }) as Writable<boolean>;

  onMount(() => {
    if (browser && $promptJoinGroup) {
      if (group?.members?.find(({ member }) => member.uid === $me?.uid)) {
        toasts.success(`Tu es déjà membre de ${group.name}`);
        $promptJoinGroup = false;
      } else if (group.selfJoinable) {
        joinModal.showModal();
      } else {
        toasts.warn(`${group.name} n'est pas en inscription libre`);
        $promptJoinGroup = false;
      }
    }
  });

  $: clubBoard = group.members?.filter((m) => isOnClubBoard(m));
  $: meOnClubBoard = Boolean(clubBoard?.some(({ member }) => member.uid === $me?.uid));

  $: myPermissions = $me?.groups?.find(({ group: { uid } }) => uid === group.uid);

  $: ({ group } = data);

  $: canEditDetails = Boolean(
    $me?.admin || clubBoard?.some(({ member }) => member.uid === $me?.uid) || $me?.canEditGroups,
  );
  $: canEditArticles = Boolean($me?.admin || myPermissions?.canEditArticles || meOnClubBoard);
  $: canEditEvents = canEditArticles;
  $: canEditMembers = Boolean(
    $me?.admin ||
      myPermissions?.canEditMembers ||
      meOnClubBoard ||
      $me?.canEditGroups ||
      $me?.canEditUsers,
  );

  const joinGroup = async (groupUid: string) => {
    if (!$me) return goto(`/login?${new URLSearchParams({ to: $page.url.pathname }).toString()}`);
    try {
      await $zeus.mutate({
        selfJoinGroup: [{ groupUid, uid: $me.uid }, { groupId: true }],
      });
      window.location.reload();
    } catch (error: unknown) {
      toasts.error(`Impossible de rejoindre ${group.name}`, error?.toString());
    }
  };

  const quitGroup = async () => {
    if (!$me) return goto(`/login?${new URLSearchParams({ to: $page.url.pathname }).toString()}`);
    try {
      confirmingGroupQuit = false;
      await $zeus.mutate({
        deleteGroupMember: [{ groupId: data.group.id, memberId: $me.id }, true],
      });
      window.location.reload();
    } catch (error: unknown) {
      toasts.error(`Impossible de quitter ${group.name}`, error?.toString());
    }
  };

  const updateRoom = async () => {
    if (!$me) return goto(`/login?${new URLSearchParams({ to: $page.url.pathname }).toString()}`);
    try {
      data.group.roomIsOpen = !data.group.roomIsOpen;
      await $zeus.mutate({
        updateRoomOpenState: [{ groupUid: data.group.uid, openRoom: data.group.roomIsOpen }, true],
      });
      //window.location.reload();
    } catch (error: unknown) {
      data.group.roomIsOpen = !data.group.roomIsOpen;
      toasts.error(`Impossible d'ouvrir la salle ${group.address}`, error?.toString());
    }
  };

  let joinModal: HTMLDialogElement;
</script>

<Modal bind:element={joinModal}>
  <h1>Rejoindre {group.name}?</h1>
  <div class="modal-actions">
    <ButtonSecondary
      on:click={() => {
        joinModal.close();
        $promptJoinGroup = false;
      }}>Annuler</ButtonSecondary
    >
    <ButtonPrimary
      smaller
      on:click={() => {
        void joinGroup(group.uid);
        joinModal.close();
        $promptJoinGroup = false;
      }}>Rejoindre</ButtonPrimary
    >
  </div>
</Modal>

<div class="content">
  <header>
    <div class="picture">
      <img src={groupLogoSrc($isDark, group)} alt={group.name} />
    </div>

    <div class="identity">
      <h1>
        {group.name}
        <ButtonShare />
        {#if canEditDetails}
          <ButtonGhost help="Modifier les infos" href="./edit"><IconGear /></ButtonGhost>
        {/if}

        {#if group?.members?.find(({ member: { uid } }) => uid === $me?.uid)}
          <Badge theme="success">Membre</Badge>
          {#if confirmingGroupQuit}
            <p>Sur·e de toi?</p>
            <ButtonSecondary icon={IconCheck} on:click={async () => quitGroup()}
              >Oui</ButtonSecondary
            >
          {:else}
            <ButtonSecondary
              icon={IconQuitGroup}
              on:click={() => {
                confirmingGroupQuit = true;
              }}>Quitter</ButtonSecondary
            >
          {/if}
        {:else if group.selfJoinable}
          <ButtonSecondary icon={IconJoinGroup} on:click={async () => joinGroup(group.uid)}
            >Rejoindre</ButtonSecondary
          >
        {/if}
      </h1>

      <p>
        {DISPLAY_GROUP_TYPES[group.type]}
        {#if group.studentAssociation?.school}· <a
            href="/schools/{group.studentAssociation.school.uid}"
            >{group.studentAssociation.school.name}</a
          >{/if}
        {#if group.studentAssociation}· <a
            href="/student-associations/{group.studentAssociation?.uid}"
            >{group.studentAssociation?.name}</a
          >{/if}
      </p>

      <dl>
        {#if group.address}
          <dt>Salle</dt>
          <dd>
            {group.address}
            {#if $me && !$me.external}
              <!-- Pour éviter que les gens exté voient l'ouverture des salles. -->
              {#if $me?.canEditGroups || $me?.groups.some((g) => g.group.uid === group.uid)}
                <InputToggle
                  label={group.roomIsOpen ? 'Ouverte' : 'Fermée'}
                  value={group.roomIsOpen}
                  on:change={async () => updateRoom()}
                ></InputToggle>
              {:else}
                <Badge inline theme={group.roomIsOpen ? 'success' : 'danger'}>
                  {#if group.roomIsOpen}
                    Ouvert
                  {:else}
                    Fermé
                  {/if}
                </Badge>
              {/if}
            {/if}
          </dd>
        {/if}
        {#if group.website}
          <dt>Site web</dt>
          <dd><a href={group.website} target="_blank" rel="noopener">{group.website}</a></dd>
        {/if}
        {#if group.email}
          <dt>Email</dt>
          <dd><a href="mailto:{group.email}">{group.email}</a></dd>
        {/if}
      </dl>

      <ul class="social-links nobullet">
        {#each group?.links.filter(({ value }) => Boolean(value)) as { name, value }}
          <li>
            <a href={value} use:tooltip={DISPLAY_SOCIAL_NETWORK[name]}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </header>

  <section class="description" data-user-html>
    {#if group?.longDescriptionHtml.trim().length}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html group?.longDescriptionHtml}
    {:else}
      {group?.description}
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
    {:else if !clubBoard}
      <Alert theme="warning"
        >{#if $me?.external}
          Il faut être un élève pour voir les membres du groupe{:else}
          Connectez-vous pour voir les membres du groupe <ButtonSecondary
            insideProse
            href="/login?{new URLSearchParams({ to: $page.url.pathname }).toString()}"
            >Se connecter</ButtonSecondary
          >{/if}
      </Alert>
    {/if}
  </section>

  {#if (group.root && (group.root.children.length ?? 0) > 0) || meOnClubBoard}
    {@const hasSubgroups = (group.root?.children.length ?? 0) > 0}
    <section class="subgroups">
      <h2>
        Sous-groupes {#if hasSubgroups && meOnClubBoard}<ButtonSecondary
            icon={IconAdd}
            href="./subgroups/create">Créer</ButtonSecondary
          >{/if}
      </h2>

      {#if group.root && hasSubgroups}
        <TreeGroups highlightUid={group.uid} group={group.root} />
      {:else}
        <ButtonSecondary icon={IconAdd} href="./subgroups/create"
          >Créer un sous-groupe</ButtonSecondary
        >
      {/if}
    </section>
  {/if}

  <section class="posts">
    <h2>
      Posts {#if canEditArticles}<ButtonSecondary href="/posts/{group.uid}/create/" icon={IconAdd}
          >Nouveau</ButtonSecondary
        >{/if}
    </h2>

    <ul class="nobullet">
      {#each group.articles.slice(0, 3) as { uid, ...article } (article.id)}
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
      {#each group.events.edges.slice(0, 3) as { node } (node.id)}
        <CardFeedEvent
          likes={node.reactionCounts['❤️']}
          liked={node.myReactions['❤']}
          {...node}
          href="/events/{node.group.uid}/{node.uid}"
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

  .modal-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    justify-content: center;
    margin-top: 2rem;
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
    grid-column-start: 1;
    padding-top: 0.3em;
    font-weight: bold;
  }

  header dd {
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.8rem;
    align-items: center;
    margin-left: 0;
  }

  header dl {
    display: grid;
    grid-template-columns: auto 1fr 2fr;
    column-gap: 0.5rem;
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
