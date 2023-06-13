<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
  let { author, title, bodyHtml, group } = data.article;

  let memberTitle = data.article.author?.groups.find(
    (g) => g.group.uid === data.article.group.uid
  )?.title;
</script>

<h1>{title}</h1>

{@html bodyHtml}

{#if author}
  <section class="author">
    De <a href="/user/{author.uid}">{author.firstName} {author.lastName}</a>
    {#if memberTitle}, {memberTitle} de {group.name}{/if}
  </section>
{/if}
