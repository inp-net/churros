<script lang="ts">
  import type { PageData } from './$types';
  import LogsTable from '$lib/components/LogsTable.svelte';

  export let data: PageData;

  const { logs } = data;
</script>

<div class="content">
  <header>
    <h1>Logs</h1>
    <p class="typo-details">GLHF.</p>
  </header>

  <LogsTable logs={logs.edges.map((e) => e.node)} />
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
