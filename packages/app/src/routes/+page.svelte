<script lang="ts">
  import Button from '$lib/components/buttons/Button.svelte';
  import ArticleCard from '$lib/components/cards/ArticleCard.svelte';
  import { zeus } from '$lib/zeus';
  import type { PageData } from './$types';
  import { pageQuery } from './+page';
  import { PUBLIC_STORAGE_URL } from '$env/static/public';
  import * as htmlToText from 'html-to-text';

  export let data: PageData;

  let loading = false;
  const loadMore = async () => {
    if (loading) return;
    try {
      loading = true;
      const { homepage } = await $zeus.query({
        homepage: [{ after: data.homepage.pageInfo.endCursor }, pageQuery],
      });
      data.homepage.pageInfo = homepage.pageInfo;
      data.homepage.edges = [...data.homepage.edges, ...homepage.edges];
    } finally {
      loading = false;
    }
  };
</script>

<h1>Mon feed</h1>

{#each data.homepage.edges as { cursor, node: { uid, title, bodyHtml, publishedAt, group, author, pictureFile, links, body } }}
  <ArticleCard
    {title}
    {publishedAt}
    {links}
    {group}
    {author}
    href="/club/{group.uid}/post/{uid}/"
    img={pictureFile ? { src: `${PUBLIC_STORAGE_URL}${pictureFile}` } : undefined}
  >
    {@html htmlToText.convert(bodyHtml).replaceAll('\n', '<br>')}
  </ArticleCard>
{/each}

{#if data.homepage.pageInfo.hasNextPage}
  <p class="text-center"><Button on:click={loadMore} {loading}>Voir plus</Button></p>
{/if}

<style>
  h1 {
    text-align: center;
  }
</style>
