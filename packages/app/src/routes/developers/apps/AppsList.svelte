<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';

  export let apps: Array<{
    name: string;
    faviconUrl: string;
    id: string;
    clientId: string;
    active: boolean;
  }>;
</script>

{#each apps as { name, faviconUrl, id, clientId, active } (id)}
  <li>
    <a href={`./${clientId}`}>
      <span class="name">
        <img src={faviconUrl} alt="" />
        {name}</span
      >
      <Badge
        title={active ? '' : "L'application est en attente de validation"}
        theme={active ? 'success' : 'warning'}>{active ? 'Active' : 'Inactive'}</Badge
      >
    </a>
  </li>
{:else}
  <li class="muted">Aucune application pour le moment.</li>
{/each}

<style>
  li a {
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: var(--muted-bg);
    border-radius: var(--radius-block);
  }

  li a:hover,
  li a:focus-visible {
    color: var(--hover-text);
    background: var(--hover-bg);
  }

  .name {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  img {
    height: 2.5em;
    object-fit: contain;
  }
</style>
