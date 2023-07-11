<script lang="ts">
  import * as htmlToText from 'html-to-text';
  import Alert from '$lib/components/Alert.svelte';
  import SchoolBadge from '$lib/components/BadgeSchool.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import IconPeople from '~icons/mdi/account-group';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import Card from '$lib/components/Card.svelte';
  import IconGear from '~icons/mdi/gear';
  import SocialLink from '$lib/components/SocialLink.svelte';
  import { me } from '$lib/session.js';
  import IconPlus from '~icons/mdi/plus';
  import IconEdit from '~icons/mdi/pencil';
  import type { PageData } from './$types';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import Button from '$lib/components/Button.svelte';
  import { Visibility, zeus } from '$lib/zeus';
  import PictureUser from '$lib/components/PictureUser.svelte';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import ArticleCard from '$lib/components/CardArticle.svelte';
  import { isPast } from 'date-fns';
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

  $: ({ group } = data);

  const isOnClubBoard = (user: { uid: string }) =>
    Object.entries(group.members.find((m) => m.member.uid === user.uid) ?? {}).some(
      ([role, hasRole]) =>
        ['president', 'vicePresident', 'treasurer', 'secretary'].includes(role) && hasRole
    );

  $: clubBoard = group.members?.filter(
    ({ president, vicePresident, treasurer, secretary }) =>
      president || vicePresident || treasurer || secretary
  );

  const joinGroup = async (groupUid: string) => {
    if (!$me) return;
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
      <img src="{PUBLIC_STORAGE_URL}{group.pictureFile}" alt={group.name} />
    </div>

    <div class="identity">
      <h1>{group.name}</h1>

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
        {#each group.links as { name, value }}
          <li>
            <a href={value} title={name}>
              <svelte:component this={NAME_TO_ICON?.[name.toLowerCase()] ?? IconWebsite} />
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <a href="./edit" class="edit"> <IconGear /> </a>
  </header>

  <section class="description">
    {@html group.longDescriptionHtml}
    <!-- TODO read more button -->
  </section>

  <section class="bureau">
    <h2>Bureau</h2>

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

  {#if group.root?.children.length > 0}
    <section class="subgroups">
      <h2>Sous-groupes</h2>

      <TreeGroups highlightUid={group.uid} group={group.root} />
    </section>
  {/if}

  <section class="posts">
    <h2>Posts</h2>

    <ul class="nobullet">
      {#each group.articles as { uid, bodyHtml, ...article } (uid)}
        <CardArticle hideGroup {group} href="./post/{uid}" {...article}>
          {@html bodyHtml}
        </CardArticle>
      {/each}
    </ul>
  </section>
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  header {
    display: flex;
    gap: 1rem;
  }

  header .picture img {
    --size: 10rem;

    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    color: var(--muted-text);
    text-align: center;
    background: var(--muted-bg);
    object-fit: cover;
  }

  header dt {
    font-weight: bold;
  }

  header dl {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }

  header .social-links {
    display: flex;
    gap: 0.5rem;
    font-size: 1.25em;
  }

  .edit {
    margin-left: auto;
    font-size: 1.5em;
  }

  section h2 {
    margin-bottom: 1rem;
    text-align: center;
  }

  .bureau ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  .bureau .more {
    display: flex;
    justify-content: center;
  }
</style>
