<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import AvatarPerson from '$lib/components/AvatarPerson.svelte';
  import IconBack from '~icons/mdi/arrow-left';
  import IconGear from '~icons/mdi/gear';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { dateTimeFormatter } from '$lib/dates';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import ButtonBack from '$lib/components/ButtonBack.svelte';

  export let data: PageData;
  const { author, publishedAt, links, title, bodyHtml, group, pictureFile, event } = data.article;

  const memberTitle = data.article.author?.groups.find(
    (g) => g.group.uid === data.article.group.uid
  )?.title;
</script>

{#if pictureFile}
  <img src="{PUBLIC_STORAGE_URL}{pictureFile}" alt="" />
{/if}

<div class="content">
  <header>
    <h1>
      <ButtonBack />
      {title}
      {#if $me?.admin || $me?.groups.some(({ group: { uid }, canEditArticles }) => uid === group.uid && canEditArticles)}
        <a class="edit" href="./edit"> <IconGear /> </a>
      {/if}
    </h1>
    <p class="published-at">
      Publié le {dateTimeFormatter.format(publishedAt)} par
      <a href="/club/{group.uid}">{group.name}</a>
    </p>
  </header>

  <section class="body">{@html bodyHtml}</section>

  {#if links.length > 0}
    <ul class="links nobullet">
      {#each links as link}
        <li>
          <ButtonSecondary href={link.value}>{link.name}</ButtonSecondary>
        </li>
      {/each}
    </ul>
  {/if}

  {#if event}
    <section class="event">
      <a href="/club/{group.uid}/event/{event.uid}">Voir l'évènement «{event.title}» </a>
    </section>
  {/if}

  {#if author}
    <section class="author">
      <AvatarPerson
        {...author}
        href="/user/{author.uid}"
        role={author.groups.find((g) => g.group.uid === group.uid)?.title ?? ''}
      />
    </section>
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-flow: column wrap;
    gap: 2rem;
  }

  h1 {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  h1 .edit {
    margin-left: auto;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
</style>
