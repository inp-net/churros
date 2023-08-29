<script lang="ts">
  import type { PageData } from './$types';
  import LogsTable from '$lib/components/LogsTable.svelte';

  export let data: PageData;

  const { logs } = data;
</script>

<LogsTable logs={logs.edges.map((e) => e.node)} />
