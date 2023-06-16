<script lang="ts">
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import { me } from '$lib/session';
  import type { PageData } from './$types';

  export let data: PageData;
  const { author, title, bodyHtml, group, pictureFile, event } = data.article;

  const memberTitle = data.article.author?.groups.find(
    (g) => g.group.uid === data.article.group.uid
  )?.title;
</script>

{#if pictureFile}
  <img src="{PUBLIC_STORAGE_URL}{pictureFile}" alt="" />
{/if}

{#if $me?.admin || $me?.groups.some(({ group: { uid }, canEditArticles }) => uid === group.uid && canEditArticles)}
  <a href="./edit">Éditer</a>
{/if}

<h1>{title}</h1>

{@html bodyHtml}

{#if event}
  <section class="event">
    <a href="/club/{group.uid}/event/{event.uid}">Voir l'évènement «{event.title}» </a>
  </section>
{/if}

{#if author}
  <section class="author">
    De <a href="/user/{author.uid}">{author.firstName} {author.lastName}</a>
    {#if memberTitle}, {memberTitle} de {group.name}{/if}
  </section>
{/if}
