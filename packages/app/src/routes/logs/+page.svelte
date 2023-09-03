<script lang="ts">
  import type { PageData } from './$types';
  import LogsTable from '$lib/components/LogsTable.svelte';
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import { zeus } from '$lib/zeus';
  import { _pageQuery } from './+page';

  let loadingMore = false;

  async function loadMore() {
    if (loadingMore) return;
    try {
      loadingMore = true;
      const result = await $zeus.query({
        logs: [
          {
            after: data.logs.pageInfo.endCursor,
          },
          _pageQuery,
        ],
      });
      logs.pageInfo = result.logs.pageInfo;
      logs.edges = [...logs.edges, ...result.logs.edges];
    } finally {
      loadingMore = false;
    }
  }
  export let data: PageData;

  const { logs } = data;
</script>

<div class="content">
  <header>
    <h1>Logs</h1>
    <p class="typo-details">GLHF.</p>
  </header>

  <LogsTable logs={logs.edges.map((e) => e.node)} />

  {#if logs.pageInfo.hasNextPage}
    <section class="load-more">
      <ButtonSecondary on:click={loadMore} loading={loadingMore}>Charger plus</ButtonSecondary>
    </section>
  {/if}
</div>

<style>
  .content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  header {
    text-align: center;
  }
</style>
