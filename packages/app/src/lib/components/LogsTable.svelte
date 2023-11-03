<script lang="ts">
  import { formatDateTime } from '$lib/dates';
  // @ts-expect-error Untyped lib
  import JSONTree from 'svelte-json-tree';

  let openedLogId = '';

  interface logEntry {
    id: string;
    happenedAt: Date;
    area: string;
    action: string;
    target?: string;
    message: string;
    user?: {
      uid: string;
      fullName: string;
    };
  }

  export let logs: logEntry[] = [];
</script>

<div class="table-scroller">
  <table class="compact">
    <thead>
      <tr>
        <th>Date</th>
        <th>Zone</th>
        <th>Action</th>
        <th>Cible</th>
        <th>Utilisateur</th>
      </tr>
    </thead>
    <tbody>
      {#each logs as log (log.id)}
        <tr
          on:click={() => {
            openedLogId = openedLogId === log.id ? '' : log.id;
          }}
        >
          <td>{formatDateTime(log.happenedAt)}</td>
          <td>{log.area}</td>
          <td>{log.action}</td>
          <td class="code">{log.target}</td>
          <td><a href="/users/{log.user?.uid}">{log.user?.fullName}</a></td>
        </tr>
        {#if openedLogId === log.id}
          <tr class="details"
            ><td colspan="5" class:json={log.message.startsWith('{')}>
              {#if log.message.startsWith('{')}
                <JSONTree --json-tree-font-size="1em" value={JSON.parse(log.message)}></JSONTree>
              {:else}
                {log.message}
              {/if}
            </td></tr
          >
        {/if}
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-scroller {
    overflow-x: auto;
  }

  table {
    --spacing: 1.5rem;

    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    overflow-y: scroll;
    border-spacing: calc(max(0.5rem, var(--spacing) / 2));
    border-collapse: separate;
  }

  table.compact {
    --spacing: 0.5rem;

    border-spacing: var(--border-block);
  }

  /* .sort-icon {
    display: inline-block;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
  } */

  table,
  th,
  td {
    border-color: var(--bg);
  }

  td,
  th {
    padding: calc(max(0.5rem, var(--spacing) / 2));
    text-align: left;
  }

  td {
    background: var(--muted-bg);
  }

  .details td {
    overflow-wrap: anywhere;
  }

  table:not(.compact) td {
    border-radius: var(--radius-inline);
  }

  td[colspan]:not(.json) {
    text-align: center;
  }

  .json :global(*) {
    font-family: 'Courier New', Courier, monospace;
  }

  td.code {
    font-family: var(--font-mono);
  }

  /* td.actions {
    padding: 0.25rem 1rem;
    background: transparent;
  } */
</style>
