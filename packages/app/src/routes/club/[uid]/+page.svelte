<script lang="ts">
  import { page } from '$app/stores';
  import Alert from '$lib/components/alerts/Alert.svelte';
  import SchoolBadge from '$lib/components/badges/SchoolBadge.svelte';
  import Card from '$lib/components/cards/Card.svelte';
  import SocialLink from '$lib/components/links/SocialLink.svelte';
  import { me } from '$lib/session.js';
  import MajesticonsPlus from '~icons/majesticons/plus';
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({ group } = data);
</script>

<div class="top">
  <img src="https://picsum.photos/1000/1000" alt="" />
  <Card>
    <h1>{group.name} <SchoolBadge schools={[group.school]} /></h1>
    <div>{group.description}</div>
    {#if group.linkCollection.links.length > 0}
      <div class="flex flex-wrap my-4 gap-3">
        {#each data.group.linkCollection.links as link}
          <SocialLink {...link} />
        {/each}
      </div>
    {/if}
  </Card>
</div>

<Card>
  <h2>À propos</h2>
  {@html group.longDescriptionHtml}
</Card>

{#if group.members}
  <h2>Membres</h2>
  {#if group.members.length > 0}
    <table>
      {#each group.members as { member, president, treasurer, title }}
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
      <p>Le groupe ne contient aucun membre, il vient peut-être d'être créé.</p>
    </Alert>
  {/if}
  {#if $me?.canEditGroups || $me?.groups.some(({ group, canEditMembers }) => canEditMembers && group.uid === data.group.uid)}
    <p>
      <a href="./members/">Modifier la liste des membres</a>
    </p>
  {/if}
{/if}

<h2>
  Articles
  {#if $me?.canEditGroups || $me?.groups.some(({ group, canEditArticles }) => group.uid === data.group.uid && canEditArticles)}
    <a href="./write/" title="Écrire un article">
      <MajesticonsPlus aria-label="Écrire un article" />
    </a>
  {/if}
</h2>

{#each group.articles as { slug, title, bodyHtml }}
  <Card element="article">
    <h3><a href="./post/{slug}">{title}</a></h3>
    {@html bodyHtml}
  </Card>
{/each}

<style lang="scss">
  .top {
    display: grid;
    gap: 1rem;
    align-items: center;
    justify-content: stretch;
    margin-block: 1rem;

    img {
      justify-self: center;
      max-height: 15rem;
    }

    > :global(*) {
      margin: 0;
    }

    @media (min-width: $breakpoint-mobile) {
      grid-template-columns: 1fr 2fr;
    }
  }
</style>
