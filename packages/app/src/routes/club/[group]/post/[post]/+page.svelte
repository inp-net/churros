<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
  const { author, title, bodyHtml, group, event } = data.article;

  const memberTitle = data.article.author?.groups.find(
    (g) => g.group.uid === data.article.group.uid
  )?.title;
</script>

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
