<script lang="ts">
  import ArticleCard from '$lib/components/cards/ArticleCard.svelte';
  import { formatDateTime } from '$lib/dates';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<h1>Bienvenue sur Centraverse</h1>

{#each data.homepage as { id, title, bodyHtml, publishedAt, group, author }}
  <ArticleCard
    {title}
    href="#"
    img={Number(id) % 5
      ? { src: `https://picsum.photos/seed/${id}/960/400`, alt: '', width: 960, height: 400 }
      : undefined}
  >
    <p>
      Par <a href="/club/{group.id}" sveltekit:prefetch>{group.name}</a> le {formatDateTime(
        publishedAt
      )}
    </p>
    {@html bodyHtml}
    {#if author}
      <p>
        <em>
          Auteur : <a href="/user/{author.id}" sveltekit:prefetch>
            {author.firstName}
            {author.lastName}
          </a>
        </em>
      </p>
    {/if}
  </ArticleCard>
{/each}

<style>
  h1 {
    text-align: center;
  }
</style>
