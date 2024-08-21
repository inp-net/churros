<script lang="ts">
  import ButtonSecondary from '$lib/components/ButtonSecondary.svelte';
  import LogsTable from '$lib/components/LogsTable.svelte';
  import MaybeError from '$lib/components/MaybeError.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;
  $: ({ PageLogs } = data);
</script>

<MaybeError result={$PageLogs} let:data={{ logs }}>
  <div class="content">
    <header>
      <h1>Logs</h1>
      <p class="typo-details">GLHF.</p>
    </header>

    <LogsTable logs={logs.edges.map((e) => e.node)} />

    {#if $PageLogs.pageInfo.hasNextPage}
      <section class="load-more">
        <ButtonSecondary
          on:click={async () => {
            PageLogs.loadNextPage();
          }}>Charger plus</ButtonSecondary
        >
      </section>
    {/if}
  </div>
</MaybeError>

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
