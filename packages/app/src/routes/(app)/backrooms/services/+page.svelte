<script lang="ts">
  import CardService from '$lib/components/CardService.svelte';
  import type { PageData } from './$houdini';

  export let data: PageData;

  $: ({ ServicesManagerPage } = data);
</script>

<div class="content">
  <h1>Gérer les services</h1>

  <ul class="nobullet">
    {#each $ServicesManagerPage.data?.services ?? [] as service (service.id)}
      <li>
        <CardService {service} />
      </li>
    {/each}
    <li class="new">
      <CardService service={undefined} href="/services/create" dashedBorder>
        <svelte:fragment slot="name">Ajouter un service</svelte:fragment>
      </CardService>
    </li>
  </ul>
</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
  }

  h1 {
    margin-bottom: 2rem;
    text-align: center;
  }

  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
</style>
