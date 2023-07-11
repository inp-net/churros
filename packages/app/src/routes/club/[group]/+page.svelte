<script lang="ts">
  import * as htmlToText from 'html-to-text';
  import Alert from '$lib/components/Alert.svelte';
  import SchoolBadge from '$lib/components/BadgeSchool.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
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

  $: ({ group } = data);

  const isOnClubBoard = (user: { uid: string }) =>
    Object.entries(group.members.find((m) => m.member.uid === user.uid) ?? {}).some(
      ([role, hasRole]) =>
        ['president', 'vicePresident', 'treasurer', 'secretary'].includes(role) && hasRole
    );

  $: clubBoard = group.members.filter(
    ({ president, vicePresident, treasurer, secretary }) =>
      president || vicePresident || treasurer || secretary
  );

  const joinGroup = async (groupUid: string) => {
    if (!$me) return;
    try {
      await $zeus.mutate({
        selfJoinGroup: [{ groupUid, uid: $me.uid }, { groupId: true }]
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

      <p>{DISPLAY_GROUP_TYPES[group.type]} · {group.school?.name}</p>

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

    <a href="../edit" class="ed"> <IconGear /> </a>
  </header>

  <section class="description">
    {@html group.longDescriptionHtml}
    <!-- TODO read more button -->
  </section>

  <section class="bureau">
    <h2>Bureau</h2>

    {#each clubBoard as { member, title, ...permissions } (member.uid)}
      <AvatarPerson role={title} {...member} href="/user/{member.uid}" />
    {/each}

    <!-- TODO button ink see all -->
  </section>

  <!-- TODO posts -->
</div>

<style>
  header dt {
    font-weight: bold;
  }

  header dl {
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 0.5rem;
  }
</style>
