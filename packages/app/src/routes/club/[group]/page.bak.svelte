<script lang="ts">
  import Alert from '$lib/components/Alert.svelte';
  import SchoolBadge from '$lib/components/BadgeSchool.svelte';
  import Breadcrumb from '$lib/components/Breadcrumb.svelte';
  import Breadcrumbs from '$lib/components/Breadcrumbs.svelte';
  import SocialLink from '$lib/components/SocialLink.svelte';
  import { me } from '$lib/session.js';
  import IconPlus from '~icons/mdi/plus';
  import IconEdit from '~icons/mdi/pencil';
  import type { PageData } from './$types';
  import { byMemberGroupTitleImportance } from '$lib/sorting';
  import Button from '$lib/components/Button.svelte';
  import { Visibility, zeus } from '$lib/zeus';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import ArticleCard from '$lib/components/CardArticle.svelte';
  import { isPast } from 'date-fns';

  export let data: PageData;

  $: ({ group } = data);

  const isOnClubBoard = (user: { uid: string }) =>
    Object.entries(group.members.find((m) => m.member.uid === user.uid) ?? {}).some(
      ([role, hasRole]) =>
        ['president', 'vicePresident', 'treasurer', 'secretary'].includes(role) && hasRole
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

<div class="user-picture">
  <img
    src={group.pictureFile
      ? `${PUBLIC_STORAGE_URL}${group.pictureFile}`
      : 'https://via.placeholder.com/160'}
    alt={group.name}
  />
</div>
<p class="muted text-sm mb-0">
  {#if group.ancestors && group.ancestors.length > 1}
    <Breadcrumbs>
      {#each [...group.ancestors].reverse() as { uid, name }}
        <Breadcrumb><a href="/club/{uid}/">{name}</a></Breadcrumb>
      {/each}
    </Breadcrumbs>
  {/if}
</p>
<h1 class="mt-1">
  {group.name}
  {#if group.school}<SchoolBadge schools={[group.school]} />{/if}
  {#if $me?.canEditGroups || ($me && isOnClubBoard($me))}
    <a href="edit/" title="Éditer">
      <IconEdit aria-label="Éditer" />
    </a>
  {/if}
</h1>
<div>{group.description}</div>
{#if group.links.length > 0}
  <div class="flex flex-wrap my-4 gap-3">
    {#each data.group.links as link}
      <SocialLink {...link} />
    {/each}
  </div>
{/if}

<h2>À propos</h2>
{@html group.longDescriptionHtml}

{#if group.members}
  <h2>Membres</h2>
  {#if group.members.length > 0}
    <table>
      {#each group.members.sort(byMemberGroupTitleImportance) as { member, president, treasurer, title } (member.uid)}
        <tr>
          <td>{president ? '👑' : ''}{treasurer ? '💰' : ''}</td>
          <td>
            <a href="/user/{member.uid}/">
              {member.firstName}
              {member.lastName}
            </a>
          </td>
          <td>{title}</td>
        </tr>
      {/each}
    </table>
  {:else}
    <Alert theme="warning">
      {#if $me}
        <p>Le groupe ne contient aucun membre, il vient peut-être d'être créé.</p>
      {:else}
        <p>
          <a href="/login?{new URLSearchParams({ to: window.location.pathname }).toString()}"
            >Connectez-vous</a
          > pour consulter les membres des clubs
        </p>
      {/if}
    </Alert>
  {/if}
  {#if group.selfJoinable && $me && !$me.groups.some(({ group }) => group.uid === data.group.uid)}
    <p>
      <Button on:click={async () => joinGroup(group.uid)}>Rejoindre le groupe</Button>
    </p>
  {/if}
  {#if $me?.canEditGroups || $me?.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === data.group.uid)}
    <p>
      <a href="./members/">Modifier la liste des membres</a>
    </p>
  {/if}
{/if}

<h2>
  Évènements
  {#if $me?.canEditGroups || $me?.groups.some(({ group, canEditArticles }) => group.uid === data.group.uid && canEditArticles)}
    <a href="./event/create/" title="Créer un événement">
      <IconPlus aria-label="Créer un événement" />
    </a>
  {/if}
</h2>

{#each group.events
  .sort((a, b) => (a?.startsAt.valueOf() ?? 0) - (b.startsAt?.valueOf() ?? 0))
  .reverse() as { uid, visibility, title, startsAt, pictureFile, links, descriptionHtml } (uid)}
  <!-- Events can be seen if you are admin, a manager of the event, someone that can edit articles on this group or if the event is either public or restricted (and you're a member of the group) -->
  {#if $me?.admin || $me?.groups.some(({ group, canEditArticles }) => group.uid === uid && canEditArticles) || $me?.managedEvents.some(({ event }) => event.uid === uid) || visibility === 'Public' || (visibility === 'Restricted' && $me?.groups.some(({ group }) => group.uid === data.group.uid))}
    <ArticleCard
      {group}
      {visibility}
      href="./event/{uid}"
      publishedAt={startsAt}
      {title}
      author={undefined}
      img={pictureFile ? { src: `${PUBLIC_STORAGE_URL}${pictureFile}` } : undefined}
      {links}
      bodyHtml={descriptionHtml}
    />
  {/if}
{/each}

<h2>
  Articles
  {#if $me?.canEditGroups || $me?.groups.some(({ group, canEditArticles }) => group.uid === data.group.uid && canEditArticles)}
    <a href="./write/" title="Écrire un article">
      <IconPlus aria-label="Écrire un article" />
    </a>
  {/if}
</h2>

{#each group.articles.sort((a, b) => (a.publishedAt?.valueOf() ?? 0) - (b.publishedAt?.valueOf() ?? 0)) as { uid, title, bodyHtml, pictureFile, author, publishedAt, visibility } (uid)}
  <!-- To see an article, ether you are an admin, or you can edit articles in the group, or you wrote it, or it's published AND it's either Public or it's Restricted but you're a member of the group  -->
  {#if $me?.admin || $me?.groups.some(({ group, canEditArticles }) => canEditArticles && group.uid === uid) || (author && $me?.uid === author.uid) || (publishedAt && isPast(new Date(publishedAt)) && (visibility === Visibility.Public || (visibility === Visibility.Restricted && $me?.groups.some(({ group }) => group.uid === uid))))}
    <ArticleCard
      href="/club/{group.uid}/post/{uid}/"
      {title}
      {visibility}
      {group}
      {author}
      {publishedAt}
      img={pictureFile ? { src: `${PUBLIC_STORAGE_URL}${pictureFile}` } : undefined}
      {bodyHtml}
    />
  {/if}
{/each}
