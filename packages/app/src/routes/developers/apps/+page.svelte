<script lang="ts">
  import Badge from '$lib/components/Badge.svelte';
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  const { apps } = data;
</script>

<main>
  <h1>Mes applications</h1>

  <ul class="apps">
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
  </ul>
  <section class="create">
    <ButtonPrimary href="./create">Créer une application</ButtonPrimary>
  </section>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    margin: 2rem auto;
    gap: 2rem;
    max-width: 800px;
  }

  .apps {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 0;
  }

  .apps li a {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-block);
    background: var(--muted-bg);
    justify-content: space-between;
  }

  .apps li a:hover,
  .apps li a:focus-visible {
    background: var(--hover-bg);
    color: var(--hover-text);
  }

  .apps li .name {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .apps li img {
    height: 2.5em;
    object-fit: contain;
  }

  section.create {
    display: flex;
    justify-content: center;
  }
</style>
