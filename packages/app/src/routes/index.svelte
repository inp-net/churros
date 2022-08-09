<script context="module" lang="ts">
  import ArticleCard from '$lib/components/cards/ArticleCard.svelte';
  import { formatDateTime } from '$lib/dates';
  import { query, Query, type PropsType } from '$lib/zeus';
  import type { Load } from './__types';

  const propsQuery = () =>
    Query({
      homepage: [
        {},
        {
          id: true,
          title: true,
          bodyHtml: true,
          publishedAt: true,
          club: { id: true, name: true },
          author: { id: true, firstname: true, lastname: true },
        },
      ],
    });

  type Props = PropsType<typeof propsQuery>;

  export const load: Load = async ({ fetch, session }) => ({
    props: await query(fetch, propsQuery(), session),
  });
</script>

<script lang="ts">
  export let homepage: Props['homepage'];
</script>

<h1>Bienvenue sur Centraverse</h1>

{#each homepage as { id, title, bodyHtml, publishedAt, club, author }}
  <ArticleCard
    {title}
    href="#"
    img={Number(id) % 5
      ? { src: `https://picsum.photos/seed/${id}/960/400`, alt: '', width: 960, height: 400 }
      : undefined}
  >
    <p>
      Par <a href="/club/{club.id}" sveltekit:prefetch>{club.name}</a> le {formatDateTime(
        publishedAt
      )}
    </p>
    {@html bodyHtml}
    {#if author}
      <p>
        <em>
          Auteur : <a href="/user/{author.id}" sveltekit:prefetch>
            {author.firstname}
            {author.lastname}
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
