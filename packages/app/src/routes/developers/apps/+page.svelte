<script lang="ts">
  import ButtonPrimary from '$lib/components/ButtonPrimary.svelte';
  import { me } from '$lib/session';
  import type { PageData } from './$types';
  import AppsList from './AppsList.svelte';

  export let data: PageData;

  const { apps, otherApps } = data;
</script>

<main>
  <h1>Mes applications</h1>

  <ul class="apps">
    <AppsList {apps} />
  </ul>
  <section class="create">
    <ButtonPrimary href="./create">Créer une application</ButtonPrimary>
  </section>

  {#if $me?.admin}
    <hr />
    <h2>Autres applications</h2>
    <ul class="apps">
      <AppsList apps={otherApps}></AppsList>
    </ul>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    max-width: 800px;
    margin: 2rem auto;
  }

  .apps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-left: 0;
    list-style: none;
  }

  section.create {
    display: flex;
    justify-content: center;
  }
</style>
